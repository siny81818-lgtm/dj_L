import {
  DAEJIN_SCHOOL_INFO,
  FormattedMeal,
  NeisMealResponse,
  NeisMealRow,
  NutrientItem,
  OriginItem,
  ParsedDish,
} from '../types/neis';

const NEIS_API_BASE = 'https://open.neis.go.kr/hub/mealServiceDietInfo';

// In-memory cache to prevent repeated requests
const memoryCache = new Map<string, FormattedMeal[]>();

/**
 * Format Date to YYYYMMDD
 */
export function formatDateToYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Format YYYYMMDD to Korean display (e.g. 2026년 10월 2일 (금))
 */
export function formatYmdToKorean(ymd: string): string {
  if (ymd.length !== 8) return ymd;
  const y = parseInt(ymd.substring(0, 4), 10);
  const m = parseInt(ymd.substring(4, 6), 10);
  const d = parseInt(ymd.substring(6, 8), 10);
  const dateObj = new Date(y, m - 1, d);
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayName = days[dateObj.getDay()];
  return `${y}년 ${m}월 ${d}일 (${dayName})`;
}

/**
 * Parse dish string with allergens
 * Handles both "(1.2.5.6)" and "1.5.13." formats
 */
export function parseDishes(ddishNm: string, userAllergens: number[] = []): ParsedDish[] {
  if (!ddishNm) return [];

  // Split by <br/> or \n
  const rawItems = ddishNm.split(/<br\s*\/?>|\n/).map((s) => s.trim()).filter(Boolean);

  return rawItems.map((item) => {
    const allergenSet = new Set<number>();

    // 1. Check parenthesized allergens like (1.2.5.6.10) or (1,2,5)
    const parenMatches = item.match(/\(([\d\.\s,]+)\)/g);
    if (parenMatches) {
      for (const pm of parenMatches) {
        const nums = pm.replace(/[^\d.]/g, ' ').split(/\s+/).filter(Boolean);
        for (const numStr of nums) {
          const subNums = numStr.split('.').filter(Boolean);
          for (const sn of subNums) {
            const n = parseInt(sn, 10);
            if (!isNaN(n) && n >= 1 && n <= 19) allergenSet.add(n);
          }
        }
      }
    }

    // 2. Check trailing allergen numbers like 1.5.13. at end of line
    const trailingMatches = item.match(/[\d\.]+\.?$/);
    if (trailingMatches) {
      const parts = trailingMatches[0].split('.').filter(Boolean);
      for (const p of parts) {
        const n = parseInt(p, 10);
        if (!isNaN(n) && n >= 1 && n <= 19) allergenSet.add(n);
      }
    }

    // Clean dish name
    let cleanName = item
      .replace(/\([\d\.\s,]+\)/g, '') // remove (1.2.5)
      .replace(/[\d\.]+\.?$/, '')     // remove trailing numbers
      .trim();

    // Remove any leftover special chars at end
    cleanName = cleanName.replace(/[\s\.\-]+$/, '').trim();

    const allergens = Array.from(allergenSet).sort((a, b) => a - b);
    const containsUserAllergen = allergens.some((a) => userAllergens.includes(a));

    return {
      name: cleanName || item,
      allergens,
      containsUserAllergen,
    };
  });
}

/**
 * Parse Nutrient Info string (e.g. "탄수화물(g) : 153.3<br/>단백질(g) : 39.0")
 */
export function parseNutrients(ntrInfo: string): NutrientItem[] {
  if (!ntrInfo) return [];
  const lines = ntrInfo.split(/<br\s*\/?>|\n/).map((s) => s.trim()).filter(Boolean);

  const nutrients: NutrientItem[] = [];
  for (const line of lines) {
    const match = line.match(/^([^:(]+)(?:\(([^)]+)\))?\s*:\s*([\d.]+)/);
    if (match) {
      nutrients.push({
        name: match[1].trim(),
        unit: match[2]?.trim() || '',
        value: parseFloat(match[3]) || 0,
      });
    }
  }
  return nutrients;
}

/**
 * Parse Origin Info string
 */
export function parseOrigins(orplc: string): OriginItem[] {
  if (!orplc) return [];
  const lines = orplc.split(/<br\s*\/?>|\n/).map((s) => s.trim()).filter(Boolean);
  const items: OriginItem[] = [];

  for (const line of lines) {
    const [ingredient, origin] = line.split(':').map((s) => s.trim());
    if (ingredient && origin) {
      items.push({ ingredient, origin });
    }
  }
  return items;
}

/**
 * Transform raw NEIS row into FormattedMeal
 */
export function formatRow(row: NeisMealRow, userAllergens: number[] = []): FormattedMeal {
  const calMatch = (row.CAL_INFO || '').match(/([\d.]+)/);
  const calNum = calMatch ? parseFloat(calMatch[1]) : 0;

  return {
    id: `${row.MLSV_YMD}-${row.MMEAL_SC_CODE}`,
    date: row.MLSV_YMD,
    dateDisplay: formatYmdToKorean(row.MLSV_YMD),
    mealCode: row.MMEAL_SC_CODE,
    mealName: row.MMEAL_SC_NM || '중식',
    calorie: row.CAL_INFO || '정보 없음',
    calorieNumber: calNum,
    dishes: parseDishes(row.DDISH_NM, userAllergens),
    nutrients: parseNutrients(row.NTR_INFO),
    origins: parseOrigins(row.ORPLC_INFO),
    dinerCount: row.MLSV_FGR || 0,
  };
}

/**
 * Fetch daily meals for a specific date (YYYYMMDD)
 */
export async function fetchDailyMeals(
  ymd: string,
  userAllergens: number[] = []
): Promise<{ meals: FormattedMeal[]; message?: string }> {
  const cacheKey = `daily_${ymd}`;
  if (memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey)!;
    // Re-evaluate user allergen highlights
    return {
      meals: cached.map((meal) => ({
        ...meal,
        dishes: meal.dishes.map((d) => ({
          ...d,
          containsUserAllergen: d.allergens.some((a) => userAllergens.includes(a)),
        })),
      })),
    };
  }

  const url = `${NEIS_API_BASE}?Type=json&pIndex=1&pSize=10&ATPT_OFCDC_SC_CODE=${DAEJIN_SCHOOL_INFO.officeCode}&SD_SCHUL_CODE=${DAEJIN_SCHOOL_INFO.schoolCode}&MLSV_YMD=${ymd}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`NEIS API 요청 실패 (HTTP ${res.status})`);
    }
    const data: NeisMealResponse = await res.json();

    if (data.RESULT && data.RESULT.CODE === 'INFO-200') {
      return { meals: [], message: '해당 일자에는 급식 식단 정보가 없습니다 (주말, 공휴일 또는 방학).' };
    }

    if (!data.mealServiceDietInfo || !data.mealServiceDietInfo[1]?.row) {
      const msg = data.RESULT?.MESSAGE || '급식 식단 정보를 찾을 수 없습니다.';
      return { meals: [], message: msg };
    }

    const rows = data.mealServiceDietInfo[1].row;
    const formatted = rows.map((r) => formatRow(r, userAllergens));
    memoryCache.set(cacheKey, formatted);

    return { meals: formatted };
  } catch (err: any) {
    console.error('Failed to fetch daily meals:', err);
    return {
      meals: [],
      message: err.message || '급식 정보를 불러오는 중 통신 오류가 발생했습니다.',
    };
  }
}

/**
 * Fetch date range meals (e.g. for weekly or monthly view)
 */
export async function fetchRangeMeals(
  fromYmd: string,
  toYmd: string,
  userAllergens: number[] = []
): Promise<{ meals: FormattedMeal[]; message?: string }> {
  const cacheKey = `range_${fromYmd}_${toYmd}`;
  if (memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey)!;
    return {
      meals: cached.map((meal) => ({
        ...meal,
        dishes: meal.dishes.map((d) => ({
          ...d,
          containsUserAllergen: d.allergens.some((a) => userAllergens.includes(a)),
        })),
      })),
    };
  }

  const url = `${NEIS_API_BASE}?Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${DAEJIN_SCHOOL_INFO.officeCode}&SD_SCHUL_CODE=${DAEJIN_SCHOOL_INFO.schoolCode}&MLSV_FROM_YMD=${fromYmd}&MLSV_TO_YMD=${toYmd}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`NEIS API 요청 실패 (HTTP ${res.status})`);
    }
    const data: NeisMealResponse = await res.json();

    if (data.RESULT && data.RESULT.CODE === 'INFO-200') {
      return { meals: [], message: '해당 기간에는 급식 식단 정보가 등록되지 않았습니다.' };
    }

    if (!data.mealServiceDietInfo || !data.mealServiceDietInfo[1]?.row) {
      return { meals: [] };
    }

    const rows = data.mealServiceDietInfo[1].row;
    const formatted = rows.map((r) => formatRow(r, userAllergens));
    memoryCache.set(cacheKey, formatted);

    // Also populate individual daily caches
    for (const m of formatted) {
      const dayKey = `daily_${m.date}`;
      const existing = memoryCache.get(dayKey) || [];
      if (!existing.some((e) => e.id === m.id)) {
        memoryCache.set(dayKey, [...existing, m]);
      }
    }

    return { meals: formatted };
  } catch (err: any) {
    console.error('Failed to fetch range meals:', err);
    return {
      meals: [],
      message: err.message || '기간 급식 정보를 불러오는 중 통신 오류가 발생했습니다.',
    };
  }
}
