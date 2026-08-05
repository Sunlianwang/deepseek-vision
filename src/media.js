// media.js — 图片处理
import { readFileSync, existsSync } from "node:fs";
import { extname } from "node:path";

const MIME = { ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".gif":"image/gif", ".webp":"image/webp", ".bmp":"image/bmp" };

export function toDataUrl(file) {
  if (!existsSync(file)) throw new Error("文件不存在: " + file);
  const ext = extname(file).toLowerCase();
  const mime = MIME[ext] || "image/png";
  return `data:${mime};base64,${readFileSync(file).toString("base64")}`;
}

export function toUrl(source) {
  return /^https?:\/\//i.test(source) || /^data:/.test(source) ? source : toDataUrl(source);
}

export function imageContent(source, prompt) {
  return [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: toUrl(source) } }];
}
