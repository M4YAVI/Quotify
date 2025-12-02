import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Doc } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Copy, Edit2, Trash2, Check, X, Loader2 } from "lucide-react";

interface PhraseCardProps {
  phrase: Doc<"phrases">;
  viewMode?: "grid" | "list";
}

const categoryColors = {
  Professional: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  Philosophical: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  Humorous: "bg-green-500/10 text-green-300 border-green-500/20",
  Motivational: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  Technical: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  Creative: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  "Life Wisdom": "bg-pink-500/10 text-pink-300 border-pink-500/20",
  "Processing...": "bg-gray-500/10 text-gray-300 border-gray-500/20",
};

export function PhraseCard({ phrase, viewMode = "grid" }: PhraseCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(phrase.text);
  const [editSource, setEditSource] = useState(phrase.source || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updatePhrase = useMutation(api.phrases.updatePhrase);
  const deletePhrase = useMutation(api.phrases.deletePhrase);

  const handleSave = async () => {
    try {
      await updatePhrase({
        phraseId: phrase._id,
        text: editText,
        source: editSource || undefined,
      });
      setIsEditing(false);
      toast.success("Phrase updated");
    } catch (error) {
      toast.error("Failed to update phrase");
    }
  };

  const handleDelete = async () => {
    try {
      await deletePhrase({ phraseId: phrase._id });
      toast.success("Phrase deleted");
    } catch (error) {
      toast.error("Failed to delete phrase");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(phrase.text);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const colorClass = categoryColors[phrase.category as keyof typeof categoryColors] || "bg-gray-500/10 text-gray-300 border-gray-500/20";

  if (viewMode === "list") {
    return (
      <>
        <div className="group flex items-center gap-4 p-3 rounded-lg bg-zinc-900/40 border border-white/5 hover:bg-zinc-900/80 hover:border-white/10 transition-all duration-200">
          {isEditing ? (
            <div className="flex-1 flex gap-2 items-center">
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="h-8 bg-black/40 border-white/10"
              />
              <Input
                value={editSource}
                onChange={(e) => setEditSource(e.target.value)}
                placeholder="Source"
                className="h-8 w-32 bg-black/40 border-white/10"
              />
              <Button size="sm" onClick={handleSave} className="h-8 px-2"><Check className="w-4 h-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-8 px-2"><X className="w-4 h-4" /></Button>
            </div>
          ) : (
            <>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground truncate">{phrase.text}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Badge variant="outline" className={`h-5 px-1.5 font-normal border-0 ${colorClass}`}>
                    {phrase.category}
                  </Badge>
                  {phrase.source && <span>{phrase.source}</span>}
                  <span>•</span>
                  <span>{new Date(phrase._creationTime).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-400" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-900 border border-white/10 p-6 rounded-xl max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-semibold mb-2">Delete Phrase?</h3>
              <p className="text-muted-foreground mb-6 text-sm">This action cannot be undone.</p>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="h-full border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all duration-300 group flex flex-col">
        <CardContent className="p-5 flex flex-col h-full">
          {isEditing ? (
            <div className="space-y-4 w-full">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="bg-black/20 border-white/10 min-h-[100px]"
              />
              <Input
                value={editSource}
                onChange={(e) => setEditSource(e.target.value)}
                placeholder="Source (optional)"
                className="bg-black/20 border-white/10"
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Check className="w-4 h-4 mr-2" /> Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`font-normal border ${colorClass}`}>
                    {phrase.category}
                  </Badge>
                  {phrase.isProcessing && (
                    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                  )}
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={copyToClipboard}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-red-400" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-base leading-relaxed text-balance font-medium text-foreground/90">
                  "{phrase.text}"
                </p>
                {phrase.source && (
                  <p className="mt-3 text-xs text-muted-foreground italic">
                    — {phrase.source}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-muted-foreground">
                <span>{new Date(phrase._creationTime).toLocaleDateString()}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-white/10 p-6 rounded-xl max-w-sm w-full shadow-2xl"
          >
            <h3 className="text-lg font-semibold mb-2">Delete Phrase?</h3>
            <p className="text-muted-foreground mb-6 text-sm">This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
