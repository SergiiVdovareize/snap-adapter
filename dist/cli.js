import { snapsave } from './index.js';
const url = process.argv[2];
if (!url) {
    console.error('Usage: npm run call -- <url>');
    process.exit(1);
}
(async () => {
    try {
        const res = await snapsave(url);
        console.log(JSON.stringify(res, null, 2));
    }
    catch (err) {
        console.error(err instanceof Error ? err.message : err);
        process.exit(1);
    }
})();
