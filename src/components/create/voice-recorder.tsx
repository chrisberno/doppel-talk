"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Play, RotateCcw, Upload, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";

interface VoiceRecorderProps {
  onRecordingComplete: (file: File) => void;
  isUploading: boolean;
}

export default function VoiceRecorder({
  onRecordingComplete,
  isUploading,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [analyserData, setAnalyserData] = useState<number[]>(new Array(32).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  const updateAnalyser = useCallback(() => {
    if (analyserRef.current && isRecording) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Sample 32 points from the frequency data
      const samples: number[] = [];
      const step = Math.floor(dataArray.length / 32);
      for (let i = 0; i < 32; i++) {
        const value = dataArray[i * step] ?? 0;
        samples.push(value / 255);
      }
      setAnalyserData(samples);

      animationFrameRef.current = requestAnimationFrame(updateAnalyser);
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up audio context for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // Close audio context
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setDuration(0);
      setAudioBlob(null);
      setAudioUrl(null);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);

      // Start visualization
      updateAnalyser();

    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAnalyserData(new Array(32).fill(0));

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setAnalyserData(new Array(32).fill(0));
  };

  const playRecording = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
    }
  };

  const submitRecording = () => {
    if (audioBlob) {
      // Convert blob to File with proper extension
      const extension = audioBlob.type.includes('webm') ? 'webm' : 'm4a';
      const file = new File([audioBlob], `voice-recording-${Date.now()}.${extension}`, {
        type: audioBlob.type,
      });
      onRecordingComplete(file);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {/* Waveform visualization */}
      <div className="flex h-12 items-center justify-center gap-0.5 rounded-md bg-gray-50 px-2">
        {analyserData.map((value, index) => (
          <div
            key={index}
            className="w-1 rounded-full bg-blue-500 transition-all duration-75"
            style={{
              height: `${Math.max(4, value * 40)}px`,
              opacity: isRecording ? 0.8 : 0.3,
            }}
          />
        ))}
      </div>

      {/* Timer */}
      <div className="text-center">
        <span className={`font-mono text-lg ${isRecording ? 'text-red-500' : 'text-gray-600'}`}>
          {formatDuration(duration)}
        </span>
        {isRecording && (
          <span className="ml-2 inline-flex items-center gap-1 text-xs text-red-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            Recording
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {!isRecording && !audioUrl && (
          <Button
            type="button"
            onClick={startRecording}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <Mic className="h-4 w-4 text-red-500" />
            Record
          </Button>
        )}

        {isRecording && (
          <Button
            type="button"
            onClick={stopRecording}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <Square className="h-4 w-4 text-red-500" />
            Stop
          </Button>
        )}

        {audioUrl && !isRecording && (
          <>
            <Button
              type="button"
              onClick={playRecording}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <Play className="h-4 w-4" />
              Play
            </Button>
            <Button
              type="button"
              onClick={resetRecording}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Re-record
            </Button>
            <Button
              type="button"
              onClick={submitRecording}
              disabled={isUploading}
              size="sm"
              className="gap-1 bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Use Recording
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Hidden audio element for playback */}
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} className="hidden" />
      )}

      {/* Helper text */}
      <p className="text-center text-xs text-muted-foreground">
        {!audioUrl
          ? "Record a clear voice sample (30 sec - 2 min recommended)"
          : "Preview your recording, then click 'Use Recording' to save"
        }
      </p>
    </div>
  );
}
