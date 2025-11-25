import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AIProjectData } from '../AIDevWizard';

const PROJECT_TYPES = [
  'Custom AI Models',
  'AI Integration',
  'MLOps & Infrastructure',
  'Computer Vision Solutions',
  'NLP & Chatbots',
  'AI Consulting',
  'Data Science & Analytics',
  'Recommendation Systems',
  'Predictive Analytics',
  'Process Automation',
];

interface ProjectDetailsStepProps {
  data: AIProjectData;
  updateData: (updates: Partial<AIProjectData>) => void;
}

export const ProjectDetailsStep = ({ data, updateData }: ProjectDetailsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="projectName">Project Name *</Label>
        <Input
          id="projectName"
          value={data.projectName}
          onChange={(e) => updateData({ projectName: e.target.value })}
          placeholder="e.g., Customer Churn Prediction Model"
        />
        <p className="text-xs text-muted-foreground">
          Give your project a clear, descriptive name
        </p>
      </div>

      <div className="space-y-2">
        <Label>Project Type *</Label>
        <Select
          value={data.projectType}
          onValueChange={(value) => updateData({ projectType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select project type" />
          </SelectTrigger>
          <SelectContent>
            {PROJECT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choose the category that best fits your project
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Project Description *</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Describe your project goals, the problem you're trying to solve, and expected outcomes..."
          className="min-h-[150px]"
        />
        <p className="text-xs text-muted-foreground">
          Provide a detailed description of what you want to achieve
        </p>
      </div>

      <div className="space-y-2">
        <Label>Target Industry</Label>
        <Select
          value={data.targetIndustry}
          onValueChange={(value) => updateData({ targetIndustry: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select industry (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="finance">Finance & Banking</SelectItem>
            <SelectItem value="ecommerce">E-commerce & Retail</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="entertainment">Entertainment & Media</SelectItem>
            <SelectItem value="logistics">Logistics & Supply Chain</SelectItem>
            <SelectItem value="real_estate">Real Estate</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};