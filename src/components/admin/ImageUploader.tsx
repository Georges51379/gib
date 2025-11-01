import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  bucket: 'site-assets' | 'project-images' | 'about-images';
  onUploadComplete: (url: string | null) => void;
  currentImage?: string;
  maxSize?: number;
  accept?: Record<string, string[]>;
}

export const ImageUploader = ({
  bucket,
  onUploadComplete,
  currentImage,
  maxSize = 5 * 1024 * 1024,
  accept = {
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/webp': ['.webp'],
  },
}: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(
    currentImage && currentImage.trim() !== '' ? currentImage : undefined
  );

  // Sync preview with currentImage prop changes
  useEffect(() => {
    if (currentImage && currentImage.trim() !== '') {
      setPreview(currentImage);
    } else {
      setPreview(undefined);
    }
  }, [currentImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxSize,
    multiple: false,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file size
      if (file.size > maxSize) {
        toast.error(`File too large. Max size: ${maxSize / 1024 / 1024}MB`);
        return;
      }

      setUploading(true);
      
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        if (!uploadData?.path) {
          throw new Error('Upload succeeded but no file path returned');
        }

        // Verify the file exists by checking its metadata
        const { data: fileData, error: fileError } = await supabase.storage
          .from(bucket)
          .list('', {
            search: fileName
          });

        if (fileError || !fileData || fileData.length === 0) {
          throw new Error('Upload succeeded but file verification failed');
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        if (!publicUrl || publicUrl.trim() === '') {
          throw new Error('Upload succeeded but no URL returned');
        }

        setPreview(publicUrl);
        onUploadComplete(publicUrl);
        toast.success('File uploaded successfully');
      } catch (error: any) {
        console.error('Upload error:', error);
        toast.error(error.message || 'Upload failed');
        setPreview(currentImage && currentImage.trim() !== '' ? currentImage : undefined);
        onUploadComplete(currentImage || null);
      } finally {
        setUploading(false);
      }
    },
  });

  const handleRemove = () => {
    setPreview(undefined);
    onUploadComplete(null);
  };

  // Determine if preview is a video based on accept prop or file extension
  const isVideo = preview && (
    preview.match(/\.(mp4|webm|ogg|mov)$/i) ||
    (accept && Object.keys(accept).some(type => type.startsWith('video/')))
  );

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          {isVideo ? (
            <video
              src={preview}
              className="w-full h-64 object-cover rounded-lg border border-border"
              controls
              muted
            />
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg border border-border"
            />
          )}
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          ) : (
            <>
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? 'Drop the image here'
                  : 'Drag & drop an image, or click to select'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Max size: {maxSize / 1024 / 1024}MB
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
