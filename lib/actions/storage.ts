'use server'

import { createClient } from '@/lib/supabase/server'

// Example: Upload a file
export async function uploadFile(
  bucketName: string,
  filePath: string,
  file: File
) {
  const supabase = await createClient()
  
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    console.error('Error uploading file:', error)
    return { error: error.message }
  }

  return { data }
}

// Example: Get public URL for a file
export async function getPublicUrl(bucketName: string, filePath: string) {
  const supabase = await createClient()
  
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath)

  return data.publicUrl
}

// Example: Download a file
export async function downloadFile(bucketName: string, filePath: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(filePath)

  if (error) {
    console.error('Error downloading file:', error)
    return { error: error.message }
  }

  return { data }
}

// Example: Delete a file
export async function deleteFile(bucketName: string, filePath: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath])

  if (error) {
    console.error('Error deleting file:', error)
    return { error: error.message }
  }

  return { success: true }
}

// Example: List files in a bucket
export async function listFiles(bucketName: string, folder: string = '') {
  const supabase = await createClient()
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(folder)

  if (error) {
    console.error('Error listing files:', error)
    return { error: error.message }
  }

  return { data }
}
