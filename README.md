# snapsave-adapter

A robust ESM and CommonJS adapter wrapper around [snapsave-media-downloader](https://github.com/ahmedrangel/snapsave-media-downloader) (created by [ahmedrangel](https://github.com/ahmedrangel)) that standardizes media downloader results into a normalized format.

## Features

- Standardizes responses into a single structured format (`DownloadResult`).
- Automatically detects the source platform (Instagram, TikTok, YouTube, Threads, Facebook, X/Twitter, Reddit, Pinterest, Snapchat, etc.).
- Extracts file formats directly from JWT token payload filenames or path extensions, falling back gracefully based on media type.
- Automatically scores and sorts extracted media items by quality descending.
- Works out-of-the-box with Node's native test runner.

---

## Output Format

The adapter maps and returns results matching the following structures:

```typescript
interface AdaptedMediaItem {
  type: 'video' | 'audio' | 'image';
  url: string;                 // direct download URL
  quality: string | null;      // label (e.g. '1080p', '128kbps', 'original')
  format: string | null;       // normalized lowercase format (e.g. 'mp4', 'mp3', 'jpg')
  sizeMB?: number | null;      // estimated file size in MB if available
}

interface DownloadResult {
  success: boolean;            // true if the download succeeded, false otherwise
  platform: string;            // the detected platform name (e.g., 'youtube', 'tiktok', etc.) or 'unknown'
  title: string | null;        // post / media title
  description: string | null;  // post description or caption
  thumbnail: string | null;    // video thumbnail / image preview url
  duration: string | number | null; // duration if available
  media: AdaptedMediaItem[];   // list of extracted media items, sorted descending by quality
  error?: string;              // details of the error if success is false
}
```

---

## Usage

### ES Modules (ESM)

```javascript
import { snapsave } from 'snapsave-adapter';

const result = await snapsave('https://www.instagram.com/p/C51YHfWJwHK/');
console.log(result);
```

### CommonJS (CJS)

```javascript
const snapsave = require('snapsave-adapter');

(async () => {
  const result = await snapsave('https://www.instagram.com/p/C51YHfWJwHK/');
  console.log(result);
})();
```

### Command Line Interface (CLI)

You can call the adapter directly via CLI:

```bash
npm run call -- "https://www.instagram.com/p/C51YHfWJwHK/"
```

---

## Testing

Run unit tests via Node's built-in test runner:

```bash
npm test
```
