/**
 * 다국어(i18n) 통합 지원 서비스 (한국어 ko 및 영어 en)
 * 지침서 10절 및 사용자 요구사항 준수:
 * 원클릭 시 화면 전체(자재명, 구역명, 층수, 5대 위험, 조치, 기상, 모달, KPI, 버튼)가 100% 즉시 전환
 */

export type Language = 'ko' | 'en';

export const translations = {
  ko: {
    // Header
    appTitle: 'SafeStack 적재구역 기상위험 예측 관제',
    siteHeaderTag: '적재구역 기상위험 예측 관제',
    siteSubtitle: '서울 마포 복합업무시설 신축공사 현장 (1공구)',
    buildingHeight: '건물 높이',
    pcView: 'PC 관제',
    mobileView: '모바일 순찰',
    aiIntakeBtn: '입고 사진 AI 판독',
    materialDbBtn: '적치구역/자재 설정',
    resetTooltip: '데이터 초기화 및 재계산',
    stationConnecting: '샘플 기상 데이터 사용 중',
    lastUpdated: '갱신 시각',
    windAdvisoryNotice: '16:00 강풍주의보 예보 발효 예정 (순간최대 18.6m/s 돌풍)',

    // Hero Visual Banner
    heroTitle: '공사장 적재구역 스마트 기상위험 예측 관제',
    heroSubtitle: '등록된 적재 자재와 현장 조건을 기상 예보에 연결해, 안전관리자가 어느 장소의 무엇부터 확인해야 하는지 알려주는 적재구역 위험 관리 서비스입니다.',
    heroKpiLiveStatus: '실시간 관측 풍속',
    heroKpiMaxGust: '순간 최대 돌풍',
    heroKpiCriticalZones: '긴급 조치 구역',
    pillarMaterial: '자재별 우선순위',
    pillarIntake: '간편 현장 입력',
    pillarFuture: '미래 변화 비교',
    pillarRecalc: '조치 후 즉시 재계산',
    pillarEvidence: '투명한 판단 근거',

    // KPI Cards
    dangerCardTitle: '즉각 조치 위험 (DANGER)',
    dangerCardDesc: '비산·전도·추락 임박',
    warningCardTitle: '사전 점검 주의 (WARNING)',
    warningCardDesc: '강풍 시 안전율 저하',
    needCheckCardTitle: '현장 실측 필요 (NEED CHECK)',
    needCheckCardDesc: '규격 대조 및 이완 확인',
    allCardTitle: '전체 등록 적재구역',
    allLocationsCount: '개소 관제 중',
    unassessedCount: '미평가 항목',
    noGreenGuaranteeNotice: '[안전 지침 제7조 준수] 본 시스템은 어떠한 경우에도 무결한 \'녹색 안전 보증\'을 표시하지 않습니다. 경고가 없는 구역(FS ≥ 1.3)이라도 돌풍 와류, 받침목 이완 등의 미측정 오차가 존재할 수 있으므로 현장 순찰 및 물리 상태 점검이 의무화되어 있습니다.',

    // Weather Widget
    weatherTitle: '기상 샘플 데이터 및 풍속 시뮬레이션',
    weatherSubtitle: '샘플값을 기준으로 풍속 위험도를 시험합니다',
    virtualSimLabel: '가상 풍속 시험',
    simNormal: '평상(6m/s)',
    simAdvisory: '강풍주의보(13.5)',
    simStorm: '돌풍위기(21.0)',
    simReset: '해제',
    currentCardTitle: '현재 관측 시각 및 풍속',
    currentAvgWind: '10분 평균 풍속',
    currentGust: '순간 최대 돌풍',
    nextShiftCardTitle: '풍속 급변 다음 예보 시각',
    nextShiftAvgWind: '예보 평균 풍속',
    nextShiftGust: '예보 순간 돌풍',
    peakAlertTitle: '[추가 위험 상승 경고]',
    peakAlertDesc: '차기 변동 이후, {time}에 최고 평균 {speed}m/s (돌풍 {gust}m/s)로 풍속이 정점에 달할 예정입니다. 전 구역 사전 결속 점검을 완료하십시오.',
    hourlyTimelineBtn: '24시간 타임라인',
    hourlyTimelineTitle: '기상청 24시간 단기예보 추이',

    // Safety Alarm Banner
    alarmSystemLabel: '자동 안전 경보 시스템',
    alarmTriggerCondition: '(발동 조건: DANGER 3개소 이상 또는 풍속 ≥ {threshold}m/s)',
    notificationLinked: '브라우저 알림 연동됨',
    notificationBlocked: '브라우저 알림 차단됨',
    notificationRequest: '브라우저 알림 권한 허용',
    alarmTestBtn: '경보 시험 발송',
    emergencySirenTitle: '[긴급 공사안전 비상경보 발령]',
    emergencyActionRequired: '현장 비상 조치 요망',
    alarmReasonLabel: '발령 사유',
    emergencyGuide: '권고사항: 타워크레인 양중 작업 중지 및 옥상·외곽 슬래브 래칫 밴딩 전원 투입',

    // Filters
    filterLabel: '층/구역 필터',
    allFloors: '전체 층 (B1F ~ 12F 옥상)',
    searchPlaceholder: '구역명 또는 자재명 검색...',
    displayedCount: '표시 중',
    noLocationsFound: '선택된 필터 조건에 부합하는 적재구역이 없습니다',
    resetFilters: '필터 전체 초기화',

    // Location Card
    viewDetailAction: '상세 역학 & 조치 시뮬레이션',
    criticalWindLabel: '한계 풍속',
    worstFactorLabel: '핵심 취약인자',
    fiveHazardsLabel: '5대 역학 안전율 (FS) 평가',
    tiersUnit: '단',
    countUnit: '개',
    totalMassLabel: '총 중량',
    bundleStateLabel: '결속 상태',
    strapsLabel: '깔깔이 밴드',
    edgeDangerLabel: '단부 이격 불과',
    safetyFactorCriteria: '기준: FS < 1.0 위험 / 1.3 미만 주의',

    // Hazards Names (현장 안전관리자 쉬운 용어)
    hazard_sliding: '바닥 밀림',
    hazard_toppling: '바람에 넘어짐',
    hazard_uplift: '위로 날아감',
    hazard_falling: '지상 추락',
    hazard_scattering: '낱장 날림',

    // Detail Modal
    detailModalTitle: '구역별 상세 공학 역학 평가',
    cfdDiagramTitle: '공기역학 CFD 유동 및 전도 모멘트 시뮬레이션',
    sensitivityInsightTitle: '엔지니어링 민감도 진단 (Sensitivity Insight)',
    appliedCriteria: '적용 기준: NASA 항력/양력 공식 및 건축물 하중기준(KDS) 풍하중',
    evalFormula: '평가 공식 (Engineering Formula)',
    appliedParams: '대입된 역학 변수',
    identifiedCauses: '식별된 위험 요인',
    recommendedMitigations: '권장 현장 조치사항',
    mitigationSimTitle: '현장 조치(Action) 적용 및 직전 대비 재계산 비교',
    runMitigationBtn: '조치 후 즉시 재계산 실행',
    commitMitigationBtn: '현장 조치 완료 확정 및 서버 반영',
    beforeActionTitle: '조치 전 (현재 상태)',
    afterActionTitle: '조치 후 (재계산 결과)',
    closeModal: '닫기',

    // Mitigation Checkboxes
    opt_ratchet: '래칫 벨트 체결 (2.5kN 장력)',
    opt_rubber: '바닥 고무패드 깔기 (μ 0.35→0.65)',
    opt_tiers: '적재 단수 1단 감축 (분산배치)',
    opt_widen: '받침목 폭 1.2m로 확대',
    opt_moveInside: '슬래브 단부에서 내측 2.5m 이동',
    opt_windNet: '비산방지망 및 상부 로프 결속',

    // Mobile View
    mobilePatrolMode: '현장 안전 순찰 모드',
    mobilePatrolDesc: '즉각 조치 및 결속 상태 확인',
    mobileShootBtn: '현장 촬영',
    quickStrapBtn: '래칫 밴딩 긴급 체결',
    physicsDetailBtn: '역학 상세',
    qrScanBtn: '구역 QR 태그 스캔',
    qrScanModalTitle: '적재구역 QR 태그 카메라 스캐너',
    qrScanInstructions: '현장 적재구역 명판 또는 자재 번들의 QR 코드를 카메라에 비춰주세요',
    qrSimulateTagTitle: '현장 구역 태그 원터치 인식 (테스트/직접선택)',
    qrTagScanned: 'QR 태그 인식 성공! 해당 구역 제원을 불러옵니다.',
    qrCameraError: '카메라 접근 권한이 없거나 지원되지 않는 기기입니다. 아래 태그를 직접 터치해 스캔하세요.',
    closeScanner: '스캐너 닫기',

    // Maintenance History
    maintenanceHistoryTitle: '현장 안전 점검 및 정비 이력 (최근 5건)',
    addInspectionBtn: '점검 기록 추가',
    inspectorLabel: '점검자 (직책 / 성명)',
    inspectionDateLabel: '점검 일시',
    inspectionStatusLabel: '현장 상태 판정',
    inspectionNotesLabel: '현장 조치 소견 및 메모',
    saveInspectionBtn: '점검 일지 저장',
    statusSafe: '양호 (결속 및 규격 준수)',
    statusActionTaken: '조치완료 (래칫 체결/받침목 보강)',
    statusNeedsAttention: '주의 (바람 강해질 시 재확인)',

    // Dual Height Physics Analysis
    dualHeightTitle: '건물 고도(Z) & 적재물 높이(H_stack) 듀얼 역학 분석',
    buildingElevationTag: '건물 층 표고 높이 (Z)',
    stackHeightTag: '적재물 자체 높이 (H_stack)',
    guardrailHeightTag: '슬래브 방호난간 (H_rail)',
    elevationWindMultiplier: '고도 풍속 증폭 (KDS 계수)',
    overGuardrailAlert: '난간 턱넘김(Over-topping) 낙하 위험',
    withinGuardrailSafe: '방호난간 내부 안착 (1차 차단)',
    fallImpactEnergy: '지상 직격 충격 에너지 (E_k)',
    fallRiskZoneRadius: '지상 비산/낙하 위험 반경',
    dualHeightExplanation: '건물 높이는 고도 풍속(V_z)을 증폭시키며, 적재물 높이는 수압 면적과 전도 모멘트 암을 결정합니다. 적재 높이가 난간을 초과하면 전도 시 난간 턱을 타고 지상으로 직격 추락합니다.',

    // DB Manager (현장 친화적 명칭, CRUD 용어 제거)
    dbModalTitle: '적치구역 및 자재 관리 설정',
    dbModalSubtitle: '건물 표고 높이(m), 적재 높이(m), 단수, 체결 장력(kN) 및 자재 제원을 관리합니다 (영구 저장)',
    dbTabLocations: '1. 적재구역 & 건물높이',
    dbTabStocks: '2. 적치현황 & 적재높이',
    dbTabMaterials: '3. 자재 규격 관리',
    dbTabBackup: '4. 데이터 백업 & 복구',
    addNewStockBtn: '신규 적재물 배치',
    stackTiersLabel: '적재 단수 (단)',
    totalStackHeightLabel: '총 적재높이 (m)',
    unitCountLabel: '적치 수량 (개/번들)',
    ratchetTensionLabel: '깔깔이(래칫 밴드) 조임력 (kN)',
    strapFasteningLabel: '깔깔이(래칫 밴드) 체결 여부',
    anchorWireLabel: '슬래브 앵커 와이어 체결',
    windNetLabel: '상부 비산방지망 설치',
    contactSurfaceLabel: '바닥 접촉면 재질',
    frictionCoeffLabel: '바닥 정지 마찰계수 (μ)',
    supportWidthLabel: '받침목 지지 폭 (m)',
    exportJsonBtn: '전체 데이터 백업 (JSON 다운로드)',
    importJsonBtn: '백업 파일 복원 (JSON 가져오기)',
    factoryResetBtn: '초기 표준 데이터셋으로 복원',
    factoryResetConfirm: '모든 수정 데이터를 초기화하고 현장 표준 데이터셋으로 복원하시겠습니까?',

    // Footer
    footerText: '적재구역 기상 위험 예측 관제 시스템 (SafeStack v1.2) · 공학 역학 기반 판정 엔진',
    footerSubtext: '샘플 기상 데이터 · NASA 항력식/양력식 역학 계산 · 로컬 안전 규칙',
  },
  en: {
    // Header
    appTitle: 'SafeStack Yard Wind Risk Prediction Control System',
    siteHeaderTag: 'Yard Wind Hazard Prediction',
    siteSubtitle: 'Seoul Mapo Complex Construction Zone 1 (15-Story)',
    buildingHeight: 'Building Height',
    pcView: 'PC Control',
    mobileView: 'Mobile Patrol',
    aiIntakeBtn: 'AI Visual Intake',
    materialDbBtn: 'Yard & Material Setup',
    resetTooltip: 'Reset Data & Re-calculate',
    stationConnecting: 'Sample weather data in use',
    lastUpdated: 'Updated At',
    windAdvisoryNotice: '16:00 Wind Advisory Expected (Max Gust 18.6m/s)',

    // Hero Visual Banner
    heroTitle: 'Smart Construction Yard Wind Hazard Prediction Control',
    heroSubtitle: 'A yard risk management service connecting registered materials and site conditions with weather forecasts, telling safety managers which locations and what hazards to inspect first.',
    heroKpiLiveStatus: 'Live Observed Wind',
    heroKpiMaxGust: 'Peak Gust Speed',
    heroKpiCriticalZones: 'Immediate Action Zones',
    pillarMaterial: 'Material-Specific Priority',
    pillarIntake: 'Simple Field Intake',
    pillarFuture: 'Shift Forecast Comparison',
    pillarRecalc: 'Mitigation Re-calculation',
    pillarEvidence: 'Transparent Evidence',

    // KPI Cards
    dangerCardTitle: 'IMMEDIATE ACTION (DANGER)',
    dangerCardDesc: 'Scattering · Toppling · Falling Imminent',
    warningCardTitle: 'PRECAUTIONARY (WARNING)',
    warningCardDesc: 'Safety Factor Drops in Wind',
    needCheckCardTitle: 'FIELD CHECK NEEDED (NEED CHECK)',
    needCheckCardDesc: 'Verify Specs & Fastening Looseness',
    allCardTitle: 'ALL REGISTERED YARD ZONES',
    allLocationsCount: 'Zones Monitored',
    unassessedCount: 'Unassessed Items',
    noGreenGuaranteeNotice: '[Safety Guideline Art. 7] This system strictly DOES NOT display a "Green Guarantee of Safety". Even zones with no warnings (FS ≥ 1.3) may have unmeasured vortex gusts or support looseness; physical inspections remain mandatory.',

    // Weather Widget
    weatherTitle: 'Sample Weather Data & Wind Simulation',
    weatherSubtitle: 'Test wind risk using sample values',
    virtualSimLabel: 'Virtual Wind Test',
    simNormal: 'Normal(6m/s)',
    simAdvisory: 'Advisory(13.5)',
    simStorm: 'Storm Gust(21.0)',
    simReset: 'Reset',
    currentCardTitle: 'Current Observed Time & Wind Speed',
    currentAvgWind: '10-Min Avg Wind Speed',
    currentGust: 'Peak Gust Speed',
    nextShiftCardTitle: 'Next Shift Wind Speed Forecast',
    nextShiftAvgWind: 'Forecast Avg Wind',
    nextShiftGust: 'Forecast Peak Gust',
    peakAlertTitle: '[Further Risk Escalation Warning]',
    peakAlertDesc: 'Beyond the next shift, wind will peak at {time} with avg {speed}m/s (gust {gust}m/s). Inspect all material tie-downs immediately.',
    hourlyTimelineBtn: '24h Timeline',
    hourlyTimelineTitle: 'KMA 24-Hour Short-term Forecast Trend',

    // Safety Alarm Banner
    alarmSystemLabel: 'Automated Safety Alarm System',
    alarmTriggerCondition: '(Triggers on: ≥3 DANGER zones or Wind ≥ {threshold}m/s)',
    notificationLinked: 'Browser Notifications Enabled',
    notificationBlocked: 'Browser Notifications Blocked',
    notificationRequest: 'Enable Browser Notifications',
    alarmTestBtn: 'Test Alarm Alert',
    emergencySirenTitle: '[CRITICAL CONSTRUCTION SITE SAFETY ALARM]',
    emergencyActionRequired: 'Immediate Action Required',
    alarmReasonLabel: 'Trigger Reason',
    emergencyGuide: 'Recommendations: Halt tower crane hoisting & deploy all crews for rooftop/slab edge ratchet strapping',

    // Filters
    filterLabel: 'Floor/Zone Filter',
    allFloors: 'All Floors (B1F ~ 12F Rooftop)',
    searchPlaceholder: 'Search zone or material...',
    displayedCount: 'Showing',
    noLocationsFound: 'No yard zones match the selected filter criteria',
    resetFilters: 'Reset All Filters',

    // Location Card
    viewDetailAction: 'Physics Detail & Mitigation Sim',
    criticalWindLabel: 'Critical Wind Speed',
    worstFactorLabel: 'Primary Vulnerability',
    fiveHazardsLabel: '5-Physics Safety Factor (FS) Evaluation',
    tiersUnit: 'Tiers',
    countUnit: 'Units',
    totalMassLabel: 'Total Mass',
    bundleStateLabel: 'Bundle State',
    strapsLabel: 'Ratchet Straps',
    edgeDangerLabel: 'Edge Distance Danger',
    safetyFactorCriteria: 'Criteria: FS < 1.0 Danger / < 1.3 Warning',

    // Hazards Names
    hazard_sliding: 'Sliding',
    hazard_toppling: 'Toppling',
    hazard_uplift: 'Uplift',
    hazard_falling: 'Falling',
    hazard_scattering: 'Scattering',

    // Detail Modal
    detailModalTitle: 'Zone Aerodynamic Engineering Assessment',
    cfdDiagramTitle: 'Aerodynamic CFD Streamlines & Toppling Moment Simulation',
    sensitivityInsightTitle: 'Engineering Sensitivity Diagnostic (Sensitivity Insight)',
    appliedCriteria: 'Criteria: NASA Drag/Lift Formulation & KDS Building Code Wind Loads',
    evalFormula: 'Engineering Formula',
    appliedParams: 'Applied Aerodynamic Parameters',
    identifiedCauses: 'Identified Vulnerabilities',
    recommendedMitigations: 'Recommended Site Actions',
    mitigationSimTitle: 'Apply Mitigation Action & Before/After Comparison',
    runMitigationBtn: 'Re-calculate After Mitigation',
    commitMitigationBtn: 'Commit Mitigation & Push to Server',
    beforeActionTitle: 'Before Action (Current State)',
    afterActionTitle: 'After Action (Simulated Result)',
    closeModal: 'Close',

    // Mitigation Checkboxes
    opt_ratchet: 'Fasten Ratchet Straps (2.5kN Tension)',
    opt_rubber: 'Install Rubber Pads (μ 0.35→0.65)',
    opt_tiers: 'Reduce Stacking Height by 1 Tier',
    opt_widen: 'Widen Support Width to 1.2m',
    opt_moveInside: 'Move Inward 2.5m from Slab Edge',
    opt_windNet: 'Install Windbreak Net & Tie-downs',

    // Mobile View
    mobilePatrolMode: 'Field Safety Patrol Mode',
    mobilePatrolDesc: 'Immediate Action & Fastening Inspection',
    mobileShootBtn: 'Field Capture',
    quickStrapBtn: 'Emergency Ratchet Strapping',
    physicsDetailBtn: 'Physics Detail',
    qrScanBtn: 'Scan Yard QR Tag',
    qrScanModalTitle: 'Yard QR Tag Camera Scanner',
    qrScanInstructions: 'Point camera at the QR code tag on the yard signboard or material bundle',
    qrSimulateTagTitle: 'Or Instant QR Tag Match (Field Simulation)',
    qrTagScanned: 'QR Tag recognized! Loading yard and material engineering specs.',
    qrCameraError: 'Camera access denied or unavailable. Tap a tag below to simulate scanning.',
    closeScanner: 'Close Scanner',

    // Maintenance History
    maintenanceHistoryTitle: 'Safety Inspection & Maintenance History (Last 5)',
    addInspectionBtn: 'Add Inspection Record',
    inspectorLabel: 'Inspector (Name / Role)',
    inspectionDateLabel: 'Timestamp',
    inspectionStatusLabel: 'Field Condition Verdict',
    inspectionNotesLabel: 'Inspection Notes & Mitigation Remarks',
    saveInspectionBtn: 'Save Inspection Record',
    statusSafe: 'Good (Specs & Strapping Met)',
    statusActionTaken: 'Mitigated (Strapped / Re-leveled)',
    statusNeedsAttention: 'Needs Attention (Monitor as Wind Increases)',

    // Dual Height Physics Analysis
    dualHeightTitle: 'Bldg Elevation(Z) & Stacking Height(H_stack) Dual Physics Analysis',
    buildingElevationTag: 'Building Floor Elevation (Z)',
    stackHeightTag: 'Material Stacking Height (H_stack)',
    guardrailHeightTag: 'Slab Guardrail (H_rail)',
    elevationWindMultiplier: 'Elevation Wind Amplification (KDS)',
    overGuardrailAlert: 'Over-topping Fall Danger',
    withinGuardrailSafe: 'Protected Behind Guardrail',
    fallImpactEnergy: 'Ground Impact Kinetic Energy (E_k)',
    fallRiskZoneRadius: 'Ground Fall/Scatter Hazard Radius',
    dualHeightExplanation: 'Building elevation scales local wind speed (V_z), while stacking height dictates frontal area and tipping moment arm. When stack height exceeds guardrails, toppling results in immediate lethal fall to ground.',

    // DB Manager (User-friendly terms without CRUD)
    dbModalTitle: 'Storage Yard & Material Specifications Settings',
    dbModalSubtitle: 'Manage building elevation(m), stack height(m), tiers, strap tension(kN) & dimensions (Persistent Storage)',
    dbTabLocations: '1. Yards & Elevation',
    dbTabStocks: '2. Stacks & Height',
    dbTabMaterials: '3. Material Specs',
    dbTabBackup: '4. Backup & Restore',
    addNewStockBtn: 'Add Staging Material',
    stackTiersLabel: 'Stack Tiers',
    totalStackHeightLabel: 'Total Stack Height (m)',
    unitCountLabel: 'Quantity (Count/Bundle)',
    ratchetTensionLabel: 'Ratchet Strap Tension (kN)',
    strapFasteningLabel: 'Ratchet Straps Fastened',
    anchorWireLabel: 'Slab Floor Anchor Wire',
    windNetLabel: 'Top Windbreak Net Installed',
    contactSurfaceLabel: 'Contact Surface Material',
    frictionCoeffLabel: 'Floor Static Friction Coeff (μ)',
    supportWidthLabel: 'Dunnage Support Width (m)',
    exportJsonBtn: 'Export Full Database (JSON Backup)',
    importJsonBtn: 'Restore Database (Import JSON)',
    factoryResetBtn: 'Restore Standard Dataset',
    factoryResetConfirm: 'Reset all modified data and restore the engineering standard dataset?',

    // Footer
    footerText: 'Yard Wind Hazard Prediction Control System (SafeStack v1.2) · Physics Engineering Engine',
    footerSubtext: 'Sample weather data · NASA aerodynamic equations · local safety rules',
  },
};

/**
 * 자재명 다국어 번역 헬퍼
 */
export const MATERIAL_NAME_MAP: Record<string, { ko: string; en: string }> = {
  'mat-eps-insulation': {
    ko: '압출법 특호 단열재 (1000×2000×100T)',
    en: 'Extruded Polystyrene (XPS) Insulation (1000×2000×100T)',
  },
  'mat-euroform-6012': {
    ko: '유로폼 규격 거푸집 (600×1200×65T)',
    en: 'Standard Euroform Shuttering (600×1200×65T)',
  },
  'mat-scaffold-pipe': {
    ko: '단관비계 강관 파이프 (ø48.6×4.0m)',
    en: 'Scaffold Steel Pipes (ø48.6×4.0m Bundle)',
  },
  'mat-structural-plywood': {
    ko: '콘크리트 거푸집용 내수합판 (12×1200×2400)',
    en: 'Structural Formwork Plywood (12×1200×2400)',
  },
  'mat-rebar-d25': {
    ko: '고장력 이형철근 SD400 D25 (L=8.0m 번들)',
    en: 'Deformed Rebar SD400 D25 (L=8.0m Bundle)',
  },
  'mat-gypsum-board': {
    ko: '방화 석고보드 9.5T (900×1800 팔레트)',
    en: 'Fire-rated Gypsum Board 9.5T Pallet',
  },
};

/**
 * 구역명 및 층수 다국어 번역 헬퍼
 */
export const LOCATION_NAME_MAP: Record<string, { name: { ko: string; en: string }; floor: { ko: string; en: string } }> = {
  'loc-roof-01': {
    name: { ko: '12F 옥상 남측 적치구역 (A-1)', en: '12F Rooftop South Staging Yard (A-1)' },
    floor: { ko: '12F (옥상층)', en: '12F (Rooftop)' },
  },
  'loc-4f-edge-02': {
    name: { ko: '4F 서측 외벽 개구부 단부 (B-2)', en: '4F West Slab Edge Opening (B-2)' },
    floor: { ko: '4F (개구부)', en: '4F (Opening)' },
  },
  'loc-7f-scaffold-03': {
    name: { ko: '7F 코어부 동측 환기구 인접 (C-1)', en: '7F Core East Air Shaft Staging (C-1)' },
    floor: { ko: '7F (코어홀)', en: '7F (Core Shaft)' },
  },
  'loc-ground-wood-04': {
    name: { ko: '1F 중앙 주통로 인접 가설야적장 (D-1)', en: '1F Central Main Yard (D-1)' },
    floor: { ko: '1F (지상야적장)', en: '1F (Ground Yard)' },
  },
  'loc-rebar-2f-05': {
    name: { ko: '2F 데크플레이트 상부 철근 임시적치 (E-3)', en: '2F Deck Plate Rebar Staging (E-3)' },
    floor: { ko: '2F (데크슬래브)', en: '2F (Deck Slab)' },
  },
  'loc-b1-gypsum-06': {
    name: { ko: 'B1F 램프구간 하역장 (F-1)', en: 'B1F Vehicle Ramp Unloading Bay (F-1)' },
    floor: { ko: 'B1F (지하하역장)', en: 'B1F (Basement Bay)' },
  },
};

export function getLocalizedMaterialName(matId: string, fallback: string, lang: Language): string {
  return MATERIAL_NAME_MAP[matId]?.[lang] || fallback;
}

export function getLocalizedLocationName(locId: string, fallbackName: string, lang: Language): string {
  return LOCATION_NAME_MAP[locId]?.name?.[lang] || fallbackName;
}

export function getLocalizedFloor(locId: string, fallbackFloor: string, lang: Language): string {
  return LOCATION_NAME_MAP[locId]?.floor?.[lang] || fallbackFloor;
}

/**
 * 현장 근로자 및 안전관리자를 위한 쉽고 직관적인 자재 규격 포맷터
 * (공학적인 LWH 약어 대신 '가로 2m · 세로 1m (두께 10cm)' 형태로 표기)
 */
export function formatDimensionsSimple(
  dim: { length_m: number; width_m: number; height_m: number },
  lang: Language
): string {
  const l = dim.length_m;
  const w = dim.width_m;
  const h = dim.height_m;
  const hCm = Math.round(h * 100);

  if (lang === 'ko') {
    if (h < 0.3) {
      return `가로 ${l}m · 세로 ${w}m (두께 ${hCm}cm)`;
    }
    return `가로 ${l}m · 세로 ${w}m · 높이 ${h}m`;
  } else {
    if (h < 0.3) {
      return `${l}m × ${w}m (${hCm}cm thick)`;
    }
    return `${l}m × ${w}m × ${h}m`;
  }
}

/**
 * 적재 단수 및 총 적재고 포맷터
 */
export function formatStackSimple(
  tiers: number,
  unitHeightM: number,
  lang: Language
): { stackText: string; totalHeightM: number } {
  const totalH = Number((tiers * unitHeightM).toFixed(2));
  const totalCm = Math.round(totalH * 100);

  if (lang === 'ko') {
    const text = totalH < 1.0 ? `${tiers}단 적치 (총 높이 ${totalCm}cm)` : `${tiers}단 적치 (총 높이 ${totalH}m)`;
    return { stackText: text, totalHeightM: totalH };
  } else {
    const text = totalH < 1.0 ? `${tiers} Tiers (Height ${totalCm}cm)` : `${tiers} Tiers (Height ${totalH}m)`;
    return { stackText: text, totalHeightM: totalH };
  }
}
