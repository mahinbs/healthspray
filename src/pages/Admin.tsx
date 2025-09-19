import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  LogOut,
  Settings,
  Package,
  Users,
  BarChart3,
  Upload,
  Save,
  X,
  Image,
  Link,
  FileImage,
  Loader2,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { formatPrice } from "@/services/api";
import {
  productsService,
  AdminProduct,
  ProductStats,
  convertToDatabaseProduct,
} from "@/services/products";
import { supabase } from "@/integrations/supabase/client";
import OrderManagement from "@/components/OrderManagement";
import AdminAnalytics from "@/components/AdminAnalytics";
import AdminSettings from "@/components/AdminSettings";
import AdminOrderStats from "@/components/AdminOrderStats";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signIn, signOut } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Data states
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    activeProducts: 0,
    categories: 0,
    newProducts: 0,
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog states
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(
    null
  );

  // Image handling states
  const [imageUploadMethod, setImageUploadMethod] = useState<"url" | "file">(
    "url"
  );
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Initial form data
  const initialFormData = {
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    description: "",
    stock: "0",
    isActive: true,
    isNew: false,
    rating: "5",
    reviews: "0",
    features: [""],
    images: [""],
  };

  // Form state for adding/editing products
  const [formData, setFormData] = useState(initialFormData);

  // Reset form function
  const resetForm = () => {
    setFormData(initialFormData);
    setImagePreviews([]);
    setImageUploadMethod("url");
    setEditingProduct(null);
  };

  // Load data when user becomes admin
  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setIsLoadingStats(true);

      // Load products and stats in parallel
      const [productsData, statsData] = await Promise.all([
        productsService.getAllProducts(),
        productsService.getProductStats(),
      ]);

      setProducts(productsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading data:", error);
      throw error;
    } finally {
      setIsLoading(false);
      setIsLoadingStats(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const { error } = await signIn(email, password);

    if (error) {
      setLoginError(
        error.message || "Login failed. Please check your credentials."
      );
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleAddProduct = async () => {
    try {
      setIsSubmitting(true);

      const productData = convertToDatabaseProduct({
        name: formData.name,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : undefined,
        image: formData.images.filter((img) => img.trim() !== ""),
        category: formData.category,
        description: formData.description,
        features: formData.features.filter((f) => f.trim() !== ""),
        rating: parseInt(formData.rating),
        reviews: parseInt(formData.reviews),
        isNew: formData.isNew,
        stock: parseInt(formData.stock),
        isActive: formData.isActive,
      });

      const newProduct = await productsService.addProduct(productData);
      setProducts((prev) => [newProduct, ...prev]);

      // Refresh stats
      const newStats = await productsService.getProductStats();
      setStats(newStats);

      // Reset form
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;

    try {
      setIsSubmitting(true);

      const updateData = convertToDatabaseProduct({
        name: formData.name,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : undefined,
        image: formData.images.filter((img) => img.trim() !== ""),
        category: formData.category,
        description: formData.description,
        features: formData.features.filter((f) => f.trim() !== ""),
        rating: parseInt(formData.rating),
        reviews: parseInt(formData.reviews),
        isNew: formData.isNew,
        stock: parseInt(formData.stock),
        isActive: formData.isActive,
      });

      const updatedProduct = await productsService.updateProduct(
        editingProduct.id,
        updateData
      );
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
      );

      // Refresh stats
      const newStats = await productsService.getProductStats();
      setStats(newStats);

      resetForm();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setIsSubmitting(true);

      await productsService.deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));

      // Refresh stats
      const newStats = await productsService.getProductStats();
      setStats(newStats);

      setProductToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (product: AdminProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.original_price?.toString() || "",
      category: product.category,
      description: product.description || "",
      stock: product.stock.toString(),
      isActive: product.is_active,
      isNew: product.is_new,
      rating: product.rating.toString(),
      reviews: product.reviews.toString(),
      features: product.features?.length ? product.features : [""],
      images: Array.isArray(product.image)
        ? product.image
        : product.image
        ? [product.image]
        : [""],
    });
    setImagePreviews(
      Array.isArray(product.image)
        ? product.image
        : product.image
        ? [product.image]
        : []
    );
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: AdminProduct) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const addFeatureField = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const removeFeatureField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }));
  };

  // Image handling functions
  const addImageUrl = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }));
  };

  const updateImageUrl = (index: number, url: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? url : img)),
    }));

    // Update previews for valid URLs
    if (url && url.startsWith("http")) {
      setImagePreviews((prev) => {
        const updated = [...prev];
        updated[index] = url;
        return updated;
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBulkAddProducts = async () => {
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase.functions.invoke('bulk-add-products');
      
      if (error) {
        console.error('Error calling bulk-add-products:', error);
        toast.error('Failed to add products. Please try again.');
        return;
      }
      
      if (data.success) {
        toast.success(`Successfully added ${data.inserted} Upurfit products!`);
        if (data.skipped > 0) {
          toast.info(`${data.skipped} products were already in the database.`);
        }
        
        // Refresh the products list and stats
        await loadData();
      } else {
        toast.error(data.error || 'Failed to add products');
      }
    } catch (error) {
      console.error('Error in bulk add products:', error);
      toast.error('Failed to add products. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMultipleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsImageUploading(true);

    try {
      // Create FormData for multiple files
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      // Upload to Supabase Edge Function
      const response = await fetch(
        "https://tdzyskyjqobglueymvmx.supabase.co/functions/v1/upload-images",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${
              import.meta.env.VITE_SUPABASE_ANON_KEY ||
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkenlza3lqcW9iZ2x1ZXltdm14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjM4MzYsImV4cCI6MjA3MDEzOTgzNn0.5fQXZ2dJF30gPq_VtKmg4L-_fV5pOp5Pd56PU5mHcUM"
            }`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.uploaded.length > 0) {
        // Add successful uploads to images
        const newImageUrls = result.uploaded.map((upload: { url: string }) => upload.url);

        setFormData((prev) => ({
          ...prev,
          images: [
            ...prev.images.filter((img) => img.trim() !== ""),
            ...newImageUrls,
          ],
        }));

        setImagePreviews((prev) => [...prev, ...newImageUrls]);

        if (result.failed.length > 0) {
          alert(
            `${result.uploaded.length} images uploaded successfully. ${result.failed.length} failed.`
          );
        }
      } else {
        throw new Error("No images were uploaded successfully");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setIsImageUploading(false);
      // Reset file input
      event.target.value = "";
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Access denied - only show when auth is complete and user is not admin
  if (user && !authLoading && !isAdmin) {
    const handleLogout = async () => {
      await signOut();
      navigate('/admin');
    };

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            You don't have admin privileges.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleLogout} variant="outline">
              Logout & Try Again
            </Button>
            <Button onClick={() => navigate("/")} variant="outline">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Login Form
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl sm:text-2xl">Admin Login</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Enter your admin credentials to access the admin panel
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="text-sm sm:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="text-sm sm:text-base"
                  />
                </div>
                {loginError && (
                  <div className="text-red-500 text-xs sm:text-sm flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{loginError}</span>
                  </div>
                )}
                <Button type="submit" className="w-full text-sm sm:text-base">
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your products and store
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
            <Badge variant="secondary" className="text-xs sm:text-sm">Welcome, Admin</Badge>
            <Button variant="outline" onClick={handleLogout} size="sm" className="text-xs sm:text-sm">
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="inline">Logout</span>
            </Button>
          </div>
        </div>

        

        
        {/* Order Stats */}
        <AdminOrderStats />

        {/* Helpful Info Card */}
        <Card className="mb-6 border-blue-200 bg-blue-50/10">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="text-blue-500 mt-1 flex-shrink-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">
                  How to Edit Products
                </h3>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                  <li className="break-words">
                    • <strong>View Products:</strong> All your products are
                    listed in the table below
                  </li>
                  <li className="break-words">
                    • <strong>Edit Product:</strong> Click the ✏️ (edit) button
                    next to any product
                  </li>
                  <li className="break-words">
                    • <strong>Update Details:</strong> Modify name, price,
                    description, stock, features, etc.
                  </li>
                  <li className="break-words">
                    • <strong>Save Changes:</strong> Click "Save Changes" to
                    update the product
                  </li>
                  <li className="break-words">
                    • <strong>Active/Inactive:</strong> Toggle product
                    visibility on your website
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Add Product Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">Product Management</h2>
              <div className="flex gap-2">
                <Button
                  onClick={handleBulkAddProducts}
                  disabled={isSubmitting}
                  variant="outline"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ShoppingBag className="h-4 w-4 mr-2" />
                  )}
                  Add Upurfit Products
                </Button>
                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={(open) => {
                    setIsAddDialogOpen(open);
                    if (!open) resetForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                      <DialogDescription>
                        Fill in the details for the new product
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Enter product name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              category: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Interactive Robots">
                              Interactive Robots
                            </SelectItem>
                            <SelectItem value="Cat Toys">Cat Toys</SelectItem>
                            <SelectItem value="Smart Feeders">
                              Smart Feeders
                            </SelectItem>
                            <SelectItem value="Dog Toys">Dog Toys</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              price: e.target.value,
                            }))
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="originalPrice">
                          Original Price (₹)
                        </Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          step="0.01"
                          value={formData.originalPrice}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              originalPrice: e.target.value,
                            }))
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              stock: e.target.value,
                            }))
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Enter product description"
                        rows={3}
                      />
                    </div>

                    {/* Image Upload Section */}
                    <div className="space-y-4">
                      <Label>Product Image</Label>

                      {/* Image Upload Method Toggle */}
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant={
                            imageUploadMethod === "url" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setImageUploadMethod("url")}
                        >
                          <Link className="h-4 w-4 mr-2" />
                          Image URL
                        </Button>
                        <Button
                          type="button"
                          variant={
                            imageUploadMethod === "file" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setImageUploadMethod("file")}
                        >
                          <FileImage className="h-4 w-4 mr-2" />
                          Upload File
                        </Button>
                      </div>

                      {/* Multiple Image URLs Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Product Images</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addImageUrl}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Image URL
                          </Button>
                        </div>

                        {formData.images.map((imageUrl, index) => (
                          <div
                            key={index}
                            className="flex space-x-2 items-start"
                          >
                            <div className="flex-1">
                              <Input
                                placeholder={`Image URL ${
                                  index + 1
                                } (e.g., https://example.com/image.jpg)`}
                                value={imageUrl}
                                onChange={(e) =>
                                  updateImageUrl(index, e.target.value)
                                }
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeImage(index)}
                              disabled={formData.images.length === 1}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}

                        <p className="text-sm text-muted-foreground">
                          Enter direct links to images (JPG, PNG, WebP
                          supported). First image will be the main product
                          image.
                        </p>
                      </div>

                      {/* Multiple File Upload */}
                      {imageUploadMethod === "file" && (
                        <div className="space-y-2">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleMultipleFileUpload}
                              className="hidden"
                              id="image-upload"
                            />
                            <label
                              htmlFor="image-upload"
                              className="cursor-pointer"
                            >
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                {isImageUploading
                                  ? "Uploading..."
                                  : "Click to upload multiple images"}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                JPG, PNG, WebP up to 5MB each. Select multiple
                                files.
                              </p>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Image Previews */}
                      {imagePreviews.length > 0 && (
                        <div className="space-y-2">
                          <Label>Image Previews</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={preview}
                                  alt={`Product preview ${index + 1}`}
                                  className="w-full h-24 sm:h-32 object-cover rounded-lg border"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "/src/assets/robot-toy-premium.jpg";
                                  }}
                                />
                                {index === 0 && (
                                  <Badge className="absolute top-1 left-1 text-xs">
                                    Main
                                  </Badge>
                                )}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="absolute -top-2 -right-2 h-6 w-6"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rating">Rating</Label>
                        <Input
                          id="rating"
                          type="number"
                          min="1"
                          max="5"
                          value={formData.rating}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              rating: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="reviews">Reviews Count</Label>
                        <Input
                          id="reviews"
                          type="number"
                          value={formData.reviews}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              reviews: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Features</Label>
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex space-x-2">
                          <Input
                            value={feature}
                            onChange={(e) =>
                              updateFeature(index, e.target.value)
                            }
                            placeholder={`Feature ${index + 1}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeFeatureField(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addFeatureField}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Feature
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            isActive: checked,
                          }))
                        }
                      />
                      <Label htmlFor="isActive">Active Product</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isNew"
                        checked={formData.isNew}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            isNew: checked,
                          }))
                        }
                      />
                      <Label htmlFor="isNew">New Product</Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddProduct} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Add Product
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total Products
                  </p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {isLoadingStats ? (
                      <Loader2 className="h-4 w-4 sm:h-6 sm:w-6 animate-spin" />
                    ) : (
                      stats.totalProducts
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Active Products
                  </p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {isLoadingStats ? (
                      <Loader2 className="h-4 w-4 sm:h-6 sm:w-6 animate-spin" />
                    ) : (
                      stats.activeProducts
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Categories
                  </p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {isLoadingStats ? (
                      <Loader2 className="h-4 w-4 sm:h-6 sm:w-6 animate-spin" />
                    ) : (
                      stats.categories
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    New Products
                  </p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {isLoadingStats ? (
                      <Loader2 className="h-4 w-4 sm:h-6 sm:w-6 animate-spin" />
                    ) : (
                      stats.newProducts
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>Product Inventory</CardTitle>
                <CardDescription>
                  Manage your product catalog. Click the edit button (✏️) to
                  modify any product, or the delete button (🗑️) to remove
                  products.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading products...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Products Found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start by adding your first product using the "Add Product"
                      button above.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4">Product</th>
                            <th className="text-left p-4">Category</th>
                            <th className="text-left p-4">Price</th>
                            <th className="text-left p-4">Stock</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => (
                            <tr
                              key={product.id}
                              className="border-b hover:bg-muted/50"
                            >
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={
                                      Array.isArray(product.image)
                                        ? product.image[0]
                                        : product.image
                                    }
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {product.is_new && (
                                        <Badge
                                          variant="secondary"
                                          className="mr-1"
                                        >
                                          New
                                        </Badge>
                                      )}
                                      Rating: {product.rating}/5 (
                                      {product.reviews} reviews)
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">{product.category}</td>
                              <td className="p-4">
                                <div>
                                  <p className="font-medium">
                                    {formatPrice(product.price)}
                                  </p>
                                  {product.original_price && (
                                    <p className="text-sm text-muted-foreground line-through">
                                      {formatPrice(product.original_price)}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">
                                    {product.stock}
                                  </span>
                                  {product.stock < 10 && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      Low Stock
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge
                                  variant={
                                    product.is_active ? "default" : "secondary"
                                  }
                                >
                                  {product.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => openEditDialog(product)}
                                    title="Edit Product"
                                    className="text-zinc-500"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => openDeleteDialog(product)}
                                    title="Delete Product"
                                    className="text-zinc-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4 p-4">
                      {products.map((product) => (
                        <Card key={product.id} className="p-4">
                          <div className="flex items-start space-x-3">
                            <img
                              src={
                                Array.isArray(product.image)
                                  ? product.image[0]
                                  : product.image
                              }
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                                  <p className="text-xs text-muted-foreground">{product.category}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    {product.is_new && (
                                      <Badge variant="secondary" className="text-xs">
                                        New
                                      </Badge>
                                    )}
                                    <Badge
                                      variant={product.is_active ? "default" : "secondary"}
                                      className="text-xs"
                                    >
                                      {product.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => openEditDialog(product)}
                                    title="Edit Product"
                                    className="h-8 w-8 text-zinc-500"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => openDeleteDialog(product)}
                                    title="Delete Product"
                                    className="h-8 w-8 text-zinc-500"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-2 space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">
                                    {formatPrice(product.price)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Stock: {product.stock}
                                  </span>
                                </div>
                                {product.original_price && (
                                  <p className="text-xs text-muted-foreground line-through">
                                    {formatPrice(product.original_price)}
                                  </p>
                                )}
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    Rating: {product.rating}/5 ({product.reviews} reviews)
                                  </span>
                                  {product.stock < 10 && (
                                    <Badge variant="destructive" className="text-xs">
                                      Low Stock
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
                <p className="text-muted-foreground">
                  View your store performance and insights
                </p>
              </div>
              <AdminAnalytics />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Admin Settings</h2>
                <p className="text-muted-foreground">
                  Manage your admin account and preferences
                </p>
              </div>
              <AdminSettings />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Product Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Interactive Robots">
                      Interactive Robots
                    </SelectItem>
                    <SelectItem value="Cat Toys">Cat Toys</SelectItem>
                    <SelectItem value="Smart Feeders">Smart Feeders</SelectItem>
                    <SelectItem value="Dog Toys">Dog Toys</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-price">Price (₹)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="edit-originalPrice">Original Price (₹)</Label>
                <Input
                  id="edit-originalPrice"
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      originalPrice: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stock: e.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <Label>Product Image</Label>

              {/* Image Upload Method Toggle */}
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={imageUploadMethod === "url" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setImageUploadMethod("url")}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Image URL
                </Button>
                <Button
                  type="button"
                  variant={imageUploadMethod === "file" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setImageUploadMethod("file")}
                >
                  <FileImage className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>

              {/* Multiple Image URLs Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Product Images</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImageUrl}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image URL
                  </Button>
                </div>

                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="flex space-x-2 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder={`Image URL ${
                          index + 1
                        } (e.g., https://example.com/image.jpg)`}
                        value={imageUrl}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeImage(index)}
                      disabled={formData.images.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <p className="text-sm text-muted-foreground">
                  Enter direct links to images (JPG, PNG, WebP supported). First
                  image will be the main product image.
                </p>
              </div>

              {/* Multiple File Upload */}
              {imageUploadMethod === "file" && (
                <div className="space-y-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMultipleFileUpload}
                      className="hidden"
                      id="edit-image-upload"
                    />
                    <label
                      htmlFor="edit-image-upload"
                      className="cursor-pointer"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {isImageUploading
                          ? "Uploading..."
                          : "Click to upload multiple images"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG, WebP up to 5MB each. Select multiple files.
                      </p>
                    </label>
                  </div>
                </div>
              )}

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="space-y-2">
                  <Label>Image Previews</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Product preview ${index + 1}`}
                          className="w-full h-24 sm:h-32 object-cover rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.src =
                              "/src/assets/robot-toy-premium.jpg";
                          }}
                        />
                        {index === 0 && (
                          <Badge className="absolute top-1 left-1 text-xs">
                            Main
                          </Badge>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-rating">Rating</Label>
                <Input
                  id="edit-rating"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rating: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-reviews">Reviews Count</Label>
                <Input
                  id="edit-reviews"
                  type="number"
                  value={formData.reviews}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      reviews: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeFeatureField(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addFeatureField}>
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: checked,
                  }))
                }
              />
              <Label htmlFor="edit-isActive">Active Product</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isNew"
                checked={formData.isNew}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isNew: checked,
                  }))
                }
              />
              <Label htmlFor="edit-isNew">New Product</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditProduct} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
