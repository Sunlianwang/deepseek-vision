#!/usr/bin/env node
// deepseek-vision-mcp — 多模态 MCP Server：感知层(mimo-v2.5-free 免费) + 推理层(deepseek-v4-flash-free)
// 文本/图像/音频/视频统一走 DeepSeek 流水线，无需切换模型。支持所有 MCP 客户端。
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
    desc: "用多模态感知模型（默认免费的 mimo-v2.5-free）识别/理解图片内容。当用户提供图片（文件路径、URL 或 data URI）时使用。",
    schema: {
      source: z.string().describe("图片来源：本地绝对路径（如 C:\\x\\a.png）、http(s) URL 或 data: URI"),
      prompt: z.string().optional().describe("希望模型关注的提问，缺省为完整描述"),
      detail: z.enum(["auto", "low", "high"]).optional().describe("图像分辨率档位，默认 auto"),
    },
    fn: ({ source, prompt, detail }) => tools.analyzeImage({ source, prompt, detail }),
  },
  {
    name: "transcribe_audio",
    desc: "转写并理解音频内容（支持 mp3/wav/m4a 等本地文件）。当用户提供音频文件时使用。",
    schema: {
      source: z.string().describe("音频文件本地绝对路径（暂不支持 URL）"),
      prompt: z.string().optional().describe("附加要求，如“只提取其中的行动项”"),
    },
    fn: ({ source, prompt }) => tools.transcribeAudio({ source, prompt }),
  },
  {
    name: "analyze_video",
    desc: "理解视频内容：自动抽帧后交给多模态感知模型分析（本机需安装 ffmpeg）。当用户提供视频文件时使用。",
    schema: {
      source: z.string().describe("视频文件本地绝对路径（如 C:\\x\\clip.mp4）"),
      prompt: z.string().optional().describe("希望模型关注的内容"),
      frames: z.number().int().min(1).max(8).optional().describe("抽帧数量 1-8，默认 4"),
    },
    fn: ({ source, prompt, frames }) => tools.analyzeVideo({ source, prompt, frames }),
  },
  {
    name: "deepseek_think",
    desc: "用 DeepSeek V4 Flash（后端大脑）进行纯文本推理、代码、总结、规划。当用户希望以 DeepSeek 能力回答文本类问题时使用。",
    schema: {
      prompt: z.string().describe("要 DeepSeek 处理的任务或问题"),
      system: z.string().optional().describe("系统提示词，可选"),
      temperature: z.number().min(0).max(2).optional().describe("采样温度，可选"),
    },
    fn: ({ prompt, system, temperature }) => tools.deepseekThink({ prompt, system, temperature }),
  },
  {
    name: "hybrid_analyze",
    desc: "万能入口：自动识别输入（图片/音频/视频/纯文本），先由免费多模态模型感知提取信息，再交给 DeepSeek 推理大脑完成分析回答。日常使用这一个工具即可，无需关心模型切换。",
    schema: {
      source: z.string().optional().describe("媒体来源：本地文件路径 / URL / data URI。纯文本任务可省略"),
      task: z.string().describe("用户想要完成的任务或问题"),
      hint: z.enum(["image", "audio", "video", "text"]).optional().describe("当无法从扩展名识别类型时，可显式指定"),
    },
    fn: ({ source, task, hint }) => tools.hybridAnalyze({ source, task, hint }),
  },
  {
    name: "list_models",
    desc: "列出当前 opencode zen API key 可用的全部模型（含免费模型）。用于排查与选择模型。",
    schema: {},
    fn: () => tools.zenListModels(),
  },
  {
    name: "zen_status",
    desc: "显示当前 MCP 配置（模型、端点、key 是否配置）并做 API 连通性自检。排查问题时先用它。",
    schema: {},
    fn: () => tools.zenStatus(),
  },
];

for (const t of TOOLS) server.tool(t.name, t.desc, t.schema, wrap(t.fn));

const transport = new StdioServerTransport();
await server.connect(transport);
const s = sanitizedSummary();
console.error(`[deepseek-vision] 已启动 | 感知=${s.multimodalModel} | 推理=${s.textModel} | key=${s.apiKeySet ? "已配置" : "未配置"}`);

