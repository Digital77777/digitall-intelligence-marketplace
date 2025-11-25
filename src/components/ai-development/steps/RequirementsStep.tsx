import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AIProjectData } from '../AIDevWizard';
import { X } from 'lucide-react';

const COMMON_TECHNOLOGIES = [
  'TensorFlow',
  'PyTorch',
  'Python',
  'AWS',
  'Google Cloud',
  'Azure',
  'Docker',
  'Kubernetes',
  'OpenAI API',
  'Hugging Face',
  'LangChain',
  'FastAPI',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Elasticsearch',
];

interface RequirementsStepProps {
  data: AIProjectData;
  updateData: (updates: Partial<AIProjectData>) => void;
}

export const RequirementsStep = ({ data, updateData }: RequirementsStepProps) => {
  const toggleTechnology = (tech: string) => {
    const updated = data.technologies.includes(tech)
      ? data.technologies.filter(t => t !== tech)
      : [...data.technologies, tech];
    updateData({ technologies: updated });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="requirements">Technical Requirements</Label>
        <Textarea
          id="requirements"
          value={data.requirements}
          onChange={(e) => updateData({ requirements: e.target.value })}
          placeholder="Describe any specific technical requirements, data sources, integrations, performance expectations, security requirements..."
          className="min-h-[150px]"
        />
        <p className="text-xs text-muted-foreground">
          Include details about data availability, existing systems, compliance needs, etc.
        </p>
      </div>

      <div className="space-y-3">
        <Label>Preferred Technologies</Label>
        <p className="text-xs text-muted-foreground">
          Select technologies you'd like us to use (optional)
        </p>
        <div className="flex flex-wrap gap-2">
          {COMMON_TECHNOLOGIES.map((tech) => (
            <Badge
              key={tech}
              variant={data.technologies.includes(tech) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/80 transition-colors"
              onClick={() => toggleTechnology(tech)}
            >
              {tech}
              {data.technologies.includes(tech) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </div>

      {data.technologies.length > 0 && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-2">Selected Technologies:</p>
          <div className="flex flex-wrap gap-2">
            {data.technologies.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};