'use client';

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

interface FinancialAnalysisProps {
  comparables: Array<{
    id: number;
    prix: number;
    prix_m2: number;
    surface: number;
    date_transaction?: string;
    date_publication?: string;
  }>;
  estimationValue: number;
  medianPriceM2?: number;
  className?: string;
}

export function FinancialAnalysis({ comparables, estimationValue, medianPriceM2, className = '' }: FinancialAnalysisProps) {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Préparer les données pour le graphique
  const chartData = comparables
    .slice(0, 10)
    .map((comp, index) => ({
      name: `Comp ${index + 1}`,
      prix_total: comp.prix,
      prix_m2: comp.prix_m2,
      surface: comp.surface,
    }));

  // Ajouter la ligne de référence pour l'estimation
  const dataWithEstimation = chartData.map(item => ({
    ...item,
    estimation_reference: estimationValue / item.surface, // Prix au m² de l'estimation
  }));

  return (
    <div className={`bg-white rounded-lg p-6 shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyse financière comparative</h3>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={dataWithEstimation} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            yAxisId="left"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={formatPrice}
            label={{ value: 'Prix au m² (€)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={formatPrice}
            label={{ value: 'Prix total (€)', angle: 90, position: 'insideRight', style: { fontSize: '12px' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'prix_total') return [formatPrice(value), 'Prix total'];
              if (name === 'prix_m2') return [formatPrice(value), 'Prix/m²'];
              if (name === 'estimation_reference') return [formatPrice(value), 'Estimation référence'];
              return [value, name];
            }}
          />
          {medianPriceM2 && (
            <ReferenceLine 
              yAxisId="left"
              y={medianPriceM2} 
              stroke="#10b981" 
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ value: 'Médiane', position: 'right', fill: '#10b981', fontSize: 11 }}
            />
          )}
          <Bar 
            yAxisId="right"
            dataKey="prix_total" 
            fill="#93c5fd" 
            radius={[4, 4, 0, 0]}
            name="Prix total"
            opacity={0.7}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="prix_m2" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5 }}
            activeDot={{ r: 7 }}
            name="Prix au m²"
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="estimation_reference" 
            stroke="#10b981" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#10b981', r: 4 }}
            name="Estimation référence"
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-gray-600 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Ligne bleue : Prix au m² des comparables</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Ligne verte : Prix au m² de votre estimation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-200 rounded"></div>
          <span>Barres : Prix total des comparables</span>
        </div>
      </div>
    </div>
  );
}

