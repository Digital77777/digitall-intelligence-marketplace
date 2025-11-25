import { useState } from "react";
import { Code, Cpu, Database, Zap, Shield, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTier } from "@/contexts/TierContext";
import { AIDevWizard } from "@/components/ai-development/AIDevWizard";
import { AIProjectsDashboard } from "@/components/ai-development/AIProjectsDashboard";
import Navigation from "@/components/Navigation";
import MobileFooter from "@/components/MobileFooter";
import { SEOHead } from "@/components/SEOHead";

const AIDevelopmentPage = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const { tierName } = useTier();
  const canAccess = tierName === 'creator' || tierName === 'career';
  const developmentServices = [
    {
      title: "Custom AI Models",
      description: "Tailored machine learning models for your specific business needs",
      features: ["Model Training", "Fine-tuning", "Optimization", "Deployment"],
      pricing: "$5,000 - $50,000",
      timeline: "4-12 weeks",
      complexity: "Advanced"
    },
    {
      title: "AI Integration",
      description: "Seamlessly integrate AI capabilities into existing systems",
      features: ["API Development", "System Integration", "Data Pipeline", "Testing"],
      pricing: "$3,000 - $25,000",
      timeline: "2-8 weeks",
      complexity: "Intermediate"
    },
    {
      title: "MLOps & Infrastructure",
      description: "Production-ready AI infrastructure and deployment pipelines",
      features: ["Model Deployment", "Monitoring", "Scaling", "CI/CD"],
      pricing: "$8,000 - $75,000",
      timeline: "6-16 weeks",
      complexity: "Expert"
    },
    {
      title: "Computer Vision Solutions",
      description: "Advanced image and video processing AI applications",
      features: ["Object Detection", "Image Classification", "OCR", "Video Analysis"],
      pricing: "$4,000 - $40,000",
      timeline: "3-10 weeks",
      complexity: "Advanced"
    },
    {
      title: "NLP & Chatbots",
      description: "Natural language processing and conversational AI systems",
      features: ["Text Analysis", "Chatbot Development", "Language Models", "API Integration"],
      pricing: "$2,500 - $30,000",
      timeline: "2-8 weeks",
      complexity: "Intermediate"
    },
    {
      title: "AI Consulting",
      description: "Strategic guidance for AI transformation and implementation",
      features: ["Strategy Development", "Technology Assessment", "ROI Analysis", "Implementation Plan"],
      pricing: "$1,500 - $15,000",
      timeline: "1-4 weeks",
      complexity: "Beginner"
    }
  ];

  const technologies = [
    { name: "TensorFlow", category: "Framework" },
    { name: "PyTorch", category: "Framework" },
    { name: "Python", category: "Language" },
    { name: "R", category: "Language" },
    { name: "AWS", category: "Cloud" },
    { name: "Google Cloud", category: "Cloud" },
    { name: "Azure", category: "Cloud" },
    { name: "Docker", category: "DevOps" },
    { name: "Kubernetes", category: "DevOps" },
    { name: "MLflow", category: "MLOps" },
    { name: "Hugging Face", category: "Models" },
    { name: "OpenAI API", category: "API" }
  ];

  const benefits = [
    {
      icon: <Rocket className="h-6 w-6" />,
      title: "Enterprise Ready",
      description: "Production-grade solutions designed for scale and reliability"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Compliant",
      description: "Built with security best practices and compliance requirements"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Fast Delivery",
      description: "Rapid development cycles with proven methodologies"
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Data Excellence",
      description: "Expert data engineering and model optimization"
    }
  ];

  const process = [
    {
      step: "1",
      title: "Discovery & Planning",
      description: "Understand your business needs and define project scope",
      duration: "1-2 weeks"
    },
    {
      step: "2",
      title: "Data Analysis & Design",
      description: "Analyze your data and design the optimal AI solution",
      duration: "1-3 weeks"
    },
    {
      step: "3",
      title: "Development & Training",
      description: "Build, train, and optimize your custom AI models",
      duration: "2-8 weeks"
    },
    {
      step: "4",
      title: "Testing & Deployment",
      description: "Rigorous testing and seamless production deployment",
      duration: "1-2 weeks"
    },
    {
      step: "5",
      title: "Support & Optimization",
      description: "Ongoing monitoring, support, and continuous improvement",
      duration: "Ongoing"
    }
  ];

  const caseStudies = [
    {
      title: "E-commerce Recommendation Engine",
      client: "Fashion Retailer",
      challenge: "Increase conversion rates and personalize shopping experience",
      solution: "Custom recommendation algorithm using collaborative filtering",
      results: ["35% increase in conversion", "42% boost in average order value", "60% improvement in user engagement"],
      tech: ["TensorFlow", "Python", "AWS"]
    },
    {
      title: "Automated Quality Control",
      client: "Manufacturing Company",
      challenge: "Detect product defects in real-time production line",
      solution: "Computer vision system for automated quality inspection",
      results: ["99.2% defect detection accuracy", "50% reduction in manual inspection", "30% cost savings"],
      tech: ["PyTorch", "OpenCV", "Docker"]
    },
    {
      title: "Customer Service Automation",
      client: "Financial Services",
      challenge: "Handle customer inquiries 24/7 with human-like responses",
      solution: "Advanced NLP chatbot with sentiment analysis",
      results: ["80% query resolution rate", "60% reduction in response time", "40% cost reduction"],
      tech: ["Hugging Face", "Python", "Azure"]
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SEOHead
        title="AI Development Services - Custom AI Solutions"
        description="Transform your business with enterprise-grade AI development. From custom models to full-scale AI integration."
        keywords={["AI development", "machine learning", "custom AI", "AI integration"]}
      />
      <Navigation />
      <AIDevWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-20 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-success/10 rounded-full">
              <Code className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">AI Development</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-earn bg-clip-text text-transparent">
                Custom AI Solutions
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Transform your business with enterprise-grade AI development. From custom models to full-scale AI integration, we build solutions that drive real results.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-earn text-white hover:opacity-90" 
                onClick={() => setWizardOpen(true)}
              >
                <Code className="h-5 w-5 mr-2" />
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => {
                document.getElementById('case-studies')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                View Case Studies
              </Button>
            </div>
            {!canAccess && (
              <p className="text-sm text-muted-foreground mt-4">
                Available for Creator and Career tier members
              </p>
            )}
          </div>
        </div>
      </section>

      {/* My Projects Dashboard */}
      <AIProjectsDashboard />

      {/* Development Services */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">AI Development Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive AI development solutions for businesses of all sizes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developmentServices.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <Badge variant={service.complexity === "Expert" ? "default" : service.complexity === "Advanced" ? "secondary" : "outline"}>
                      {service.complexity}
                    </Badge>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Pricing</span>
                      <div className="font-semibold text-success">{service.pricing}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Timeline</span>
                      <div className="font-semibold">{service.timeline}</div>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground mb-2 block">Key Features:</span>
                    <div className="grid grid-cols-2 gap-1">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-success rounded-full" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full">
                    Get Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Technologies We Use</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge tools and frameworks for robust AI development
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {technologies.map((tech, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Cpu className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-medium text-sm">{tech.name}</h4>
                  <p className="text-xs text-muted-foreground">{tech.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our AI Development</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade solutions built with industry best practices
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

      {/* Development Process */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Development Process</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Proven methodology for successful AI project delivery
            </p>
          </div>

          <div className="space-y-8">
            {process.map((step, index) => (
              <div key={index} className="flex items-start gap-6 max-w-4xl mx-auto">
                <div className="w-16 h-16 flex-shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                  {step.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <Badge variant="outline">{step.duration}</Badge>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="case-studies" className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real results from our AI development projects
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">{study.title}</CardTitle>
                  <CardDescription className="font-medium text-primary">{study.client}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Challenge:</h4>
                    <p className="text-sm text-muted-foreground">{study.challenge}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Solution:</h4>
                    <p className="text-sm text-muted-foreground">{study.solution}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Results:</h4>
                    <ul className="space-y-1">
                      {study.results.map((result, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-success rounded-full" />
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Technologies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {study.tech.map((tech, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
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
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
            <p className="text-muted-foreground mb-8">
              Let's discuss how custom AI solutions can drive growth and efficiency for your organization.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-earn text-white hover:opacity-90"
                onClick={() => setWizardOpen(true)}
              >
                <Code className="h-5 w-5 mr-2" />
                Start Your AI Project
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/marketplace/schedule-consultation'}>
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>
      <MobileFooter />
    </div>
  );
};

export default AIDevelopmentPage;