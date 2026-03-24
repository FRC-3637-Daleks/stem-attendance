import { supabase } from './supabaseClient'

// ─── Check-ins ───

export async function addCheckin(category) {
  const { data, error } = await supabase
    .from('checkins')
    .insert({ category })
    .select()
    .single()
  if (error) console.error('addCheckin error:', error)
  return data
}

// ─── Ratings ───

export async function addRating(rating) {
  const { data, error } = await supabase
    .from('ratings')
    .insert({ rating })
    .select()
    .single()
  if (error) console.error('addRating error:', error)
  return data
}

// ─── Logs ───

export async function addLog(action, detail) {
  const { error } = await supabase
    .from('logs')
    .insert({ action, detail })
  if (error) console.error('addLog error:', error)
}

// ─── Stats (for dashboard) ───

export async function getCheckinCounts() {
  const { data, error } = await supabase
    .from('checkins')
    .select('category')
  if (error) { console.error(error); return {} }
  const counts = {}
  data.forEach(row => {
    counts[row.category] = (counts[row.category] || 0) + 1
  })
  return counts
}

export async function getRatingStats() {
  const { data, error } = await supabase
    .from('ratings')
    .select('rating')
  if (error) { console.error(error); return { total: 0, avg: '—' } }
  const total = data.length
  const avg = total > 0
    ? (data.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
    : '—'
  return { total, avg }
}

export async function getRecentLogs(limit = 30) {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) { console.error(error); return [] }
  return data
}

// ─── Settings (single-row table) ───

export async function getSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .single()
  if (error) {
    console.error('getSettings error:', error)
    return { checkin_cooldown: 5000, rating_cooldown: 2000 }
  }
  return data
}

export async function updateSettings(checkin_cooldown, rating_cooldown) {
  // Upsert the single settings row (id = 1)
  const { error } = await supabase
    .from('settings')
    .upsert({ id: 1, checkin_cooldown, rating_cooldown })
  if (error) console.error('updateSettings error:', error)
}

// ─── Real-time subscriptions ───

export function subscribeToCheckins(callback) {
  return supabase
    .channel('checkins-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'checkins' }, callback)
    .subscribe()
}

export function subscribeToRatings(callback) {
  return supabase
    .channel('ratings-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ratings' }, callback)
    .subscribe()
}

// ─── Admin: Remove / Reset ───

export async function removeCheckins(category, count) {
  // Get the IDs of the most recent N checkins for this category
  const { data, error } = await supabase
    .from('checkins')
    .select('id')
    .eq('category', category)
    .order('created_at', { ascending: false })
    .limit(count)
  if (error) { console.error(error); return 0 }
  if (!data.length) return 0

  const ids = data.map(r => r.id)
  const { error: delError } = await supabase
    .from('checkins')
    .delete()
    .in('id', ids)
  if (delError) { console.error(delError); return 0 }

  await addLog('removed', `${count} × ${category}`)
  return ids.length
}

export async function resetAllData() {
  // Log the reset first
  await addLog('reset', 'All data cleared')

  // Delete all checkins and ratings (logs are preserved)
  const { error: e1 } = await supabase.from('checkins').delete().neq('id', 0)
  const { error: e2 } = await supabase.from('ratings').delete().neq('id', 0)
  if (e1) console.error('reset checkins error:', e1)
  if (e2) console.error('reset ratings error:', e2)
}
