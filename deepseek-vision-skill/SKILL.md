---
name: deepseek-vision
description: 给纯文本模型加"眼睛"——通过视觉 API 分析图片、截屏、视频、音频。当用户发送媒体文件或要求分析屏幕内容时使用。
---

# DeepSeek Vision Skill

## 核心逻辑

### 第一步：判断当前模型是否支持多模态

**检查模型 ID 是否在以下纯文本模型名单中**。如果在名单内 → 走 MCP 感知流程；如果不在名单内 → 走模型内置多模态能力（无需调用 MCP）。

### 纯文本模型名单（必须走 MCP）

这些模型**没有视觉能力**，遇到图片/视频/音频时必须调用 deepseek-vision MCP：

**DeepSeek 系列：**
`deepseek-v4-flash` `deepseek-v4-flash-free` `deepseek-v4-pro` `deepseek-v4-pro-high` `deepseek-v3.2` `deepseek-v3.2-thinking`

**GLM 系列：**
`glm-5.2` `glm-5.2-max` `glm-5.1` `glm-5` `glm-4.7` `glm-4.6`

**Qwen 系列：**
`qwen3.8-max` `qwen3.7-max` `qwen3.6-plus` `qwen3.5-flash` `qwen3.5-397b-a17b` `qwen3.5-27b` `qwen3-coder-480b`

**GPT 系列（纯文本版）：**
`gpt-5.6-sol` `gpt-5.6-luna` `gpt-5.6-terra` `gpt-5.5` `gpt-5.5-pro` `gpt-5.4` `gpt-5.4-mini` `gpt-5.3-codex` `gpt-5.2` `gpt-5.1` `gpt-5`

**Kimi 系列：**
`kimi-k3-max` `kimi-k2.7-code` `kimi-k2.6` `kimi-k2.5`

**其他：**
`mimo-v2.5` `mimo-v2-flash` `minimax-m3` `minimax-m2.7` `minimax-m2.5` `grok-4.5` `grok-4.3` `gemma-4-31b` `gemma-4-26b` `mistral-medium-3.5` `devstral-2`

### 第二步：调用 MCP 感知

如果模型在纯文本名单中，遇到媒体内容时：

1. **禁止**用 OCR / Read / 文件检查代替
2. **必须**先调用 deepseek-vision MCP 工具
3. 只有 MCP 工具返回错误时，才允许 OCR 作为补充诊断

### 第三步：多模态模型直接用内置能力

如果模型**不在**纯文本名单中（如 GPT-4V、Claude Sonnet/Opus、Gemini、Qwen-VL 等），则：
- 直接使用模型内置的视觉能力
- **无需调用** deepseek-vision MCP

---

## 工具列表

| 工具 | 场景 |
|---|---|
| `describe_screen` | 截屏 + 视觉分析（全屏/主屏/指定窗口） |
| `take_screenshot` | 只截屏保存，不分析 |
| `list_windows` | 列出当前所有可见窗口标题 |
| `analyze_image` | 分析一张已有的图片（文件路径/URL） |
| `analyze_video` | 分析一个视频文件 |
| `transcribe_audio` | 转写并理解音频内容 |
| `hybrid_analyze` | 万能入口：自动识别媒体类型并分析 |

## 注意事项

- 视觉 API 需要 `VISION_API_KEY` 环境变量
- 截图依赖 Windows PowerShell（GDI/CopyFromScreen）
- 音频仅支持本地文件（不支持远程 URL）
- 截图目录：`~/Pictures/Screenshots`（可配置）
