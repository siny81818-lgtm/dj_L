import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  School,
  Sparkles,
  Bookmark,
  Layers,
} from 'lucide-react';
import { PRD_METADATA, PRD_SECTIONS } from '../data/prdDocument';

export const PrdViewer: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeSectionId, setActiveSectionId] = useState<string>(PRD_SECTIONS[0].id);

  // Generate full markdown text for copy/export
  const getFullMarkdown = () => {
    let md = `# ${PRD_METADATA.title}\n`;
    md += `> ${PRD_METADATA.subtitle}\n\n`;
    md += `- **작성일자**: ${PRD_METADATA.date}\n`;
    md += `- **대상 학교**: ${PRD_METADATA.targetSchool}\n`;
    md += `- **학교 코드**: ${PRD_METADATA.schoolCode}\n`;
    md += `- **데이터 출처**: ${PRD_METADATA.dataSource}\n\n`;
    md += `---\n\n`;

    for (const s of PRD_SECTIONS) {
      md += `## ${s.title}\n\n`;
      md += `${s.content}\n\n`;
    }
    return md;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(getFullMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([getFullMarkdown()], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `대진전자통신고_급식조회_PRD_${PRD_METADATA.date}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* PRD Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
                공식 제품 요구사항 정의서 (PRD v1.0)
              </span>
              <span className="text-xs text-slate-400">
                {PRD_METADATA.date}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {PRD_METADATA.title}
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              교육부 나이스(NEIS) 오픈데이터를 활용하여 대진전자통신고등학교의 실시간 급식 식단, 알레르기 안전 필터링 및 영양 분석을 제공하는 반응형 웹 서비스의 상세 기획 문서입니다.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              <span>{copied ? '복사 완료!' : 'PRD 마크다운 복사'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs sm:text-sm font-bold border border-indigo-400/30 transition-all cursor-pointer"
              title="마크다운 파일 다운로드"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">다운로드 (.md)</span>
            </button>
          </div>
        </div>

        {/* Quick School Code Spec */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">대상 학교</span>
            <span className="font-bold text-white mt-0.5 block">{PRD_METADATA.targetSchool}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">행정표준코드</span>
            <span className="font-mono font-bold text-emerald-400 mt-0.5 block">7150597 (C10)</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">데이터 프로토콜</span>
            <span className="font-bold text-white mt-0.5 block">NEIS Open API / JSON</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">지원 환경</span>
            <span className="font-bold text-white mt-0.5 block">Mobile / Tablet / PC</span>
          </div>
        </div>
      </div>

      {/* Main PRD Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Table of Contents Sticky Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs lg:sticky lg:top-24 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
            <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
            <span>목차 (Contents)</span>
          </div>
          <nav className="space-y-1">
            {PRD_SECTIONS.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSectionId(sec.id);
                  document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`block px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeSectionId === sec.id
                    ? 'bg-indigo-50 text-indigo-800 font-bold border-l-3 border-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {sec.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Structured Sections */}
        <div className="lg:col-span-3 space-y-6">
          {PRD_SECTIONS.map((sec) => (
            <section
              key={sec.id}
              id={sec.id}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4 scroll-mt-24"
            >
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <span className="w-2 h-6 bg-indigo-600 rounded-full" />
                <span>{sec.title}</span>
              </h3>

              <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3 font-normal">
                {sec.content}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
