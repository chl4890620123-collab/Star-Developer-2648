/**
 * 외부 API 없이 현장 데이터를 바탕으로 답변하는 로컬 안전 도우미
 */

import { Location, Material, Stock, WeatherCondition, RiskLevel } from '../types';
import { Language, getLocalizedLocationName, getLocalizedMaterialName, getLocalizedFloor } from './i18n';
import { evaluateHazards } from './physicsEngine';

export interface SafetyQnaResponse {
  answer: string;
  recommendedLocationId?: string;
  recommendedLocationName?: string;
  recommendedAction?: string;
  urgencyLevel: 'CRITICAL' | 'WARNING' | 'NORMAL';
}

/**
 * 모바일 현장 순찰 로컬 안전 질의응답 도우미
 * 사용자가 "긴급한건 어디에있는지 말해줘", "어느 구역부터 확인해야 해?" 등을 물었을 때 실시간 기상/적재 현황과 연동하여 답변
 */
export async function answerMobileSafetyQuestion(
  question: string,
  context: {
    currentWeather: WeatherCondition;
    locations: Location[];
    stocks: Record<string, Stock>;
    materials: Record<string, Material>;
    dangerCount: number;
    lang: Language;
  }
): Promise<SafetyQnaResponse> {
  const { currentWeather, locations, stocks, materials, lang } = context;
  const isKo = lang === 'ko';

  // 각 구역별 실시간 역학 평가 요약 데이터 구성
  const zoneSummaries = locations.map((loc) => {
    const stock = stocks[loc.id];
    const mat = stock ? materials[stock.material_id] : null;
    if (!stock || !mat) return null;

    const evalResult = evaluateHazards(loc, mat, stock, currentWeather, lang);
    const totalStackH = Number((stock.stack_tiers * mat.dimensions.height_m).toFixed(2));
    const railH = loc.guardrail_height_m || 1.2;
    const isOverRail = loc.has_guardrail && totalStackH > railH;

    return {
      locId: loc.id,
      locName: getLocalizedLocationName(loc.id, loc.name, lang),
      floor: getLocalizedFloor(loc.id, loc.floor, lang),
      elevation_m: loc.elevation_m,
      materialName: getLocalizedMaterialName(mat.id, mat.name, lang),
      count: stock.count,
      stackTiers: stock.stack_tiers,
      totalStackH,
      railH,
      isOverRail,
      hasStraps: stock.fastening.has_ratchet_straps,
      status: evalResult.overallStatus,
      worstHazardName: evalResult.worstHazard.hazard_name,
      worstHazardType: evalResult.worstHazard.hazard_type,
      worstFs: evalResult.worstHazard.safety_factor,
      worstAction: evalResult.worstHazard.recommended_actions[0] || '',
    };
  }).filter(Boolean) as NonNullable<ReturnType<typeof Object.values>[0]>[];

  // DANGER 구역 및 최저 안전율 구역 정렬
  const dangerZones = zoneSummaries.filter((z) => z.status === 'DANGER');
  const sortedByFs = [...zoneSummaries].sort((a, b) => a.worstFs - b.worstFs);
  const worstZone = sortedByFs[0];
  const unstrappedZones = zoneSummaries.filter((z) => !z.hasStraps);
  const overRailZones = zoneSummaries.filter((z) => z.isOverRail);

  // 현재 현장 데이터와 로컬 규칙으로 답변합니다.

  await new Promise((r) => setTimeout(r, 300));
  const qLower = question.toLowerCase();

  // 1. 긴급한 구역 / 가장 위험한 곳 질문
  if (
    qLower.includes('긴급') ||
    qLower.includes('위험') ||
    qLower.includes('urgent') ||
    qLower.includes('danger') ||
    qLower.includes('어디') ||
    qLower.includes('where')
  ) {
    if (worstZone) {
      const isCritical = worstZone.status === 'DANGER';
      const answer = isKo
        ? `현재 가장 긴급한 확인 대상은 [${worstZone.floor} ${worstZone.locName}]입니다! ${worstZone.materialName}의 ${worstZone.worstHazardName} 안전율이 FS ${worstZone.worstFs}로 위험 기준치(1.0)에 도달했습니다. ${worstZone.hasStraps ? '기존 결속 장력을 재점검' : '래칫 벨트가 체결되지 않았으므로 즉각 2.5kN 조임'} 조치가 필요합니다.`
        : `The most urgent location right now is [${worstZone.floor} ${worstZone.locName}]. Safety factor for ${worstZone.worstHazardName} has dropped to FS ${worstZone.worstFs} (${worstZone.status}). Immediate action: ${worstZone.worstAction}.`;

      return {
        answer,
        recommendedLocationId: worstZone.locId,
        recommendedLocationName: worstZone.locName,
        recommendedAction: worstZone.worstAction,
        urgencyLevel: isCritical ? 'CRITICAL' : 'WARNING',
      };
    }
  }

  // 2. 밴드 / 결속 미체결 질문
  if (qLower.includes('결속') || qLower.includes('밴드') || qLower.includes('깔깔이') || qLower.includes('strap') || qLower.includes('tie')) {
    if (unstrappedZones.length > 0) {
      const topUnstrapped = unstrappedZones[0];
      const answer = isKo
        ? `현재 래칫 벨트가 미체결된 곳은 총 ${unstrappedZones.length}개소이며, 특히 [${topUnstrapped.floor} ${topUnstrapped.locName}](${topUnstrapped.materialName})의 비산 및 전도 위험이 가장 높습니다. 현장 순찰 시 우선 체결하십시오.`
        : `There are ${unstrappedZones.length} unstrapped yards. Most vulnerable is [${topUnstrapped.floor} ${topUnstrapped.locName}] with ${topUnstrapped.materialName}. Apply ratchet straps immediately.`;

      return {
        answer,
        recommendedLocationId: topUnstrapped.locId,
        recommendedLocationName: topUnstrapped.locName,
        recommendedAction: isKo ? '래칫 벨트 2.5kN 조임 체결' : 'Apply 2.5kN ratchet strapping',
        urgencyLevel: 'CRITICAL',
      };
    } else {
      return {
        answer: isKo
          ? '현재 모든 등록 적재구역에 래칫 밴드가 체결되어 있습니다. 풍속 증가에 따른 장력 이완 여부만 확인하십시오.'
          : 'All staged materials currently have ratchet straps fastened. Only inspect for looseness as wind rises.',
        urgencyLevel: 'NORMAL',
      };
    }
  }

  // 3. 옥상층 / 고층 / 바람 질문
  if (qLower.includes('옥상') || qLower.includes('roof') || qLower.includes('바람') || qLower.includes('풍속') || qLower.includes('wind')) {
    const roofZone = zoneSummaries.find((z) => z.locId === 'loc-roof-01') || worstZone;
    const answer = isKo
      ? `현재 관측 풍속은 ${currentWeather.wind_speed_ms}m/s(돌풍 ${currentWeather.gust_speed_ms}m/s)이며, 옥상층(12F, 표고 45m)은 고도 증폭 계수로 인해 체감 풍속이 1.3배 이상 강합니다. 옥상 적치 단열재는 순간 돌풍 시 즉각 비산될 수 있으므로 결속 앵커를 필히 점검하세요.`
      : `Current wind is ${currentWeather.wind_speed_ms}m/s (gust ${currentWeather.gust_speed_ms}m/s). 12F Rooftop experiences >1.3x wind speed due to elevation. Check insulation tie-downs immediately.`;

    return {
      answer,
      recommendedLocationId: roofZone?.locId,
      recommendedLocationName: roofZone?.locName,
      recommendedAction: roofZone?.worstAction,
      urgencyLevel: 'CRITICAL',
    };
  }

  // 4. 난간 초과 / 추락 질문
  if (qLower.includes('난간') || qLower.includes('높이') || qLower.includes('추락') || qLower.includes('height') || qLower.includes('rail')) {
    if (overRailZones.length > 0) {
      const topOver = overRailZones[0];
      const answer = isKo
        ? `적재 높이가 난간(${topOver.railH}m)을 초과한 구역은 [${topOver.floor} ${topOver.locName}] 등 ${overRailZones.length}개소입니다. ${topOver.totalStackH}m 높이로 쌓여 있어 전도 시 난간 턱을 타고 지상으로 직격 추락하므로 단수 감축(1단 분산)을 권장합니다.`
        : `Yard [${topOver.floor} ${topOver.locName}] has materials stacked to ${topOver.totalStackH}m, exceeding the ${topOver.railH}m guardrail. If tipped, materials will fall over the rail. Reduce tiers immediately.`;

      return {
        answer,
        recommendedLocationId: topOver.locId,
        recommendedLocationName: topOver.locName,
        recommendedAction: isKo ? '적재 단수 1단 감축 및 실내 분산' : 'Reduce stacking tier by 1',
        urgencyLevel: 'CRITICAL',
      };
    }
  }

  // 기본 포괄적 브리핑
  const fallbackAnswer = isKo
    ? `현재 관측 풍속 ${currentWeather.wind_speed_ms}m/s 조건에서 위험(DANGER) 구역 ${dangerZones.length}개소, 주의 구역이 관제 중입니다. 가장 먼저 확인해야 할 우선 구역은 [${worstZone?.floor} ${worstZone?.locName}]입니다.`
    : `Under current wind (${currentWeather.wind_speed_ms}m/s), ${dangerZones.length} DANGER zones are active. Priority inspection target: [${worstZone?.floor} ${worstZone?.locName}].`;

  return {
    answer: fallbackAnswer,
    recommendedLocationId: worstZone?.locId,
    recommendedLocationName: worstZone?.locName,
    recommendedAction: worstZone?.worstAction,
    urgencyLevel: dangerZones.length > 0 ? 'CRITICAL' : 'WARNING',
  };
}
