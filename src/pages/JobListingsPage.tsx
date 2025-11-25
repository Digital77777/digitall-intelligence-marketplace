import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Users, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useAuth } from '@/hooks/useAuth';
import { JobApplicationModal } from '@/components/marketplace/JobApplicationModal';

const JobListingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { listings, loading } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  // Filter only job listings
  const jobListings = listings.filter(listing => listing.listing_type === 'job');

  // Apply search and filters
  const filteredJobs = jobListings.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.tags && job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const requirements = job.requirements || '';
    const matchesEmployment = employmentFilter === 'all' || 
      requirements.toLowerCase().includes(employmentFilter.toLowerCase());
    
    return matchesSearch && matchesEmployment;
  });

  const parseJobDetails = (requirements: string | null) => {
    if (!requirements) return {};
    const lines = requirements.split('\n');
    const details: Record<string, string> = {};
    lines.forEach(line => {
      const [key, value] = line.split(':').map(s => s.trim());
      if (key && value) {
        details[key.toLowerCase()] = value;
      }
    });
    return details;
  };

  const handleApply = (job: any) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setSelectedJob(job);
    setIsApplicationModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 pt-24 pb-12">
        <Button 
          variant="ghost" 
          className="mb-6 group"
          onClick={() => navigate('/marketplace')}
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Marketplace
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Job Opportunities</h1>
          <p className="text-muted-foreground">
            Browse and apply to AI-related job opportunities from top companies
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, skills, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={employmentFilter} onValueChange={setEmploymentFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Employment Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || employmentFilter !== 'all' 
                  ? "Try adjusting your search or filters"
                  : "No job opportunities have been posted yet"}
              </p>
              {user && (
                <Button onClick={() => navigate('/marketplace/post-jobs')}>
                  Post a Job
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredJobs.map((job) => {
              const details = parseJobDetails(job.requirements);
              const isOwnJob = user?.id === job.user_id;
              
              return (
                <Card key={job.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          {details.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {details.location}
                            </span>
                          )}
                          {details.employment && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {details.employment}
                            </span>
                          )}
                          {details.salary && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {details.salary}
                            </span>
                          )}
                          {details.remote && (
                            <Badge variant="secondary" className="text-xs">
                              {details.remote === 'Yes' ? 'Remote' : 'On-site'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleApply(job)}
                        disabled={isOwnJob}
                        className={isOwnJob ? 'opacity-50' : ''}
                      >
                        {isOwnJob ? 'Your Job' : 'Apply Now'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3 mb-4">
                      {job.description}
                    </CardDescription>
                    
                    {job.tags && job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.tags.slice(0, 6).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {job.tags.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.tags.length - 6} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </span>
                      {details.experience && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {details.experience}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Application Modal */}
      {selectedJob && (
        <JobApplicationModal
          isOpen={isApplicationModalOpen}
          onClose={() => {
            setIsApplicationModalOpen(false);
            setSelectedJob(null);
          }}
          jobListing={selectedJob}
        />
      )}
    </div>
  );
};

export default JobListingsPage;
