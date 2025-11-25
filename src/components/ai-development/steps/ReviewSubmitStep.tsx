import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIProjectData } from '../AIDevWizard';
import { Code, FileText, DollarSign, Clock, Target, Cpu } from 'lucide-react';

interface ReviewSubmitStepProps {
  data: AIProjectData;
}

export const ReviewSubmitStep = ({ data }: ReviewSubmitStepProps) => {
  const formatBudget = () => {
    if (!data.budgetMin && !data.budgetMax) return 'Not specified';
    if (data.budgetMin && data.budgetMax) {
      return `${data.currency} ${data.budgetMin} - ${data.budgetMax}`;
    }
    if (data.budgetMin) return `${data.currency} ${data.budgetMin}+`;
    return `Up to ${data.currency} ${data.budgetMax}`;
  };

  const getTimelineLabel = (value: string) => {
    const labels: Record<string, string> = {
      urgent: 'Urgent (1-2 weeks)',
      short: 'Short (2-4 weeks)',
      medium: 'Medium (1-2 months)',
      long: 'Long (3-6 months)',
      flexible: 'Flexible',
    };
    return labels[value] || value;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      low: 'outline',
      medium: 'secondary',
      high: 'default',
      critical: 'destructive',
    };
    return (
      <Badge variant={variants[priority] || 'outline'} className="capitalize">
        {priority}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center pb-4 border-b">
        <h3 className="text-lg font-semibold">Review Your Project</h3>
        <p className="text-sm text-muted-foreground">
          Please review the details below before submitting
        </p>
      </div>

      <div className="grid gap-4">
        {/* Project Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Code className="h-4 w-4" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Name:</span>
              <p className="font-medium">{data.projectName}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Type:</span>
              <p className="font-medium">{data.projectType}</p>
            </div>
            {data.targetIndustry && (
              <div>
                <span className="text-sm text-muted-foreground">Industry:</span>
                <p className="font-medium capitalize">{data.targetIndustry.replace('_', ' ')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{data.description}</p>
          </CardContent>
        </Card>

        {/* Requirements & Technologies */}
        {(data.requirements || data.technologies.length > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Technical Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.requirements && (
                <div>
                  <span className="text-sm text-muted-foreground">Requirements:</span>
                  <p className="text-sm">{data.requirements}</p>
                </div>
              )}
              {data.technologies.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-2">Technologies:</span>
                  <div className="flex flex-wrap gap-1">
                    {data.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Budget & Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget & Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Budget:</span>
              <span className="font-medium">{formatBudget()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Timeline:</span>
              <span className="font-medium">{getTimelineLabel(data.timeline)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Priority:</span>
              {getPriorityBadge(data.priority)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
        <p className="text-sm text-center">
          By submitting, you agree to our terms of service. Our team will review your project and contact you within 24-48 hours.
        </p>
      </div>
    </div>
  );
};