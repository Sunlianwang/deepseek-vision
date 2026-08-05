// config.js — 配置中心
const env = (k, fb) => (process.env[k] === undefined || process.env[k] === "" ? fb : process.env[k]);

export const config = {
  apiKey: env("VISION_API_KEY", ""),
  baseUrl: env("VISION_BASE_URL", "https://open.bigmodel.cn/api/paas/v4"),
  model: env("VISION_MODEL", "glm-4.6v-flash"),
  screenshotDir: env("VISION_SCREENSHOT_DIR", String.raw`C:\Users\Administrator\Pictures\Screenshots`),
  timeoutMs: Number(env("VISION_TIMEOUT_MS", "30000")),
};

export const summary = () => ({
  baseUrl: config.baseUrl,
  model: config.model,
  apiKeyMasked: config.apiKey ? config.apiKey.slice(0, 6) + "…" + config.apiKey.slice(-4) : "(未配置)",
  screenshotDir: config.screenshotDir,
});
