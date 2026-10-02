import React from 'react';
import { X, MapPin, Phone, Globe, Calendar, Award, Building2, School } from 'lucide-react';
import { DAEJIN_SCHOOL_INFO } from '../types/neis';

interface SchoolInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolInfoModal: React.FC<SchoolInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-200">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">대진전자통신고등학교</h3>
              <p className="text-xs text-emerald-200/90 font-mono">
                {DAEJIN_SCHOOL_INFO.englishName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-3.5 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <MapPin className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-slate-500 block">소재지 / 주소</span>
                <span className="font-medium text-slate-800">{DAEJIN_SCHOOL_INFO.address}</span>
                <span className="text-xs text-slate-400 block mt-0.5">우편번호: {DAEJIN_SCHOOL_INFO.zipCode}</span>
                <a
                  href="https://map.naver.com/v5/search/%EB%8C%80%EC%A7%84%EC%A0%84%EC%9E%90%ED%86%B5%EC%8B%A0%EA%B3%A0%EB%93%B1%ED%95%99%EA%B5%90"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline mt-1 font-medium"
                >
                  네이버 지도에서 위치 확인하기 →
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Phone className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-slate-500 block">연락처</span>
                <div className="flex gap-4 font-medium text-slate-800">
                  <span>전화: <a href="tel:051-582-8100" className="hover:text-emerald-700 underline">{DAEJIN_SCHOOL_INFO.tel}</a></span>
                  <span>팩스: {DAEJIN_SCHOOL_INFO.fax}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Globe className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-slate-500 block">공식 홈페이지</span>
                <a
                  href={DAEJIN_SCHOOL_INFO.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-700 hover:underline"
                >
                  {DAEJIN_SCHOOL_INFO.homepage}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Building2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">관할 교육청</span>
                  <span className="font-medium text-slate-800">{DAEJIN_SCHOOL_INFO.officeName}</span>
                  <span className="text-xs text-slate-400 block">코드: {DAEJIN_SCHOOL_INFO.officeCode}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Award className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">행정표준코드</span>
                  <span className="font-mono font-medium text-slate-800">{DAEJIN_SCHOOL_INFO.schoolCode}</span>
                  <span className="text-xs text-slate-400 block">{DAEJIN_SCHOOL_INFO.coeducation}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Calendar className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-slate-500 block">설립 및 개교기념일</span>
                <span className="font-medium text-slate-800">{DAEJIN_SCHOOL_INFO.foundationDate} (사립 특성화고)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            확인 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
