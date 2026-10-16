import React, { useState } from 'react';
import {
  Location,
  Material,
  Stock,
  WeatherCondition,
  RiskLevel,
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
  QrCode,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

import {
  Language,
  translations,
  getLocalizedLocationName,
  getLocalizedFloor,
  getLocalizedMaterialName,
  formatDimensionsSimple,
  formatStackSimple,
} from '../services/i18n';
import { QrScannerModal } from './QrScannerModal';

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
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [mitigatedSuccessId, setMitigatedSuccessId] = useState<string | null>(null);

  // Safe fallback in case lang is ever missing
  const activeLang = lang || 'ko';
  const t = translations[activeLang] || translations.ko;

  // 각 위치별 평가 결과 계산 (다국어 지원)
  const evaluatedLocations = locations.map((loc) => {
    const stock = stocks[loc.id];
    const material = stock ? materials[stock.material_id] : null;
    if (!stock || !material) {
      return { loc, stock: null, material: null, evalResult: null };
    }
    const evalResult = evaluateHazards(loc, material, stock, currentWeather, activeLang);
    return { loc, stock, material, evalResult };
  });

  const filtered = evaluatedLocations.filter((item) => {
    if (filter === 'ALL') return true;
    return item.evalResult?.overallStatus === filter;
  });

  const handleQuickStrapWithFeedback = (locId: string) => {
    onQuickMitigation(locId);
    setMitigatedSuccessId(locId);
    setTimeout(() => {
      setMitigatedSuccessId(null);
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto space-y-3.5 pb-16 px-1 sm:px-0">
      {/* 모바일 상단 바: 안전 순찰 모드 안내 및 액션 버튼들 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/15 text-amber-400 rounded-xl">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm">{t.mobilePatrolMode}</div>
              <div className="text-[11px] text-slate-400">{t.mobilePatrolDesc}</div>
            </div>
          </div>
        </div>

        {/* 2대 현장 입력 버튼: QR 태그 스캔 & 현장 사진 촬영 */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
          <button
            onClick={() => setIsQrScannerOpen(true)}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.qrScanBtn}</span>
          </button>

          <button
            onClick={onOpenAiIntake}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.mobileShootBtn}</span>
          </button>
        </div>
      </div>

      {/* 모바일 2-Column 풍속 카드 */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow">
          <div className="text-[10px] text-slate-400 font-medium">{t.currentCardTitle}</div>
          <div className="text-2xl font-extrabold font-mono text-slate-100 mt-0.5">
            {currentWeather.wind_speed_ms}
            <span className="text-xs font-normal text-slate-400 ml-0.5">m/s</span>
          </div>
          <div className="text-[10px] text-amber-400 mt-1 whitespace-nowrap">
            {activeLang === 'ko' ? '순간 돌풍' : 'Peak Gust'} {currentWeather.gust_speed_ms} m/s
          </div>
        </div>

        <div className="bg-amber-950/25 border border-amber-500/40 rounded-xl p-3 shadow">
          <div className="text-[10px] text-amber-400 font-bold">{t.nextShiftCardTitle}</div>
          <div className="text-2xl font-extrabold font-mono text-amber-300 mt-0.5">
            {nextShiftWeather.wind_speed_ms}
            <span className="text-xs font-normal text-amber-400/80 ml-0.5">m/s</span>
          </div>
          <div className="text-[10px] text-rose-400 font-bold mt-1 whitespace-nowrap">
            {activeLang === 'ko' ? '예보 돌풍' : 'Forecast Gust'} {nextShiftWeather.gust_speed_ms} m/s
          </div>
        </div>
      </div>

      {/* 모바일 위험도 필터 탭 */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs shadow">
        <button
          onClick={() => setFilter('ALL')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
            filter === 'ALL' ? 'bg-slate-800 text-white shadow' : 'text-slate-400'
          }`}
        >
          {activeLang === 'ko' ? '전체' : 'All'} ({locations.length})
        </button>
        <button
          onClick={() => setFilter('DANGER')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            filter === 'DANGER' ? 'bg-rose-600 text-white shadow' : 'text-rose-400'
          }`}
        >
          {activeLang === 'ko' ? '위험' : 'Danger'} (
          {evaluatedLocations.filter((i) => i.evalResult?.overallStatus === 'DANGER').length})
        </button>
        <button
          onClick={() => setFilter('WARNING')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            filter === 'WARNING' ? 'bg-amber-600 text-white shadow' : 'text-amber-400'
          }`}
        >
          {activeLang === 'ko' ? '주의' : 'Warn'} (
          {evaluatedLocations.filter((i) => i.evalResult?.overallStatus === 'WARNING').length})
        </button>
        <button
          onClick={() => setFilter('NEED_CHECK')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
            filter === 'NEED_CHECK' ? 'bg-sky-600 text-white shadow' : 'text-sky-400'
          }`}
        >
          {activeLang === 'ko' ? '점검' : 'Check'} (
          {evaluatedLocations.filter((i) => i.evalResult?.overallStatus === 'NEED_CHECK').length})
        </button>
      </div>

      {/* 구역 리스트 (모바일 최적화: 쉬운 규격, 현장 용어, 한눈에 판단) */}
      <div className="space-y-3">
        {filtered.map(({ loc, stock, material, evalResult }) => {
          if (!stock || !material || !evalResult) return null;

          const isDanger = evalResult.overallStatus === 'DANGER';
          const isWarning = evalResult.overallStatus === 'WARNING';

          const locTitle = getLocalizedLocationName(loc.id, loc.name, activeLang);
          const matTitle = getLocalizedMaterialName(material.id, material.name, activeLang);
          const flTitle = getLocalizedFloor(loc.id, loc.floor, activeLang);

          const dimText = formatDimensionsSimple(material.dimensions, activeLang);
          const { stackText, totalHeightM } = formatStackSimple(
            stock.stack_tiers,
            material.dimensions.height_m,
            activeLang
          );

          const railH = loc.guardrail_height_m || 1.2;
          const isOverRail = loc.has_guardrail && totalHeightM > railH;
          const delta = Number((totalHeightM - railH).toFixed(2));

          return (
            <div
              key={loc.id}
              className={`rounded-2xl border p-4 shadow-md transition-all ${
                isDanger
                  ? 'bg-rose-950/25 border-rose-500/50'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-bold">
                      {flTitle}
                    </span>
                    <span>{loc.elevation_m}m</span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm mt-1 truncate">{locTitle}</h4>
                  <div className="text-xs text-slate-300 mt-0.5 font-medium truncate">
                    {matTitle} · <span className="text-amber-400 font-bold">{stock.count}{t.countUnit}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
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
                    FS: <strong className="text-slate-100">{evalResult.worstHazard.safety_factor}</strong>
                  </div>
                </div>
              </div>

              {/* 쉽고 간단한 규격 및 적재높이 표시 */}
              <div className="mt-2.5 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{dimText}</span>
                  <span className="text-amber-300 font-bold font-mono">{stackText}</span>
                </div>

                {/* 난간 비교 또는 단부 위험 */}
                <div className="text-[11px]">
                  {!loc.has_guardrail ? (
                    <span className="text-rose-400 font-medium">
                      ⚠️ {activeLang === 'ko' ? `난간 없음 (단부 ${loc.edge_distance_m}m 접근 - 낙하위험)` : `No guardrail (${loc.edge_distance_m}m to edge)`}
                    </span>
                  ) : isOverRail ? (
                    <span className="text-amber-300 font-medium">
                      ⚠️ {activeLang === 'ko' ? `난간(${railH}m)보다 +${delta}m 높음 (전도 시 추락)` : `+${delta}m over rail (${railH}m)`}
                    </span>
                  ) : (
                    <span className="text-emerald-400">
                      ✓ {activeLang === 'ko' ? `난간(${railH}m) 내부 안착` : `Within ${railH}m rail`}
                    </span>
                  )}
                </div>

                {/* 깔깔이 밴드 체결 상태 */}
                <div className="text-[11px] flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400">{t.strapsLabel}:</span>
                  <span className={stock.fastening.has_ratchet_straps ? 'text-emerald-400 font-medium' : 'text-rose-400 font-bold'}>
                    {stock.fastening.has_ratchet_straps
                      ? (activeLang === 'ko' ? `깔깔이 밴드 체결 (${stock.fastening.strap_tension_kn}kN)` : `Ratchet Strapped (${stock.fastening.strap_tension_kn}kN)`)
                      : (activeLang === 'ko' ? '⚠️ 밴드 미체결 (묶음 없음)' : '⚠️ Not Strapped')}
                  </span>
                </div>
              </div>

              {/* 핵심 위험 및 권장 조치 */}
              <div className="mt-2 bg-slate-950/90 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                <div className="font-semibold text-amber-300 text-[11px] mb-0.5">
                  {t.worstFactorLabel}: [{t[`hazard_${evalResult.worstHazard.hazard_type}` as keyof typeof t] || evalResult.worstHazard.hazard_name}]
                </div>
                <div className="text-slate-300 text-[11px] line-clamp-2">
                  {evalResult.worstHazard.recommended_actions[0] || (activeLang === 'ko' ? '현장 결속선 및 받침목 수시 점검' : 'Regular inspection')}
                </div>
              </div>

              {/* 하단 원터치 조치 및 상세 버튼 */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleQuickStrapWithFeedback(loc.id)}
                  className={`px-3 py-1.5 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-all active:scale-95 ${
                    mitigatedSuccessId === loc.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  {mitigatedSuccessId === loc.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{activeLang === 'ko' ? '체결 완료!' : 'Strapped!'}</span>
                    </>
                  ) : (
                    <>
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{t.quickStrapBtn}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onSelectLocationDetail(loc)}
                  className="px-2.5 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-0.5 font-medium transition-colors"
                >
                  <span>{t.physicsDetailBtn}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR 카메라 스캐너 모달 */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        locations={locations}
        materials={materials}
        stocks={stocks}
        lang={activeLang}
        onSelectScannedLocation={(scannedLoc) => {
          setIsQrScannerOpen(false);
          onSelectLocationDetail(scannedLoc);
        }}
      />
    </div>
  );
};
