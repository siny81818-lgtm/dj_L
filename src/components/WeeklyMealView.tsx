import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Utensils,
} from 'lucide-react';
import { FormattedMeal, ALLERGEN_DICT } from '../types/neis';
import { fetchRangeMeals, formatDateToYmd } from '../services/neisApi';

interface WeeklyMealViewProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  userAllergens: number[];
}

export const WeeklyMealView: React.FC<WeeklyMealViewProps> = ({
  currentDate,
  onSelectDate,
  userAllergens,
}) => {
  const [weekStart, setWeekStart] = useState<Date>(() => {
    // Calculate Monday of the given week
    const d = new Date(currentDate);
    const day = d.getDay(); // 0 is Sun, 1 is Mon
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });

  const [meals, setMeals] = useState<FormattedMeal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Calculate Monday to Friday (5 school days)
  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const fromYmd = formatDateToYmd(weekDays[0]);
  const toYmd = formatDateToYmd(weekDays[4]);

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

  const handlePrevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
  };

  const handleThisWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    setWeekStart(new Date(d.setDate(diff)));
  };

  const todayYmd = formatDateToYmd(new Date());

  const dayNames = ['월요일', '화요일', '수요일', '목요일', '금요일'];

  return (
    <div className="space-y-6">
      {/* Week Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevWeek}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            title="이전 주"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleThisWeek}
            className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
          >
            이번 주
          </button>
          <button
            onClick={handleNextWeek}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            title="다음 주"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-700" />
          <span className="text-sm font-bold text-slate-800">
            {weekDays[0].getFullYear()}년 {weekDays[0].getMonth() + 1}월 {weekDays[0].getDate()}일 ~{' '}
            {weekDays[4].getMonth() + 1}월 {weekDays[4].getDate()}일 식단표
          </span>
        </div>
      </div>

      {/* Weekday Cards Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">주간 식단표를 불러오는 중입니다...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {weekDays.map((dayDate, idx) => {
            const dayYmd = formatDateToYmd(dayDate);
            const isToday = dayYmd === todayYmd;
            const dayMeal = meals.find((m) => m.date === dayYmd);
            const hasConflict = dayMeal?.dishes.some((d) => d.containsUserAllergen);

            return (
              <div
                key={dayYmd}
                className={`flex flex-col justify-between rounded-2xl border transition-all ${
                  isToday
                    ? 'bg-emerald-50/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Header */}
                <div
                  className={`p-3.5 border-b flex items-center justify-between ${
                    isToday
                      ? 'bg-emerald-700 text-white rounded-t-2xl'
                      : 'bg-slate-50 text-slate-800 rounded-t-2xl border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold">{dayNames[idx]}</span>
                      {isToday && (
                        <span className="px-1.5 py-0.5 rounded bg-white text-emerald-800 text-[10px] font-black">
                          오늘
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium opacity-90">
                      {dayDate.getMonth() + 1}월 {dayDate.getDate()}일
                    </span>
                  </div>

                  {dayMeal && (
                    <div className="flex items-center gap-1 text-xs font-semibold">
                      <Flame className={`w-3.5 h-3.5 ${isToday ? 'text-amber-300' : 'text-amber-500'}`} />
                      <span>{dayMeal.calorieNumber ? `${Math.round(dayMeal.calorieNumber)}kcal` : ''}</span>
                    </div>
                  )}
                </div>

                {/* Body: Dishes */}
                <div className="p-4 flex-1">
                  {dayMeal ? (
                    <div className="space-y-2">
                      {hasConflict && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 p-1.5 rounded-lg">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>알레르기 성분 포함</span>
                        </div>
                      )}

                      <ul className="space-y-1.5 text-xs">
                        {dayMeal.dishes.map((dish, dIdx) => (
                          <li
                            key={dIdx}
                            className={`flex items-start justify-between gap-1 py-1 px-1.5 rounded ${
                              dish.containsUserAllergen ? 'bg-rose-50 text-rose-950 font-bold' : 'text-slate-800'
                            }`}
                          >
                            <span className="truncate">• {dish.name}</span>
                            {dish.allergens.length > 0 && (
                              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                ({dish.allergens.slice(0, 3).join('.')})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-xs">
                      <Utensils className="w-6 h-6 mb-1 opacity-40" />
                      <span>급식 없음</span>
                    </div>
                  )}
                </div>

                {/* Footer Link */}
                <div className="p-3 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl">
                  <button
                    onClick={() => onSelectDate(dayDate)}
                    className="w-full flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>상세 보기</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
