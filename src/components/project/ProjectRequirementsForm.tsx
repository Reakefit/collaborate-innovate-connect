
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectRequirementsFormProps {
  requiredSkills: string[];
  newSkill: string;
  setNewSkill: (skill: string) => void;
  addSkill: () => void;
  removeSkill: (skill: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  teamSize: number;
  setTeamSize: (size: number) => void;
  errors: Record<string, string>;
}

export const ProjectRequirementsForm: React.FC<ProjectRequirementsFormProps> = ({
  requiredSkills,
  newSkill,
  setNewSkill,
  addSkill,
  removeSkill,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  teamSize,
  setTeamSize,
  errors
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Requirements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Required Skills */}
        <div>
          <label className="block text-sm font-medium mb-1">Required Skills</label>
          <div className="flex">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-2 border border-gray-300 rounded-l"
              placeholder="Add a required skill"
            />
            <button
              type="button"
              onClick={addSkill}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-r"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {requiredSkills.length > 0 ? (
              requiredSkills.map((skill) => (
                <div key={skill} className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center">
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No skills added yet</p>
            )}
          </div>
        </div>
        
        {/* Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full p-2 border rounded ${errors.start_date ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
          </div>
          
          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`w-full p-2 border rounded ${errors.end_date ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
          </div>
        </div>
        
        {/* Team Size */}
        <div>
          <label htmlFor="teamSize" className="block text-sm font-medium mb-1">
            Team Size <span className="text-red-500">*</span>
          </label>
          <input
            id="teamSize"
            type="number"
            min="1"
            value={teamSize}
            onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
            className={`w-full p-2 border rounded ${errors.team_size ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.team_size && <p className="text-red-500 text-sm mt-1">{errors.team_size}</p>}
        </div>
      </CardContent>
    </Card>
  );
};
