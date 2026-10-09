import React from 'react';
import { CheckCircle2, RotateCw } from 'lucide-react';

export default function ProcessingPipeline() {
  const steps = [
    'Understanding request',
    'Checking weather',
    'Checking ocean conditions',
    'Finding suitable PFZ',
    'Assessing marine risk',
    'Checking restricted zones',
    'Optimizing safe route'
  ];

  return (
    <div className="bg-[#132C40] border border-[#1E3F5A] rounded-xl p-4 space-y-2.5 max-w-md shadow-card">
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#C9A961] border-b border-[#1E3F5A] pb-2">
        <RotateCw className="w-3.5 h-3.5 animate-spin" />
        <span>Processing Marine Telemetry</span>
      </div>

      <div className="space-y-1.5 text-xs font-mono text-[#8EA5B5]">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3E7C6B] shrink-0" />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
