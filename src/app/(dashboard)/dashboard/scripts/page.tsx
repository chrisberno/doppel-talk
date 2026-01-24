"use client";

import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import {
  FileText,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  Archive,
  MoreVertical,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  createScript,
  updateScript,
  deleteScript,
  getUserScripts,
  updateScriptStatus,
} from "~/actions/scripts";
import { cn } from "~/lib/utils";

interface Script {
  id: string;
  name: string;
  content: string;
  type: string | null;
  department: string | null;
  tags: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const SCRIPT_TYPES = [
  { value: "ivr", label: "IVR" },
  { value: "greeting", label: "Greeting" },
  { value: "announcement", label: "Announcement" },
  { value: "promo", label: "Promo" },
  { value: "voicemail", label: "Voicemail" },
  { value: "broadcast", label: "Broadcast" },
];

const DEPARTMENTS = [
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "hr", label: "HR" },
  { value: "marketing", label: "Marketing" },
];

const STATUS_CONFIG = {
  production: {
    label: "Production",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
  },
  draft: {
    label: "Draft",
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
  },
  archived: {
    label: "Archived",
    icon: Archive,
    color: "text-gray-500",
    bg: "bg-gray-50 border-gray-200",
  },
};

export default function ScriptsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "production" | "draft" | "archived">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formType, setFormType] = useState<string>("");
  const [formDepartment, setFormDepartment] = useState<string>("");
  const [formStatus, setFormStatus] = useState<string>("draft");

  const fetchScripts = async () => {
    const result = await getUserScripts();
    if (result.success) {
      setScripts(result.scripts);
    } else {
      toast.error(result.error ?? "Failed to load scripts");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchScripts();
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormContent("");
    setFormType("");
    setFormDepartment("");
    setFormStatus("draft");
    setEditingScript(null);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (script: Script) => {
    setEditingScript(script);
    setFormName(script.name);
    setFormContent(script.content);
    setFormType(script.type ?? "");
    setFormDepartment(script.department ?? "");
    setFormStatus(script.status);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error("Please enter a script name");
      return;
    }
    if (!formContent.trim()) {
      toast.error("Please enter script content");
      return;
    }

    setIsSaving(true);

    try {
      const input = {
        name: formName,
        content: formContent,
        type: formType || undefined,
        department: formDepartment || undefined,
        status: formStatus,
      };

      const result = editingScript
        ? await updateScript(editingScript.id, input)
        : await createScript(input);

      if (result.success) {
        toast.success(editingScript ? "Script updated" : "Script created");
        setIsDialogOpen(false);
        resetForm();
        await fetchScripts();
      } else {
        toast.error(result.error ?? "Failed to save script");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this script?")) return;

    const result = await deleteScript(id);
    if (result.success) {
      toast.success("Script deleted");
      await fetchScripts();
    } else {
      toast.error(result.error ?? "Failed to delete script");
    }
  };

  const handleStatusChange = async (id: string, newStatus: "draft" | "production" | "archived") => {
    const result = await updateScriptStatus(id, newStatus);
    if (result.success) {
      toast.success(`Script moved to ${newStatus}`);
      await fetchScripts();
    } else {
      toast.error(result.error ?? "Failed to update status");
    }
  };

  const filteredScripts = scripts.filter((script) => {
    if (activeTab === "all") return true;
    return script.status === activeTab;
  });

  const counts = {
    all: scripts.length,
    production: scripts.filter((s) => s.status === "production").length,
    draft: scripts.filter((s) => s.status === "draft").length,
    archived: scripts.filter((s) => s.status === "archived").length,
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <div className="border-b border-gray-200 bg-white py-4">
          <div className="mx-auto max-w-4xl px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold">Script Book</h1>
              </div>
              <Button onClick={openNewDialog} size="sm">
                <Plus className="mr-1 h-4 w-4" />
                New Script
              </Button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your reusable scripts for voice generation
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-6">
          {/* Status Tabs */}
          <div className="mb-6 flex gap-2 border-b">
            {(["all", "production", "draft", "archived"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="ml-1 text-xs text-gray-400">({counts[tab]})</span>
              </button>
            ))}
          </div>

          {/* Scripts List */}
          {filteredScripts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="mb-4 h-12 w-12 text-gray-300" />
                <p className="text-sm text-muted-foreground">
                  {activeTab === "all"
                    ? "No scripts yet. Create your first script!"
                    : `No ${activeTab} scripts`}
                </p>
                {activeTab === "all" && (
                  <Button onClick={openNewDialog} variant="outline" className="mt-4">
                    <Plus className="mr-1 h-4 w-4" />
                    Create Script
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredScripts.map((script) => {
                const statusConfig = STATUS_CONFIG[script.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;
                const StatusIcon = statusConfig.icon;

                return (
                  <Card key={script.id} className={cn("transition-shadow hover:shadow-md", statusConfig.bg)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate">{script.name}</h3>
                            <span className={cn("flex items-center gap-1 text-xs", statusConfig.color)}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{script.content}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {script.type && (
                              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                {SCRIPT_TYPES.find((t) => t.value === script.type)?.label ?? script.type}
                              </span>
                            )}
                            {script.department && (
                              <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                                {DEPARTMENTS.find((d) => d.value === script.department)?.label ?? script.department}
                              </span>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(script)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {script.status !== "production" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(script.id, "production")}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Move to Production
                              </DropdownMenuItem>
                            )}
                            {script.status !== "draft" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(script.id, "draft")}>
                                <Clock className="mr-2 h-4 w-4" />
                                Move to Draft
                              </DropdownMenuItem>
                            )}
                            {script.status !== "archived" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(script.id, "archived")}>
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDelete(script.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingScript ? "Edit Script" : "New Script"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Name *</label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Main IVR Greeting"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Script Content *</label>
                <Textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Thank you for calling..."
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Type</label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCRIPT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Department</label>
                  <Select value={formDepartment} onValueChange={setFormDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dept" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Status</label>
                  <Select value={formStatus} onValueChange={setFormStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingScript ? "Save Changes" : "Create Script"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SignedIn>
    </>
  );
}
