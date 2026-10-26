import assert from 'node:assert/strict';
import { test } from 'node:test';
import JSZip from 'jszip';
import { createPhotoZip, fetchPhoto, photoFilename } from '../.test-build/photo_downloads.js';

const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
const jpg = Uint8Array.from([255, 216, 255, 217]);

function useFetch(t, implementation) {
  const original = globalThis.fetch;
  globalThis.fetch = implementation;
  t.after(() => { globalThis.fetch = original; });
}

test('downloads use the same corrected URL as the photo viewer', async (t) => {
  let requested;
  useFetch(t, async (url) => {
    requested = url;
    return new Response(png, { headers: { 'Content-Type': 'image/png' } });
  });
  const source = 'http://localhost:3000/api/v2/uploads/local-mock-view?key=photo.png';
  const result = await fetchPhoto({ url: source }, (url) => url.replace('http://localhost:3000', 'https://thenexopp.com'));
  assert.equal(requested, 'https://thenexopp.com/api/v2/uploads/local-mock-view?key=photo.png');
  assert.deepEqual(new Uint8Array(await result.blob.arrayBuffer()), png);
});

test('an image key is usable when the API does not return a URL', async (t) => {
  let requested;
  useFetch(t, async (url) => {
    requested = url;
    return new Response(png, { headers: { 'Content-Type': 'image/png' } });
  });
  await fetchPhoto({ url: null, imageKey: 'photo.png' }, (key) => `/api/v2/uploads/local-mock-view?key=${key}`);
  assert.equal(requested, '/api/v2/uploads/local-mock-view?key=photo.png');
});

test('single-photo filenames keep the actual response format', async (t) => {
  useFetch(t, async () => new Response(png, { headers: { 'Content-Type': 'image/png' } }));
  const { extension } = await fetchPhoto({ url: '/photo.jpg' });
  assert.equal(photoFilename('Listing_Photo_1.jpg', extension), 'Listing_Photo_1.png');
});

test('the ZIP contains every attached photo with its original bytes and format', async (t) => {
  useFetch(t, async (url) => url === '/first.jpg'
    ? new Response(jpg, { headers: { 'Content-Type': 'image/jpeg' } })
    : new Response(png, { headers: { 'Content-Type': 'image/png' } }));
  const archive = await createPhotoZip([{ url: '/first.jpg', isPrimary: true }, { imageKey: '/second.png' }]);
  const zip = await JSZip.loadAsync(await archive.arrayBuffer());
  assert.deepEqual(Object.keys(zip.files), ['Photo_1_PRIMARY.jpg', 'Photo_2.png']);
  assert.deepEqual(await zip.file('Photo_1_PRIMARY.jpg').async('uint8array'), jpg);
  assert.deepEqual(await zip.file('Photo_2.png').async('uint8array'), png);
});

test('a failed photo prevents a silently incomplete ZIP', async (t) => {
  useFetch(t, async (url) => url === '/first.png'
    ? new Response(png, { headers: { 'Content-Type': 'image/png' } })
    : new Response('Not found', { status: 404 }));
  await assert.rejects(createPhotoZip([{ url: '/first.png' }, { url: '/missing.png' }]), /photo 2 of 2.*No incomplete ZIP was saved/);
});

test('API errors returned with HTTP 200 are not saved as image files', async (t) => {
  useFetch(t, async () => new Response('{"error":"expired link"}', { headers: { 'Content-Type': 'application/json' } }));
  await assert.rejects(fetchPhoto({ url: '/photo.png' }), /did not return an image/);
});

test('missing links and empty image responses produce actionable errors', async (t) => {
  await assert.rejects(createPhotoZip([]), /No photos/);
  await assert.rejects(fetchPhoto({}), /no download link/);
  useFetch(t, async () => new Response('', { headers: { 'Content-Type': 'image/png' } }));
  await assert.rejects(fetchPhoto({ url: '/empty.png' }), /did not return an image/);
});
