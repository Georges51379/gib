-- Update site-assets bucket to allow video uploads
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime'
]
WHERE id = 'site-assets';