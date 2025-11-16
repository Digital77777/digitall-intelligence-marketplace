import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Video, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { consultationSchema } from "@/lib/validationSchemas";

interface ConsultationData {
  name: string;
  email: string;
  company: string;
  phone: string;
  consultationType: string;
  preferredDate: string;
  preferredTime: string;
  alternativeDate: string;
  alternativeTime: string;
  meetingType: string;
  topics: string;
  goals: string;
}

const consultationTypes = [
  "AI Strategy Consultation",
  "Technical Architecture Review",
  "Business Case Development",
  "Technology Assessment",
  "Implementation Planning",
  "General AI Consultation"
];

const meetingTypes = [
  "Video Call (Zoom/Teams)",
  "Phone Call",
  "In-Person Meeting (if location permits)"
];

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"
];

const ScheduleConsultationPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ConsultationData>({
    name: "",
    email: "",
    company: "",
    phone: "",
    consultationType: "",
    preferredDate: "",
    preferredTime: "",
    alternativeDate: "",
    alternativeTime: "",
    meetingType: "Video Call (Zoom/Teams)",
    topics: "",
    goals: ""
  });

  const handleInputChange = (field: keyof ConsultationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate with Zod schema
      const validated = consultationSchema.parse(formData);
      
      toast.success("Consultation scheduled successfully! You'll receive a confirmation email with meeting details.");
      
      // Navigate back
      setTimeout(() => {
        navigate("/ai-tools");
      }, 2000);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const benefits = [
    "Free 30-minute consultation",
    "Expert AI strategy guidance",
    "Custom recommendations for your business",
    "Technical feasibility assessment",
    "No obligation or commitment required"
  ];

  // Get today's date for minimum date selection
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20">
        <div className="container mx-auto px-6 py-8">
          <Button 
            variant="ghost" 
            className="mb-6 group"
            onClick={() => navigate("/ai-tools")}
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to AI Tools
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">Schedule Your AI Consultation</h1>
              <p className="text-xl text-muted-foreground">
                Get expert guidance on your AI initiatives with a free 30-minute consultation.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Consultation Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Book Your Consultation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Consultation Type</Label>
                          <Select 
                            value={formData.consultationType} 
                            onValueChange={(value) => handleInputChange("consultationType", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select consultation type" />
                            </SelectTrigger>
                            <SelectContent>
                              {consultationTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Meeting Type</Label>
                          <Select 
                            value={formData.meetingType} 
                            onValueChange={(value) => handleInputChange("meetingType", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {meetingTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Preferred Meeting Time</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label htmlFor="preferredDate">Preferred Date *</Label>
                            <Input
                              id="preferredDate"
                              type="date"
                              value={formData.preferredDate}
                              onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                              min={today}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Preferred Time *</Label>
                            <Select 
                              value={formData.preferredTime} 
                              onValueChange={(value) => handleInputChange("preferredTime", value)}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <h4 className="font-medium mb-3">Alternative Time (Optional)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="alternativeDate">Alternative Date</Label>
                            <Input
                              id="alternativeDate"
                              type="date"
                              value={formData.alternativeDate}
                              onChange={(e) => handleInputChange("alternativeDate", e.target.value)}
                              min={today}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Alternative Time</Label>
                            <Select 
                              value={formData.alternativeTime} 
                              onValueChange={(value) => handleInputChange("alternativeTime", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="topics">Topics to Discuss</Label>
                        <Textarea
                          id="topics"
                          value={formData.topics}
                          onChange={(e) => handleInputChange("topics", e.target.value)}
                          placeholder="What specific AI topics would you like to discuss? (e.g., machine learning implementation, AI strategy, technical challenges...)"
                          className="min-h-24"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goals">Your Goals</Label>
                        <Textarea
                          id="goals"
                          value={formData.goals}
                          onChange={(e) => handleInputChange("goals", e.target.value)}
                          placeholder="What do you hope to achieve from this consultation? What challenges are you facing?"
                          className="min-h-24"
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full">
                        <Video className="h-4 w-4 mr-2" />
                        Schedule Free Consultation
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* What's Included */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What's Included</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-success rounded-full" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Email</p>
                        <a 
                          href="mailto:digitalintelligencemarketplace@gmail.com"
                          className="text-sm text-primary hover:underline"
                        >
                          digitalintelligencemarketplace@gmail.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Phone</p>
                        <a 
                          href="tel:+27695513572"
                          className="text-sm text-primary hover:underline"
                        >
                          +27 69 551 3572
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Availability Notice */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Our consultation slots are available Monday through Friday, 9 AM to 5 PM (UTC+2). 
                      We'll confirm your appointment within 24 hours.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleConsultationPage;