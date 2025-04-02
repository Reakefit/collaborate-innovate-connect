
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { ProjectTemplate, CategoryOption } from '@/config/projectConfig';

interface ProjectTemplateCardProps {
  template: ProjectTemplate;
  categories: CategoryOption[];
  onUseTemplate: () => void;
}

export const ProjectTemplateCard: React.FC<ProjectTemplateCardProps> = ({ 
  template, 
  categories,
  onUseTemplate 
}) => {
  const categoryInfo = categories.find(c => c.value === template.category);

  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{template.title}</CardTitle>
            <CardDescription className="mt-2 flex items-center">
              {categoryInfo?.icon}
              <span className="ml-2">{categoryInfo?.label}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Required Skills:</h4>
          <div className="flex flex-wrap gap-2">
            {template.required_skills.map((skill, i) => (
              <span key={i} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Deliverables:</h4>
          <ul className="text-sm text-muted-foreground list-disc pl-5">
            {template.deliverables.slice(0, 3).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
            {template.deliverables.length > 3 && (
              <li>+{template.deliverables.length - 3} more</li>
            )}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="default" 
          className="w-full" 
          onClick={onUseTemplate}
        >
          Use Template <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
