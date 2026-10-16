import React, { useState } from 'react';
import { Material, MassBasis } from '../types';
import { X, Database, Plus, Trash2, Edit2, FileSpreadsheet, Check, AlertCircle, Save } from 'lucide-react';

interface MaterialManagerModalProps {
  materials: Record<string, Material>;
  onClose: () => void;
  onSaveMaterial: (material: Material) => void;
  onDeleteMaterial: (materialId: string) => void;
  onBatchUpload: (newMaterials: Material[]) => void;
}

export const MaterialManagerModal: React.FC<MaterialManagerModalProps> = ({
  materials,
  onClose,
  onSaveMaterial,
  onDeleteMaterial,
  onBatchUpload,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBatchPreview, setShowBatchPreview] = useState(false);
  const [csvRawText, setCsvRawText] = useState(
    `자재명,카테고리,길이(m),폭(m),두께(m),기준중량(kg),항력계수(Cd),양력계수(Cl),비산취약\n` +
    `내화단열재 150T,INSULATION,2.0,1.0,0.15,9.2,1.35,0.70,true\n` +
    `알루미늄 폼 (AL-FORM),FORM,1.2,0.6,0.05,12.5,1.20,0.30,false\n` +
    `가설 펜스 아연도금판,PANEL,2.0,0.5,0.005,6.8,1.45,0.85,true`
  );

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Material['category']>('STEEL');
  const [formLength, setFormLength] = useState(2.0);
  const [formWidth, setFormWidth] = useState(1.0);
  const [formHeight, setFormHeight] = useState(0.1);
  const [formMass, setFormMass] = useState(20.0);
  const [formCd, setFormCd] = useState(1.2);
  const [formCl, setFormCl] = useState(0.2);
  const [formIsLoose, setFormIsLoose] = useState(false);

  const startEdit = (mat: Material) => {
    setEditingId(mat.id);
    setFormName(mat.name);
    setFormCategory(mat.category);
    setFormLength(mat.dimensions.length_m);
    setFormWidth(mat.dimensions.width_m);
    setFormHeight(mat.dimensions.height_m);
    setFormMass(mat.mass_kg);
    setFormCd(mat.drag_coefficient);
    setFormCl(mat.lift_coefficient);
    setFormIsLoose(mat.is_loose_sheet);
  };

  const startNew = () => {
    setEditingId('NEW');
    setFormName('신규 자재 규격');
    setFormCategory('STEEL');
    setFormLength(1.0);
    setFormWidth(1.0);
    setFormHeight(0.1);
    setFormMass(10.0);
    setFormCd(1.2);
    setFormCl(0.2);
    setFormIsLoose(false);
  };

  const handleSave = () => {
    const id = editingId === 'NEW' ? `mat-${Date.now()}` : (editingId as string);
    const updated: Material = {
      id,
      name: formName,
      category: formCategory,
      dimensions: {
        length_m: formLength,
        width_m: formWidth,
        height_m: formHeight,
      },
      mass_basis: 'PER_UNIT',
      mass_kg: formMass,
      drag_coefficient: formCd,
      lift_coefficient: formCl,
      is_loose_sheet: formIsLoose,
      source_version: 'v1.0 (사용자 등록)',
    };
    onSaveMaterial(updated);
    setEditingId(null);
  };

  const handleProcessCsv = () => {
    const lines = csvRawText.trim().split('\n');
    const parsed: Material[] = [];
    // 첫줄 헤더 스킵
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((s) => s.trim());
      if (parts.length >= 8) {
        parsed.push({
          id: `mat-csv-${Date.now()}-${i}`,
          name: parts[0],
          category: (parts[1] as any) || 'OTHER',
          dimensions: {
            length_m: Number(parts[2]) || 1.0,
            width_m: Number(parts[3]) || 1.0,
            height_m: Number(parts[4]) || 0.1,
          },
          mass_basis: 'PER_UNIT',
          mass_kg: Number(parts[5]) || 10,
          drag_coefficient: Number(parts[6]) || 1.2,
          lift_coefficient: Number(parts[7]) || 0.3,
          is_loose_sheet: parts[8] === 'true',
          source_version: 'CSV 일괄 등록',
        });
      }
    }
    onBatchUpload(parsed);
    setShowBatchPreview(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* 헤더 */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                건설자재 규격 및 공기역학 파라미터 DB 관리
              </h2>
              <p className="text-xs text-slate-400">
                지침서 2절/10절: 자재 CRUD, 형상 항력계수(Cd), 단위중량, CSV 일괄등록 지원
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 바디 */}
        <div className="p-5 space-y-4 overflow-y-auto text-slate-200 text-xs">
          {/* 상단 툴바 */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={startNew}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                신규 자재 직접 등록
              </button>
              <button
                onClick={() => setShowBatchPreview(!showBatchPreview)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                CSV 일괄 등록 도구
              </button>
            </div>
            <span className="text-slate-400">등록 자재 수: {Object.keys(materials).length}건</span>
          </div>

          {/* CSV 일괄 등록 패널 */}
          {showBatchPreview && (
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4" />
                  CSV 텍스트 입력 및 사전 검증 미리보기
                </span>
                <span className="text-[11px] text-slate-400">컴마(,) 구분 포맷 준수</span>
              </div>
              <textarea
                rows={5}
                value={csvRawText}
                onChange={(e) => setCsvRawText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 font-mono text-[11px] text-slate-200"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowBatchPreview(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg"
                >
                  취소
                </button>
                <button
                  onClick={handleProcessCsv}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  일괄 임포트 실행
                </button>
              </div>
            </div>
          )}

          {/* 편집 폼 */}
          {editingId && (
            <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/40 space-y-3">
              <div className="font-bold text-blue-400">
                {editingId === 'NEW' ? '새 자재 규격 정보 입력' : '자재 규격 수정'}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-2">
                  <label className="text-slate-400 block mb-1">자재명 (품명 및 규격):</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">카테고리:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                  >
                    <option value="STEEL">철골/철근 (STEEL)</option>
                    <option value="FORM">거푸집/유로폼 (FORM)</option>
                    <option value="INSULATION">단열재/스티로폼 (INSULATION)</option>
                    <option value="SCAFFOLD">비계 파이프 (SCAFFOLD)</option>
                    <option value="PANEL">합판/패널 (PANEL)</option>
                    <option value="OTHER">기타 (OTHER)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">단위 질량 (kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formMass}
                    onChange={(e) => setFormMass(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">길이 L (m):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formLength}
                    onChange={(e) => setFormLength(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">폭 W (m):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formWidth}
                    onChange={(e) => setFormWidth(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">높이 H (m):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formHeight}
                    onChange={(e) => setFormHeight(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">항력계수 Cd:</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formCd}
                    onChange={(e) => setFormCd(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsLoose}
                    onChange={(e) => setFormIsLoose(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span className="text-amber-400 font-medium">비산 취약 경량 판재 여부</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 bg-slate-800 text-slate-300 rounded"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    저장 및 적용
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 자재 목록 테이블 */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">자재명</th>
                  <th className="p-3">분류</th>
                  <th className="p-3">치수 (L×W×H)</th>
                  <th className="p-3">기준중량</th>
                  <th className="p-3">항력(Cd)/양력(Cl)</th>
                  <th className="p-3">비산취약</th>
                  <th className="p-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {Object.values(materials).map((mat) => (
                  <tr key={mat.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3 font-sans font-medium text-slate-100">{mat.name}</td>
                    <td className="p-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {mat.category}
                      </span>
                    </td>
                    <td className="p-3">
                      {mat.dimensions.length_m}m × {mat.dimensions.width_m}m × {mat.dimensions.height_m}m
                    </td>
                    <td className="p-3 text-amber-400 font-bold">{mat.mass_kg} kg</td>
                    <td className="p-3">
                      Cd {mat.drag_coefficient} / Cl {mat.lift_coefficient}
                    </td>
                    <td className="p-3 font-sans">
                      {mat.is_loose_sheet ? (
                        <span className="text-rose-400 font-semibold">비산 취약</span>
                      ) : (
                        <span className="text-slate-500">일반</span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-1 font-sans">
                      <button
                        onClick={() => startEdit(mat)}
                        className="p-1 text-slate-400 hover:text-blue-400"
                        title="수정"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteMaterial(mat.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="삭제 (참조 시 비활성화)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 푸터 */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
