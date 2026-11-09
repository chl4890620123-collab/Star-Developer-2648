import assert from 'node:assert/strict';
import test from 'node:test';

import { INITIAL_LOCATIONS, INITIAL_MATERIALS, INITIAL_STOCKS, CURRENT_OBSERVED_WEATHER } from './mockData';
import { evaluateHazards, getEffectiveWindSpeed } from './physicsEngine';
import type { Stock } from '../types';

const location = INITIAL_LOCATIONS[0];
const stock = INITIAL_STOCKS[location.id];
const material = INITIAL_MATERIALS[stock.material_id];

test('calm wind is zero, not a default 7.2/11.4 m/s gust', () => {
  assert.equal(getEffectiveWindSpeed(0, 42, 'OPEN_ROOFTOP'), 0);
  const hazards = evaluateHazards(location, material, stock, {
    ...CURRENT_OBSERVED_WEATHER,
    wind_speed_ms: 0,
    gust_speed_ms: 0,
  });
  assert.equal(hazards.hazards.sliding.safety_factor, 99.9);
  assert.equal(hazards.hazards.toppling.safety_factor, 99.9);
});

test('missing support geometry from an older saved record does not crash', () => {
  const oldStock = { ...stock, support_geometry: undefined } as unknown as Stock;
  const result = evaluateHazards(location, material, oldStock, CURRENT_OBSERVED_WEATHER);
  assert.ok(result.hazards.toppling);
});

test('zero friction must not be replaced with a safe default', () => {
  const noFriction = { ...stock, friction_coefficient: 0 };
  const result = evaluateHazards(location, material, noFriction, CURRENT_OBSERVED_WEATHER);
  assert.equal(result.hazards.sliding.safety_factor, 0);
});
