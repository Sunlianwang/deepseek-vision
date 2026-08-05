// tools.js — 感知层工具
import { config } from "./config.js";
import { chat } from "./zen.js";
import { imageContent, videoContent, audioContent, detectKind, toUrl } from "./media.js";
import { screenshot, listWindows, fileExists, filePath } from "./platform.js";

const DEFAULT_PROMPT = "请客观、完整地描述这段媒体内容（主体、文字、颜色、布局、细节）。";
const t0 = () => performance.now();
const ms = (t) => Math.round(performance.now() - t);

export async function analyzeImage({ source, prompt }) {
  const t = t0();
  const text = await chat(config.model, imageContent(source, prompt || DEFAULT_PROMPT));
  return { text: `⏱ ${ms(t)}ms | 📝 ${text}` };
}

export async function transcribeAudio({ source, prompt }) {
  const t = t0();
  const text = await chat(config.model, audioContent(source, prompt || "请完整转写这段音频并总结要点。"));
  return { text: `⏱ ${ms(t)}ms | 📝 ${text}` };
}

export async function analyzeVideo({ source, prompt }) {
  const t = t0();
  const text = await chat(config.model, videoContent(source, prompt || "请描述这个视频的内容和场景。"));
  return { text: `⏱ ${ms(t)}ms | 📝 ${text}` };
}

export async function hybridAnalyze({ source, task }) {
  const kind = detectKind(source);
  const prompt = task || DEFAULT_PROMPT;
  const content =
    kind === "image" ? imageContent(source, prompt) :
    kind === "audio" ? audioContent(source, prompt) :
    kind === "video" ? videoContent(source, prompt) :
    null;
  if (!content) throw new Error("无法识别媒体类型");
  const t = t0();
  const text = await chat(config.model, content);
  return { text: `⏱ ${ms(t)}ms | 模型: ${config.model} | 📝 ${text}` };
}

export async function describeScreen({ mode = "primary", window: win, prompt }) {
  const t = t0();
  const fp = screenshot(mode, win);
  const capTime = ms(t);
  const scope = mode === "window" ? `窗口 "${win}"` : mode === "full" ? "全部显示器" : "主屏幕";
  const defaultPrompt = `请详细描述这张截图中的所有内容（截图范围：${scope}）。包括：打开的窗口、可见文字、图标、任务栏状态、错误提示等。`;
  const t2 = t0();
  const text = await chat(config.model, imageContent(fp, prompt || defaultPrompt));
  return { text: `📸 ${scope} | ${fp}\n⏱ 截屏: ${capTime}ms | 分析: ${ms(t2)}ms | 总计: ${ms(t)}ms\n\n📝 ${text}` };
}

export async function takeScreenshot({ mode = "primary", window: win, filename }) {
  const t = t0();
  const fp = screenshot(mode, win, filename);
  const size = (await import("node:fs")).readFileSync(fp).length;
  return { text: `✅ 截图已保存\n路径: ${fp}\n大小: ${(size / 1024).toFixed(1)} KB\n⏱ ${ms(t)}ms` };
}

export async function listWindowsTool() {
  const wins = listWindows();
  if (!wins.length) return { text: "没有找到可见窗口。" };
  return { text: `当前可见窗口 (${wins.length}个):\n${wins.map((w, i) => `[${i}] ${w}`).join("\n")}` };
}

export async function zenStatus() {
  const s = await import("./config.js").then(m => m.summary());
  let api;
  try { await listModels(); api = "✅ API 连通正常"; } catch (e) { api = "❌ " + e.message; }
  return { text: `端点: ${s.baseUrl}\nKey: ${s.apiKeyMasked}\n模型: ${s.model}\n截图目录: ${s.screenshotDir}\n${api}` };
}

export async function listModels() {
  const { listModels: lm } = await import("./zen.js");
  const ids = await lm();
  return ids.map(id => "• " + id).join("\n");
}
