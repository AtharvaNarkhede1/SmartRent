import React from 'react';
import {
  UserPlus,
  Building,
  UserMinus,
  CheckCircle,
  Wrench,
  Bell,
  Clock
} from 'lucide-react';
import { useSmartRent } from '../../context/SmartRentContext';

const iconMap = {
  UserPlus: UserPlus,
  Building: Building,
  UserMinus: UserMinus,
  CheckCircle: CheckCircle,
  Wrench: Wrench,
  Bell: Bell
};

export const RecentActivityTimeline = () => {
  const { activities } = useSmartRent();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Recent Activity Timeline</h4>
            <p className="text-[11px] text-slate-500">Live feed of portfolio and tenant movements</p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-slate-400">
          {activities.length} updates logged
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {activities.slice(0, 6).map((item) => {
          const IconComponent = iconMap[item.icon] || Clock;

          return (
            <div key={item.id} className="relative group">
              {/* Timeline Marker Dot */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              </div>

              {/* Event Content */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h5>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap sm:ml-4">
                  {item.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
