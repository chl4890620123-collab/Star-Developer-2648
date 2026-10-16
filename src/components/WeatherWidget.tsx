import React, { useState } from 'react';
import {
  Wind,
  Compass,
  Thermometer,
  Clock,
  AlertTriangle,
  CloudRain,
  RotateCcw,
} from 'lucide-react';
import { WeatherCondition } from '../types';
import { Language, translations } from '../services/i18n';

interface WeatherWidgetProps {
  currentWeather: WeatherCondition;
  nextShiftWeather: WeatherCondition;
  hourlyForecast: WeatherCondition[];
  simulationWindSpeed: number | null;
  onSetSimulationWindSpeed: (speed: number | null) => void;
  lang: Language;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  currentWeather,
  nextShiftWeather,
  hourlyForecast,
  simulationWindSpeed,
  onSetSimulationWindSpeed,
  lang,
}) => {
  const [showHourly, setShowHourly] = useState(false);
  const t = translations[lang];

  // 시뮬레이션 적용 여부에 따른 표시 풍속
  const activeCurrentWind =
    simulationWindSpeed !== null ? simulationWindSpeed : currentWeather.wind_speed_ms;
  const activeCurrentGust =
    simulationWindSpeed !== null
      ? Number((simulationWindSpeed * 1.5).toFixed(1))
      : currentWeather.gust_speed_ms;

  // 전체 예보 중 최대 풍속 시점 탐색 (지침서: 두 번째 칸 이후의 위험 상승도 별도 안내)
  const peakForecast = [...hourlyForecast].sort((a, b) => b.wind_speed_ms - a.wind_speed_ms)[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4 keep-all no-overflow">
      {/* 위젯 타이틀 & 시뮬레이터 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1.5 bg-sky-500/10 rounded-lg text-sky-400 shrink-0">
            <Wind className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 truncate">
              <span>{t.weatherTitle}</span>
            </h2>
            <div className="text-xs text-slate-400 truncate">{t.weatherSubtitle}</div>
          </div>
        </div>

        {/* 가상 풍속 시뮬레이터 컨트롤 */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-lg border border-slate-800 text-xs shrink-0 self-start sm:self-auto">
          <span className="text-slate-400 font-medium whitespace-nowrap">{t.virtualSimLabel}:</span>
          {simulationWindSpeed !== null ? (
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-amber-400 whitespace-nowrap">
                {simulationWindSpeed} m/s
              </span>
              <button
                onClick={() => onSetSimulationWindSpeed(null)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1 whitespace-nowrap"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t.simReset}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => onSetSimulationWindSpeed(6.0)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded hover:text-white whitespace-nowrap"
              >
                {t.simNormal}
              </button>
              <button
                onClick={() => onSetSimulationWindSpeed(13.5)}
                className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded hover:bg-amber-500/30 font-medium whitespace-nowrap"
              >
                {t.simAdvisory}
              </button>
              <button
                onClick={() => onSetSimulationWindSpeed(21.0)}
                className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded hover:bg-rose-500/30 font-medium whitespace-nowrap"
              >
                {t.simStorm}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* [지침서 2절 필수 구현] 2-Column Primary Cards: 현재 관측 vs 다음 변경 예보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 칸 1: 현재 관측 시각 및 풍속 */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 gap-2">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-300 truncate">
                <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{currentWeather.valid_time}</span>
              </span>
              <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap shrink-0">
                {simulationWindSpeed !== null
                  ? lang === 'ko'
                    ? '가상 시뮬레이션 적용 중'
                    : 'Simulated'
                  : lang === 'ko'
                  ? '초단기실황 수신'
                  : 'Live Observed'}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <div>
                <div className="text-xs text-slate-400 whitespace-nowrap">{t.currentAvgWind}</div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-100 tracking-tight whitespace-nowrap mt-0.5">
                  {activeCurrentWind}
                  <span className="text-base font-normal text-slate-400 ml-1">m/s</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400 whitespace-nowrap">{t.currentGust}</div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400 whitespace-nowrap mt-0.5">
                  {activeCurrentGust}
                  <span className="text-xs font-normal text-slate-400 ml-1">m/s</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1 truncate">
              <Compass className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{currentWeather.wind_direction_text}</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <Thermometer className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{currentWeather.temperature_c}℃</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <CloudRain className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                {lang === 'ko' ? '강수' : 'Rain'} {currentWeather.precipitation_prob}%
              </span>
            </div>
          </div>
        </div>

        {/* 칸 2: 풍속이 달라지는 다음 예보 시각 및 풍속 */}
        <div className="bg-amber-950/20 border border-amber-500/40 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-amber-400 mb-2 gap-2">
              <span className="inline-flex items-center gap-1.5 font-bold text-amber-300 truncate">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{nextShiftWeather.valid_time}</span>
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap shrink-0">
                {lang === 'ko' ? '풍속 급변 예보 (+5.6 m/s)' : 'Surge Shift (+5.6 m/s)'}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <div>
                <div className="text-xs text-amber-300/80 whitespace-nowrap">{t.nextShiftAvgWind}</div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-300 tracking-tight whitespace-nowrap mt-0.5">
                  {nextShiftWeather.wind_speed_ms}
                  <span className="text-base font-normal text-amber-400/70 ml-1">m/s</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-amber-300/80 whitespace-nowrap">{t.nextShiftGust}</div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-rose-400 whitespace-nowrap mt-0.5">
                  {nextShiftWeather.gust_speed_ms}
                  <span className="text-xs font-normal text-rose-400/70 ml-1">m/s</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-500/20 grid grid-cols-3 gap-2 text-xs text-amber-200/80">
            <div className="flex items-center gap-1 truncate">
              <Compass className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
              <span className="truncate">{nextShiftWeather.wind_direction_text}</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <Thermometer className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
              <span>{nextShiftWeather.temperature_c}℃</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <CloudRain className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
              <span>
                {lang === 'ko' ? '강수' : 'Rain'} {nextShiftWeather.precipitation_prob}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* [지침서 2절 준수] 예보 전체 검사 알림: 두 번째 칸 이후의 위험 상승 안내 */}
      {peakForecast && peakForecast.wind_speed_ms > nextShiftWeather.wind_speed_ms && (
        <div className="bg-rose-950/30 border border-rose-500/40 rounded-lg p-3 text-xs text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="leading-relaxed">
              <strong>{t.peakAlertTitle}</strong>{' '}
              {t.peakAlertDesc
                .replace('{time}', peakForecast.valid_time)
                .replace('{speed}', String(peakForecast.wind_speed_ms))
                .replace('{gust}', String(peakForecast.gust_speed_ms))}
            </span>
          </div>
          <button
            onClick={() => setShowHourly(!showHourly)}
            className="text-xs font-semibold text-rose-400 hover:text-rose-200 whitespace-nowrap underline shrink-0 self-end sm:self-auto"
          >
            {showHourly ? (lang === 'ko' ? '접기' : 'Hide') : t.hourlyTimelineBtn}
          </button>
        </div>
      )}

      {/* 24시간 타임라인 드롭다운/토글 */}
      {showHourly && (
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mt-2">
          <div className="text-xs font-semibold text-slate-300 mb-2">{t.hourlyTimelineTitle}</div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {hourlyForecast.map((h, i) => (
              <div
                key={i}
                className={`p-2 rounded border text-center text-xs ${
                  h.wind_speed_ms >= 14
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                    : h.wind_speed_ms >= 10
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="text-[11px] text-slate-400 whitespace-nowrap">{h.valid_time}</div>
                <div className="font-mono font-bold mt-1 whitespace-nowrap">{h.wind_speed_ms}m/s</div>
                <div className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">
                  {lang === 'ko' ? '돌풍' : 'Gust'} {h.gust_speed_ms}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
