import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { initSwissScene } from '../js/core/swiss-scene.js';

const originals = new Map();
function global(name, value) {
  if (!originals.has(name)) originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
}
afterEach(() => {
  for (const [name, descriptor] of originals) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else delete globalThis[name];
  }
  originals.clear();
});
function fixture({ reduced = false, saveData = false } = {}) {
  const hosts = [0, 1].map(() => ({ isConnected: true, classList: { remove() {} } }));
  const state = { observed: [], importsRequested: false, disconnected: false };
  global('document', {
    querySelectorAll: () => hosts,
    // A failed graphics context must leave the existing DOM intact.
    createElementNS: () => { state.importsRequested = true; throw new Error('WebGL unavailable'); }
  });
  global('matchMedia', () => ({ matches: reduced }));
  global('navigator', { connection: { saveData } });
  global('IntersectionObserver', class {
    constructor(callback) { state.intersect = callback; }
    observe(host) { state.observed.push(host); }
    disconnect() { state.disconnected = true; }
  });
  return { hosts, state };
}
test('reduced motion keeps the authored fallback without starting a graphics observer', async () => {
  const { state } = fixture({ reduced: true });
  await initSwissScene();
  assert.equal(state.observed.length, 0);
  assert.equal(state.importsRequested, false);
});
test('data saving keeps the authored fallback without starting a graphics observer', async () => {
  const { state } = fixture({ saveData: true });
  await initSwissScene();
  assert.equal(state.observed.length, 0);
  assert.equal(state.importsRequested, false);
});
test('offscreen scenes defer loading; graphics failure resolves without replacing content', async () => {
  const { hosts, state } = fixture();
  let settled = false;
  const pending = initSwissScene().then(() => { settled = true; });
  state.intersect([{ isIntersecting: false }]);
  await Promise.resolve();
  assert.equal(settled, false);
  assert.equal(state.importsRequested, false);
  assert.equal(state.observed.length, 2);
  state.intersect([{ isIntersecting: true }]);
  await pending;
  assert.equal(state.importsRequested, true);
  assert.equal(state.disconnected, true);
});
test('a removed page does not initialise a late graphics response', async () => {
  const { hosts, state } = fixture();
  const pending = initSwissScene();
  hosts[0].isConnected = false;
  state.intersect([{ isIntersecting: true }]);
  await pending;
  assert.equal(state.importsRequested, false);
});
