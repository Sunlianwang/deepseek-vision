---
name: deepseek-vision-skill
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

**DeepSeek：** `deepseek-v4-flash` `deepseek-v4-pro` 

**GLM（智谱）：** `glm-5.2` `glm-5.1` `glm-5` `glm-4.7` `glm-4.6`


**其他国内：** `mimo-v2.5-pro` 

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
