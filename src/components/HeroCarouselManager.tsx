import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, Image as ImageIcon } from 'lucide-react';

interface CarouselImage {
  id: string;
  image_url: string;
  video_url: string | null;
  title: string | null;
  subtitle: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const HeroCarouselManager: React.FC = () => {
  const { user } = useAuth();
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingImage, setEditingImage] = useState<CarouselImage | null>(null);
  
  // Form state - simplified
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadCarouselImages();
  }, []);

  const loadCarouselImages = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_carousel_images')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCarouselImages(data as CarouselImage[]);
    } catch (error) {
      console.error('Error loading carousel images:', error);
      toast.error('Failed to load carousel images');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setImageUrl('');
    setDisplayOrder(1);
    setIsActive(true);
    setEditingImage(null);
    setUploading(false);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `hero-section/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleAddCarouselImage = async () => {
    if (!imageUrl) {
      toast.error('Please provide an image URL');
      return;
    }

    if (carouselImages.length >= 4) {
      toast.error('Maximum 4 carousel images allowed');
      return;
    }

    // Check if order is already taken
    const existingOrder = carouselImages.find(img => img.display_order === displayOrder);
    if (existingOrder) {
      toast.error(`Position ${displayOrder} is already taken`);
      return;
    }

    try {
      const { error } = await supabase
        .from('hero_carousel_images')
        .insert({
          image_url: imageUrl,
          video_url: null, // No video support
          title: 'Relieve Pain. Recover Faster. Rise Stronger.', // Same text for all
          subtitle: 'Scientifically designed pain relief and recovery solutions to keep you moving — before, during, and after every workout.', // Same text for all
          display_order: displayOrder,
          is_active: isActive,
        });

      if (error) throw error;

      toast.success('Carousel image added successfully');
      setShowAddDialog(false);
      resetForm();
      loadCarouselImages();
    } catch (error) {
      console.error('Error adding carousel image:', error);
      toast.error('Failed to add carousel image');
    }
  };

  const handleUpdateCarouselImage = async () => {
    if (!editingImage) return;

    try {
      const { error } = await supabase
        .from('hero_carousel_images')
        .update({
          image_url: imageUrl,
          video_url: null, // No video support
          title: 'Relieve Pain. Recover Faster. Rise Stronger.', // Same text for all
          subtitle: 'Scientifically designed pain relief and recovery solutions to keep you moving — before, during, and after every workout.', // Same text for all
          display_order: displayOrder,
          is_active: isActive,
        })
        .eq('id', editingImage.id);

      if (error) throw error;

      toast.success('Carousel image updated successfully');
      setEditingImage(null);
      resetForm();
      loadCarouselImages();
    } catch (error) {
      console.error('Error updating carousel image:', error);
      toast.error('Failed to update carousel image');
    }
  };

  const handleDeleteCarouselImage = async (id: string) => {
    if (!confirm('Are you sure you want to remove this carousel image?')) return;

    try {
      const { error } = await supabase
        .from('hero_carousel_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Carousel image removed successfully');
      loadCarouselImages();
    } catch (error) {
      console.error('Error deleting carousel image:', error);
      toast.error('Failed to remove carousel image');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('hero_carousel_images')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Carousel image ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadCarouselImages();
    } catch (error) {
      console.error('Error toggling carousel image status:', error);
      toast.error('Failed to update carousel image status');
    }
  };

  const openEditDialog = (image: CarouselImage) => {
    setEditingImage(image);
    setImageUrl(image.image_url);
    setDisplayOrder(image.display_order);
    setIsActive(image.is_active);
  };

  // Get available order positions (1-4, excluding taken ones)
  const getAvailableOrderPositions = () => {
    const takenPositions = carouselImages.map(img => img.display_order);
    return Array.from({ length: 4 }, (_, i) => i + 1)
      .filter(pos => !takenPositions.includes(pos) || (editingImage && editingImage.display_order === pos));
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Hero</h2>
          <p className="text-muted-foreground">
            Manage up to 4 background images for the hero section carousel
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setShowAddDialog(true);
              }}
              disabled={carouselImages.length >= 4}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Carousel Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Carousel Image</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Image URL *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload to Supabase Storage: product-images/hero-section/
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Display Order (1-4)</Label>
                  <select 
                    value={displayOrder} 
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
                    className="w-full p-2 border rounded-md"
                  >
                    {getAvailableOrderPositions().map((pos) => (
                      <option key={pos} value={pos}>
                        Position {pos}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="is-active">Active</Label>
                </div>

                {/* Image Preview */}
                {imageUrl && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="border rounded-lg p-2 bg-gray-50">
                      <img 
                        src={imageUrl} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCarouselImage}>
                  Add Carousel Image
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Carousel Images List */}
      <div className="grid gap-4">
        {carouselImages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No carousel images yet. Add your first carousel image!</p>
            </CardContent>
          </Card>
        ) : (
          carouselImages.map((image) => (
            <Card key={image.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="text-lg font-bold">
                      #{image.display_order}
                    </Badge>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={image.is_active ? "default" : "secondary"}>
                          {image.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <p className="font-semibold mt-1">Relieve Pain. Recover Faster. Rise Stronger.</p>
                      <p className="text-sm text-muted-foreground mt-1">Scientifically designed pain relief and recovery solutions to keep you moving — before, during, and after every workout.</p>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {image.image_url}
                      </p>
                    </div>

                    {/* Image Preview */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden border">
                      <img 
                        src={image.image_url} 
                        alt={`Carousel ${image.display_order}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(image.id, image.is_active)}
                      title={image.is_active ? "Deactivate" : "Activate"}
                    >
                      {image.is_active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(image)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCarouselImage(image.id)}
                      className="text-destructive hover:text-destructive"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Carousel Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Image URL *</Label>
                <div className="flex gap-2">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                    id="image-upload-edit"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload-edit')?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Display Order (1-4)</Label>
                <select 
                  value={displayOrder} 
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md"
                >
                  {getAvailableOrderPositions().map((pos) => (
                    <option key={pos} value={pos}>
                      Position {pos}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is-active-edit"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="is-active-edit">Active</Label>
              </div>

              {/* Image Preview */}
              {imageUrl && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="border rounded-lg p-2 bg-gray-50">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setEditingImage(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCarouselImage}>
                Update Carousel Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
