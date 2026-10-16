import React, { useState } from 'react';
import {
  Location,
  Material,
  Stock,
  WeatherCondition,
  RiskLevel,
} from '../types';
import { evaluateHazards } from '../services/physicsEngine';
import { askMobileSafetyAssistant, SafetyQnaResponse } from '../services/geminiService';
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
  Bot,
  Sparkles,
  Send,
  Loader2,
  Mic,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
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
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(() => {
    return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('qr') === 'open';
  });
  const [mitigatedSuccessId, setMitigatedSuccessId] = useState<string | null>(null);
  const [expandedLocId, setExpandedLocId] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('expand') || null : null;
  });

  // AI 현장 안전 비서 질의응답 상태
  const [aiQuestion, setAiQuestion] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<SafetyQnaResponse | null>(null);
  const [showAiAssistant, setShowAiAssistant] = useState(true);

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
    if (!item.stock || !item.material || !item.evalResult) return false;
    if (filter === 'ALL') return true;
    return item.evalResult.overallStatus === filter;
  });

  const dangerCount = evaluatedLocations.filter((i) => i.evalResult?.overallStatus === 'DANGER').length;

  const handleQuickStrapWithFeedback = (locId: string) => {
    onQuickMitigation(locId);
    setMitigatedSuccessId(locId);
    setTimeout(() => {
      setMitigatedSuccessId(null);
    }, 2000);
  };

  // AI 안전 어시스턴트 질문 전송
  const handleAskAssistant = async (questionText: string) => {
    const q = questionText.trim();
    if (!q) return;
    setIsAiLoading(true);
    try {
      const res = await askMobileSafetyAssistant(q, {
        currentWeather,
        locations,
        stocks,
        materials,
        dangerCount,
        lang: activeLang,
      });
      setAiResponse(res);
    } catch (err) {
      console.warn('AI Assistant error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 음성 또는 추천 질문 칩 목록
  const quickQuestions = [
    {
      label: activeLang === 'ko' ? '🚨 긴급한 곳 어디야?' : '🚨 Where is urgent danger?',
      q: activeLang === 'ko' ? '지금 가장 긴급하게 확인해야 할 적재구역은 어디야?' : 'Where is the most urgent danger zone right now?',
    },
    {
      label: activeLang === 'ko' ? '🔍 어디부터 확인해?' : '🔍 Where to check first?',
      q: activeLang === 'ko' ? '안전관리자가 지금 순찰하면서 어느 장소부터 확인해야 해?' : 'Which location should I inspect first on patrol?',
    },
    {
      label: activeLang === 'ko' ? '⚠️ 결속 밴드 풀린 곳?' : '⚠️ Unstrapped yards?',
      q: activeLang === 'ko' ? '래칫 벨트가 체결되지 않은 위험 구역 목록 알려줘' : 'Which yards have no ratchet straps fastened?',
    },
    {
      label: activeLang === 'ko' ? '🏢 옥상층 바람 위험은?' : '🏢 Rooftop wind risk?',
      q: activeLang === 'ko' ? '12층 옥상 남측 적치구역 바람 상태와 단열재 비산 위험 알려줘' : 'What is the wind hazard on the 12F rooftop yard?',
    },
  ];

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
            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.qrScanBtn}</span>
          </button>

          <button
            onClick={onOpenAiIntake}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.mobileShootBtn}</span>
          </button>
        </div>
      </div>

      {/* [사용자 요청 구현] 모바일 전용 AI 현장 안전 비서 (Gemini 3.8 Flash 연동) */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-3.5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                <span>{activeLang === 'ko' ? 'AI 현장 안전관제 어시스턴트' : 'AI Safety Patrol Assistant'}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-full font-mono border border-amber-500/30">
                  Gemini 3.8
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                {activeLang === 'ko' ? '“긴급한 곳 어디야?”, “어느 장소부터 점검해?” 즉시 답변' : 'Ask: "Where is the urgent danger?", "What to inspect first?"'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAiAssistant((prev) => !prev)}
            className="text-[11px] text-slate-400 hover:text-amber-300 font-medium"
          >
            {showAiAssistant ? (activeLang === 'ko' ? '접기' : 'Hide') : (activeLang === 'ko' ? '펼치기' : 'Show')}
          </button>
        </div>

        {showAiAssistant && (
          <div className="space-y-2.5 pt-1 border-t border-slate-800/80 animate-in fade-in">
            {/* 1-Tap 추천 질문 칩 */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAiQuestion(q.q);
                    handleAskAssistant(q.q);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/50 text-slate-300 whitespace-nowrap transition-all active:scale-95 shrink-0 cursor-pointer"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* 질문 입력 바 */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAssistant(aiQuestion);
              }}
              className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 focus-within:border-amber-400"
            >
              <input
                type="text"
                placeholder={
                  activeLang === 'ko'
                    ? '안전관리자 질문 (예: 바람 세지면 날아갈 자재는?)'
                    : 'Ask safety question (e.g. which material topples first?)'
                }
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                className="flex-1 bg-transparent px-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isAiLoading || !aiQuestion.trim()}
                className="p-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-600 rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                {isAiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>

            {/* AI 답변 카드 (있을 때) */}
            {aiResponse && (
              <div className="bg-slate-950/90 border border-amber-500/40 rounded-xl p-3 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{activeLang === 'ko' ? 'AI 안전 브리핑' : 'AI Safety Briefing'}</span>
                  </span>
                  <span
                    className={`px-2 py-0.2 rounded-full font-bold text-[10px] ${
                      aiResponse.urgencyLevel === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : aiResponse.urgencyLevel === 'WARNING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    }`}
                  >
                    {aiResponse.urgencyLevel}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {aiResponse.answer}
                </p>

                {/* 추천 구역 바로가기 버튼 */}
                {aiResponse.recommendedLocationId && (
                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => {
                        const targetLoc = locations.find((l) => l.id === aiResponse.recommendedLocationId);
                        if (targetLoc) {
                          onSelectLocationDetail(targetLoc);
                        }
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>
                        {activeLang === 'ko'
                          ? `[${aiResponse.recommendedLocationName || '해당 구역'}] 즉시 조치하러 가기`
                          : `Inspect [${aiResponse.recommendedLocationName || 'Target Yard'}] Now`}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            filter === 'ALL' ? 'bg-slate-800 text-white shadow' : 'text-slate-400'
          }`}
        >
          {activeLang === 'ko' ? '전체' : 'All'} ({locations.length})
        </button>
        <button
          onClick={() => setFilter('DANGER')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            filter === 'DANGER' ? 'bg-rose-600 text-white shadow' : 'text-rose-400'
          }`}
        >
          {activeLang === 'ko' ? '위험' : 'Danger'} (
          {evaluatedLocations.filter((i) => i.evalResult?.overallStatus === 'DANGER').length})
        </button>
        <button
          onClick={() => setFilter('WARNING')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            filter === 'WARNING' ? 'bg-amber-600 text-white shadow' : 'text-amber-400'
          }`}
        >
          {activeLang === 'ko' ? '주의' : 'Warn'} (
          {evaluatedLocations.filter((i) => i.evalResult?.overallStatus === 'WARNING').length})
        </button>
        <button
          onClick={() => setFilter('NEED_CHECK')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
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

          const isExpanded = expandedLocId === loc.id;
          const isStrapped = Boolean(stock.fastening?.has_ratchet_straps);

          return (
            <div
              key={loc.id}
              onClick={() => setExpandedLocId((prev) => (prev === loc.id ? null : loc.id))}
              className={`rounded-2xl border p-4 shadow-md transition-all cursor-pointer hover:border-amber-400/60 active:scale-[0.99] ${
                isDanger
                  ? 'bg-rose-950/25 border-rose-500/50'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              {/* 상단 헤더: 위치, 층수, 자재, 위험도 배지 & 펼치기 아이콘 */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-bold">
                      {flTitle}
                    </span>
                    <span>{loc.elevation_m}m</span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm mt-1 truncate flex items-center gap-1.5">
                    <span>{locTitle}</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {isExpanded ? (activeLang === 'ko' ? '(접기)' : '(collapse)') : (activeLang === 'ko' ? '(탭하여 상세)' : '(tap detail)')}
                    </span>
                  </h4>
                  <div className="text-xs text-slate-300 mt-0.5 font-medium truncate">
                    {matTitle} · <span className="text-amber-400 font-bold">{stock.count}{t.countUnit}</span>
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1">
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
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <span>FS: <strong className="text-slate-100">{evalResult.worstHazard.safety_factor}</strong></span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
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
                  <span className={isStrapped ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-rose-400 font-bold flex items-center gap-1'}>
                    {isStrapped ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{activeLang === 'ko' ? `깔깔이 밴드 체결 완료 (${stock.fastening.strap_tension_kn}kN)` : `Ratchet Strapped (${stock.fastening.strap_tension_kn}kN)`}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span>{activeLang === 'ko' ? '⚠️ 밴드 미체결 (바람 시 미끄러짐/비산 위험)' : '⚠️ Not Strapped (Sliding Risk)'}</span>
                      </>
                    )}
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

              {/* [모바일 클릭 시 즉각 펼쳐지는 인라인 5대 물리 위험도 어코디언] */}
              {isExpanded && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5 text-xs animate-in fade-in"
                >
                  <div className="text-[11px] font-bold text-amber-300 flex items-center justify-between">
                    <span>{activeLang === 'ko' ? '📊 현장 즉시 역학 진단 (5대 위험 지표)' : '📊 Physics Diagnostics'}</span>
                    <span className="text-slate-400 font-mono text-[10px]">v{stock.input_version}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {Object.entries(evalResult.hazards).map(([key, h]) => (
                      <div
                        key={key}
                        className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between"
                      >
                        <span className="text-slate-400 truncate">
                          {t[`hazard_${key}` as keyof typeof t] || h.hazard_name}
                        </span>
                        <span
                          className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded ${
                            h.status === 'DANGER'
                              ? 'bg-rose-500/20 text-rose-400'
                              : h.status === 'WARNING'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {h.status === 'NOT_EVALUATED' ? 'N/A' : `FS ${h.safety_factor}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 세부 모달 바로 열기 버튼 */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => onSelectLocationDetail(loc)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                      <span>{activeLang === 'ko' ? '3D CFD 시뮬레이션 및 점검 이력 모달 열기' : 'Open 3D CFD Simulation & History Modal'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 하단 원터치 조치 및 상세 버튼 */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                {/* 래칫 밴딩 토글 버튼 (체결/해제 즉각 반영) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickStrapWithFeedback(loc.id);
                  }}
                  className={`px-3 py-1.5 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer ${
                    isStrapped
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 animate-pulse'
                  }`}
                >
                  {isStrapped ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{activeLang === 'ko' ? `체결 완료 (${stock.fastening.strap_tension_kn}kN) [클릭시 해제]` : `Strapped (${stock.fastening.strap_tension_kn}kN) [Release]`}</span>
                    </>
                  ) : (
                    <>
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{t.quickStrapBtn}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLocationDetail(loc);
                  }}
                  className="px-2.5 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-0.5 font-medium transition-colors cursor-pointer"
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
