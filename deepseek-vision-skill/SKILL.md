---
name: deepseek-vision
description: 给纯文本模型加"眼睛"——通过视觉 API 分析图片、截屏、视频、音频。当用户发送媒体文件或要求分析屏幕内容时使用。
---

# DeepSeek Vision Skill

## 核心逻辑

### 第一步：判断当前模型是否支持多模态

检查模型 ID 是否在以下**国内纯文本模型名单**中。如果在 → 调用 MCP 感知；如果不在 → 走模型内置多模态能力（无需调用 MCP）。

### 国内纯文本模型名单（必须走 MCP）

**DeepSeek 系列：**
`deepseek-v4-flash` `deepseek-v4-flash-free` `deepseek-v4-pro` `deepseek-v3.2` `deepseek-v3.2-thinking`

**GLM 系列（智谱）：**
`glm-5.2` `glm-5.2-max` `glm-5.1` `glm-5` `glm-4.7` `glm-4.6`

**Qwen 系列（阿里）：**
`qwen3.8-max` `qwen3.7-max` `qwen3.6-plus` `qwen3.5-flash` `qwen3.5-397b-a17b` `qwen3.5-27b` `qwen3-coder-480b`

**Kimi 系列（月之暗面）：**
`kimi-k3-max` `kimi-k2.7-code` `kimi-k2.6` `kimi-k2.5`

**其他国内：**
`mimo-v2.5` `mimo-v2-flash` `minimax-m3` `minimax-m2.7` `minimax-m2.5` `hy3`

> 注意：`glm-5v-turbo` 是视觉模型，不在纯文本名单中。

### 第二步：调用 MCP 感知

模型在纯文本名单中，遇到媒体内容时：

1. **禁止**用 OCR / Read / 文件检查代替
2. **必须**先调用 deepseek-vision MCP 工具
3. 只有 MCP 返回错误时，才允许 OCR 作为补充诊断

### 第三步：多模态模型直接用内置能力

模型**不在**纯文本名单中（如 GPT-4V、Claude Sonnet/Opus、Gemini、Qwen-VL、GLM-5v 等），直接用内置视觉能力，**无需调用 MCP**。

---

## 工具列表

| 工具 | 场景 |
|---|---|
| `describe_screen` | 截屏 + 视觉分析 |
| `take_screenshot` | 只截屏保存 |
| `list_windows` | 列出可见窗口 |
| `analyze_image` | 分析图片 |
| `analyze_video` | 分析视频 |
| `transcribe_audio` | 转写音频 |
| `hybrid_analyze` | 万能入口 |

## 注意事项

- 视觉 API 需要 `VISION_API_KEY` 环境变量
- 截图依赖 Windows PowerShell
- 音频仅支持本地文件
- 截图目录：`~/Pictures/Screenshots`
