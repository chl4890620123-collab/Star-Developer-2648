import React, { useState } from 'react';
import {
  Location,
  Material,
  Stock,
  WeatherCondition,
  RiskLevel,
  HazardEvaluation,
  HazardType,
} from '../types';
import { evaluateHazards } from '../services/physicsEngine';
import {
  AlertOctagon,
  AlertTriangle,
  HelpCircle,
  Wind,
  Camera,
  CheckCircle2,
  Wrench,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';

import { Language, translations, getLocalizedLocationName, getLocalizedFloor, getLocalizedMaterialName } from '../services/i18n';

interface MobileInspectionViewProps {
  locations: Location[];
  materials: Record<string, Material>;
  stocks: Record<string, Stock>;
  currentWeather: WeatherCondition;
  nextShiftWeather: WeatherCondition;
  lang: Language;
  onOpenAiIntake: () => void;
  onSelectLocationDetail: (loc: Location) => void;
  onQuickMitigation: (locationId: string) => void;
}

export const MobileInspectionView: React.FC<MobileInspectionViewProps> = ({
  locations,
  materials,
  stocks,
  currentWeather,
  nextShiftWeather,
  lang,
  onOpenAiIntake,
  onSelectLocationDetail,
  onQuickMitigation,
}) => {
  const [filter, setFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const t = translations[lang];

  // 각 위치별 평가 결과 계산
  const evaluatedLocations = locations.map((loc) => {
    const stock = stocks[loc.id];
    const material = stock ? materials[stock.material_id] : null;
    if (!stock || !material) {
      return { loc, stock: null, material: null, evalResult: null };
    }
    const evalResult = evaluateHazards(loc, material, stock, currentWeather);
    return { loc, stock, material, evalResult };
  });

  const filtered = evaluatedLocations.filter((item) => {
    if (filter === 'ALL') return true;
    return item.evalResult?.overallStatus === filter;
  });

  return (
    <div className="max-w-md mx-auto space-y-4 pb-12">
      {/* 모바일 상단 미니 배너 */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <div className="font-bold text-amber-300">{t.mobilePatrolMode}</div>
            <div className="text-[11px] text-slate-400">{t.mobilePatrolDesc}</div>
          </div>
        </div>
        <button
          onClick={onOpenAiIntake}
          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1 shadow whitespace-nowrap"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{t.mobileShootBtn}</span>
        </button>
      </div>

      {/* 모바일 2-Column 풍속 카드 */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 font-medium">{t.currentCardTitle}</div>
          <div className="text-2xl font-extrabold font-mono text-slate-100 mt-0.5">
            {currentWeather.wind_speed_ms}
            <span className="text-xs font-normal text-slate-400 ml-0.5">m/s</span>
          </div>
          <div className="text-[10px] text-amber-400 mt-1 whitespace-nowrap">
            {lang === 'ko' ? '돌풍' : 'Gust'} {currentWeather.gust_speed_ms} m/s
          </div>
        </div>

        <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3">
          <div className="text-[10px] text-amber-400 font-bold">{t.nextShiftCardTitle}</div>
          <div className="text-2xl font-extrabold font-mono text-amber-300 mt-0.5">
            {nextShiftWeather.wind_speed_ms}
            <span className="text-xs font-normal text-amber-400/80 ml-0.5">m/s</span>
          </div>
          <div className="text-[10px] text-rose-400 font-bold mt-1 whitespace-nowrap">
            {lang === 'ko' ? '돌풍' : 'Gust'} {nextShiftWeather.gust_speed_ms} m/s
          </div>
        </div>
      </div>

      {/* 모바일 필터 탭 */}
      <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
        <button
          onClick={() => setFilter('ALL')}
          className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
            filter === 'ALL' ? 'bg-slate-800 text-white shadow' : 'text-slate-400'
          }`}
        >
          {lang === 'ko' ? '전체' : 'All'} ({locations.length})
        </button>
        <button
          onClick={() => setFilter('DANGER')}
          className={`flex-1 py-1.5 rounded-md font-bold transition-all ${
            filter === 'DANGER' ? 'bg-rose-600 text-white shadow' : 'text-rose-400'
          }`}
        >
          {lang === 'ko' ? '위험' : 'Danger'} (
          {evaluatedLocations.filter((i) => i.evalResult?.overallStatus === 'DANGER').length})
        </button>
        <button
          onClick={() => setFilter('WARNING')}
          className={`flex-1 py-1.5 rounded-md font-bold transition-all ${
            filter === 'WARNING' ? 'bg-amber-600 text-white shadow' : 'text-amber-400'
          }`}
        >
          {lang === 'ko' ? '주의' : 'Warn'} (
          {evaluatedLocations.filter((i) => i.evalResult?.overallStatus === 'WARNING').length})
        </button>
        <button
          onClick={() => setFilter('NEED_CHECK')}
          className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
            filter === 'NEED_CHECK' ? 'bg-sky-600 text-white shadow' : 'text-sky-400'
          }`}
        >
          {lang === 'ko' ? '점검' : 'Check'} (
          {evaluatedLocations.filter((i) => i.evalResult?.overallStatus === 'NEED_CHECK').length})
        </button>
      </div>

      {/* 구역 리스트 (모바일 전용 최적화 카드) */}
      <div className="space-y-3">
        {filtered.map(({ loc, stock, material, evalResult }) => {
          if (!stock || !material || !evalResult) return null;

          const isDanger = evalResult.overallStatus === 'DANGER';
          const isWarning = evalResult.overallStatus === 'WARNING';

          const locTitle = getLocalizedLocationName(loc.id, loc.name, lang);
          const matTitle = getLocalizedMaterialName(material.id, material.name, lang);
          const flTitle = getLocalizedFloor(loc.id, loc.floor, lang);

          return (
            <div
              key={loc.id}
              className={`rounded-xl border p-4 shadow-md transition-all ${
                isDanger
                  ? 'bg-rose-950/25 border-rose-500/50'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    {flTitle} ({loc.elevation_m}m)
                  </span>
                  <h4 className="font-bold text-slate-100 text-sm mt-1">{locTitle}</h4>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {matTitle} ({stock.count}{t.countUnit})
                  </div>
                </div>

                <div className="text-right">
                  {isDanger ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/40">
                      <AlertOctagon className="w-3 h-3 text-rose-500 animate-pulse" />
                      DANGER
                    </span>
                  ) : isWarning ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      WARNING
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-500/40">
                      <HelpCircle className="w-3 h-3 text-sky-400" />
                      CHECK
                    </span>
                  )}
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    FS: <strong className="text-slate-200">{evalResult.worstHazard.safety_factor}</strong>
                  </div>
                </div>
              </div>

              {/* 핵심 위험 및 권장 조치 */}
              <div className="mt-2.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                <div className="font-semibold text-amber-300 text-[11px] mb-0.5">
                  {t.worstFactorLabel}: [{t[`hazard_${evalResult.worstHazard.hazard_type}` as keyof typeof t] || evalResult.worstHazard.hazard_name}]
                </div>
                <div className="text-slate-400 text-[11px] line-clamp-2">
                  {evalResult.worstHazard.recommended_actions[0] || (lang === 'ko' ? '현장 결속선 및 받침목 수시 점검' : 'Regular inspection')}
                </div>
              </div>

              {/* 하단 원터치 조치 및 상세 버튼 */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => onQuickMitigation(loc.id)}
                  className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow"
                >
                  <Wrench className="w-3 h-3" />
                  <span>{t.quickStrapBtn}</span>
                </button>

                <button
                  onClick={() => onSelectLocationDetail(loc)}
                  className="text-slate-300 hover:text-white flex items-center gap-0.5 font-medium py-1"
                >
                  <span>{t.physicsDetailBtn}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
