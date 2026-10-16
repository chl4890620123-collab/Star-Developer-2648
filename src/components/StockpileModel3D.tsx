import React, { useMemo, useState } from 'react';
import { Location, Material, RiskLevel, Stock, WeatherCondition } from '../types';

interface StockpileModel3DProps {
  location: Location;
  material: Material;
  stock: Stock;
  weather: WeatherCondition;
  status: RiskLevel;
  lang: 'ko' | 'en';
}

type Point3 = [number, number, number];
type Point2 = [number, number];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function prismPoints(x: number, y: number, z: number, width: number, depth: number, height: number, angle: number) {
  const project = (point: Point3): Point2 => {
    const [px, py, pz] = point;
    const cx = 4;
    const cy = 3;
    const radians = (angle * Math.PI) / 180;
    const dx = px - cx;
    const dy = py - cy;
    const rx = cx + dx * Math.cos(radians) - dy * Math.sin(radians);
    const ry = cy + dx * Math.sin(radians) + dy * Math.cos(radians);
    return [390 + (rx - ry) * 30, 168 + (rx + ry) * 14 - pz * 42];
  };

  const a = project([x, y, z]);
  const b = project([x + width, y, z]);
  const c = project([x + width, y + depth, z]);
  const d = project([x, y + depth, z]);
  const at = project([x, y, z + height]);
  const bt = project([x + width, y, z + height]);
  const ct = project([x + width, y + depth, z + height]);
  const dt = project([x, y + depth, z + height]);
  const points = (coords: Point2[]) => coords.map((p) => p.join(',')).join(' ');
  return {
    top: points([at, bt, ct, dt]),
    side: points([b, c, ct, bt]),
    front: points([d, c, ct, dt]),
    layer: points([project([x, y, z + height * 0.52]), project([x + width, y, z + height * 0.52]), project([x + width, y + depth, z + height * 0.52]), project([x, y + depth, z + height * 0.52])]),
    base: points([a, b, c, d]),
  };
}

export const StockpileModel3D: React.FC<StockpileModel3DProps> = ({
  location,
  material,
  stock,
  weather,
  status,
  lang,
}) => {
  const [rotation, setRotation] = useState(0);
  const isKo = lang === 'ko';
  const dimensions = material.dimensions;
  const maxDimension = Math.max(dimensions.length_m || 1, dimensions.width_m || 1, 1);
  const footprintWidth = clamp(((dimensions.length_m || 1) / maxDimension) * 2.6, 1.1, 2.6);
  const footprintDepth = clamp(((dimensions.width_m || 1) / maxDimension) * 2.2, 0.8, 2.2);
  const tiers = clamp(Math.round(stock.stack_tiers || 1), 1, 5);
  const stackHeight = clamp(tiers * ((dimensions.height_m || 0.2) / maxDimension) * 2.3, 0.55, 2.65);
  const edgeDistance = Math.max(0, Number(location.edge_distance_m) || 0);
  const stackY = clamp(0.45 + edgeDistance * 0.55, 0.45, 3.25);
  const box = useMemo(
    () => prismPoints(3.25 - footprintWidth / 2, stackY, 0.26, footprintWidth, footprintDepth, stackHeight, rotation),
    [footprintWidth, footprintDepth, stackY, stackHeight, rotation]
  );
  const statusClass =
    status === 'DANGER' ? 'text-rose-300 border-rose-400/40 bg-rose-500/10' :
    status === 'WARNING' ? 'text-amber-300 border-amber-400/40 bg-amber-500/10' :
    status === 'NOT_EVALUATED' ? 'text-slate-300 border-slate-500/40 bg-slate-500/10' :
    'text-sky-300 border-sky-400/40 bg-sky-500/10';

  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950" aria-label={isKo ? '적재 위치 3D 배치도' : '3D stockpile layout'}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100">{isKo ? '적재 위치 3D 배치도' : '3D Stockpile Layout'}</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">{isKo ? '등록된 규격과 적치 정보를 반영한 개념도' : 'Schematic from registered dimensions and stock data'}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${statusClass}`}>
            {isKo ? `현재 계산 상태 · ${status}` : `Current calculated status · ${status}`}
          </span>
          <button type="button" onClick={() => setRotation((rotation + 90) % 360)} className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-[11px] text-slate-300 hover:bg-slate-800" aria-label={isKo ? '모델 방향 회전' : 'Rotate model'}>
            ↻ {isKo ? '회전' : 'Rotate'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_210px]">
        <div className="min-w-0 p-2">
          <svg viewBox="0 0 780 390" className="h-auto max-h-[340px] w-full" role="img" aria-label={isKo ? '난간, 슬래브 가장자리, 적재물 및 바람 방향을 나타낸 3D 개념도' : '3D schematic showing guardrail, slab edge, stockpile and wind direction'}>
            <defs>
              <marker id="wind-arrow-head" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L7,3 z" fill="#38bdf8" />
              </marker>
              <linearGradient id="slab-gradient" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>
            <polygon points={prismPoints(0, 0, 0, 8, 6, 0.26, rotation).top} fill="url(#slab-gradient)" stroke="#64748b" strokeWidth="1.5" />
            <polygon points={prismPoints(0, 0, 0, 8, 6, 0.26, rotation).side} fill="#1e293b" stroke="#475569" />
            <polygon points={prismPoints(0, 0, 0, 8, 6, 0.26, rotation).front} fill="#273449" stroke="#475569" />
            {location.has_guardrail && (
              <g stroke="#94a3b8" strokeWidth="3" strokeLinecap="round">
                <path d={(() => {
                  const rail = prismPoints(0.25, 5.35, 0.26, 7.5, 0.1, 0, rotation);
                  return rail.base;
                })()} fill="none" />
                <path d={(() => {
                  const a = prismPoints(0.25, 5.35, 0.26, 0, 0, location.guardrail_height_m || 1.2, rotation);
                  const b = prismPoints(7.75, 5.35, 0.26, 0, 0, location.guardrail_height_m || 1.2, rotation);
                  return `M ${a.top.split(' ')[0]} L ${b.top.split(' ')[0]}`;
                })()} fill="none" />
                <path d={(() => {
                  const p1 = prismPoints(0.35, 5.35, 0.26, 0, 0, location.guardrail_height_m || 1.2, rotation).top.split(' ')[0];
                  const p2 = prismPoints(2.6, 5.35, 0.26, 0, 0, location.guardrail_height_m || 1.2, rotation).top.split(' ')[0];
                  const p3 = prismPoints(4.9, 5.35, 0.26, 0, 0, location.guardrail_height_m || 1.2, rotation).top.split(' ')[0];
                  const p4 = prismPoints(7.6, 5.35, 0.26, 0, 0, location.guardrail_height_m || 1.2, rotation).top.split(' ')[0];
                  const base = [0.35, 2.6, 4.9, 7.6].map((x) => prismPoints(x, 5.35, 0.26, 0, 0, 0, rotation).base.split(' ')[0]);
                  return [`M ${base[0]} L ${p1}`, `M ${base[1]} L ${p2}`, `M ${base[2]} L ${p3}`, `M ${base[3]} L ${p4}`].join(' ');
                })()} />
              </g>
            )}
            <polygon points={box.side} fill="#b45309" stroke="#fbbf24" strokeWidth="1.5" />
            <polygon points={box.front} fill="#d97706" stroke="#fbbf24" strokeWidth="1.5" />
            <polygon points={box.top} fill="#f59e0b" stroke="#fde68a" strokeWidth="1.5" />
            {tiers > 1 && <polygon points={box.layer} fill="none" stroke="#78350f" strokeWidth="2" strokeDasharray="5 4" />}
            {(stock.fastening?.has_ratchet_straps || stock.fastening?.has_anchor_wires) && (
              <g stroke="#f8fafc" strokeWidth="2" strokeDasharray="4 3">
                <line x1="337" y1="186" x2="422" y2="143" />
                <line x1="354" y1="199" x2="439" y2="156" />
              </g>
            )}
            <g stroke="#38bdf8" strokeWidth="3" strokeDasharray="7 6" markerEnd="url(#wind-arrow-head)" opacity="0.9">
              <line x1="44" y1="92" x2="174" y2="92" />
              <line x1="44" y1="116" x2="174" y2="116" />
              <line x1="44" y1="140" x2="174" y2="140" />
            </g>
            <text x="42" y="70" fill="#7dd3fc" fontSize="12" fontWeight="700">{isKo ? '풍향' : 'WIND'}</text>
            <text x="55" y="165" fill="#cbd5e1" fontSize="11">{weather.wind_direction_text} · {weather.gust_speed_ms} m/s</text>
            <text x="305" y="346" fill="#cbd5e1" fontSize="11">{isKo ? '슬래브 가장자리' : 'Slab edge'}</text>
            <text x="468" y="230" fill="#fde68a" fontSize="11">{isKo ? `적재 ${stock.count}개 · ${tiers}단` : `${stock.count} units · ${tiers} tiers`}</text>
            <text x="468" y="248" fill="#cbd5e1" fontSize="10">{isKo ? `가장자리 이격 ${edgeDistance.toFixed(1)}m` : `Edge clearance ${edgeDistance.toFixed(1)}m`}</text>
            {!location.has_guardrail && <text x="502" y="328" fill="#fb7185" fontSize="11" fontWeight="700">{isKo ? '난간 미설치' : 'No guardrail'}</text>}
            <text x="605" y="30" fill="#64748b" fontSize="10">{isKo ? `보기 방향 ${rotation}°` : `View ${rotation}°`}</text>
          </svg>
        </div>
        <aside className="border-t border-slate-800 p-4 text-xs lg:border-l lg:border-t-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{isKo ? '입력 기준' : 'Inputs'}</div>
          <dl className="mt-2 space-y-2 text-slate-300">
            <div><dt className="text-slate-500">{isKo ? '자재 규격' : 'Material size'}</dt><dd className="font-mono">{dimensions.length_m} × {dimensions.width_m} × {dimensions.height_m} m</dd></div>
            <div><dt className="text-slate-500">{isKo ? '층 표고' : 'Floor elevation'}</dt><dd>{location.elevation_m} m</dd></div>
            <div><dt className="text-slate-500">{isKo ? '난간' : 'Guardrail'}</dt><dd>{location.has_guardrail ? `${location.guardrail_height_m || 1.2} m` : (isKo ? '미설치' : 'Not installed')}</dd></div>
            <div><dt className="text-slate-500">{isKo ? '풍속 / 순간풍속' : 'Wind / gust'}</dt><dd>{weather.wind_speed_ms} / {weather.gust_speed_ms} m/s</dd></div>
          </dl>
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 leading-relaxed text-amber-200">
            {isKo ? '개념 3D 배치도입니다. CFD, 구조해석 또는 안전 판정을 수행하지 않습니다.' : 'Schematic only. This is not CFD, structural analysis, or a safety determination.'}
          </p>
        </aside>
      </div>
    </section>
  );
};
