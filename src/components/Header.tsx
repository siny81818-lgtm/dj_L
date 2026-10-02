import React from 'react';
import { School, ShieldAlert, FileText, Info } from 'lucide-react';
import { DAEJIN_SCHOOL_INFO } from '../types/neis';

interface HeaderProps {
  onOpenSchoolInfo: () => void;
  onOpenAllergenModal: () => void;
  activeView: 'daily' | 'weekly' | 'monthly' | 'prd';
  onSelectView: (view: 'daily' | 'weekly' | 'monthly' | 'prd') => void;
  allergenCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSchoolInfo,
  onOpenAllergenModal,
  activeView,
  onSelectView,
  allergenCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/10">
            <School className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {DAEJIN_SCHOOL_INFO.officeName}
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                NEIS 공식 식단 연동
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>대진전자통신고등학교</span>
              <span className="text-emerald-700 font-semibold text-base hidden md:inline">
                급식 알리미
              </span>
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* PRD View Button */}
          <button
            onClick={() => onSelectView('prd')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeView === 'prd'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
            }`}
            title="제품 요구사항 정의서(PRD) 확인"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden xs:inline">PRD 문서</span>
          </button>

          {/* Allergen Filter Trigger */}
          <button
            onClick={onOpenAllergenModal}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative ${
              allergenCount > 0
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
            title="알레르기 성분 설정"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>알레르기</span>
            {allergenCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-amber-600 text-xs font-bold flex items-center justify-center -ml-0.5">
                {allergenCount}
              </span>
            )}
          </button>

          {/* School Info Trigger */}
          <button
            onClick={onOpenSchoolInfo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
            title="학교 정보 보기"
          >
            <Info className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">학교 정보</span>
          </button>
        </div>
      </div>
    </header>
  );
};
