import { supabase } from './supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export async function uploadToBucket(file, bucketType) {
  const bucketNames = {
    documents: 'documents',
    signatures: 'signatures',
    signed: 'signed-documents'
  }

  const bucket = bucketNames[bucketType]
  if (!bucket) throw new Error('Invalid bucket type')

  const fileExt = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return publicUrl
}