import { Badge } from './Badge';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  badgeText?: string;
  badgeColor?: 'blue' | 'green' | 'red' | 'yellow';
  valueColor?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  badgeText, 
  badgeColor = 'blue',
  valueColor = 'text-blue-800'
}: MetricCardProps) {
  const badgeClasses = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200', 
    red: 'bg-red-100 text-red-700 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 rounded-lg border p-6">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-bl-full opacity-10"></div>
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <div className="w-6 h-6 bg-white rounded-md opacity-90"></div>
        </div>
        {badgeText && (
          <Badge className={badgeClasses[badgeColor]}>
            {badgeText}
          </Badge>
        )}
      </div>
      <h3 className="text-sm font-semibold text-blue-900 mb-2">{title}</h3>
      <p className={`text-2xl font-bold mb-1 ${valueColor}`}>
        {value}
      </p>
      <p className="text-sm text-blue-600">{subtitle}</p>
    </div>
  );
}
