const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const filename = path.join(__dirname, '../src/components/ExperienceCatalog/catalog.ts');
const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  fileName: filename, reportDiagnostics: true,
});
assert.equal((output.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error).length, 0);
const compiled = new Module(filename, module);
compiled.filename = filename;
compiled.paths = module.paths;
compiled._compile(output.outputText, filename);
const { normalizeExperience, defaultSelection, restoreSelection, calculateQuote, destinationDate, menuReady, text, validPrice } = compiled.exports;
const name = (en) => ({ en, es: en });
const photo = (id) => ({ asset: { url: `https://cdn.sanity.io/fixture-${id}.jpg` }, alt: `Fixture ${id}` });
const raw = (overrides = {}) => ({ _id: 'fixture', slug: { current: 'fixture' }, name: name('Test experience'), price: 1000,
  gallery: [photo(1), photo(2), photo(3)], variants: [{ _key: 'boho', name: name('Boho'), price: 1100 }, { _key: 'velvet', name: name('Velvet'), price: 1400 }],
  addons: [{ _key: 'video', name: name('Video fixture'), price: 200 }, { _key: 'violin', name: name('Violin fixture'), price: 300 }], ...overrides });
const menu = [{ _key: 'starter', name: name('Starter fixture'), course: 'starter', price: 0 }, { _key: 'main', name: name('Main fixture'), course: 'main', price: 20 }, { _key: 'dessert', name: name('Dessert fixture'), course: 'dessert', price: 5 }];

test('existing documents remain proposals, including proposals with dinner', () => {
  assert.equal(normalizeExperience(raw()).kind, 'proposal');
  assert.equal(normalizeExperience(raw({ experienceKind: 'dinner' })).kind, 'dinner');
});
test('the full style price replaces rather than adds to the base', () => {
  const e = normalizeExperience(raw()); const s = defaultSelection(e);
  assert.equal(calculateQuote(e, s).total, 1100);
  assert.equal(calculateQuote(e, { ...s, style: 'velvet' }).total, 1400);
});
test('multiple extras add to the selected style and can be removed', () => {
  const e = normalizeExperience(raw()); const s = { ...defaultSelection(e), style: 'velvet', extras: ['video', 'violin'] };
  assert.equal(calculateQuote(e, s).total, 1900);
  assert.equal(calculateQuote(e, { ...s, extras: ['video'] }).total, 1600);
});
test('general images are independent of the selected style', () => {
  const e = normalizeExperience(raw()); const before = JSON.stringify(e.photos);
  calculateQuote(e, { ...defaultSelection(e), style: 'velvet' });
  assert.equal(JSON.stringify(e.photos), before);
  assert.equal(e.photos.length, 3);
});
test('gallery is deduplicated and capped at five real photos', () => {
  const e = normalizeExperience(raw({ gallery: [photo(1), photo(1), photo(2), photo(3), photo(4), photo(5), photo(6)], image: photo(1) }));
  assert.equal(e.photos.length, 5); assert.equal(new Set(e.photos.map((p) => p.url)).size, 5);
});
test('missing photos are not fabricated or duplicated to meet minimum', () => {
  assert.equal(normalizeExperience(raw({ gallery: [photo(1)], image: photo(1) })).photos.length, 1);
});
test('dinner transport cannot be sold a second time as an extra', () => {
  const e = normalizeExperience(raw({ experienceKind: 'dinner', addons: [{ _key: 'transfer', name: name('Transport fixture'), icon: 'car', price: 90 }, { _key: 'photo', name: name('Photo fixture'), icon: 'camera', price: 300 }] }));
  assert.deepEqual(e.extras.map((x) => x.id), ['photo']);
});
test('three courses are selected independently per guest and supplements are per person', () => {
  const e = normalizeExperience(raw({ experienceKind: 'dinner', variants: [], price: 600, dinnerMenu: menu }));
  const s = defaultSelection(e); s.guests[0] = { starter: 'starter', main: 'main', dessert: 'dessert' };
  assert.equal(s.guests[1].main, ''); assert.equal(calculateQuote(e, s).total, null);
  s.guests[1] = { starter: 'starter', main: 'main', dessert: 'dessert' };
  assert.equal(calculateQuote(e, s).total, 650);
});
test('missing menu or incomplete selections never appear as a final quote', () => {
  const e = normalizeExperience(raw({ experienceKind: 'dinner' }));
  assert.equal(menuReady(e), false); assert.equal(calculateQuote(e, defaultSelection(e)).total, null);
});
test('unknown and negative prices are not silently treated as free', () => {
  assert.equal(validPrice(-1), null); assert.equal(validPrice(NaN), null); assert.equal(validPrice(undefined), null); assert.equal(validPrice(0), 0);
  const e = normalizeExperience(raw({ variants: [], price: null }));
  assert.equal(calculateQuote(e, defaultSelection(e)).total, null);
});
test('missing style price requires quotation instead of using the base', () => {
  const e = normalizeExperience(raw({ variants: [{ _key: 'pending', name: name('Pending'), price: null }] }));
  assert.equal(calculateQuote(e, defaultSelection(e)).base, null);
  assert.equal(calculateQuote(e, defaultSelection(e)).total, null);
});
test('currency is calculated in cents', () => {
  const e = normalizeExperience(raw({ variants: [], price: 0.1, addons: [{ _key: 'extra', name: name('Extra'), price: 0.2 }] }));
  assert.equal(calculateQuote(e, { ...defaultSelection(e), extras: ['extra'] }).total, 0.3);
});
test('saved choices are validated against the current catalog and prices', () => {
  const e = normalizeExperience(raw());
  const restored = restoreSelection(e, { style: 'removed', extras: ['video', 'removed', 'video'], wine: 'invalid', estimatedTotal: 1 });
  assert.equal(restored.style, 'boho'); assert.deepEqual(restored.extras, ['video']); assert.equal(restored.wine, 'white');
  assert.equal(calculateQuote(e, restored).total, 1300);
});
test('card states and guest objects do not leak into another card', () => {
  const e = normalizeExperience(raw()); const one = defaultSelection(e); const two = defaultSelection(e);
  one.extras.push('video'); one.guests[0].main = 'main';
  assert.deepEqual(two.extras, []); assert.equal(two.guests[0].main, ''); assert.equal(one.guests[1].main, '');
});
test('date validation uses Punta Cana rather than UTC', () => {
  assert.equal(destinationDate(new Date('2026-09-29T02:00:00Z')), '2026-09-28');
  assert.equal(destinationDate(new Date('2026-09-29T05:00:00Z')), '2026-09-29');
});
test('locale changes preserve IDs and gracefully fall back for missing translations', () => {
  assert.equal(text({ en: 'Boho' }, 'es'), 'Boho');
  assert.equal(text({ en: 'Dinner', es: 'Cena' }, 'es'), 'Cena');
});
