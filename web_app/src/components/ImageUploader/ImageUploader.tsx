import React, { useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';
import './ImageUploader.css';

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImagesChange, maxImages = 4 }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const remainingSlots = maxImages - images.length;
      const filesToAdd = newFiles.slice(0, remainingSlots);
      onImagesChange([...images, ...filesToAdd]);
    }
    // reset to allow selecting the same file again
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  return (
    <div className="image-uploader">
      <div className="uploader-header">
        <label>Activity Photos</label>
        <span className="image-count">{images.length} / {maxImages}</span>
      </div>
      
      <div className="image-grid">
        {images.map((img, index) => (
          <div key={index} className="image-preview-container animate-fade-in">
            <img src={URL.createObjectURL(img)} alt={`preview ${index}`} className="image-preview" />
            <button 
              type="button" 
              className="remove-btn" 
              onClick={() => removeImage(index)}
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <div 
             className="upload-box" 
             onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={32} className="upload-icon" />
            <span>Add Photo</span>
          </div>
        )}
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        multiple
        className="hidden-input"
      />
    </div>
  );
};

export default ImageUploader;
