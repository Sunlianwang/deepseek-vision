---
name: deepseek-vision
description: 给纯文本模型加"眼睛"——通过视觉 API 分析图片、截屏。当用户发送图片或要求分析屏幕内容时使用。
---

# DeepSeek Vision Skill

## ⚠️ 第零步：必须先获取当前模型 ID

在处理任何请求之前，必须先确认当前使用的模型 ID。如果无法确定，**默认视为纯文本模型**，走 MCP 流程。

---

## 核心规则

### 规则一：图片/截图 → 必须先调用本 Skill

- 用户粘贴截图/图片
- 用户给出本地图片文件路径
- 用户给出网络图片 URL
- 用户发送附件包含图片

### 规则二：遇到图片必须先调用 MCP，禁止用其他方式代替

- ❌ 禁止：OCR / Read / 文件检查 / 本地图像处理
- ✅ 必须：先调用 `analyze_image`
- ✅ 例外：只有 MCP 返回错误时，才允许 OCR 补充诊断

### 规则三：根据模型 ID 决定工作流

| 情况 | 工作流 |
|---|---|
| 模型 ID **在**纯文本名单中 | 调用 MCP 感知 → 主模型推理 |
| 模型 ID **不在**纯文本名单中 | 用模型内置多模态能力，无需 MCP |
| **无法确定**模型 ID | 默认走 MCP |

---

## 国内纯文本模型名单（必须走 MCP）

**DeepSeek：** `deepseek-v4-flash` `deepseek-v4-flash-free` `deepseek-v4-pro` `deepseek-v3.2` `deepseek-v3.2-thinking`

**GLM（智谱）：** `glm-5.2` `glm-5.2-max` `glm-5.1` `glm-5` `glm-4.7` `glm-4.6`

**Qwen（阿里）：** `qwen3.8-max` `qwen3.7-max` `qwen3.6-plus` `qwen3.5-flash` `qwen3.5-397b-a17b` `qwen3.5-27b` `qwen3-coder-480b`

**Kimi（月之暗面）：** `kimi-k3-max` `kimi-k2.7-code` `kimi-k2.6` `kimi-k2.5`

**其他国内：** `mimo-v2.5` `mimo-v2-flash` `minimax-m3` `minimax-m2.7` `minimax-m2.5` `hy3`

> `glm-5v-turbo` 是视觉模型，不在纯文本名单中。

---

## 工具

| 工具 | 场景 |
|---|---|
| `describe_screen` | 截屏 + 视觉分析 |
| `take_screenshot` | 只截屏保存 |
| `list_windows` | 列出可见窗口 |
| `analyze_image` | 分析图片 |
| `list_models` | 列出可用模型 |
| `zen_status` | 配置自检 |

## 注意事项

- 视觉 API 需要 `VISION_API_KEY` 环境变量
- 截图依赖 Windows PowerShell
- 截图目录：`~/Pictures/Screenshots`
