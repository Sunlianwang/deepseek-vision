// config.js — 配置中心：只从 process.env 读取
// API key 和模型通过客户端配置的 "env" 字段传入，不需要 .env 文件
const env = (k, fb) => (process.env[k] === undefined || process.env[k] === "" ? fb : process.env[k]);
const clean = (v) => v.replace(/\/+$/, "");

export const config = {
  apiKey: env("OPENCODE_API_KEY", ""),
  baseUrl: clean(env("OPENCODE_BASE_URL", "https://open.bigmodel.cn/api/paas/v4")),
  multimodalModel: env("MULTIMODAL_MODEL", "glm-4.6v-flash"),
  maxMediaMb: Number(env("MAX_MEDIA_MB", "20")),
  timeoutMs: Number(env("REQUEST_TIMEOUT_MS", "30000")),
};

export function sanitizedSummary() {
  return {
    baseUrl: config.baseUrl,
    apiKeySet: Boolean(config.apiKey),
    apiKeyMasked: config.apiKey ? config.apiKey.slice(0, 6) + "…" + config.apiKey.slice(-4) : "(未配置)",
    multimodalModel: config.multimodalModel,
    maxMediaMb: config.maxMediaMb,
  };
}
