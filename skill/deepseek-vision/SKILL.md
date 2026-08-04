---
name: deepseek-vision
description: 多模态全能感知 + DeepSeek 推理大脑统一工作流。当用户提供图片、音频、视频，或希望以 DeepSeek 能力处理文本时使用。自动路由：感知层用免费的 mimo-v2.5-free 识别媒体，推理层用 deepseek-v4-flash-free 深度思考，全程无需手动切换模型。所有 MCP 工具均通过 opencode zen API 工作，仅需配置一次 OPENCODE_API_KEY。
license: MIT
compatibility: opencode, claude-code, codex, vs-code, cursor, windsurf, trae
metadata:
  audience: all-agent-clients
  workflow: multimodal-pipeline
---

# DeepSeek Vision · 通用多模态工作流

## 使命

让**文本 / 图像 / 音频 / 视频**全部通过同一套流水线完成工作，用户**永远不需要手动切换模型**：

```
媒体输入 ──▶ 感知层(免费多模态 mimo-v2.5-free) ──▶ 推理层(deepseek-v4-flash-free) ──▶ 回答
纯文本  ────────────────────────────────────────▶ 推理层(deepseek-v4-flash-free) ──▶ 回答
```

模型路由由 MCP Server 自动完成，agent 只需调用工具。

## 何时使用

- 用户给出 **图片 / 音频 / 视频** 文件或 URL 并要求分析、理解、转写、提取信息
- 用户点名要 **DeepSeek** 处理文本（推理、代码、总结、规划、翻译）
- 用户给了媒体 + 问题，希望一步到位（感知 + 推理）

## 工具路由规则

| 场景 | 调用工具 |
|---|---|
| 图片理解（描述/OCR/识别） | `analyze_image` |
| 音频转写/理解 | `transcribe_audio` |
| 视频理解（自动抽帧） | `analyze_video`（本机需安装 ffmpeg） |
| 纯文本深度推理（用户点名 DeepSeek） | `deepseek_think` |
| **混合/不确定类型/想一步到位** | `hybrid_analyze`（万能入口，自动识别类型） |
| 排查模型/配置 | `zen_status`、`list_models` |

## 使用要点

1. **不要**尝试自己"看"图片或"听"音频——你没有视觉/听觉能力，**必须**调用上述 MCP 工具。
2. 媒体文件传 **本地绝对路径**（如 `C:\x\photo.png`）；音频暂不支持 URL；视频需要本机安装 ffmpeg。
3. `hybrid_analyze` 是推荐入口：传 `source`（可选）+ `task`，server 自动完成"感知→推理"两段式处理。
4. 工具的返回文本即最终感知/推理结果；如需对结果继续加工（翻译、总结、写代码），在本轮对话中继续处理即可，**不需要再切模型**。
5. 若某个工具返回 ❌ 错误，先调用 `zen_status` 查看配置与连通性，或 `list_models` 确认模型可用。

## 示例

**示例 1 · 看图回答（一步到位）**
```
用户: 这张截图里报了什么错？怎么修？  （附 D:\bugs\error.png）
Agent: hybrid_analyze({ source: "D:\\bugs\\error.png", task: "识别报错信息并给出修复方案" })
```

**示例 2 · 音频转写**
```
用户: 帮我转写这个会议录音并列出行动项  （附 C:\meeting.mp3）
Agent: transcribe_audio({ source: "C:\\meeting.mp3", prompt: "完整转写并列出行动项" })
```

**示例 3 · 视频内容分析**
```
用户: 这个视频里的人在做什么？  （附 D:\clip.mp4）
Agent: analyze_video({ source: "D:\\clip.mp4", prompt: "描述场景、主体与动作" })
```

**示例 4 · 纯文本深度处理**
```
用户: 用 DeepSeek 帮我重构这段代码
Agent: deepseek_think({ prompt: "重构以下代码，说明改动原因：…" })
```

## 常见问题

- **模型路由怎么配置？** 在 `.env` 中改 `MULTIMODAL_MODEL`（感知层）与 `TEXT_MODEL`（推理层），改完重启 MCP 服务即可。
- **想用付费版 DeepSeek？** 把 `TEXT_MODEL` 改为 `deepseek-v4-flash`（需 zen 账号绑定支付方式）。
- **视频报 ffmpeg 错误？** 安装 ffmpeg 并加入 PATH；或让用户先用 ffmpeg 抽帧，再逐帧 `analyze_image`。
