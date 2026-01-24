"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Loader2,
  Mic,
  FileText,
  Sparkles,
  Play,
  Pause,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { voiceAgents, type VoiceAgent } from "~/data/voice-agents";
import { getUserUploadedVoices } from "~/actions/voice-upload";
import { getUserScripts } from "~/actions/scripts";
import { generateSpeech } from "~/actions/tts";
import { cn } from "~/lib/utils";

interface UploadedVoice {
  id: string;
  name: string;
  s3Key: string;
  url: string;
}

interface Script {
  id: string;
  name: string;
  content: string;
  status: string;
}

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

type VoiceSource = "clone" | "agent";
type TextSource = "script" | "quick";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
  { code: "ko", name: "Korean" },
  { code: "hi", name: "Hindi" },
];

export default function NewProjectDialog({
  open,
  onOpenChange,
  onProjectCreated,
}: NewProjectDialogProps) {
  // Data loading
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [clones, setClones] = useState<UploadedVoice[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);

  // Voice selection
  const [voiceSource, setVoiceSource] = useState<VoiceSource>("agent");
  const [selectedCloneId, setSelectedCloneId] = useState<string>("");
  const [selectedAgentId, setSelectedAgentId] = useState<string>(voiceAgents[0]?.id ?? "");

  // Text selection
  const [textSource, setTextSource] = useState<TextSource>("quick");
  const [selectedScriptId, setSelectedScriptId] = useState<string>("");
  const [quickText, setQuickText] = useState("");

  // Settings
  const [language, setLanguage] = useState("en");
  const [projectName, setProjectName] = useState("");

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      loadData();
    } else {
      // Reset state when dialog closes
      resetState();
    }
  }, [open]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const [voicesResult, scriptsResult] = await Promise.all([
        getUserUploadedVoices(),
        getUserScripts("production"), // Only production scripts for assembly
      ]);

      if (voicesResult.success) {
        setClones(voicesResult.voices);
        if (voicesResult.voices.length > 0 && !selectedCloneId) {
          setSelectedCloneId(voicesResult.voices[0]?.id ?? "");
        }
      }

      if (scriptsResult.success) {
        setScripts(scriptsResult.scripts);
        if (scriptsResult.scripts.length > 0 && !selectedScriptId) {
          setSelectedScriptId(scriptsResult.scripts[0]?.id ?? "");
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const resetState = () => {
    setVoiceSource("agent");
    setSelectedAgentId(voiceAgents[0]?.id ?? "");
    setSelectedCloneId("");
    setTextSource("quick");
    setSelectedScriptId("");
    setQuickText("");
    setLanguage("en");
    setProjectName("");
    setGeneratedAudioUrl(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // Get the actual text content
  const getTextContent = (): string => {
    if (textSource === "script") {
      const script = scripts.find((s) => s.id === selectedScriptId);
      return script?.content ?? "";
    }
    return quickText;
  };

  // Get the voice S3 key
  const getVoiceS3Key = (): string => {
    if (voiceSource === "clone") {
      const clone = clones.find((c) => c.id === selectedCloneId);
      return clone?.s3Key ?? "";
    }
    // For agents, map to the S3 key format
    const agent = voiceAgents.find((a) => a.id === selectedAgentId);
    if (agent) {
      // Convert audioUrl to S3 key (remove leading slash)
      return agent.audioUrl.startsWith("/")
        ? `samples/voices${agent.audioUrl.substring(6)}`
        : agent.audioUrl;
    }
    return "samples/voices/polly-matthew-neural.mp3";
  };

  const handleGenerate = async () => {
    const text = getTextContent();
    if (!text.trim()) {
      toast.error("Please enter or select text for the project");
      return;
    }

    const voiceS3Key = getVoiceS3Key();
    if (!voiceS3Key) {
      toast.error("Please select a voice");
      return;
    }

    setIsGenerating(true);
    setGeneratedAudioUrl(null);

    try {
      const result = await generateSpeech({
        text: text.trim(),
        voice_S3_key: voiceS3Key,
        language,
        exaggeration: 0.5,
        cfg_weight: 0.5,
        provider: "chatterbox",
        name: projectName || undefined,
      });

      if (!result.success || !result.audioUrl) {
        throw new Error(result.error ?? "Generation failed");
      }

      setGeneratedAudioUrl(result.audioUrl);
      toast.success("Audio generated!");

      // Auto-play preview
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.play().catch(console.error);
          setIsPlaying(true);
        }
      }, 100);
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleSaveAndClose = () => {
    onProjectCreated();
    onOpenChange(false);
  };

  const selectedAgent = voiceAgents.find((a) => a.id === selectedAgentId);
  const selectedClone = clones.find((c) => c.id === selectedCloneId);
  const selectedScript = scripts.find((s) => s.id === selectedScriptId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Project Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Project Name (optional)
              </label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Main IVR Welcome"
              />
            </div>

            {/* Voice Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Select Voice
              </label>
              <div className="mb-3 flex gap-2">
                <Button
                  variant={voiceSource === "agent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVoiceSource("agent")}
                  className="flex-1"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Professional Agent
                </Button>
                <Button
                  variant={voiceSource === "clone" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVoiceSource("clone")}
                  className="flex-1"
                  disabled={clones.length === 0}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  My Clone {clones.length === 0 && "(none)"}
                </Button>
              </div>

              {voiceSource === "agent" ? (
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} - {agent.language} ({agent.accent})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={selectedCloneId} onValueChange={setSelectedCloneId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a clone" />
                  </SelectTrigger>
                  <SelectContent>
                    {clones.map((clone) => (
                      <SelectItem key={clone.id} value={clone.id}>
                        {clone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Voice preview info */}
              {voiceSource === "agent" && selectedAgent && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {selectedAgent.tags.join(", ")}
                </p>
              )}
            </div>

            {/* Text Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Script / Text
              </label>
              <div className="mb-3 flex gap-2">
                <Button
                  variant={textSource === "quick" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTextSource("quick")}
                  className="flex-1"
                >
                  Quick Text
                </Button>
                <Button
                  variant={textSource === "script" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTextSource("script")}
                  className="flex-1"
                  disabled={scripts.length === 0}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  From Script Book {scripts.length === 0 && "(none)"}
                </Button>
              </div>

              {textSource === "quick" ? (
                <Textarea
                  value={quickText}
                  onChange={(e) => setQuickText(e.target.value)}
                  placeholder="Enter the text you want to convert to speech..."
                  rows={4}
                />
              ) : (
                <>
                  <Select value={selectedScriptId} onValueChange={setSelectedScriptId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a script" />
                    </SelectTrigger>
                    <SelectContent>
                      {scripts.map((script) => (
                        <SelectItem key={script.id} value={script.id}>
                          {script.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedScript && (
                    <div className="mt-2 rounded-md bg-gray-50 p-3">
                      <p className="text-sm text-gray-700">{selectedScript.content}</p>
                    </div>
                  )}
                </>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {getTextContent().length} characters
              </p>
            </div>

            {/* Language */}
            <div>
              <label className="mb-2 block text-sm font-medium">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !getTextContent().trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Volume2 className="mr-2 h-5 w-5" />
                  Generate Audio
                </>
              )}
            </Button>

            {/* Audio Preview */}
            {generatedAudioUrl && (
              <div className="rounded-lg border bg-green-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">
                    Preview
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePlayPause}
                    className="h-8 w-8 p-0"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <audio
                  ref={audioRef}
                  src={generatedAudioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full"
                  controls
                />
                <div className="mt-3 flex justify-end">
                  <Button onClick={handleSaveAndClose}>
                    Done - View in Projects
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
