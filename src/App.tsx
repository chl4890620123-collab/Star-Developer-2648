/**
 * 적재구역 기상 위험 예측 관제 시스템 (SafeStack Weather Guard)
 * 구현 지침서 버전 1.2 전체 규격 준수:
 * - 지침서 6/11절 NASA 공기역학 5대 물리 위험 판정
 * - 기상청 단기예보 2.0 실제 API 연동
 * - GPS 실시간 좌표 감지 & 전국 주요 건설현장 지역 전환
 * - 적재구역 표고 높이(Elevation) 및 자재 규격 통합 CRUD DB
 * - 한국어(ko) / 영어(en) 100% 원클릭 다국어 지원
 * - "나노 바나나" 생성 고해상도 3D 관제 및 CFD 시뮬레이션 에셋 통합
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Location,
  Material,
  Stock,
  WeatherCondition,
  RiskLevel,
  Site,
} from './types';
import {
  INITIAL_SITE,
  INITIAL_LOCATIONS,
  INITIAL_MATERIALS,
  INITIAL_STOCKS,
  CURRENT_OBSERVED_WEATHER,
  NEXT_SHIFT_FORECAST_WEATHER,
  HOURLY_24H_FORECAST,
} from './services/mockData';
import { evaluateHazards } from './services/physicsEngine';

import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { KpiSummary } from './components/KpiSummary';
import { WeatherWidget } from './components/WeatherWidget';
import { LocationCard } from './components/LocationCard';
import { LocationDetailModal } from './components/LocationDetailModal';
import { AiIntakeModal } from './components/AiIntakeModal';
import { IntegratedDbManagerModal } from './components/IntegratedDbManagerModal';
import { RegionSelectorModal } from './components/RegionSelectorModal';
import { MobileInspectionView } from './components/MobileInspectionView';
import { SafetyAlarmBanner } from './components/SafetyAlarmBanner';

import { notificationService } from './services/notificationService';
import { Language, translations } from './services/i18n';
import { fetchLiveKmaWeather } from './services/kmaWeatherService';
import { DEFAULT_SITE_REGIONS, ConstructionSiteRegion } from './services/geoService';

import { Filter, Search, AlertTriangle, Check } from 'lucide-react';

const STORAGE_KEY_LOCATIONS = 'safestack_locations_v2';
const STORAGE_KEY_MATERIALS = 'safestack_materials_v2';
const STORAGE_KEY_STOCKS = 'safestack_stocks_v2';
const STORAGE_KEY_REGIONS = 'safestack_regions_v2';
const STORAGE_KEY_LANG = 'safestack_lang_v2';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved === 'ko' || saved === 'en') return saved;
    } catch (e) {
      // ignore
    }
    return 'ko';
  });
  const t = translations[lang];

  // 현장 및 지역 상태 (GPS / 전국 건설거점)
  const [regions, setRegions] = useState<ConstructionSiteRegion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REGIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return DEFAULT_SITE_REGIONS;
  });
  const [currentRegion, setCurrentRegion] = useState<ConstructionSiteRegion>(DEFAULT_SITE_REGIONS[0]);
  const [isRegionSelectorOpen, setIsRegionSelectorOpen] = useState(false);

  // 현장 엔티티 및 적재구역 데이터 상태 (CRUD 및 영구 저장 지원)
  const [site, setSite] = useState<Site>(INITIAL_SITE);
  const [locations, setLocations] = useState<Location[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOCATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_LOCATIONS;
  });
  const [materials, setMaterials] = useState<Record<string, Material>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MATERIALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_MATERIALS;
  });
  const [stocks, setStocks] = useState<Record<string, Stock>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STOCKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_STOCKS;
  });

  // 로컬 스토리지 자동 영구 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch (e) {}
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOCATIONS, JSON.stringify(locations));
    } catch (e) {}
  }, [locations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MATERIALS, JSON.stringify(materials));
    } catch (e) {}
  }, [materials]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STOCKS, JSON.stringify(stocks));
    } catch (e) {}
  }, [stocks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REGIONS, JSON.stringify(regions));
    } catch (e) {}
  }, [regions]);

  // 기상 상태
  const [currentWeather, setCurrentWeather] = useState<WeatherCondition>(CURRENT_OBSERVED_WEATHER);
  const [nextShiftWeather, setNextShiftWeather] = useState<WeatherCondition>(NEXT_SHIFT_FORECAST_WEATHER);
  const [hourlyForecast, setHourlyForecast] = useState<WeatherCondition[]>(HOURLY_24H_FORECAST);
  const [isLiveKma, setIsLiveKma] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('14:15');

  // 기상청 실시간 API 데이터 동기화 (현재 지역 격자 nx, ny 기준)
  const loadKmaLiveWeather = useCallback(
    async (currentLang: Language, nx: number, ny: number) => {
      try {
        const res = await fetchLiveKmaWeather(nx, ny, currentLang);
        setCurrentWeather(res.currentWeather);
        setNextShiftWeather(res.nextShiftWeather);
        setHourlyForecast(res.hourlyForecast);
        setIsLiveKma(res.isLiveApiData);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (e) {
        console.warn('KMA load error:', e);
      }
    },
    []
  );

  useEffect(() => {
    loadKmaLiveWeather(lang, currentRegion.nx, currentRegion.ny);
  }, [lang, currentRegion, loadKmaLiveWeather]);

  // 가상 풍속 시뮬레이터 (null이면 실제 기상청 관측값 적용)
  const [simulationWindSpeed, setSimulationWindSpeed] = useState<number | null>(null);

  // 모드 및 필터 상태
  const [isMobileView, setIsMobileView] = useState(false);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [selectedFloorFilter, setSelectedFloorFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 모달 상태
  const [selectedDetailLocation, setSelectedDetailLocation] = useState<Location | null>(null);
  const [isAiIntakeOpen, setIsAiIntakeOpen] = useState(false);
  const [isDbManagerOpen, setIsDbManagerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 안전 경보 (Safety Alarm) 상태
  const WIND_SPEED_THRESHOLD = 14.0; // 풍속 기준치 (m/s)
  const GUST_SPEED_THRESHOLD = 20.0; // 돌풍 기준치 (m/s)
  const [isAlarmDismissed, setIsAlarmDismissed] = useState(false);

  // 활성 풍속 조건 계산
  const activeWeather = useMemo(() => {
    if (simulationWindSpeed === null) return currentWeather;
    return {
      ...currentWeather,
      wind_speed_ms: simulationWindSpeed,
      gust_speed_ms: Number((simulationWindSpeed * 1.45).toFixed(1)),
      source: lang === 'ko' ? '가상 강풍 시뮬레이션 시험값' : 'Virtual Wind Simulation Value',
    };
  }, [currentWeather, simulationWindSpeed, lang]);

  // 각 구역별 역학 분석 계산 (메모이제이션)
  const locationAssessments = useMemo(() => {
    return locations.map((loc) => {
      const stock = stocks[loc.id];
      const material = stock ? materials[stock.material_id] : null;

      if (!stock || !material) {
        return {
          location: loc,
          stock: null,
          material: null,
          evaluation: null,
        };
      }

      const evaluation = evaluateHazards(loc, material, stock, activeWeather);
      return {
        location: loc,
        stock,
        material,
        evaluation,
      };
    });
  }, [locations, stocks, materials, activeWeather]);

  // 상단 KPI 통계 집계 (동일 장소 중복 미집계)
  const kpiStats = useMemo(() => {
    let dangerCount = 0;
    let warningCount = 0;
    let needCheckCount = 0;
    let unassessedHazards = 0;

    locationAssessments.forEach((item) => {
      if (!item.evaluation) return;
      if (item.evaluation.overallStatus === 'DANGER') dangerCount++;
      else if (item.evaluation.overallStatus === 'WARNING') warningCount++;
      else needCheckCount++;

      Object.values(item.evaluation.hazards).forEach((h) => {
        if (h.status === 'NOT_EVALUATED') unassessedHazards++;
      });
    });

    return {
      dangerCount,
      warningCount,
      needCheckCount,
      totalLocations: locations.length,
      unassessedHazards,
    };
  }, [locationAssessments, locations]);

  // 안전 경보 (Safety Alarm) 자동 판정 조건
  const isDangerThresholdExceeded = kpiStats.dangerCount >= 3;
  const isWindThresholdExceeded =
    activeWeather.wind_speed_ms >= WIND_SPEED_THRESHOLD ||
    activeWeather.gust_speed_ms >= GUST_SPEED_THRESHOLD;

  const isAlarmTriggered = isDangerThresholdExceeded || isWindThresholdExceeded;

  let alarmReason = '';
  if (isDangerThresholdExceeded && isWindThresholdExceeded) {
    alarmReason =
      lang === 'ko'
        ? `DANGER 위험 구역 3개소 이상 발생 (${kpiStats.dangerCount}개소) 및 강풍 기준치 초과 (${activeWeather.wind_speed_ms}m/s)`
        : `≥3 DANGER zones detected (${kpiStats.dangerCount} zones) & Wind speed exceeded ${WIND_SPEED_THRESHOLD}m/s (${activeWeather.wind_speed_ms}m/s)`;
  } else if (isDangerThresholdExceeded) {
    alarmReason =
      lang === 'ko'
        ? `DANGER 위험 구역 3개소 이상 감지 (현재 ${kpiStats.dangerCount}개소 비상)`
        : `≥3 DANGER zones detected (${kpiStats.dangerCount} zones in critical status)`;
  } else if (isWindThresholdExceeded) {
    alarmReason =
      lang === 'ko'
        ? `현장 풍속이 안전 기준치(${WIND_SPEED_THRESHOLD}m/s)를 초과함 (현재 ${activeWeather.wind_speed_ms}m/s, 돌풍 ${activeWeather.gust_speed_ms}m/s)`
        : `Site wind speed exceeded ${WIND_SPEED_THRESHOLD}m/s (Current ${activeWeather.wind_speed_ms}m/s, Gust ${activeWeather.gust_speed_ms}m/s)`;
  }

  // 자동 브라우저 알림 (Notification API) 및 사운드 트리거
  useEffect(() => {
    if (isAlarmTriggered) {
      setIsAlarmDismissed(false);
      notificationService.triggerAlarm(
        lang === 'ko' ? '🚨 [SafeStack 긴급 안전 경보 발령]' : '🚨 [SafeStack Emergency Site Safety Alarm]',
        `${alarmReason}. ${lang === 'ko' ? '즉시 전 구역 자재 결속 및 타워크레인 작업을 점검하십시오.' : 'Inspect all material tie-downs and crane operations immediately.'}`,
        alarmReason
      );
    }
  }, [isAlarmTriggered, kpiStats.dangerCount, activeWeather.wind_speed_ms, lang]);

  const handleTestNotification = () => {
    notificationService.triggerAlarm(
      lang === 'ko' ? '🔔 [SafeStack 안전 경보 테스트]' : '🔔 [SafeStack Safety Alarm Test]',
      lang === 'ko'
        ? `DANGER 위험구역 3개소 또는 풍속 ${WIND_SPEED_THRESHOLD}m/s 초과 시 자동 발송되는 알림 테스트입니다.`
        : `Automated alert test triggered when ≥3 DANGER zones or wind exceeds ${WIND_SPEED_THRESHOLD}m/s.`,
      lang === 'ko' ? '사용자 수동 시험' : 'Manual User Test',
      true
    );
  };

  // 필터링된 구역 목록 (위험도 순으로 우선 정렬: DANGER -> WARNING -> NEED_CHECK)
  const filteredAssessments = useMemo(() => {
    return locationAssessments
      .filter((item) => {
        if (!item.evaluation) return false;
        if (selectedRiskFilter !== 'ALL' && item.evaluation.overallStatus !== selectedRiskFilter) {
          return false;
        }
        if (selectedFloorFilter !== 'ALL' && item.location.floor !== selectedFloorFilter) {
          return false;
        }
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchLoc = item.location.name.toLowerCase().includes(q);
          const matchMat = item.material?.name.toLowerCase().includes(q);
          if (!matchLoc && !matchMat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const order: Record<RiskLevel, number> = { DANGER: 0, WARNING: 1, NEED_CHECK: 2, NOT_EVALUATED: 3 };
        const statusA = a.evaluation?.overallStatus || 'NOT_EVALUATED';
        const statusB = b.evaluation?.overallStatus || 'NOT_EVALUATED';
        return order[statusA] - order[statusB];
      });
  }, [locationAssessments, selectedRiskFilter, selectedFloorFilter, searchQuery]);

  const availableFloors = useMemo(() => {
    return Array.from(new Set(locations.map((l) => l.floor)));
  }, [locations]);

  // 재고 수정 반영
  const handleUpdateStock = (updatedStock: Stock) => {
    setStocks((prev) => ({
      ...prev,
      [updatedStock.location_id]: updatedStock,
    }));
    setLastUpdated(new Date().toLocaleTimeString());
  };

  // AI 판독 결과 반영
  const handleConfirmIntake = (locationId: string, partialStock: Partial<Stock>) => {
    setStocks((prev) => {
      const existing = prev[locationId];
      if (!existing) return prev;
      return {
        ...prev,
        [locationId]: {
          ...existing,
          ...partialStock,
          input_version: existing.input_version + 1,
          updated_at: new Date().toLocaleTimeString(),
        },
      };
    });
    setLastUpdated(new Date().toLocaleTimeString());
  };

  // 모바일 퀵 결속 조치 (래칫 밴딩 체결 및 즉각 역학 재계산)
  const handleQuickMitigation = (locationId: string) => {
    setStocks((prev) => {
      const existing = prev[locationId];
      if (!existing) return prev;
      const isCurrentlyStrapped = existing.fastening?.has_ratchet_straps;
      const nextStrapped = !isCurrentlyStrapped;
      return {
        ...prev,
        [locationId]: {
          ...existing,
          bundle_state: nextStrapped ? 'TIGHTLY_STRAPPED' : existing.bundle_state,
          fastening: {
            ...existing.fastening,
            has_ratchet_straps: nextStrapped,
            strap_tension_kn: nextStrapped ? 3.5 : 0.0,
          },
          input_version: existing.input_version + 1,
          updated_at: new Date().toLocaleTimeString(),
        },
      };
    });
    setToastMessage(
      lang === 'ko'
        ? '래칫 밴딩 체결 상태 변경 완료! 안전율이 즉시 재계산되었습니다.'
        : 'Ratchet strap fastening updated! Safety factor recalculated.'
    );
    setTimeout(() => setToastMessage(null), 3000);
    setLastUpdated(new Date().toLocaleTimeString());
  };

  // 적재구역(Location) CRUD 핸들러
  const handleSaveLocation = (loc: Location) => {
    setLocations((prev) => {
      const idx = prev.findIndex((l) => l.id === loc.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = loc;
        return next;
      }
      return [...prev, loc];
    });
    // 재고 항목이 없다면 기본 재고 자동 생성
    if (!stocks[loc.id]) {
      const firstMatId = Object.keys(materials)[0] || 'mat-eps-insulation';
      setStocks((prev) => ({
        ...prev,
        [loc.id]: {
          id: `stock-${loc.id}`,
          location_id: loc.id,
          material_id: firstMatId,
          count: 20,
          stack_tiers: 2,
          orientation: 'FACE_TO_WIND',
          bundle_state: 'TIGHTLY_STRAPPED',
          fastening: {
            has_ratchet_straps: false,
            strap_tension_kn: 0.0,
            has_anchor_wires: false,
            wire_capacity_kn: 0.0,
            has_wind_net: false,
          },
          contact_surface: 'CONCRETE_WOOD',
          friction_coefficient: 0.4,
          support_geometry: {
            support_width_m: 0.8,
            support_height_m: 0.1,
            has_wheel_chocks: false,
          },
          updated_at: new Date().toLocaleTimeString(),
          input_version: 1,
        },
      }));
    }
    setLastUpdated(new Date().toLocaleTimeString());
  };

  const handleDeleteLocation = (locId: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== locId));
    setStocks((prev) => {
      const next = { ...prev };
      delete next[locId];
      return next;
    });
  };

  // 자재 규격 CRUD 핸들러
  const handleSaveMaterial = (mat: Material) => {
    setMaterials((prev) => ({ ...prev, [mat.id]: mat }));
  };

  const handleDeleteMaterial = (matId: string) => {
    const isUsed = Object.values(stocks).some((s) => s.material_id === matId && s.count > 0);
    if (isUsed) {
      alert(
        lang === 'ko'
          ? '현재 적재구역에 활성 재고가 존재하는 자재는 삭제할 수 없습니다. 수량을 0으로 반출 처리하십시오.'
          : 'Cannot delete a material currently staged in active yards. Set its quantity to 0 first.'
      );
      return;
    }
    setMaterials((prev) => {
      const next = { ...prev };
      delete next[matId];
      return next;
    });
  };

  const handleBatchUploadMaterials = (newMats: Material[]) => {
    setMaterials((prev) => {
      const next = { ...prev };
      newMats.forEach((m) => {
        next[m.id] = m;
      });
      return next;
    });
  };

  // 지역 전환 핸들러
  const handleSelectRegion = (region: ConstructionSiteRegion) => {
    setCurrentRegion(region);
    setSite((prev) => ({
      ...prev,
      name: lang === 'ko' ? region.nameKo : region.nameEn,
      address: lang === 'ko' ? region.addressKo : region.addressEn,
      coordinates: { lat: region.lat, lng: region.lng },
    }));
    loadKmaLiveWeather(lang, region.nx, region.ny);
  };

  const handleAddNewRegion = (region: ConstructionSiteRegion) => {
    setRegions((prev) => {
      if (prev.some((r) => r.id === region.id)) return prev;
      return [region, ...prev];
    });
  };

  const handleResetData = () => {
    setStocks(INITIAL_STOCKS);
    setMaterials(INITIAL_MATERIALS);
    setLocations(INITIAL_LOCATIONS);
    setSimulationWindSpeed(null);
    loadKmaLiveWeather(lang, currentRegion.nx, currentRegion.ny);
    setToastMessage(lang === 'ko' ? '현장 표준 데이터셋으로 재설정 및 역학 재계산 완료!' : 'Reset to baseline and re-calculated!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 keep-all no-overflow">
      {/* 1. 상단 내비게이션 & 현장 헤더 */}
      <Header
        site={site}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'ko' ? 'en' : 'ko'))}
        isMobileView={isMobileView}
        setIsMobileView={setIsMobileView}
        onOpenAiIntake={() => setIsAiIntakeOpen(true)}
        onOpenMaterialManager={() => setIsDbManagerOpen(true)}
        onOpenRegionSelector={() => setIsRegionSelectorOpen(true)}
        currentRegionName={lang === 'ko' ? currentRegion.nameKo : currentRegion.nameEn}
        onResetData={handleResetData}
        lastUpdated={lastUpdated}
        isLiveKma={isLiveKma}
      />

      {/* 1-1. 자동 안전 경보 시스템 배너 (Notification API & Siren) */}
      <SafetyAlarmBanner
        isAlarmActive={isAlarmTriggered && !isAlarmDismissed}
        alarmReason={alarmReason}
        dangerCount={kpiStats.dangerCount}
        currentWindSpeed={activeWeather.wind_speed_ms}
        currentGustSpeed={activeWeather.gust_speed_ms}
        windThreshold={WIND_SPEED_THRESHOLD}
        lang={lang}
        onDismiss={() => setIsAlarmDismissed(true)}
        onTestNotification={handleTestNotification}
      />

      {/* 2. 본문 메인 레이아웃 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 나노 바나나 생성 시각화 에셋 기반 히어로 배너 (인터랙티브 바로가기 연동 - PC 관제 모드 전용) */}
        {!isMobileView && (
          <HeroBanner
            lang={lang}
            currentWindSpeed={activeWeather.wind_speed_ms}
            gustSpeed={activeWeather.gust_speed_ms}
            dangerCount={kpiStats.dangerCount}
            isLiveKma={isLiveKma}
            onSelectDangerFilter={() => {
              setSelectedRiskFilter('DANGER');
              document.getElementById('yard-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenAiIntake={() => setIsAiIntakeOpen(true)}
            onScrollToWeather={() => {
              document.getElementById('weather-widget')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenMitigationModal={() => {
              const danger = locations.find((l) => stocks[l.id]?.fastening?.has_ratchet_straps === false) || locations[0];
              setSelectedDetailLocation(danger);
            }}
            onOpenDetailModal={() => {
              setSelectedDetailLocation(locations[0]);
            }}
          />
        )}

        {/* 모바일 뷰 전용 레이아웃 분기 */}
        {isMobileView ? (
          <MobileInspectionView
            locations={locations}
            materials={materials}
            stocks={stocks}
            currentWeather={activeWeather}
            nextShiftWeather={nextShiftWeather}
            lang={lang}
            onOpenAiIntake={() => setIsAiIntakeOpen(true)}
            onSelectLocationDetail={(loc) => setSelectedDetailLocation(loc)}
            onQuickMitigation={handleQuickMitigation}
          />
        ) : (
          /* PC 종합 관제 대시보드 */
          <>
            {/* KPI 요약 위젯 */}
            <KpiSummary
              stats={kpiStats}
              selectedFilter={selectedRiskFilter}
              onSelectFilter={setSelectedRiskFilter}
              lang={lang}
            />

            {/* 실시간 2-Column 기상 위젯 (관측 vs 차기 예보) & 24시간 타임라인 */}
            <WeatherWidget
              currentWeather={currentWeather}
              nextShiftWeather={nextShiftWeather}
              hourlyForecast={hourlyForecast}
              simulationWindSpeed={simulationWindSpeed}
              onSetSimulationWindSpeed={setSimulationWindSpeed}
              lang={lang}
            />

            {/* 구역 검색 및 층별 필터 바 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow keep-all no-overflow">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                  <Filter className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{t.filterLabel}:</span>
                </span>
                <select
                  value={selectedFloorFilter}
                  onChange={(e) => setSelectedFloorFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">{t.allFloors}</option>
                  {availableFloors.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>

                <div className="text-xs text-slate-400 ml-2 hidden sm:block whitespace-nowrap">
                  {t.displayedCount}: <strong className="text-slate-100">{filteredAssessments.length}</strong> / {locations.length}
                </div>
              </div>

              {/* 검색창 */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* 적재구역 카드 그리드 */}
            {filteredAssessments.length > 0 ? (
              <div id="yard-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 scroll-mt-20">
                {filteredAssessments.map(({ location, stock, material, evaluation }) => {
                  if (!stock || !material || !evaluation) return null;
                  return (
                    <LocationCard
                      key={location.id}
                      location={location}
                      material={material}
                      stock={stock}
                      hazards={evaluation.hazards}
                      overallStatus={evaluation.overallStatus}
                      worstHazard={evaluation.worstHazard}
                      weather={activeWeather}
                      lang={lang}
                      onOpenDetail={() => setSelectedDetailLocation(location)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto opacity-70" />
                <h3 className="text-base font-bold text-slate-200">{t.noLocationsFound}</h3>
                <button
                  onClick={() => {
                    setSelectedRiskFilter('ALL');
                    setSelectedFloorFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                >
                  {t.resetFilters}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* 3. 모달: 상세 역학 계산 & 조치 시뮬레이션 (CFD 3D 시뮬레이션 에셋 탑재) */}
      {selectedDetailLocation && (
        <LocationDetailModal
          location={selectedDetailLocation}
          material={materials[stocks[selectedDetailLocation.id]?.material_id]}
          stock={stocks[selectedDetailLocation.id]}
          weather={activeWeather}
          lang={lang}
          onClose={() => setSelectedDetailLocation(null)}
          onUpdateStock={handleUpdateStock}
        />
      )}

      {/* 4. 모달: 입고 사진 및 규격자료 AI 판독 (Gemini) */}
      {isAiIntakeOpen && (
        <AiIntakeModal
          locations={locations}
          materials={materials}
          lang={lang}
          onClose={() => setIsAiIntakeOpen(false)}
          onConfirmIntake={handleConfirmIntake}
        />
      )}

      {/* 5. 모달: 통합 현장 적치구역 및 자재 규격 관리 설정 */}
      {isDbManagerOpen && (
        <IntegratedDbManagerModal
          locations={locations}
          materials={materials}
          stocks={stocks}
          lang={lang}
          onClose={() => setIsDbManagerOpen(false)}
          onSaveLocation={handleSaveLocation}
          onDeleteLocation={handleDeleteLocation}
          onSaveStock={handleUpdateStock}
          onDeleteStock={(locId) => {
            setStocks((prev) => {
              const next = { ...prev };
              delete next[locId];
              return next;
            });
          }}
          onSaveMaterial={handleSaveMaterial}
          onDeleteMaterial={handleDeleteMaterial}
          onBatchUploadMaterials={handleBatchUploadMaterials}
          onResetDatabase={handleResetData}
          onImportDatabase={(data) => {
            if (data.locations) setLocations(data.locations);
            if (data.materials) setMaterials(data.materials);
            if (data.stocks) setStocks(data.stocks);
          }}
        />
      )}

      {/* 6. 모달: 현장 위치 GPS 감지 및 대한민국 타 거점 지역 전환/추가 */}
      {isRegionSelectorOpen && (
        <RegionSelectorModal
          currentRegion={currentRegion}
          regions={regions}
          lang={lang}
          onSelectRegion={handleSelectRegion}
          onAddNewRegion={handleAddNewRegion}
          onClose={() => setIsRegionSelectorOpen(false)}
        />
      )}

      {/* 푸터 */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t.footerText}</span>
          <span className="text-slate-400 text-[11px]">{t.footerSubtext}</span>
        </div>
      </footer>

      {/* 플로팅 알림 토스트 (원클릭 조치 및 초기화 피드백) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-3 backdrop-blur-md">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
