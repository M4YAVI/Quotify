import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip, Cell } from "recharts";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subDays, isSameDay } from "date-fns";
import { Doc } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface WeeklyProgressChartProps {
    phrases: Doc<"phrases">[];
}

export function WeeklyProgressChart({ phrases }: WeeklyProgressChartProps) {
    const data = useMemo(() => {
        const today = new Date();
        const last7Days = eachDayOfInterval({
            start: subDays(today, 6),
            end: today,
        });

        return last7Days.map((day) => {
            const count = phrases.filter((p) =>
                isSameDay(new Date(p._creationTime), day)
            ).length;

            return {
                day: format(day, "EEE"), // Mon, Tue, etc.
                fullDate: format(day, "MMM d"),
                count,
            };
        });
    }, [phrases]);

    const maxCount = Math.max(...data.map(d => d.count));

    return (
        <Card className="border-white/5 bg-zinc-900/40 backdrop-blur-sm h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis
                                dataKey="day"
                                stroke="#52525b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-zinc-900 border border-white/10 p-2 rounded-lg shadow-xl text-xs">
                                                <p className="font-semibold text-white mb-1">{payload[0].payload.fullDate}</p>
                                                <p className="text-emerald-400 font-medium">
                                                    {payload[0].value} {payload[0].value === 1 ? 'phrase' : 'phrases'}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.count > 0 ? "#34d399" : "#27272a"}
                                        fillOpacity={entry.count > 0 ? 0.8 : 0.3}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
