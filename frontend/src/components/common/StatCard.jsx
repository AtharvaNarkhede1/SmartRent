import React from 'react';

export const StatCard = ({
  icon: Icon,
  label,
  value,
  description,
  trend,
  trendType = 'positive', // 'positive' | 'negative' | 'neutral'
  badge,
  onClick,
  className = ''
}) => {
  const content = (
    <>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
            {trend && (
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                  trendType === 'positive'
                    ? 'text-emerald-700 bg-emerald-50'
                    : trendType === 'negative'
                    ? 'text-rose-700 bg-rose-50'
                    : 'text-slate-600 bg-slate-100'
                }`}
              >
                {trend}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">{description}</p>
          )}
        </div>

        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-colors shrink-0 ml-3">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {badge && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{badge}</span>
        </div>
      )}
    </>
  );
  const classes = `w-full bg-white rounded-xl border border-slate-200 p-4 text-left shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-150 relative overflow-hidden group ${onClick ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2' : ''} ${className}`;
  return onClick ? <button type="button" onClick={onClick} className={classes}>{content}</button> : <div className={classes}>{content}</div>;
};
