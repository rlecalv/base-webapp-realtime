'use client';

interface ConfidenceGaugeProps {
  value: number;
  className?: string;
}

export function ConfidenceGauge({ value, className = '' }: ConfidenceGaugeProps) {
  const percentage = Math.min(Math.max(value, 0), 100);
  const circumference = 2 * Math.PI * 45; // rayon de 45
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 80) return '#10b981'; // green
    if (val >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className={`bg-white rounded-lg p-6 shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Score de confiance</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          <svg className="transform -rotate-90 w-48 h-48">
            <circle
              cx="96"
              cy="96"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="45"
              stroke={getColor(percentage)}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold" style={{ color: getColor(percentage) }}>
                {percentage}%
              </div>
              <div className="text-sm text-gray-500 mt-1">Confiance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

