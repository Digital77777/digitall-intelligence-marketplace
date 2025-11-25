import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Users, Briefcase, X, Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useAuth } from '@/hooks/useAuth';
import { useTier } from '@/contexts/TierContext';
import { toast } from 'sonner';
interface JobFormData {
  title: string;
  description: string;
  requirements: string;
  category_id: string;
  location: string;
  salary_min: number;
  salary_max: number;
  employment_type: string;
  experience_level: string;
  skills: string[];
  benefits: string;
  application_deadline: string;
  is_remote: boolean;
}

const employmentTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship'
];

const experienceLevels = [
  'Entry Level (0-2 years)',
  'Mid Level (2-5 years)',
  'Senior Level (5-10 years)',
  'Lead/Principal (10+ years)'
];

const CreateJobPostingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canAccessFeature, tierName, loading } = useTier();
  const { categories, createListing } = useMarketplace();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const canPostJobs = canAccessFeature('post_jobs');

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    requirements: '',
    category_id: '',
    location: '',
    salary_min: 0,
    salary_max: 0,
    employment_type: '',
    experience_level: '',
    skills: [],
    benefits: '',
    application_deadline: '',
    is_remote: false
  });

  const handleInputChange = (field: keyof JobFormData, value: string | number | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to post a job');
      navigate('/auth');
      return;
    }

    if (!canPostJobs) {
      toast.error('Please upgrade to Creator or Career tier to post jobs');
      navigate('/subscription');
      return;
    }

    // Validation
    if (!formData.title || !formData.description || !formData.employment_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.salary_min >= formData.salary_max && formData.salary_max > 0) {
      toast.error('Maximum salary must be higher than minimum salary');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create job listing
      await createListing({
        title: formData.title,
        description: formData.description,
        listing_type: 'job',
        category_id: formData.category_id,
        price: formData.salary_max,
        currency: 'USD',
        tags: formData.skills,
        requirements: `${formData.requirements}\n\nEmployment: ${formData.employment_type}\nExperience: ${formData.experience_level}\nSalary: $${formData.salary_min}-$${formData.salary_max}\nLocation: ${formData.location}\nRemote: ${formData.is_remote ? 'Yes' : 'No'}`,
        user_id: user!.id,
        status: 'active'
      });

      toast.success('Job posted successfully! Your job is now live.');
      navigate('/marketplace/my-listings');
    } catch (error) {
      toast.error('Failed to post job. Please try again.');
      console.error('Error posting job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show sign in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 pt-24 pb-12">
          <div className="text-center max-w-md mx-auto">
            <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to post a job on the marketplace.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show upgrade prompt if not Creator or Career tier
  if (!loading && !canPostJobs) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 pt-24 pb-12">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Upgrade to Post Jobs</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Job posting is available for Creator and Career tier members. Upgrade your subscription to connect with talented AI professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/subscription')}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Crown className="h-5 w-5 mr-2" />
                Upgrade Now
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/marketplace')}
              >
                Back to Marketplace
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Current tier: <span className="font-medium capitalize">{tierName || 'Starter'}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 pt-24 pb-12">
        <Button 
          variant="ghost" 
          className="mb-6 group"
          onClick={() => navigate('/marketplace/post-jobs')}
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Job Posting
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Post a New Job</h1>
            <p className="text-muted-foreground">
              Find the perfect AI talent for your team. Create a detailed job posting to attract qualified candidates.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Senior AI Engineer"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category_id} 
                      onValueChange={(value) => handleInputChange('category_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                    className="min-h-32"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements & Qualifications</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    placeholder="List required skills, experience, education, and qualifications..."
                    className="min-h-24"
                  />
                </div>

                {/* Employment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Employment Type *</Label>
                    <Select 
                      value={formData.employment_type} 
                      onValueChange={(value) => handleInputChange('employment_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Select 
                      value={formData.experience_level} 
                      onValueChange={(value) => handleInputChange('experience_level', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Location & Remote */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., San Francisco, CA or Worldwide"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Work Type</Label>
                    <Select 
                      value={formData.is_remote ? 'remote' : 'onsite'} 
                      onValueChange={(value) => handleInputChange('is_remote', value === 'remote')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Salary Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Minimum Salary (Annual USD)</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={formData.salary_min || ''}
                      onChange={(e) => handleInputChange('salary_min', parseInt(e.target.value) || 0)}
                      placeholder="e.g., 80000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Maximum Salary (Annual USD)</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={formData.salary_max || ''}
                      onChange={(e) => handleInputChange('salary_max', parseInt(e.target.value) || 0)}
                      placeholder="e.g., 150000"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <Label>Required Skills</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Type a skill and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <Button type="button" onClick={addSkill} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <Badge 
                        key={skill} 
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Benefits & Deadline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="benefits">Benefits & Perks</Label>
                    <Textarea
                      id="benefits"
                      value={formData.benefits}
                      onChange={(e) => handleInputChange('benefits', e.target.value)}
                      placeholder="Health insurance, remote work, flexible hours, stock options..."
                      className="min-h-20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Application Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.application_deadline}
                      onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Posting Job...
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        Post Job
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg" 
                    onClick={() => navigate('/marketplace/post-jobs')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Pricing Info */}
          <Card className="mt-6 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Job Posting Fee: $299</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your job will be featured for 30 days and reach thousands of qualified AI professionals
                </p>
                <div className="flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>30-day listing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Verified candidates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Global reach</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateJobPostingPage;