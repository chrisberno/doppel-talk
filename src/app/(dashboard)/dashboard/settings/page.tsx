"use client";

import {
  RedirectToSignIn,
  SecuritySettingsCards,
  SignedIn,
  AccountSettingsCards,
} from "@daveyplate/better-auth-ui";
import {
  Loader2,
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Calendar,
  Eye,
} from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { useEffect, useState } from "react";
import {
  createApiKey,
  listApiKeys,
  deleteApiKey,
  type ListApiKey,
} from "~/actions/api-keys";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";

export default function SettingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ListApiKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await authClient.getSession();
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void checkSession();
  }, []);

  useEffect(() => {
    const fetchApiKeys = async () => {
      setIsLoadingKeys(true);
      try {
        const result = await listApiKeys();
        if (result.success && result.keys) {
          setApiKeys(result.keys);
        }
      } catch (error) {
        console.error("Error fetching API keys:", error);
      } finally {
        setIsLoadingKeys(false);
      }
    };

    void fetchApiKeys();
  }, []);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createApiKey(newKeyName.trim());
      if (result.success && result.key) {
        setNewKey(result.key);
        setShowKeyModal(true);
        setNewKeyName("");
        // Refresh keys list
        const listResult = await listApiKeys();
        if (listResult.success && listResult.keys) {
          setApiKeys(listResult.keys);
        }
        toast.success("API key created successfully");
      } else {
        toast.error(result.error || "Failed to create API key");
      }
    } catch (error) {
      console.error("Error creating API key:", error);
      toast.error("Failed to create API key");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key? This cannot be undone.")) {
      return;
    }

    try {
      const result = await deleteApiKey(id);
      if (result.success) {
        setApiKeys(apiKeys.filter((key) => key.id !== id));
        toast.success("API key deleted");
      } else {
        toast.error(result.error || "Failed to delete API key");
      }
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast.error("Failed to delete API key");
    }
  };

  const handleCopyKey = (key: string) => {
    void navigator.clipboard.writeText(key);
    setCopiedId(key);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

   if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">
            Loading your settings...
          </p>
        </div>
      </div>
    );
  }
  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Account Settings
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your account preferences and security settings
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-6">
            <AccountSettingsCards className="w-full max-w-2xl" />
            <SecuritySettingsCards className="w-full max-w-2xl" />
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
                <p className="text-muted-foreground text-sm font-normal">
                  Manage your API keys for programmatic access. Keys are shown
                  only once when created.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Key name (e.g., Production, Development)"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        void handleCreateKey();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCreateKey}
                    disabled={isCreating}
                    className="gap-2"
                  >
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Create Key
                  </Button>
                </div>

                {isLoadingKeys ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : apiKeys.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No API keys yet. Create one to get started.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{key.name}</span>
                            {key.expiresAt && key.expiresAt < new Date() && (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                                Expired
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                            <code className="rounded bg-muted px-2 py-0.5 font-mono">
                              {key.keyPreview}
                            </code>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Created{" "}
                              {new Date(key.createdAt).toLocaleDateString()}
                            </div>
                            {key.lastUsedAt && (
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                Last used{" "}
                                {new Date(key.lastUsedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKey(key.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Modal for showing new API key */}
          {showKeyModal && newKey && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>API Key Created</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      Your API key is shown below. Copy it now - you won&apos;t
                      be able to see it again!
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 break-all rounded bg-muted p-3 font-mono text-sm">
                        {newKey}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyKey(newKey)}
                        className="gap-2"
                      >
                        {copiedId === newKey ? (
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
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setShowKeyModal(false);
                      setNewKey(null);
                    }}
                    className="w-full"
                  >
                    I&apos;ve Copied the Key
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </SignedIn>
    </>
  );
}
