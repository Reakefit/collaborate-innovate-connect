
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  label?: string;
  value?: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelected,
  accept = "image/*",
  label = "Upload a file",
  value,
  className = ""
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelected(file);
      
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };
  
  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    // Inform parent component
    onFileSelected(null as unknown as File);
  };
  
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="file-upload">{label}</Label>
      
      {preview ? (
        <div className="relative">
          {preview.startsWith('data:image/') && (
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-48 rounded-md object-contain" 
            />
          )}
          
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
              {selectedFile?.name || value}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearSelection}
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid w-full items-center gap-2">
          <label 
            htmlFor="file-upload" 
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
            </div>
            <Input 
              id="file-upload" 
              type="file" 
              accept={accept} 
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
