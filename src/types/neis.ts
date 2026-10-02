export interface NeisMealRow {
  ATPT_OFCDC_SC_CODE: string; // 시도교육청코드 (C10)
  ATPT_OFCDC_SC_NM: string;   // 부산광역시교육청
  SD_SCHUL_CODE: string;      // 행정표준코드 (7150597)
  SCHUL_NM: string;           // 대진전자통신고등학교
  MMEAL_SC_CODE: string;      // 식사코드 (1: 조식, 2: 중식, 3: 석식)
  MMEAL_SC_NM: string;        // 식사명 (중식 등)
  MLSV_YMD: string;           // 급식일자 (YYYYMMDD)
  MLSV_FGR: number;           // 급식인원수
  DDISH_NM: string;           // 요리명 (<br/>로 구분, 알레르기 번호 포함)
  ORPLC_INFO: string;         // 원산지 정보 (<br/>로 구분)
  CAL_INFO: string;           // 칼로리 정보 (예: "1128.7 Kcal")
  NTR_INFO: string;           // 영양 정보 (<br/>로 구분)
  MLSV_FROM_YMD: string;
  MLSV_TO_YMD: string;
  LOAD_DTM: string;
}

export interface NeisHeadResult {
  CODE: string;
  MESSAGE: string;
}

export interface NeisMealResponse {
  mealServiceDietInfo?: [
    {
      head: [
        { list_total_count: number },
        { RESULT: NeisHeadResult }
      ];
    },
    {
      row: NeisMealRow[];
    }
  ];
  RESULT?: NeisHeadResult;
}

export interface ParsedDish {
  name: string;
  allergens: number[];
  containsUserAllergen?: boolean;
}

export interface NutrientItem {
  name: string;
  value: number;
  unit: string;
}

export interface OriginItem {
  ingredient: string;
  origin: string;
}

export interface FormattedMeal {
  id: string;
  date: string; // YYYYMMDD
  dateDisplay: string; // YYYY년 M월 D일 (요일)
  mealCode: string; // 1, 2, 3
  mealName: string; // 조식, 중식, 석식
  calorie: string;
  calorieNumber: number;
  dishes: ParsedDish[];
  nutrients: NutrientItem[];
  origins: OriginItem[];
  dinerCount: number;
}

export interface SchoolInfo {
  officeCode: string;
  officeName: string;
  schoolCode: string;
  schoolName: string;
  englishName: string;
  schoolType: string;
  address: string;
  zipCode: string;
  tel: string;
  fax: string;
  homepage: string;
  coeducation: string;
  foundationDate: string;
}

export const DAEJIN_SCHOOL_INFO: SchoolInfo = {
  officeCode: "C10",
  officeName: "부산광역시교육청",
  schoolCode: "7150597",
  schoolName: "대진전자통신고등학교",
  englishName: "Daejin High School of Electronics & Communication",
  schoolType: "특성화고등학교 / 전문계",
  address: "부산광역시 금정구 수림로 92 (장전동)",
  zipCode: "46247",
  tel: "051-582-8100",
  fax: "051-582-8120",
  homepage: "http://www.pdj.hs.kr",
  coeducation: "남녀공학",
  foundationDate: "1995년 10월 30일",
};

export const ALLERGEN_DICT: Record<number, { name: string; icon: string }> = {
  1: { name: "난류(달걀)", icon: "🥚" },
  2: { name: "우유", icon: "🥛" },
  3: { name: "메밀", icon: "🌾" },
  4: { name: "땅콩", icon: "🥜" },
  5: { name: "대두(콩)", icon: "🌱" },
  6: { name: "밀", icon: "🍞" },
  7: { name: "고등어", icon: "🐟" },
  8: { name: "게", icon: "🦀" },
  9: { name: "새우", icon: "🦐" },
  10: { name: "돼지고기", icon: "🥩" },
  11: { name: "복숭아", icon: "🍑" },
  12: { name: "토마토", icon: "🍅" },
  13: { name: "아황산류", icon: "🧪" },
  14: { name: "호두", icon: "🌰" },
  15: { name: "닭고기", icon: "🍗" },
  16: { name: "쇠고기", icon: "🥩" },
  17: { name: "오징어", icon: "🦑" },
  18: { name: "조개류(굴/전복/홍합)", icon: "🦪" },
  19: { name: "잣", icon: "🌲" },
};
