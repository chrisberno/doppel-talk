"use client";

import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";

import {
  Loader2,
  Search,
  Calendar,
  Music,
  Trash2,
  Download,
  Plus,
  Code,
  Share2,
  Edit2,
  X,
  Check,
  Filter,
  Tag,
} from "lucide-react";

import { authClient } from "~/lib/auth-client";

import { useEffect, useState } from "react";

import {
  getUserAudioProjects,
  deleteAudioProject,
  updateAudioProject,
  togglePublicSharing,
} from "~/actions/tts";
import { toast } from "sonner";
import ExportModal from "~/components/export-modal";
import NewProjectDialog from "~/components/projects/new-project-dialog";

import { Card, CardContent } from "~/components/ui/card";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";


interface AudioProject {
  id: string;
  name: string | null;
  text: string;
  audioUrl: string;
  s3Key: string;
  language: string;
  voiceS3Key: string;
  exaggeration: number;
  cfgWeight: number;
  userId: string;
  tags: string[];
  type: string | null;
  department: string | null;
  function: string | null;
  status: string;
  isPublic: boolean;
  publicSlug: string | null;
  publicUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type SortBy = "newest" | "oldest" | "name";

export default function Projects() {
  const [isLoading, setIsLoading] = useState(true);
  const [audioProjects, setAudioProjects] = useState<AudioProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<AudioProject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  // Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  // Editable name state
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>("");

  useEffect(() => {
    const initializeProjects = async () => {
      try {
        // Fetch session and projects in parallel
        const [, projectsResult] = await Promise.all([
          authClient.getSession(),
          getUserAudioProjects(),
        ]);

        // Set audio projects
        if (projectsResult.success && projectsResult.audioProjects) {
          setAudioProjects(projectsResult.audioProjects);
          setFilteredProjects(projectsResult.audioProjects);
        }
      } catch (error) {
        console.error("Audio projects initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeProjects();
  }, []);

  useEffect(() => {
    let filtered = audioProjects.filter((project) => {
      // Search filter
      const matchesSearch =
        project.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.name &&
          project.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        project.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      // Type filter
      const matchesType =
        filterType === "all" ||
        (filterType === "none" && !project.type) ||
        project.type === filterType;

      // Department filter
      const matchesDepartment =
        filterDepartment === "all" ||
        (filterDepartment === "none" && !project.department) ||
        project.department === filterDepartment;

      // Status filter
      const matchesStatus =
        filterStatus === "all" || project.status === filterStatus;

      return (
        matchesSearch && matchesType && matchesDepartment && matchesStatus
      );
    });

    // Sorting
    switch (sortBy) {
      case "newest":
        filtered = filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "oldest":
        filtered = filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      case "name":
        filtered = filtered.sort((a, b) => {
          const nameA = a.name || a.text;
          const nameB = b.name || b.text;
          return nameA.localeCompare(nameB);
        });
        break;
    }

    setFilteredProjects(filtered);
  }, [audioProjects, searchQuery, sortBy, filterType, filterDepartment, filterStatus]);

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this audio project?")) return;

    const result = await deleteAudioProject(projectId);
    if (result.success) {
      setAudioProjects((prev) => prev.filter((p) => p.id !== projectId));
    }
  };

  const handleDownload = (
    audioUrl: string,
    name: string | null,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    window.open(audioUrl, "_blank");
  };

  const handleUpdateName = async (projectId: string, newName: string) => {
    const result = await updateAudioProject(projectId, {
      name: newName.trim() || undefined,
    });
    if (result.success) {
      setAudioProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, name: newName.trim() || null } : p,
        ),
      );
      setEditingNameId(null);
      toast.success("Name updated");
    } else {
      toast.error(result.error || "Failed to update name");
    }
  };

  const refreshProjects = async () => {
    const projectsResult = await getUserAudioProjects();
    if (projectsResult.success && projectsResult.audioProjects) {
      setAudioProjects(projectsResult.audioProjects);
      setFilteredProjects(projectsResult.audioProjects);
    }
  };

  const handleToggleSharing = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const project = audioProjects.find((p) => p.id === projectId);
    if (!project) return;

    const result = await togglePublicSharing(projectId);
    if (result.success) {
      setAudioProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                isPublic: !p.isPublic,
                publicSlug: result.publicSlug || null,
                publicUrl: result.publicUrl || null,
              }
            : p,
        ),
      );
      if (result.publicUrl) {
        toast.success("Project shared! URL copied to clipboard.");
        void navigator.clipboard.writeText(result.publicUrl);
      } else {
        toast.success("Sharing disabled");
      }
    } else {
      toast.error(result.error || "Failed to toggle sharing");
    }
  };

  // Get unique filter values
  const uniqueTypes = Array.from(
    new Set(
      audioProjects
        .map((p) => p.type)
        .filter((t): t is string => typeof t === "string" && t.length > 0),
    ),
  ).sort();
  const uniqueDepartments = Array.from(
    new Set(
      audioProjects
        .map((p) => p.department)
        .filter((d): d is string => typeof d === "string" && d.length > 0),
    ),
  ).sort();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">
            Loading your projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h1 className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
                Your Audio Projects
              </h1>
              <p className="text-muted-foreground text-base">
                Manage and organize all your text-to-speech audio (
                {filteredProjects.length}{" "}
                {filteredProjects.length === 1 ? "audio" : "audios"})
              </p>
            </div>
            <Button
              onClick={() => setNewProjectDialogOpen(true)}
              className="gap-2 self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative max-w-md flex-1">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      placeholder="Search audio projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="border-input bg-background rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="border-input bg-background rounded-md border px-2 py-1.5 text-xs"
                    >
                      <option value="all">All Types</option>
                      <option value="none">No Type</option>
                      {uniqueTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="border-input bg-background rounded-md border px-2 py-1.5 text-xs"
                  >
                    <option value="all">All Departments</option>
                    <option value="none">No Department</option>
                    {uniqueDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border-input bg-background rounded-md border px-2 py-1.5 text-xs"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                  {(filterType !== "all" ||
                    filterDepartment !== "all" ||
                    filterStatus !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterType("all");
                        setFilterDepartment("all");
                        setFilterStatus("all");
                      }}
                      className="h-7 text-xs"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {filteredProjects.length === 0 ? (
            <>
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="relative mb-6">
                    <div className="border-muted bg-muted/20 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed">
                      <Music className="text-muted-foreground h-10 w-10" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">
                    {searchQuery ? "No audio found" : "No audio projects yet"}
                  </h3>

                  <p className="text-muted-foreground mb-6 max-w-md text-sm">
                    {searchQuery
                      ? `No audio matches "${searchQuery}". Try adjusting your search terms.`
                      : "Start creating text-to-speech audio to see them here."}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => setNewProjectDialogOpen(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Your First Project
                    </Button>
                  )}

                  {searchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                      className="gap-2"
                    >
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="group transition-all hover:shadow-md"
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                        <Music className="text-muted-foreground h-8 w-8" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          {editingNameId === project.id ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={editingNameValue}
                                onChange={(e) => setEditingNameValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleUpdateName(project.id, editingNameValue);
                                  }
                                  if (e.key === "Escape") {
                                    setEditingNameId(null);
                                  }
                                }}
                                className="h-7 text-sm"
                                autoFocus
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() =>
                                  handleUpdateName(project.id, editingNameValue)
                                }
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => setEditingNameId(null)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm">
                                {project.name || "Untitled"}
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  setEditingNameId(project.id);
                                  setEditingNameValue(project.name || "");
                                }}
                                title="Edit name"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          {project.isPublic && (
                            <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                              <Share2 className="h-3 w-3" />
                              Public
                            </div>
                          )}
                          {project.type && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 capitalize">
                              {project.type}
                            </span>
                          )}
                          {project.department && (
                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 capitalize">
                              {project.department}
                            </span>
                          )}
                          {project.status !== "active" && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 capitalize">
                              {project.status}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                          {project.text}
                        </p>
                        {project.tags && project.tags.length > 0 && (
                          <div className="mb-2 flex flex-wrap items-center gap-1">
                            {project.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                              >
                                <Tag className="h-3 w-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {project.isPublic && project.publicUrl && (
                          <div className="mb-2 rounded-md bg-green-50 p-2 text-xs">
                            <div className="mb-1 font-semibold text-green-900">
                              Public URL:
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 break-all rounded bg-white px-2 py-1 text-green-800">
                                {project.publicUrl}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void navigator.clipboard.writeText(
                                    project.publicUrl!,
                                  );
                                  toast.success("URL copied to clipboard");
                                }}
                              >
                                Copy
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="text-muted-foreground flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(project.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 capitalize">
                            <Music className="h-3 w-3" />
                            {project.language}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <audio
                          controls
                          className="w-48"
                          style={{ height: "32px" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <source src={project.audioUrl} type="audio/wav" />
                        </audio>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${
                            project.isPublic ? "text-green-600" : ""
                          }`}
                          onClick={(e) => handleToggleSharing(project.id, e)}
                          title={project.isPublic ? "Make private" : "Make public"}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProjectId(project.id);
                            setExportModalOpen(true);
                          }}
                          title="Export for Twilio"
                        >
                          <Code className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) =>
                            handleDownload(project.audioUrl, project.name, e)
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive h-8 w-8 p-0"
                          onClick={(e) => handleDelete(project.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </SignedIn>
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => {
          setExportModalOpen(false);
          setSelectedProjectId(null);
        }}
        projectId={selectedProjectId || undefined}
        projectName={
          selectedProjectId
            ? filteredProjects.find((p) => p.id === selectedProjectId)?.name ||
              filteredProjects.find((p) => p.id === selectedProjectId)?.text.substring(0, 30)
            : undefined
        }
      />
      <NewProjectDialog
        open={newProjectDialogOpen}
        onOpenChange={setNewProjectDialogOpen}
        onProjectCreated={refreshProjects}
      />
    </>
  );
}
