import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface FeaturedProduct {
  id: string;
  product_id: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image: string[];
    category: string;
  };
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string[];
  category: string;
  is_active: boolean;
}

export const FeaturedProductsManager: React.FC = () => {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FeaturedProduct | null>(null);
  
  // Simple form state - just product and position
  const [selectedProductId, setSelectedProductId] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);

  useEffect(() => {
    loadFeaturedProducts();
    loadProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('featured_products')
        .select(`
          *,
          product:products(id, name, price, image, category)
        `)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setFeaturedProducts(data as FeaturedProduct[]);
    } catch (error) {
      console.error('Error loading featured products:', error);
      toast.error('Failed to load featured products');
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image, category, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data as Product[]);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProductId('');
    setOrderIndex(1);
    setEditingProduct(null);
  };

  const handleAddFeaturedProduct = async () => {
    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }

    if (featuredProducts.length >= 5) {
      toast.error('Maximum 5 featured products allowed');
      return;
    }

    // Check if order index is already taken
    const existingOrder = featuredProducts.find(fp => fp.order_index === orderIndex);
    if (existingOrder) {
      toast.error(`Position ${orderIndex} is already taken`);
      return;
    }

    // Check if product is already featured
    const existingProduct = featuredProducts.find(fp => fp.product_id === selectedProductId);
    if (existingProduct) {
      toast.error('This product is already featured');
      return;
    }

    try {
      const { error } = await supabase
        .from('featured_products')
        .insert({
          product_id: selectedProductId,
          order_index: orderIndex,
          is_active: true,
        });

      if (error) throw error;

      toast.success('Featured product added successfully');
      setShowAddDialog(false);
      resetForm();
      loadFeaturedProducts();
    } catch (error) {
      console.error('Error adding featured product:', error);
      toast.error('Failed to add featured product');
    }
  };

  const handleUpdateFeaturedProduct = async () => {
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('featured_products')
        .update({
          order_index: orderIndex,
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast.success('Featured product updated successfully');
      setEditingProduct(null);
      resetForm();
      loadFeaturedProducts();
    } catch (error) {
      console.error('Error updating featured product:', error);
      toast.error('Failed to update featured product');
    }
  };

  const handleDeleteFeaturedProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this featured product?')) return;

    try {
      const { error } = await supabase
        .from('featured_products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Featured product removed successfully');
      loadFeaturedProducts();
    } catch (error) {
      console.error('Error deleting featured product:', error);
      toast.error('Failed to remove featured product');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('featured_products')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Featured product ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadFeaturedProducts();
    } catch (error) {
      console.error('Error toggling featured product status:', error);
      toast.error('Failed to update featured product status');
    }
  };

  const openEditDialog = (product: FeaturedProduct) => {
    setEditingProduct(product);
    setSelectedProductId(product.product_id);
    setOrderIndex(product.order_index);
  };

  // Get available order positions (1-5, excluding taken ones)
  const getAvailableOrderPositions = () => {
    const takenPositions = featuredProducts.map(fp => fp.order_index);
    return Array.from({ length: 5 }, (_, i) => i + 1)
      .filter(pos => !takenPositions.includes(pos) || (editingProduct && editingProduct.order_index === pos));
  };

  // Get available products (excluding already featured ones)
  const getAvailableProducts = () => {
    const featuredProductIds = featuredProducts.map(fp => fp.product_id);
    return products.filter(p => !featuredProductIds.includes(p.id) || (editingProduct && editingProduct.product_id === p.id));
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <p className="text-muted-foreground">
            Select products to feature in the hero section (max 5)
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setShowAddDialog(true);
              }}
              disabled={featuredProducts.length >= 5}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Featured Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Featured Product</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Product Selection */}
              <div className="space-y-2">
                <Label>Select Product</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableProducts().map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - ₹{product.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Position Selection */}
              <div className="space-y-2">
                <Label>Position (1-5)</Label>
                <Select value={orderIndex.toString()} onValueChange={(value) => setOrderIndex(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableOrderPositions().map((pos) => (
                      <SelectItem key={pos} value={pos.toString()}>
                        Position {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddFeaturedProduct}>
                  Add Featured Product
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Featured Products List */}
      <div className="grid gap-4">
        {featuredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No featured products yet. Add your first featured product!</p>
            </CardContent>
          </Card>
        ) : (
          featuredProducts.map((featuredProduct) => (
            <Card key={featuredProduct.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="text-lg font-bold">
                      #{featuredProduct.order_index}
                    </Badge>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">
                          {featuredProduct.product?.name || 'Unknown Product'}
                        </h3>
                        <Badge variant={featuredProduct.is_active ? "default" : "secondary"}>
                          {featuredProduct.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {featuredProduct.product?.category} • ₹{featuredProduct.product?.price}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(featuredProduct.id, featuredProduct.is_active)}
                      title={featuredProduct.is_active ? "Deactivate" : "Activate"}
                    >
                      {featuredProduct.is_active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(featuredProduct)}
                      title="Edit Position"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFeaturedProduct(featuredProduct.id)}
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

      {/* Edit Dialog - Only for changing position */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Position</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold">{editingProduct?.product?.name}</p>
              <p className="text-sm text-muted-foreground">
                Current position: #{editingProduct?.order_index}
              </p>
            </div>

            <div className="space-y-2">
              <Label>New Position (1-5)</Label>
              <Select value={orderIndex.toString()} onValueChange={(value) => setOrderIndex(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableOrderPositions().map((pos) => (
                    <SelectItem key={pos} value={pos.toString()}>
                      Position {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateFeaturedProduct}>
                Update Position
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};