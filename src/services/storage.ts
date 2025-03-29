import { supabase } from '@/lib/supabase';

export const storageService = {
  async uploadFile(file: File, bucket: string, path: string): Promise<string> {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrl;
  },

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  },

  async uploadResume(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-resume.${fileExt}`;
    const filePath = `resumes/${fileName}`;

    return this.uploadFile(file, 'resumes', filePath);
  },

  async uploadPortfolio(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-portfolio.${fileExt}`;
    const filePath = `portfolios/${fileName}`;

    return this.uploadFile(file, 'portfolios', filePath);
  },

  async uploadProjectFile(projectId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${projectId}-${Date.now()}.${fileExt}`;
    const filePath = `projects/${projectId}/${fileName}`;

    return this.uploadFile(file, 'projects', filePath);
  }
}; 