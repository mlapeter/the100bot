// Tags the100.io links the bot posts into Discord, so the site's funnel
// tracking counts a click as source "discord" (Discord's desktop app usually
// sends no referrer, so untagged clicks look "direct"). Mirrors pwntastic's
// app/models/discord_utm.rb:
//
//   utm_source=discord & utm_medium=bot & utm_campaign=<link kind>
//
// Keeps any existing query string, never overrides a utm_* already there, and
// returns anything that isn't an http(s) URL unchanged.
const tagUrl = (url, campaign) => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return url;

    const tags = { utm_source: "discord", utm_medium: "bot", utm_campaign: campaign };
    for (const [key, value] of Object.entries(tags)) {
      if (value && !parsed.searchParams.has(key)) parsed.searchParams.set(key, value);
    }
    return parsed.toString();
  } catch (e) {
    return url;
  }
};

// The site's base URL (THE100_BASE_URL, no trailing slash on Heroku) joined to
// a path with exactly one slash, then tagged.
const siteUrl = (path, campaign) => {
  const base = (process.env.THE100_BASE_URL || "https://www.the100.io/").replace(/\/+$/, "");
  const suffix = path ? `/${String(path).replace(/^\/+/, "")}` : "/";
  return tagUrl(`${base}${suffix}`, campaign);
};

module.exports = { tagUrl, siteUrl };
