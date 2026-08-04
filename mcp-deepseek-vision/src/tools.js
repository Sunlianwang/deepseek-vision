// tools.js — 感知层工具：给 agent 主模型（纯文本）做"眼睛"
// 感知结果以纯文本返回，由 agent 客户端自己的主模型完成推理回答
import { config, effectiveModel, sanitizedSummary } from "./config.js";
import { chatCompletions, listModels } from "./zen.js";
import { buildImageContent, buildAudioContent, extractVideoFrames, framesToContent, detectKind } from "./media.js";

const PERCEPT_PROMPT = "请客观、完整地描述这段媒体内容（主体、文字、颜色、布局、细节），确保信息可被后续推理直接使用。";
const multimodal = (kind, content) =>
  chatCompletions({ model: effectiveModel(kind), messages: [{ role: "user", content }], temperature: 0.2 });

/** 图像感知（眼睛） */
export async function analyzeImage({ source, prompt, detail = "auto" }) {
  const res = await multimodal("image", buildImageContent(source, prompt || PERCEPT_PROMPT, detail));
  return { ok: true, text: res.text, usage: res.usage, meta: { model: res.model } };
}

/** 音频转写感知 */
export async function transcribeAudio({ source, prompt }) {
  const res = await multimodal("audio", buildAudioContent(source, prompt || "请完整转写这段音频内容，并附上要点总结。"));
  return { ok: true, text: res.text, usage: res.usage, meta: { model: res.model } };
}

/** 视频感知：抽帧后交给多模态模型 */
export async function analyzeVideo({ source, prompt, frames }) {
  const count = Math.max(1, Math.min(8, Number(frames) || config.videoFrames));
  const frameUrls = await extractVideoFrames(source, count);
  const res = await multimodal("video", framesToContent(frameUrls, prompt || "请根据这些视频关键帧，描述场景、主体、动作与情节发展。"));
  return { ok: true, text: res.text, usage: res.usage, meta: { model: res.model, frames: frameUrls.length } };
}

/** 万能入口：自动识别媒体类型 → 感知 → 返回感知文本（推理由 agent 主模型完成） */
export async function hybridAnalyze({ source, task, hint }) {
  const focus = task ? `【用户关注点】${task}\n\n` : "";
  const prompt = focus + PERCEPT_PROMPT;
  const kind = detectKind(source, hint);
  const call =
    kind === "image" ? analyzeImage({ source, prompt })
    : kind === "audio" ? transcribeAudio({ source, prompt })
    : kind === "video" ? analyzeVideo({ source, prompt })
    : null;
  if (!call) throw new Error("无法识别媒体类型。请检查文件扩展名，或用 hint 参数显式指定 image/audio/video。");
  const r = await call;
  return {
    ok: true,
    text: r.text,
    usage: r.usage,
    meta: { kind, model: r.meta.model, note: "以上为多模态感知结果（mimo-v2.5-free），请作为上下文由主模型完成推理回答" },
  };
}

/* ---------------- 系统工具 ---------------- */

/** 列出用户 opencode zen 账号可用的模型 */
export async function zenListModels() {
  const models = await listModels();
  return {
    ok: true,
    text: models.map((m) => `• ${m.id}${m.name && m.name !== m.id ? `（${m.name}）` : ""}${m.ownedBy ? `  [${m.ownedBy}]` : ""}`).join("\n"),
    meta: { count: models.length },
  };
}

/** 配置与连通性自检 */
export async function zenStatus() {
  const summary = sanitizedSummary();
  let connectivity;
  try {
    const models = await listModels();
    connectivity = `✅ API 连通正常（可用模型 ${models.length} 个）`;
  } catch (err) {
    connectivity = `❌ API 连通失败：${err.message}`;
  }
  const lines = [
    `感知端点（zen）：${summary.baseUrl}`,
    `API Key：${summary.apiKeyMasked}（${summary.apiKeySet ? "已配置" : "未配置"}）`,
    `配置来源：全局 ${summary.globalDir}/.env 或项目 .env`,
    `感知模型（多模态）：${summary.multimodalModel}`,
    `  音频：${summary.audioModel}`,
    `  视频：${summary.videoModel}`,
    `媒体上限：${summary.maxMediaMb}MB | 视频抽帧：${summary.videoFrames} 张`,
    `推理：由 agent 客户端主模型完成（本 MCP 仅做感知）`,
    connectivity,
  ].filter(Boolean);
  return { ok: true, text: lines.join("\n"), meta: { ...summary, connectivity: connectivity.startsWith("✅") } };
}
