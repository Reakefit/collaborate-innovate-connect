import { supabase } from '@/lib/supabase';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type Notification = Tables['notifications']['Row'];

export type NotificationType = 
  | 'project_invitation'
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'milestone_completed'
  | 'task_assigned'
  | 'review_received'
  | 'project_completed';

export const notificationService = {
  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);

    if (error) throw error;
  },

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  },

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  async createProjectInvitation(userId: string, projectId: string, projectTitle: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Project Invitation',
      message: `You've been invited to join the project "${projectTitle}"`,
      type: 'project_invitation',
      read: false
    });
  },

  async createApplicationNotification(userId: string, projectId: string, projectTitle: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'New Application',
      message: `A new application has been submitted for the project "${projectTitle}"`,
      type: 'application_received',
      read: false
    });
  },

  async createMilestoneNotification(userId: string, projectId: string, milestoneTitle: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Milestone Completed',
      message: `The milestone "${milestoneTitle}" has been completed`,
      type: 'milestone_completed',
      read: false
    });
  },

  async createTaskNotification(userId: string, projectId: string, taskTitle: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Task Assigned',
      message: `You've been assigned to the task "${taskTitle}"`,
      type: 'task_assigned',
      read: false
    });
  },

  async createReviewNotification(userId: string, projectId: string, projectTitle: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'New Review',
      message: `You've received a new review for the project "${projectTitle}"`,
      type: 'review_received',
      read: false
    });
  }
}; 