'use server'

import { createClient } from '@/lib/supabase/server'

export async function fetchItems(tableName: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from(tableName)
    .select('*')

  if (error) {
    console.error('Error fetching items:', error)
    return { error: error.message }
  }

  return { data }
}

export async function insertItem(tableName: string, item: Record<string, any>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from(tableName)
    .insert(item)
    .select()
    .single()

  if (error) {
    console.error('Error inserting item:', error)
    return { error: error.message }
  }

  return { data }
}

export async function updateItem(
  tableName: string,
  id: string,
  updates: Record<string, any>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from(tableName)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating item:', error)
    return { error: error.message }
  }

  return { data }
}

export async function deleteItem(tableName: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting item:', error)
    return { error: error.message }
  }

  return { success: true }
}
