// config.js — 配置中心
// 优先级：环境变量 > 全局配置(~/.deepseek-vision/.env) > 项目级 .env（向上查找5级）> 默认值
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const home = os.homedir();

/** 极简 .env 解析（不覆盖已有进程变量） */
function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const m = line.trim().match(/^([A-Za-z_]\w*)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

// 按优先级加载 .env（环境变量始终最高优先，不被覆盖）
const globalDir = path.join(home, ".deepseek-vision");
loadDotEnv(path.join(globalDir, ".env"));                   // 全局配置

const projectDirs = [                                       // 项目级配置（向上查找5级）
  path.resolve(here, ".."),
  path.resolve(here, "../.."),
  path.resolve(here, "../../.."),
  path.resolve(here, "../../../.."),
  path.resolve(here, "../../../../.."),
];
for (const dir of projectDirs) {
  const p = path.join(dir, ".env");
  if (fs.existsSync(p)) { loadDotEnv(p); break; }
}

const env = (k, fb) => (process.env[k] === undefined || process.env[k] === "" ? fb : process.env[k]);
const clean = (v) => v.replace(/\/+$/, "");

// 本 MCP 只做"眼睛"（多模态感知），推理由 agent 客户端自己的主模型完成
export const config = {
  /** opencode zen API key（必填，用户自己的） */
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
  /** 全局配置目录路径（供外部脚本使用） */
  globalDir,
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
    globalDir: config.globalDir,
    multimodalModel: config.multimodalModel,
    audioModel: effectiveModel("audio"),
    videoModel: effectiveModel("video"),
    maxMediaMb: config.maxMediaMb,
    videoFrames: config.videoFrames,
  };
}
