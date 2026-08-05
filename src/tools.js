// tools.js — 感知层工具：给 agent 主模型做"眼睛"
import { config, sanitizedSummary } from "./config.js";
import { chatCompletions, listModels } from "./zen.js";
import { buildImageContent, buildAudioContent, buildVideoContent, detectKind } from "./media.js";

const DEFAULT_PROMPT = "请客观、完整地描述这段媒体内容（主体、文字、颜色、布局、细节）。";
const call = (content) => chatCompletions({ model: config.multimodalModel, messages: [{ role: "user", content }], temperature: 0.2 });

export async function analyzeImage({ source, prompt }) {
  return call(buildImageContent(source, prompt || DEFAULT_PROMPT));
}

export async function transcribeAudio({ source, prompt }) {
  return call(buildAudioContent(source, prompt || "请完整转写这段音频内容，并附上要点总结。"));
}

export async function analyzeVideo({ source, prompt }) {
  return call(buildVideoContent(source, prompt || "请描述这个视频的内容、场景、主体和动作。"));
}

export async function hybridAnalyze({ source, task, hint }) {
  const kind = detectKind(source, hint);
  const content =
    kind === "image" ? buildImageContent(source, task || DEFAULT_PROMPT) :
    kind === "audio" ? buildAudioContent(source, task || "请完整转写这段音频内容并总结要点。") :
    kind === "video" ? buildVideoContent(source, task || "请描述这个视频的内容、场景、主体和动作。") :
    null;
  if (!content) throw new Error("无法识别媒体类型，请用 hint 参数显式指定 image/audio/video");
  return call(content);
}

export async function zenListModels() {
  const models = await listModels();
  return models.map((m) => `• ${m.id}`).join("\n");
}

export async function zenStatus() {
  const s = sanitizedSummary();
  let api;
  try { await listModels(); api = "✅ API 连通正常"; } catch (e) { api = `❌ ${e.message}`; }
  return [
    `端点：${s.baseUrl}`,
    `Key：${s.apiKeyMasked}（${s.apiKeySet ? "已配置" : "未配置"}）`,
    `模型：${s.multimodalModel}`,
    `上限：${s.maxMediaMb}MB`,
    api,
  ].join("\n");
}
