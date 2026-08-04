#!/usr/bin/env node
// deepseek-vision-mcp — 给 agent 主模型（纯文本）做"眼睛"的多模态 MCP Server
// 感知层用 mimo-v2.5-free（免费，用户自己的 opencode zen key），感知结果以文本返回，
// 推理由 agent 客户端自己的主模型完成。支持所有 MCP 客户端。
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as tools from "./tools.js";
import { sanitizedSummary } from "./config.js";

const server = new McpServer({ name: "deepseek-vision", version: "1.0.0" });

/** 统一包装：成功→文本，失败→可读错误（不中断协议） */
const wrap = (fn) => async (args) => {
  try {
    const r = await fn(args);
    return { content: [{ type: "text", text: r.text }] };
  } catch (err) {
    return { content: [{ type: "text", text: `❌ ${err?.message || err}` }] };
  }
};

const TOOLS = [
  {
    name: "analyze_image",
    desc: "图片感知工具：用 mimo-v2.5-free 多模态模型识别/描述图片内容。支持三种输入方式：1) 文件路径（如 D:\\x\\a.png）2) URL（如 https://example.com/img.jpg）3) data URI（base64 编码的图片数据，如用户直接粘贴图片时产生的 data URI）。",
    schema: {
      source: z.string().describe("图片来源：本地文件路径、http URL 或 data:image/...;base64,... 的 data URI"),
      prompt: z.string().optional().describe("希望感知模型关注的提问，缺省为完整描述"),
      detail: z.enum(["auto", "low", "high"]).optional().describe("图像分辨率档位，默认 auto"),
    },
    fn: ({ source, prompt, detail }) => tools.analyzeImage({ source, prompt, detail }),
  },
  {
    name: "transcribe_audio",
    desc: "音频感知工具：转写并理解音频内容。支持本地文件路径（如 D:\\x\\a.mp3）。音频暂不支持 URL 和 data URI。",
    schema: {
      source: z.string().describe("音频文件本地绝对路径（mp3/wav/m4a 等）"),
      prompt: z.string().optional().describe("附加要求，如“只提取其中的行动项”"),
    },
    fn: ({ source, prompt }) => tools.transcribeAudio({ source, prompt }),
  },
  {
    name: "analyze_video",
    desc: "视频感知工具：自动抽帧后描述视频内容（本机需安装 ffmpeg）。支持本地文件路径。视频暂不支持 URL 和 data URI。",
    schema: {
      source: z.string().describe("视频文件本地绝对路径（如 C:\\x\\clip.mp4）"),
      prompt: z.string().optional().describe("希望感知模型关注的内容"),
      frames: z.number().int().min(1).max(8).optional().describe("抽帧数量 1-8，默认 4"),
    },
    fn: ({ source, prompt, frames }) => tools.analyzeVideo({ source, prompt, frames }),
  },
  {
    name: "hybrid_analyze",
    desc: "万能感知入口：自动识别输入类型（图片/音频/视频），调用 mimo-v2.5-free 感知并返回文本。支持三种输入方式：1) 文件路径（如 D:\\x\\a.png）2) URL（如 https://example.com/img.jpg）3) data URI（base64 编码的图片数据，如用户直接粘贴图片时产生的 data URI）。",
    schema: {
      source: z.string().describe("媒体来源：本地文件路径 / URL / data URI"),
      task: z.string().optional().describe("用户关注点（用于聚焦感知，可选）"),
      hint: z.enum(["image", "audio", "video"]).optional().describe("当无法从扩展名识别类型时，可显式指定"),
    },
    fn: ({ source, task, hint }) => tools.hybridAnalyze({ source, task, hint }),
  },
  {
    name: "list_models",
    desc: "列出用户 opencode zen 账号可用的全部模型（含免费模型）。用于排查与选择感知模型。",
    schema: {},
    fn: () => tools.zenListModels(),
  },
  {
    name: "zen_status",
    desc: "显示感知配置（端点、模型、key 是否配置）并做 API 连通性自检。排查问题时先用它。",
    schema: {},
    fn: () => tools.zenStatus(),
  },
];

for (const t of TOOLS) server.tool(t.name, t.desc, t.schema, wrap(t.fn));

const transport = new StdioServerTransport();
await server.connect(transport);
const s = sanitizedSummary();
console.error(`[deepseek-vision] 已启动 | 感知模型=${s.multimodalModel} | key=${s.apiKeySet ? "已配置" : "未配置"}`);

