import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Image, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScreenshotUploadProps {
  onUpload: (screenshot: string) => void;
}

const ScreenshotUpload = ({ onUpload }: ScreenshotUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset error
    setError(null);
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB.');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleSubmit = () => {
    if (preview) {
      onUpload(preview);
    }
  };
  
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {!preview ? (
        <div 
          className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={handleUploadClick}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="bg-primary bg-opacity-10 p-3 rounded-full">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Upload Screenshot</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Click to upload a screenshot of your match result screen
            </p>
            <p className="text-xs text-gray-500 mt-2">
              PNG, JPG or JPEG (max. 5MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <img 
              src={preview} 
              alt="Screenshot Preview" 
              className="w-full h-auto object-contain"
            />
          </div>
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleUploadClick}
              className="border-gray-700"
            >
              <Image className="h-4 w-4 mr-2" />
              Change Image
            </Button>
            <Button 
              className="bg-gradient-to-r from-primary to-secondary"
              onClick={handleSubmit}
            >
              Submit Result
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenshotUpload;
