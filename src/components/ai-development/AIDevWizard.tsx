import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTier } from '@/contexts/TierContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check, Loader2, Save } from 'lucide-react';
import { ProjectDetailsStep } from './steps/ProjectDetailsStep';
import { RequirementsStep } from './steps/RequirementsStep';
import { BudgetTimelineStep } from './steps/BudgetTimelineStep';
import { ReviewSubmitStep } from './steps/ReviewSubmitStep';

export interface AIProjectData {
  projectName: string;
  projectType: string;
  description: string;
  requirements: string;
  budgetMin: string;
  budgetMax: string;
  currency: string;
  timeline: string;
  priority: string;
  targetIndustry: string;
  technologies: string[];
}

export interface EditProjectData {
  id: string;
  project_name: string;
  project_type: string;
  description: string;
  requirements: string | null;
  budget_min: number | null;
  budget_max: number | null;
  currency: string;
  timeline: string;
  priority: string;
  target_industry: string | null;
  technologies: string[];
  status: string;
}

const INITIAL_DATA: AIProjectData = {
  projectName: '',
  projectType: '',
  description: '',
  requirements: '',
  budgetMin: '',
  budgetMax: '',
  currency: 'USD',
  timeline: '',
  priority: 'medium',
  targetIndustry: '',
  technologies: [],
};

const STEPS = [
  { id: 1, title: 'Project Details', description: 'Basic information about your project' },
  { id: 2, title: 'Requirements', description: 'Technical requirements and specifications' },
  { id: 3, title: 'Budget & Timeline', description: 'Financial and time constraints' },
  { id: 4, title: 'Review & Submit', description: 'Review and submit your project' },
];

interface AIDevWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editProject?: EditProjectData | null;
  onProjectUpdated?: () => void;
}

export const AIDevWizard = ({ open, onOpenChange, editProject, onProjectUpdated }: AIDevWizardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tierName, canAccessFeature } = useTier();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AIProjectData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const isEditing = !!editProject;
  const canAccess = tierName === 'creator' || tierName === 'career' || canAccessFeature('marketplace_sell');

  // Populate form when editing
  useEffect(() => {
    if (editProject && open) {
      setFormData({
        projectName: editProject.project_name,
        projectType: editProject.project_type,
        description: editProject.description,
        requirements: editProject.requirements || '',
        budgetMin: editProject.budget_min?.toString() || '',
        budgetMax: editProject.budget_max?.toString() || '',
        currency: editProject.currency || 'USD',
        timeline: editProject.timeline,
        priority: editProject.priority || 'medium',
        targetIndustry: editProject.target_industry || '',
        technologies: editProject.technologies || [],
      });
    } else if (!open) {
      setFormData(INITIAL_DATA);
      setCurrentStep(1);
    }
  }, [editProject, open]);

  const updateFormData = (updates: Partial<AIProjectData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.projectName && formData.projectType && formData.description);
      case 2:
        return true; // Requirements are optional
      case 3:
        return !!(formData.timeline);
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getProjectPayload = () => ({
    project_name: formData.projectName,
    project_type: formData.projectType,
    description: formData.description,
    requirements: formData.requirements || null,
    budget_min: formData.budgetMin ? parseFloat(formData.budgetMin) : null,
    budget_max: formData.budgetMax ? parseFloat(formData.budgetMax) : null,
    currency: formData.currency,
    timeline: formData.timeline,
    priority: formData.priority,
    target_industry: formData.targetIndustry || null,
    technologies: formData.technologies,
  });

  const handleSaveDraft = async () => {
    if (!user) {
      toast.error('Please sign in to save a draft');
      return;
    }

    if (!formData.projectName) {
      toast.error('Please enter a project name to save as draft');
      return;
    }

    setIsSavingDraft(true);

    try {
      const payload = getProjectPayload();

      if (isEditing && editProject) {
        const { error } = await supabase
          .from('ai_development_projects')
          .update({
            ...payload,
            status: 'draft',
          })
          .eq('id', editProject.id);

        if (error) throw error;
        toast.success('Draft updated successfully!');
      } else {
        const { error } = await supabase
          .from('ai_development_projects')
          .insert({
            ...payload,
            user_id: user.id,
            status: 'draft',
          });

        if (error) throw error;
        toast.success('Draft saved successfully!');
      }

      onProjectUpdated?.();
      handleClose();
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft. Please try again.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to submit a project');
      return;
    }

    if (!canAccess) {
      toast.error('Upgrade to Creator or Career tier to submit AI projects');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = getProjectPayload();

      if (isEditing && editProject) {
        const { error } = await supabase
          .from('ai_development_projects')
          .update({
            ...payload,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
          })
          .eq('id', editProject.id);

        if (error) throw error;
        toast.success('AI Development project updated and submitted!');
      } else {
        const { error } = await supabase
          .from('ai_development_projects')
          .insert({
            ...payload,
            user_id: user.id,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
          });

        if (error) throw error;
        toast.success('AI Development project submitted successfully!');
      }

      onProjectUpdated?.();
      handleClose();
      navigate('/seller-dashboard');
    } catch (error) {
      console.error('Error submitting project:', error);
      toast.error('Failed to submit project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(1);
    setFormData(INITIAL_DATA);
  };

  const progress = (currentStep / STEPS.length) * 100;

  if (!canAccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade Required</DialogTitle>
            <DialogDescription>
              AI Development services are available for Creator and Career tier members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              Upgrade your subscription to access custom AI development services and start building your AI-powered solutions.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => navigate('/subscription')}>
                View Plans
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit AI Development Project' : 'Start AI Development Project'}
          </DialogTitle>
          <DialogDescription>
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {STEPS.map((step) => (
                <span
                  key={step.id}
                  className={currentStep >= step.id ? 'text-primary font-medium' : ''}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {currentStep === 1 && (
              <ProjectDetailsStep data={formData} updateData={updateFormData} />
            )}
            {currentStep === 2 && (
              <RequirementsStep data={formData} updateData={updateFormData} />
            )}
            {currentStep === 3 && (
              <BudgetTimelineStep data={formData} updateData={updateFormData} />
            )}
            {currentStep === 4 && (
              <ReviewSubmitStep data={formData} />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting || isSavingDraft}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentStep === STEPS.length && (
                <Button
                  variant="ghost"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting || isSavingDraft || !formData.projectName}
                >
                  {isSavingDraft ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </>
                  )}
                </Button>
              )}
            </div>

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext} disabled={!validateStep(currentStep)}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting || isSavingDraft}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update & Submit' : 'Submit Project'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
