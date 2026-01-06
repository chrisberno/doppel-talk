"use client";

import { Globe, Volume2, Upload, Settings, Loader2, Key } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";

import { Button } from "~/components/ui/button";

import type { Language, VoiceFile, UploadedVoice } from "~/types/tts";
import { voices, type Voice, type VoiceProvider } from "~/lib/voices";

interface SpeechSettingsProps {
  languages: Language[];
  voiceFiles: VoiceFile[];
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  exaggeration: number;
  setExaggeration: (value: number) => void;
  cfgWeight: number;
  setCfgWeight: (value: number) => void;
  userUploadedVoices: UploadedVoice[];
  isUploadingVoice: boolean;
  handleVoiceUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  text: string;
  isGenerating: boolean;
  onGenerate: () => void;
  // Multi-provider support
  provider: VoiceProvider;
  setProvider: (provider: VoiceProvider) => void;
  selectedVoiceId: string;
  setSelectedVoiceId: (voiceId: string) => void;
  // Credentials
  twilioSid: string;
  setTwilioSid: (sid: string) => void;
  twilioAuth: string;
  setTwilioAuth: (auth: string) => void;
  awsAccessKey: string;
  setAwsAccessKey: (key: string) => void;
  awsSecretKey: string;
  setAwsSecretKey: (secret: string) => void;
  awsRegion: string;
  setAwsRegion: (region: string) => void;
}

export default function SpeechSettings({
  languages,
  voiceFiles,
  selectedLanguage,
  setSelectedLanguage,
  selectedVoice,
  setSelectedVoice,
  exaggeration,
  setExaggeration,
  cfgWeight,
  setCfgWeight,
  userUploadedVoices,
  isUploadingVoice,
  handleVoiceUpload,
  text,
  isGenerating,
  onGenerate,
  provider,
  setProvider,
  selectedVoiceId,
  setSelectedVoiceId,
  twilioSid,
  setTwilioSid,
  twilioAuth,
  setTwilioAuth,
  awsAccessKey,
  setAwsAccessKey,
  awsSecretKey,
  setAwsSecretKey,
  awsRegion,
  setAwsRegion,
}: SpeechSettingsProps) {
  const creditsNeeded = Math.max(1, Math.ceil(text.length / 100));
  
  // Get available voices for selected provider
  const availableVoices = provider === "chatterbox" 
    ? [] // Chatterbox uses uploaded voices
    : voices.filter(v => v.provider === provider);
  
  return (
    <Card className="shadow-lg">
      <CardContent className="p-2 sm:p-3">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="mb-0.5 text-sm font-bold">Settings</h3>
            <p className="text-muted-foreground text-xs">
              Customize your speech
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {/* Provider Selection */}
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-semibold">
              <Settings className="h-3 w-3" />
              TTS Provider
            </label>
            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value as VoiceProvider);
                setSelectedVoiceId(""); // Reset voice selection when provider changes
              }}
              className="border-input bg-background w-full rounded-md border px-2 py-1.5 text-xs"
            >
              <option value="chatterbox">AI (Chatterbox)</option>
              <option value="twilio">Twilio</option>
              <option value="polly">Amazon Polly</option>
            </select>
          </div>
          
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-semibold">
              <Globe className="h-3 w-3" />
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="border-input bg-background w-full rounded-md border px-2 py-1.5 text-xs"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
          {/* Voice Selection - Different for each provider */}
          {provider === "chatterbox" ? (
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-semibold">
                <Volume2 className="h-3 w-3" />
                Voice
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="border-input bg-background w-full rounded-md border px-2 py-1.5 text-xs"
              >
                {/* User's uploaded voices */}
                {userUploadedVoices.map((voice) => (
                  <option key={voice.id} value={voice.s3Key}>
                    🎤 {voice.name}
                  </option>
                ))}
                {/* Default voices */}
                {voiceFiles.map((voice) => (
                  <option key={voice.s3_key} value={voice.s3_key}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-semibold">
                <Volume2 className="h-3 w-3" />
                Voice
              </label>
              <select
                value={selectedVoiceId}
                onChange={(e) => setSelectedVoiceId(e.target.value)}
                className="border-input bg-background w-full rounded-md border px-2 py-1.5 text-xs"
              >
                <option value="">Select a voice...</option>
                {availableVoices.map((voice) => (
                  <option key={voice.id} value={voice.providerVoiceId}>
                    {voice.name} ({voice.language}) - {voice.gender}
                  </option>
                ))}
              </select>
              {selectedVoiceId && (
                <p className="mt-1 text-xs text-gray-500">
                  {availableVoices.find(v => v.providerVoiceId === selectedVoiceId)?.description}
                </p>
              )}
            </div>
          )}
          
          {/* Twilio Credentials */}
          {provider === "twilio" && (
            <div className="space-y-2 rounded-md border border-blue-200 bg-blue-50 p-2">
              <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-blue-900">
                <Key className="h-3 w-3" />
                Twilio Credentials
              </label>
              <div>
                <input
                  type="text"
                  placeholder="Account SID"
                  value={twilioSid}
                  onChange={(e) => setTwilioSid(e.target.value)}
                  className="border-input bg-background w-full rounded-md border px-2 py-1.5 text-xs"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Auth Token"
                  value={twilioAuth}
                  onChange={(e) => setTwilioAuth(e.target.value)}
                  className="border-input bg-background w-full rounded-md border px-2 py-1.5 text-xs"
                />
              </div>
              <p className="text-xs text-blue-700">
                Credentials are never stored and only used for this request.
              </p>
            </div>
          )}
          
          {/* AWS/Polly Credentials */}
          {provider === "polly" && (
            <div className="space-y-2 rounded-md border border-orange-200 bg-orange-50 p-2">
              <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-orange-900">
                <Key className="h-3 w-3" />
                AWS Credentials
              </label>
              <div>
                <input
                  type="text"
                  placeholder="AWS Access Key ID"
                  value={awsAccessKey}
                  onChange={(e) => setAwsAccessKey(e.target.value)}
                  className="border-input bg-background w-full rounded-md border px-2 py-1.5 text-xs"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="AWS Secret Access Key"
                  value={awsSecretKey}
                  onChange={(e) => setAwsSecretKey(e.target.value)}
                  className="border-input bg-background w-full rounded-md border px-2 py-1.5 text-xs"
                />
              </div>
              <div>
                <select
                  value={awsRegion}
                  onChange={(e) => setAwsRegion(e.target.value)}
                  className="border-input bg-background w-full rounded-md border px-2 py-1.5 text-xs"
                >
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">Europe (Ireland)</option>
                  <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
                </select>
              </div>
              <p className="text-xs text-orange-700">
                Credentials are never stored and only used for this request.
              </p>
            </div>
          )}
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-semibold">
              <Upload className="h-3 w-3" />
              Upload Your Voice
            </label>
            <div className="space-y-2">
              {isUploadingVoice ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground ml-2 text-xs">
                    Uploading...
                  </span>
                </div>
              ) : (
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleVoiceUpload}
                  className="w-full cursor-pointer text-xs file:mr-2 file:rounded-md file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:text-xs file:text-blue-700 file:hover:bg-blue-100"
                />
              )}
              <p className="text-muted-foreground text-xs">
                Upload a clear voice sample (WAV/MP3). Uploaded voices appear in
                the dropdown above.
              </p>
            </div>
          </div>
          <div>
            <label className="mb-1 flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Emotion/Intensity
              </span>
              <span className="text-muted-foreground">
                {exaggeration.toFixed(1)}
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={exaggeration}
              onChange={(e) => setExaggeration(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>Calm</span>
              <span>Expressive</span>
            </div>
          </div>
          <div>
            <label className="mb-1 flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Pacing Control
              </span>
              <span className="text-muted-foreground">
                {cfgWeight.toFixed(1)}
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={cfgWeight}
              onChange={(e) => setCfgWeight(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>Fast</span>
              <span>Accurate</span>
            </div>
          </div>
          <div className="space-y-2">
            {text.trim() && (
              <div className="rounded-md bg-blue-50 px-3 py-2 text-center">
                <p className="text-xs text-blue-700">
                  Cost:{" "}
                  <span className="font-bold">
                    {creditsNeeded} credit
                    {creditsNeeded > 1 ? "s" : ""}
                  </span>{" "}
                  ({text.length} characters)
                </p>
              </div>
            )}
            <Button
              onClick={onGenerate}
              disabled={isGenerating || !text.trim()}
              className="h-9 w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4" />
                  Generate Speech
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
