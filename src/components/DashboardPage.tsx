import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { WeeklyProgressChart } from "./WeeklyProgressChart";
import { Loader2 } from "lucide-react";

export function DashboardPage() {
    const allPhrases = useQuery(api.phrases.listPhrases, {});
    const categoryCounts = useQuery(api.phrases.getCategoryCounts);

    if (!allPhrases) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
                        <p className="text-muted-foreground mb-6">Overview of your learning progress.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                                <div className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Total Phrases</div>
                                <div className="text-2xl font-bold text-white mt-1">{allPhrases.length}</div>
                            </div>
                            <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                                <div className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Categories</div>
                                <div className="text-2xl font-bold text-white mt-1">{Object.keys(categoryCounts || {}).length}</div>
                            </div>

                            {/* Weekly Chart spans 2 columns on large screens */}
                            <div className="md:col-span-2 lg:col-span-2 row-span-2 h-full min-h-[250px]">
                                <WeeklyProgressChart phrases={allPhrases} />
                            </div>
                        </div>
                    </div>
                </div>

                <ActivityHeatmap phrases={allPhrases} />
            </motion.div>
        </div>
    );
}
