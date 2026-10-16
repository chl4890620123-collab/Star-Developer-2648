# SafeStack Weather Guard: Demo Video Production Scripts & Narration Guide
(데모 영상 2종 촬영 시나리오 및 한국어/영어 전문 나레이션 대본)

이 문서는 SafeStack Weather Guard 시스템을 시연하는 2편의 고품질 데모 영상을 직접 녹화하고 녹음할 수 있도록 준비된 **완벽한 화면 조작 가이드 및 한국어/영어 음성 대본**입니다.

---

## 🎬 [비디오 1] PC 종합 관제 대시보드 데모 (Desktop Web Command Center)
- **영상 길이**: 약 2분 30초 ~ 3분
- **화면 모드**: PC 웹 브라우저 (전체화면, 1920×1080 해상도)
- **핵심 목표**: 기상청 실시간 API 연동, 가상 강풍 시뮬레이터, 자동 사이렌 경보, 5대 물리 역학 분석, 조치 전후 시뮬레이터, AI 입고 사진 판독 시연.

### 📋 화면 조작 타임라인 (Visual Action Cue)

| 시간 | 화면 조작 (Screen Action) | 시연 내용 |
|---|---|---|
| **00:00~00:25** | 메인 화면 전체 조망. 상단 헤더, KPI 요약 카드(위험/주의/점검), 기상청 실시간 기상 위젯을 천천히 마우스로 가리킴. | 실제 기상청 오픈 API 연동 상태 및 인천/서울/부산/강원 거점 지역 전환 시연 |
| **00:25~00:50** | 상단 '지역/GPS 변경' 버튼 클릭 -> `RegionSelectorModal` 열기 -> '부산 해운대' 또는 '강원 평창' 선택 -> 풍속과 24시간 예보 그래프가 실시간으로 전환되는 모습 시연. | 실시간 기상 관측값 동기화 및 24시간 타임라인 예보 확인 |
| **00:50~01:25** | 기상 위젯의 '가상 풍속 시뮬레이터' 슬라이더를 잡고 14.0m/s -> 18.5m/s로 드래그! | 🚨 순간 사이렌 소리와 함께 상단에 붉은색 '자동 긴급 안전 경보 배너'가 작동하고 DANGER 위험 구역이 급증하는 역학 계산 시연 |
| **01:25~01:55** | 야적장 구역 중 위험(DANGER)으로 표시된 '12F 옥상 남측' 또는 '4F 외곽 단부' 카드의 [역학 상세 및 조치] 버튼 클릭 -> `LocationDetailModal` 팝업. | 3D CFD 유동 시뮬레이션 다이어그램, 5대 물리 위험 탭(미끄러짐/전도/들림/추락/비산)의 안전율(FS) 공식 확인 |
| **01:55~02:25** | 모달 내 '조치 시뮬레이션(Before vs After)' 섹션에서 [래칫 벨트 체결], [고무 마찰패드], [적재단수 감축] 체크 -> [조치 재계산] 클릭 -> 안전율(FS)이 상승하며 녹색으로 변하는 비교표 확인 -> [현장 조치 즉시 반영] 클릭! | 현장 조치 시뮬레이션을 통한 안전율 즉각 회복 및 DB 자동 저장 |
| **02:25~02:45** | 상단 [입고 사진 AI 판독] 버튼 클릭 -> `AiIntakeModal` -> 샘플 단열재 사진 및 규격 문서 로드 -> Gemini 3.8 Flash가 수량/단수/결속력을 자동 JSON 추출하여 등록하는 과정 시연. | Gemini 3.8 Flash 비전 모델 기반 자재 규격 자동 추출 |
| **02:45~03:00** | 헤더 우측 [EN / 한국어] 언어 전환 버튼 클릭 -> 모든 UI 텍스트와 역학 공식, 모달 설명이 즉시 완벽한 영어로 전환되는 모습 시연 후 마무리. | 100% 무손실 다국어 아키텍처 증명 |

---

### 🎙️ [비디오 1] 한국어 녹음 대본 (Korean Spoken Narration)

> "(00:00) 안녕하십니까. 고층 건설현장 야적장의 강풍 재해를 실시간 물리 역학으로 예방하는 종합 솔루션, **SafeStack Weather Guard**의 종합 관제 센터를 소개합니다.
> 
> (00:15) 보시는 화면은 기상청 실시간 API와 직결된 메인 대시보드입니다. 화면 상단에는 현재 풍속과 순간 돌풍, 그리고 향후 24시간 동안의 풍속 추이가 그래프로 정밀하게 표출됩니다.
> 
> (00:30) 상단의 지역 전환 버튼을 누르면, 송도 랜드마크 타워뿐 아니라 서울 강남, 부산 해운대, 강원 평창 등 전국 주요 거점의 기상 데이터를 1초 만에 전환하여 관제할 수 있습니다.
> 
> (00:48) 이제 현장에 강풍이 닥쳤을 때 시스템이 어떻게 작동하는지 시험해보겠습니다. 가상 풍속 시뮬레이터를 드래그하여 풍속을 18미터 이상으로 올리면...
> 
> (01:00) [사이렌 경보음 울림] 보시는 것처럼, 기준치를 초과하는 순간 청각 사이렌과 함께 시각 안전 경보 배너가 즉각 발령되며, 전체 야적 구역의 안전율이 실시간으로 재계산되어 위험 구역이 즉시 붉은색으로 식별됩니다.
> 
> (01:25) 위험 구역인 12층 옥상 야적장을 클릭해보겠습니다. 화면에는 NASA 표준 항력식과 양력식을 기반으로 계산된 미끄러짐, 전도, 들림, 슬래브 단부 추락, 그리고 낱장 비산 등 5대 물리 위험 지표가 표시되며, 공기역학 3D CFD 시뮬레이션 결과가 함께 제공됩니다.
> 
> (01:50) 특히 지침서 규정에 맞춘 '조치 전후 시뮬레이터'를 통해, 래칫 밴드 체결과 고무 패드 설치 시 안전율이 어떻게 상승하는지 시뮬레이션한 뒤, 버튼 한 번으로 현장 데이터에 즉각 반영할 수 있습니다.
> 
> (02:25) 또한 상단의 AI 자재 판독 기능을 통해, 현장에 입고된 자재 사진을 업로드하면 Gemini 3.8 Flash 비전 모델이 적재 단수와 결속 상태를 스스로 인식하여 데이터베이스에 자동으로 등록합니다.
> 
> (02:45) 마지막으로 글로벌 현장을 위해 한국어와 영어가 100% 완벽하게 상호 전환되는 완전한 다국어 환경을 지원합니다."

---

## 📱 [비디오 2] 모바일 현장 순찰 & QR 카메라 & AI 안전비서 데모 (Mobile Field Patrol View)
- **영상 길이**: 약 2분 ~ 2분 30초
- **화면 모드**: 모바일 뷰 (스마트폰 해상도 412×915 또는 브라우저 모바일 순찰 모드)
- **핵심 목표**: 현장 안전관리자 1손 순찰 최적화 UI, 실시간 카메라 QR 코드 스캔, 1초 래칫 체결 토글, 인라인 역학 펼치기, Gemini AI 현장 안전 비서 QnA, 5건 정비 이력 로그.

### 📋 화면 조작 타임라인 (Visual Action Cue)

| 시간 | 화면 조작 (Screen Action) | 시연 내용 |
|---|---|---|
| **00:00~00:20** | 헤더의 스마트폰 아이콘을 눌러 '모바일 현장 순찰 모드'로 전환. 한 손으로 조작하기 쉬운 간결한 카드 UI 시연. | 현장 안전관리자 맞춤형 모바일 뷰 전환 및 2-Column 풍속 카드 |
| **00:20~00:45** | 상단 노란색 [QR 태그 스캔] 버튼 클릭 -> `QrScannerModal` 실행 -> 카메라 스캐너 화면의 레이저 애니메이션 및 하단 '12F 옥상 남측' 시뮬레이션 태그 클릭 -> 비프음과 함께 즉시 해당 구역으로 연결되는 과정 시연! | 0.2초 카메라 QR 태그 인식 및 야적장 자재 데이터 즉시 호출 |
| **00:45~01:20** | 모바일 상단의 **[AI 현장 안전관제 어시스턴트]** 패널 시연. 추천 질문 칩인 `[🚨 긴급한 곳 어디야?]` 터치 -> Gemini 3.8 Flash가 즉시 "12층 옥상 남측 야적장의 단열재가 가장 위험합니다!"라고 답변하고, `[해당 구역 즉시 조치하러 가기]` 바로가기 버튼이 생성되는 모습 시연. | 모바일 전용 Gemini 현장 안전 AI 질의응답 및 즉각 행동 유도 |
| **01:20~01:45** | 위험 카드를 탭(Tap)하여 클릭! -> 카드가 인라인으로 부드럽게 펼쳐지며 5대 물리 위험 안전율(FS) 지표와 상세 모달 버튼이 노출되는 인터랙티브 반응 시연. | 모바일 터치 즉각 반응 (어코디언 펼침 & 안전율 진단) |
| **01:45~02:05** | 펼쳐진 카드의 주황색 `[⚠️ 래칫 밴딩 긴급 체결]` 버튼 클릭 -> 탭하는 즉시 초록색 `[✓ 체결 완료 (3.5kN)]`으로 바뀌고, 카드의 DANGER 위험 배지가 CHECK 상태로 변하며 테두리 색상이 변경되는 즉각적 피드백 시연! | 1초 원터치 긴급 조치 및 실시간 안전율 회복 |
| **02:05~02:30** | 카드의 [상세 모달 열기] 터치 -> 하단의 '현장 점검 및 정비 이력' 탭으로 이동 -> 최근 5건의 점검 타임스탬프와 선임안전관리자 소견 확인 -> 새 점검 기록 작성 버튼을 눌러 상태와 메모를 추가하는 모습 시연 후 종료. | 위치별 최근 5회 안전 점검 이력 및 현장 감사 로그 실시간 보존 |

---

### 🎙️ [비디오 2] 한국어 녹음 대본 (Korean Spoken Narration)

> "(00:00) 이번에는 현장 안전관리자가 스마트폰을 들고 야적장을 순찰할 때 사용하는 **모바일 현장 순찰 모드**를 보여드리겠습니다.
> 
> (00:15) 모바일 모드에서는 복잡한 수치 대신, '난간보다 0.3m 높음', '깔깔이 밴드 체결 여부'와 같이 현장에서 직관적으로 판단할 수 있는 쉬운 용어로 카드가 표시됩니다.
> 
> (00:25) 현장에 부착된 QR 코드를 카메라로 비추면, 단 0.2초 만에 해당 구역의 적치 자재 규격과 현재 바람 안전율이 즉시 화면에 떠오릅니다.
> 
> (00:45) 특히 이번에 탑재된 **AI 현장 안전 비서**는 순찰 중 가장 강력한 무기입니다. 화면의 '긴급한 곳 어디야?' 칩을 누르면, Gemini 3.8 모델이 현재 기상과 자재 상태를 실시간 분석하여, '12층 옥상 남측 단열재가 결속되지 않아 가장 위험합니다'라고 즉시 브리핑하고 바로가기 버튼을 제공합니다.
> 
> (01:20) 야적장 카드를 탭하면 즉시 상세 어코디언이 펼쳐지며 5대 위험 지표가 나타납니다.
> 
> (01:40) 현장에서 래칫 벨트를 조여 체결한 뒤 '긴급 체결' 버튼을 터치하면, 보시는 것처럼 즉시 초록색 '체결 완료'로 바뀌면서 위험 상태가 즉각 안전으로 전환됩니다.
> 
> (02:05) 또한 각 야적 구역마다 최근 5건의 정비 이력과 점검 일지가 영구 보존되어, 언제 누가 점검하고 조치했는지 현장에서 투명하게 등록하고 관리할 수 있습니다."

---

## 🌐 English Voiceover Script (For Global Reviewers)

### Video 1: Desktop Web Command Center (English)
> "Welcome to the SafeStack Weather Guard Command Center — an advanced aerodynamic risk intelligence platform for high-rise construction storage yards.
>
> Directly synchronized with the Korea Meteorological Administration API, SafeStack delivers real-time wind speeds, peak gusts, and 24-hour predictive forecasts across key construction hubs including Incheon, Seoul, Busan, and Gangwon.
>
> Using our Virtual Wind Simulator, safety engineers can test wind escalations up to 35 meters per second. The moment wind thresholds are breached, an automated audio siren and push notification alarm trigger instantly, recalculating safety factors across all staged materials.
>
> Inspecting any flagged yard reveals full 3D CFD aerodynamic wind tunnel simulations and our 5 classical mechanical hazard engines: Sliding, Overturning, Vertical Uplift, Slab Perimeter Falling with Dual-Elevation protection, and Windborne Sheet Scattering.
>
> Through the Before-and-After Mitigation Simulator, safety teams can verify safety factor improvements from ratchet tie-downs and friction pads before deploying physical labor.
>
> With Multimodal Gemini 3.8 Flash intake OCR and 100% bilingual parity, SafeStack delivers uncompromising safety compliance."

### Video 2: Mobile Field Patrol & AI Safety Assistant (English)
> "In this demonstration, we showcase the Mobile Field Inspection View designed specifically for on-site safety officers navigating storage yards.
>
> The high-contrast mobile interface features plain-language dimensions, guardrail clearance metrics, and a live camera-based QR code scanner that pulls up full yard telemetry in 0.2 seconds.
>
> Powered by Gemini 3.8 Flash, our on-site AI Safety Patrol Assistant instantly answers critical field queries such as 'Where is the urgent danger right now?' and provides direct jump-links to target yards.
>
> Tapping any yard card reveals an interactive accordion breakdown of all five aerodynamic safety factors. Tapping the emergency ratchet strap button immediately toggles fastening state, dynamically changing the risk badge and recalculating stability in real time.
>
> Finally, every storage yard maintains a persistent 5-entry maintenance history log, capturing verifiable inspection timestamps, inspector credentials, and action notes directly in the field."
