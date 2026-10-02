import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Flame,
  AlertTriangle,
  Share2,
  Check,
  Utensils,
  Wheat,
  PieChart,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { FormattedMeal, ALLERGEN_DICT } from '../types/neis';
import { fetchDailyMeals, formatDateToYmd, formatYmdToKorean } from '../services/neisApi';

interface DailyMealViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  userAllergens: number[];
  onOpenAllergenModal: () => void;
}

export const DailyMealView: React.FC<DailyMealViewProps> = ({
  selectedDate,
  onDateChange,
  userAllergens,
  onOpenAllergenModal,
}) => {
  const [meals, setMeals] = useState<FormattedMeal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedMealIndex, setSelectedMealIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [showOrigins, setShowOrigins] = useState<boolean>(false);
  const [showNutrients, setShowNutrients] = useState<boolean>(false);

  const ymd = formatDateToYmd(selectedDate);
  const dateFormattedString = selectedDate.toISOString().split('T')[0];

  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetchDailyMeals(ymd, userAllergens);
      if (!isCancelled) {
        setMeals(res.meals);
        if (res.message && res.meals.length === 0) {
          setErrorMessage(res.message);
        }
        setSelectedMealIndex(0);
        setLoading(false);
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, [ymd, userAllergens]);

  // Navigate date
  const handlePrevDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() - 1);
    onDateChange(next);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    onDateChange(next);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const parts = e.target.value.split('-');
      const newD = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      );
      onDateChange(newD);
    }
  };

  // Jump to nearest weekday
  const handleJumpToWeekday = () => {
    const next = new Date(selectedDate);
    const day = next.getDay();
    if (day === 6) {
      // Saturday -> Monday
      next.setDate(next.getDate() + 2);
    } else if (day === 0) {
      // Sunday -> Monday
      next.setDate(next.getDate() + 1);
    } else {
      next.setDate(next.getDate() + 1);
    }
    onDateChange(next);
  };

  // Current active meal
  const currentMeal = meals[selectedMealIndex] || meals[0];

  // Check if current meal has user allergen
  const hasUserAllergenConflict = currentMeal?.dishes.some((d) => d.containsUserAllergen);

  // Copy meal text
  const handleCopyMenu = () => {
    if (!currentMeal) return;
    const text = [
      `🍱 대진전자통신고등학교 급식 (${currentMeal.dateDisplay})`,
      `[${currentMeal.mealName}] - ${currentMeal.calorie}`,
      '------------------------',
      ...currentMeal.dishes.map((d) => `• ${d.name}`),
      '------------------------',
      `* 출처: 대진전자통신고 실시간 급식 알리미`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="space-y-6">
      {/* Date Navigation Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            title="이전 날짜"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
          >
            오늘
          </button>
          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            title="다음 날짜"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Date Display & Picker */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Calendar className="w-4 h-4 text-emerald-700 absolute left-3 pointer-events-none" />
            <input
              type="date"
              value={dateFormattedString}
              onChange={handleDateInput}
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50 hover:bg-white transition-colors cursor-pointer"
            />
          </div>
          <span className="text-sm font-bold text-slate-700 hidden md:inline">
            {formatYmdToKorean(ymd)}
          </span>
        </div>

        {/* Meal Type Selector (if multiple) */}
        {meals.length > 1 && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {meals.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => setSelectedMealIndex(idx)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedMealIndex === idx
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.mealName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Allergen Warning Banner if applicable */}
      {hasUserAllergenConflict && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold block">
              알레르기 주의 안내!
            </span>
            <span>
              오늘 식단에 회원님이 등록하신 알레르기 유발 성분이 포함된 요리가 있습니다. 붉은색으로 강조된 메뉴를 확인해 주세요.
            </span>
          </div>
        </div>
      )}

      {/* Main Meal Content */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">
            나이스(NEIS) 실시간 급식 정보를 불러오는 중입니다...
          </p>
        </div>
      ) : meals.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 sm:p-14 border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Utensils className="w-8 h-8" />
          </div>
          <div>
            {/* 조회 날짜 표시 */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-sm sm:text-base font-bold border border-emerald-200 mb-3 shadow-xs">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>{formatYmdToKorean(ymd)}</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-800">
              {errorMessage || '해당 일자에는 급식 식단 정보가 없습니다 (주말, 공휴일 또는 방학).'}
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              주말, 공휴일, 개교기념일 또는 방학 기간에는 급식이 제공되지 않습니다.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleJumpToWeekday}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <span>다음 평일 급식 보기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrevDay}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
            >
              어제 급식 보기
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Meal Tray Card (Col span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-white/20 text-white text-xs font-bold tracking-wide uppercase">
                      {currentMeal.mealName}
                    </span>
                    <span className="text-xs text-emerald-200">
                      {currentMeal.dinerCount > 0 ? `급식 인원: ${currentMeal.dinerCount}명` : '실시간 NEIS 연동'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                    {currentMeal.dateDisplay}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  {/* Calorie Pill */}
                  <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/10">
                    <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-sm font-bold tracking-tight">
                      {currentMeal.calorie}
                    </span>
                  </div>

                  {/* Share button */}
                  <button
                    onClick={handleCopyMenu}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    title="식단 복사하기"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Dish List */}
              <div className="p-5 sm:p-6 space-y-3.5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                  <span>오늘의 메뉴 구성 ({currentMeal.dishes.length}종)</span>
                  <button
                    onClick={onOpenAllergenModal}
                    className="text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    알레르기 설정 변경 →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {currentMeal.dishes.map((dish, idx) => {
                    const isAlert = dish.containsUserAllergen;

                    return (
                      <div
                        key={idx}
                        className={`py-3.5 px-3 rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          isAlert
                            ? 'bg-rose-50/80 border border-rose-200/90'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                              isAlert
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <span
                              className={`text-base font-bold ${
                                isAlert ? 'text-rose-950 font-black' : 'text-slate-900'
                              }`}
                            >
                              {dish.name}
                            </span>
                            {isAlert && (
                              <span className="block text-xs font-semibold text-rose-600 mt-0.5">
                                ⚠️ 주의: 설정하신 알레르기 식품이 포함되어 있습니다!
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Allergen Tags */}
                        {dish.allergens.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 sm:justify-end pl-9 sm:pl-0">
                            {dish.allergens.map((algNum) => {
                              const algInfo = ALLERGEN_DICT[algNum];
                              const isUserConflict = userAllergens.includes(algNum);

                              return (
                                <span
                                  key={algNum}
                                  title={`${algNum}번: ${algInfo?.name || '알레르기'}`}
                                  className={`inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-md font-medium transition-all ${
                                    isUserConflict
                                      ? 'bg-rose-600 text-white font-bold animate-pulse'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  <span>{algInfo?.icon}</span>
                                  <span>{algInfo?.name || `#${algNum}`}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card Footer: Calorie health meter */}
              <div className="bg-slate-50/80 px-6 py-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                  <span className="font-semibold">고등학생 일일 권장 중식 열량 (~950 Kcal)</span>
                  <span className="font-bold text-slate-800">
                    {currentMeal.calorieNumber > 0
                      ? `${Math.round((currentMeal.calorieNumber / 950) * 100)}% 섭취`
                      : currentMeal.calorie}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((currentMeal.calorieNumber / 950) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info: Nutrition & Origin (Col span 1) */}
          <div className="space-y-6">
            {/* Nutritional Facts Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-700" />
                  <span>영양 성분 정보</span>
                </h3>
                <span className="text-xs text-slate-400">나이스 공식</span>
              </div>

              {currentMeal.nutrients.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">
                  등록된 상세 영양 성분 정보가 없습니다.
                </p>
              ) : (
                <div className="space-y-3">
                  {/* Key Macro Nutrients */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {['탄수화물', '단백질', '지방'].map((macro) => {
                      const item = currentMeal.nutrients.find((n) => n.name.includes(macro));
                      return (
                        <div key={macro} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-xs text-slate-500 block">{macro}</span>
                          <span className="text-sm font-bold text-slate-800 block mt-0.5">
                            {item ? `${item.value}${item.unit || 'g'}` : '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Micro Nutrients Accordion */}
                  <div className="pt-2">
                    <button
                      onClick={() => setShowNutrients(!showNutrients)}
                      className="w-full text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center justify-between py-1 cursor-pointer"
                    >
                      <span>{showNutrients ? '비타민/무기질 숨기기 ▲' : '상세 비타민 및 무기질 보기 ▼'}</span>
                    </button>

                    {showNutrients && (
                      <div className="mt-2.5 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {currentMeal.nutrients.map((n, i) => (
                          <div key={i} className="flex justify-between items-center py-0.5 border-b border-slate-200/50 last:border-0">
                            <span className="text-slate-500">{n.name}</span>
                            <span className="font-semibold text-slate-800">{n.value} {n.unit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Origin Information Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span>식재료 원산지 표시</span>
                </h3>
                <button
                  onClick={() => setShowOrigins(!showOrigins)}
                  className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
                >
                  {showOrigins ? '간략히' : '전체보기'}
                </button>
              </div>

              {currentMeal.origins.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">
                  등록된 식재료 원산지 정보가 없습니다.
                </p>
              ) : (
                <div className="space-y-1 text-xs">
                  {(showOrigins ? currentMeal.origins : currentMeal.origins.slice(0, 6)).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-slate-600">{item.ingredient}</span>
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {item.origin}
                      </span>
                    </div>
                  ))}
                  {!showOrigins && currentMeal.origins.length > 6 && (
                    <p className="text-center text-xs text-slate-400 pt-1">
                      외 {currentMeal.origins.length - 6}개 품목
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
