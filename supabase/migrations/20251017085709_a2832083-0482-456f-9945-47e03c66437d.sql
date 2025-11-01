-- Clean up empty video_url strings and set to NULL
UPDATE hero_section 
SET video_url = NULL 
WHERE video_url = '' OR video_url IS NULL OR TRIM(video_url) = '';