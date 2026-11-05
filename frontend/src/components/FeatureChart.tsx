import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";

interface Contribution {
  label: string;
  contribution_percent: number;
  impact: string;
}

interface FeatureChartProps {
  contributions: Contribution[];
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload as Contribution;
  const color = data.impact === "increases" ? "#EF4444" : "#10B981";
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-900 dark:text-white">{data.label}</p>
      <p style={{ color }}>
        {data.impact === "increases" ? "↑ Increases" : "↓ Decreases"} risk by{" "}
        {Math.abs(data.contribution_percent).toFixed(1)}%
      </p>
    </div>
  );
}

export default function FeatureChart({ contributions }: FeatureChartProps) {
  const sortedData = [...contributions].sort(
    (a, b) => Math.abs(b.contribution_percent) - Math.abs(a.contribution_percent)
  );

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={Math.max(280, sortedData.length * 36)}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 4, right: 40, left: 10, bottom: 4 }}
          barCategoryGap="20%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-700"
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `${v}%`}
            className="text-gray-500 dark:text-gray-400"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={140}
            tick={{ fontSize: 11 }}
            className="text-gray-600 dark:text-gray-300"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
          <Bar dataKey="contribution_percent" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {sortedData.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.impact === "increases" ? "#EF4444" : "#10B981"}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#EF4444]" />
          Increases risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#10B981]" />
          Decreases risk
        </span>
      </div>
    </div>
  );
}
