import React from 'react';
import { X, ShieldAlert, Check, RefreshCw } from 'lucide-react';
import { ALLERGEN_DICT } from '../types/neis';

interface AllergenSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAllergens: number[];
  onChange: (allergens: number[]) => void;
}

export const AllergenSettingsModal: React.FC<AllergenSettingsModalProps> = ({
  isOpen,
  onClose,
  selectedAllergens,
  onChange,
}) => {
  if (!isOpen) return null;

  const toggleAllergen = (num: number) => {
    if (selectedAllergens.includes(num)) {
      onChange(selectedAllergens.filter((n) => n !== num));
    } else {
      onChange([...selectedAllergens, num].sort((a, b) => a - b));
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleCommonPreset = () => {
    // Egg (1), Milk (2), Wheat (6), Peanut (4)
    onChange([1, 2, 4, 6]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-amber-600 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-100">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">개인 맞춤 알레르기 설정</h3>
              <p className="text-xs text-amber-100/90">
                선택한 성분이 포함된 메뉴에 눈에 띄는 안전 경고 뱃지를 표시합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-100 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Toolbar */}
        <div className="bg-amber-50/70 border-b border-amber-100 px-6 py-3 flex items-center justify-between text-xs text-amber-900">
          <span className="font-medium">
            현재 <span className="font-bold text-amber-700">{selectedAllergens.length}개</span> 성분 주의 설정됨
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCommonPreset}
              className="px-2.5 py-1 rounded bg-amber-100/80 hover:bg-amber-200/80 text-amber-800 font-medium transition-colors cursor-pointer"
            >
              주요 알레르기 (난류/우유/밀)
            </button>
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> 초기화
            </button>
          </div>
        </div>

        {/* Allergen 19 Grid */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.entries(ALLERGEN_DICT).map(([numStr, item]) => {
              const num = parseInt(numStr, 10);
              const isSelected = selectedAllergens.includes(num);

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => toggleAllergen(num)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{item.icon}</span>
                    <div className="truncate">
                      <span className={`text-xs block font-mono ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                        #{num}
                      </span>
                      <span className="text-sm font-semibold truncate block">
                        {item.name}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-1 border ${
                      isSelected
                        ? 'bg-white text-amber-600 border-white'
                        : 'border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            * 설정된 항목은 브라우저에 안전하게 보관됩니다.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            설정 완료
          </button>
        </div>
      </div>
    </div>
  );
};
