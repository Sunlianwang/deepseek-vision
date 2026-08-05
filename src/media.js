// media.js — 媒体处理：MIME 探测 / base64 编码
import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";

const isUrl = (s) => /^https?:\/\//i.test(s);
const extMime = (ext) =>
  ({
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
    ".webp": "image/webp", ".bmp": "image/bmp", ".svg": "image/svg+xml",
    ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4", ".aac": "audio/aac",
    ".ogg": "audio/ogg", ".flac": "audio/flac", ".opus": "audio/opus",
    ".mp4": "video/mp4", ".mov": "video/quicktime", ".avi": "video/x-msvideo", ".mkv": "video/x-matroska",
    ".webm": "video/webm", ".m4v": "video/x-m4v",
  })[ext.toLowerCase()] || "application/octet-stream";

/** 识别媒体类型 */
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
  if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/.test(lower)) return "image";
  if (/\.(mp3|wav|m4a|aac|ogg|flac|opus)(\?|$)/.test(lower)) return "audio";
  if (/\.(mp4|mov|avi|mkv|webm|m4v)(\?|$)/.test(lower)) return "video";
  return "unknown";
}

/** 本地文件 → { mime, sizeMb, dataUrl } */
function fileToDataUrl(file) {
  if (!fs.existsSync(file)) throw new Error(`文件不存在：${file}`);
  const sizeMb = fs.statSync(file).size / 1024 / 1024;
  if (sizeMb > config.maxMediaMb) throw new Error(`文件过大：${sizeMb.toFixed(1)}MB > 上限 ${config.maxMediaMb}MB`);
  const mime = extMime(path.extname(file));
  return { mime, sizeMb, dataUrl: `data:${mime};base64,${fs.readFileSync(file).toString("base64")}` };
}

/** 构建内容块：URL 直传，本地文件转 base64 */
function sourceToUrl(source) {
  if (isUrl(source)) return source;
  return fileToDataUrl(source).dataUrl;
}

/** 图像内容块 */
export function buildImageContent(source, prompt) {
  return [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: sourceToUrl(source) } }];
}

/** 音频内容块 */
export function buildAudioContent(source, prompt) {
  if (isUrl(source)) throw new Error("音频暂不支持远程 URL，请提供本地文件路径");
  const { mime, dataUrl } = fileToDataUrl(source);
  return [
    { type: "text", text: prompt },
    { type: "input_audio", input_audio: { data: dataUrl.replace(/^data:[^;]+;base64,/, ""), format: mime.replace("audio/", "").split("+")[0] } },
  ];
}

/** 视频内容块：直接传 URL 或 base64，不需要抽帧 */
export function buildVideoContent(source, prompt) {
  return [{ type: "text", text: prompt }, { type: "video_url", video_url: { url: sourceToUrl(source) } }];
}
