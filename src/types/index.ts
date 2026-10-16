/**
 * 적재구역 기상 위험 예측 시스템 - 데이터 계약 (Data Contracts)
 * 구현 지침서 버전 1.2 기반
 */

export type HazardType = 'sliding' | 'toppling' | 'uplift' | 'falling' | 'scattering';

export type RiskLevel = 'DANGER' | 'WARNING' | 'NEED_CHECK' | 'NOT_EVALUATED';

export interface Site {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  building_height_m: number;
}

export type ExposureCondition = 'OPEN_ROOFTOP' | 'UNPROTECTED_SLAB_EDGE' | 'SEMI_ENCLOSED' | 'GROUND_YARD';

export interface Location {
  id: string;
  site_id: string;
  name: string;
  floor: string; // e.g., "12F (옥상층)", "4F (외벽개구부)", "1F (중앙야적장)"
  elevation_m: number;
  exposure_conditions: ExposureCondition;
  edge_distance_m: number; // 가장자리 슬래브 단부와의 거리
  has_guardrail: boolean; // 안전 난간/방호벽 유무
  guardrail_height_m?: number;
}

export type MassBasis = 'PER_UNIT' | 'PER_BUNDLE' | 'PER_SQM';

export interface Material {
  id: string;
  name: string;
  category: 'STEEL' | 'FORM' | 'INSULATION' | 'SCAFFOLD' | 'PANEL' | 'OTHER';
  dimensions: {
    length_m: number;
    width_m: number;
    height_m: number;
  };
  mass_basis: MassBasis;
  mass_kg: number; // 기준 질량 (kg)
  drag_coefficient: number; // 형상 항력 계수 (Cd)
  lift_coefficient: number; // 양력 계수 (Cl)
  is_loose_sheet: boolean; // 비산에 취약한 낱장/경량판재 여부
  source_file_id?: string;
  source_version?: string;
}

export type ContactSurface = 'CONCRETE_WOOD' | 'CONCRETE_STEEL' | 'WOOD_STEEL' | 'CONCRETE_RUBBER' | 'TARPAULIN_STEEL';

export interface Stock {
  id: string;
  location_id: string;
  material_id: string;
  count: number; // 양의 정수 (0이면 재고 없음)
  stack_tiers: number; // 적재 단수 (높이)
  orientation: 'FACE_TO_WIND' | 'EDGE_TO_WIND' | 'OBLIQUE';
  bundle_state: 'TIGHTLY_STRAPPED' | 'LOOSE_BUNDLE' | 'INDIVIDUAL_SHEETS';
  fastening: {
    has_ratchet_straps: boolean;
    strap_tension_kn: number; // 고정력 (kN)
    has_anchor_wires: boolean;
    wire_capacity_kn: number;
    has_wind_net: boolean;
  };
  contact_surface: ContactSurface;
  friction_coefficient: number; // 정지 마찰계수 μ
  support_geometry: {
    support_width_m: number; // 받침목 폭
    support_height_m: number;
    has_wheel_chocks: boolean;
  };
  updated_at: string;
  input_version: number;
}

export interface EvidenceField<T> {
  estimated_value: T; // AI 추출 또는 초기 추정치
  confirmed_value: T; // 관리자 확정값
  is_confirmed: boolean;
  source_type: 'SPEC_SHEET' | 'INTAKE_PHOTO' | 'MANUAL_INPUT';
  source_ref?: string;
  confidence: number; // 0.0 ~ 1.0
  note?: string;
}

export interface WeatherCondition {
  source: string;
  valid_time: string; // e.g., "14:00"
  observed_or_forecast: 'OBSERVED' | 'FORECAST';
  wind_speed_ms: number; // 10분 평균 풍속 (m/s)
  gust_speed_ms: number; // 순간 최대 풍속 (m/s)
  wind_direction_deg: number;
  wind_direction_text: string;
  temperature_c: number;
  precipitation_prob: number; // 강수확률 (%)
  warning_issued?: 'WIND_ADVISORY' | 'TYPHOON_WARNING' | null;
}

export interface DualHeightContext {
  building_elevation_m: number; // 건물 설치 층 표고 높이 (Z, m) -> 고도 풍속 계산용
  effective_wind_speed_ms: number; // 해당 층 높이에서 실제로 받는 국지 풍속 (V_z, m/s)
  stack_height_m: number; // 적재물 자체 적치 높이 (H_stack, m) -> 수압 면적 & 모멘트용
  guardrail_height_m: number; // 슬래브 단부 방호난간 높이 (m)
  height_delta_m: number; // 적재 높이 - 난간 높이 (양수면 난간 턱 초과 위험)
  is_over_guardrail: boolean; // 난간 턱 초과 여부
  edge_distance_m: number; // 단부 이격거리 (m)
  fall_drop_height_m: number; // 추락 시 하부 지상까지의 자유 낙하 높이 (m)
}

export interface HazardEvaluation {
  hazard_type: HazardType;
  hazard_name: string;
  status: RiskLevel;
  safety_factor: number; // 여유율 (FS)
  critical_wind_speed_ms: number; // 한계 도달 풍속 (m/s)
  formula_display: string;
  applied_parameters: Record<string, number | string>;
  causes: string[];
  recommended_actions: string[];
  uncertainty_note?: string;
  dual_height?: DualHeightContext;
}

export interface AssessmentResult {
  id: string;
  location_id: string;
  input_version: number;
  model_version: string;
  calculated_at: string;
  overall_status: RiskLevel;
  primary_weather: {
    current: WeatherCondition;
    next_shift: WeatherCondition;
  };
  hazards: Record<HazardType, HazardEvaluation>;
  worst_hazard: HazardEvaluation;
  completeness: {
    evaluated_count: number;
    total_count: number;
    unassessed_reasons: string[];
  };
  explanation: string;
  sensitivity_insight: string;
}

export interface AssessmentComparison {
  before: AssessmentResult;
  after: AssessmentResult;
  action_applied: string;
}
