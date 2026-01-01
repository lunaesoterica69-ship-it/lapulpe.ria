import { useState, useRef } from 'react';
import { api, BACKEND_URL } from '../config/api';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';


const ImageUpload = ({ 
  value, 
  onChange, 
  label = "Imagen",
  placeholder = "Seleccionar imagen",
  aspectRatio = "square", // square, banner, product
  maxSize = 5 // MB
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const fileInputRef = useRef(null);

  const aspectClasses = {
    square: "aspect-square",
    banner: "aspect-[3/1]",
    product: "aspect-[4/3]"
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Imagen demasiado grande. Máximo ${maxSize}MB`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/api/upload-image`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      const imageUrl = response.data.image_url;
      setPreview(imageUrl);
      onChange(imageUrl);
      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-white">{label}</label>}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative group">
          <div className={`${aspectClasses[aspectRatio]} w-full rounded-xl overflow-hidden bg-stone-700 border border-stone-600`}>
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 px-3 py-1.5 bg-stone-800/80 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-700"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`${aspectClasses[aspectRatio]} w-full rounded-xl border-2 border-dashed border-stone-600 bg-stone-800/50 hover:bg-stone-700/50 hover:border-red-500/50 transition-all flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-red-400" />
              <span className="text-sm">Subiendo...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-stone-700 flex items-center justify-center">
                <ImageIcon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">{placeholder}</span>
              <span className="text-xs text-stone-500">PNG, JPG, GIF hasta {maxSize}MB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
