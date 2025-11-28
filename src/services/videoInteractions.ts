import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type VideoInteraction = Database['public']['Tables']['product_video_interactions']['Row'];

export interface VideoInteractionData {
  views_count: number;
  likes_count: number;
  shares_count: number;
  user_has_liked?: boolean;
}

export const videoInteractionsService = {
  // Get interactions for a product
  async getProductInteractions(productId: string): Promise<VideoInteractionData> {
    try {
      const { data, error } = await supabase
        .from('product_video_interactions')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No record exists, create one
          return await this.initializeProductInteractions(productId);
        }
        console.error('Error fetching video interactions:', error);
        throw new Error(error.message);
      }

      // Check if user has liked (using localStorage for now, can be enhanced with user auth)
      const userLikes = this.getUserLikes();
      const userHasLiked = userLikes.includes(productId);

      return {
        views_count: data?.views_count || 0,
        likes_count: data?.likes_count || 0,
        shares_count: data?.shares_count || 0,
        user_has_liked: userHasLiked,
      };
    } catch (error) {
      console.error('Error in getProductInteractions:', error);
      return { views_count: 0, likes_count: 0, shares_count: 0, user_has_liked: false };
    }
  },

  // Initialize interactions for a product
  async initializeProductInteractions(productId: string): Promise<VideoInteractionData> {
    try {
      const { data, error } = await supabase
        .from('product_video_interactions')
        .insert({
          product_id: productId,
          views_count: 0,
          likes_count: 0,
          shares_count: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error initializing video interactions:', error);
        throw new Error(error.message);
      }

      return {
        views_count: data.views_count,
        likes_count: data.likes_count,
        shares_count: data.shares_count,
        user_has_liked: false,
      };
    } catch (error) {
      console.error('Error in initializeProductInteractions:', error);
      return { views_count: 0, likes_count: 0, shares_count: 0, user_has_liked: false };
    }
  },

  // Increment views count
  async incrementViews(productId: string): Promise<void> {
    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from('product_video_interactions')
        .select('id, views_count')
        .eq('product_id', productId)
        .single();

      if (existing) {
        // Update existing record
        await supabase
          .from('product_video_interactions')
          .update({ views_count: (existing.views_count || 0) + 1 })
          .eq('product_id', productId);
      } else {
        // Create new record
        await supabase
          .from('product_video_interactions')
          .insert({
            product_id: productId,
            views_count: 1,
            likes_count: 0,
            shares_count: 0,
          });
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  },

  // Increment likes count
  async incrementLikes(productId: string): Promise<VideoInteractionData> {
    try {
      // Check if user has already liked
      const userLikes = this.getUserLikes();
      if (userLikes.includes(productId)) {
        // User already liked, decrement (unlike)
        const { data: existing } = await supabase
          .from('product_video_interactions')
          .select('likes_count')
          .eq('product_id', productId)
          .single();

        if (existing && existing.likes_count > 0) {
          await supabase
            .from('product_video_interactions')
            .update({ likes_count: existing.likes_count - 1 })
            .eq('product_id', productId);
        }

        // Remove from user likes
        this.removeUserLike(productId);
        return await this.getProductInteractions(productId);
      } else {
        // User hasn't liked yet, increment
        const { data: existing } = await supabase
          .from('product_video_interactions')
          .select('id, likes_count')
          .eq('product_id', productId)
          .single();

        if (existing) {
          await supabase
            .from('product_video_interactions')
            .update({ likes_count: (existing.likes_count || 0) + 1 })
            .eq('product_id', productId);
        } else {
          await supabase
            .from('product_video_interactions')
            .insert({
              product_id: productId,
              views_count: 0,
              likes_count: 1,
              shares_count: 0,
            });
        }

        // Add to user likes
        this.addUserLike(productId);
        return await this.getProductInteractions(productId);
      }
    } catch (error) {
      console.error('Error incrementing likes:', error);
      return await this.getProductInteractions(productId);
    }
  },

  // Increment shares count
  async incrementShares(productId: string): Promise<void> {
    try {
      const { data: existing } = await supabase
        .from('product_video_interactions')
        .select('id, shares_count')
        .eq('product_id', productId)
        .single();

      if (existing) {
        await supabase
          .from('product_video_interactions')
          .update({ shares_count: (existing.shares_count || 0) + 1 })
          .eq('product_id', productId);
      } else {
        await supabase
          .from('product_video_interactions')
          .insert({
            product_id: productId,
            views_count: 0,
            likes_count: 0,
            shares_count: 1,
          });
      }
    } catch (error) {
      console.error('Error incrementing shares:', error);
    }
  },

  // Get user's liked videos from localStorage
  getUserLikes(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const likes = localStorage.getItem('video_likes');
      return likes ? JSON.parse(likes) : [];
    } catch {
      return [];
    }
  },

  // Add product to user's liked videos
  addUserLike(productId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const likes = this.getUserLikes();
      if (!likes.includes(productId)) {
        likes.push(productId);
        localStorage.setItem('video_likes', JSON.stringify(likes));
      }
    } catch (error) {
      console.error('Error adding user like:', error);
    }
  },

  // Remove product from user's liked videos
  removeUserLike(productId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const likes = this.getUserLikes();
      const filtered = likes.filter(id => id !== productId);
      localStorage.setItem('video_likes', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing user like:', error);
    }
  },
};
