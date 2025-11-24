
import { BookOpen, Clock, Star, Users, ArrowRight, Play, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTier } from "@/contexts/TierContext";
import { SEOHead } from "@/components/SEOHead";

const LearningPaths = () => {
  const navigate = useNavigate();
  const { tierName } = useTier();
  
  const paths = [
    // Tier 1 Paths
    {
      id: "foundation-path",
      title: "AI Basics for Everyone",
      description: "Foundation path covering AI fundamentals, mathematics, Python programming, and industry applications",
      duration: "8-12 weeks",
      level: "Beginner",
      students: 3241,
      rating: 4.9,
      image: "🎓",
      lessons: 20,
      skills: ["AI Fundamentals", "Mathematics", "Python", "Industry Applications"],
      tier: 1,
      tierName: "Starter"
    },
    {
      id: "practical-skills",
      title: "From Zero to Builder",
      description: "Practical AI skills including prompt engineering, AI tools, no-code platforms, and data handling",
      duration: "10-14 weeks",
      level: "Beginner",
      students: 2847,
      rating: 4.8,
      image: "🛠️",
      lessons: 24,
      skills: ["Prompt Engineering", "AI Tools", "No-Code Building", "Data Handling"],
      tier: 1,
      tierName: "Starter"
    },
    // Tier 2 Paths
    {
      id: "ai-product-design",
      title: "Designing Human-Centered AI",
      description: "Learn to design AI apps and tools that people love using with UX principles and human-AI interaction",
      duration: "14-18 weeks",
      level: "Advanced",
      students: 1245,
      rating: 4.9,
      image: "🎨",
      lessons: 28,
      skills: ["AI UX Design", "Conversational Interfaces", "Visual Design", "User Testing"],
      tier: 2,
      tierName: "Creator"
    },
    {
      id: "ai-entrepreneurship",
      title: "From Student to Founder",
      description: "Train to launch and lead AI-driven ventures with startup fundamentals and leadership skills",
      duration: "14-18 weeks",
      level: "Advanced",
      students: 987,
      rating: 4.8,
      image: "💼",
      lessons: 26,
      skills: ["Startup Fundamentals", "Team Leadership", "Pitching", "Business Planning"],
      tier: 2,
      tierName: "Creator"
    },
    {
      id: "applied-ai-industry",
      title: "AI Specialist Tracks",
      description: "Specialize in AI applications for healthcare, finance, or education with industry-specific projects",
      duration: "16-20 weeks",
      level: "Advanced",
      students: 1432,
      rating: 4.7,
      image: "🏥",
      lessons: 32,
      skills: ["Healthcare AI", "Finance AI", "Education AI", "Industry Applications"],
      tier: 2,
      tierName: "Creator"
    },
    {
      id: "responsible-ai",
      title: "Building AI for Good",
      description: "Handle AI bias, safety, and regulation with ethics, fairness, and policy frameworks",
      duration: "12-16 weeks",
      level: "Advanced",
      students: 1156,
      rating: 4.9,
      image: "⚖️",
      lessons: 24,
      skills: ["AI Ethics", "Fairness", "Policy & Regulation", "Responsible Data"],
      tier: 2,
      tierName: "Creator"
    },
    {
      id: "advanced-technical-ai",
      title: "AI Research & Innovation",
      description: "Go beyond using tools into AI research and innovation with advanced ML and cutting-edge research",
      duration: "18-22 weeks",
      level: "Advanced",
      students: 876,
      rating: 4.8,
      image: "🔬",
      lessons: 35,
      skills: ["Advanced ML", "Reinforcement Learning", "LLMs", "Research Methods"],
      tier: 2,
      tierName: "Creator"
    },
    // Tier 3 Paths (existing intermediate paths)
    {
      id: "technical-developer",
      title: "Future AI Engineer",
      description: "Technical development path covering machine learning, deep learning, NLP, and computer vision",
      duration: "16-20 weeks",
      level: "Professional",
      students: 1834,
      rating: 4.7,
      image: "⚡",
      lessons: 30,
      skills: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision"],
      tier: 3,
      tierName: "Career"
    },
    {
      id: "business-careers",
      title: "AI for Work & Startups",
      description: "Business-focused path covering productivity, marketing, product management, and entrepreneurship",
      duration: "12-16 weeks",
      level: "Professional",
      students: 1487,
      rating: 4.8,
      image: "🚀",
      lessons: 25,
      skills: ["Business AI", "Marketing", "Product Management", "Entrepreneurship"],
      tier: 3,
      tierName: "Career"
    }
  ];

  // Determine user's tier level
  const getTierLevel = () => {
    if (tierName === "starter") return 1;
    if (tierName === "creator") return 2;
    if (tierName === "career") return 3;
    return 1; // Default to starter
  };

  const userTierLevel = getTierLevel();
  const accessiblePaths = paths.filter(path => path.tier <= userTierLevel);
  const lockedPaths = paths.filter(path => path.tier > userTierLevel);

  const handleNavigate = (path: typeof paths[0]) => {
    if (path.tier > userTierLevel) {
      navigate("/subscription");
    } else {
      navigate(`/course/${path.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Learning Paths - Structured AI Courses & Journeys"
        description="Comprehensive AI learning paths from beginner to professional. Choose from Foundation, Technical Developer, Business Careers, and Practical Skills tracks."
        keywords={["AI courses", "AI learning path", "AI training", "AI certification", "AI education programs", "machine learning courses"]}
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-ai bg-clip-text text-transparent">
                Learning Paths
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed px-2">
              Structured journeys from complete beginner to AI professional - {tierName === "starter" ? "Starter" : tierName === "creator" ? "Creator & Starter" : "All"} tier paths available
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1 sm:gap-2">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span>{accessiblePaths.reduce((acc, p) => acc + p.lessons, 0)}+ Lessons</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span>{accessiblePaths.reduce((acc, p) => acc + p.students, 0).toLocaleString()}+ Students</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span>4.8 Average Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accessible Learning Paths Grid */}
      {accessiblePaths.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Your Learning Paths</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {accessiblePaths.map((path) => (
                <Card key={path.id} className="group hover:shadow-ai transition-all duration-300 border-border/50">
                  <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{path.image}</div>
                      <Badge variant="secondary" className="text-xs">
                        {path.level}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors">
                      {path.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm sm:text-base">
                      {path.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {path.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{path.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{path.lessons} lessons</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                        <span>{path.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-2">
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{path.students.toLocaleString()} students</span>
                      </div>
                      <Button 
                        className="group/btn w-full sm:w-auto text-sm"
                        onClick={() => handleNavigate(path)}
                      >
                        <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Start Learning
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Locked Learning Paths Grid */}
      {lockedPaths.length > 0 && tierName !== "starter" && (
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center">Upgrade to Unlock More</h2>
            <p className="text-center text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">
              Get access to advanced paths with {lockedPaths[0].tierName} tier or higher
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {lockedPaths.map((path) => (
                <div key={path.id} className="relative">
                  <Card className="group transition-all duration-300 border-border/50 opacity-60">
                    <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{path.image}</div>
                        <Badge variant="secondary" className="text-xs">
                          {path.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg sm:text-xl">
                        {path.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-sm sm:text-base">
                        {path.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {path.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{path.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{path.lessons} lessons</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                          <span>{path.rating}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Lock Overlay */}
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-3 sm:gap-4 p-4 sm:p-6">
                    <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                    <div className="text-center">
                      <p className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">
                        {path.tierName} Tier Required
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                        Upgrade to access this advanced learning path
                      </p>
                      <Button 
                        onClick={() => navigate("/subscription")}
                        className="w-full sm:w-auto text-sm"
                      >
                        Upgrade Now
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to Start Your AI Journey?</h2>
          <p className="text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base px-2">
            Join thousands of students who are already mastering AI and building the future
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-ai text-white hover:opacity-90 w-full sm:w-auto text-sm sm:text-base"
            onClick={() => navigate(lockedPaths.length > 0 ? "/subscription" : "/")}
          >
            {lockedPaths.length > 0 ? "Upgrade Your Plan" : "View Subscription"}
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LearningPaths;