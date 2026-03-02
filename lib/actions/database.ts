'use server'

import { createClient } from '@/lib/supabase/server'

type FetchItemsOptions = {
  islost?: boolean
  search?: string
  email?: string
  includeResolved?: boolean
}

export async function fetchItems(tableName: string, options?: FetchItemsOptions) {
  const supabase = await createClient()
  let query = supabase
    .from(tableName)
    .select('*')
    .eq('is_deleted', false)

  if (!options?.includeResolved) {
    query = query.eq('isresolved', false)
  }

  if (options?.islost !== undefined) {
    query = query.eq('islost', options.islost)
  }

  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`)
  }

  if (options?.email) {
    query = query.eq('email', options.email)
  }

  const { data, error } = await query

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
