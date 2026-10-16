import React, { useState } from 'react';
import { Location, Material, Stock } from '../types';
import { SAMPLE_EVIDENCE_PHOTOS } from '../services/mockData';
import { analyzeIntakeEvidenceWithGemini, AiIntakeAnalysis } from '../services/geminiService';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2,
  Layers,
  ShieldCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { Language, getLocalizedLocationName, getLocalizedFloor } from '../services/i18n';

interface AiIntakeModalProps {
  locations: Location[];
  materials: Record<string, Material>;
  lang: Language;
  onClose: () => void;
  onConfirmIntake: (locationId: string, updatedStock: Partial<Stock>) => void;
}

export const AiIntakeModal: React.FC<AiIntakeModalProps> = ({
  locations,
  materials,
  lang,
  onClose,
  onConfirmIntake,
}) => {
  const isKo = lang === 'ko';
  const [selectedLocationId, setSelectedLocationId] = useState(locations[0]?.id || '');
  const [selectedSample, setSelectedSample] = useState(SAMPLE_EVIDENCE_PHOTOS[0]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [specDocText, setSpecDocText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiIntakeAnalysis | null>(null);

  // 관리자 교차 검증용 폼 상태
  const [confirmedCount, setConfirmedCount] = useState(36);
  const [confirmedTiers, setConfirmedTiers] = useState(3);
  const [confirmedBundleState, setConfirmedBundleState] = useState<'TIGHTLY_STRAPPED' | 'LOOSE_BUNDLE' | 'INDIVIDUAL_SHEETS'>('INDIVIDUAL_SHEETS');
  const [confirmedRatchet, setConfirmedRatchet] = useState(false);
  const [confirmedSupportWidth, setConfirmedSupportWidth] = useState(0.8);

  const handleSelectPreset = (sample: typeof SAMPLE_EVIDENCE_PHOTOS[0]) => {
    setSelectedSample(sample);
    setCustomImageUrl('');
    setAnalysisResult(null);

    if (sample.id.includes('eps')) {
      const targetLoc = locations.find((l) => l.id.includes('roof')) || locations[0];
      if (targetLoc) setSelectedLocationId(targetLoc.id);
      setConfirmedCount(36);
      setConfirmedTiers(3);
      setConfirmedBundleState('INDIVIDUAL_SHEETS');
      setConfirmedRatchet(false);
      setConfirmedSupportWidth(0.8);
    } else if (sample.id.includes('euroform')) {
      const targetLoc = locations.find((l) => l.id.includes('edge')) || locations[0];
      if (targetLoc) setSelectedLocationId(targetLoc.id);
      setConfirmedCount(40);
      setConfirmedTiers(2);
      setConfirmedBundleState('LOOSE_BUNDLE');
      setConfirmedRatchet(true);
      setConfirmedSupportWidth(0.6);
    } else {
      const targetLoc = locations.find((l) => l.id.includes('scaffold')) || locations[0];
      if (targetLoc) setSelectedLocationId(targetLoc.id);
      setConfirmedCount(50);
      setConfirmedTiers(2);
      setConfirmedBundleState('TIGHTLY_STRAPPED');
      setConfirmedRatchet(false);
      setConfirmedSupportWidth(1.0);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImageUrl(event.target.result as string);
          setAnalysisResult(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const activeUrl = customImageUrl || selectedSample.url;
      const res = await analyzeIntakeEvidenceWithGemini(activeUrl, specDocText);
      setAnalysisResult(res);

      setConfirmedCount(res.estimated_count);
      setConfirmedTiers(res.estimated_stack_tiers);
      setConfirmedBundleState(res.bundle_state);
      setConfirmedRatchet(res.has_ratchet_straps);
      setConfirmedSupportWidth(res.support_width_m);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyToStock = () => {
    onConfirmIntake(selectedLocationId, {
      count: confirmedCount,
      stack_tiers: confirmedTiers,
      bundle_state: confirmedBundleState,
      fastening: {
        has_ratchet_straps: confirmedRatchet,
        strap_tension_kn: confirmedRatchet ? 2.5 : 0.0,
        has_anchor_wires: false,
        wire_capacity_kn: 0.0,
        has_wind_net: false,
      },
      support_geometry: {
        support_width_m: confirmedSupportWidth,
        support_height_m: 0.1,
        has_wheel_chocks: false,
      },
      updated_at: new Date().toLocaleTimeString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col keep-all">
        {/* 헤더 */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {isKo ? '입고 사진 및 규격자료 AI 시각 판독 (Gemini 3.8 Flash)' : 'AI Visual Spec & Photo Intake (Gemini 3.8 Flash)'}
              </h2>
              <p className="text-xs text-slate-400">
                {isKo
                  ? '지침서 5절: 입고사진/스펙 분석 → 불확실 항목 대조 → 관리자 확정 → 물리 재계산'
                  : 'Section 5: Intake Photo Analysis → Anomaly Check → Engineer Confirmation → Physics Recalculation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 바디 */}
        <div className="p-5 space-y-5 overflow-y-auto text-slate-200 text-xs">
          {/* 현장 구역 선택 */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="font-semibold text-slate-300">
              {isKo ? '판독 적용 대상 적재구역:' : 'Target Staging Location:'}
            </span>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  [{getLocalizedFloor(loc.id, loc.floor, lang)}] {getLocalizedLocationName(loc.id, loc.name, lang)}
                </option>
              ))}
            </select>
          </div>

          {/* 사진 선택/업로드 영역 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 좌측: 샘플 사진 선택 or 업로드 */}
            <div className="space-y-3">
              <label className="font-semibold text-slate-300 block">
                {isKo ? '1. 현장 입고 사진 선택 (시연용 프리셋 또는 직접 업로드)' : '1. Select Staging Photo (Presets or Upload)'}
              </label>

              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_EVIDENCE_PHOTOS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectPreset(sample)}
                    className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedSample.id === sample.id && !customImageUrl
                        ? 'border-blue-500 ring-2 ring-blue-500/40 bg-blue-950/40 shadow-md'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                    }`}
                  >
                    <img
                      src={sample.url}
                      alt={sample.title}
                      className="w-full h-16 object-cover rounded-lg mb-1"
                    />
                    <div className="truncate font-semibold text-slate-200 text-[11px]">{sample.title}</div>
                  </button>
                ))}
              </div>

              {/* 직접 이미지 파일 업로드 & URL 입력 */}
              <div className="pt-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isKo ? 'PC/모바일 사진 첨부' : 'Upload Local Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {customImageUrl && (
                    <span className="text-[11px] text-emerald-400 font-medium">
                      ✓ {isKo ? '사용자 사진 등록됨' : 'Custom photo loaded'}
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  placeholder={isKo ? "또는 외부 이미지 URL 붙여넣기" : "Or paste image URL"}
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
              </div>

              {/* AI 실행 버튼 */}
              <button
                disabled={isAnalyzing}
                onClick={handleRunAiAnalysis}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs shadow flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isKo ? 'Gemini 3.8 Flash가 역학 파라미터 판독 중...' : 'Gemini 3.8 Flash extracting physics parameters...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{isKo ? 'Gemini AI 시각 판독 실행하기' : 'Execute Gemini AI Vision Analysis'}</span>
                  </>
                )}
              </button>
            </div>

            {/* 우측: 선택된 사진 미리보기 및 실시간 AI 판독 로그 */}
            <div className="space-y-3">
              <label className="font-semibold text-slate-300 block">
                {isKo ? '2. 선택된 입고 증빙 사진 미리보기' : '2. Staging Evidence Preview'}
              </label>
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black h-44 flex items-center justify-center">
                <img
                  src={customImageUrl || selectedSample.url}
                  alt={selectedSample.title}
                  className="max-h-full max-w-full object-contain"
                />
                <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[11px] text-slate-300 backdrop-blur">
                  {customImageUrl ? (isKo ? '사용자 업로드 사진' : 'User Uploaded Photo') : selectedSample.title}
                </div>
              </div>

              {/* AI 판독 결과 박스 */}
              {analysisResult ? (
                <div className="bg-slate-950 border border-blue-500/40 rounded-xl p-3.5 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      {isKo ? 'Gemini Vision 판독 완료' : 'Gemini Vision Complete'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {isKo ? '신뢰도' : 'Confidence'}: {(analysisResult.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="text-slate-300 text-[11px] leading-relaxed bg-slate-900/60 p-2 rounded">
                    <strong>{isKo ? '엔지니어링 소견:' : 'Engineering Notes:'}</strong> {analysisResult.engineering_notes}
                  </div>

                  {analysisResult.anomalies_detected.length > 0 && (
                    <div className="bg-rose-950/40 border border-rose-500/30 rounded p-2 text-rose-300 text-[11px] space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        {isKo ? '식별된 모순 및 결함:' : 'Anomalies & Deficiencies:'}
                      </div>
                      <ul className="list-disc list-inside">
                        {analysisResult.anomalies_detected.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl text-center text-slate-500">
                  {isKo
                    ? '좌측 파란색 버튼을 누르면 Gemini AI가 사진의 수량, 단수, 결속선을 시각 판독합니다.'
                    : 'Click the blue button on the left to extract stock counts, tiers, and strap status via Gemini AI.'}
                </div>
              )}
            </div>
          </div>

          {/* [지침서 4절 준수] AI 추정치 vs 관리자 확인치 분리 교차검증 패널 */}
          <div className="border border-slate-700 rounded-xl p-4 bg-slate-950/70 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200">
                  {isKo ? '3. 관리자 확인치 입력 (AI 추정치 자동 덮어쓰기 방지)' : '3. Engineer Cross-Verification Input'}
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                {isKo ? '지침서: "등록값·AI 추정값·관리자 확인값을 분리한다"' : 'Guideline: "Distinguish presets, AI estimates, and verified values"'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">
                  {isKo ? '확인 수량 (개):' : 'Confirmed Count:'}
                  {analysisResult && (
                    <span className="text-blue-400 text-[10px] ml-1">
                      [AI: {analysisResult.estimated_count}]
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={confirmedCount}
                  onChange={(e) => setConfirmedCount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  {isKo ? '적재 단수 (단):' : 'Stack Tiers:'}
                  {analysisResult && (
                    <span className="text-blue-400 text-[10px] ml-1">
                      [AI: {analysisResult.estimated_stack_tiers}]
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={confirmedTiers}
                  onChange={(e) => setConfirmedTiers(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">{isKo ? '결속 상태:' : 'Fastening:'}</label>
                <select
                  value={confirmedBundleState}
                  onChange={(e) => setConfirmedBundleState(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                >
                  <option value="INDIVIDUAL_SHEETS">{isKo ? '낱장 노출 (비산위험)' : 'Individual Sheets (Flight Hazard)'}</option>
                  <option value="LOOSE_BUNDLE">{isKo ? '느슨한 묶음' : 'Loose Bundle'}</option>
                  <option value="TIGHTLY_STRAPPED">{isKo ? '견고한 밴딩 체결' : 'Tightly Strapped'}</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">{isKo ? '받침목 폭 (m):' : 'Support Width (m):'}</label>
                <input
                  type="number"
                  step="0.1"
                  value={confirmedSupportWidth}
                  onChange={(e) => setConfirmedSupportWidth(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleApplyToStock}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isKo ? '관리자 확인 완료 및 구역 상태 반영' : 'Confirm & Apply to Yard State'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer font-medium"
          >
            {isKo ? '닫기' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
