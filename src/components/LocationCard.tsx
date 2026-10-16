import React from 'react';
import {
  Location,
  Material,
  Stock,
  HazardEvaluation,
  HazardType,
  RiskLevel,
  WeatherCondition,
} from '../types';
import {
  AlertOctagon,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Wrench,
  Building2,
  ShieldCheck,
  ShieldAlert,
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

interface LocationCardProps {
  location: Location;
  material: Material;
  stock: Stock;
  hazards: Record<HazardType, HazardEvaluation>;
  overallStatus: RiskLevel;
  worstHazard: HazardEvaluation;
  weather: WeatherCondition;
  lang: Language;
  onOpenDetail: () => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  material,
  stock,
  hazards,
  overallStatus,
  worstHazard,
  weather,
  lang,
  onOpenDetail,
}) => {
  const t = translations[lang];

  const localizedLocName = getLocalizedLocationName(location.id, location.name, lang);
  const localizedFloor = getLocalizedFloor(location.id, location.floor, lang);
  const localizedMatName = getLocalizedMaterialName(material.id, material.name, lang);

  const dimensionText = formatDimensionsSimple(material.dimensions, lang);
  const { stackText, totalHeightM } = formatStackSimple(stock.stack_tiers, material.dimensions.height_m, lang);

  const railHeight = location.guardrail_height_m || 1.2;
  const isOverRail = location.has_guardrail && totalHeightM > railHeight;
  const heightDelta = Number((totalHeightM - railHeight).toFixed(2));

  const getStatusBadge = () => {
    switch (overallStatus) {
      case 'DANGER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 whitespace-nowrap shrink-0">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-500 animate-pulse shrink-0" />
            <span>{lang === 'ko' ? '위험 (DANGER)' : 'DANGER'}</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 whitespace-nowrap shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{lang === 'ko' ? '주의 (WARNING)' : 'WARNING'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40 whitespace-nowrap shrink-0">
            <HelpCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>{lang === 'ko' ? '확인 필요 (CHECK)' : 'NEED CHECK'}</span>
          </span>
        );
    }
  };

  const getHazardPill = (h: HazardEvaluation) => {
    let color = 'bg-slate-800 text-slate-400 border-slate-700';
    if (h.status === 'DANGER') color = 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold';
    else if (h.status === 'WARNING') color = 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold';
    else if (h.status === 'NEED_CHECK') color = 'bg-sky-500/10 text-sky-300 border-sky-500/30';
    else if (h.status === 'NOT_EVALUATED') color = 'bg-slate-800/50 text-slate-500 border-slate-800 line-through';

    const hazardName = t[`hazard_${h.hazard_type}` as keyof typeof t] || h.hazard_name;

    return (
      <div
        key={h.hazard_type}
        title={`${hazardName}: ${h.status} (FS ${h.safety_factor})`}
        className={`px-2 py-1.5 rounded text-[11px] border flex items-center justify-between no-overflow ${color}`}
      >
        <span className="truncate mr-1">{hazardName}</span>
        <span className="font-mono text-[10px] shrink-0 font-bold">
          {h.status === 'NOT_EVALUATED' ? (lang === 'ko' ? '미적용' : 'N/A') : `FS ${h.safety_factor}`}
        </span>
      </div>
    );
  };

  const borderClass =
    overallStatus === 'DANGER'
      ? 'border-rose-500/40 hover:border-rose-500 bg-gradient-to-b from-rose-950/20 to-slate-900'
      : overallStatus === 'WARNING'
      ? 'border-amber-500/40 hover:border-amber-500 bg-gradient-to-b from-amber-950/20 to-slate-900'
      : 'border-slate-800 hover:border-slate-700 bg-slate-900';

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 shadow-lg transition-all duration-200 flex flex-col justify-between keep-all no-overflow min-h-[380px] ${borderClass}`}
    >
      <div className="space-y-3">
        {/* 상단 헤더: 구역명 및 뱃지 */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 truncate">
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="font-semibold text-slate-300 truncate">{localizedFloor}</span>
              <span className="text-slate-600">·</span>
              <span className="shrink-0">{location.elevation_m}m</span>
            </div>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base leading-snug line-clamp-1" title={localizedLocName}>
              {localizedLocName}
            </h3>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* 적재 자재 및 직관적인 치수 요약 */}
        <div className="bg-slate-950/70 rounded-lg p-3 border border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300 font-medium gap-2">
            <span className="truncate flex-1 text-slate-200 font-semibold" title={localizedMatName}>
              {localizedMatName}
            </span>
            <span className="font-mono text-amber-400 font-bold whitespace-nowrap shrink-0">
              {stock.count}{t.countUnit} · {stackText}
            </span>
          </div>

          {/* 한눈에 들어오는 알기 쉬운 크기 표기 */}
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/50">
            <span className="text-slate-300 font-medium">{dimensionText}</span>
            <span className="font-mono text-slate-300 font-semibold">
              {(material.mass_kg * stock.count).toFixed(0)} kg
            </span>
          </div>

          {/* 결속 및 깔깔이 밴드 상태 (현장 쉬운 용어) */}
          <div className="text-[11px] flex items-center justify-between gap-2 bg-slate-900/60 p-1.5 rounded">
            <span className="text-slate-400 whitespace-nowrap">{t.strapsLabel}:</span>
            <span
              className={`font-semibold truncate ${
                stock.fastening.has_ratchet_straps ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {stock.fastening.has_ratchet_straps
                ? lang === 'ko'
                  ? `깔깔이 밴드 체결 (${stock.fastening.strap_tension_kn}kN 조임)`
                  : `Ratchet Strapped (${stock.fastening.strap_tension_kn}kN)`
                : lang === 'ko'
                ? '⚠️ 밴드 미체결 (묶음 없음)'
                : '⚠️ Not Strapped'}
            </span>
          </div>

          {/* 건물 높이 vs 적재 높이 vs 난간 비교 (직관적인 안전 판단) */}
          <div className="pt-1 text-[11px]">
            {!location.has_guardrail ? (
              <div className="p-1.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">
                  {lang === 'ko'
                    ? `슬래브 난간 없음 (단부 ${location.edge_distance_m}m 근접 - 추락 주의)`
                    : `No Guardrail (Edge ${location.edge_distance_m}m - fall hazard)`}
                </span>
              </div>
            ) : isOverRail ? (
              <div className="p-1.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">
                  {lang === 'ko'
                    ? `난간(${railHeight}m)보다 +${heightDelta}m 높게 쌓임 (넘어지면 추락)`
                    : `+${heightDelta}m taller than guardrail (${railHeight}m)`}
                </span>
              </div>
            ) : (
              <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">
                  {lang === 'ko'
                    ? `난간(${railHeight}m) 안쪽에 안전하게 안착`
                    : `Protected behind ${railHeight}m guardrail`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 5대 물리 위험 지표 배지 그리드 */}
        <div>
          <div className="text-[11px] text-slate-400 font-medium mb-1.5 flex items-center justify-between">
            <span className="truncate">{t.fiveHazardsLabel}</span>
            <span className="text-[10px] text-slate-500 whitespace-nowrap ml-1">{t.safetyFactorCriteria}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {Object.values(hazards).map((h) => getHazardPill(h))}
          </div>
        </div>

        {/* 주요 취약 사유 요약 (다국어 완전 지원) */}
        <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded border border-slate-800/60 min-h-[56px] flex flex-col justify-center">
          <div className="font-semibold text-amber-300/90 flex items-center gap-1 mb-0.5 truncate">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              {t.worstFactorLabel}: [{t[`hazard_${worstHazard.hazard_type}` as keyof typeof t] || worstHazard.hazard_name}]
            </span>
          </div>
          <p className="text-slate-400 line-clamp-2 text-[11px]">
            {worstHazard.causes[0] || (lang === 'ko' ? '특이 취약 인자 미감지 (수시 점검 유지)' : 'No specific vulnerability detected (maintain regular patrols)')}
          </p>
        </div>
      </div>

      {/* 하단 액션 버튼 */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs gap-2">
        <div className="text-slate-400 truncate">
          <span className="whitespace-nowrap">{t.criticalWindLabel}: </span>
          <span className="font-mono font-bold text-amber-400 whitespace-nowrap">
            {worstHazard.critical_wind_speed_ms > 0 ? `${worstHazard.critical_wind_speed_ms} m/s` : 'N/A'}
          </span>
        </div>

        <button
          onClick={onOpenDetail}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700 hover:text-white whitespace-nowrap shrink-0"
        >
          <Wrench className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.viewDetailAction}</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
