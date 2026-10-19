import { createClient } from '@supabase/supabase-js'

let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yucrijohsscyfnarhkml.supabase.co'

// Clean and auto-correct common typo (.supabase.com -> .supabase.co)
rawUrl = rawUrl.trim().replace(/\/$/, '')
if (rawUrl.includes('.supabase.com')) {
  rawUrl = rawUrl.replace('.supabase.com', '.supabase.co')
}

export const supabaseUrl = rawUrl
export const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_b6dCq5MgaIrOaXxjz_i_zA_6GzkiQxC').trim()

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Verifies if an email belongs to an active administrator in Supabase admins table
 */
export async function verifyAdminInSupabase(email) {
  if (!email) return false
  const cleanEmail = email.trim().toLowerCase()
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id, email, is_active, role')
      .ilike('email', cleanEmail)
      .limit(1)

    if (!error && data && data.length > 0) {
      const admin = data[0]
      // is_active can be 1 or true
      return admin.is_active === 1 || admin.is_active === true
    }

    return false
  } catch (err) {
    console.error('Error verifying admin in Supabase:', err)
    return false
  }
}

/**
 * Upload an image file directly to Supabase storage 'media' bucket
 */
export async function uploadImageToMediaBucket(file, customPrefix = 'product') {
  if (!file) throw new Error('No file provided for upload')

  const fileExt = file.name ? file.name.split('.').pop() : 'jpg'
  const sanitizedName = (file.name || 'image')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
  const fileName = `${customPrefix}-${Date.now()}-${sanitizedName}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg'
    })

  if (error) {
    throw error
  }

  const { data: pubData } = supabase.storage
    .from('media')
    .getPublicUrl(data?.path || fileName)

  return {
    path: data?.path || fileName,
    publicUrl: pubData.publicUrl
  }
}

/**
 * List all files stored in the 'media' bucket
 */
export async function getMediaBucketFiles() {
  try {
    const { data, error } = await supabase.storage.from('media').list('', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' }
    })

    if (error || !data) return []

    return data
      .filter((item) => !item.name.startsWith('.'))
      .map((item) => {
        const { data: pubData } = supabase.storage.from('media').getPublicUrl(item.name)
        return {
          id: item.id || item.name,
          name: item.name,
          url: pubData.publicUrl,
          created_at: item.created_at,
          size: item.metadata?.size
        }
      })
  } catch (err) {
    console.error('Error listing media bucket:', err)
    return []
  }
}
