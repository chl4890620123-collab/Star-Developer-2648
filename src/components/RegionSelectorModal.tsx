import React, { useState } from 'react';
import {
  X,
  MapPin,
  Navigation,
  Plus,
  Check,
  Compass,
  Building,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  ConstructionSiteRegion,
  convertCoordsToKmaGrid,
  getCurrentGpsRegion,
} from '../services/geoService';
import { Language } from '../services/i18n';

interface RegionSelectorModalProps {
  currentRegion: ConstructionSiteRegion;
  regions: ConstructionSiteRegion[];
  lang: Language;
  onSelectRegion: (region: ConstructionSiteRegion) => void;
  onAddNewRegion: (region: ConstructionSiteRegion) => void;
  onClose: () => void;
}

export const RegionSelectorModal: React.FC<RegionSelectorModalProps> = ({
  currentRegion,
  regions,
  lang,
  onSelectRegion,
  onAddNewRegion,
  onClose,
}) => {
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // 새 지역 추가 폼 상태
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNameKo, setNewNameKo] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newLat, setNewLat] = useState(37.55);
  const [newLng, setNewLng] = useState(126.98);
  const [newAddress, setNewAddress] = useState('');

  const handleGpsCurrentPosition = async () => {
    setIsGpsLoading(true);
    setGpsError(null);
    try {
      const gpsRegion = await getCurrentGpsRegion();
      onAddNewRegion(gpsRegion);
      onSelectRegion(gpsRegion);
      onClose();
    } catch (err: any) {
      console.warn('GPS location error:', err);
      setGpsError(
        lang === 'ko'
          ? '브라우저 GPS 권한이 거부되었거나 위치를 가져올 수 없습니다. 브라우저 위치 권한을 확인해 주세요.'
          : 'Browser GPS permission was denied or unavailable. Please check location permissions.'
      );
    } finally {
      setIsGpsLoading(false);
    }
  };

  const handleCreateRegion = () => {
    if (!newNameKo.trim()) return;
    const { nx, ny } = convertCoordsToKmaGrid(newLat, newLng);
    const customRegion: ConstructionSiteRegion = {
      id: `region-custom-${Date.now()}`,
      nameKo: newNameKo.trim(),
      nameEn: newNameEn.trim() || newNameKo.trim(),
      lat: newLat,
      lng: newLng,
      nx,
      ny,
      addressKo: newAddress.trim() || `위도 ${newLat}, 경도 ${newLng}`,
      addressEn: newAddress.trim() || `Lat ${newLat}, Lng ${newLng}`,
    };
    onAddNewRegion(customRegion);
    onSelectRegion(customRegion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100">
        {/* 헤더 */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {lang === 'ko' ? '현장 위치 및 기상청 관측 격자 설정' : 'Site Location & KMA Grid Settings'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ko'
                  ? '내 위치 GPS 자동 조회 또는 대한민국 타 지역 건설현장 전환'
                  : 'Auto-detect via GPS or switch to other regional construction sites'}
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
        <div className="p-5 space-y-5 overflow-y-auto text-xs">
          {/* GPS 내 위치 자동 조회 버튼 */}
          <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-blue-950/40 border border-blue-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow">
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-bold text-blue-300 flex items-center justify-center sm:justify-start gap-1.5 text-sm">
                <Navigation className="w-4 h-4 text-blue-400 animate-pulse" />
                <span>
                  {lang === 'ko' ? '현재 내 위치 GPS 실시간 가져오기' : 'Auto-detect My Location via GPS'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                {lang === 'ko'
                  ? '브라우저 GPS 좌표를 획득하여 기상청 최단거리 AWS 격자(nx, ny)를 자동 연동합니다.'
                  : 'Acquires browser GPS coords and maps directly to the nearest KMA AWS grid.'}
              </p>
            </div>

            <button
              disabled={isGpsLoading}
              onClick={handleGpsCurrentPosition}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold rounded-lg shadow transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              {isGpsLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'ko' ? 'GPS 수신 중...' : 'Detecting GPS...'}</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>{lang === 'ko' ? '현 위치로 설정' : 'Use Current GPS'}</span>
                </>
              )}
            </button>
          </div>

          {gpsError && (
            <div className="bg-rose-950/40 border border-rose-500/40 rounded-lg p-3 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* 등록된 현장 지역 목록 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-300">
                {lang === 'ko' ? '관제 대상 건설현장 지역 목록' : 'Monitored Construction Site Regions'}
              </span>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'ko' ? '새 현장 지역 추가' : 'Add New Site Region'}</span>
              </button>
            </div>

            {/* 새 지역 직접 추가 폼 */}
            {showAddForm && (
              <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3.5 mb-3 space-y-3">
                <div className="font-bold text-amber-300">
                  {lang === 'ko' ? '새 건설현장 지역 등록' : 'Register New Construction Region'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-slate-400 block mb-1">
                      {lang === 'ko' ? '현장명 (한국어):' : 'Site Name (Korean):'}
                    </label>
                    <input
                      type="text"
                      placeholder="예: 경기 화성 반도체 신축현장"
                      value={newNameKo}
                      onChange={(e) => setNewNameKo(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">
                      {lang === 'ko' ? '현장명 (영어):' : 'Site Name (English):'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hwaseong Fab Site"
                      value={newNameEn}
                      onChange={(e) => setNewNameEn(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">위도 (Latitude):</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newLat}
                      onChange={(e) => setNewLat(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">경도 (Longitude):</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newLng}
                      onChange={(e) => setNewLng(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  {lang === 'ko' ? '자동 계산된 기상청 격자: ' : 'Calculated KMA Grid: '}
                  <span className="font-mono text-amber-300 font-bold">
                    nx = {convertCoordsToKmaGrid(newLat, newLng).nx}, ny ={' '}
                    {convertCoordsToKmaGrid(newLat, newLng).ny}
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1 bg-slate-800 text-slate-400 rounded"
                  >
                    {lang === 'ko' ? '취소' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleCreateRegion}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded"
                  >
                    {lang === 'ko' ? '등록 및 선택' : 'Add & Select'}
                  </button>
                </div>
              </div>
            )}

            {/* 지역 리스트 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {regions.map((reg) => {
                const isSelected = reg.id === currentRegion.id;
                return (
                  <div
                    key={reg.id}
                    onClick={() => {
                      onSelectRegion(reg);
                      onClose();
                    }}
                    className={`cursor-pointer rounded-xl p-3 border transition-all ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span className="truncate">{lang === 'ko' ? reg.nameKo : reg.nameEn}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {lang === 'ko' ? reg.addressKo : reg.addressEn}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          격자 (nx: {reg.nx}, ny: {reg.ny}) | 좌표 ({reg.lat.toFixed(2)}°, {reg.lng.toFixed(2)}°)
                        </div>
                      </div>

                      {isSelected && (
                        <div className="bg-amber-500 text-slate-950 p-1 rounded-full ml-2">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
          >
            {lang === 'ko' ? '닫기' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
