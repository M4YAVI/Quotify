import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Doc } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSettings: Doc<"settings"> | null | undefined;
}

const availableModels = [
  { id: "x-ai/grok-4.1-fast:free", name: "Grok 4.1 Fast (Free)" },
  { id: "z-ai/glm-4.5-air:free", name: "GLM 4.5 Air (Free)" },
  { id: "moonshotai/kimi-k2:free", name: "Kimi K2 (Free)" },
];

export function SettingsModal({ isOpen, onClose, userSettings }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("x-ai/grok-4.1-fast:free");

  const updateSettings = useMutation(api.phrases.updateSettings);

  useEffect(() => {
    if (userSettings) {
      setApiKey(userSettings.openRouterApiKey || "");
      setSelectedModel(userSettings.preferredModel || "x-ai/grok-4.1-fast:free");
    }
  }, [userSettings]);

  const handleSave = async () => {
    try {
      await updateSettings({
        openRouterApiKey: apiKey || undefined,
        preferredModel: selectedModel,
      });
      toast.success("Settings saved");
      onClose();
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-zinc-900 border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold mb-6 tracking-tight">
              Settings
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3 text-muted-foreground">
                  OpenRouter API Key
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your OpenRouter API key"
                  className="bg-black/20"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Required for AI categorization. Get one at{" "}
                  <a
                    href="https://openrouter.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:underline"
                  >
                    openrouter.ai
                  </a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-muted-foreground">
                  Preferred Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-2 bg-black/20 border border-input rounded-md text-sm focus:border-white/20 outline-none transition-all text-foreground"
                >
                  {availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button
                onClick={handleSave}
                className="flex-1 bg-white text-black hover:bg-gray-200"
              >
                Save Settings
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
