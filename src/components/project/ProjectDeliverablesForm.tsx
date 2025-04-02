
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectDeliverablesFormProps {
  deliverables: string[];
  newDeliverable: string;
  setNewDeliverable: (deliverable: string) => void;
  addDeliverable: () => void;
  removeDeliverable: (deliverable: string) => void;
  errors: Record<string, string>;
}

export const ProjectDeliverablesForm: React.FC<ProjectDeliverablesFormProps> = ({
  deliverables,
  newDeliverable,
  setNewDeliverable,
  addDeliverable,
  removeDeliverable,
  errors
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDeliverable();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deliverables</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Deliverables <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <input
              type="text"
              value={newDeliverable}
              onChange={(e) => setNewDeliverable(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-2 border border-gray-300 rounded-l"
              placeholder="Add a deliverable"
            />
            <button
              type="button"
              onClick={addDeliverable}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-r"
            >
              Add
            </button>
          </div>
          {errors.deliverables && <p className="text-red-500 text-sm mt-1">{errors.deliverables}</p>}
          <div className="mt-4">
            {deliverables.length === 0 ? (
              <p className="text-gray-500 italic">No deliverables added yet</p>
            ) : (
              <ul className="list-disc pl-5 space-y-2">
                {deliverables.map((deliverable, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-1">{deliverable}</span>
                    <button
                      type="button"
                      onClick={() => removeDeliverable(deliverable)}
                      className="text-red-500 hover:text-red-700 ml-2"
                      aria-label={`Remove ${deliverable}`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
