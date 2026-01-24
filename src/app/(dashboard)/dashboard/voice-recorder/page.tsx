"use client";

import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import { Loader2, Mic, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { uploadVoice, getUserUploadedVoices } from "~/actions/voice-upload";
import { toast } from "sonner";
import type { UploadedVoice } from "~/types/tts";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import VoiceRecorder from "~/components/create/voice-recorder";

export default function VoiceRecorderPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [userVoices, setUserVoices] = useState<UploadedVoice[]>([]);
  const [lastUploaded, setLastUploaded] = useState<string | null>(null);
  const [voiceName, setVoiceName] = useState("");

  const fetchVoices = async () => {
    const result = await getUserUploadedVoices();
    if (result.success) {
      setUserVoices(result.voices);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchVoices();
  }, []);

  const handleRecordingComplete = async (file: File) => {
    if (!voiceName.trim()) {
      toast.error("Please enter a name for your voice sample");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("voice", file);
      formData.append("name", voiceName.trim());

      const result = await uploadVoice(formData);

      if (!result.success) {
        throw new Error(result.error ?? "Upload failed");
      }

      toast.success("Voice uploaded successfully!");
      setLastUploaded(voiceName.trim());
      setVoiceName(""); // Reset for next recording
      await fetchVoices();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload voice file");
    } finally {
      setIsUploading(false);
    }
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
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Mic className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold">Voice Recorder</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Record a voice sample directly in your browser
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-4 py-8">
          {/* Recorder Card */}
          <Card className="mb-6 shadow-lg">
            <CardContent className="p-6">
              <h2 className="mb-4 text-center text-sm font-semibold">
                Record Your Voice Sample
              </h2>

              {/* Voice Name Input */}
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Voice Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Professional, Casual, Character Voice"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  className="text-sm"
                  maxLength={50}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Give your voice sample a memorable name
                </p>
              </div>

              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                isUploading={isUploading}
              />
            </CardContent>
          </Card>

          {/* Success indicator */}
          {lastUploaded && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="flex items-center gap-3 p-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Recording saved!
                  </p>
                  <p className="text-xs text-green-600">
                    Your voice is now available in the Create page dropdown
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Your Voices */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-sm font-semibold">Your Voice Samples</h2>
              {userVoices.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  No voice samples yet. Record one above!
                </p>
              ) : (
                <ul className="space-y-2">
                  {userVoices.map((voice) => (
                    <li
                      key={voice.id}
                      className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2"
                    >
                      <Mic className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{voice.name}</span>
                      {voice.name === lastUploaded && (
                        <span className="ml-auto text-xs text-green-600">
                          Just added
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </SignedIn>
    </>
  );
}
