import { supabase } from '@/lib/supabase';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type Review = Tables['reviews']['Row'];

export const reviewService = {
  async createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProjectReviews(projectId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id (
          id,
          name,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserReviews(userId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id (
          id,
          name,
          avatar_url
        ),
        project:project_id (
          id,
          title
        )
      `)
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateReview(reviewId: string, updates: Partial<Review>): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteReview(reviewId: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
  },

  async calculateUserRating(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', userId);

    if (error) throw error;
    if (!data?.length) return 0;

    const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / data.length) * 10) / 10;
  }
}; 