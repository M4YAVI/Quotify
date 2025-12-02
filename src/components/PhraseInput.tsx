import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function PhraseInput() {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const addPhrase = useMutation(api.phrases.addPhrase);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await addPhrase({
        text: text.trim(),
        source: source.trim() || undefined,
      });
      
      setText("");
      setSource("");
      toast.success("Phrase added! AI is categorizing...");
    } catch (error) {
      toast.error("Failed to add phrase");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter a phrase to save..."
          className="w-full px-4 py-4 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none text-lg leading-relaxed"
          rows={3}
          style={{ maxWidth: '65ch' }}
          disabled={isSubmitting}
        />
        
        {isSubmitting && (
          <div className="absolute right-3 top-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-3 h-3 bg-blue-500 rounded-full"
            />
          </div>
        )}
      </div>
      
      <input
        type="text"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        placeholder="Source (optional)"
        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
        disabled={isSubmitting}
      />
      
      <button
        type="submit"
        disabled={!text.trim() || isSubmitting}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5"
      >
        {isSubmitting ? "Adding..." : "Add Phrase"}
      </button>
    </motion.form>
  );
}
