// tools.js — 视觉感知工具
import { config, summary } from "./config.js";
import { chat, listModels as agnesListModels } from "./zen.js";
import { imageContent, videoContent, audioContent, detectKind } from "./media.js";
import { screenshot, listWindows } from "./platform.js";
import { readFileSync } from "node:fs";

const P = "请客观、完整地描述这段媒体内容（主体、文字、颜色、布局、细节）。";
const t0 = () => performance.now();
const ms = (t) => Math.round(performance.now() - t);

export async function analyzeImage({ source, prompt }) {
  const t = t0();
  const text = await chat(config.model, imageContent(source, prompt || P));
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
  const content =
    kind === "image" ? imageContent(source, task || P) :
    kind === "audio" ? audioContent(source, task || "请完整转写这段音频并总结要点。") :
    kind === "video" ? videoContent(source, task || "请描述这个视频的内容和场景。") :
    null;
  if (!content) throw new Error("无法识别媒体类型");
  const t = t0();
  const text = await chat(config.model, content);
  return { text: `⏱ ${ms(t)}ms | 📝 ${text}` };
}

export async function describeScreen({ mode = "primary", window: win, prompt }) {
  const t = t0();
  const fp = screenshot(mode, win);
  const capTime = ms(t);
  const scope = mode === "window" ? `窗口 "${win}"` : mode === "full" ? "全部显示器" : "主屏幕";
  const t2 = t0();
  const text = await chat(config.model, imageContent(fp, prompt || `请详细描述这张截图（范围：${scope}）。`));
  return { text: `📸 ${scope} | ${fp}\n⏱ 截屏: ${capTime}ms | 分析: ${ms(t2)}ms | 总计: ${ms(t)}ms\n\n📝 ${text}` };
}

export async function takeScreenshot({ mode = "primary", window: win, filename }) {
  const t = t0();
  const fp = screenshot(mode, win, filename);
  const size = readFileSync(fp).length;
  return { text: `✅ 截图已保存\n路径: ${fp}\n大小: ${(size / 1024).toFixed(1)} KB\n⏱ ${ms(t)}ms` };
}

export async function listWindowsTool() {
  const wins = listWindows();
  return wins.length
    ? { text: `当前可见窗口 (${wins.length}个):\n${wins.map((w, i) => `[${i}] ${w}`).join("\n")}` }
    : { text: "没有找到可见窗口。" };
}

export async function zenStatus() {
  const s = summary();
  let api;
  try { await agnesListModels(); api = "✅ API 连通正常"; } catch (e) { api = "❌ " + e.message; }
  return { text: `端点: ${s.baseUrl}\nKey: ${s.apiKeyMasked}\n模型: ${s.model}\n截图目录: ${s.screenshotDir}\n${api}` };
}

export async function listModels() {
  const ids = await agnesListModels();
  return ids.map(id => "• " + id).join("\n");
}
