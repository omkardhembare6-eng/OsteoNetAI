import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  subtitle?: string;
}

export default function StatsCard({ title, value, icon, color, subtitle }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex items-center gap-4 hover:scale-[1.03] transition-transform duration-200 cursor-default">
      {/* Icon */}
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 ${color}`}
      >
        <span className="text-white">{icon}</span>
      </div>

      {/* Content */}
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">
          {value}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
