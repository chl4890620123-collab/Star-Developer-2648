import React, { useState } from 'react';
import { Location, Material, Stock, ExposureCondition, ContactSurface } from '../types';
import { Language, translations, getLocalizedLocationName, getLocalizedMaterialName } from '../services/i18n';
import {
  X,
  Database,
  Building,
  Boxes,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  Layers,
  Download,
  Upload,
  RotateCcw,
  Package,
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
} from 'lucide-react';

interface IntegratedDbManagerModalProps {
  locations: Location[];
  materials: Record<string, Material>;
  stocks: Record<string, Stock>;
  lang: Language;
  onClose: () => void;
  onSaveLocation: (location: Location) => void;
  onDeleteLocation: (locationId: string) => void;
  onSaveStock: (stock: Stock) => void;
  onDeleteStock: (locationId: string) => void;
  onSaveMaterial: (material: Material) => void;
  onDeleteMaterial: (materialId: string) => void;
  onBatchUploadMaterials: (newMaterials: Material[]) => void;
  onResetDatabase: () => void;
  onImportDatabase: (data: { locations: Location[]; materials: Record<string, Material>; stocks: Record<string, Stock> }) => void;
}

export const IntegratedDbManagerModal: React.FC<IntegratedDbManagerModalProps> = ({
  locations,
  materials,
  stocks,
  lang,
  onClose,
  onSaveLocation,
  onDeleteLocation,
  onSaveStock,
  onDeleteStock,
  onSaveMaterial,
  onDeleteMaterial,
  onBatchUploadMaterials,
  onResetDatabase,
  onImportDatabase,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'LOCATIONS' | 'STOCKS' | 'MATERIALS' | 'BACKUP'>('LOCATIONS');

  // ==========================================
  // [1] 적재구역(Location) 편집 폼 상태 (건물 표고 높이 Z 관리)
  // ==========================================
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [locName, setLocName] = useState('');
  const [locFloor, setLocFloor] = useState('5F');
  const [locElevationM, setLocElevationM] = useState<number>(18.0); // 건물 표고 높이!
  const [locExposure, setLocExposure] = useState<ExposureCondition>('UNPROTECTED_SLAB_EDGE');
  const [locEdgeDistM, setLocEdgeDistM] = useState<number>(1.5);
  const [locHasRail, setLocHasRail] = useState(true);
  const [locRailHeightM, setLocRailHeightM] = useState<number>(1.2);

  const startEditLoc = (loc: Location) => {
    setEditingLocId(loc.id);
    setLocName(loc.name);
    setLocFloor(loc.floor);
    setLocElevationM(loc.elevation_m);
    setLocExposure(loc.exposure_conditions);
    setLocEdgeDistM(loc.edge_distance_m);
    setLocHasRail(loc.has_guardrail);
    setLocRailHeightM(loc.guardrail_height_m || 1.2);
  };

  const startNewLoc = () => {
    setEditingLocId('NEW');
    setLocName(lang === 'ko' ? '신규 적치구역' : 'New Staging Yard');
    setLocFloor('5F');
    setLocElevationM(18.0);
    setLocExposure('UNPROTECTED_SLAB_EDGE');
    setLocEdgeDistM(2.0);
    setLocHasRail(true);
    setLocRailHeightM(1.2);
  };

  const handleSaveLoc = () => {
    const id = editingLocId === 'NEW' ? `loc-custom-${Date.now()}` : (editingLocId as string);
    const updated: Location = {
      id,
      site_id: 'site-seoul-01',
      name: locName.trim() || '신규 구역',
      floor: locFloor.trim() || '1F',
      elevation_m: Number(locElevationM) || 0.0,
      exposure_conditions: locExposure,
      edge_distance_m: Number(locEdgeDistM) || 2.0,
      has_guardrail: locHasRail,
      guardrail_height_m: locHasRail ? Number(locRailHeightM) : 0.0,
    };
    onSaveLocation(updated);
    setEditingLocId(null);
  };

  // ==========================================
  // [2] 적재물/재고(Stock) 편집 폼 상태 (적재 높이 H_stack & 결속력)
  // ==========================================
  const [editingStockLocId, setEditingStockLocId] = useState<string | null>(null);
  const [stockMatId, setStockMatId] = useState<string>(Object.keys(materials)[0] || '');
  const [stockCount, setStockCount] = useState<number>(20);
  const [stockTiers, setStockTiers] = useState<number>(2);
  const [stockOrientation, setStockOrientation] = useState<Stock['orientation']>('FACE_TO_WIND');
  const [stockBundleState, setStockBundleState] = useState<Stock['bundle_state']>('TIGHTLY_STRAPPED');
  const [stockHasRatchet, setStockHasRatchet] = useState<boolean>(true);
  const [stockRatchetTension, setStockRatchetTension] = useState<number>(2.5);
  const [stockHasAnchorWire, setStockHasAnchorWire] = useState<boolean>(false);
  const [stockHasWindNet, setStockHasWindNet] = useState<boolean>(false);
  const [stockContactSurface, setStockContactSurface] = useState<ContactSurface>('CONCRETE_WOOD');
  const [stockFrictionCoeff, setStockFrictionCoeff] = useState<number>(0.4);
  const [stockSupportWidth, setStockSupportWidth] = useState<number>(0.8);

  const startEditStock = (locId: string) => {
    setEditingStockLocId(locId);
    const s = stocks[locId];
    if (s) {
      setStockMatId(s.material_id);
      setStockCount(s.count);
      setStockTiers(s.stack_tiers);
      setStockOrientation(s.orientation);
      setStockBundleState(s.bundle_state);
      setStockHasRatchet(s.fastening.has_ratchet_straps);
      setStockRatchetTension(s.fastening.strap_tension_kn);
      setStockHasAnchorWire(s.fastening.has_anchor_wires);
      setStockHasWindNet(s.fastening.has_wind_net);
      setStockContactSurface(s.contact_surface);
      setStockFrictionCoeff(s.friction_coefficient);
      setStockSupportWidth(s.support_geometry.support_width_m);
    } else {
      setStockMatId(Object.keys(materials)[0] || '');
      setStockCount(20);
      setStockTiers(2);
      setStockOrientation('FACE_TO_WIND');
      setStockBundleState('TIGHTLY_STRAPPED');
      setStockHasRatchet(false);
      setStockRatchetTension(0.0);
      setStockHasAnchorWire(false);
      setStockHasWindNet(false);
      setStockContactSurface('CONCRETE_WOOD');
      setStockFrictionCoeff(0.4);
      setStockSupportWidth(0.8);
    }
  };

  const handleSaveStock = () => {
    if (!editingStockLocId) return;
    const existing = stocks[editingStockLocId];
    const updated: Stock = {
      id: existing ? existing.id : `stock-${editingStockLocId}`,
      location_id: editingStockLocId,
      material_id: stockMatId,
      count: Number(stockCount) || 1,
      stack_tiers: Number(stockTiers) || 1,
      orientation: stockOrientation,
      bundle_state: stockBundleState,
      fastening: {
        has_ratchet_straps: stockHasRatchet,
        strap_tension_kn: stockHasRatchet ? Number(stockRatchetTension) : 0.0,
        has_anchor_wires: stockHasAnchorWire,
        wire_capacity_kn: stockHasAnchorWire ? 15.0 : 0.0,
        has_wind_net: stockHasWindNet,
      },
      contact_surface: stockContactSurface,
      friction_coefficient: Number(stockFrictionCoeff) || 0.4,
      support_geometry: {
        support_width_m: Number(stockSupportWidth) || 0.8,
        support_height_m: 0.1,
        has_wheel_chocks: false,
      },
      updated_at: new Date().toLocaleTimeString(),
      input_version: existing ? existing.input_version + 1 : 1,
    };
    onSaveStock(updated);
    setEditingStockLocId(null);
  };

  // ==========================================
  // [3] 자재 규격(Material) 편집 폼 상태
  // ==========================================
  const [editingMatId, setEditingMatId] = useState<string | null>(null);
  const [matName, setMatName] = useState('');
  const [matCategory, setMatCategory] = useState<Material['category']>('STEEL');
  const [matLength, setMatLength] = useState<number>(2.0);
  const [matWidth, setMatWidth] = useState<number>(1.0);
  const [matHeight, setMatHeight] = useState<number>(0.1);
  const [matMass, setMatMass] = useState<number>(20.0);
  const [matCd, setMatCd] = useState<number>(1.2);
  const [matCl, setMatCl] = useState<number>(0.2);
  const [matIsLoose, setMatIsLoose] = useState<boolean>(false);

  const startEditMat = (mat: Material) => {
    setEditingMatId(mat.id);
    setMatName(mat.name);
    setMatCategory(mat.category);
    setMatLength(mat.dimensions.length_m);
    setMatWidth(mat.dimensions.width_m);
    setMatHeight(mat.dimensions.height_m);
    setMatMass(mat.mass_kg);
    setMatCd(mat.drag_coefficient);
    setMatCl(mat.lift_coefficient);
    setMatIsLoose(mat.is_loose_sheet);
  };

  const startNewMat = () => {
    setEditingMatId('NEW');
    setMatName(lang === 'ko' ? '신규 규격 자재' : 'New Custom Material');
    setMatCategory('STEEL');
    setMatLength(2.0);
    setMatWidth(1.0);
    setMatHeight(0.1);
    setMatMass(25.0);
    setMatCd(1.2);
    setMatCl(0.2);
    setMatIsLoose(false);
  };

  const handleSaveMat = () => {
    const id = editingMatId === 'NEW' ? `mat-custom-${Date.now()}` : (editingMatId as string);
    const updated: Material = {
      id,
      name: matName.trim() || '신규 자재',
      category: matCategory,
      dimensions: {
        length_m: Number(matLength) || 1.0,
        width_m: Number(matWidth) || 1.0,
        height_m: Number(matHeight) || 0.1,
      },
      mass_basis: 'PER_UNIT',
      mass_kg: Number(matMass) || 10,
      drag_coefficient: Number(matCd) || 1.2,
      lift_coefficient: Number(matCl) || 0.2,
      is_loose_sheet: matIsLoose,
      source_version: 'v1.2 (SafeStack Engine)',
    };
    onSaveMaterial(updated);
    setEditingMatId(null);
  };

  // ==========================================
  // [4] CSV 일괄 등록 및 JSON 백업/복원
  // ==========================================
  const [csvText, setCsvText] = useState(
    `자재명,카테고리,길이(m),폭(m),두께(m),기준중량(kg),항력계수(Cd),양력계수(Cl),비산취약\n` +
    `내화단열재 150T,INSULATION,2.0,1.0,0.15,9.2,1.35,0.70,true\n` +
    `알루미늄 폼 (AL-FORM),FORM,1.2,0.6,0.05,12.5,1.20,0.30,false\n` +
    `가설 펜스 아연도금판,PANEL,2.0,0.5,0.005,6.8,1.45,0.85,true`
  );

  const [importJsonText, setImportJsonText] = useState('');
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  const handleProcessCsv = () => {
    const lines = csvText.trim().split('\n');
    const parsed: Material[] = [];
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
          source_version: 'CSV Batch Import',
        });
      }
    }
    onBatchUploadMaterials(parsed);
    setActiveTab('MATERIALS');
  };

  const handleExportJson = () => {
    const exportData = {
      version: 'SafeStack-DB-v2.0',
      exported_at: new Date().toISOString(),
      locations,
      materials,
      stocks,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safestack-database-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMessage(lang === 'ko' ? 'DB 파일이 성공적으로 다운로드되었습니다.' : 'DB backup downloaded successfully.');
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (parsed.locations && parsed.materials && parsed.stocks) {
        onImportDatabase({
          locations: parsed.locations,
          materials: parsed.materials,
          stocks: parsed.stocks,
        });
        setBackupMessage(lang === 'ko' ? '데이터베이스가 성공적으로 복원되었습니다!' : 'Database restored successfully!');
      } else {
        setBackupMessage(lang === 'ko' ? '유효하지 않은 DB JSON 형식입니다.' : 'Invalid DB JSON structure.');
      }
    } catch (e: any) {
      setBackupMessage(lang === 'ko' ? 'JSON 파싱 오류: ' + e.message : 'JSON Parsing error: ' + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col keep-all no-overflow text-slate-100">
        {/* 모달 상단 헤더 */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate">
                {t.dbModalTitle}
              </h2>
              <p className="text-xs text-slate-400 truncate">
                {t.dbModalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4단 탭 내비게이션 */}
        <div className="bg-slate-950/60 px-5 border-b border-slate-800 flex space-x-2 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('LOCATIONS')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'LOCATIONS'
                ? 'border-amber-400 text-amber-300 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>{t.dbTabLocations} ({locations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('STOCKS')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'STOCKS'
                ? 'border-amber-400 text-amber-300 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{t.dbTabStocks} ({Object.keys(stocks).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('MATERIALS')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'MATERIALS'
                ? 'border-amber-400 text-amber-300 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>{t.dbTabMaterials} ({Object.keys(materials).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('BACKUP')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'BACKUP'
                ? 'border-amber-400 text-amber-300 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.dbTabBackup}</span>
          </button>
        </div>

        {/* 탭 내용 영역 */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* ========================================================= */}
          {/* TAB 1: 적재구역 및 건물 고도 (Z) 관리                     */}
          {/* ========================================================= */}
          {activeTab === 'LOCATIONS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  {lang === 'ko'
                    ? '건물 층별 표고 높이(m)는 KDS 풍하중 기준에 따라 고도 풍속(V_z)을 증폭하는 핵심 변수입니다.'
                    : 'Building elevation(m) scales local wind speed (V_z) via KDS atmospheric boundary layer formulas.'}
                </div>
                <button
                  onClick={startNewLoc}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'ko' ? '신규 구역 등록' : 'Add Location'}</span>
                </button>
              </div>

              {/* 편집 폼 (열려있을 때) */}
              {editingLocId && (
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-3">
                  <div className="font-bold text-amber-300 text-xs flex items-center gap-2">
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>
                      {editingLocId === 'NEW'
                        ? (lang === 'ko' ? '신규 적재구역 생성' : 'Create New Yard')
                        : (lang === 'ko' ? '적재구역 및 표고 높이 수정' : 'Edit Location & Elevation')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">{lang === 'ko' ? '구역명' : 'Location Name'}</label>
                      <input
                        type="text"
                        value={locName}
                        onChange={(e) => setLocName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">{lang === 'ko' ? '층 (Floor 표기)' : 'Floor'}</label>
                      <input
                        type="text"
                        value={locFloor}
                        onChange={(e) => setLocFloor(e.target.value)}
                        placeholder="e.g. 12F (옥상층)"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-amber-300 font-bold block mb-1">
                        🏢 {lang === 'ko' ? '건물 표고 높이 Z (m)' : 'Building Elevation Z (m)'}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={locElevationM}
                        onChange={(e) => setLocElevationM(parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-amber-500/60 rounded p-2 text-amber-300 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">{lang === 'ko' ? '풍환경 노출 조건' : 'Exposure'}</label>
                      <select
                        value={locExposure}
                        onChange={(e) => setLocExposure(e.target.value as ExposureCondition)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
                      >
                        <option value="OPEN_ROOFTOP">OPEN_ROOFTOP (옥상 개활지)</option>
                        <option value="UNPROTECTED_SLAB_EDGE">UNPROTECTED_SLAB_EDGE (외벽 개구부 단부)</option>
                        <option value="SEMI_ENCLOSED">SEMI_ENCLOSED (반밀폐/코어부)</option>
                        <option value="GROUND_YARD">GROUND_YARD (지상 야적장)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">{lang === 'ko' ? '슬래브 단부 이격거리 (m)' : 'Edge Dist (m)'}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={locEdgeDistM}
                        onChange={(e) => setLocEdgeDistM(parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">{lang === 'ko' ? '방호 난간 높이 (m)' : 'Guardrail Height (m)'}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={locHasRail}
                          onChange={(e) => setLocHasRail(e.target.checked)}
                          className="rounded text-amber-500"
                        />
                        <span className="text-slate-300">{lang === 'ko' ? '난간설치' : 'Has Rail'}</span>
                        {locHasRail && (
                          <input
                            type="number"
                            step="0.1"
                            value={locRailHeightM}
                            onChange={(e) => setLocRailHeightM(parseFloat(e.target.value))}
                            className="w-20 bg-slate-900 border border-slate-700 rounded p-1 text-slate-100 font-mono"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingLocId(null)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                    >
                      {lang === 'ko' ? '취소' : 'Cancel'}
                    </button>
                    <button
                      onClick={handleSaveLoc}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{lang === 'ko' ? '저장 및 역학 재반영' : 'Save & Re-calculate'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 목록 테이블 */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                      <th className="p-3">{lang === 'ko' ? '층수 / 구역명' : 'Floor / Location'}</th>
                      <th className="p-3 text-amber-300 font-bold">🏢 {lang === 'ko' ? '건물 표고고 (Z)' : 'Bldg Elev (Z)'}</th>
                      <th className="p-3">{lang === 'ko' ? '노출 조건' : 'Exposure'}</th>
                      <th className="p-3">{lang === 'ko' ? '단부 거리' : 'Edge Dist'}</th>
                      <th className="p-3">{lang === 'ko' ? '방호 난간' : 'Guardrail'}</th>
                      <th className="p-3 text-right">{lang === 'ko' ? '작업' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {locations.map((loc) => (
                      <tr key={loc.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-200">
                            {getLocalizedLocationName(loc.id, loc.name, lang)}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{loc.floor}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-300">
                          {loc.elevation_m} m
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 font-mono">
                            {loc.exposure_conditions}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-300">{loc.edge_distance_m} m</td>
                        <td className="p-3 font-mono">
                          {loc.has_guardrail ? (
                            <span className="text-emerald-400 font-semibold">{loc.guardrail_height_m || 1.2} m</span>
                          ) : (
                            <span className="text-rose-400 font-bold">{lang === 'ko' ? '미설치 (추락위험)' : 'No Rail (Lethal)'}</span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => startEditLoc(loc)}
                            className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded transition-colors"
                            title={lang === 'ko' ? '수정' : 'Edit'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteLocation(loc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                            title={lang === 'ko' ? '삭제' : 'Delete'}
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
          )}

          {/* ========================================================= */}
          {/* TAB 2: 적재물 & 적재 높이 (H_stack) CRUD                   */}
          {/* ========================================================= */}
          {activeTab === 'STOCKS' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                {lang === 'ko'
                  ? '적재물 적치 높이(H_stack)는 전도 모멘트의 모멘트 암과 풍하중 수압면적을 결정하며, 방호난간 높이를 초과할 경우 턱넘김(Over-topping)으로 즉각 추락합니다.'
                  : 'Stack height (H_stack) dictates tipping moment arm & wind area. Exceeding guardrail height induces over-topping fall hazards.'}
              </div>

              {/* 편집 폼 */}
              {editingStockLocId && (
                <div className="bg-slate-950 p-4 rounded-xl border border-sky-500/40 space-y-3">
                  <div className="font-bold text-sky-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>
                        {lang === 'ko' ? '적재물 규격 & 적재고(H_stack) & 결속력 설정' : 'Edit Stack Dimensions & Height & Fastening'}
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {locations.find((l) => l.id === editingStockLocId)?.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">{lang === 'ko' ? '적재 자재 선택' : 'Material'}</label>
                      <select
                        value={stockMatId}
                        onChange={(e) => setStockMatId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
                      >
                        {Object.values(materials).map((m) => (
                          <option key={m.id} value={m.id}>
                            {getLocalizedMaterialName(m.id, m.name, lang)} ({m.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sky-300 font-bold block mb-1">
                        📦 {lang === 'ko' ? '적재 단수 (Tiers)' : 'Stack Tiers'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={stockTiers}
                        onChange={(e) => setStockTiers(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-sky-500/60 rounded p-2 text-sky-300 font-mono font-bold"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                        {lang === 'ko' ? '예상 총 적재고' : 'Est. Stack H'}:{' '}
                        {((materials[stockMatId]?.dimensions?.height_m || 0.1) * stockTiers).toFixed(2)} m
                      </span>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">{lang === 'ko' ? '적치 수량 (Count)' : 'Total Count'}</label>
                      <input
                        type="number"
                        min="1"
                        value={stockCount}
                        onChange={(e) => setStockCount(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                        {lang === 'ko' ? '총 중량' : 'Total Mass'}:{' '}
                        {((materials[stockMatId]?.mass_kg || 10) * stockCount).toFixed(0)} kg
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-slate-800">
                    <div>
                      <label className="text-slate-400 block mb-1">{lang === 'ko' ? '래칫 벨트 체결' : 'Ratchet Strap'}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={stockHasRatchet}
                          onChange={(e) => setStockHasRatchet(e.target.checked)}
                          className="rounded text-amber-500"
                        />
                        <span className="text-slate-300">{lang === 'ko' ? '체결됨' : 'Fastened'}</span>
                        {stockHasRatchet && (
                          <input
                            type="number"
                            step="0.5"
                            value={stockRatchetTension}
                            onChange={(e) => setStockRatchetTension(parseFloat(e.target.value))}
                            placeholder="kN"
                            className="w-20 bg-slate-900 border border-slate-700 rounded p-1 text-slate-100 font-mono text-xs"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">{lang === 'ko' ? '바닥 앵커 & 방풍망' : 'Anchor & Net'}</label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1 text-slate-300">
                          <input
                            type="checkbox"
                            checked={stockHasAnchorWire}
                            onChange={(e) => setStockHasAnchorWire(e.target.checked)}
                          />
                          <span>{lang === 'ko' ? '와이어' : 'Wire'}</span>
                        </label>
                        <label className="flex items-center gap-1 text-slate-300">
                          <input
                            type="checkbox"
                            checked={stockHasWindNet}
                            onChange={(e) => setStockHasWindNet(e.target.checked)}
                          />
                          <span>{lang === 'ko' ? '방풍망' : 'Net'}</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">{lang === 'ko' ? '마찰계수 (μ) & 받침목 폭' : 'Friction & Support'}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.05"
                          value={stockFrictionCoeff}
                          onChange={(e) => setStockFrictionCoeff(parseFloat(e.target.value))}
                          className="w-16 bg-slate-900 border border-slate-700 rounded p-1 text-slate-100 font-mono"
                          title="Friction μ"
                        />
                        <span className="text-slate-400">μ / </span>
                        <input
                          type="number"
                          step="0.1"
                          value={stockSupportWidth}
                          onChange={(e) => setStockSupportWidth(parseFloat(e.target.value))}
                          className="w-16 bg-slate-900 border border-slate-700 rounded p-1 text-slate-100 font-mono"
                          title="Support Width (m)"
                        />
                        <span className="text-slate-400">m</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingStockLocId(null)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                    >
                      {lang === 'ko' ? '취소' : 'Cancel'}
                    </button>
                    <button
                      onClick={handleSaveStock}
                      className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{lang === 'ko' ? '적재고 저장 및 즉시 재계산' : 'Save Stack & Recalculate'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 적재물 목록 테이블 */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                      <th className="p-3">{lang === 'ko' ? '적치 구역' : 'Staging Yard'}</th>
                      <th className="p-3">{lang === 'ko' ? '적재 자재명' : 'Material'}</th>
                      <th className="p-3 text-sky-300 font-bold">📦 {lang === 'ko' ? '적재고 (H_stack)' : 'Stack Height'}</th>
                      <th className="p-3">{lang === 'ko' ? '수량 / 총중량' : 'Count / Mass'}</th>
                      <th className="p-3">{lang === 'ko' ? '래칫 벨트 결속' : 'Strapping'}</th>
                      <th className="p-3 text-right">{lang === 'ko' ? '작업' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {locations.map((loc) => {
                      const s = stocks[loc.id];
                      const mat = s ? materials[s.material_id] : null;
                      const stackHeight = mat ? (mat.dimensions.height_m * Math.max(1, s.stack_tiers)).toFixed(2) : '-';
                      const railHeight = loc.guardrail_height_m || 1.2;
                      const isOver = mat && parseFloat(stackHeight) > railHeight;

                      return (
                        <tr key={loc.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-200">{getLocalizedLocationName(loc.id, loc.name, lang)}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {loc.floor} (Z: {loc.elevation_m}m)
                            </div>
                          </td>
                          <td className="p-3">
                            {mat ? (
                              <div>
                                <span className="font-medium text-slate-300">{getLocalizedMaterialName(mat.id, mat.name, lang)}</span>
                                <div className="text-[10px] text-slate-500 font-mono">{mat.category}</div>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">{lang === 'ko' ? '재고 없음' : 'Empty'}</span>
                            )}
                          </td>
                          <td className="p-3 font-mono font-bold">
                            {s && mat ? (
                              <div className="flex items-center gap-1.5">
                                <span className={isOver ? 'text-rose-400' : 'text-sky-300'}>
                                  {stackHeight} m ({s.stack_tiers}단)
                                </span>
                                {isOver && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/40">
                                    {lang === 'ko' ? '난간초과' : 'Over-rail'}
                                  </span>
                                )}
                              </div>
                            ) : '-'}
                          </td>
                          <td className="p-3 font-mono text-slate-300">
                            {s && mat ? `${s.count}개 / ${(mat.mass_kg * s.count).toFixed(0)}kg` : '-'}
                          </td>
                          <td className="p-3">
                            {s ? (
                              s.fastening.has_ratchet_straps ? (
                                <span className="text-emerald-400 font-mono font-semibold">
                                  {s.fastening.strap_tension_kn} kN
                                </span>
                              ) : (
                                <span className="text-rose-400 font-bold">{lang === 'ko' ? '미체결' : 'None'}</span>
                              )
                            ) : '-'}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => startEditStock(loc.id)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded font-medium transition-colors text-xs inline-flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>{lang === 'ko' ? '수정' : 'Edit'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: 자재 규격 (Material) CRUD & CSV Import              */}
          {/* ========================================================= */}
          {activeTab === 'MATERIALS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  {lang === 'ko'
                    ? '자재 치수(L×W×H), 기준 질량, 항력계수(Cd), 양력계수(Cl)를 등록하여 NASA 공기역학 계산에 반영합니다.'
                    : 'Manage dimensions, unit mass, Cd, Cl parameters for exact NASA aerodynamic forces.'}
                </div>
                <button
                  onClick={startNewMat}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'ko' ? '신규 자재 등록' : 'Add Material'}</span>
                </button>
              </div>

              {/* 자재 편집 폼 */}
              {editingMatId && (
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-3">
                  <div className="font-bold text-amber-300 text-xs flex items-center gap-2">
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>
                      {editingMatId === 'NEW'
                        ? (lang === 'ko' ? '신규 자재 규격 등록' : 'New Material Spec')
                        : (lang === 'ko' ? '자재 규격 및 공기역학 계수 수정' : 'Edit Material Spec & Aerodynamics')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">{lang === 'ko' ? '자재 품명' : 'Material Name'}</label>
                      <input
                        type="text"
                        value={matName}
                        onChange={(e) => setMatName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">{lang === 'ko' ? '카테고리' : 'Category'}</label>
                      <select
                        value={matCategory}
                        onChange={(e) => setMatCategory(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
                      >
                        <option value="STEEL">STEEL (철골/강관)</option>
                        <option value="FORM">FORM (거푸집/유로폼)</option>
                        <option value="INSULATION">INSULATION (단열재/경량재)</option>
                        <option value="SCAFFOLD">SCAFFOLD (비계자재)</option>
                        <option value="PANEL">PANEL (판재/석고보드)</option>
                        <option value="OTHER">OTHER (기타)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">{lang === 'ko' ? '단위 기준 질량 (kg)' : 'Unit Mass (kg)'}</label>
                      <input
                        type="number"
                        step="0.5"
                        value={matMass}
                        onChange={(e) => setMatMass(parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">{lang === 'ko' ? '길이 L (m)' : 'Length (m)'}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={matLength}
                        onChange={(e) => setMatLength(parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">{lang === 'ko' ? '폭 W (m)' : 'Width (m)'}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={matWidth}
                        onChange={(e) => setMatWidth(parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">{lang === 'ko' ? '두께/단위높이 H (m)' : 'Height (m)'}</label>
                      <input
                        type="number"
                        step="0.05"
                        value={matHeight}
                        onChange={(e) => setMatHeight(parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">
                        {lang === 'ko' ? '항력/양력 (Cd / Cl)' : 'Cd / Cl'}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.05"
                          value={matCd}
                          onChange={(e) => setMatCd(parseFloat(e.target.value))}
                          placeholder="Cd"
                          className="w-1/2 bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                        />
                        <input
                          type="number"
                          step="0.05"
                          value={matCl}
                          onChange={(e) => setMatCl(parseFloat(e.target.value))}
                          placeholder="Cl"
                          className="w-1/2 bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={matIsLoose}
                        onChange={(e) => setMatIsLoose(e.target.checked)}
                        className="rounded text-amber-500"
                      />
                      <span>{lang === 'ko' ? '비산 취약 낱장/경량판재 여부' : 'Loose Sheet / Susceptible to scattering'}</span>
                    </label>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingMatId(null)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                      >
                        {lang === 'ko' ? '취소' : 'Cancel'}
                      </button>
                      <button
                        onClick={handleSaveMat}
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{lang === 'ko' ? '자재 저장' : 'Save Material'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 자재 목록 테이블 */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                      <th className="p-3">{lang === 'ko' ? '자재 품명' : 'Material Name'}</th>
                      <th className="p-3">{lang === 'ko' ? '규격 (L×W×H)' : 'Dimensions'}</th>
                      <th className="p-3">{lang === 'ko' ? '기준중량' : 'Unit Mass'}</th>
                      <th className="p-3">{lang === 'ko' ? 'Cd / Cl' : 'Cd / Cl'}</th>
                      <th className="p-3">{lang === 'ko' ? '비산특성' : 'Scattering'}</th>
                      <th className="p-3 text-right">{lang === 'ko' ? '작업' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {Object.values(materials).map((mat) => (
                      <tr key={mat.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-200">{getLocalizedMaterialName(mat.id, mat.name, lang)}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{mat.category}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-300">
                          {mat.dimensions.length_m} × {mat.dimensions.width_m} × {mat.dimensions.height_m} m
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-200">{mat.mass_kg} kg</td>
                        <td className="p-3 font-mono text-slate-300">
                          {mat.drag_coefficient} / {mat.lift_coefficient}
                        </td>
                        <td className="p-3">
                          {mat.is_loose_sheet ? (
                            <span className="text-rose-400 font-semibold">{lang === 'ko' ? '비산취약' : 'High Risk'}</span>
                          ) : (
                            <span className="text-slate-400">{lang === 'ko' ? '일반' : 'Standard'}</span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => startEditMat(mat)}
                            className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded transition-colors"
                            title={lang === 'ko' ? '수정' : 'Edit'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteMaterial(mat.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                            title={lang === 'ko' ? '삭제' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* CSV 일괄 등록 아코디언 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'ko' ? 'CSV 규격서 텍스트 일괄 등록' : 'CSV Spec Batch Import'}</span>
                </div>
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs font-mono text-slate-300"
                />
                <button
                  onClick={handleProcessCsv}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded text-xs font-medium"
                >
                  {lang === 'ko' ? 'CSV 파싱 및 자재 DB 일괄 추가' : 'Parse CSV & Batch Append'}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: DB 백업 & JSON 가져오기 & 공장 초기화              */}
          {/* ========================================================= */}
          {activeTab === 'BACKUP' && (
            <div className="space-y-5 text-xs text-slate-300">
              {backupMessage && (
                <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 flex items-center justify-between">
                  <span>{backupMessage}</span>
                  <button onClick={() => setBackupMessage(null)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* 1. JSON 내보내기 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm mb-1">{t.exportJsonBtn}</h4>
                  <p className="text-slate-400">
                    {lang === 'ko'
                      ? '수정된 건물 표고 높이, 적재물 적재고, 래칫 벨트 체결 파라미터 전체를 영구 보관용 JSON 파일로 다운로드합니다.'
                      : 'Download all custom building elevations, stack heights, and strap tensions as a JSON backup file.'}
                  </p>
                </div>
                <button
                  onClick={handleExportJson}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === 'ko' ? 'JSON 다운로드' : 'Export JSON'}</span>
                </button>
              </div>

              {/* 2. JSON 복원 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-100 text-sm">{t.importJsonBtn}</h4>
                <p className="text-slate-400">
                  {lang === 'ko'
                    ? '이전에 내보낸 JSON 백업 데이터를 붙여넣어 즉시 현장 DB로 복원합니다.'
                    : 'Paste previously exported JSON backup data to instantly restore your custom site database.'}
                </p>
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder='{"locations": [...], "materials": {...}, "stocks": {...}}'
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 font-mono text-slate-300 text-xs"
                />
                <button
                  onClick={handleImportJson}
                  disabled={!importJsonText.trim()}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>{lang === 'ko' ? 'DB 복원 실행' : 'Restore Database'}</span>
                </button>
              </div>

              {/* 3. 공장 초기화 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/30 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-rose-400 text-sm mb-1">{t.factoryResetBtn}</h4>
                  <p className="text-slate-400">
                    {lang === 'ko'
                      ? '수정된 데이터를 모두 초기화하고 지침서 1.2의 6개 표준 고위험/주의 검증 데이터셋으로 되돌립니다.'
                      : 'Clear custom browser storage and reset back to the 6 standard high-risk validation scenarios.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(t.factoryResetConfirm)) {
                      onResetDatabase();
                      setBackupMessage(lang === 'ko' ? '공학 표준 데이터셋으로 복원되었습니다.' : 'Restored to engineering standard dataset.');
                    }
                  }}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{lang === 'ko' ? '공장 초기화' : 'Factory Reset'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 모달 하단 닫기 */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            {t.closeModal}
          </button>
        </div>
      </div>
    </div>
  );
};
