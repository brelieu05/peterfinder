'use server'

import { createClient } from '@/lib/supabase/server'

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

export async function getPublicUrl(bucketName: string, filePath: string) {
  const supabase = await createClient()
  
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath)

  return data.publicUrl
}

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
