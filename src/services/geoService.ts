/**
 * GPS 좌표 및 현장 지역 관리 모듈
 */

export interface ConstructionSiteRegion {
  id: string;
  nameKo: string;
  nameEn: string;
  lat: number;
  lng: number;
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
    addressKo: '서울특별시 마포구 월드컵북로 402',
    addressEn: '402 World Cup buk-ro, Mapo-gu, Seoul',
  },
  {
    id: 'region-seoul-gangnam',
    nameKo: '서울 강남 테헤란로 하이엔드 오피스 신축',
    nameEn: 'Seoul Gangnam Teheran-ro Office Site',
    lat: 37.5005,
    lng: 127.0365,
    addressKo: '서울특별시 강남구 테헤란로 152',
    addressEn: '152 Teheran-ro, Gangnam-gu, Seoul',
  },
  {
    id: 'region-incheon-songdo',
    nameKo: '인천 송도국제도시 초고층 주상복합',
    nameEn: 'Incheon Songdo High-rise Residential Tower',
    lat: 37.3948,
    lng: 126.6385,
    addressKo: '인천광역시 연수구 송도과학로 32',
    addressEn: '32 Songdogwahak-ro, Yeonsu-gu, Incheon',
  },
  {
    id: 'region-pyeongtaek-godeok',
    nameKo: '경기 평택 고덕 첨단복합물류단지',
    nameEn: 'Pyeongtaek Godeok Logistics Hub Site',
    lat: 37.0392,
    lng: 127.0428,
    addressKo: '경기도 평택시 고덕면 고덕중앙로',
    addressEn: 'Godeokjungang-ro, Pyeongtaek, Gyeonggi-do',
  },
  {
    id: 'region-busan-haeundae',
    nameKo: '부산 해운대 해안가 초고층 리조트 현장',
    nameEn: 'Busan Haeundae Coastal High-rise Resort',
    lat: 35.1587,
    lng: 129.1604,
    addressKo: '부산광역시 해운대구 달맞이길 30',
    addressEn: '30 Dalmaji-gil, Haeundae-gu, Busan',
  },
  {
    id: 'region-gangneung-east',
    nameKo: '강원 강릉 동해안 해안풍력 연계 발전설비',
    nameEn: 'Gangwon Gangneung Coastal Wind Hub Site',
    lat: 37.7519,
    lng: 128.8761,
    addressKo: '강원도 강릉시 경강로 2021',
    addressEn: '2021 Gyeonggang-ro, Gangneung, Gangwon-do',
  },
];

/**
 * 브라우저 GPS 좌표를 현장 위치 정보로 사용
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

        const gpsRegion: ConstructionSiteRegion = {
          id: `gps-current-${Date.now()}`,
          nameKo: `현재 사용자 GPS 현장 (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
          nameEn: `Current GPS Site Location (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
          lat,
          lng,
          addressKo: `GPS 위도 ${lat}, 경도 ${lng}`,
          addressEn: `GPS Lat ${lat}, Lng ${lng}`,
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
