// tools.js — 工具实现：感知层（多模态）→ 推理层（DeepSeek）双模型流水线
import { config, effectiveModel, sanitizedSummary, baseUrlFor } from "./config.js";
import { chatCompletions, listModels } from "./zen.js";
import { buildImageContent, buildAudioContent, extractVideoFrames, framesToContent, detectKind } from "./media.js";

const PERCEPT_PROMPT = "请客观、完整地描述这张图片/媒体内容（主体、文字、颜色、布局、细节）。";
const multimodal = (kind, content) =>
  chatCompletions({ model: effectiveModel(kind), messages: [{ role: "user", content }], temperature: 0.2, baseUrl: baseUrlFor("multimodal") });

/** 图像理解 */
export async function analyzeImage({ source, prompt, detail = "auto" }) {
  const res = await multimodal("image", buildImageContent(source, prompt || PERCEPT_PROMPT, detail));
  return { ok: true, text: res.text, usage: res.usage, meta: { model: res.model } };
}

/** 音频转写与理解 */
export async function transcribeAudio({ source, prompt }) {
  const res = await multimodal("audio", buildAudioContent(source, prompt || "请完整转写这段音频内容，并附上要点总结。"));
  return { ok: true, text: res.text, usage: res.usage, meta: { model: res.model } };
}

/** 视频理解：抽帧后交给多模态模型 */
export async function analyzeVideo({ source, prompt, frames }) {
  const count = Math.max(1, Math.min(8, Number(frames) || config.videoFrames));
  const frameUrls = await extractVideoFrames(source, count);
  const res = await multimodal("video", framesToContent(frameUrls, prompt || "请根据这些视频关键帧，描述场景、主体、动作与情节发展。"));
  return { ok: true, text: res.text, usage: res.usage, meta: { model: res.model, frames: frameUrls.length } };
}

/** DeepSeek 纯文本推理：后端大脑 */
export async function deepseekThink({ prompt, system, temperature }) {
  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });
  const res = await chatCompletions({
    model: config.textModel,
    messages,
    temperature: temperature !== undefined ? Number(temperature) : config.temperature,
    baseUrl: baseUrlFor("text"),
  });
  return { ok: true, text: res.text, usage: res.usage, meta: { model: config.textModel } };
}

/** 万能入口：自动识别媒体类型 → 感知 → DeepSeek 推理（纯文本则直接推理） */
export async function hybridAnalyze({ source, task, hint }) {
  const finalTask = task || "请理解并提供完整、准确的分析与回答。";
  let perception = null;
  let perceptionText = "";
  if (source) {
    const kind = detectKind(source, hint);
    const call = kind === "image" ? analyzeImage({ source, prompt: PERCEPT_PROMPT }) : kind === "audio" ? transcribeAudio({ source }) : kind === "video" ? analyzeVideo({ source }) : null;
    if (!call) throw new Error("无法识别媒体类型。请检查文件扩展名，或用 hint 参数显式指定 image/audio/video。");
    const r = await call;
    perception = { kind, model: r.meta.model };
    perceptionText = r.text;
  }
  const brain = await deepseekThink({
    prompt: perception
      ? `【媒体感知结果（${perception.kind}，由 ${perception.model} 提取）】\n\`\`\`\`\n${perceptionText}\n\`\`\`\`\n\n【用户任务】\n${finalTask}\n\n请基于上述感知结果完成用户任务，不要臆造感知文本中不存在的内容。`
      : finalTask,
    system: "你是 DeepSeek 推理大脑。上游已完成多模态感知（图像/音频/视频→文本），请基于感知文本严谨推理与回答。",
  });
  return {
    ok: true,
    text: brain.text,
    usage: brain.usage,
    meta: { pipeline: perception ? ["multimodal-perception", "deepseek-reason"] : ["deepseek-reason"], perception, brain: { model: brain.meta.model } },
  };
}

/* ---------------- 系统工具 ---------------- */

/** 列出可用模型 */
export async function zenListModels() {
  const models = await listModels(baseUrlFor("multimodal"));
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
    const models = await listModels(baseUrlFor("multimodal"));
    connectivity = `✅ API 连通正常（可用模型 ${models.length} 个）`;
  } catch (err) {
    connectivity = `❌ API 连通失败：${err.message}`;
  }
  const lines = [
    `Base URL：${summary.baseUrl}`,
    summary.multimodalBaseUrl ? `感知层端点：${summary.multimodalBaseUrl}` : null,
    summary.textBaseUrl ? `推理层端点：${summary.textBaseUrl}` : null,
    `API Key：${summary.apiKeyMasked}（${summary.apiKeySet ? "已配置" : "未配置"}）`,
    `感知层（多模态）：${summary.multimodalModel}`,
    `  音频：${summary.audioModel}`,
    `  视频：${summary.videoModel}`,
    `推理层（DeepSeek）：${summary.textModel}`,
    `媒体上限：${summary.maxMediaMb}MB | 视频抽帧：${summary.videoFrames} 张`,
    connectivity,
  ].filter(Boolean);
  return { ok: true, text: lines.join("\n"), meta: { ...summary, connectivity: connectivity.startsWith("✅") } };
}
