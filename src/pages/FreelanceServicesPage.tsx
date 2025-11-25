
import { Briefcase, Clock, Star, TrendingUp, Users, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FreelanceServicesPage = () => {
  const navigate = useNavigate();
  const serviceCategories = [
    {
      title: "AI Consulting",
      description: "Strategic AI implementation guidance for businesses",
      avgRate: "$100-300/hr",
      demand: "Very High",
      skills: ["Strategy", "Implementation", "ROI Analysis"]
    },
    {
      title: "Machine Learning Development",
      description: "Custom ML models and algorithm development",
      avgRate: "$80-200/hr",
      demand: "High",
      skills: ["Python", "TensorFlow", "PyTorch"]
    },
    {
      title: "AI Content Creation",
      description: "AI-powered content writing and optimization",
      avgRate: "$50-150/hr",
      demand: "High",
      skills: ["GPT Prompting", "Content Strategy", "SEO"]
    },
    {
      title: "Computer Vision",
      description: "Image recognition and visual AI solutions",
      avgRate: "$90-250/hr",
      demand: "High",
      skills: ["OpenCV", "Deep Learning", "Image Processing"]
    },
    {
      title: "NLP & Chatbots",
      description: "Natural language processing and conversational AI",
      avgRate: "$70-180/hr",
      demand: "Medium",
      skills: ["NLP", "Chatbot Development", "API Integration"]
    },
    {
      title: "AI Training & Education",
      description: "Corporate training and AI skill development",
      avgRate: "$60-200/hr",
      demand: "Medium",
      skills: ["Teaching", "Curriculum Design", "Workshop Delivery"]
    }
  ];

  const benefits = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Flexible Hours",
      description: "Work on your schedule with clients worldwide"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Premium Rates",
      description: "AI expertise commands top market rates"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Quality Clients",
      description: "Connect with serious businesses needing AI solutions"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Payments",
      description: "Protected escrow system for all transactions"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Create Profile",
      description: "Showcase your AI expertise and portfolio"
    },
    {
      number: "2",
      title: "Set Your Rates",
      description: "Define hourly rates and service packages"
    },
    {
      number: "3",
      title: "Find Projects",
      description: "Browse and apply to relevant opportunities"
    },
    {
      number: "4",
      title: "Deliver Excellence",
      description: "Complete projects and build your reputation"
    }
  ];

  const topFreelancers = [
    {
      name: "Dr. Emily Watson",
      specialty: "AI Strategy Consulting",
      rating: 4.9,
      projects: 156,
      hourlyRate: "$250/hr"
    },
    {
      name: "Marcus Kim",
      specialty: "ML Engineering",
      rating: 4.8,
      projects: 203,
      hourlyRate: "$180/hr"
    },
    {
      name: "Sofia Rodriguez",
      specialty: "Computer Vision",
      rating: 4.9,
      projects: 89,
      hourlyRate: "$220/hr"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-20 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-success/10 rounded-full">
              <Briefcase className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">Freelance Services</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-earn bg-clip-text text-transparent">
                Sell Your AI Expertise
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Join the world's largest marketplace for AI freelancers. Set your rates, choose your projects, and build a thriving consultancy business.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-earn text-white hover:opacity-90" onClick={() => navigate('/marketplace/create-freelancer-profile')}>
                <Briefcase className="h-5 w-5 mr-2" />
                Start Freelancing
              </Button>
              <Button size="lg" variant="outline">
                View Opportunities
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular AI Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore high-demand AI freelance categories and their earning potential
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <Badge variant={category.demand === "Very High" ? "default" : category.demand === "High" ? "secondary" : "outline"}>
                      {category.demand}
                    </Badge>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Rate</span>
                    <span className="font-semibold text-success">{category.avgRate}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground mb-2 block">Key Skills:</span>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    View Projects
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Freelance With Us?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Build a successful AI consultancy with our platform's advantages
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple steps to start your AI freelancing journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Freelancers */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Top AI Freelancers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See what successful AI freelancers are earning on our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topFreelancers.map((freelancer, index) => (
              <Card key={index} className="border-success/20">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-earn flex items-center justify-center text-white font-bold text-lg">
                    {freelancer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="font-semibold mb-1">{freelancer.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{freelancer.specialty}</p>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{freelancer.rating}</span>
                    <span className="text-sm text-muted-foreground">({freelancer.projects} projects)</span>
                  </div>
                  <div className="text-lg font-bold text-success">{freelancer.hourlyRate}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Freelancing?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of AI experts building successful freelance careers on our platform.
            </p>
            <Button size="lg" className="bg-gradient-earn text-white hover:opacity-90" onClick={() => navigate('/marketplace/create-freelancer-profile')}>
              <Briefcase className="h-5 w-5 mr-2" />
              Create Freelancer Profile
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FreelanceServicesPage;