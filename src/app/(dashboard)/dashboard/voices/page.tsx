"use client";

import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import {
  Mic,
  Play,
  Pause,
  Loader2,
  Plus,
  UserRound,
  Sparkles,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { getUserUploadedVoices } from "~/actions/voice-upload";
import { voiceAgents, type VoiceAgent } from "~/data/voice-agents";
import { cn } from "~/lib/utils";
import Link from "next/link";

interface UploadedVoice {
  id: string;
  name: string;
  s3Key: string;
  url: string;
  createdAt: Date;
}

type VoiceTab = "clones" | "agents";

export default function VoicesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [clones, setClones] = useState<UploadedVoice[]>([]);
  const [activeTab, setActiveTab] = useState<VoiceTab>("clones");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchClones = async () => {
    const result = await getUserUploadedVoices();
    if (result.success) {
      setClones(result.voices);
    } else {
      toast.error(result.error ?? "Failed to load voices");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchClones();
  }, []);

  const handlePlayClone = (voice: UploadedVoice) => {
    if (playingId === voice.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(voice.url);
    audioRef.current = audio;

    audio.addEventListener("ended", () => {
      setPlayingId(null);
    });

    audio.play().then(() => {
      setPlayingId(voice.id);
    }).catch(() => {
      toast.error("Failed to play audio");
    });
  };

  const handlePlayAgent = (agent: VoiceAgent) => {
    if (playingId === agent.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(agent.audioUrl);
    audioRef.current = audio;

    audio.addEventListener("ended", () => {
      setPlayingId(null);
    });

    audio.play().then(() => {
      setPlayingId(agent.id);
    }).catch(() => {
      toast.error("Failed to play audio");
    });
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
                <Mic className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold">Voice Library</h1>
              </div>
              <Link href="/dashboard/voice-recorder">
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Record Clone
                </Button>
              </Link>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Your voice clones and professional agents
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-6">
          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b">
            <button
              onClick={() => setActiveTab("clones")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "clones"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Mic className="h-4 w-4" />
              Doppel Clones
              <span className="text-xs text-gray-400">({clones.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("agents")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "agents"
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Sparkles className="h-4 w-4" />
              Professional Agents
              <span className="text-xs text-gray-400">({voiceAgents.length})</span>
            </button>
          </div>

          {/* Clones Tab */}
          {activeTab === "clones" && (
            <>
              {clones.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Mic className="mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-sm text-muted-foreground">
                      No voice clones yet
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Record your voice to create a custom clone
                    </p>
                    <Link href="/dashboard/voice-recorder">
                      <Button variant="outline" className="mt-4">
                        <Plus className="mr-1 h-4 w-4" />
                        Record Your First Clone
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {clones.map((clone) => {
                    const isPlaying = playingId === clone.id;
                    return (
                      <Card
                        key={clone.id}
                        className={cn(
                          "transition-all hover:shadow-md",
                          isPlaying && "border-blue-500 shadow-md"
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow">
                              <Mic className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{clone.name}</h3>
                              <p className="text-xs text-gray-500">Your clone</p>
                            </div>
                            <button
                              onClick={() => handlePlayClone(clone)}
                              className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                                isPlaying
                                  ? "bg-blue-600 text-white shadow-lg"
                                  : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600"
                              )}
                            >
                              {isPlaying ? (
                                <Pause className="h-5 w-5" />
                              ) : (
                                <Play className="h-5 w-5 ml-0.5" />
                              )}
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Agents Tab */}
          {activeTab === "agents" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {voiceAgents.map((agent) => {
                const isPlaying = playingId === agent.id;
                return (
                  <Card
                    key={agent.id}
                    className={cn(
                      "transition-all hover:shadow-md",
                      isPlaying && "border-purple-500 shadow-md"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full shadow",
                            agent.gender === "Female"
                              ? "bg-gradient-to-br from-pink-400 to-purple-500"
                              : "bg-gradient-to-br from-blue-400 to-indigo-500"
                          )}
                        >
                          <UserRound className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{agent.name}</h3>
                          <p className="text-xs text-gray-500">
                            {agent.language} • {agent.accent}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {agent.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handlePlayAgent(agent)}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                            isPlaying
                              ? "bg-purple-600 text-white shadow-lg"
                              : "bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600"
                          )}
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5 ml-0.5" />
                          )}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </SignedIn>
    </>
  );
}
