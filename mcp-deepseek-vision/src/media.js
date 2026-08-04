// media.js — 媒体处理：MIME 探测 / base64 编码 / 视频抽帧（ffmpeg）
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { config } from "./config.js";

const execFileP = promisify(execFile);
const isUrl = (s) => /^https?:\/\//i.test(s);
const extMime = (ext) =>
  ({
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
    ".webp": "image/webp", ".bmp": "image/bmp", ".svg": "image/svg+xml", ".heic": "image/heic", ".tiff": "image/tiff",
    ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4", ".aac": "audio/aac",
    ".ogg": "audio/ogg", ".flac": "audio/flac", ".opus": "audio/opus",
    ".mp4": "video/mp4", ".mov": "video/quicktime", ".avi": "video/x-msvideo", ".mkv": "video/x-matroska",
    ".webm": "video/webm", ".m4v": "video/x-m4v", ".ts": "video/mp2t",
  })[ext.toLowerCase()] || "application/octet-stream";

/** 识别媒体类型："image" | "audio" | "video" | "unknown"（hint 优先） */
export function detectKind(source, hint) {
  if (hint && ["image", "audio", "video", "text"].includes(hint)) return hint;
  if (!isUrl(source)) {
    const mime = extMime(path.extname(source));
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("audio/")) return "audio";
    if (mime.startsWith("video/")) return "video";
    return "unknown";
  }
  if (/^data:(image|audio|video)\//.test(source)) return source.split("/")[0].slice(5);
  const lower = source.toLowerCase();
  if (/\.(png|jpe?g|gif|webp|bmp|svg|heic|tiff)(\?|$)/.test(lower)) return "image";
  if (/\.(mp3|wav|m4a|aac|ogg|flac|opus)(\?|$)/.test(lower)) return "audio";
  if (/\.(mp4|mov|avi|mkv|webm|m4v)(\?|$)/.test(lower)) return "video";
  return "unknown";
}

/** 本地文件 → { mime, sizeMb, dataUrl }（校验存在与大小） */
export function fileToDataUrl(file) {
  if (!fs.existsSync(file)) throw new Error(`文件不存在：${file}`);
  const sizeMb = fs.statSync(file).size / 1024 / 1024;
  if (sizeMb > config.maxMediaMb) throw new Error(`文件过大：${sizeMb.toFixed(1)}MB > 上限 ${config.maxMediaMb}MB`);
  const mime = extMime(path.extname(file));
  return { mime, sizeMb, dataUrl: `data:${mime};base64,${fs.readFileSync(file).toString("base64")}` };
}

/** 图像内容块：本地→base64，URL→直传 */
export function buildImageContent(source, prompt, detail = "auto") {
  const block = isUrl(source) ? { url: source, detail } : { url: fileToDataUrl(source).dataUrl, detail };
  return [{ type: "text", text: prompt }, { type: "image_url", image_url: block }];
}

/** 音频内容块：仅本地文件（input_audio 格式） */
export function buildAudioContent(source, prompt) {
  if (isUrl(source)) throw new Error("音频暂不支持远程 URL，请提供本地文件路径");
  const { mime, dataUrl } = fileToDataUrl(source);
  return [
    { type: "text", text: prompt },
    { type: "input_audio", input_audio: { data: dataUrl.replace(/^data:[^;]+;base64,/, ""), format: mime.replace("audio/", "").split("+")[0] } },
  ];
}

/** 检查 ffmpeg 是否可用 */
async function hasFfmpeg() {
  try { await execFileP("ffmpeg", ["-version"], { timeout: 5000 }); return true; } catch { return false; }
}

/** 视频抽帧（1fps 采样，最多 frames 张，宽 960）→ 图像 data URL 数组 */
export async function extractVideoFrames(file, frames = config.videoFrames) {
  if (isUrl(file)) throw new Error("视频请提供本地文件路径（远程 URL 暂不支持，可先下载）");
  if (!fs.existsSync(file)) throw new Error(`文件不存在：${file}`);
  if (!(await hasFfmpeg())) {
    throw new Error("解析视频需要 ffmpeg，请先安装并加入 PATH（https://ffmpeg.org），或改用 analyze_image 逐帧分析");
  }
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "dv-frames-"));
  try {
    await execFileP("ffmpeg", ["-y", "-i", file, "-vf", "fps=1,scale=960:-2", "-frames:v", String(frames), "-q:v", "3", path.join(tmpDir, "f-%02d.jpg")], { timeout: 120000 });
    const names = fs.readdirSync(tmpDir).filter((n) => n.endsWith(".jpg")).sort();
    if (!names.length) throw new Error("未能从视频中抽取任何帧");
    return names.map((n) => `data:image/jpeg;base64,${fs.readFileSync(path.join(tmpDir, n)).toString("base64")}`);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

/** 多帧图像 → 内容块 */
export function framesToContent(frames, prompt) {
  return [{ type: "text", text: prompt }, ...frames.map((url) => ({ type: "image_url", image_url: { url } }))];
}
