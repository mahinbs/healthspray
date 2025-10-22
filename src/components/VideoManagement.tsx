import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  Video, 
  Play, 
  Trash2, 
  X, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  FileVideo,
  Image as ImageIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminProduct } from "@/services/products";

interface VideoManagementProps {
  products: AdminProduct[];
  onVideoUploaded: () => void;
}

const VideoManagement: React.FC<VideoManagementProps> = ({ products, onVideoUploaded }) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Filter products that don't have videos yet
  const productsWithoutVideos = products.filter(product => !product.has_video);
  const productsWithVideos = products.filter(product => product.has_video);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'thumbnail') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (type === 'video') {
      // Validate video file
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
      const maxSize = 50 * 1024 * 1024; // 50MB

      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid video file type. Allowed: MP4, WebM, OGG, AVI, MOV');
        return;
      }

      if (file.size > maxSize) {
        toast.error('Video file too large. Maximum size: 50MB');
        return;
      }

      setVideoFile(file);
    } else {
      // Validate thumbnail file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid thumbnail file type. Allowed: JPEG, PNG, WebP');
        return;
      }

      if (file.size > maxSize) {
        toast.error('Thumbnail file too large. Maximum size: 5MB');
        return;
      }

      setThumbnailFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedProduct || !videoFile) {
      toast.error('Please select a product and video file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData for the upload
      const formData = new FormData();
      formData.append('productId', selectedProduct.id);
      formData.append('videoFile', videoFile);
      
      if (thumbnailFile) {
        formData.append('thumbnailFile', thumbnailFile);
      }

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Upload video using Edge Function (use functions subdomain to avoid CORS issues)
      // Derive base URL from the configured project URL env (safe access)
      const projectUrl = (supabase as any).url || (supabase as any).supabaseUrl || '';
      const functionsBase = projectUrl.replace('.supabase.co', '.functions.supabase.co');
      const response = await fetch(`${functionsBase}/upload-product-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      if (result.success) {
        toast.success('Video uploaded successfully!');
        setIsUploadDialogOpen(false);
        setSelectedProduct(null);
        setVideoFile(null);
        setThumbnailFile(null);
        setUploadProgress(0);
        
        // Reset file inputs
        if (videoInputRef.current) videoInputRef.current.value = '';
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
        
        // Refresh products
        onVideoUploaded();
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveVideo = async (product: AdminProduct) => {
    if (!confirm(`Are you sure you want to remove the video for "${product.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({
          video_url: null,
          video_thumbnail: null,
          has_video: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id);

      if (error) {
        throw error;
      }

      toast.success('Video removed successfully!');
      onVideoUploaded();
    } catch (error) {
      console.error('Error removing video:', error);
      toast.error('Failed to remove video');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Video Management</h2>
          <p className="text-muted-foreground">
            Upload and manage product videos for the Shop by Video section
          </p>
        </div>
        {/* Removed general upload button - each product has its own upload button */}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Video className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">With Videos</p>
                <p className="text-2xl font-bold">{productsWithVideos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Without Videos</p>
                <p className="text-2xl font-bold">{productsWithoutVideos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products with Videos */}
      {productsWithVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Products with Videos ({productsWithVideos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productsWithVideos.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{product.name}</h3>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Video className="h-3 w-3 mr-1" />
                      Has Video
                    </Badge>
                  </div>
                  
                  {product.video_thumbnail && (
                    <div className="mb-3">
                      <img 
                        src={product.video_thumbnail} 
                        alt={`${product.name} thumbnail`}
                        className="w-full h-24 object-cover rounded"
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {product.video_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(product.video_url, '_blank')}
                        className="flex-1"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        View Video
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveVideo(product)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products without Videos */}
      {productsWithoutVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Products without Videos ({productsWithoutVideos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productsWithoutVideos.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{product.name}</h3>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      No Video
                    </Badge>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsUploadDialogOpen(true);
                    }}
                    className="w-full"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Add Video
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? `Upload Video for "${selectedProduct.name}"` : 'Upload Product Video'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Product Info */}
            {selectedProduct && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold">{selectedProduct.name}</h3>
                <p className="text-sm text-gray-600">{selectedProduct.category}</p>
              </div>
            )}

            {/* Video File Upload */}
            <div>
              <Label htmlFor="video-upload">Video File (Required)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileSelect(e, 'video')}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <FileVideo className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {videoFile ? videoFile.name : 'Click to upload video'}
                  </p>
                  {videoFile && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(videoFile.size)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    MP4, WebM, OGG, AVI, MOV up to 50MB
                  </p>
                </label>
              </div>
            </div>

            {/* Thumbnail File Upload */}
            <div>
              <Label htmlFor="thumbnail-upload">Thumbnail Image (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'thumbnail')}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label htmlFor="thumbnail-upload" className="cursor-pointer">
                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {thumbnailFile ? thumbnailFile.name : 'Click to upload thumbnail'}
                  </p>
                  {thumbnailFile && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(thumbnailFile.size)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, PNG, WebP up to 5MB
                  </p>
                </label>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Uploading video...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedProduct || !videoFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Video
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoManagement;
