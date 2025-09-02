export const ALLOWED_HOSTS = new Set([
  "tracker.myanonamouse.net",
  "myanonamouse.net",
  "www.myanonamouse.net",
  "prowlarr.local",
  "readarr.local", 
  "qbittorrent.local",
  "localhost",
  "127.0.0.1",
  "::1"
]);

export const hostAllowed = (url: string): boolean => {
  try { 
    const parsedUrl = new URL(url);
    return ALLOWED_HOSTS.has(parsedUrl.hostname);
  } catch { 
    return false; 
  }
};
