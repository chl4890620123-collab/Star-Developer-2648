import React from 'react';
import {
  Wind,
  ShieldAlert,
  AlertOctagon,
  Activity,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Language, translations } from '../services/i18n';

interface HeroBannerProps {
  lang: Language;
  currentWindSpeed: number;
  gustSpeed: number;
  dangerCount: number;
  onSelectDangerFilter?: () => void;
  onOpenAiIntake?: () => void;
  onScrollToWeather?: () => void;
  onOpenMitigationModal?: () => void;
  onOpenDetailModal?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  lang,
  currentWindSpeed,
  gustSpeed,
  dangerCount,
  onSelectDangerFilter,
  onOpenAiIntake,
  onScrollToWeather,
  onOpenMitigationModal,
  onOpenDetailModal,
}) => {
  const t = translations[lang];

  const pillars = [
    {
      title: t.pillarMaterial,
      desc:
        lang === 'ko'
          ? '동일 풍속이라도 자재 규격·수량·배치에 따른 위험도 차등 (클릭: 위험 구역 필터)'
          : 'Differential hazard priority by spec & stacking (Click: Filter Danger)',
      action: onSelectDangerFilter,
      badge: lang === 'ko' ? 'DANGER 즉시보기' : 'View Danger',
    },
    {
      title: t.pillarIntake,
      desc:
        lang === 'ko'
          ? '자재 사전 등록 + 입고 사진으로 불확실 항목만 원터치 확인 (클릭: AI 판독)'
          : 'Spec registration + visual photo intake (Click: Open AI)',
      action: onOpenAiIntake,
      badge: lang === 'ko' ? 'AI 판독 열기' : 'Open AI',
    },
    {
      title: t.pillarFuture,
      desc:
        lang === 'ko'
          ? '현재 실황과 예보 변동(16:00 강풍)을 비교해 사전 조치 (클릭: 기상 예보)'
          : 'Live observed vs 2h forecast shift (Click: Weather Trend)',
      action: onScrollToWeather,
      badge: lang === 'ko' ? '예보 추세 확인' : 'View Forecast',
    },
    {
      title: t.pillarRecalc,
      desc:
        lang === 'ko'
          ? '밴드 체결·단수 감축·위치 이동 시 안전율 즉각 재계산 (클릭: 조치 시뮬레이션)'
          : 'Instant FS re-calculation after strapping (Click: Simulate)',
      action: onOpenMitigationModal,
      badge: lang === 'ko' ? '조치 시뮬레이터' : 'Simulate Action',
    },
    {
      title: t.pillarEvidence,
      desc:
        lang === 'ko'
          ? '풍하중·전도모멘트·난간턱 초과 등 정밀 수치 근거 제시 (클릭: 공학 상세)'
          : 'NASA aerodynamic physics & dual-height proof (Click: Details)',
      action: onOpenDetailModal,
      badge: lang === 'ko' ? '공학 역학 근거' : 'View Evidence',
    },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 mb-6 transition-all">
      {/* Background Hero Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/construction_safety_hero_1792117992203.jpg"
          alt="Smart Construction Yard Wind Safety Guard"
          className="w-full h-full object-cover object-center opacity-30 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-5 sm:p-7 max-w-4xl space-y-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
            <span>SafeStack Core Engine</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/80 backdrop-blur-md">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {lang === 'ko' ? '샘플 기상 데이터' : 'Sample Weather Data'}
            </span>
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
          {t.heroTitle}
        </h1>

        <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed max-w-3xl font-medium">
          “{t.heroSubtitle}”
        </p>

        {/* 5대 차별화 목표: 클릭 시 해당 기능으로 즉시 이동하는 인터랙티브 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1.5 text-left">
          {pillars.map((p, idx) => (
            <button
              key={idx}
              onClick={p.action}
              className="group bg-slate-900/85 hover:bg-slate-800/95 border border-slate-800 hover:border-amber-500/60 p-2.5 rounded-xl backdrop-blur-sm flex flex-col justify-between text-left transition-all active:scale-95 hover:shadow-lg cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-amber-300 mb-1">
                  <div className="flex items-center gap-1 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{p.title}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
                <p className="text-[10px] text-slate-400 group-hover:text-slate-300 line-clamp-2 leading-snug">
                  {p.desc}
                </p>
              </div>

              <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-amber-400/90 font-medium">
                <span>{p.badge}</span>
                <ArrowRight className="w-3 h-3 text-amber-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>

        {/* Real-time Telemetry Stats Row (클릭 시 세부 항목으로 이동) */}
        <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs">
          <button
            onClick={onScrollToWeather}
            className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 px-3 py-1.5 rounded-xl backdrop-blur transition-all active:scale-95 text-left cursor-pointer"
            title={lang === 'ko' ? '기상 위젯으로 스크롤' : 'Scroll to Weather Widget'}
          >
            <Wind className="w-4 h-4 text-sky-400" />
            <div>
              <div className="text-[10px] text-slate-400">{t.heroKpiLiveStatus}</div>
              <div className="font-mono font-bold text-slate-100">{currentWindSpeed} m/s</div>
            </div>
          </button>

          <button
            onClick={onScrollToWeather}
            className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 px-3 py-1.5 rounded-xl backdrop-blur transition-all active:scale-95 text-left cursor-pointer"
            title={lang === 'ko' ? '기상 예보 상세 확인' : 'View Forecast Details'}
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400">{t.heroKpiMaxGust}</div>
              <div className="font-mono font-bold text-amber-300">{gustSpeed} m/s</div>
            </div>
          </button>

          <button
            onClick={onSelectDangerFilter}
            className="flex items-center gap-2 bg-rose-950/60 hover:bg-rose-900/70 border border-rose-500/40 hover:border-rose-400 px-3 py-1.5 rounded-xl backdrop-blur transition-all active:scale-95 text-left cursor-pointer"
            title={lang === 'ko' ? 'DANGER 위험 구역 즉시 필터링' : 'Filter DANGER zones'}
          >
            <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-rose-300">{t.heroKpiCriticalZones}</div>
              <div className="font-mono font-bold text-rose-400">
                {dangerCount} {lang === 'ko' ? '개소 (조치 필요)' : 'Zones (Urgent)'}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
