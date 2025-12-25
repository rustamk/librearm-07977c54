import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BloodPressureReading, getStoredReadings } from '@/lib/bluetooth';

interface ChartDataPoint {
  date: string;
  systolic: number;
  diastolic: number;
  heartRate?: number;
}

export function BPTrendsChart() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);

  useEffect(() => {
    if (isExpanded) {
      setReadings(getStoredReadings());
    }
  }, [isExpanded]);

  const chartData: ChartDataPoint[] = readings
    .slice(0, 30)
    .reverse()
    .map((reading) => ({
      date: new Date(reading.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      systolic: reading.systolic,
      diastolic: reading.diastolic,
      heartRate: reading.heartRate > 0 ? reading.heartRate : undefined,
    }));

  const hasData = chartData.length >= 2;

  return (
    <div className="rounded-2xl bg-card shadow-card">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/30"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">BP Trends</h3>
            <p className="text-xs text-muted-foreground">View your blood pressure over time</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border p-4">
              {!hasData ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Need at least 2 readings to show trends
                  </p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }} 
                        className="text-muted-foreground"
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 10 }} 
                        className="text-muted-foreground"
                        tickLine={false}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '12px' }}
                        iconSize={8}
                      />
                      <Line
                        type="monotone"
                        dataKey="systolic"
                        name="Systolic"
                        stroke="hsl(var(--destructive))"
                        strokeWidth={2}
                        dot={{ r: 3, fill: 'hsl(var(--destructive))' }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="diastolic"
                        name="Diastolic"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 3, fill: 'hsl(var(--primary))' }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="heartRate"
                        name="Heart Rate"
                        stroke="hsl(var(--heart))"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 2, fill: 'hsl(var(--heart))' }}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Legend explanation */}
              {hasData && (
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-4 rounded bg-destructive" />
                    <span>Systolic (top number)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-4 rounded bg-primary" />
                    <span>Diastolic (bottom number)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-0.5 w-4 border-t-2 border-dashed border-heart" />
                    <span>Heart Rate</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}