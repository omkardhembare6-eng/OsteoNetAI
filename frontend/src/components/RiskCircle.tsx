import { useEffect, useState } from "react";

interface RiskCircleProps {
  score: number;
  size?: number;
}

export default function RiskCircle({ score, size = 180 }: RiskCircleProps) {
  const [offset, setOffset] = useState(1);

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const clampedScore = Math.max(0, Math.min(1, score));

  const color =
    clampedScore < 0.3 ? "#10B981" : clampedScore <= 0.7 ? "#F59E0B" : "#EF4444";

  const riskLabel =
    clampedScore < 0.3 ? "Low Risk" : clampedScore <= 0.7 ? "Medium Risk" : "High Risk";

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setOffset(1 - clampedScore);
    });
    return () => cancelAnimationFrame(timer);
  }, [clampedScore]);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-gray-200 dark:stroke-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset * circumference}
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>

      {/* Center text overlay */}
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span
          className="font-bold text-gray-900 dark:text-white"
          style={{ fontSize: size * 0.18 }}
        >
          {(clampedScore * 100).toFixed(1)}%
        </span>
        <span
          className="font-medium mt-0.5"
          style={{ fontSize: size * 0.085, color }}
        >
          {riskLabel}
        </span>
      </div>
    </div>
  );
}
