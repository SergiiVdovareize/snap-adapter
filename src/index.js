import { snapsave as save } from 'snapsave-media-downloader';

const PLATFORM_PATTERNS = [
  { pattern: /tiktok\.com/i,                         platform: 'tiktok' },
  { pattern: /instagram\.com|instagr\.am/i,          platform: 'instagram' },
  { pattern: /facebook\.com|fb\.watch|\bfb\.com/i,   platform: 'facebook' },
  { pattern: /twitter\.com|\bx\.com/i,                 platform: 'twitter' },
  { pattern: /youtube\.com|youtu\.be/i,              platform: 'youtube' },
  { pattern: /reddit\.com/i,                         platform: 'reddit' },
  { pattern: /pinterest\.|pin\.it/i,                 platform: 'pinterest' },
  { pattern: /threads\.(net|com)/i,                  platform: 'threads' },
  { pattern: /linkedin\.com|lnkd\.in/i,               platform: 'linkedin' },
  { pattern: /snapchat\.com/i,                       platform: 'snapchat' },
  { pattern: /soundcloud\.com/i,                     platform: 'soundcloud' },
  { pattern: /spotify\.com|spotify\.link/i,          platform: 'spotify' },
  { pattern: /tumblr\.com|tmblr\.co/i,               platform: 'tumblr' },
  { pattern: /douyin\.com/i,                         platform: 'douyin' },
  { pattern: /kuaishou\.com/i,                       platform: 'kuaishou' },
  { pattern: /dailymotion\.com|dai\.ly/i,            platform: 'dailymotion' },
  { pattern: /bsky\.app/i,                           platform: 'bluesky' },
  { pattern: /capcut\.com/i,                         platform: 'capcut' },
  { pattern: /terabox\.com/i,                        platform: 'terabox' },
];

function detectPlatform(url) {
  if (!url) return 'unknown';
  for (const { pattern, platform } of PLATFORM_PATTERNS) {
    if (pattern.test(url)) {
      return platform;
    }
  }
  return 'unknown';
}

function getInfoFromToken(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const token = parsed.searchParams.get('token');
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadBase64 = parts[1];
        const decoded = Buffer.from(payloadBase64, 'base64').toString('utf8');
        return JSON.parse(decoded);
      }
    }
  } catch (e) {
    // Ignore error
  }
  return null;
}

function inferFormat(url, type) {
  if (!url) return null;

  const tokenInfo = getInfoFromToken(url);
  if (tokenInfo && tokenInfo.filename) {
    const extMatch = tokenInfo.filename.toLowerCase().match(/\.([a-z0-9]+)$/);
    if (extMatch && extMatch[1]) {
      const ext = extMatch[1];
      if (['mp4', 'mkv', 'webm', 'avi', 'mov', 'mp3', 'wav', 'aac', 'ogg', 'm4a', 'jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
        return ext === 'jpeg' ? 'jpg' : ext;
      }
    }
  }

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();

    const extMatch = pathname.match(/\.([a-z0-9]+)$/);
    if (extMatch && extMatch[1]) {
      const ext = extMatch[1];
      if (['mp4', 'mkv', 'webm', 'avi', 'mov', 'mp3', 'wav', 'aac', 'ogg', 'm4a', 'jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
        return ext === 'jpeg' ? 'jpg' : ext;
      }
    }
  } catch (e) {
    // Ignore error
  }

  if (type === 'image') return 'jpg';
  if (type === 'video') return 'mp4';
  if (type === 'audio') return 'mp3';
  return null;
}

function getQualityScore(quality) {
  if (!quality) return 0;
  
  const qLower = quality.toLowerCase();
  
  const pMatch = qLower.match(/(\d+)\s*p/);
  if (pMatch) {
    return parseInt(pMatch[1], 10) * 1000;
  }
  
  const xMatch = qLower.match(/(\d+)\s*x\s*(\d+)/);
  if (xMatch) {
    const h = parseInt(xMatch[2], 10);
    return h * 1000;
  }

  const kMatch = qLower.match(/(\d+)\s*k/);
  if (kMatch) {
    return parseInt(kMatch[1], 10);
  }

  if (qLower.includes('original')) return 999999;
  if (qLower.includes('hd')) return 720000;
  if (qLower.includes('sd')) return 360000;
  
  const anyNumMatch = qLower.match(/\d+/);
  if (anyNumMatch) {
    return parseInt(anyNumMatch[0], 10);
  }
  
  return 1;
}

export async function snapsave(url, options) {
  const platform = detectPlatform(url);
  try {
    const rawResult = await save(url, options);
    if (!rawResult.success) {
      return {
        success: false,
        platform,
        title: null,
        description: null,
        thumbnail: null,
        duration: null,
        media: [],
        error: rawResult.message || 'Unknown error'
      };
    }

    const data = rawResult.data || {};
    const rawMedia = data.media || [];
    
    const media = rawMedia.map(item => {
      let type = item.type || 'video';
      const format = inferFormat(item.url, type);
      if (['mp3', 'wav', 'aac', 'ogg', 'm4a'].includes(format)) {
        type = 'audio';
      }
      return {
        type,
        url: item.url || '',
        quality: item.resolution || null,
        format,
        sizeMB: null
      };
    });

    media.sort((a, b) => getQualityScore(b.quality) - getQualityScore(a.quality));

    return {
      success: true,
      platform,
      title: null,
      description: data.description || null,
      thumbnail: data.preview || null,
      duration: null,
      media
    };
  } catch (error) {
    return {
      success: false,
      platform,
      title: null,
      description: null,
      thumbnail: null,
      duration: null,
      media: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export { detectPlatform, getInfoFromToken, inferFormat, getQualityScore };
export default snapsave;
