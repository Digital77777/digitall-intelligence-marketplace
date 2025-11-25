import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Camera, Star, DollarSign, Briefcase, Loader2 } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load existing profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('freelancer_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setIsEditMode(true);
          
          // Safely parse portfolio items
          let portfolioItems: Array<{ title: string; description: string; url: string }> = 
            [{ title: "", description: "", url: "" }];
          
          if (data.portfolio_items && Array.isArray(data.portfolio_items)) {
            portfolioItems = data.portfolio_items as Array<{ title: string; description: string; url: string }>;
          }
          
          setFormData({
            name: data.name || "",
            title: data.title || "",
            bio: data.bio || "",
            hourlyRate: data.hourly_rate?.toString() || "",
            experience: data.experience || "",
            location: data.location || "",
            skills: data.skills || [],
            languages: data.languages || ["English"],
            portfolioItems: portfolioItems,
            availability: data.availability || "",
            profilePicture: data.profile_picture || ""
          });
          
          if (data.profile_picture) {
            setImagePreview(data.profile_picture);
          }
        }
      } catch (error: any) {
        console.error('Error loading profile:', error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to upload images");
      return;
    }

    setUploadingImage(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('freelancer-profiles')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('freelancer-profiles')
        .getPublicUrl(data.path);

      setFormData(prev => ({ ...prev, profilePicture: publicUrl }));
      toast.success("Profile picture uploaded successfully!");
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || "Failed to upload image");
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
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

      toast.success(isEditMode ? "Profile updated successfully!" : "Profile created successfully! You're now visible to potential clients.");
      navigate("/seller-dashboard");
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20">
        <div className="container mx-auto px-6 py-8">
          <Button 
            variant="ghost" 
            className="mb-6 group"
            onClick={() => navigate(isEditMode ? "/seller-dashboard" : "/marketplace/freelance-services")}
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {isEditMode ? "Back to Dashboard" : "Back to Freelance Services"}
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">
                {isEditMode ? "Edit Your Freelancer Profile" : "Create Your Freelancer Profile"}
              </h1>
              <p className="text-muted-foreground">
                {isEditMode 
                  ? "Update your profile information to keep it current for potential clients." 
                  : "Build a compelling profile to attract clients and showcase your AI expertise."
                }
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
                  {/* Profile Picture Upload */}
                  <div className="flex flex-col items-center gap-4 pb-6 border-b">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
                        {imagePreview || formData.profilePicture ? (
                          <img 
                            src={imagePreview || formData.profilePicture} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-16 h-16 text-muted-foreground" />
                        )}
                      </div>
                      <label 
                        htmlFor="profile-picture-upload" 
                        className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                      >
                        <Camera className="w-5 h-5" />
                        <input
                          id="profile-picture-upload"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Profile Picture</p>
                      <p className="text-xs text-muted-foreground">
                        {uploadingImage ? "Uploading..." : "Click camera icon to upload (Max 5MB)"}
                      </p>
                    </div>
                  </div>

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
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      {isEditMode ? "Update Profile" : "Create Profile"}
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate(isEditMode ? "/seller-dashboard" : "/marketplace/freelance-services")}
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