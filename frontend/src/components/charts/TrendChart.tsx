'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

interface TrendChartProps {
  data: Array<{
    date: string;
    prix_m2: number;
    prix_m2_median?: number;
  }>;
  medianPrice?: number;
  className?: string;
}

export function TrendChart({ data, medianPrice, className = '' }: TrendChartProps) {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  };

  return (
    <div className={`bg-white rounded-lg p-6 shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution temporelle des prix</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={formatDate}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={formatPrice}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => formatPrice(value)}
            labelFormatter={(label) => formatDate(label)}
          />
          {medianPrice && (
            <ReferenceLine 
              y={medianPrice} 
              stroke="#10b981" 
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ value: 'Médiane', position: 'right', fill: '#10b981', fontSize: 12 }}
            />
          )}
          <Line 
            type="monotone" 
            dataKey="prix_m2" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
            name="Prix au m²"
          />
          {data.some(d => d.prix_m2_median) && (
            <Line 
              type="monotone" 
              dataKey="prix_m2_median" 
              stroke="#10b981" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#10b981', r: 3 }}
              name="Médiane"
            />
          )}
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

