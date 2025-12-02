import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categoryCounts: Record<string, number>;
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
}

const categoryColors = {
  Professional: "bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20",
  Philosophical: "bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20",
  Humorous: "bg-green-500/10 text-green-300 border-green-500/20 hover:bg-green-500/20",
  Motivational: "bg-orange-500/10 text-orange-300 border-orange-500/20 hover:bg-orange-500/20",
  Technical: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20",
  Creative: "bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20",
  "Life Wisdom": "bg-pink-500/10 text-pink-300 border-pink-500/20 hover:bg-pink-500/20",
  "Processing...": "bg-gray-500/10 text-gray-300 border-gray-500/20 hover:bg-gray-500/20",
};

export function CategoryFilter({ categoryCounts, selectedCategories, onCategoryToggle }: CategoryFilterProps) {
  const categories = Object.keys(categoryCounts).filter(cat => cat !== "Processing...");

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isSelected = selectedCategories.includes(category);
        const count = categoryCounts[category] || 0;
        const colorClass = categoryColors[category as keyof typeof categoryColors] || "bg-gray-500/10 text-gray-300 border-gray-500/20";

        return (
          <motion.button
            key={category}
            onClick={() => onCategoryToggle(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="focus:outline-none"
          >
            <Badge
              variant="outline"
              className={cn(
                "px-3 py-1.5 text-sm cursor-pointer transition-all duration-300 border",
                isSelected
                  ? `${colorClass} ring-1 ring-white/20 shadow-[0_0_15px_-5px_rgba(255,255,255,0.1)]`
                  : "bg-zinc-900/50 text-muted-foreground border-white/5 hover:border-white/20 hover:text-foreground"
              )}
            >
              {category}
              <span className="ml-2 opacity-50 text-xs">
                {count}
              </span>
            </Badge>
          </motion.button>
        );
      })}
    </div>
  );
}
