import React from 'react';

interface RiskScoreMeterProps {
  score: number; // 0 to 100
  size?: number;
}

export const RiskScoreMeter: React.FC<RiskScoreMeterProps> = ({ score, size = 120 }) => {
  const clampedScore = Math.max(0, Math.min(100, score));

  // Determine color according to risk score
  let strokeColor = '#10b981'; // Green
  let riskLabel = 'LOW RISK';
  let textColor = 'text-emerald-400';

  if (clampedScore >= 75) {
    strokeColor = '#ef4444'; // Red
    riskLabel = 'HIGH RISK';
    textColor = 'text-rose-400';
  } else if (clampedScore >= 40) {
    strokeColor = '#f59e0b'; // Amber
    riskLabel = 'ELEVATED';
    textColor = 'text-amber-400';
  } else if (clampedScore >= 20) {
    strokeColor = '#06b6d4'; // Cyan
    riskLabel = 'MODERATE';
    textColor = 'text-cyan-400';
  }

  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-2xl font-bold font-mono ${textColor}`}>{clampedScore}</span>
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">/ 100</span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <span className={`text-xs font-semibold tracking-wider font-mono ${textColor}`}>
          {riskLabel}
        </span>
      </div>
    </div>
  );
};
