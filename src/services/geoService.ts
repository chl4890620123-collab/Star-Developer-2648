/**
 * 기상청(KMA) 위경도 ↔ 격자(nx, ny) LCC 좌표 변환 및 GPS / 지역 관리 모듈
 */

export interface ConstructionSiteRegion {
  id: string;
  nameKo: string;
  nameEn: string;
  lat: number;
  lng: number;
  nx: number;
  ny: number;
  addressKo: string;
  addressEn: string;
}

/**
 * 대한민국 주요 건설 거점 기본 프리셋
 */
export const DEFAULT_SITE_REGIONS: ConstructionSiteRegion[] = [
  {
    id: 'region-seoul-mapo',
    nameKo: '서울 마포 복합업무시설 신축현장',
    nameEn: 'Seoul Mapo Complex Construction Site',
    lat: 37.5794,
    lng: 126.8898,
    nx: 59,
    ny: 127,
    addressKo: '서울특별시 마포구 월드컵북로 402',
    addressEn: '402 World Cup buk-ro, Mapo-gu, Seoul',
  },
  {
    id: 'region-seoul-gangnam',
    nameKo: '서울 강남 테헤란로 하이엔드 오피스 신축',
    nameEn: 'Seoul Gangnam Teheran-ro Office Site',
    lat: 37.5005,
    lng: 127.0365,
    nx: 61,
    ny: 125,
    addressKo: '서울특별시 강남구 테헤란로 152',
    addressEn: '152 Teheran-ro, Gangnam-gu, Seoul',
  },
  {
    id: 'region-incheon-songdo',
    nameKo: '인천 송도국제도시 초고층 주상복합',
    nameEn: 'Incheon Songdo High-rise Residential Tower',
    lat: 37.3948,
    lng: 126.6385,
    nx: 55,
    ny: 123,
    addressKo: '인천광역시 연수구 송도과학로 32',
    addressEn: '32 Songdogwahak-ro, Yeonsu-gu, Incheon',
  },
  {
    id: 'region-pyeongtaek-godeok',
    nameKo: '경기 평택 고덕 첨단복합물류단지',
    nameEn: 'Pyeongtaek Godeok Logistics Hub Site',
    lat: 37.0392,
    lng: 127.0428,
    nx: 62,
    ny: 114,
    addressKo: '경기도 평택시 고덕면 고덕중앙로',
    addressEn: 'Godeokjungang-ro, Pyeongtaek, Gyeonggi-do',
  },
  {
    id: 'region-busan-haeundae',
    nameKo: '부산 해운대 해안가 초고층 리조트 현장',
    nameEn: 'Busan Haeundae Coastal High-rise Resort',
    lat: 35.1587,
    lng: 129.1604,
    nx: 98,
    ny: 76,
    addressKo: '부산광역시 해운대구 달맞이길 30',
    addressEn: '30 Dalmaji-gil, Haeundae-gu, Busan',
  },
  {
    id: 'region-gangneung-east',
    nameKo: '강원 강릉 동해안 해안풍력 연계 발전설비',
    nameEn: 'Gangwon Gangneung Coastal Wind Hub Site',
    lat: 37.7519,
    lng: 128.8761,
    nx: 92,
    ny: 131,
    addressKo: '강원도 강릉시 경강로 2021',
    addressEn: '2021 Gyeonggang-ro, Gangneung, Gangwon-do',
  },
];

/**
 * 기상청 공식 LCC (Lambert Conformal Conic) 위경도 -> 격자(nx, ny) 변환 알고리즘
 * KMA DFS_XY 변환 공식
 */
export function convertCoordsToKmaGrid(lat: number, lng: number): { nx: number; ny: number } {
  const RE = 6371.00877; // 지구 반경(km)
  const GRID = 5.0; // 격자 간격(km)
  const SLAT1 = 30.0; // 투영 위도1(degree)
  const SLAT2 = 60.0; // 투영 위도2(degree)
  const OLON = 126.0; // 기준점 경도(degree)
  const OLAT = 38.0; // 기준점 위도(degree)
  const XO = 43; // 기준점 X좌표(GRID)
  const YO = 136; // 기준점 Y좌표(GRID)

  const DEG2RAD = Math.PI / 180.0;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEG2RAD;
  const slat2 = SLAT2 * DEG2RAD;
  const olon = OLON * DEG2RAD;
  const olat = OLAT * DEG2RAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEG2RAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = lng * DEG2RAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { nx: Math.max(1, Math.min(149, x)), ny: Math.max(1, Math.min(253, y)) };
}

/**
 * 브라우저 Geolocation API를 통해 사용자의 현재 GPS 좌표 및 기상청 격자 획득
 */
export async function getCurrentGpsRegion(): Promise<ConstructionSiteRegion> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        const { nx, ny } = convertCoordsToKmaGrid(lat, lng);

        const gpsRegion: ConstructionSiteRegion = {
          id: `gps-current-${Date.now()}`,
          nameKo: `현재 사용자 GPS 현장 (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
          nameEn: `Current GPS Site Location (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
          lat,
          lng,
          nx,
          ny,
          addressKo: `GPS 위도 ${lat}, 경도 ${lng} (기상청 격자 ${nx}, ${ny})`,
          addressEn: `GPS Lat ${lat}, Lng ${lng} (KMA Grid ${nx}, ${ny})`,
        };
        resolve(gpsRegion);
      },
      (err) => {
        reject(err);
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
      }
    );
  });
}
