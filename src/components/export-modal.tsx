"use client";

import { useState } from "react";
import { Copy, Download, Check, Loader2, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { exportProject, exportWithVoice, type ExportFormat } from "~/actions/export";
import { toast } from "sonner";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  text?: string;
  voiceId?: string;
  projectName?: string;
}

export default function ExportModal({
  isOpen,
  onClose,
  projectId,
  text,
  voiceId,
  projectName,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("twiml");
  const [exportContent, setExportContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsLoading(true);
    setExportContent("");
    
    try {
      let result;
      
      if (projectId) {
        // Export from existing project
        result = await exportProject(projectId, selectedFormat);
      } else if (text && voiceId) {
        // Export with voice information
        result = await exportWithVoice(text, voiceId, selectedFormat);
      } else {
        toast.error("Missing required information for export");
        return;
      }

      if (!result.success) {
        toast.error(result.error || "Failed to generate export");
        return;
      }

      setExportContent(result.content || "");
      toast.success("Export generated successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to generate export");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!exportContent) return;
    
    try {
      await navigator.clipboard.writeText(exportContent);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    if (!exportContent) return;

    const extension = selectedFormat === "twiml" 
      ? "xml" 
      : selectedFormat === "studio-json"
      ? "json"
      : selectedFormat === "node-snippet"
      ? "js"
      : "py";

    const mimeType = selectedFormat === "twiml"
      ? "application/xml"
      : selectedFormat === "studio-json"
      ? "application/json"
      : "text/plain";

    const blob = new Blob([exportContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName || "export"}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Download started!");
  };

  const formatOptions: { value: ExportFormat; label: string; description: string }[] = [
    {
      value: "twiml",
      label: "TwiML",
      description: "XML format for Twilio webhooks",
    },
    {
      value: "studio-json",
      label: "Studio JSON",
      description: "Twilio Studio Flow configuration",
    },
    {
      value: "node-snippet",
      label: "Node.js Snippet",
      description: "Ready-to-use Node.js code",
    },
    {
      value: "python-snippet",
      label: "Python Snippet",
      description: "Ready-to-use Python code",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col m-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Export for Twilio</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {/* Format Selection */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Export Format
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {formatOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedFormat(option.value);
                    setExportContent(""); // Clear previous export
                  }}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    selectedFormat === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div>
            <Button
              onClick={handleExport}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Generate Export
                </>
              )}
            </Button>
          </div>

          {/* Export Preview */}
          {exportContent && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Preview</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!exportContent}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={!exportContent}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
              <pre className="max-h-96 overflow-auto rounded-lg border bg-gray-50 p-4 text-xs">
                <code>{exportContent}</code>
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

