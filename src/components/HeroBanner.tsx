import React from 'react';
import { Wind, ShieldAlert, AlertOctagon, Activity, CheckCircle2 } from 'lucide-react';
import { Language, translations } from '../services/i18n';

interface HeroBannerProps {
  lang: Language;
  currentWindSpeed: number;
  gustSpeed: number;
  dangerCount: number;
  isLiveKma: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  lang,
  currentWindSpeed,
  gustSpeed,
  dangerCount,
  isLiveKma,
}) => {
  const t = translations[lang];

  const pillars = [
    { title: t.pillarMaterial, desc: lang === 'ko' ? '동일 풍속이라도 자재 규격·수량·배치에 따른 위험도 차등' : 'Differential hazard priority by material spec & stacking' },
    { title: t.pillarIntake, desc: lang === 'ko' ? '자재 사전 등록 + 입고 사진으로 불확실 항목만 원터치 확인' : 'Spec pre-registration + visual photo confirmation' },
    { title: t.pillarFuture, desc: lang === 'ko' ? '현재 실황과 예보 변동(16:00 강풍)을 비교해 사전 조치' : 'Live observed vs 2h shift forecast trend' },
    { title: t.pillarRecalc, desc: lang === 'ko' ? '밴드 체결·단수 감축·위치 이동 시 안전율 즉각 재계산' : 'Instant FS re-calculation after strapping or relocating' },
    { title: t.pillarEvidence, desc: lang === 'ko' ? '풍하중·전도모멘트·난간턱 초과 등 정밀 수치 근거 제시' : 'NASA aerodynamic physics & dual-height proof' },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 mb-6">
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
      <div className="relative z-10 p-5 sm:p-7 max-w-4xl space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
            <span>SafeStack Core Engine</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/80 backdrop-blur-md">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isLiveKma ? (lang === 'ko' ? '기상청 API 실시간 연동' : 'KMA Live API Sync') : 'KMA AWS #408'}</span>
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
          {t.heroTitle}
        </h1>

        <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed max-w-3xl font-medium">
          “{t.heroSubtitle}”
        </p>

        {/* 5대 차별화 목표 배지 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1 text-left">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800/90 p-2 rounded-lg backdrop-blur-sm flex flex-col justify-between"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">{p.title}</span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Real-time Telemetry Stats Row */}
        <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-6 text-xs">
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg backdrop-blur">
            <Wind className="w-4 h-4 text-sky-400" />
            <div>
              <div className="text-[10px] text-slate-400">{t.heroKpiLiveStatus}</div>
              <div className="font-mono font-bold text-slate-100">{currentWindSpeed} m/s</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg backdrop-blur">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400">{t.heroKpiMaxGust}</div>
              <div className="font-mono font-bold text-amber-300">{gustSpeed} m/s</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-500/40 px-3 py-1.5 rounded-lg backdrop-blur">
            <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-rose-300">{t.heroKpiCriticalZones}</div>
              <div className="font-mono font-bold text-rose-200">
                {dangerCount} {lang === 'ko' ? '개소 즉각 조치' : 'Zones Critical'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
