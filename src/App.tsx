import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ViewModeTabs, ViewMode } from './components/ViewModeTabs';
import { DailyMealView } from './components/DailyMealView';
import { WeeklyMealView } from './components/WeeklyMealView';
import { MonthlyMealView } from './components/MonthlyMealView';
import { PrdViewer } from './components/PrdViewer';
import { SchoolInfoModal } from './components/SchoolInfoModal';
import { AllergenSettingsModal } from './components/AllergenSettingsModal';
import { DAEJIN_SCHOOL_INFO } from './types/neis';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Info } from 'lucide-react';

const STORAGE_KEY_ALLERGENS = 'daejin_school_user_allergens';

export default function App() {
  const [activeView, setActiveView] = useState<ViewMode>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [userAllergens, setUserAllergens] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ALLERGENS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load allergens from localStorage', e);
    }
    return [];
  });

  const [isSchoolInfoOpen, setIsSchoolInfoOpen] = useState<boolean>(false);
  const [isAllergenModalOpen, setIsAllergenModalOpen] = useState<boolean>(false);

  // Save allergens
  const handleUpdateAllergens = (allergens: number[]) => {
    setUserAllergens(allergens);
    try {
      localStorage.setItem(STORAGE_KEY_ALLERGENS, JSON.stringify(allergens));
    } catch (e) {
      console.error('Failed to save allergens to localStorage', e);
    }
  };

  // Jump date handler
  const handleSelectDateFromChild = (date: Date) => {
    setSelectedDate(date);
    setActiveView('daily');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sample meal date jump (useful during vacation/weekend to immediately test live NEIS data)
  const handleSampleDateJump = (sampleDateStr: string) => {
    const parts = sampleDateStr.split('-');
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    setSelectedDate(d);
    setActiveView('daily');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <Header
        onOpenSchoolInfo={() => setIsSchoolInfoOpen(true)}
        onOpenAllergenModal={() => setIsAllergenModalOpen(true)}
        activeView={activeView}
        onSelectView={setActiveView}
        allergenCount={userAllergens.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Navigation Tabs */}
        <ViewModeTabs currentView={activeView} onSelectView={setActiveView} />

        {/* Live Data Sample Tip (Discreet Helper) */}
        {activeView !== 'prd' && (
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span className="font-semibold">
                NEIS 공식 식단 데이터 실시간 연동 중
              </span>
              <span className="hidden sm:inline text-emerald-700/80">
                · 부산광역시 금정구 수림로 92 (대진전자통신고등학교)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">테스트 식단 바로가기:</span>
              <button
                onClick={() => handleSampleDateJump('2024-09-04')}
                className="px-2 py-0.5 rounded bg-white hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 transition-colors cursor-pointer"
              >
                투움바파스타 식단
              </button>
              <button
                onClick={() => handleSampleDateJump('2024-09-06')}
                className="px-2 py-0.5 rounded bg-white hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 transition-colors cursor-pointer"
              >
                통모짜치즈카츠 식단
              </button>
            </div>
          </div>
        )}

        {/* View Content */}
        {activeView === 'daily' && (
          <DailyMealView
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            userAllergens={userAllergens}
            onOpenAllergenModal={() => setIsAllergenModalOpen(true)}
          />
        )}

        {activeView === 'weekly' && (
          <WeeklyMealView
            currentDate={selectedDate}
            onSelectDate={handleSelectDateFromChild}
            userAllergens={userAllergens}
          />
        )}

        {activeView === 'monthly' && (
          <MonthlyMealView
            currentDate={selectedDate}
            onSelectDate={handleSelectDateFromChild}
            userAllergens={userAllergens}
          />
        )}

        {activeView === 'prd' && <PrdViewer />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-bold text-slate-700">
              대진전자통신고등학교 (Daejin High School of Electronics & Communication)
            </p>
            <p>
              {DAEJIN_SCHOOL_INFO.address} · 대표전화: {DAEJIN_SCHOOL_INFO.tel} · 행정표준코드: {DAEJIN_SCHOOL_INFO.schoolCode}
            </p>
            <p className="text-slate-400">
              식단 및 영양 데이터 출처: 교육부 나이스(NEIS) 교육정보 개방포털 공공데이터 API
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('prd')}
              className="text-indigo-600 hover:underline font-semibold cursor-pointer"
            >
              PRD 기획서 전문 보기
            </button>
            <span>·</span>
            <button
              onClick={() => setIsSchoolInfoOpen(true)}
              className="text-slate-600 hover:underline cursor-pointer"
            >
              학교 기본 정보
            </button>
            <span>·</span>
            <a
              href="https://open.neis.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:underline"
            >
              나이스 오픈데이터
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SchoolInfoModal
        isOpen={isSchoolInfoOpen}
        onClose={() => setIsSchoolInfoOpen(false)}
      />

      <AllergenSettingsModal
        isOpen={isAllergenModalOpen}
        onClose={() => setIsAllergenModalOpen(false)}
        selectedAllergens={userAllergens}
        onChange={handleUpdateAllergens}
      />
    </div>
  );
}
