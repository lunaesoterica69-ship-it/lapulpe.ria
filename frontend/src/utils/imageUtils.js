// Utilidades para compresión y manejo de imágenes
export const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a new file from the blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Error comprimiendo imagen'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Error cargando imagen'));
    };
    
    reader.onerror = () => reject(new Error('Error leyendo archivo'));
  });
};

// Convert file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Process image: compress if too large, then convert to base64
export const processImageForUpload = async (file, maxSizeKB = 500) => {
  const fileSizeKB = file.size / 1024;
  
  // If file is already small enough, just convert to base64
  if (fileSizeKB <= maxSizeKB) {
    return await fileToBase64(file);
  }
  
  // Calculate quality based on file size
  let quality = 0.8;
  if (fileSizeKB > 2000) quality = 0.5;
  else if (fileSizeKB > 1000) quality = 0.6;
  else if (fileSizeKB > 500) quality = 0.7;
  
  // Compress and convert
  const compressed = await compressImage(file, 1200, quality);
  return await fileToBase64(compressed);
};

// Get image dimensions
export const getImageDimensions = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.src = URL.createObjectURL(file);
  });
};
