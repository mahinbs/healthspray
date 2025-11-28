import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert'];
type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update'];

export interface AdminBlogPost extends BlogPost {
  // Additional admin-specific fields if needed
}

export interface BlogContentBlock {
  type: 'heading' | 'paragraph' | 'key_points';
  content: string;
  level?: number; // For headings (h2, h3, etc.)
}

export const blogService = {
  // Fetch all active blog posts for public display
  async getActiveBlogPosts(): Promise<AdminBlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('published_date', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveBlogPosts:', error);
      throw error;
    }
  },

  // Fetch all blog posts (for admin)
  async getAllBlogPosts(): Promise<AdminBlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('display_order', { ascending: true })
        .order('published_date', { ascending: false });

      if (error) {
        console.error('Error fetching all blog posts:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllBlogPosts:', error);
      throw error;
    }
  },

  // Fetch a single blog post by slug
  async getBlogPostBySlug(slug: string): Promise<AdminBlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching blog post:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error in getBlogPostBySlug:', error);
      throw error;
    }
  },

  // Add a new blog post
  async addBlogPost(blogPost: Omit<BlogPostInsert, 'id' | 'created_at' | 'updated_at'>): Promise<AdminBlogPost> {
    try {
      const now = new Date().toISOString();
      const newBlogPost: BlogPostInsert = {
        ...blogPost,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('blog_posts')
        .insert(newBlogPost)
        .select()
        .single();

      if (error) {
        console.error('Error adding blog post:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error in addBlogPost:', error);
      throw error;
    }
  },

  // Update an existing blog post
  async updateBlogPost(id: string, updates: Partial<BlogPostUpdate>): Promise<AdminBlogPost> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating blog post:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error in updateBlogPost:', error);
      throw error;
    }
  },

  // Delete a blog post
  async deleteBlogPost(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting blog post:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error in deleteBlogPost:', error);
      throw error;
    }
  },
};
