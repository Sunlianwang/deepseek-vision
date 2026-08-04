---
name: deepseek-vision
description: 给纯文本主模型做"眼睛"的多模态感知工作流。当用户提供图片、音频、视频时使用：调用免费的 mimo-v2.5-free（opencode zen）感知媒体内容并返回文本描述，然后由 agent 客户端自己的主模型完成推理与回答。仅需用户配置一次自己的 opencode zen API key。
license: MIT
---

# DeepSeek Vision · 给纯文本主模型做"眼睛"

> 依赖 MCP Server `deepseek-vision`（见 README 安装）。使用前先调用 `@mcp deepseek-vision zen_status` 确认配置。

## 核心规则

- 用户提供**图片 / 音频 / 视频**时，**必须**调用 `deepseek-vision` 的 MCP 工具进行感知，**不要**假装自己能"看"或"听"。
- 媒体传**本地绝对路径**；音频暂不支持 URL；视频需本机安装 ffmpeg。
- **感知文本返回后，由你自己（主模型）基于它完成推理与回答**——本 MCP 只做眼睛，不做大脑。

## 工具路由

| 场景 | 工具 |
|---|---|
| 图片感知 | `@mcp deepseek-vision analyze_image` |
| 音频转写 | `@mcp deepseek-vision transcribe_audio` |
| 视频感知 | `@mcp deepseek-vision analyze_video` |
| **一步到位（推荐）** | `@mcp deepseek-vision hybrid_analyze`（自动识别类型） |
| 排查 | `@mcp deepseek-vision zen_status` / `list_models` |

## 示例

- 看图报错：`hybrid_analyze({ source: "D:\\bugs\\error.png", task: "识别图中的报错信息" })` → 主模型分析修复方案
- 会议录音转写：`transcribe_audio({ source: "C:\\meeting.mp3" })` → 主模型总结行动项
- 视频内容：`analyze_video({ source: "D:\\clip.mp4" })` → 主模型基于场景描述回答
