// config.js — 配置中心：只从 process.env 读取
// API key 通过客户端配置的 "env" 字段传入，不需要 .env 文件
// 例如 VS Code mcp.json: { "env": { "OPENCODE_API_KEY": "sk-xxx" } }
const env = (k, fb) => (process.env[k] === undefined || process.env[k] === "" ? fb : process.env[k]);
const clean = (v) => v.replace(/\/+$/, "");

// 本 MCP 只做"眼睛"（多模态感知），推理由 agent 客户端自己的主模型完成
export const config = {
  /** opencode zen API key（必填，通过客户端 env 传入） */
  apiKey: env("OPENCODE_API_KEY", ""),
  /** opencode zen 端点（感知层专用，OpenAI 兼容） */
  baseUrl: clean(env("OPENCODE_BASE_URL", "https://opencode.ai/zen/v1")),
  /** 感知层：免费多模态模型（给纯文本主模型做眼睛） */
  multimodalModel: env("MULTIMODAL_MODEL", "mimo-v2.5-free"),
  audioModel: env("AUDIO_MODEL", ""),
  videoModel: env("VIDEO_MODEL", ""),
  maxMediaMb: Number(env("MAX_MEDIA_MB", "20")),
  videoFrames: Number(env("VIDEO_FRAMES", "4")),
  timeoutMs: Number(env("REQUEST_TIMEOUT_MS", "180000")),
};

/** 按媒体类型返回感知模型 */
export const effectiveModel = (kind) =>
  (kind === "audio" ? config.audioModel : kind === "video" ? config.videoModel : "") || config.multimodalModel;

/** 用于 zen_status 的脱敏配置摘要 */
export function sanitizedSummary() {
  return {
    baseUrl: config.baseUrl,
    apiKeySet: Boolean(config.apiKey),
    apiKeyMasked: config.apiKey ? config.apiKey.slice(0, 6) + "…" + config.apiKey.slice(-4) : "(未配置)",
    multimodalModel: config.multimodalModel,
    audioModel: effectiveModel("audio"),
    videoModel: effectiveModel("video"),
    maxMediaMb: config.maxMediaMb,
    videoFrames: config.videoFrames,
  };
}
