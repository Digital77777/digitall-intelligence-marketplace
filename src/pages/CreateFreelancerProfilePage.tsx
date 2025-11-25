import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Camera, Star, DollarSign, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface FreelancerProfileData {
  name: string;
  title: string;
  bio: string;
  hourlyRate: string;
  experience: string;
  location: string;
  skills: string[];
  languages: string[];
  portfolioItems: Array<{
    title: string;
    description: string;
    url: string;
  }>;
  availability: string;
  profilePicture: string;
}

const experienceLevels = [
  "Entry Level (0-2 years)",
  "Intermediate (2-5 years)",
  "Experienced (5-10 years)",
  "Expert (10+ years)"
];

const availabilityOptions = [
  "Full-time (40+ hrs/week)",
  "Part-time (20-40 hrs/week)",
  "Project-based",
  "Hourly as needed"
];

const CreateFreelancerProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FreelancerProfileData>({
    name: "",
    title: "",
    bio: "",
    hourlyRate: "",
    experience: "",
    location: "",
    skills: [],
    languages: ["English"],
    portfolioItems: [{ title: "", description: "", url: "" }],
    availability: "",
    profilePicture: ""
  });

  const [skillInput, setSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");

  const handleInputChange = (field: keyof FreelancerProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addLanguage = () => {
    if (languageInput.trim() && !formData.languages.includes(languageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, languageInput.trim()]
      }));
      setLanguageInput("");
    }
  };

  const removeLanguage = (language: string) => {
    if (formData.languages.length > 1) {
      setFormData(prev => ({
        ...prev,
        languages: prev.languages.filter(l => l !== language)
      }));
    }
  };

  const addPortfolioItem = () => {
    setFormData(prev => ({
      ...prev,
      portfolioItems: [...prev.portfolioItems, { title: "", description: "", url: "" }]
    }));
  };

  const updatePortfolioItem = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      portfolioItems: prev.portfolioItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removePortfolioItem = (index: number) => {
    if (formData.portfolioItems.length > 1) {
      setFormData(prev => ({
        ...prev,
        portfolioItems: prev.portfolioItems.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to create a profile");
      return;
    }

    // Basic validation
    if (!formData.name || !formData.title || !formData.bio || !formData.hourlyRate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.skills.length < 3) {
      toast.error("Please add at least 3 skills");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('freelancer_profiles')
        .upsert({
          user_id: user.id,
          name: formData.name,
          title: formData.title,
          bio: formData.bio,
          hourly_rate: parseFloat(formData.hourlyRate),
          experience: formData.experience,
          location: formData.location,
          skills: formData.skills,
          languages: formData.languages,
          portfolio_items: formData.portfolioItems,
          availability: formData.availability,
          profile_picture: formData.profilePicture,
          is_active: true
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success("Profile created successfully! You're now visible to potential clients.");
      navigate("/seller-dashboard");
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error(error.message || "Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20">
        <div className="container mx-auto px-6 py-8">
          <Button 
            variant="ghost" 
            className="mb-6 group"
            onClick={() => navigate("/marketplace/freelance-services")}
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Freelance Services
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">Create Your Freelancer Profile</h1>
              <p className="text-muted-foreground">
                Build a compelling profile to attract clients and showcase your AI expertise.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Professional Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="e.g., AI Engineer & Data Scientist"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio *</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell clients about your expertise, experience, and what makes you unique..."
                      className="min-h-32"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly Rate (USD) *</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                        placeholder="50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Experience Level</Label>
                      <Select 
                        value={formData.experience} 
                        onValueChange={(value) => handleInputChange("experience", value)}
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

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Availability</Label>
                    <Select 
                      value={formData.availability} 
                      onValueChange={(value) => handleInputChange("availability", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your availability" />
                      </SelectTrigger>
                      <SelectContent>
                        {availabilityOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Skills & Languages */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Languages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Skills * (Add at least 3)</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="e.g., Python, Machine Learning, TensorFlow"
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
                          {skill} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Languages</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={languageInput}
                        onChange={(e) => setLanguageInput(e.target.value)}
                        placeholder="e.g., Spanish, French, German"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addLanguage();
                          }
                        }}
                      />
                      <Button type="button" onClick={addLanguage} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.languages.map((language) => (
                        <Badge 
                          key={language} 
                          variant="secondary"
                          className={`cursor-pointer ${formData.languages.length > 1 ? 'hover:bg-destructive hover:text-destructive-foreground' : ''}`}
                          onClick={() => removeLanguage(language)}
                        >
                          {language} {formData.languages.length > 1 && '×'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Portfolio Projects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formData.portfolioItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Project {index + 1}</h4>
                        {formData.portfolioItems.length > 1 && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removePortfolioItem(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Project Title</Label>
                          <Input
                            value={item.title}
                            onChange={(e) => updatePortfolioItem(index, "title", e.target.value)}
                            placeholder="e.g., E-commerce Recommendation System"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Project URL</Label>
                          <Input
                            value={item.url}
                            onChange={(e) => updatePortfolioItem(index, "url", e.target.value)}
                            placeholder="https://github.com/yourproject or live demo"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Project Description</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updatePortfolioItem(index, "description", e.target.value)}
                          placeholder="Describe the project, your role, technologies used, and results achieved..."
                          className="min-h-24"
                        />
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="outline" onClick={addPortfolioItem}>
                    Add Another Project
                  </Button>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting}>
                  <Star className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Creating Profile..." : "Create Profile"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate("/marketplace/freelance-services")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFreelancerProfilePage;