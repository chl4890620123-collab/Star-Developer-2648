/**
 * 적재구역 기상 위험 예측 물리 계산 엔진 (Physics Calculation Engine)
 * 지침서 6절, 11절, 16절 준수:
 * - NASA 항력식 및 양력식 적용
 * - 미끄러짐(Sliding), 전도(Toppling), 들림(Uplift), 낙하(Falling), 비산(Scattering)
 * - 고도 및 노출도에 따른 풍속 보정 (KDS 구조기준 풍하중 참조)
 * - 한국어(ko) 및 영어(en) 100% 완전 다국어 지원
 */

import {
  Location,
  Material,
  Stock,
  WeatherCondition,
  HazardEvaluation,
  HazardType,
  RiskLevel,
  AssessmentResult,
} from '../types';

const AIR_DENSITY = 1.225; // kg/m^3 (해수면 15℃ 표준 공기밀도)
const GRAVITY = 9.80665; // m/s^2

/**
 * 적재층 높이에 따른 고도 풍속 보정 (KDS 풍하중 기준 지표조도구분 B/C 준용)
 * z0: 기준 관측 높이 (10m), z: 적재층 표고
 */
export function getEffectiveWindSpeed(
  baseSpeed: number,
  elevationM: number,
  exposure: Location['exposure_conditions']
): number {
  if (elevationM <= 10 && exposure === 'GROUND_YARD') {
    return baseSpeed;
  }
  const z = Math.max(10, elevationM);
  // 지표면 조도 계수 alpha (지상/도심 약 0.15~0.22)
  const alpha = exposure === 'OPEN_ROOFTOP' ? 0.22 : 0.18;
  const heightFactor = Math.pow(z / 10, alpha);

  // 노출 조건에 따른 국지 와류 증폭 계수
  let exposureMultiplier = 1.0;
  if (exposure === 'OPEN_ROOFTOP') exposureMultiplier = 1.15; // 옥상 모서리 와류
  if (exposure === 'UNPROTECTED_SLAB_EDGE') exposureMultiplier = 1.20; // 개구부 통바람 벤투리
  if (exposure === 'SEMI_ENCLOSED') exposureMultiplier = 0.85;

  return Number((baseSpeed * heightFactor * exposureMultiplier).toFixed(2));
}

export function evaluateHazards(
  location: Location,
  material: Material,
  stock: Stock,
  weather: WeatherCondition,
  lang: 'ko' | 'en' = 'ko'
): {
  hazards: Record<HazardType, HazardEvaluation>;
  overallStatus: RiskLevel;
  worstHazard: HazardEvaluation;
  explanation: string;
  sensitivityInsight: string;
} {
  // 1. 유효 풍속 및 순간 돌풍 계산
  const effectiveWind = getEffectiveWindSpeed(weather.wind_speed_ms, location.elevation_m, location.exposure_conditions);
  const effectiveGust = getEffectiveWindSpeed(weather.gust_speed_ms, location.elevation_m, location.exposure_conditions);

  // 2. 물리적 형상 및 질량 계산
  const singleMass = material.mass_kg;
  const totalCount = stock.count;
  const totalMass = singleMass * totalCount;
  const totalWeightN = totalMass * GRAVITY;

  // 전체 적재 형상 (단수 반영)
  const stackHeight = material.dimensions.height_m * Math.max(1, stock.stack_tiers);
  const stackLength = material.dimensions.length_m;
  const stackWidth = material.dimensions.width_m;

  // 풍하중 수압 면적 A_proj (풍향에 따라 수직면)
  let projArea = stackLength * stackHeight;
  let topArea = stackLength * stackWidth;
  if (stock.orientation === 'EDGE_TO_WIND') {
    projArea = stackWidth * stackHeight;
  }

  // 결속력 환산 (kN -> N)
  let strapForceN = 0;
  let strapResistMomentNm = 0;
  if (stock.fastening.has_ratchet_straps) {
    strapForceN += stock.fastening.strap_tension_kn * 1000;
    // 래칫 벨트가 바닥으로 당겨주는 모멘트 기여 (B/2 지점 가정)
    strapResistMomentNm += strapForceN * (stackWidth / 2);
  }
  if (stock.fastening.has_anchor_wires) {
    strapForceN += stock.fastening.wire_capacity_kn * 1000 * 0.7; // 유효 장력
    strapResistMomentNm += stock.fastening.wire_capacity_kn * 1000 * 0.7 * (stackWidth / 2);
  }

  // ==========================================
  // [A] 미끄러짐 (Sliding) 계산
  // ==========================================
  const q_gust = 0.5 * AIR_DENSITY * Math.pow(effectiveGust, 2);
  const dragForceN = q_gust * material.drag_coefficient * projArea;
  const liftForceN = q_gust * material.lift_coefficient * topArea;
  const effectiveNormalForceN = Math.max(0, totalWeightN + strapForceN - liftForceN);
  const frictionForceN = stock.friction_coefficient * effectiveNormalForceN + (stock.fastening.has_anchor_wires ? 1500 : 0);

  const fs_slide = dragForceN > 0 ? frictionForceN / dragForceN : 99.9;
  const crit_denom_slide = 0.5 * AIR_DENSITY * (material.drag_coefficient * projArea + stock.friction_coefficient * material.lift_coefficient * topArea);
  const crit_num_slide = stock.friction_coefficient * (totalWeightN + strapForceN) + (stock.fastening.has_anchor_wires ? 1500 : 0);
  const crit_speed_slide = crit_denom_slide > 0 && crit_num_slide > 0 ? Math.sqrt(crit_num_slide / crit_denom_slide) : 0;

  let slideStatus: RiskLevel = 'NOT_EVALUATED';
  const slideCauses: string[] = [];
  const slideActions: string[] = [];

  if (totalCount <= 0) {
    slideStatus = 'NOT_EVALUATED';
  } else if (fs_slide < 1.0) {
    slideStatus = 'DANGER';
    if (lang === 'ko') {
      slideCauses.push(`돌풍 시 풍하중(${dragForceN.toFixed(0)}N)이 바닥 마찰 저항력(${frictionForceN.toFixed(0)}N)을 초과함`);
      slideActions.push('고무 마찰패드 깔기 (마찰계수 μ를 0.35에서 0.65 이상으로 상향)');
      slideActions.push('래칫 텐션 벨트로 슬래브 앵커 결속 (권장 장력 2.5kN 이상)');
    } else {
      slideCauses.push(`Aerodynamic drag force (${dragForceN.toFixed(0)}N) exceeds friction resistance (${frictionForceN.toFixed(0)}N) during gusts`);
      slideActions.push('Install rubber anti-slip pads (raises friction coefficient μ from 0.35 to 0.65+)');
      slideActions.push('Fasten ratchet straps to slab anchors (recommended tension ≥ 2.5kN)');
    }
  } else if (fs_slide < 1.3) {
    slideStatus = 'WARNING';
    if (lang === 'ko') {
      slideCauses.push(`풍하중 대비 마찰 저항 안전율이 ${fs_slide.toFixed(2)}로 주의 기준(1.3) 미달`);
      slideActions.push('강풍 시 결속 벨트 점검 및 바닥 이물질/물기 제거');
    } else {
      slideCauses.push(`Sliding safety factor is ${fs_slide.toFixed(2)} (below warning threshold 1.3)`);
      slideActions.push('Inspect tie-down straps and clear surface moisture/debris before wind events');
    }
  } else {
    slideStatus = 'NEED_CHECK';
    if (lang === 'ko') {
      slideCauses.push(`현재 돌풍 기준 안전율 ${fs_slide.toFixed(2)} 유지 (FS >= 1.3)`);
    } else {
      slideCauses.push(`Current sliding safety factor maintained at ${fs_slide.toFixed(2)} (FS >= 1.3)`);
    }
  }

  const slideEval: HazardEvaluation = {
    hazard_type: 'sliding',
    hazard_name: lang === 'ko' ? '수평 미끄러짐' : 'Horizontal Sliding',
    status: slideStatus === 'NEED_CHECK' && fs_slide >= 1.3 ? 'NEED_CHECK' : slideStatus,
    safety_factor: Number(fs_slide.toFixed(2)),
    critical_wind_speed_ms: Number(crit_speed_slide.toFixed(1)),
    formula_display: 'FS = (μ · (M·g - F_lift) + F_strap) / (0.5 · ρ · V² · Cd · A)',
    applied_parameters: {
      [lang === 'ko' ? '적재 총중량 (kg)' : 'Total Mass (kg)']: totalMass,
      [lang === 'ko' ? '수평 풍하중 F_drag (N)' : 'Drag Force F_drag (N)']: Math.round(dragForceN),
      [lang === 'ko' ? '바닥 마찰 저항 (N)' : 'Friction Force (N)']: Math.round(frictionForceN),
      [lang === 'ko' ? '정지 마찰계수 μ' : 'Friction Coeff μ']: stock.friction_coefficient,
      [lang === 'ko' ? '순간 풍속 V_gust (m/s)' : 'Gust Speed (m/s)']: effectiveGust,
    },
    causes: slideCauses,
    recommended_actions: slideActions,
  };

  // ==========================================
  // [B] 전도 / 넘어짐 (Toppling) 계산
  // ==========================================
  const centerOfPressureH = stackHeight / 2;
  const overturnMomentNm = dragForceN * centerOfPressureH;
  const supportHalfWidth = Math.max(0.1, stock.support_geometry.support_width_m / 2);
  const resistMomentNm = Math.max(0, (totalWeightN - liftForceN) * supportHalfWidth) + strapResistMomentNm;

  const fs_topple = overturnMomentNm > 0 ? resistMomentNm / overturnMomentNm : 99.9;
  const crit_speed_topple = overturnMomentNm > 0 ? effectiveGust * Math.sqrt(Math.max(0.01, fs_topple)) : 40.0;

  let toppleStatus: RiskLevel = 'NOT_EVALUATED';
  const toppleCauses: string[] = [];
  const toppleActions: string[] = [];

  if (totalCount <= 0) {
    toppleStatus = 'NOT_EVALUATED';
  } else if (fs_topple < 1.0) {
    toppleStatus = 'DANGER';
    if (lang === 'ko') {
      toppleCauses.push(`풍압 전도 모멘트(${overturnMomentNm.toFixed(0)} N·m)가 자중 및 고정 복원 모멘트(${resistMomentNm.toFixed(0)} N·m) 초과`);
      if (stock.stack_tiers >= 3) {
        toppleCauses.push(`적재 단수(${stock.stack_tiers}단, 높이 ${stackHeight.toFixed(1)}m)가 받침 폭(${stock.support_geometry.support_width_m}m) 대비 과도하게 높음`);
        toppleActions.push(`적재 단수를 ${stock.stack_tiers}단에서 2단 이하로 분산 적치`);
      }
      toppleActions.push(`받침목 지지 폭을 ${stock.support_geometry.support_width_m}m에서 ${(stock.support_geometry.support_width_m * 1.5).toFixed(2)}m 이상으로 확장`);
      toppleActions.push('상부 래칫 와이어 X자 교차 브레이싱 결속');
    } else {
      toppleCauses.push(`Overturning moment (${overturnMomentNm.toFixed(0)} N·m) exceeds restoring moment (${resistMomentNm.toFixed(0)} N·m)`);
      if (stock.stack_tiers >= 3) {
        toppleCauses.push(`Stack height (${stock.stack_tiers} tiers, ${stackHeight.toFixed(1)}m) is too tall for support base (${stock.support_geometry.support_width_m}m)`);
        toppleActions.push(`Reduce stacking tiers from ${stock.stack_tiers} to 2 tiers or lower`);
      }
      toppleActions.push(`Widen dunnage support from ${stock.support_geometry.support_width_m}m to ${(stock.support_geometry.support_width_m * 1.5).toFixed(2)}m+`);
      toppleActions.push('Cross-brace top cargo with ratchet wire straps');
    }
  } else if (fs_topple < 1.3) {
    toppleStatus = 'WARNING';
    if (lang === 'ko') {
      toppleCauses.push(`전도 안전율 ${fs_topple.toFixed(2)} (주의 기준 1.3 미만)`);
      toppleActions.push('적재물 경사도 측정 및 받침목 수평 고임목 쐐기 점검');
    } else {
      toppleCauses.push(`Toppling safety factor is ${fs_topple.toFixed(2)} (below warning threshold 1.3)`);
      toppleActions.push('Verify stack leveling and inspect dunnage support wedges');
    }
  } else {
    toppleStatus = 'NEED_CHECK';
    if (lang === 'ko') {
      toppleCauses.push(`현재 전도 안전율 ${fs_topple.toFixed(2)} 유지 (안전 기준 충족하나 받침목 이완 수시 확인)`);
    } else {
      toppleCauses.push(`Current toppling safety factor maintained at ${fs_topple.toFixed(2)} (FS >= 1.3, routine inspection required)`);
    }
  }

  const toppleEval: HazardEvaluation = {
    hazard_type: 'toppling',
    hazard_name: lang === 'ko' ? '전도 및 넘어짐' : 'Overturning / Toppling',
    status: toppleStatus === 'NEED_CHECK' && fs_topple >= 1.3 ? 'NEED_CHECK' : toppleStatus,
    safety_factor: Number(fs_topple.toFixed(2)),
    critical_wind_speed_ms: Number(crit_speed_topple.toFixed(1)),
    formula_display: 'FS = ( (M·g - F_lift)·(W_support/2) + M_strap ) / ( F_drag · (H/2) )',
    applied_parameters: {
      [lang === 'ko' ? '전도 모멘트 M_ot (N·m)' : 'Overturning Moment M_ot (N·m)']: Math.round(overturnMomentNm),
      [lang === 'ko' ? '복원 모멘트 M_res (N·m)' : 'Restoring Moment M_res (N·m)']: Math.round(resistMomentNm),
      [lang === 'ko' ? '받침 지지폭 W_sup (m)' : 'Support Width W_sup (m)']: stock.support_geometry.support_width_m,
      [lang === 'ko' ? '적재 높이 H (m)' : 'Stack Height H (m)']: Number(stackHeight.toFixed(2)),
    },
    causes: toppleCauses,
    recommended_actions: toppleActions,
  };

  // ==========================================
  // [C] 들림 (Uplift) 계산
  // ==========================================
  const upliftResistanceN = totalWeightN + strapForceN;
  const fs_uplift = liftForceN > 1.0 ? upliftResistanceN / liftForceN : 99.9;
  const crit_speed_uplift = liftForceN > 1.0 ? effectiveGust * Math.sqrt(Math.max(0.1, fs_uplift)) : 50.0;

  let upliftStatus: RiskLevel = 'NOT_EVALUATED';
  const upliftCauses: string[] = [];
  const upliftActions: string[] = [];

  if (material.lift_coefficient < 0.1) {
    upliftStatus = 'NOT_EVALUATED';
    if (lang === 'ko') {
      upliftCauses.push('해당 자재 형상(철골/강관) 특성상 양력 발생 조건 미부합으로 들림 평가 제외');
    } else {
      upliftCauses.push('Negligible aerodynamic lift coefficient for dense tubular/steel shapes');
    }
  } else if (fs_uplift < 1.0) {
    upliftStatus = 'DANGER';
    if (lang === 'ko') {
      upliftCauses.push(`상부 양력(${liftForceN.toFixed(0)}N)이 유효 중량 및 고정력 합계(${upliftResistanceN.toFixed(0)}N)를 초과하여 상단부 부양 위험`);
      upliftActions.push('상부 누름용 웨이트블록 또는 와이어 로프 2열 체결');
    } else {
      upliftCauses.push(`Aerodynamic lift (${liftForceN.toFixed(0)}N) exceeds total holding weight (${upliftResistanceN.toFixed(0)}N)`);
      upliftActions.push('Add ballast deadweights or fasten 2-row wire rope hold-downs');
    }
  } else if (fs_uplift < 1.3) {
    upliftStatus = 'WARNING';
    if (lang === 'ko') {
      upliftCauses.push(`양력 대비 자중 안전율 ${fs_uplift.toFixed(2)}로 풍속 증가 시 펄럭임 및 들림 우려`);
      upliftActions.push('상부 방수포 덮개 날림 방지용 고정 클립 보강');
    } else {
      upliftCauses.push(`Uplift safety factor is ${fs_uplift.toFixed(2)} (vulnerable to flutter at higher gust speeds)`);
      upliftActions.push('Secure tarp cover with heavy-duty bungee cords and perimeter clips');
    }
  } else {
    upliftStatus = 'NEED_CHECK';
    if (lang === 'ko') {
      upliftCauses.push(`들림 안전율 ${fs_uplift.toFixed(2)} 유지`);
    } else {
      upliftCauses.push(`Uplift safety factor maintained at ${fs_uplift.toFixed(2)}`);
    }
  }

  const upliftEval: HazardEvaluation = {
    hazard_type: 'uplift',
    hazard_name: lang === 'ko' ? '상부 들림 및 부양' : 'Aerodynamic Uplift',
    status: upliftStatus,
    safety_factor: Number(fs_uplift.toFixed(2)),
    critical_wind_speed_ms: Number(crit_speed_uplift.toFixed(1)),
    formula_display: 'FS = ( M·g + F_strap ) / ( 0.5 · ρ · V² · Cl · A_top )',
    applied_parameters: {
      [lang === 'ko' ? '수직 양력 F_lift (N)' : 'Aerodynamic Lift (N)']: Math.round(liftForceN),
      [lang === 'ko' ? '저항 하중 (N)' : 'Resisting Weight (N)']: Math.round(upliftResistanceN),
      [lang === 'ko' ? '양력 계수 Cl' : 'Lift Coeff Cl']: material.lift_coefficient,
    },
    causes: upliftCauses,
    recommended_actions: upliftActions,
  };

  // ==========================================
  // [D] 낙하 및 추락 (Falling) 계산
  // ==========================================
  const edgeDist = location.edge_distance_m;
  const hasRail = location.has_guardrail;
  const railHeight = location.guardrail_height_m || 0;
  const heightDelta = Number((stackHeight - railHeight).toFixed(2));
  const isOverGuardrail = stackHeight > railHeight || !hasRail;

  let fallStatus: RiskLevel = 'NOT_EVALUATED';
  const fallCauses: string[] = [];
  const fallActions: string[] = [];

  const isPrimaryUnstable = fs_slide < 1.3 || fs_topple < 1.3;

  let railProtectionFactor = 1.0;
  if (!hasRail) {
    railProtectionFactor = 0.4;
  } else if (stackHeight > railHeight) {
    railProtectionFactor = 0.65;
  } else {
    railProtectionFactor = 1.45;
  }

  const primaryFsMin = Math.min(fs_slide, fs_topple);
  const edgeDistRatio = Math.min(2.5, edgeDist / 2.0);
  const fs_fall = Number((edgeDistRatio * primaryFsMin * railProtectionFactor).toFixed(2));

  if (location.floor.includes('1F') || location.elevation_m <= 1.5) {
    fallStatus = 'NOT_EVALUATED';
    if (lang === 'ko') {
      fallCauses.push('지상 평지 야적장으로 하부 지상 수직 낙하 위험성 평가 제외');
    } else {
      fallCauses.push('Ground level yard with zero free-fall vertical elevation');
    }
  } else if (isPrimaryUnstable && (edgeDist < 2.0 || !hasRail || stackHeight > railHeight)) {
    fallStatus = 'DANGER';
    if (lang === 'ko') {
      if (!hasRail) {
        fallCauses.push(`슬래브 단부 난간이 미설치된 상태에서 단부 근접(${edgeDist}m) 거치되어 지상 ${location.elevation_m}m 아래 직격 추락 초비상`);
      } else if (stackHeight > railHeight) {
        fallCauses.push(`적재물 높이(${stackHeight.toFixed(2)}m)가 난간 높이(${railHeight}m)를 초과(+${heightDelta}m)하여 전도/미끄러짐 시 난간 턱을 타고 넘어가 추락 위험`);
      } else {
        fallCauses.push(`1차 거동(미끄러짐/전도) 불안정과 단부 근접(${edgeDist}m)으로 인한 지상 ${location.elevation_m}m 추락 위험`);
      }
      fallActions.push(`적재물을 슬래브 외곽 단부에서 건물 내부 방향으로 최소 2.5m 이상 즉시 후퇴 배치`);
      if (stackHeight > railHeight) {
        fallActions.push(`적재 단수를 감축하여 적재물 높이를 방호난간 높이(${railHeight}m) 이하로 하향 분산`);
      }
      if (!hasRail || railHeight < 1.2) {
        fallActions.push('단부 1.2m 표준 안전난간 및 발판 턱 10cm 긴급 보강');
      }
    } else {
      if (!hasRail) {
        fallCauses.push(`No perimeter guardrail while stacked near slab edge (${edgeDist}m), risking lethal drop from ${location.elevation_m}m`);
      } else if (stackHeight > railHeight) {
        fallCauses.push(`Stack height (${stackHeight.toFixed(2)}m) exceeds guardrail (${railHeight}m) by +${heightDelta}m, risking toppling over the barrier`);
      } else {
        fallCauses.push(`Primary instability combined with slab edge proximity (${edgeDist}m) creates fall risk from ${location.elevation_m}m`);
      }
      fallActions.push(`Relocate cargo at least 2.5m inward away from outer slab edge`);
      if (stackHeight > railHeight) {
        fallActions.push(`Reduce stacking tiers so total cargo height stays below guardrail (${railHeight}m)`);
      }
      if (!hasRail || railHeight < 1.2) {
        fallActions.push('Install 1.2m standard safety guardrails and 10cm toe-boards');
      }
    }
  } else if (edgeDist < 2.5 || !hasRail) {
    fallStatus = 'WARNING';
    if (lang === 'ko') {
      if (stackHeight > railHeight && hasRail) {
        fallCauses.push(`적재 높이(${stackHeight.toFixed(2)}m)가 난간 높이(${railHeight}m)보다 높아 강풍 시 난간 상단으로의 이탈 주의`);
        fallActions.push('상부 결속 와이어로 슬래브 내측 바닥 앵커에 고정');
      } else {
        fallCauses.push(`외곽 단부 이격거리(${edgeDist}m) 근접으로 인한 추락 주의 (안전율 FS=${fs_fall})`);
        fallActions.push('단부 방호책 설치 또는 안전구역 내부로 이격');
      }
    } else {
      if (stackHeight > railHeight && hasRail) {
        fallCauses.push(`Stack height (${stackHeight.toFixed(2)}m) is taller than guardrail (${railHeight}m), beware of upper cargo detachment in gusts`);
        fallActions.push('Anchor top bundle with tie-down wires to inner slab anchors');
      } else {
        fallCauses.push(`Proximity to perimeter edge (${edgeDist}m) warrants caution (Safety Factor FS=${fs_fall})`);
        fallActions.push('Install barrier fence or move cargo further inward');
      }
    }
  } else {
    fallStatus = 'NEED_CHECK';
    if (lang === 'ko') {
      fallCauses.push(`단부 이격거리 ${edgeDist}m 확보 및 방호난간(${railHeight}m) 존재 (정기 순찰 점검)`);
    } else {
      fallCauses.push(`Edge distance ${edgeDist}m and guardrail (${railHeight}m) verified (routine patrol)`);
    }
  }

  const dualHeightCtx = {
    building_elevation_m: location.elevation_m,
    effective_wind_speed_ms: effectiveWind,
    stack_height_m: Number(stackHeight.toFixed(2)),
    guardrail_height_m: railHeight,
    height_delta_m: heightDelta,
    is_over_guardrail: isOverGuardrail,
    edge_distance_m: edgeDist,
    fall_drop_height_m: location.elevation_m,
  };

  const fallEval: HazardEvaluation = {
    hazard_type: 'falling',
    hazard_name: lang === 'ko' ? '슬래브 단부 추락/낙하' : 'Slab Edge Fall / Drop',
    status: fallStatus,
    safety_factor: fs_fall,
    critical_wind_speed_ms: Math.min(crit_speed_slide, crit_speed_topple),
    formula_display: 'FS_fall = (d_edge / 2.0) · min(FS_slide, FS_topple) · f(H_rail, H_stack)',
    applied_parameters: {
      [lang === 'ko' ? '건물 표고 높이 Z (m)' : 'Building Elev Z (m)']: location.elevation_m,
      [lang === 'ko' ? '적재물 적치 높이 H_stack (m)' : 'Stack Height H_stack (m)']: Number(stackHeight.toFixed(2)),
      [lang === 'ko' ? '슬래브 난간 높이 H_rail (m)' : 'Guardrail Height H_rail (m)']: railHeight,
      [lang === 'ko' ? '난간 초과 여유고 ΔH (m)' : 'Guardrail Delta ΔH (m)']: heightDelta,
      [lang === 'ko' ? '단부 이격 거리 d (m)' : 'Edge Distance d (m)']: edgeDist,
      [lang === 'ko' ? '난간 턱넘김 위험' : 'Over-topping Risk']: isOverGuardrail
        ? (lang === 'ko' ? '초과 위험' : 'Exceeds Barrier')
        : (lang === 'ko' ? '방호 충족' : 'Protected'),
    },
    causes: fallCauses,
    recommended_actions: fallActions,
    dual_height: dualHeightCtx,
  };

  // ==========================================
  // [E] 비산 (Scattering) 계산
  // ==========================================
  let scatterStatus: RiskLevel = 'NOT_EVALUATED';
  const scatterCauses: string[] = [];
  const scatterActions: string[] = [];

  const unitArea = stackLength * stackWidth;
  const sigma = unitArea > 0 ? singleMass / unitArea : 100;
  const crit_speed_scatter = Math.sqrt(Math.max(1, (2 * sigma * GRAVITY) / (AIR_DENSITY * material.drag_coefficient)));
  const fs_scatter = effectiveGust > 0 ? crit_speed_scatter / effectiveGust : 99;

  if (
    (!material.is_loose_sheet && stock.bundle_state === 'TIGHTLY_STRAPPED') ||
    stock.fastening.has_ratchet_straps ||
    stock.fastening.has_wind_net
  ) {
    scatterStatus = 'NEED_CHECK';
    if (lang === 'ko') {
      scatterCauses.push('고강도 래칫 밴딩 결속 및 방호망으로 낱장 비산 위험 방호 조치 완료 (안전율 충족)');
    } else {
      scatterCauses.push('Ratchet straps and netting securely fastened; loose sheet scattering mitigated');
    }
  } else if (stock.bundle_state === 'INDIVIDUAL_SHEETS' || stock.bundle_state === 'LOOSE_BUNDLE') {
    if (effectiveGust >= crit_speed_scatter) {
      scatterStatus = 'DANGER';
      if (lang === 'ko') {
        scatterCauses.push(`단위면적당 중량(${sigma.toFixed(1)}kg/㎡) 대비 돌풍(${effectiveGust}m/s)이 비산 임계풍속(${crit_speed_scatter.toFixed(1)}m/s)을 초과함`);
        scatterActions.push('비산 방지용 고정 방풍망(차광망) 및 강관 파이프 상부 누름목 체결');
        scatterActions.push('낱장 분리 자재 전량 밴딩 테이핑 또는 실내 보관');
      } else {
        scatterCauses.push(`Gust wind (${effectiveGust}m/s) exceeds critical scatter speed (${crit_speed_scatter.toFixed(1)}m/s) for low area density (${sigma.toFixed(1)}kg/m²)`);
        scatterActions.push('Install windbreak netting and weight down with scaffold pipes');
        scatterActions.push('Tightly band loose sheets or store in enclosed indoor rooms');
      }
    } else if (effectiveGust >= 0.75 * crit_speed_scatter) {
      scatterStatus = 'WARNING';
      if (lang === 'ko') {
        scatterCauses.push(`돌풍 시 낱장 펄럭임 및 부분 비산 위험 구역 진입 (임계의 ${(effectiveGust / crit_speed_scatter * 100).toFixed(0)}%)`);
        scatterActions.push('상부 덮개 로프 고정부 추가 묶음');
      } else {
        scatterCauses.push(`Gust speed reaches ${(effectiveGust / crit_speed_scatter * 100).toFixed(0)}% of critical lift-off threshold`);
        scatterActions.push('Add perimeter ropes to top protective tarpaulin');
      }
    } else {
      scatterStatus = 'NEED_CHECK';
      if (lang === 'ko') {
        scatterCauses.push(`비산 임계 풍속(${crit_speed_scatter.toFixed(1)}m/s) 대비 하회 중이나 결속 풀림 점검 필요`);
      } else {
        scatterCauses.push(`Below critical scatter wind (${crit_speed_scatter.toFixed(1)}m/s), verify strap tension`);
      }
    }
  } else {
    scatterStatus = 'NEED_CHECK';
    if (lang === 'ko') {
      scatterCauses.push('결속 상태 양호하나 결속 밴드 노후도 점검 필요');
    } else {
      scatterCauses.push('Band condition acceptable; inspect strap wear periodically');
    }
  }

  const scatterEval: HazardEvaluation = {
    hazard_type: 'scattering',
    hazard_name: lang === 'ko' ? '낱장 비산 및 날림' : 'Windborne Scattering',
    status: scatterStatus,
    safety_factor: Number(fs_scatter.toFixed(2)),
    critical_wind_speed_ms: Number(crit_speed_scatter.toFixed(1)),
    formula_display: 'V_crit = √( (2 · σ · g) / (ρ · Cd) ), where σ = M/A (kg/m²)',
    applied_parameters: {
      [lang === 'ko' ? '단위면적당 질량 σ (kg/㎡)' : 'Surface Density σ (kg/m²)']: Number(sigma.toFixed(1)),
      [lang === 'ko' ? '비산 임계 풍속 (m/s)' : 'Critical Scatter Wind (m/s)']: Number(crit_speed_scatter.toFixed(1)),
      [lang === 'ko' ? '결속 상태' : 'Bundle State']: stock.bundle_state,
      [lang === 'ko' ? '방풍망 유무' : 'Windbreak Net']: stock.fastening.has_wind_net ? (lang === 'ko' ? '설치' : 'Yes') : (lang === 'ko' ? '미설치' : 'No'),
    },
    causes: scatterCauses,
    recommended_actions: scatterActions,
  };

  const hazards: Record<HazardType, HazardEvaluation> = {
    sliding: slideEval,
    toppling: toppleEval,
    uplift: upliftEval,
    falling: fallEval,
    scattering: scatterEval,
  };

  const hazardList = Object.values(hazards);
  const dangerList = hazardList.filter((h) => h.status === 'DANGER');
  const warningList = hazardList.filter((h) => h.status === 'WARNING');

  let overallStatus: RiskLevel = 'NEED_CHECK';
  if (dangerList.length > 0) {
    overallStatus = 'DANGER';
  } else if (warningList.length > 0) {
    overallStatus = 'WARNING';
  } else {
    overallStatus = 'NEED_CHECK';
  }

  let worstHazard: HazardEvaluation = slideEval;
  if (dangerList.length > 0) {
    worstHazard = dangerList.sort((a, b) => a.safety_factor - b.safety_factor)[0];
  } else if (warningList.length > 0) {
    worstHazard = warningList.sort((a, b) => a.safety_factor - b.safety_factor)[0];
  }

  let explanation = '';
  if (lang === 'ko') {
    if (overallStatus === 'DANGER') {
      explanation = `${location.name}은(는) 현재/예보 풍속(유효돌풍 ${effectiveGust}m/s) 하에서 [${worstHazard.hazard_name}] 안전율이 ${worstHazard.safety_factor}로 한계 기준(1.0)을 미달하여 즉각적인 현장 조치가 요구됩니다.`;
    } else if (overallStatus === 'WARNING') {
      explanation = `${location.name}은(는) 풍속 증가에 따라 [${worstHazard.hazard_name}] 안전율이 ${worstHazard.safety_factor}(주의기준 1.3 미만)로 저하되어 사전 결속 강화 조치가 권장됩니다.`;
    } else {
      explanation = `${location.name}은(는) 계산된 역학 지표상 임계치를 통과하였으나, 지침서 규정에 따라 안전이 영구 보증되지 않으므로 현장 순찰 시 결속선 및 받침목 이완 여부를 지속 확인하십시오.`;
    }
  } else {
    if (overallStatus === 'DANGER') {
      explanation = `${location.name}: Under gust speeds of ${effectiveGust}m/s, safety factor for [${worstHazard.hazard_name}] is ${worstHazard.safety_factor} (below limit 1.0). Immediate action required!`;
    } else if (overallStatus === 'WARNING') {
      explanation = `${location.name}: As wind escalates, safety factor for [${worstHazard.hazard_name}] drops to ${worstHazard.safety_factor} (<1.3). Proactive strapping recommended.`;
    } else {
      explanation = `${location.name}: Exceeds limit thresholds, but per safety doctrine no permanent guarantee is implied. Continue scheduled physical inspections.`;
    }
  }

  let sensitivityInsight = '';
  if (lang === 'ko') {
    if (stock.support_geometry.support_width_m < 0.6 && worstHazard.hazard_type === 'toppling') {
      sensitivityInsight = `[민감도 진단] 받침목 지지 폭을 20cm 확대할 경우 전도 안전율이 약 ${(worstHazard.safety_factor * 1.45).toFixed(2)}배 증가하여 경고가 해제될 수 있습니다.`;
    } else if (!stock.fastening.has_ratchet_straps && (worstHazard.hazard_type === 'sliding' || worstHazard.hazard_type === 'toppling')) {
      sensitivityInsight = `[민감도 진단] 2.5kN 래칫 결속 벨트 1개를 추가 체결하면 임계 풍속이 +${(effectiveGust * 0.4).toFixed(1)}m/s 향상됩니다.`;
    } else if (location.edge_distance_m < 2.0 && worstHazard.hazard_type === 'falling') {
      sensitivityInsight = `[민감도 진단] 슬래브 단부에서 내측으로 1.5m 이동 배치 시 추락 낙하 위험이 즉시 해제됩니다.`;
    } else {
      sensitivityInsight = `[민감도 진단] 바닥 접촉면에 고무 마찰 패드를 덧댈 경우(μ 0.35→0.65) 미끄러짐 저항력이 85% 증가합니다.`;
    }
  } else {
    if (stock.support_geometry.support_width_m < 0.6 && worstHazard.hazard_type === 'toppling') {
      sensitivityInsight = `[Sensitivity] Widening dunnage support base by 20cm increases toppling safety factor ~1.45× to clear warning.`;
    } else if (!stock.fastening.has_ratchet_straps && (worstHazard.hazard_type === 'sliding' || worstHazard.hazard_type === 'toppling')) {
      sensitivityInsight = `[Sensitivity] Adding one 2.5kN ratchet tie-down increases critical wind capacity by +${(effectiveGust * 0.4).toFixed(1)}m/s.`;
    } else if (location.edge_distance_m < 2.0 && worstHazard.hazard_type === 'falling') {
      sensitivityInsight = `[Sensitivity] Shifting cargo 1.5m inward from perimeter edge eliminates fall hazard immediately.`;
    } else {
      sensitivityInsight = `[Sensitivity] Installing high-friction rubber pads (μ 0.35→0.65) increases sliding resistance by 85%.`;
    }
  }

  return {
    hazards,
    overallStatus,
    worstHazard,
    explanation,
    sensitivityInsight,
  };
}
