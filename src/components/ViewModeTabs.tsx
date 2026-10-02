import React from 'react';
import { CalendarDays, CalendarRange, Calendar as CalendarIcon, FileText } from 'lucide-react';

export type ViewMode = 'daily' | 'weekly' | 'monthly' | 'prd';

interface ViewModeTabsProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
}

export const ViewModeTabs: React.FC<ViewModeTabsProps> = ({ currentView, onSelectView }) => {
  const tabs = [
    { id: 'daily' as ViewMode, label: '오늘/일별 급식', icon: CalendarDays },
    { id: 'weekly' as ViewMode, label: '주간 식단표', icon: CalendarRange },
    { id: 'monthly' as ViewMode, label: '월간 달력', icon: CalendarIcon },
    { id: 'prd' as ViewMode, label: 'PRD 기획서', icon: FileText, highlight: true },
  ];

  return (
    <div className="flex items-center justify-center p-1 bg-slate-200/80 rounded-2xl max-w-md mx-auto shadow-inner">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectView(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              isActive
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
