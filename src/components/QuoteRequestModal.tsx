import { useState } from "react";
import { X, FileText, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { quoteRequestSchema } from "@/lib/validationSchemas";

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle: string;
}

interface QuoteFormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  projectDescription: string;
  timeline: string;
  budget: string;
  requirements: string;
}

const timelines = [
  "ASAP (Rush project)",
  "1-2 months",
  "3-4 months", 
  "5-6 months",
  "6+ months",
  "Flexible"
];

const budgetRanges = [
  "Under $5,000",
  "$5,000 - $15,000",
  "$15,000 - $30,000",
  "$30,000 - $50,000",
  "$50,000 - $100,000",
  "$100,000+"
];

export const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({
  isOpen,
  onClose,
  serviceTitle
}) => {
  const [formData, setFormData] = useState<QuoteFormData>({
    name: "",
    email: "",
    company: "",
    phone: "",
    projectDescription: "",
    timeline: "",
    budget: "",
    requirements: ""
  });

  const handleInputChange = (field: keyof QuoteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate with Zod schema
      const validated = quoteRequestSchema.parse(formData);
      
      toast.success("Quote request submitted successfully! Our team will contact you within 24 hours with a detailed proposal.");
      
      // Reset form and close modal
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        projectDescription: "",
        timeline: "",
        budget: "",
        requirements: ""
      });
      
      onClose();
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Request Quote</h2>
            <p className="text-muted-foreground">Get a custom quote for: {serviceTitle}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  placeholder="Your company"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectDescription">Project Description *</Label>
              <Textarea
                id="projectDescription"
                value={formData.projectDescription}
                onChange={(e) => handleInputChange("projectDescription", e.target.value)}
                placeholder="Describe your project goals, current challenges, and what you're looking to achieve..."
                className="min-h-32"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Timeline</Label>
                <Select 
                  value={formData.timeline} 
                  onValueChange={(value) => handleInputChange("timeline", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {timelines.map((timeline) => (
                      <SelectItem key={timeline} value={timeline}>
                        {timeline}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Budget Range</Label>
                <Select 
                  value={formData.budget} 
                  onValueChange={(value) => handleInputChange("budget", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Specific Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange("requirements", e.target.value)}
                placeholder="Any specific technical requirements, integrations, or constraints we should know about..."
                className="min-h-24"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button type="submit" size="lg" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Submit Quote Request
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};