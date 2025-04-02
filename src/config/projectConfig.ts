
import { ProjectCategory, PaymentModel } from '@/types/database';
import { Code, Briefcase, BarChart3, PenTool } from 'lucide-react';
import React from 'react';

export interface CategoryOption {
  value: ProjectCategory;
  label: string;
  icon: React.ReactNode;
}

export interface PaymentModelOption {
  value: PaymentModel;
  label: string;
}

export interface ProjectTemplate {
  title: string;
  description: string;
  category: ProjectCategory;
  required_skills: string[];
  payment_model: PaymentModel;
  deliverables: string[];
}

export const CATEGORIES: CategoryOption[] = [
  { value: 'web_development', label: 'Web Development', icon: React.createElement(Code, { className: "h-4 w-4" }) },
  { value: 'mobile_development', label: 'Mobile Development', icon: React.createElement(Code, { className: "h-4 w-4" }) },
  { value: 'data_science', label: 'Data Science', icon: React.createElement(BarChart3, { className: "h-4 w-4" }) },
  { value: 'machine_learning', label: 'Machine Learning', icon: React.createElement(BarChart3, { className: "h-4 w-4" }) },
  { value: 'ui_ux_design', label: 'UI/UX Design', icon: React.createElement(PenTool, { className: "h-4 w-4" }) },
  { value: 'devops', label: 'DevOps', icon: React.createElement(Code, { className: "h-4 w-4" }) },
  { value: 'cybersecurity', label: 'Cybersecurity', icon: React.createElement(Code, { className: "h-4 w-4" }) },
  { value: 'blockchain', label: 'Blockchain', icon: React.createElement(Code, { className: "h-4 w-4" }) },
  { value: 'market_research', label: 'Market Research', icon: React.createElement(Briefcase, { className: "h-4 w-4" }) },
  { value: 'other', label: 'Other', icon: React.createElement(Briefcase, { className: "h-4 w-4" }) }
];

export const PAYMENT_MODELS: PaymentModelOption[] = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'stipend', label: 'Stipend' },
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'fixed', label: 'Fixed Amount' }
];

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    title: 'Website Development',
    description: 'Create a responsive website with modern UI/UX design, optimized for all devices.',
    category: 'web_development',
    required_skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    payment_model: 'fixed',
    deliverables: ['Responsive website', 'Source code', 'Documentation']
  },
  {
    title: 'Mobile App Development',
    description: 'Build a cross-platform mobile application with a user-friendly interface.',
    category: 'mobile_development',
    required_skills: ['React Native', 'JavaScript', 'UI/UX Design'],
    payment_model: 'hourly',
    deliverables: ['iOS app', 'Android app', 'Source code', 'User documentation']
  },
  {
    title: 'Data Analysis Project',
    description: 'Analyze data sets to identify trends and provide actionable insights.',
    category: 'data_science',
    required_skills: ['Python', 'SQL', 'Data Visualization', 'Statistics'],
    payment_model: 'stipend',
    deliverables: ['Data analysis report', 'Visualizations', 'Presentation', 'Recommendations']
  },
  {
    title: 'UI/UX Design Project',
    description: 'Design a modern and user-friendly interface for a digital product.',
    category: 'ui_ux_design',
    required_skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
    payment_model: 'fixed',
    deliverables: ['Design mockups', 'Prototypes', 'Design system', 'User flow documentation']
  }
];
