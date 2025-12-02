import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryFilter } from "./CategoryFilter";
import { PhraseCard } from "./PhraseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, LayoutGrid, List, Loader2 } from "lucide-react";

export function ViewPhrasesPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const phrases = useQuery(api.phrases.listPhrases, {
    category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
    search: searchQuery || undefined,
  });

  const categoryCounts = useQuery(api.phrases.getCategoryCounts);

  const filteredPhrases = phrases?.filter(phrase => {
    if (selectedCategories.length === 0) return true;
    return selectedCategories.includes(phrase.category);
  }) || [];

  if (!phrases) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Collection Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-16 z-40 bg-background/95 backdrop-blur-xl py-4 border-b border-white/5"
      >
        <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-white/10 h-10 text-sm"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg border border-white/5">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      <CategoryFilter
        categoryCounts={categoryCounts || {}}
        selectedCategories={selectedCategories}
        onCategoryToggle={(category) => {
          setSelectedCategories(prev =>
            prev.includes(category)
              ? prev.filter(c => c !== category)
              : [...prev, category]
          );
        }}
      />

      {/* Content */}
      {filteredPhrases.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-zinc-900/20"
        >
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">
            No results found
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search or filters.
          </p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "flex flex-col gap-2"
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredPhrases.map((phrase, index) => (
              <motion.div
                key={phrase._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                layout
                className={viewMode === "grid" ? "h-full" : "w-full"}
              >
                <PhraseCard phrase={phrase} viewMode={viewMode} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
