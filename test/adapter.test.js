import test from 'node:test';
import assert from 'node:assert';
import {
  detectPlatform,
  getQualityScore,
  getInfoFromToken,
  inferFormat
} from '../src/index.js';

test('detectPlatform detects supported platforms correctly', () => {
  const testCases = [
    { url: 'https://www.tiktok.com/@user/video/123456789', expected: 'tiktok' },
    { url: 'https://instagram.com/p/C51YHfWJwHK/', expected: 'instagram' },
    { url: 'https://instagr.am/reel/xyz', expected: 'instagram' },
    { url: 'https://facebook.com/watch/?v=123456', expected: 'facebook' },
    { url: 'https://fb.watch/abcd/', expected: 'facebook' },
    { url: 'https://fb.com/groups/xyz/posts/123', expected: 'facebook' },
    { url: 'https://twitter.com/user/status/123456', expected: 'twitter' },
    { url: 'https://x.com/user/status/123456', expected: 'twitter' },
    { url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', expected: 'youtube' },
    { url: 'https://youtu.be/dQw4w9WgXcQ', expected: 'youtube' },
    { url: 'https://reddit.com/r/pics/comments/xyz/', expected: 'reddit' },
    { url: 'https://pinterest.com/pin/123/', expected: 'pinterest' },
    { url: 'https://pin.it/abcd', expected: 'pinterest' },
    { url: 'https://threads.net/@user/post/123', expected: 'threads' },
    { url: 'https://threads.com/post/123', expected: 'threads' },
    { url: 'https://linkedin.com/feed/', expected: 'linkedin' },
    { url: 'https://lnkd.in/abc', expected: 'linkedin' },
    { url: 'https://snapchat.com/add/user', expected: 'snapchat' },
    { url: 'https://soundcloud.com/artist/track', expected: 'soundcloud' },
    { url: 'https://spotify.com/track/123', expected: 'spotify' },
    { url: 'https://spotify.link/abc', expected: 'spotify' },
    { url: 'https://tumblr.com/blog/post', expected: 'tumblr' },
    { url: 'https://tmblr.co/abc', expected: 'tumblr' },
    { url: 'https://douyin.com/video/123', expected: 'douyin' },
    { url: 'https://kuaishou.com/short-video/123', expected: 'kuaishou' },
    { url: 'https://dailymotion.com/video/abc', expected: 'dailymotion' },
    { url: 'https://dai.ly/abc', expected: 'dailymotion' },
    { url: 'https://bsky.app/profile/user', expected: 'bluesky' },
    { url: 'https://capcut.com/template/123', expected: 'capcut' },
    { url: 'https://terabox.com/s/123', expected: 'terabox' },
    { url: 'https://unknown-platform.com/xyz', expected: 'unknown' },
    { url: '', expected: 'unknown' },
    { url: null, expected: 'unknown' },
  ];

  for (const { url, expected } of testCases) {
    assert.strictEqual(detectPlatform(url), expected, `Failed for ${url}`);
  }
});

test('getQualityScore scores qualities correctly', () => {
  assert.strictEqual(getQualityScore('1080p'), 1080000);
  assert.strictEqual(getQualityScore('720p (HD)'), 720000);
  assert.strictEqual(getQualityScore('360p (SD)'), 360000);
  assert.strictEqual(getQualityScore('1080x720'), 720000);
  assert.strictEqual(getQualityScore('320kbps'), 320);
  assert.strictEqual(getQualityScore('128kbps'), 128);
  assert.strictEqual(getQualityScore('original'), 999999);
  assert.strictEqual(getQualityScore('HD'), 720000);
  assert.strictEqual(getQualityScore('SD'), 360000);
  assert.strictEqual(getQualityScore(null), 0);
  assert.strictEqual(getQualityScore(''), 0);
  assert.strictEqual(getQualityScore('unknown-quality'), 1);
});

test('getInfoFromToken decodes JWT payload successfully', () => {
  // Construct a valid base64url payload
  const payloadObj = { filename: 'test-video.mp4', size: 12345 };
  const headerB64 = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payloadB64 = Buffer.from(JSON.stringify(payloadObj)).toString('base64');
  const signature = 'sig';
  const token = `${headerB64}.${payloadB64}.${signature}`;
  
  const url = `https://d.rapidcdn.app/v2?token=${token}`;
  
  const info = getInfoFromToken(url);
  assert.deepStrictEqual(info, payloadObj);
  
  // Non-JWT token
  assert.strictEqual(getInfoFromToken('https://d.rapidcdn.app/v2?token=invalid'), null);
  // No token
  assert.strictEqual(getInfoFromToken('https://d.rapidcdn.app/v2'), null);
});

test('inferFormat infers extension correctly', () => {
  // 1. From JWT filename
  const payloadObj = { filename: 'some-file.mp3' };
  const headerB64 = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64');
  const payloadB64 = Buffer.from(JSON.stringify(payloadObj)).toString('base64');
  const token = `${headerB64}.${payloadB64}.sig`;
  const urlWithToken = `https://d.rapidcdn.app/v2?token=${token}`;
  assert.strictEqual(inferFormat(urlWithToken, 'video'), 'mp3');

  // 2. From URL path
  assert.strictEqual(inferFormat('https://example.com/media/image.png', 'image'), 'png');
  assert.strictEqual(inferFormat('https://example.com/media/video.webm', 'video'), 'webm');
  
  // 3. Fallback based on type
  assert.strictEqual(inferFormat('https://example.com/media/no-extension', 'image'), 'jpg');
  assert.strictEqual(inferFormat('https://example.com/media/no-extension', 'video'), 'mp4');
  assert.strictEqual(inferFormat('https://example.com/media/no-extension', 'audio'), 'mp3');
  assert.strictEqual(inferFormat('https://example.com/media/no-extension', 'unknown'), null);
});
