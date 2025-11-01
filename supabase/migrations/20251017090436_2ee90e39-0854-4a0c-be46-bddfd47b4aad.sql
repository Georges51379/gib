-- Increase file size limit for site-assets bucket to support video uploads
UPDATE storage.buckets 
SET file_size_limit = 52428800  -- 50MB in bytes
WHERE id = 'site-assets';