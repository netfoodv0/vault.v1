import React from 'react';

type SimpleBarChartProps = {
  title: string;
  data: {
    label: string;
    value: number;
  }[];
  maxValue?: number;
};

export default function SimpleBarChart({ title, data, maxValue }: SimpleBarChartProps) {
  // Encontrar o valor máximo para calcular as proporções
  const calculatedMaxValue = maxValue || Math.max(...data.map(item => item.value));
  
  return (
    <div className="mb-6 bg-white p-4 rounded-md shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.value / calculatedMaxValue) * 100;
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-purple-600 h-2.5 rounded-full" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 