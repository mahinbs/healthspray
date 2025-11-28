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
  Pencil,
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
  ImageIcon,
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
import VideoManagement from "@/components/VideoManagement";
import CouponsManager from "@/components/CouponsManager";
import { FeaturedProductsManager } from "@/components/FeaturedProductsManager";
import { HeroSectionManager } from "@/components/HeroSectionManager";
import { HeroCarouselManager } from "@/components/HeroCarouselManager";
import PromotionalBannerManager from "@/components/PromotionalBannerManager";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";
import { categoriesService, type AdminCategory } from "@/services/categories";
import { blogService, type AdminBlogPost, type BlogContentBlock } from "@/services/blog";

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signIn, signOut } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Data states
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [blogPosts, setBlogPosts] = useState<AdminBlogPost[]>([]);
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
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(
    null
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(
    null
  );
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCategoryEditDialogOpen, setIsCategoryEditDialogOpen] = useState(false);
  const [isCategoryDeleteDialogOpen, setIsCategoryDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null);
  
  // Blog dialog states
  const [editingBlogPost, setEditingBlogPost] = useState<AdminBlogPost | null>(null);
  const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false);
  const [isBlogEditDialogOpen, setIsBlogEditDialogOpen] = useState(false);
  const [isBlogDeleteDialogOpen, setIsBlogDeleteDialogOpen] = useState(false);
  const [blogPostToDelete, setBlogPostToDelete] = useState<AdminBlogPost | null>(null);
  
  // Blog image handling states
  const [blogImageUploadMethod, setBlogImageUploadMethod] = useState<"url" | "file">("url");
  const [blogImagePreviews, setBlogImagePreviews] = useState<string[]>([]);
  const [isBlogImageUploading, setIsBlogImageUploading] = useState(false);

  // Image handling states
  const [imageUploadMethod, setImageUploadMethod] = useState<"url" | "file">(
    "url"
  );
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);
  
  // Category image handling states
  const [categoryImageUploadMethod, setCategoryImageUploadMethod] = useState<"url" | "file">("url");
  const [categoryImagePreviews, setCategoryImagePreviews] = useState<string[]>([]);
  const [isCategoryImageUploading, setIsCategoryImageUploading] = useState(false);

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
    mainImage: "",
    secondaryImage: "",
  };

  // Form state for adding/editing products
  const [formData, setFormData] = useState(initialFormData);
  
  // Category form state
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    slug: "",
    background_image_url: "",
    gradient_from: "orange-500",
    gradient_to: "red-600",
    product_tags: [] as string[],
    display_order: 0,
    is_active: true,
  });
  
  // Blog form state
  const [blogFormData, setBlogFormData] = useState({
    title: "",
    description: "",
    author: "",
    published_date: "",
    image_url: "",
    category_tag: "",
    read_time_minutes: 5,
    slug: "",
    detailed_title: "",
    detailed_content: [] as BlogContentBlock[],
    display_order: 0,
    is_active: true,
  });

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

      // Load products, categories, blog posts, and stats in parallel
      const [productsData, categoriesData, blogPostsData, statsData] = await Promise.all([
        productsService.getAllProducts(),
        categoriesService.getAllCategories(),
        blogService.getAllBlogPosts(),
        productsService.getProductStats(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setBlogPosts(blogPostsData);
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
        mainImage: formData.mainImage,
        secondaryImage: formData.secondaryImage,
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
        mainImage: formData.mainImage,
        secondaryImage: formData.secondaryImage,
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

  // Category management functions
  const handleAddCategory = async () => {
    try {
      setIsSubmitting(true);
      
      const newCategory = await categoriesService.addCategory({
        name: categoryFormData.name,
        description: categoryFormData.description || null,
        slug: categoryFormData.slug || categoryFormData.name.toLowerCase().replace(/\s+/g, '-'),
        background_image_url: categoryFormData.background_image_url || null,
        gradient_from: categoryFormData.gradient_from || null,
        gradient_to: categoryFormData.gradient_to || null,
        product_tags: categoryFormData.product_tags,
        display_order: categoryFormData.display_order,
        is_active: categoryFormData.is_active,
      });
      
      setCategories((prev) => [newCategory, ...prev]);
      setCategoryFormData({
        name: "",
        description: "",
        slug: "",
        background_image_url: "",
        gradient_from: "orange-500",
        gradient_to: "red-600",
        product_tags: [],
        display_order: 0,
        is_active: true,
      });
      setCategoryImagePreviews([]);
      setCategoryImageUploadMethod("url");
      setIsCategoryDialogOpen(false);
      toast.success("Category added successfully!");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory) return;
    
    try {
      setIsSubmitting(true);
      
      const updatedCategory = await categoriesService.updateCategory(editingCategory.id, {
        name: categoryFormData.name,
        description: categoryFormData.description || null,
        slug: categoryFormData.slug,
        background_image_url: categoryFormData.background_image_url || null,
        gradient_from: categoryFormData.gradient_from || null,
        gradient_to: categoryFormData.gradient_to || null,
        product_tags: categoryFormData.product_tags,
        display_order: categoryFormData.display_order,
        is_active: categoryFormData.is_active,
      });
      
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? updatedCategory : c))
      );
      
      setCategoryFormData({
        name: "",
        description: "",
        slug: "",
        background_image_url: "",
        gradient_from: "orange-500",
        gradient_to: "red-600",
        product_tags: [],
        display_order: 0,
        is_active: true,
      });
      setCategoryImagePreviews([]);
      setCategoryImageUploadMethod("url");
      setEditingCategory(null);
      setIsCategoryEditDialogOpen(false);
      toast.success("Category updated successfully!");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      setIsSubmitting(true);
      await categoriesService.deleteCategory(categoryToDelete.id);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      setCategoryToDelete(null);
      setIsCategoryDeleteDialogOpen(false);
      toast.success("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Blog management functions
  const handleAddBlogPost = async () => {
    try {
      setIsSubmitting(true);
      
      const newBlogPost = await blogService.addBlogPost({
        title: blogFormData.title,
        description: blogFormData.description,
        author: blogFormData.author,
        published_date: blogFormData.published_date,
        image_url: blogFormData.image_url,
        category_tag: blogFormData.category_tag,
        read_time_minutes: blogFormData.read_time_minutes,
        slug: blogFormData.slug || blogFormData.title.toLowerCase().replace(/\s+/g, '-'),
        detailed_title: blogFormData.detailed_title || blogFormData.title,
        detailed_content: blogFormData.detailed_content as any,
        display_order: blogFormData.display_order,
        is_active: blogFormData.is_active,
      });
      
      setBlogPosts((prev) => [newBlogPost, ...prev]);
      setBlogFormData({
        title: "",
        description: "",
        author: "",
        published_date: "",
        image_url: "",
        category_tag: "",
        read_time_minutes: 5,
        slug: "",
        detailed_title: "",
        detailed_content: [],
        display_order: 0,
        is_active: true,
      });
      setBlogImagePreviews([]);
      setBlogImageUploadMethod("url");
      setIsBlogDialogOpen(false);
      toast.success("Blog post added successfully!");
    } catch (error) {
      console.error("Error adding blog post:", error);
      toast.error("Failed to add blog post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBlogPost = async () => {
    if (!editingBlogPost) return;
    
    try {
      setIsSubmitting(true);
      
      const updatedBlogPost = await blogService.updateBlogPost(editingBlogPost.id, {
        title: blogFormData.title,
        description: blogFormData.description,
        author: blogFormData.author,
        published_date: blogFormData.published_date,
        image_url: blogFormData.image_url,
        category_tag: blogFormData.category_tag,
        read_time_minutes: blogFormData.read_time_minutes,
        slug: blogFormData.slug,
        detailed_title: blogFormData.detailed_title,
        detailed_content: blogFormData.detailed_content as any,
        display_order: blogFormData.display_order,
        is_active: blogFormData.is_active,
      });
      
      setBlogPosts((prev) =>
        prev.map((p) => (p.id === editingBlogPost.id ? updatedBlogPost : p))
      );
      
      setBlogFormData({
        title: "",
        description: "",
        author: "",
        published_date: "",
        image_url: "",
        category_tag: "",
        read_time_minutes: 5,
        slug: "",
        detailed_title: "",
        detailed_content: [],
        display_order: 0,
        is_active: true,
      });
      setBlogImagePreviews([]);
      setBlogImageUploadMethod("url");
      setEditingBlogPost(null);
      setIsBlogEditDialogOpen(false);
      toast.success("Blog post updated successfully!");
    } catch (error) {
      console.error("Error updating blog post:", error);
      toast.error("Failed to update blog post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlogPost = async () => {
    if (!blogPostToDelete) return;
    
    try {
      setIsSubmitting(true);
      await blogService.deleteBlogPost(blogPostToDelete.id);
      setBlogPosts((prev) => prev.filter((p) => p.id !== blogPostToDelete.id));
      setBlogPostToDelete(null);
      setIsBlogDeleteDialogOpen(false);
      toast.success("Blog post deleted successfully!");
    } catch (error) {
      console.error("Error deleting blog post:", error);
      toast.error("Failed to delete blog post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openBlogEditDialog = (post: AdminBlogPost) => {
    setEditingBlogPost(post);
    setBlogFormData({
      title: post.title,
      description: post.description,
      author: post.author,
      published_date: post.published_date,
      image_url: post.image_url,
      category_tag: post.category_tag,
      read_time_minutes: post.read_time_minutes,
      slug: post.slug,
      detailed_title: post.detailed_title || post.title,
      detailed_content: (Array.isArray(post.detailed_content) ? post.detailed_content : []) as unknown as BlogContentBlock[],
      display_order: post.display_order,
      is_active: post.is_active,
    });
    if (post.image_url) {
      setBlogImagePreviews([post.image_url]);
    } else {
      setBlogImagePreviews([]);
    }
    setBlogImageUploadMethod("url");
    setIsBlogEditDialogOpen(true);
  };

  const handleBlogImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsBlogImageUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

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
        const newImageUrls = result.uploaded.map((upload: { url: string }) => upload.url);
        setBlogImagePreviews((prev) => [...prev, ...newImageUrls]);
        
        if (!blogFormData.image_url && newImageUrls.length > 0) {
          setBlogFormData(prev => ({ ...prev, image_url: newImageUrls[0] }));
        }

        if (result.failed.length > 0) {
          toast.warning(
            `${result.uploaded.length} images uploaded successfully. ${result.failed.length} failed.`
          );
        } else {
          toast.success(`${result.uploaded.length} image(s) uploaded successfully!`);
        }
      } else {
        throw new Error("No images were uploaded successfully");
      }
    } catch (error) {
      console.error("Blog image upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsBlogImageUploading(false);
      event.target.value = "";
    }
  };

  const addContentBlock = (type: 'heading' | 'paragraph' | 'key_points', level?: number) => {
    setBlogFormData(prev => ({
      ...prev,
      detailed_content: [...prev.detailed_content, { type, content: '', level: level || 2 }]
    }));
  };

  const updateContentBlock = (index: number, content: string) => {
    setBlogFormData(prev => ({
      ...prev,
      detailed_content: prev.detailed_content.map((block, i) => 
        i === index ? { ...block, content } : block
      )
    }));
  };

  const removeContentBlock = (index: number) => {
    setBlogFormData(prev => ({
      ...prev,
      detailed_content: prev.detailed_content.filter((_, i) => i !== index)
    }));
  };

  const openCategoryEditDialog = (category: AdminCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
      slug: category.slug,
      background_image_url: category.background_image_url || "",
      gradient_from: category.gradient_from || "orange-500",
      gradient_to: category.gradient_to || "red-600",
      product_tags: category.product_tags || [],
      display_order: category.display_order,
      is_active: category.is_active,
    });
    // Load existing background image into previews if it exists
    if (category.background_image_url) {
      setCategoryImagePreviews([category.background_image_url]);
    } else {
      setCategoryImagePreviews([]);
    }
    setCategoryImageUploadMethod("url");
    setIsCategoryEditDialogOpen(true);
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
      mainImage: product.main_image || "",
      secondaryImage: product.secondary_image || "",
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

  const handleUpdateProductImages = async () => {
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase.functions.invoke('update-product-images');
      
      if (error) {
        console.error('Error calling update-product-images:', error);
        toast.error('Failed to update product images. Please try again.');
        return;
      }
      
      if (data.success) {
        toast.success(`Successfully updated ${data.updated} products with new images!`);
        if (data.skipped > 0) {
          toast.info(`${data.skipped} products were skipped (not found).`);
        }
        if (data.errors && data.errors.length > 0) {
          toast.error(`Some errors occurred: ${data.errors.join(', ')}`);
        }
        
        // Refresh the products list and stats
        await loadData();
      } else {
        toast.error(data.error || 'Failed to update product images');
      }
    } catch (error) {
      console.error('Error in update product images:', error);
      toast.error('Failed to update product images. Please try again.');
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

  // Category image upload handler
  const handleCategoryImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsCategoryImageUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

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
        const newImageUrls = result.uploaded.map((upload: { url: string }) => upload.url);
        setCategoryImagePreviews((prev) => [...prev, ...newImageUrls]);
        
        // Auto-set first uploaded image as background if none is set
        if (!categoryFormData.background_image_url && newImageUrls.length > 0) {
          setCategoryFormData(prev => ({ ...prev, background_image_url: newImageUrls[0] }));
        }

        if (result.failed.length > 0) {
          toast.warning(
            `${result.uploaded.length} images uploaded successfully. ${result.failed.length} failed.`
          );
        } else {
          toast.success(`${result.uploaded.length} image(s) uploaded successfully!`);
        }
      } else {
        throw new Error("No images were uploaded successfully");
      }
    } catch (error) {
      console.error("Category image upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsCategoryImageUploading(false);
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
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="blog">Blog Posts</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
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
                <Button
                  onClick={handleUpdateProductImages}
                  disabled={isSubmitting}
                  variant="outline"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ImageIcon className="h-4 w-4 mr-2" />
                  )}
                  Update Product Images
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
                            <SelectItem value="Pain Relief">
                              Pain Relief
                            </SelectItem>
                            <SelectItem value="Recovery Products">Recovery Products</SelectItem>
                            <SelectItem value="Compression Wear">
                              Compression Wear
                            </SelectItem>
                            <SelectItem value="Warm-up Products">Warm-up Products</SelectItem>
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
                          Enter direct links to images (JPG, PNG, WebP supported). 
                          Hover over uploaded images below to set main and secondary images.
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
                              <div key={index} className="relative group">
                                <img
                                  src={preview}
                                  alt={`Product preview ${index + 1}`}
                                  className="w-full h-24 sm:h-32 object-cover rounded-lg border cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "/src/assets/robot-toy-premium.jpg";
                                  }}
                                />
                                
                                {/* Selection buttons */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={formData.mainImage === preview ? "default" : "secondary"}
                                    onClick={() => setFormData(prev => ({ ...prev, mainImage: preview }))}
                                    className="text-xs"
                                  >
                                    {formData.mainImage === preview ? "✓ Main" : "Set Main"}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={formData.secondaryImage === preview ? "default" : "secondary"}
                                    onClick={() => setFormData(prev => ({ ...prev, secondaryImage: preview }))}
                                    className="text-xs"
                                  >
                                    {formData.secondaryImage === preview ? "✓ Secondary" : "Set Secondary"}
                                  </Button>
                                </div>
                                
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
                          
                          {/* Current Selection Display */}
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <div className="text-sm font-medium mb-2">Current Selection:</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">Main Image:</span>
                                {formData.mainImage ? (
                                  <div className="flex items-center gap-2">
                                    <img src={formData.mainImage} alt="Main" className="w-8 h-8 object-cover rounded" />
                                    <span className="text-xs text-green-600">✓ Selected</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Not selected</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">Secondary Image:</span>
                                {formData.secondaryImage ? (
                                  <div className="flex items-center gap-2">
                                    <img src={formData.secondaryImage} alt="Secondary" className="w-8 h-8 object-cover rounded" />
                                    <span className="text-xs text-green-600">✓ Selected</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Not selected</span>
                                )}
                              </div>
                            </div>
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
                              className="border-b hover:bg-gray-50"
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

         <TabsContent value="categories" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-bold">Category Management</h2>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new category for the Shop by Category section
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cat-name">Category Name</Label>
                    <Input
                      id="cat-name"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Warm-Up & Cool-Down"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cat-slug">Slug (URL-friendly)</Label>
                    <Input
                      id="cat-slug"
                      value={categoryFormData.slug}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="e.g., warmup-cooldown"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cat-description">Description</Label>
                    <Textarea
                      id="cat-description"
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="e.g., Pre and post workout solutions"
                      rows={2}
                    />
                  </div>
                  {/* Category Background Image Section */}
                  <div className="space-y-4">
                    <Label>Category Background Image</Label>
                    
                    {/* Image Upload Method Toggle */}
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={categoryImageUploadMethod === "url" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryImageUploadMethod("url")}
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Image URL
                      </Button>
                      <Button
                        type="button"
                        variant={categoryImageUploadMethod === "file" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryImageUploadMethod("file")}
                      >
                        <FileImage className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                    </div>

                    {/* Image URL Input */}
                    {categoryImageUploadMethod === "url" && (
                      <div>
                        <Input
                          id="cat-bg-image"
                          value={categoryFormData.background_image_url}
                          onChange={(e) => setCategoryFormData(prev => ({ ...prev, background_image_url: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter direct link to background image (JPG, PNG, WebP supported)
                        </p>
                      </div>
                    )}

                    {/* File Upload */}
                    {categoryImageUploadMethod === "file" && (
                      <div className="space-y-2">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCategoryImageUpload}
                            className="hidden"
                            id="category-image-upload"
                          />
                          <label
                            htmlFor="category-image-upload"
                            className="cursor-pointer"
                          >
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              {isCategoryImageUploading
                                ? "Uploading..."
                                : "Click to upload background image"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG, WebP up to 5MB
                            </p>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Image Preview and Selection */}
                    {categoryImagePreviews.length > 0 && (
                      <div className="space-y-2">
                        <Label>Uploaded Images</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                          {categoryImagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Category preview ${index + 1}`}
                                className={`w-full h-24 sm:h-32 object-cover rounded-lg border cursor-pointer transition-all duration-200 ${
                                  categoryFormData.background_image_url === preview
                                    ? 'ring-2 ring-primary'
                                    : 'hover:ring-2 hover:ring-primary'
                                }`}
                                onClick={() => setCategoryFormData(prev => ({ ...prev, background_image_url: preview }))}
                                onError={(e) => {
                                  e.currentTarget.src = "/src/assets/robot-toy-premium.jpg";
                                }}
                              />
                              {categoryFormData.background_image_url === preview && (
                                <Badge className="absolute top-1 left-1 text-xs bg-primary">
                                  Selected
                                </Badge>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCategoryImagePreviews(prev => prev.filter((_, i) => i !== index));
                                  if (categoryFormData.background_image_url === preview) {
                                    setCategoryFormData(prev => ({ ...prev, background_image_url: "" }));
                                  }
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Click on an image to set it as the background image
                        </p>
                      </div>
                    )}

                    {/* Current Selection Display */}
                    {categoryFormData.background_image_url && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm font-medium mb-2">Selected Background Image:</div>
                        <div className="flex items-center gap-2">
                          <img 
                            src={categoryFormData.background_image_url} 
                            alt="Selected" 
                            className="w-16 h-16 object-cover rounded" 
                          />
                          <span className="text-xs text-green-600">✓ Selected</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cat-gradient-from">Gradient From</Label>
                      <Input
                        id="cat-gradient-from"
                        value={categoryFormData.gradient_from}
                        onChange={(e) => setCategoryFormData(prev => ({ ...prev, gradient_from: e.target.value }))}
                        placeholder="orange-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cat-gradient-to">Gradient To</Label>
                      <Input
                        id="cat-gradient-to"
                        value={categoryFormData.gradient_to}
                        onChange={(e) => setCategoryFormData(prev => ({ ...prev, gradient_to: e.target.value }))}
                        placeholder="red-600"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cat-order">Display Order</Label>
                    <Input
                      id="cat-order"
                      type="number"
                      value={categoryFormData.display_order}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cat-active"
                      checked={categoryFormData.is_active}
                      onCheckedChange={(checked) => setCategoryFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="cat-active">Active (visible on website)</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCategory} disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Category"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Categories List */}
          <div className="space-y-4">
            {categories.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No categories found. Add your first category above.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{category.name}</h3>
                            {category.is_active ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                            <Badge variant="outline">Order: {category.display_order}</Badge>
                          </div>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground">Slug: {category.slug}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCategoryEditDialog(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setCategoryToDelete(category);
                              setIsCategoryDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Edit Category Dialog */}
          <Dialog open={isCategoryEditDialogOpen} onOpenChange={setIsCategoryEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>
                  Update category details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-cat-name">Category Name</Label>
                  <Input
                    id="edit-cat-name"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-cat-slug">Slug</Label>
                  <Input
                    id="edit-cat-slug"
                    value={categoryFormData.slug}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, slug: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-cat-description">Description</Label>
                  <Textarea
                    id="edit-cat-description"
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>
                {/* Category Background Image Section */}
                <div className="space-y-4">
                  <Label>Category Background Image</Label>
                  
                  {/* Image Upload Method Toggle */}
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={categoryImageUploadMethod === "url" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategoryImageUploadMethod("url")}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Image URL
                    </Button>
                    <Button
                      type="button"
                      variant={categoryImageUploadMethod === "file" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategoryImageUploadMethod("file")}
                    >
                      <FileImage className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>

                  {/* Image URL Input */}
                  {categoryImageUploadMethod === "url" && (
                    <div>
                      <Input
                        id="edit-cat-bg-image"
                        value={categoryFormData.background_image_url}
                        onChange={(e) => setCategoryFormData(prev => ({ ...prev, background_image_url: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter direct link to background image (JPG, PNG, WebP supported)
                      </p>
                    </div>
                  )}

                  {/* File Upload */}
                  {categoryImageUploadMethod === "file" && (
                    <div className="space-y-2">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCategoryImageUpload}
                          className="hidden"
                          id="edit-category-image-upload"
                        />
                        <label
                          htmlFor="edit-category-image-upload"
                          className="cursor-pointer"
                        >
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {isCategoryImageUploading
                              ? "Uploading..."
                              : "Click to upload background image"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG, WebP up to 5MB
                          </p>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Image Preview and Selection */}
                  {categoryImagePreviews.length > 0 && (
                    <div className="space-y-2">
                      <Label>Uploaded Images</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                        {categoryImagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Category preview ${index + 1}`}
                              className={`w-full h-24 sm:h-32 object-cover rounded-lg border cursor-pointer transition-all duration-200 ${
                                categoryFormData.background_image_url === preview
                                  ? 'ring-2 ring-primary'
                                  : 'hover:ring-2 hover:ring-primary'
                              }`}
                              onClick={() => setCategoryFormData(prev => ({ ...prev, background_image_url: preview }))}
                              onError={(e) => {
                                e.currentTarget.src = "/src/assets/robot-toy-premium.jpg";
                              }}
                            />
                            {categoryFormData.background_image_url === preview && (
                              <Badge className="absolute top-1 left-1 text-xs bg-primary">
                                Selected
                              </Badge>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCategoryImagePreviews(prev => prev.filter((_, i) => i !== index));
                                if (categoryFormData.background_image_url === preview) {
                                  setCategoryFormData(prev => ({ ...prev, background_image_url: "" }));
                                }
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Click on an image to set it as the background image
                      </p>
                    </div>
                  )}

                  {/* Current Selection Display */}
                  {categoryFormData.background_image_url && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-2">Selected Background Image:</div>
                      <div className="flex items-center gap-2">
                        <img 
                          src={categoryFormData.background_image_url} 
                          alt="Selected" 
                          className="w-16 h-16 object-cover rounded" 
                        />
                        <span className="text-xs text-green-600">✓ Selected</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-cat-gradient-from">Gradient From</Label>
                    <Input
                      id="edit-cat-gradient-from"
                      value={categoryFormData.gradient_from}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, gradient_from: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-cat-gradient-to">Gradient To</Label>
                    <Input
                      id="edit-cat-gradient-to"
                      value={categoryFormData.gradient_to}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, gradient_to: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-cat-order">Display Order</Label>
                  <Input
                    id="edit-cat-order"
                    type="number"
                    value={categoryFormData.display_order}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-cat-active"
                    checked={categoryFormData.is_active}
                    onCheckedChange={(checked) => setCategoryFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="edit-cat-active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCategoryEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditCategory} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Category Dialog */}
          <Dialog open={isCategoryDeleteDialogOpen} onOpenChange={setIsCategoryDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Category</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCategoryDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteCategory} disabled={isSubmitting}>
                  {isSubmitting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="blog" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-bold">Blog Posts Management</h2>
            <Dialog open={isBlogDialogOpen} onOpenChange={setIsBlogDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Blog Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Blog Post</DialogTitle>
                  <DialogDescription>
                    Create a new blog post for Physiq Insights
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="blog-title">Title</Label>
                      <Input
                        id="blog-title"
                        value={blogFormData.title}
                        onChange={(e) => setBlogFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Blog post title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="blog-slug">Slug</Label>
                      <Input
                        id="blog-slug"
                        value={blogFormData.slug}
                        onChange={(e) => setBlogFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="url-friendly-slug"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="blog-description">Description</Label>
                    <Textarea
                      id="blog-description"
                      value={blogFormData.description}
                      onChange={(e) => setBlogFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Short description for card view"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="blog-author">Author</Label>
                      <Input
                        id="blog-author"
                        value={blogFormData.author}
                        onChange={(e) => setBlogFormData(prev => ({ ...prev, author: e.target.value }))}
                        placeholder="Author name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="blog-date">Published Date</Label>
                      <Input
                        id="blog-date"
                        type="date"
                        value={blogFormData.published_date}
                        onChange={(e) => setBlogFormData(prev => ({ ...prev, published_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="blog-read-time">Read Time (minutes)</Label>
                      <Input
                        id="blog-read-time"
                        type="number"
                        value={blogFormData.read_time_minutes}
                        onChange={(e) => setBlogFormData(prev => ({ ...prev, read_time_minutes: parseInt(e.target.value) || 5 }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="blog-category">Category Tag</Label>
                    <Input
                      id="blog-category"
                      value={blogFormData.category_tag}
                      onChange={(e) => setBlogFormData(prev => ({ ...prev, category_tag: e.target.value }))}
                      placeholder="e.g., Recovery, Training"
                    />
                  </div>

                  {/* Blog Image Section */}
                  <div className="space-y-4">
                    <Label>Blog Image</Label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={blogImageUploadMethod === "url" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBlogImageUploadMethod("url")}
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Image URL
                      </Button>
                      <Button
                        type="button"
                        variant={blogImageUploadMethod === "file" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBlogImageUploadMethod("file")}
                      >
                        <FileImage className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                    </div>

                    {blogImageUploadMethod === "url" && (
                      <Input
                        value={blogFormData.image_url}
                        onChange={(e) => setBlogFormData(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                    )}

                    {blogImageUploadMethod === "file" && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBlogImageUpload}
                          className="hidden"
                          id="blog-image-upload"
                        />
                        <label htmlFor="blog-image-upload" className="cursor-pointer">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {isBlogImageUploading ? "Uploading..." : "Click to upload image"}
                          </p>
                        </label>
                      </div>
                    )}

                    {blogImagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {blogImagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className={`w-full h-24 object-cover rounded border cursor-pointer ${
                                blogFormData.image_url === preview ? 'ring-2 ring-primary' : ''
                              }`}
                              onClick={() => setBlogFormData(prev => ({ ...prev, image_url: preview }))}
                            />
                            {blogFormData.image_url === preview && (
                              <Badge className="absolute top-1 left-1 text-xs">Selected</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="blog-detailed-title">Detailed Title (for full article)</Label>
                    <Input
                      id="blog-detailed-title"
                      value={blogFormData.detailed_title}
                      onChange={(e) => setBlogFormData(prev => ({ ...prev, detailed_title: e.target.value }))}
                      placeholder="Full article title"
                    />
                  </div>

                  {/* Detailed Content Editor */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Detailed Content</Label>
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => addContentBlock('heading', 2)}>
                          Add Heading
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => addContentBlock('paragraph')}>
                          Add Paragraph
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => addContentBlock('key_points')}>
                          Add Key Points
                        </Button>
                      </div>
                    </div>

                    {blogFormData.detailed_content.map((block, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            {block.type === 'heading' ? `Heading H${block.level || 2}` : block.type === 'paragraph' ? 'Paragraph' : 'Key Points'}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeContentBlock(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {block.type === 'heading' && (
                          <Select
                            value={(block.level || 2).toString()}
                            onValueChange={(value) => {
                              const updated = [...blogFormData.detailed_content];
                              updated[index] = { ...block, level: parseInt(value) };
                              setBlogFormData(prev => ({ ...prev, detailed_content: updated }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">H2</SelectItem>
                              <SelectItem value="3">H3</SelectItem>
                              <SelectItem value="4">H4</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        <Textarea
                          value={block.content}
                          onChange={(e) => updateContentBlock(index, e.target.value)}
                          placeholder={
                            block.type === 'heading' ? 'Enter heading text' :
                            block.type === 'key_points' ? 'Enter key points separated by commas' :
                            'Enter paragraph text'
                          }
                          rows={block.type === 'key_points' ? 2 : 4}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="blog-order">Display Order</Label>
                      <Input
                        id="blog-order"
                        type="number"
                        value={blogFormData.display_order}
                        onChange={(e) => setBlogFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <Switch
                        id="blog-active"
                        checked={blogFormData.is_active}
                        onCheckedChange={(checked) => setBlogFormData(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="blog-active">Active</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBlogDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddBlogPost} disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Blog Post"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Blog Posts List */}
          <div className="space-y-4">
            {blogPosts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No blog posts found. Add your first blog post above.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {blogPosts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <img src={post.image_url} alt={post.title} className="w-24 h-24 object-cover rounded" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{post.title}</h3>
                            {post.is_active ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                            <Badge variant="outline">{post.category_tag}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{post.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>By {post.author}</span>
                            <span>{new Date(post.published_date).toLocaleDateString()}</span>
                            <span>{post.read_time_minutes} min read</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openBlogEditDialog(post)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setBlogPostToDelete(post);
                              setIsBlogDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Edit Blog Post Dialog - Similar structure to Add */}
          <Dialog open={isBlogEditDialogOpen} onOpenChange={setIsBlogEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Blog Post</DialogTitle>
                <DialogDescription>Update blog post details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Same form fields as Add dialog */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-blog-title">Title</Label>
                    <Input
                      id="edit-blog-title"
                      value={blogFormData.title}
                      onChange={(e) => setBlogFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-blog-slug">Slug</Label>
                    <Input
                      id="edit-blog-slug"
                      value={blogFormData.slug}
                      onChange={(e) => setBlogFormData(prev => ({ ...prev, slug: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-blog-description">Description</Label>
                  <Textarea
                    id="edit-blog-description"
                    value={blogFormData.description}
                    onChange={(e) => setBlogFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-blog-author">Author</Label>
                    <Input
                      id="edit-blog-author"
                      value={blogFormData.author}
                      onChange={(e) => setBlogFormData(prev => ({ ...prev, author: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-blog-date">Published Date</Label>
                    <Input
                      id="edit-blog-date"
                      type="date"
                      value={blogFormData.published_date}
                      onChange={(e) => setBlogFormData(prev => ({ ...prev, published_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-blog-read-time">Read Time (minutes)</Label>
                    <Input
                      id="edit-blog-read-time"
                      type="number"
                      value={blogFormData.read_time_minutes}
                      onChange={(e) => setBlogFormData(prev => ({ ...prev, read_time_minutes: parseInt(e.target.value) || 5 }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-blog-category">Category Tag</Label>
                  <Input
                    id="edit-blog-category"
                    value={blogFormData.category_tag}
                    onChange={(e) => setBlogFormData(prev => ({ ...prev, category_tag: e.target.value }))}
                  />
                </div>
                {/* Image section - same as add */}
                <div className="space-y-4">
                  <Label>Blog Image</Label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={blogImageUploadMethod === "url" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBlogImageUploadMethod("url")}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Image URL
                    </Button>
                    <Button
                      type="button"
                      variant={blogImageUploadMethod === "file" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBlogImageUploadMethod("file")}
                    >
                      <FileImage className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                  {blogImageUploadMethod === "url" && (
                    <Input
                      value={blogFormData.image_url}
                      onChange={(e) => setBlogFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  )}
                  {blogImageUploadMethod === "file" && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBlogImageUpload}
                        className="hidden"
                        id="edit-blog-image-upload"
                      />
                      <label htmlFor="edit-blog-image-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {isBlogImageUploading ? "Uploading..." : "Click to upload image"}
                        </p>
                      </label>
                    </div>
                  )}
                  {blogImagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {blogImagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className={`w-full h-24 object-cover rounded border cursor-pointer ${
                              blogFormData.image_url === preview ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => setBlogFormData(prev => ({ ...prev, image_url: preview }))}
                          />
                          {blogFormData.image_url === preview && (
                            <Badge className="absolute top-1 left-1 text-xs">Selected</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-blog-detailed-title">Detailed Title</Label>
                  <Input
                    id="edit-blog-detailed-title"
                    value={blogFormData.detailed_title}
                    onChange={(e) => setBlogFormData(prev => ({ ...prev, detailed_title: e.target.value }))}
                  />
                </div>
                {/* Detailed Content Editor - same as add */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Detailed Content</Label>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => addContentBlock('heading', 2)}>
                        Add Heading
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => addContentBlock('paragraph')}>
                        Add Paragraph
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => addContentBlock('key_points')}>
                        Add Key Points
                      </Button>
                    </div>
                  </div>
                  {blogFormData.detailed_content.map((block, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {block.type === 'heading' ? `Heading H${block.level || 2}` : block.type === 'paragraph' ? 'Paragraph' : 'Key Points'}
                        </Badge>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeContentBlock(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {block.type === 'heading' && (
                        <Select
                          value={(block.level || 2).toString()}
                          onValueChange={(value) => {
                            const updated = [...blogFormData.detailed_content];
                            updated[index] = { ...block, level: parseInt(value) };
                            setBlogFormData(prev => ({ ...prev, detailed_content: updated }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">H2</SelectItem>
                            <SelectItem value="3">H3</SelectItem>
                            <SelectItem value="4">H4</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Textarea
                        value={block.content}
                        onChange={(e) => updateContentBlock(index, e.target.value)}
                        placeholder={
                          block.type === 'heading' ? 'Enter heading text' :
                          block.type === 'key_points' ? 'Enter key points separated by commas' :
                          'Enter paragraph text'
                        }
                        rows={block.type === 'key_points' ? 2 : 4}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-blog-order">Display Order</Label>
                    <Input
                      id="edit-blog-order"
                      type="number"
                      value={blogFormData.display_order}
                      onChange={(e) => setBlogFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="edit-blog-active"
                      checked={blogFormData.is_active}
                      onCheckedChange={(checked) => setBlogFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="edit-blog-active">Active</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBlogEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditBlogPost} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Blog Post Dialog */}
          <Dialog open={isBlogDeleteDialogOpen} onOpenChange={setIsBlogDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Blog Post</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{blogPostToDelete?.title}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBlogDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteBlogPost} disabled={isSubmitting}>
                  {isSubmitting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="featured" className="space-y-6">
           <div className="space-y-8">
             <PromotionalBannerManager />
             <HeroCarouselManager />
             <HeroSectionManager />
             <FeaturedProductsManager />
           </div>
         </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <VideoManagement 
              products={products} 
              onVideoUploaded={loadData}
            />
          </TabsContent>

          {/* Coupons Management - simple list/create */}
          <TabsContent value="coupons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Coupons</CardTitle>
                <CardDescription>Create and manage discount coupons</CardDescription>
              </CardHeader>
              <CardContent>
                <CouponsManager />
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
                    <SelectItem value="Pain Relief">
                      Pain Relief
                    </SelectItem>
                    <SelectItem value="Recovery Products">Recovery Products</SelectItem>
                    <SelectItem value="Compression Wear">Compression Wear</SelectItem>
                    <SelectItem value="Warm-up Products">Warm-up Products</SelectItem>
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
                  Enter direct links to images (JPG, PNG, WebP supported). 
                  Hover over uploaded images below to set main and secondary images.
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
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Product preview ${index + 1}`}
                          className="w-full h-24 sm:h-32 object-cover rounded-lg border cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary"
                          onError={(e) => {
                            e.currentTarget.src =
                              "/src/assets/robot-toy-premium.jpg";
                          }}
                        />
                        
                        {/* Selection buttons */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={formData.mainImage === preview ? "default" : "secondary"}
                            onClick={() => setFormData(prev => ({ ...prev, mainImage: preview }))}
                            className="text-xs"
                          >
                            {formData.mainImage === preview ? "✓ Main" : "Set Main"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={formData.secondaryImage === preview ? "default" : "secondary"}
                            onClick={() => setFormData(prev => ({ ...prev, secondaryImage: preview }))}
                            className="text-xs"
                          >
                            {formData.secondaryImage === preview ? "✓ Secondary" : "Set Secondary"}
                          </Button>
                        </div>
                        
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
                  
                  {/* Current Selection Display */}
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-2">Current Selection:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">Main Image:</span>
                        {formData.mainImage ? (
                          <div className="flex items-center gap-2">
                            <img src={formData.mainImage} alt="Main" className="w-8 h-8 object-cover rounded" />
                            <span className="text-xs text-green-600">✓ Selected</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not selected</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">Secondary Image:</span>
                        {formData.secondaryImage ? (
                          <div className="flex items-center gap-2">
                            <img src={formData.secondaryImage} alt="Secondary" className="w-8 h-8 object-cover rounded" />
                            <span className="text-xs text-green-600">✓ Selected</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not selected</span>
                        )}
                      </div>
                    </div>
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
