import React, { useState, useEffect } from 'react';
import {
  Location,
  Material,
  Stock,
  HazardEvaluation,
  HazardType,
  RiskLevel,
  WeatherCondition,
} from '../types';
import { evaluateHazards } from '../services/physicsEngine';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Sliders,
  Wind,
  ClipboardList,
  History,
  Plus,
  ShieldCheck,
  UserCheck,
  Calendar,
  AlertCircle,
  Clock,
  Layers,
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

export interface InspectionLog {
  id: string;
  timestamp: string;
  inspector: string;
  status: 'SAFE' | 'ACTION_TAKEN' | 'NEEDS_ATTENTION';
  notes: string;
}

interface LocationDetailModalProps {
  location: Location;
  material: Material;
  stock: Stock;
  weather: WeatherCondition;
  lang: Language;
  onClose: () => void;
  onUpdateStock: (updatedStock: Stock) => void;
}

export const LocationDetailModal: React.FC<LocationDetailModalProps> = ({
  location,
  material,
  stock,
  weather,
  lang,
  onClose,
  onUpdateStock,
}) => {
  const activeLang = lang || 'ko';
  const t = translations[activeLang] || translations.ko;

  const localizedLocName = getLocalizedLocationName(location.id, location.name, activeLang);
  const localizedFloor = getLocalizedFloor(location.id, location.floor, activeLang);
  const localizedMatName = getLocalizedMaterialName(material.id, material.name, activeLang);

  const dimText = formatDimensionsSimple(material.dimensions, activeLang);
  const { stackText, totalHeightM } = formatStackSimple(
    stock.stack_tiers,
    material.dimensions.height_m,
    activeLang
  );

  // 현재 상태에 대한 기준 평가 (Before) - 다국어 lang 전달
  const baseEval = evaluateHazards(location, material, stock, weather, activeLang);

  // ==========================================
  // [1] 현장 점검 및 정비 이력 (Maintenance History - 최근 5건)
  // ==========================================
  const INSPECTION_STORAGE_KEY = `safestack_inspections_${location.id}`;

  const getDefaultInspections = (): InspectionLog[] => {
    const isKo = activeLang === 'ko';
    return [
      {
        id: `insp-${Date.now()}-1`,
        timestamp: '2026-10-15 13:40',
        inspector: isKo ? '김안전 선임안전관리자' : 'Lead Safety Officer Kim',
        status: 'SAFE',
        notes: isKo
          ? '받침목 수평 수포계 검측 완료 및 결속 래칫 벨트 장력 2.5kN 정상 확인'
          : 'Dunnage leveled with spirit level; ratchet strap tension verified at 2.5kN.',
      },
      {
        id: `insp-${Date.now()}-2`,
        timestamp: '2026-10-15 10:20',
        inspector: isKo ? '박공학 안전기사' : 'Safety Engineer Park',
        status: 'ACTION_TAKEN',
        notes: isKo
          ? '강풍주의보 대비 최상단 와이어 결속 보강 및 개구부 단부 이격거리 2.5m 재배치'
          : 'Re-strapped top bundle for wind advisory; relocated 2.5m away from slab edge.',
      },
      {
        id: `insp-${Date.now()}-3`,
        timestamp: '2026-10-14 16:50',
        inspector: isKo ? '이현장 공사팀장' : 'Field Supervisor Lee',
        status: 'SAFE',
        notes: isKo
          ? '자재 입고 직후 밴딩 상태 및 바닥 고무패드 밀착 점검 양호'
          : 'Initial unloading check: strapping tight, anti-skid rubber pads positioned.',
      },
    ];
  };

  const [inspections, setInspections] = useState<InspectionLog[]>(() => {
    try {
      const saved = localStorage.getItem(INSPECTION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 5);
        }
      }
    } catch {
      // fallback
    }
    return getDefaultInspections();
  });

  // 새 점검 기록 등록 폼 상태
  const [showAddInspection, setShowAddInspection] = useState(false);
  const [newInspector, setNewInspector] = useState(activeLang === 'ko' ? '현장 순찰 관리자' : 'Field Patrol Inspector');
  const [newStatus, setNewStatus] = useState<'SAFE' | 'ACTION_TAKEN' | 'NEEDS_ATTENTION'>('SAFE');
  const [newNotes, setNewNotes] = useState('');

  const handleSaveInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotes.trim()) return;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRecord: InspectionLog = {
      id: `insp-${Date.now()}`,
      timestamp: formattedDate,
      inspector: newInspector.trim() || (activeLang === 'ko' ? '안전점검원' : 'Inspector'),
      status: newStatus,
      notes: newNotes.trim(),
    };

    const updated = [newRecord, ...inspections].slice(0, 5);
    setInspections(updated);
    try {
      localStorage.setItem(INSPECTION_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    setNewNotes('');
    setShowAddInspection(false);
  };

  // ==========================================
  // [2] 현장 조치 시뮬레이션 상태
  // ==========================================
  const [mitigationRatchet, setMitigationRatchet] = useState(stock.fastening?.has_ratchet_straps ?? false);
  const [mitigationRubberPad, setMitigationRubberPad] = useState((stock.friction_coefficient ?? 0.4) >= 0.6);
  const [mitigationReduceTiers, setMitigationReduceTiers] = useState((stock.stack_tiers ?? 1) > 2);
  const [mitigationWidenSupport, setMitigationWidenSupport] = useState((stock.support_geometry?.support_width_m ?? 0.8) >= 1.2);
  const [mitigationMoveInside, setMitigationMoveInside] = useState((location.edge_distance_m ?? 1.0) >= 2.5);
  const [mitigationWindNet, setMitigationWindNet] = useState(stock.fastening?.has_wind_net ?? false);

  const [activeTab, setActiveTab] = useState<HazardType>('sliding');
  const [comparisonResult, setComparisonResult] = useState<{
    applied: boolean;
    afterStock: Stock;
    afterLocation: Location;
    afterEval: ReturnType<typeof evaluateHazards>;
  } | null>(null);

  // 조치 시뮬레이션 계산
  const runMitigationSimulation = () => {
    const afterStock: Stock = {
      ...stock,
      stack_tiers: mitigationReduceTiers ? Math.max(1, (stock.stack_tiers || 1) - 1) : (stock.stack_tiers || 1),
      bundle_state: mitigationWindNet ? 'TIGHTLY_STRAPPED' : (stock.bundle_state || 'INDIVIDUAL_SHEETS'),
      friction_coefficient: mitigationRubberPad ? 0.65 : (stock.friction_coefficient || 0.38),
      fastening: {
        ...(stock.fastening || { has_ratchet_straps: false, strap_tension_kn: 0, has_anchor_wires: false, wire_capacity_kn: 0, has_wind_net: false }),
        has_ratchet_straps: mitigationRatchet,
        strap_tension_kn: mitigationRatchet ? 2.5 : (stock.fastening?.strap_tension_kn || 0),
        has_wind_net: mitigationWindNet,
      },
      support_geometry: {
        ...(stock.support_geometry || { support_width_m: 0.8, support_height_m: 0.1, has_wheel_chocks: false }),
        support_width_m: mitigationWidenSupport ? 1.2 : (stock.support_geometry?.support_width_m || 0.8),
      },
      updated_at: new Date().toLocaleTimeString(),
      input_version: (stock.input_version || 1) + 1,
    };

    const afterLoc: Location = {
      ...location,
      edge_distance_m: mitigationMoveInside ? Math.max(location.edge_distance_m, 2.8) : location.edge_distance_m,
    };

    const afterEval = evaluateHazards(afterLoc, material, afterStock, weather, activeLang);
    setComparisonResult({
      applied: true,
      afterStock,
      afterLocation: afterLoc,
      afterEval,
    });
  };

  const handleCommitMitigation = () => {
    if (comparisonResult) {
      onUpdateStock(comparisonResult.afterStock);
      onClose();
    }
  };

  const currentHazard = baseEval.hazards[activeTab];

  // 안전율(FS) 바 렌더링 헬퍼
  const renderSafetyBar = (fs: number) => {
    const pct = Math.min(100, (fs / 2.0) * 100);
    let barColor = 'bg-rose-500';
    if (fs >= 1.3) barColor = 'bg-sky-400';
    else if (fs >= 1.0) barColor = 'bg-amber-400';

    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-slate-400">{activeLang === 'ko' ? '안전율 FS:' : 'Safety Factor FS:'}</span>
          <span className={`font-bold ${fs < 1.0 ? 'text-rose-400' : fs < 1.3 ? 'text-amber-400' : 'text-sky-300'}`}>
            {fs}
          </span>
        </div>
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden relative border border-slate-700">
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-rose-500/80 z-10" title="FS=1.0" />
          <div className="absolute top-0 bottom-0 left-[65%] w-0.5 bg-amber-500/80 z-10" title="FS=1.3" />
          <div
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0.0 ({activeLang === 'ko' ? '위험' : 'Danger'})</span>
          <span className="text-rose-400 font-medium">1.0 ({activeLang === 'ko' ? '한계' : 'Limit'})</span>
          <span className="text-amber-400 font-medium">1.3 ({activeLang === 'ko' ? '주의' : 'Warn'})</span>
          <span>2.0+ ({activeLang === 'ko' ? '충족' : 'Adequate'})</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col keep-all no-overflow">
        {/* 모달 상단 헤더 */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-slate-400 flex items-center gap-2 truncate">
              <span className="px-2 py-0.5 bg-slate-800 rounded text-amber-300 font-bold font-mono text-[11px] shrink-0">
                {localizedFloor}
              </span>
              <span className="shrink-0">{location.elevation_m}m</span>
              <span>·</span>
              <span className="text-amber-400 truncate">{t.detailModalTitle}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-1 flex items-center gap-2 truncate">
              <span className="truncate">{localizedLocName}</span>
              <span className="text-xs font-normal text-slate-400 truncate">({localizedMatName})</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 바디 (스크롤 가능) */}
        <div className="p-5 space-y-6 overflow-y-auto text-slate-200">
          {/* 현장 자재 규격 및 적치 높이 요약 배너 */}
          <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <div className="text-slate-400 text-[11px]">{activeLang === 'ko' ? '자재 크기 (두께)' : 'Dimensions'}</div>
              <div className="font-bold text-slate-200 mt-0.5">{dimText}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">{activeLang === 'ko' ? '적치 수량 및 높이' : 'Stock & Height'}</div>
              <div className="font-bold text-amber-300 mt-0.5">{stock.count}{t.countUnit} · {stackText}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">{activeLang === 'ko' ? '슬래브 방호난간' : 'Slab Guardrail'}</div>
              <div className="font-bold text-slate-200 mt-0.5">
                {location.has_guardrail ? `${location.guardrail_height_m || 1.2}m (설치)` : (activeLang === 'ko' ? '미설치 (추락 위험)' : 'None (Fall Hazard)')}
              </div>
            </div>
          </div>

          {/* CFD 공기역학 3D 유동 시뮬레이션 다이어그램 (나노 바나나 생성 에셋) */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <img
              src="/src/assets/images/aerodynamic_wind_tunnel_1792118019118.jpg"
              alt="Aerodynamic CFD Simulation Diagram"
              className="w-full h-44 sm:h-52 object-cover object-center opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-bold text-slate-100 text-xs sm:text-sm drop-shadow">
                  {t.cfdDiagramTitle}
                </span>
              </div>
              <span className="font-mono text-[11px] bg-slate-950/80 border border-slate-700 px-2 py-0.5 rounded text-amber-300 drop-shadow">
                {activeLang === 'ko' ? '유효 순간풍속' : 'Effective Gust'}: {weather.gust_speed_ms} m/s
              </span>
            </div>
          </div>

          {/* 민감도 분석 하이라이트 박스 (지침서 5절) */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="font-bold text-amber-300">{t.sensitivityInsightTitle}</div>
              <div className="text-slate-300 mt-0.5 leading-relaxed">{baseEval.sensitivityInsight}</div>
            </div>
          </div>

          {/* 5대 물리 위험 탭 */}
          <div>
            <div className="flex border-b border-slate-800 space-x-1 sm:space-x-2 overflow-x-auto pb-1 text-xs">
              {(['sliding', 'toppling', 'uplift', 'falling', 'scattering'] as HazardType[]).map((type) => {
                const h = baseEval.hazards[type];
                const isActive = activeTab === type;
                let badgeColor = 'text-slate-400';
                if (h.status === 'DANGER') badgeColor = 'text-rose-400 font-bold';
                else if (h.status === 'WARNING') badgeColor = 'text-amber-400 font-bold';

                const tabName = t[`hazard_${type}` as keyof typeof t] || h.hazard_name;

                return (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    className={`py-2 px-3 rounded-t-lg font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-amber-400 text-amber-300 bg-slate-800/60'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{tabName}</span>
                    <span className={`text-[10px] font-mono ${badgeColor}`}>
                      {h.status === 'NOT_EVALUATED' ? 'N/A' : `FS ${h.safety_factor}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 개별 위험 상세 정보 카드 */}
            <div className="bg-slate-950/70 border border-slate-800 border-t-0 rounded-b-xl p-4 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div>
                  <div className="text-xs text-slate-400">{currentHazard.hazard_name}</div>
                  <div className="text-sm font-bold text-slate-100 mt-0.5 flex items-center gap-2">
                    <span>
                      {activeLang === 'ko' ? '판정 결과' : 'Evaluation Verdict'}: {currentHazard.status}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        currentHazard.status === 'DANGER'
                          ? 'bg-rose-500/20 text-rose-400'
                          : currentHazard.status === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-sky-500/20 text-sky-300'
                      }`}
                    >
                      {currentHazard.status}
                    </span>
                  </div>
                </div>

                {/* 안전율 바 */}
                <div className="w-full sm:w-60">{renderSafetyBar(currentHazard.safety_factor)}</div>
              </div>

              {/* 수식 및 대입 파라미터 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="font-semibold text-slate-300">{t.evalFormula}:</div>
                  <div className="p-2.5 bg-slate-900 rounded font-mono text-[11px] text-amber-300 border border-slate-800 overflow-x-auto whitespace-nowrap">
                    {currentHazard.formula_display}
                  </div>

                  <div className="mt-3">
                    <div className="font-semibold text-slate-300 mb-1">{t.appliedParams}:</div>
                    <div className="bg-slate-900 rounded p-2.5 border border-slate-800 space-y-1">
                      {Object.entries(currentHazard.applied_parameters).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-slate-400">
                          <span className="truncate mr-2">{key}:</span>
                          <span className="font-mono text-slate-200 font-medium whitespace-nowrap">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="font-semibold text-rose-400 mb-1">{t.identifiedCauses}:</div>
                    <ul className="space-y-1 list-disc list-inside text-slate-300">
                      {currentHazard.causes.length > 0 ? (
                        currentHazard.causes.map((c, i) => <li key={i}>{c}</li>)
                      ) : (
                        <li className="text-slate-400">
                          {activeLang === 'ko' ? '특이 불안정 요인 없음' : 'No specific instability factor detected'}
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <div className="font-semibold text-sky-400 mb-1">{t.recommendedMitigations}:</div>
                    <ul className="space-y-1 list-disc list-inside text-slate-300">
                      {currentHazard.recommended_actions.length > 0 ? (
                        currentHazard.recommended_actions.map((a, i) => <li key={i}>{a}</li>)
                      ) : (
                        <li className="text-slate-400">
                          {activeLang === 'ko' ? '현장 기준치 유지 (결속선 정기점검)' : 'Maintain standards (regular tie-down checks)'}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* [사용자 요청 구현] 'Maintenance History' log (최근 5건 점검 기록 및 사용자 메모) */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/60 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-slate-100 text-sm">
                  {t.maintenanceHistoryTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowAddInspection((prev) => !prev)}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addInspectionBtn}</span>
              </button>
            </div>

            {/* 신규 점검 일지 입력 폼 */}
            {showAddInspection && (
              <form onSubmit={handleSaveInspection} className="bg-slate-900 border border-blue-500/40 rounded-xl p-3.5 space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">{t.inspectorLabel}</label>
                    <input
                      type="text"
                      value={newInspector}
                      onChange={(e) => setNewInspector(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">{t.inspectionStatusLabel}</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="SAFE">{t.statusSafe}</option>
                      <option value="ACTION_TAKEN">{t.statusActionTaken}</option>
                      <option value="NEEDS_ATTENTION">{t.statusNeedsAttention}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">{t.inspectionNotesLabel}</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    rows={2}
                    placeholder={activeLang === 'ko' ? '받침목 수평 확인, 결속 밴드 인장, 비산방지망 체결 상태 등 입력' : 'Enter inspection observations and action notes'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddInspection(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                  >
                    {activeLang === 'ko' ? '취소' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t.saveInspectionBtn}</span>
                  </button>
                </div>
              </form>
            )}

            {/* 최근 5건 점검 리스트 */}
            <div className="space-y-2 text-xs">
              {inspections.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] mb-1">
                      <span className="font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {item.timestamp}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="font-medium text-slate-300 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-amber-400" />
                        {item.inspector}
                      </span>
                    </div>
                    <div className="text-slate-300 text-xs leading-relaxed">
                      {item.notes}
                    </div>
                  </div>

                  <div className="shrink-0 self-start sm:self-center">
                    {item.status === 'SAFE' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        {t.statusSafe}
                      </span>
                    ) : item.status === 'ACTION_TAKEN' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                        {t.statusActionTaken}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {t.statusNeedsAttention}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* [지침서 8절 필수 구현] 현장 조치 및 직전 대비 재계산 비교 (Before vs After) */}
          <div className="border border-slate-700/80 rounded-xl p-4 bg-slate-950/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
                <h3 className="font-bold text-slate-100 text-sm truncate">{t.mitigationSimTitle}</h3>
              </div>
              <button
                onClick={runMitigationSimulation}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow flex items-center gap-1.5 transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.runMitigationBtn}</span>
              </button>
            </div>

            {/* 조치 선택 체크박스 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={mitigationRatchet}
                  onChange={(e) => setMitigationRatchet(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span className="truncate">{t.opt_ratchet}</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={mitigationRubberPad}
                  onChange={(e) => setMitigationRubberPad(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span className="truncate">{t.opt_rubber}</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={mitigationReduceTiers}
                  onChange={(e) => setMitigationReduceTiers(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span className="truncate">{t.opt_tiers}</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={mitigationWidenSupport}
                  onChange={(e) => setMitigationWidenSupport(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span className="truncate">{t.opt_widen}</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={mitigationMoveInside}
                  onChange={(e) => setMitigationMoveInside(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span className="truncate">{t.opt_moveInside}</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={mitigationWindNet}
                  onChange={(e) => setMitigationWindNet(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span className="truncate">{t.opt_windNet}</span>
              </label>
            </div>

            {/* 비교 결과 박스 (좌: 조치 전 vs 우: 조치 후) */}
            {comparisonResult && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-3 space-y-3">
                <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
                  <span>
                    {activeLang === 'ko' ? '[조치 전후 역학 비교표]' : '[Before/After Engineering Comparison]'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    v{stock.input_version} → v{comparisonResult.afterStock.input_version}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 조치 전 (Before) */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-400">{t.beforeActionTitle}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          baseEval.overallStatus === 'DANGER'
                            ? 'bg-rose-500/20 text-rose-400'
                            : baseEval.overallStatus === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}
                      >
                        {baseEval.overallStatus}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 font-mono text-slate-400">
                      <div>{t.hazard_sliding} FS: {baseEval.hazards.sliding.safety_factor}</div>
                      <div>{t.hazard_toppling} FS: {baseEval.hazards.toppling.safety_factor}</div>
                      <div>{t.hazard_uplift} FS: {baseEval.hazards.uplift.safety_factor}</div>
                      <div>{t.hazard_scattering}: {baseEval.hazards.scattering.status}</div>
                    </div>
                  </div>

                  {/* 조치 후 (After) */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-400">{t.afterActionTitle}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          comparisonResult.afterEval.overallStatus === 'DANGER'
                            ? 'bg-rose-500/20 text-rose-400'
                            : comparisonResult.afterEval.overallStatus === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}
                      >
                        {comparisonResult.afterEval.overallStatus}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 font-mono text-slate-300">
                      <div className="flex justify-between">
                        <span>{t.hazard_sliding} FS:</span>
                        <span className="text-emerald-400 font-bold">
                          {comparisonResult.afterEval.hazards.sliding.safety_factor} (
                          {comparisonResult.afterEval.hazards.sliding.safety_factor >
                          baseEval.hazards.sliding.safety_factor
                            ? `+${(
                                comparisonResult.afterEval.hazards.sliding.safety_factor -
                                baseEval.hazards.sliding.safety_factor
                              ).toFixed(2)}`
                            : '0.00'}
                          )
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.hazard_toppling} FS:</span>
                        <span className="text-emerald-400 font-bold">
                          {comparisonResult.afterEval.hazards.toppling.safety_factor} (
                          {comparisonResult.afterEval.hazards.toppling.safety_factor >
                          baseEval.hazards.toppling.safety_factor
                            ? `+${(
                                comparisonResult.afterEval.hazards.toppling.safety_factor -
                                baseEval.hazards.toppling.safety_factor
                              ).toFixed(2)}`
                            : '0.00'}
                          )
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.hazard_scattering}:</span>
                        <span className="text-emerald-400 font-bold">
                          {comparisonResult.afterEval.hazards.scattering.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleCommitMitigation}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.commitMitigationBtn}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 모달 하단 푸터 */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>
            {activeLang === 'ko' ? '최신 판단 기준시각' : 'Assessment Baseline'}: {stock.updated_at}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
          >
            {t.closeModal}
          </button>
        </div>
      </div>
    </div>
  );
};
