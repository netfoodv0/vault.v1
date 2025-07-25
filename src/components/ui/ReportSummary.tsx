import React from 'react';

type ReportSummaryProps = {
  title: string;
  data: {
    label: string;
    value: string | number;
    color?: string;
    icon?: React.ReactNode;
  }[];
};

export default function ReportSummary({ title, data }: ReportSummaryProps) {
  return (
    <div className="mb-6">
      <h3 className="text-[20px] font-bold mb-3">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item, index) => (
          <div 
            key={index} 
            className="bg-white p-4 rounded-md border border-gray-200 flex items-center"
          >
            {item.icon && <div className="mr-4 text-gray-500">{item.icon}</div>}
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">{item.label}</div>
              <div 
                className="text-xl font-semibold" 
                style={{ color: item.color || '#374151' }}
              >
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 