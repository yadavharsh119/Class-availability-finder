'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../src/app');

async function startServer() {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  return {
    base,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

test('GET /health returns {"status":"ok"}', async (t) => {
  const { base, close } = await startServer();
  t.after(close);

  const res = await fetch(`${base}/health`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { status: 'ok' });
});

test('POST /classrooms adds a valid classroom (visible in JSON API)', async (t) => {
  const { base, close } = await startServer();
  t.after(close);

  const res = await fetch(`${base}/classrooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      roomNumber: 'CS-404',
      building: 'Tech Block',
      capacity: '45',
      timeSlot: '10:00-11:30',
    }),
    redirect: 'manual',
  });
  assert.strictEqual(res.status, 302);
  assert.match(res.headers.get('location'), /^\/\?notice=/);

  const apiRes = await fetch(`${base}/api/classrooms`);
  const { classrooms } = await apiRes.json();
  const added = classrooms.find((room) => room.roomNumber === 'CS-404');
  assert.ok(added, 'newly added classroom should appear in the API');
  assert.strictEqual(added.building, 'Tech Block');
  assert.strictEqual(added.capacity, 45);
  assert.strictEqual(added.timeSlot, '10:00-11:30');
  assert.strictEqual(added.availability, 'available');
});

test('POST /classrooms rejects invalid input', async (t) => {
  const { base, close } = await startServer();
  t.after(close);

  const before = await (await fetch(`${base}/api/classrooms`)).json();

  const res = await fetch(`${base}/classrooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      roomNumber: '',
      building: 'Tech Block',
      capacity: 'not-a-number',
      timeSlot: 'morning',
    }),
    redirect: 'manual',
  });
  assert.strictEqual(res.status, 302);
  assert.match(res.headers.get('location'), /error=/);

  const after = await (await fetch(`${base}/api/classrooms`)).json();
  assert.strictEqual(after.classrooms.length, before.classrooms.length, 'no classroom should be stored');
});

test('GET /api/classrooms returns seeded classrooms as JSON', async (t) => {
  const { base, close } = await startServer();
  t.after(close);

  const res = await fetch(`${base}/api/classrooms`);
  assert.strictEqual(res.status, 200);
  const { classrooms } = await res.json();
  assert.ok(Array.isArray(classrooms));
  assert.ok(classrooms.length >= 4);
  for (const room of classrooms) {
    assert.ok('roomNumber' in room && 'building' in room && 'capacity' in room && 'timeSlot' in room && 'availability' in room);
  }
});

test('POST /classrooms/:id/availability updates status and rejects bad input', async (t) => {
  const { base, close } = await startServer();
  t.after(close);

  const okRes = await fetch(`${base}/classrooms/1/availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ availability: 'maintenance' }),
    redirect: 'manual',
  });
  assert.strictEqual(okRes.status, 302);
  assert.match(okRes.headers.get('location'), /notice=/);

  const classrooms = (await (await fetch(`${base}/api/classrooms`)).json()).classrooms;
  assert.strictEqual(classrooms.find((r) => r.id === 1).availability, 'maintenance');

  const badRes = await fetch(`${base}/classrooms/1/availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ availability: 'free-for-all' }),
    redirect: 'manual',
  });
  assert.strictEqual(badRes.status, 302);
  assert.match(badRes.headers.get('location'), /error=/);

  const missingRes = await fetch(`${base}/classrooms/999/availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ availability: 'available' }),
    redirect: 'manual' ,
  });
  assert.strictEqual(missingRes.status, 302);
  assert.match(missingRes.headers.get('location'), /error=/);
});

test('GET / renders the homepage with classrooms and commit footer', async (t) => {
  const { base, close } = await startServer();
  t.after(close);

  const res = await fetch(`${base}/`);
  assert.strictEqual(res.status, 200);
  const html = await res.text();
  assert.match(html, /Classroom Availability Finder/);
  assert.match(html, /CS-301/);
  assert.match(html, /Running commit:/);
});

test('GET /?search= filters classrooms by room number', async (t) => {
  const { base, close } = await startServer();
  t.after(close);

  const res = await fetch(`${base}/?search=CS-301`);
  assert.strictEqual(res.status, 200);
  const html = await res.text();
  assert.match(html, /CS-301/);
  assert.doesNotMatch(html, /Lab-2/);
  assert.match(html, /search-box/);
});

test('GET /?search= filters classrooms by building name', async (t) => {
  const { base, close } = await startServer();
  t.after(close);

  const res = await fetch(`${base}/?search=Tech`);
  assert.strictEqual(res.status, 200);
  const html = await res.text();
  assert.match(html, /CS-301/);
  assert.match(html, /Lab-2/);
  assert.doesNotMatch(html, />101</);
});

test('GET /?search= is case-insensitive', async (t) => {
  const { base, close } = await startServer();
  t.after(close);

  const res = await fetch(`${base}/?search=main`);
  assert.strictEqual(res.status, 200);
  const html = await res.text();
  assert.match(html, /Main Block/);
});

test('GET /?search= shows "no classrooms match" when nothing matches', async (t) => {
  const { base, close } = await startServer();
  t.after(close);

  const res = await fetch(`${base}/?search=NONEXISTENT`);
  assert.strictEqual(res.status, 200);
  const html = await res.text();
  assert.match(html, /No classrooms match/);
});

test('GET /?availability=available filters to available classrooms only', async (t) => {
  const { base, close } = await startServer();
  t.after(close);

  const res = await fetch(`${base}/?availability=available`);
  assert.strictEqual(res.status, 200);
  const html = await res.text();
  assert.match(html, />101</);
  assert.match(html, />CS-301</);
  assert.doesNotMatch(html, />204</);
  assert.doesNotMatch(html, />Lab-2</);
});

test('GET /?availability=occupied filters to occupied classrooms only', async (t) => {
  const { base, close } = await startServer();
  t.after(close);

  const res = await fetch(`${base}/?availability=occupied`);
  assert.strictEqual(res.status, 200);
  const html = await res.text();
  assert.match(html, />204</);
  assert.doesNotMatch(html, />101</);
  assert.doesNotMatch(html, />CS-301</);
  assert.doesNotMatch(html, />Lab-2</);
});

test('GET /?availability=maintenance filters to maintenance classrooms only', async (t) => {
  const { base, close } = await startServer();
  t.after(close);

  const res = await fetch(`${base}/?availability=maintenance`);
  assert.strictEqual(res.status, 200);
  const html = await res.text();
  assert.match(html, />Lab-2</);
  assert.doesNotMatch(html, />101</);
  assert.doesNotMatch(html, />204</);
  assert.doesNotMatch(html, />CS-301</);
});

test('GET / combines availability filter with room/building search', async (t) => {
  const { base, close } = await startServer();
  t.after(close);

  const res = await fetch(`${base}/?search=Tech&availability=available`);
  assert.strictEqual(res.status, 200);
  const html = await res.text();
  assert.match(html, /CS-301/);
  assert.doesNotMatch(html, /Lab-2/);
  assert.doesNotMatch(html, />101</);
  assert.doesNotMatch(html, />204</);
});

test('footer displays RENDER_GIT_COMMIT when set', async (t) => {
  const original = process.env.RENDER_GIT_COMMIT;
  process.env.RENDER_GIT_COMMIT = 'abc1234567890';
  t.after(() => {
    if (original === undefined) {
      delete process.env.RENDER_GIT_COMMIT;
    } else {
      process.env.RENDER_GIT_COMMIT = original;
    }
  });

  const { base, close } = await startServer();
  t.after(close);

  const res = await fetch(`${base}/`);
  const html = await res.text();
  assert.match(html, /Running commit: <code>abc1234<\/code>/);
});

test('footer falls back to "local" when RENDER_GIT_COMMIT is not set', async (t) => {
  const savedRender = process.env.RENDER_GIT_COMMIT;
  const savedGitSha = process.env.GIT_SHA;
  delete process.env.RENDER_GIT_COMMIT;
  delete process.env.GIT_SHA;
  t.after(() => {
    if (savedRender !== undefined) process.env.RENDER_GIT_COMMIT = savedRender;
    if (savedGitSha !== undefined) process.env.GIT_SHA = savedGitSha;
  });

  const { base, close } = await startServer();
  t.after(close);

  const res = await fetch(`${base}/`);
  const html = await res.text();
  assert.match(html, /Running commit: <code>local<\/code>/);
});
