import { useState, useEffect } from "react";
import { 
  Clock, FileText, CheckCircle, AlertCircle, XCircle, 
  Eye, Trash2, Calendar, DollarSign, Filter, Edit
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { AIDevWizard, EditProjectData } from "./AIDevWizard";

interface AIProject {
  id: string;
  project_name: string;
  project_type: string;
  description: string;
  requirements: string | null;
  budget_min: number | null;
  budget_max: number | null;
  currency: string;
  timeline: string;
  priority: string;
  target_industry: string | null;
  technologies: string[];
  status: string;
  created_at: string;
  submitted_at: string | null;
}

export const AIProjectsDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<AIProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<AIProject | null>(null);
  const [deleteProject, setDeleteProject] = useState<AIProject | null>(null);
  const [editProject, setEditProject] = useState<EditProjectData | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_development_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteProject) return;

    try {
      const { error } = await supabase
        .from('ai_development_projects')
        .delete()
        .eq('id', deleteProject.id);

      if (error) throw error;
      
      setProjects(projects.filter(p => p.id !== deleteProject.id));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setDeleteProject(null);
    }
  };

  const handleEditProject = (project: AIProject) => {
    setEditProject({
      id: project.id,
      project_name: project.project_name,
      project_type: project.project_type,
      description: project.description,
      requirements: project.requirements,
      budget_min: project.budget_min,
      budget_max: project.budget_max,
      currency: project.currency,
      timeline: project.timeline,
      priority: project.priority,
      target_industry: project.target_industry,
      technologies: project.technologies || [],
      status: project.status,
    });
    setWizardOpen(true);
  };

  const handleWizardClose = (open: boolean) => {
    setWizardOpen(open);
    if (!open) {
      setEditProject(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'submitted': return <Clock className="h-4 w-4" />;
      case 'in_review': return <Eye className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      submitted: "secondary",
      in_review: "default",
      approved: "default",
      in_progress: "default",
      completed: "default",
      rejected: "destructive"
    };

    const labels: Record<string, string> = {
      draft: "Draft",
      submitted: "Submitted",
      in_review: "In Review",
      approved: "Approved",
      in_progress: "In Progress",
      completed: "Completed",
      rejected: "Rejected"
    };

    return (
      <Badge variant={variants[status] || "outline"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {labels[status] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-muted text-muted-foreground",
      medium: "bg-warning/10 text-warning",
      high: "bg-destructive/10 text-destructive",
      urgent: "bg-destructive text-destructive-foreground"
    };

    return (
      <Badge className={colors[priority] || colors.medium}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const filteredProjects = statusFilter === "all" 
    ? projects 
    : projects.filter(p => p.status === statusFilter);

  const stats = {
    total: projects.length,
    draft: projects.filter(p => p.status === 'draft').length,
    submitted: projects.filter(p => p.status === 'submitted').length,
    inProgress: projects.filter(p => ['in_review', 'approved', 'in_progress'].includes(p.status)).length,
    completed: projects.filter(p => p.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">My AI Projects</h2>
            <p className="text-muted-foreground">Track and manage your submitted AI development projects</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground">{stats.draft}</div>
              <div className="text-sm text-muted-foreground">Drafts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">{stats.submitted}</div>
              <div className="text-sm text-muted-foreground">Submitted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{project.project_name}</CardTitle>
                    <CardDescription className="mt-1">{project.project_type}</CardDescription>
                  </div>
                  {getStatusBadge(project.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{project.timeline}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {project.budget_min && project.budget_max 
                        ? `${project.currency} ${project.budget_min.toLocaleString()} - ${project.budget_max.toLocaleString()}`
                        : 'TBD'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {getPriorityBadge(project.priority || 'medium')}
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(project.created_at), 'MMM d, yyyy')}
                  </span>
                </div>

                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 3).map((tech, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.technologies.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedProject(project)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {project.status === 'draft' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditProject(project)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setDeleteProject(project)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground">
              {statusFilter === "all" 
                ? "You haven't created any AI projects yet."
                : `No projects with status "${statusFilter}".`}
            </p>
          </div>
        )}
      </div>

      {/* Edit Wizard */}
      <AIDevWizard 
        open={wizardOpen} 
        onOpenChange={handleWizardClose}
        editProject={editProject}
        onProjectUpdated={loadProjects}
      />

      {/* Project Details Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="text-xl">{selectedProject.project_name}</DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedProject.project_type}
                    </DialogDescription>
                  </div>
                  {getStatusBadge(selectedProject.status)}
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
                </div>

                {selectedProject.requirements && (
                  <div>
                    <h4 className="font-medium mb-2">Requirements</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedProject.requirements}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Budget Range</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedProject.budget_min && selectedProject.budget_max 
                        ? `${selectedProject.currency} ${selectedProject.budget_min.toLocaleString()} - ${selectedProject.budget_max.toLocaleString()}`
                        : 'To be determined'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Timeline</h4>
                    <p className="text-sm text-muted-foreground">{selectedProject.timeline}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Priority</h4>
                    {getPriorityBadge(selectedProject.priority || 'medium')}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Industry</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedProject.target_industry || 'Not specified'}
                    </p>
                  </div>
                </div>

                {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech, idx) => (
                        <Badge key={idx} variant="secondary">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                  <span>Created: {format(new Date(selectedProject.created_at), 'PPP')}</span>
                  {selectedProject.submitted_at && (
                    <span>Submitted: {format(new Date(selectedProject.submitted_at), 'PPP')}</span>
                  )}
                </div>

                {selectedProject.status === 'draft' && (
                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        setSelectedProject(null);
                        handleEditProject(selectedProject);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Project
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProject} onOpenChange={() => setDeleteProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProject?.project_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
