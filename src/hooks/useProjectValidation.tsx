
import { useState } from 'react';
import { ProjectCategory, PaymentModel } from '@/types/database';

export interface ProjectFormData {
  title: string;
  description: string;
  category: ProjectCategory;
  required_skills: string[];
  start_date: string;
  end_date: string;
  team_size: number;
  payment_model: PaymentModel;
  stipend_amount: number | null;
  deliverables: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const useProjectValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateProject = (data: Partial<ProjectFormData>): ValidationResult => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!data.title || data.title.trim() === '') {
      newErrors.title = 'Title is required';
    }

    if (!data.description || data.description.trim() === '') {
      newErrors.description = 'Description is required';
    }

    if (!data.category) {
      newErrors.category = 'Category is required';
    }

    if (!data.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!data.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (data.start_date && data.end_date) {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      if (end < start) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    if (!data.team_size || data.team_size <= 0) {
      newErrors.team_size = 'Team size must be a positive number';
    }

    if (!data.payment_model) {
      newErrors.payment_model = 'Payment model is required';
    }

    // Validate payment model specific fields
    if (data.payment_model === 'stipend' && (!data.stipend_amount || data.stipend_amount <= 0)) {
      newErrors.stipend_amount = 'Stipend amount must be a positive number';
    }

    // Validate deliverables
    if (!data.deliverables || data.deliverables.length === 0) {
      newErrors.deliverables = 'At least one deliverable is required';
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateProject,
    clearErrors
  };
};
