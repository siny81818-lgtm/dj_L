import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Flame, AlertCircle } from 'lucide-react';
import { FormattedMeal } from '../types/neis';
import { fetchRangeMeals, formatDateToYmd } from '../services/neisApi';

interface MonthlyMealViewProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  userAllergens: number[];
}

export const MonthlyMealView: React.FC<MonthlyMealViewProps> = ({
  currentDate,
  onSelectDate,
  userAllergens,
}) => {
  const [viewYear, setViewYear] = useState<number>(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(currentDate.getMonth()); // 0-indexed
  const [meals, setMeals] = useState<FormattedMeal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Calculate start & end YMD of month
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

  const fromYmd = formatDateToYmd(firstDayOfMonth);
  const toYmd = formatDateToYmd(lastDayOfMonth);

  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setLoading(true);
      const res = await fetchRangeMeals(fromYmd, toYmd, userAllergens);
      if (!isCancelled) {
        setMeals(res.meals);
        setLoading(false);
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, [fromYmd, toYmd, userAllergens]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleThisMonth = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  // Calendar cells generation
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sun
  const totalDays = lastDayOfMonth.getDate();

  const calendarCells: { date: Date | null; dayNum: number | null }[] = [];
  // Prefix empty cells
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push({ date: null, dayNum: null });
  }
  // Days of month
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push({ date: new Date(viewYear, viewMonth, d), dayNum: d });
  }

  const todayYmd = formatDateToYmd(new Date());

  const dayHeaders = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="space-y-6">
      {/* Month Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            title="이전 달"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleThisMonth}
            className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
          >
            이번 달
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            title="다음 달"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-emerald-700" />
          <span className="text-base font-bold text-slate-900">
            {viewYear}년 {viewMonth + 1}월 급식 달력
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5 text-xs font-bold">
          {dayHeaders.map((dh, i) => (
            <div
              key={dh}
              className={i === 0 ? 'text-rose-600' : i === 6 ? 'text-blue-600' : 'text-slate-700'}
            >
              {dh}
            </div>
          ))}
        </div>

        {/* Days grid */}
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-600">월간 급식 일정을 불러오는 중입니다...</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {calendarCells.map((cell, idx) => {
              if (!cell.date || !cell.dayNum) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[90px] sm:min-h-[110px] bg-slate-50/50 p-2"
                  />
                );
              }

              const cellYmd = formatDateToYmd(cell.date);
              const isToday = cellYmd === todayYmd;
              const isSunday = cell.date.getDay() === 0;
              const isSaturday = cell.date.getDay() === 6;
              const dayMeal = meals.find((m) => m.date === cellYmd);
              const hasConflict = dayMeal?.dishes.some((d) => d.containsUserAllergen);

              return (
                <div
                  key={cellYmd}
                  onClick={() => onSelectDate(cell.date!)}
                  className={`min-h-[90px] sm:min-h-[110px] p-2 flex flex-col justify-between transition-colors cursor-pointer group ${
                    isToday
                      ? 'bg-emerald-50/60 ring-2 ring-emerald-500/30'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-emerald-700 text-white font-black'
                          : isSunday
                          ? 'text-rose-600'
                          : isSaturday
                          ? 'text-blue-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {hasConflict && (
                      <span title="알레르기 성분 포함">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                      </span>
                    )}
                  </div>

                  {/* Meal Snippet */}
                  {dayMeal ? (
                    <div className="space-y-1 my-1">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                        <Flame className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">
                          {dayMeal.calorieNumber ? `${Math.round(dayMeal.calorieNumber)}kcal` : '중식'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                        {dayMeal.dishes.slice(0, 2).map((d) => d.name).join(', ')}
                        {dayMeal.dishes.length > 2 && ' 외'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-300 py-1">
                      {isSunday || isSaturday ? '주말' : ''}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 group-hover:text-emerald-700 font-medium">
                    {dayMeal ? '상세보기 →' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
