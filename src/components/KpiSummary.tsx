import React from 'react';
import { AlertOctagon, AlertTriangle, HelpCircle, Shield, Info } from 'lucide-react';
import { RiskLevel } from '../types';
import { Language, translations } from '../services/i18n';

interface KpiSummaryProps {
  stats: {
    dangerCount: number;
    warningCount: number;
    needCheckCount: number;
    totalLocations: number;
    unassessedHazards: number;
  };
  selectedFilter: RiskLevel | 'ALL';
  onSelectFilter: (filter: RiskLevel | 'ALL') => void;
  lang: Language;
}

export const KpiSummary: React.FC<KpiSummaryProps> = ({
  stats,
  selectedFilter,
  onSelectFilter,
  lang,
}) => {
  const t = translations[lang];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 위험 (DANGER) */}
        <div
          onClick={() => onSelectFilter(selectedFilter === 'DANGER' ? 'ALL' : 'DANGER')}
          className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 ${
            selectedFilter === 'DANGER'
              ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30'
              : 'bg-slate-900/90 border-slate-800 hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />
              {t.dangerCardTitle}
            </span>
            <span className="text-xs text-rose-400/80 bg-rose-500/10 px-2 py-0.5 rounded-full font-mono">
              FS &lt; 1.0
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-400 font-mono tracking-tight">
              {stats.dangerCount}
              <span className="text-sm font-normal text-slate-400 ml-1">
                {lang === 'ko' ? '개 구역' : ' Zones'}
              </span>
            </span>
            <span className="text-xs text-rose-300 font-medium">{t.dangerCardDesc}</span>
          </div>
        </div>

        {/* 주의 (WARNING) */}
        <div
          onClick={() => onSelectFilter(selectedFilter === 'WARNING' ? 'ALL' : 'WARNING')}
          className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 ${
            selectedFilter === 'WARNING'
              ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30'
              : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {t.warningCardTitle}
            </span>
            <span className="text-xs text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full font-mono">
              1.0 ≤ FS &lt; 1.3
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
              {stats.warningCount}
              <span className="text-sm font-normal text-slate-400 ml-1">
                {lang === 'ko' ? '개 구역' : ' Zones'}
              </span>
            </span>
            <span className="text-xs text-amber-300 font-medium">{t.warningCardDesc}</span>
          </div>
        </div>

        {/* 확인 필요 (NEED_CHECK) */}
        <div
          onClick={() => onSelectFilter(selectedFilter === 'NEED_CHECK' ? 'ALL' : 'NEED_CHECK')}
          className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 ${
            selectedFilter === 'NEED_CHECK'
              ? 'bg-sky-950/40 border-sky-500 ring-2 ring-sky-500/30'
              : 'bg-slate-900/90 border-slate-800 hover:border-sky-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              {t.needCheckCardTitle}
            </span>
            <span className="text-xs text-sky-400/80 bg-sky-500/10 px-2 py-0.5 rounded-full font-mono">
              {lang === 'ko' ? '미확정·수시점검' : 'Unconfirmed'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-sky-400 font-mono tracking-tight">
              {stats.needCheckCount}
              <span className="text-sm font-normal text-slate-400 ml-1">
                {lang === 'ko' ? '개 구역' : ' Zones'}
              </span>
            </span>
            <span className="text-xs text-sky-300 font-medium">{t.needCheckCardDesc}</span>
          </div>
        </div>

        {/* 총 관리 구역 및 미평가 항목 안내 */}
        <div
          onClick={() => onSelectFilter('ALL')}
          className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 ${
            selectedFilter === 'ALL'
              ? 'bg-slate-800/80 border-slate-600 ring-2 ring-slate-600/30'
              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-slate-400" />
              {t.allCardTitle}
            </span>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">
              {lang === 'ko' ? '필터 초기화' : 'Reset'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
              {stats.totalLocations}
              <span className="text-sm font-normal text-slate-400 ml-1">
                {lang === 'ko' ? '개소 관제 중' : ' Monitored'}
              </span>
            </span>
            <span className="text-xs text-slate-400">
              {t.unassessedCount}: {stats.unassessedHazards}
            </span>
          </div>
        </div>
      </div>

      {/* 중요 지침서 규칙 배너: 녹색 안전 보증 금지 원칙 */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="leading-relaxed">{t.noGreenGuaranteeNotice}</div>
      </div>
    </div>
  );
};
