// media.js — 媒体处理
import { readFileSync, existsSync } from "node:fs";
import { extname } from "node:path";

const MIME = { ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".gif":"image/gif", ".webp":"image/webp", ".bmp":"image/bmp", ".mp3":"audio/mpeg", ".wav":"audio/wav", ".m4a":"audio/mp4", ".mp4":"video/mp4", ".mov":"video/quicktime", ".webm":"video/webm" };

export function detectKind(source) {
  if (/^https?:\/\//i.test(source)) {
    const l = source.toLowerCase();
    if (/\.(mp3|wav|m4a|aac|ogg|flac)/.test(l)) return "audio";
    if (/\.(mp4|mov|avi|mkv|webm|m4v)/.test(l)) return "video";
    return "image";
  }
  if (/^data:(image|audio|video)\//.test(source)) return source.split("/")[0].slice(5);
  const mime = MIME[extname(source).toLowerCase()];
  if (mime?.startsWith("audio/")) return "audio";
  if (mime?.startsWith("video/")) return "video";
  return "image";
}

export function toDataUrl(file) {
  if (!existsSync(file)) throw new Error("文件不存在: " + file);
  const ext = extname(file).toLowerCase();
  const mime = MIME[ext] || "application/octet-stream";
  return `data:${mime};base64,${readFileSync(file).toString("base64")}`;
}

export function toUrl(source) {
  return /^https?:\/\//i.test(source) || /^data:/.test(source) ? source : toDataUrl(source);
}

export function imageContent(source, prompt) {
  return [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: toUrl(source) } }];
}

export function videoContent(source, prompt) {
  return [{ type: "text", text: prompt }, { type: "video_url", video_url: { url: toUrl(source) } }];
}

export function audioContent(source, prompt) {
  if (/^https?:\/\//i.test(source)) throw new Error("音频暂不支持远程 URL");
  const { mime, dataUrl } = (() => {
    if (!existsSync(source)) throw new Error("文件不存在: " + source);
    const ext = extname(source).toLowerCase();
    const m = MIME[ext] || "audio/mpeg";
    return { mime: m, dataUrl: `data:${m};base64,${readFileSync(source).toString("base64")}` };
  })();
  return [
    { type: "text", text: prompt },
    { type: "input_audio", input_audio: { data: dataUrl.replace(/^data:[^;]+;base64,/, ""), format: mime.replace("audio/", "").split("+")[0] } },
  ];
}
