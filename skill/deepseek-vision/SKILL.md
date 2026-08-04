---
name: deepseek-vision
description: 给纯文本主模型做"眼睛"的多模态感知工作流。当用户提供图片、音频、视频时使用：调用免费的 mimo-v2.5-free（opencode zen）感知媒体内容并返回文本描述，然后由 agent 客户端自己的主模型完成推理与回答。仅需用户配置一次自己的 opencode zen API key，无需任何其他模型。
license: MIT
compatibility: opencode, claude-code, codex, vs-code, cursor, windsurf, trae
metadata:
  audience: all-agent-clients
  workflow: multimodal-perception
---

# DeepSeek Vision · 给纯文本主模型做"眼睛"

## 使命

用户自己的 agent 客户端已经配置了主模型（可能是纯文本模型，如 DeepSeek、自定义 baseURL 的模型等）。本 MCP **只做感知（眼睛）**，不做推理（大脑）：

```
媒体输入 ──▶ 感知层(免费 mimo-v2.5-free) ──▶ 返回感知文本 ──▶ 主模型(用户自己的)推理回答
```

- **感知层**：免费多模态 `mimo-v2.5-free`，走用户自己的 opencode zen API key
- **推理层**：**你的主模型** —— 拿到感知文本后结合用户任务完成推理回答，无需切换模型

## 何时使用

- 用户给出 **图片 / 音频 / 视频** 并要求分析、理解、转写、提取信息
- 你需要"看"媒体内容，但你是纯文本模型 —— 用本 MCP 感知即可

## 工具路由规则

| 场景 | 调用工具 |
|---|---|
| 图片感知（描述/OCR/识别） | `analyze_image` |
| 音频转写/理解 | `transcribe_audio` |
| 视频感知（自动抽帧） | `analyze_video`（本机需安装 ffmpeg） |
| **不确定类型/一步到位** | `hybrid_analyze`（自动识别类型） |
| 排查模型/配置 | `zen_status`、`list_models` |

## 使用要点

1. **不要**尝试自己"看"图片或"听"音频——你没有视觉/听觉能力，**必须**调用上述 MCP 工具。
2. **如果用户在聊天中直接粘贴了媒体文件，请要求用户提供文件的本地路径**（如 "请提供图片的文件路径，如 D:\x\photo.png"），然后调用 MCP 工具。不要尝试直接处理粘贴的媒体。
3. 媒体文件传 **本地绝对路径**（如 `C:\x\photo.png`）；音频暂不支持 URL；视频需要本机安装 ffmpeg。
4. `hybrid_analyze` 是推荐入口：传 `source`（必填）+ `task`（可选，用于聚焦感知），server 返回感知文本。
5. **拿到感知文本后，由你自己（主模型）基于它完成推理与回答**——感知结果是你的"眼睛"，回答是你的"大脑"。
6. 若某个工具返回 ❌ 错误，先调用 `zen_status` 查看配置与连通性，或 `list_models` 确认模型可用。

## 示例

**示例 1 · 看图报错**
```
用户: 这张截图报了什么错？怎么修？  （附 D:\bugs\error.png）
Agent: 1) hybrid_analyze({ source: "D:\\bugs\\error.png", task: "识别图中的报错信息" })
       2) 拿到感知文本后，由主模型分析报错并给出修复方案
```

**示例 2 · 音频转写**
```
用户: 帮我转写这个会议录音并列出行动项  （附 C:\meeting.mp3）
Agent: 1) transcribe_audio({ source: "C:\\meeting.mp3" })
       2) 主模型基于转写文本总结行动项
```

**示例 3 · 视频内容分析**
```
用户: 这个视频里的人在做什么？  （附 D:\clip.mp4）
Agent: 1) analyze_video({ source: "D:\\clip.mp4" })
       2) 主模型基于场景描述回答
```

## 常见问题

- **感知模型怎么配置？** 在 `.env` 中改 `MULTIMODAL_MODEL`（默认 `mimo-v2.5-free`，免费）。
- **key 是哪里的？** 你自己的 opencode zen API key（`OPENCODE_API_KEY`），获取 https://opencode.ai/auth。
- **视频报 ffmpeg 错误？** 安装 ffmpeg 并加入 PATH；或让用户先用 ffmpeg 抽帧，再逐帧 `analyze_image`。
- **我想换更强的视觉模型？** 改 `.env` 的 `MULTIMODAL_MODEL` 为 zen 支持的其他多模态模型（`list_models` 可查）。
