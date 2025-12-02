import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhraseCard } from "./PhraseCard";
import { Doc } from "../../convex/_generated/dataModel";

interface PhraseListProps {
  phrases: Doc<"phrases">[];
  focusMode: boolean;
}

export function PhraseList({ phrases, focusMode }: PhraseListProps) {
  if (!phrases || phrases.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-4xl mb-4">📝</div>
        <p>No phrases yet. Start by adding your first phrase above!</p>
      </div>
    );
  }

  const displayPhrases = focusMode ? phrases.slice(0, 5) : phrases;

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {displayPhrases.map((phrase, index) => (
          <motion.div
            key={phrase._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: focusMode && index >= 5 ? 0.3 : 1, 
              y: 0 
            }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            layout
          >
            <PhraseCard phrase={phrase} />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {focusMode && phrases.length > 5 && (
        <div className="text-center text-gray-500 text-sm py-4">
          {phrases.length - 5} more phrases hidden in focus mode
        </div>
      )}
    </div>
  );
}
