import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <span className="text-[120px] md:text-[180px] font-bold bg-gradient-to-r from-primary via-primary/70 to-primary/40 bg-clip-text text-transparent leading-none">
              404
            </span>
            <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 md:h-16 md:w-16 text-muted-foreground/30" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-2">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <p className="text-sm text-muted-foreground/70 mb-8">
          The page at <code className="bg-muted px-2 py-1 rounded text-xs">{location.pathname}</code> doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default" size="lg">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-10 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Here are some helpful links:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link to="/dashboard" className="text-sm text-primary hover:underline">
              Dashboard
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/ai-tools" className="text-sm text-primary hover:underline">
              AI Tools
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/marketplace" className="text-sm text-primary hover:underline">
              Marketplace
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/support" className="text-sm text-primary hover:underline">
              Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
