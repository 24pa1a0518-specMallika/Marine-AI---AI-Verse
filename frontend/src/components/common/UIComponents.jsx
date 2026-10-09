import React from 'react';

/**
 * Standardized Card Header matching the Weather & Ocean heading style from Dashboard
 */
export function CardHeader({ title, icon: Icon, badge, action, className = '' }) {
  return (
    <div className={`flex items-center justify-between border-b border-[#E2E8F0] pb-2.5 mb-3 ${className}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-[#1363DF]" />}
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-700">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {badge}
        {action}
      </div>
    </div>
  );
}

/**
 * Standardized Status Badge (LOW / MODERATE / HIGH / RESTRICTED)
 */
export function StatusBadge({ status = 'LOW', label, icon: Icon }) {
  const normalized = status.toUpperCase();

  let styles = 'bg-slate-50 text-slate-700 border-slate-200';

  if (normalized.includes('LOW') || normalized.includes('SAFE') || normalized.includes('OPTIMAL') || normalized.includes('GREEN')) {
    styles = 'bg-[#F0FDF4] text-[#15803D] border-[#DCFCE7]';
  } else if (normalized.includes('MOD') || normalized.includes('CAUTION') || normalized.includes('WARNING') || normalized.includes('ELEVATED')) {
    styles = 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]';
  } else if (normalized.includes('HIGH') || normalized.includes('DANGER') || normalized.includes('RESTRICTED') || normalized.includes('CRITICAL')) {
    styles = 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]';
  }

  return (
    <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border flex items-center gap-1 ${styles}`}>
      {Icon && <Icon className="w-3 h-3" />}
      <span>{label || status}</span>
    </span>
  );
}

/**
 * Standardized Marine Action Button
 */
export function MarineButton({ children, variant = 'primary', icon: Icon, onClick, className = '' }) {
  let baseStyle = 'px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98';

  if (variant === 'primary') {
    baseStyle += ' bg-[#06283D] hover:bg-[#04111D] text-white';
  } else if (variant === 'ai') {
    baseStyle += ' bg-[#00B4D8] hover:bg-[#0096B4] text-[#001F3F] font-bold';
  } else if (variant === 'secondary') {
    baseStyle += ' bg-[#1363DF] hover:bg-[#003366] text-white';
  } else if (variant === 'ghost') {
    baseStyle += ' bg-white border border-[#1363DF]/40 text-[#1363DF] hover:bg-[#1363DF]/5 shadow-none';
  } else if (variant === 'neutral') {
    baseStyle += ' bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-none';
  } else if (variant === 'danger') {
    baseStyle += ' bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold';
  }

  return (
    <button onClick={onClick} className={`${baseStyle} ${className}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{children}</span>
    </button>
  );
}
