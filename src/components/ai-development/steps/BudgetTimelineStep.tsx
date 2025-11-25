import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AIProjectData } from '../AIDevWizard';
import { DollarSign, Clock, AlertCircle } from 'lucide-react';

const TIMELINES = [
  { value: 'urgent', label: 'Urgent (1-2 weeks)', description: 'Rush delivery with priority handling' },
  { value: 'short', label: 'Short (2-4 weeks)', description: 'Quick turnaround for smaller projects' },
  { value: 'medium', label: 'Medium (1-2 months)', description: 'Standard timeline for most projects' },
  { value: 'long', label: 'Long (3-6 months)', description: 'Complex projects requiring thorough development' },
  { value: 'flexible', label: 'Flexible', description: 'No strict deadline' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', description: 'Standard processing' },
  { value: 'medium', label: 'Medium', description: 'Balanced priority' },
  { value: 'high', label: 'High', description: 'Priority handling' },
  { value: 'critical', label: 'Critical', description: 'Highest priority' },
];

interface BudgetTimelineStepProps {
  data: AIProjectData;
  updateData: (updates: Partial<AIProjectData>) => void;
}

export const BudgetTimelineStep = ({ data, updateData }: BudgetTimelineStepProps) => {
  return (
    <div className="space-y-6">
      {/* Budget Range */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <Label className="text-base font-medium">Budget Range</Label>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budgetMin">Minimum Budget</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="budgetMin"
                type="number"
                value={data.budgetMin}
                onChange={(e) => updateData({ budgetMin: e.target.value })}
                placeholder="0"
                className="pl-7"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="budgetMax">Maximum Budget</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="budgetMax"
                type="number"
                value={data.budgetMax}
                onChange={(e) => updateData({ budgetMax: e.target.value })}
                placeholder="0"
                className="pl-7"
              />
            </div>
          </div>
        </div>

        <Select
          value={data.currency}
          onValueChange={(value) => updateData({ currency: value })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD ($)</SelectItem>
            <SelectItem value="EUR">EUR (€)</SelectItem>
            <SelectItem value="GBP">GBP (£)</SelectItem>
            <SelectItem value="ZAR">ZAR (R)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <Label className="text-base font-medium">Project Timeline *</Label>
        </div>
        
        <RadioGroup
          value={data.timeline}
          onValueChange={(value) => updateData({ timeline: value })}
          className="space-y-3"
        >
          {TIMELINES.map((timeline) => (
            <div
              key={timeline.value}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                data.timeline === timeline.value ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value={timeline.value} id={timeline.value} className="mt-0.5" />
              <div className="flex-1">
                <label htmlFor={timeline.value} className="font-medium cursor-pointer">
                  {timeline.label}
                </label>
                <p className="text-sm text-muted-foreground">{timeline.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Priority */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          <Label className="text-base font-medium">Project Priority</Label>
        </div>
        
        <Select
          value={data.priority}
          onValueChange={(value) => updateData({ priority: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>
                <span className="font-medium">{priority.label}</span>
                <span className="text-muted-foreground ml-2">- {priority.description}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};