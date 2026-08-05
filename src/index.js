#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as T from "./tools.js";
import { summary } from "./config.js";

const s = new McpServer({ name: "deepseek-vision", version: "2.0.0" });
const W = (fn) => async (a) => {
  try { const r = await fn(a); return { content: [{ type: "text", text: r.text }] }; }
  catch (e) { return { content: [{ type: "text", text: "❌ " + (e.message || e) }], isError: true }; }
};

s.tool("describe_screen", "截屏并用视觉模型分析描述。支持全屏/主屏/指定窗口（后台截取，不切窗口）。", {
  mode: z.enum(["full", "primary", "window"]).optional().describe("截屏范围：full=所有显示器，primary=主显示器，window=指定窗口。默认 primary"),
  window: z.string().optional().describe("mode='window' 时的窗口标题关键字"),
  prompt: z.string().optional().describe("自定义分析指令"),
}, W(({ mode, window: w, prompt }) => T.describeScreen({ mode, window: w, prompt })));

s.tool("take_screenshot", "只截屏保存，不分析。", {
  mode: z.enum(["full", "primary", "window"]).optional().describe("截屏范围，默认 primary"),
  window: z.string().optional().describe("窗口标题关键字"),
  filename: z.string().optional().describe("保存文件名"),
}, W(({ mode, window: w, filename }) => T.takeScreenshot({ mode, window: w, filename })));

s.tool("list_windows", "列出当前所有可见窗口的标题。", {}, W(() => T.listWindowsTool()));

s.tool("analyze_image", "分析一张已有的图片。支持文件路径、URL 或 data URI。", {
  source: z.string().describe("图片来源：本地文件路径、http URL 或 data URI"),
  prompt: z.string().optional().describe("自定义分析指令"),
}, W(({ source, prompt }) => T.analyzeImage({ source, prompt })));

s.tool("analyze_video", "分析一个视频文件。支持本地文件路径。", {
  source: z.string().describe("视频文件本地路径"),
  prompt: z.string().optional().describe("自定义分析指令"),
}, W(({ source, prompt }) => T.analyzeVideo({ source, prompt })));

s.tool("transcribe_audio", "转写并理解音频内容。支持本地文件路径。", {
  source: z.string().describe("音频文件本地路径（mp3/wav/m4a）"),
  prompt: z.string().optional().describe("附加要求"),
}, W(({ source, prompt }) => T.transcribeAudio({ source, prompt })));

s.tool("hybrid_analyze", "万能感知入口：自动识别媒体类型（图片/音频/视频）→ 视觉模型感知 → 返回文本。", {
  source: z.string().describe("媒体来源：本地文件路径 / URL"),
  task: z.string().optional().describe("用户关注点"),
}, W(({ source, task }) => T.hybridAnalyze({ source, task })));

s.tool("list_models", "列出视觉 API 可用的全部模型。", {}, W(async () => ({ text: await T.listModels() })));

s.tool("zen_status", "显示当前配置并做 API 连通性自检。", {}, W(() => T.zenStatus()));

const transport = new StdioServerTransport();
await s.connect(transport);
const c = summary();
console.error(`[deepseek-vision] 已启动 | 模型=${c.model} | key=${c.apiKeyMasked}`);
