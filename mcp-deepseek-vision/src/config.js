// config.js — 配置中心：进程环境变量 > .env（自动向上查找）> 默认值
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dirs = [
  path.resolve(here, ".."),
  path.resolve(here, "../.."),
  path.resolve(here, "../../.."),
  path.resolve(here, "../../../.."),
  path.resolve(here, "../../../../.."),
];

// 极简 .env 解析（不覆盖已有进程变量）
for (const dir of dirs) {
  const p = path.join(dir, ".env");
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.trim().match(/^([A-Za-z_]\w*)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  break;
}

const env = (k, fb) => (process.env[k] === undefined || process.env[k] === "" ? fb : process.env[k]);
const clean = (v) => v.replace(/\/+$/, "");

export const config = {
  apiKey: env("OPENCODE_API_KEY", ""),
  baseUrl: clean(env("OPENCODE_BASE_URL", "https://opencode.ai/zen/v1")),
  multimodalBaseUrl: clean(env("MULTIMODAL_BASE_URL", "")),
  textBaseUrl: clean(env("TEXT_BASE_URL", "")),
  multimodalModel: env("MULTIMODAL_MODEL", "mimo-v2.5-free"),
  audioModel: env("AUDIO_MODEL", ""),
  videoModel: env("VIDEO_MODEL", ""),
  textModel: env("TEXT_MODEL", "deepseek-v4-flash-free"),
  maxMediaMb: Number(env("MAX_MEDIA_MB", "20")),
  videoFrames: Number(env("VIDEO_FRAMES", "4")),
  timeoutMs: Number(env("REQUEST_TIMEOUT_MS", "180000")),
  temperature: Number(env("TEMPERATURE", "0.3")),
  maxTokens: Number(env("MAX_TOKENS", "4096")),
};

/** 按角色返回端点：感知/推理可指向不同厂商（OpenAI 兼容） */
export const baseUrlFor = (kind) =>
  (kind === "text" ? config.textBaseUrl : config.multimodalBaseUrl) || config.baseUrl;

/** 按媒体类型返回感知模型 */
export const effectiveModel = (kind) =>
  (kind === "audio" ? config.audioModel : kind === "video" ? config.videoModel : "") || config.multimodalModel;

/** 用于 zen_status 的脱敏配置摘要 */
export function sanitizedSummary() {
  return {
    baseUrl: config.baseUrl,
    multimodalBaseUrl: config.multimodalBaseUrl || null,
    textBaseUrl: config.textBaseUrl || null,
    apiKeySet: Boolean(config.apiKey),
    apiKeyMasked: config.apiKey ? config.apiKey.slice(0, 6) + "…" + config.apiKey.slice(-4) : "(未配置)",
    multimodalModel: config.multimodalModel,
    audioModel: effectiveModel("audio"),
    videoModel: effectiveModel("video"),
    textModel: config.textModel,
    maxMediaMb: config.maxMediaMb,
    videoFrames: config.videoFrames,
  };
}
