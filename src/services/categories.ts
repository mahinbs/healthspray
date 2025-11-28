import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export interface AdminCategory extends Category {
  // Additional admin-specific fields if needed
}

export const categoriesService = {
  // Fetch all active categories for public display
  async getActiveCategories(): Promise<AdminCategory[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveCategories:', error);
      throw error;
    }
  },

  // Fetch all categories (for admin)
  async getAllCategories(): Promise<AdminCategory[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching all categories:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      throw error;
    }
  },

  // Add a new category
  async addCategory(category: Omit<CategoryInsert, 'id' | 'created_at' | 'updated_at'>): Promise<AdminCategory> {
    try {
      const now = new Date().toISOString();
      const newCategory: CategoryInsert = {
        ...category,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('categories')
        .insert(newCategory)
        .select()
        .single();

      if (error) {
        console.error('Error adding category:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error in addCategory:', error);
      throw error;
    }
  },

  // Update an existing category
  async updateCategory(id: string, updates: Partial<CategoryUpdate>): Promise<AdminCategory> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error in updateCategory:', error);
      throw error;
    }
  },

  // Delete a category
  async deleteCategory(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      throw error;
    }
  },
};
