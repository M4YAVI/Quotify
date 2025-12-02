import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    eachDayOfInterval,
    subDays,
    format,
    startOfWeek,
    endOfWeek,
} from "date-fns";
import { Doc } from "../../convex/_generated/dataModel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityHeatmapProps {
    phrases: Doc<"phrases">[];
}

export function ActivityHeatmap({ phrases }: ActivityHeatmapProps) {
    // Generate the grid data
    const { weeks, monthLabels } = useMemo(() => {
        const today = new Date();
        // End on the current week's Saturday (or end of week)
        const endDate = endOfWeek(today);
        // Start 52 weeks ago
        const startDate = startOfWeek(subDays(endDate, 364)); // approx 52 weeks

        const allDays = eachDayOfInterval({ start: startDate, end: endDate });

        // Group by weeks
        const weeks: Date[][] = [];
        let currentWeek: Date[] = [];

        allDays.forEach((day) => {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });

        // If there are leftover days (shouldn't be if we align to weeks, but safety check)
        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        // Generate month labels
        const monthLabels: { label: string; index: number }[] = [];
        let lastMonth = -1;
        weeks.forEach((week, index) => {
            const firstDayOfWeek = week[0];
            const month = firstDayOfWeek.getMonth();
            if (month !== lastMonth) {
                monthLabels.push({ label: format(firstDayOfWeek, "MMM"), index });
                lastMonth = month;
            }
        });

        return { weeks, monthLabels };
    }, []);

    const activityMap = useMemo(() => {
        const map = new Map<string, number>();
        phrases.forEach((phrase) => {
            const dateKey = format(new Date(phrase._creationTime), "yyyy-MM-dd");
            map.set(dateKey, (map.get(dateKey) || 0) + 1);
        });
        return map;
    }, [phrases]);

    const getColor = (count: number) => {
        if (count === 0) return "bg-zinc-900/40 border-zinc-800"; // Empty
        if (count === 1) return "bg-emerald-900/60 border-emerald-800"; // Level 1
        if (count <= 3) return "bg-emerald-700/80 border-emerald-600"; // Level 2
        if (count <= 5) return "bg-emerald-500 border-emerald-400"; // Level 3
        return "bg-emerald-300 border-emerald-200 shadow-[0_0_10px_rgba(110,231,183,0.5)]"; // Level 4 (Max)
    };

    return (
        <Card className="border-white/5 bg-black/20 backdrop-blur-sm w-full overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Contribution Graph</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {/* Month Labels */}
                    <div className="flex text-[10px] text-muted-foreground h-4 relative w-full min-w-max">
                        {monthLabels.map((month, i) => (
                            <span
                                key={i}
                                style={{
                                    position: 'absolute',
                                    left: `${month.index * 14}px` // 10px width + 4px gap approx
                                }}
                            >
                                {month.label}
                            </span>
                        ))}
                    </div>

                    <div className="flex gap-1 min-w-max">
                        {/* Day Labels (Mon/Wed/Fri) */}
                        <div className="flex flex-col gap-1 text-[10px] text-muted-foreground pr-2 pt-[2px]">
                            <span className="h-[10px]"></span>
                            <span className="h-[10px]">Mon</span>
                            <span className="h-[10px]"></span>
                            <span className="h-[10px]">Wed</span>
                            <span className="h-[10px]"></span>
                            <span className="h-[10px]">Fri</span>
                            <span className="h-[10px]"></span>
                        </div>

                        {/* The Grid */}
                        <TooltipProvider delayDuration={50}>
                            <div className="flex gap-[3px]">
                                {weeks.map((week, weekIndex) => (
                                    <div key={weekIndex} className="flex flex-col gap-[3px]">
                                        {week.map((day) => {
                                            const dateKey = format(day, "yyyy-MM-dd");
                                            const count = activityMap.get(dateKey) || 0;

                                            return (
                                                <Tooltip key={dateKey}>
                                                    <TooltipTrigger asChild>
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: weekIndex * 0.01 }}
                                                            className={cn(
                                                                "w-[10px] h-[10px] rounded-[2px] border transition-colors duration-200",
                                                                getColor(count)
                                                            )}
                                                        />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-zinc-900 border-white/10 text-xs p-2">
                                                        <p className="font-medium text-white">
                                                            {count === 0 ? "No contributions" : `${count} contributions`}
                                                        </p>
                                                        <p className="text-muted-foreground">
                                                            {format(day, "MMM do, yyyy")}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </TooltipProvider>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-2 pl-8">
                        <span>Less</span>
                        <div className="flex gap-[3px]">
                            <div className="w-[10px] h-[10px] rounded-[2px] bg-zinc-900/40 border border-zinc-800" />
                            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-900/60 border border-emerald-800" />
                            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-700/80 border border-emerald-600" />
                            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500 border border-emerald-400" />
                            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-300 border border-emerald-200" />
                        </div>
                        <span>More</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
