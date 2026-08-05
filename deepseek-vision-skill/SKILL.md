---
name: deepseek-vision
description: 给纯文本模型加"眼睛"——通过视觉 API 分析图片、截屏、视频、音频。当用户发送媒体文件或要求分析屏幕内容时使用。
---

# DeepSeek Vision Skill

## 核心规则（强制）

### 规则一：附件/截图/图片路径/URL → 必须先调用本 Skill

任何任务出现以下情况时，**必须先调用** deepseek-vision MCP 工具：

- 用户粘贴截图/图片
- 用户给出本地图片文件路径（如 `D:\x\photo.png`）
- 用户给出网络图片 URL（如 `https://example.com/img.jpg`）
- 用户发送附件包含图片

**调用顺序**：先感知（MCP 工具）→ 再推理（主模型）。

### 规则二：遇到图片必须先调用 MCP，禁止用其他方式代替

当需要理解图片内容时：

- ❌ **禁止**：用 OCR 工具直接识别文字
- ❌ **禁止**：用 Read/文件信息检查来推断图片内容
- ❌ **禁止**：用任何本地图像处理库代替视觉感知
- ✅ **必须**：先调用 `analyze_image` 或 `hybrid_analyze`
- ✅ **例外**：只有 MCP 工具返回错误（如 API 不可用）时，才允许 OCR 作为**补充诊断**

### 规则三：判断模型类型，决定工作流

在调用前先判断当前使用的主模型类型：

| 模型类型 | 判断方式 | 工作流 |
|---|---|---|
| **纯文本模型** | DeepSeek V4 / GLM 5.2 / Qwen 纯文本版等 | 必须调用 MCP 工具感知 → 主模型基于文本推理 |
| **多模态模型** | GPT-4V / Claude 3.5 / Gemini 等 | 直接使用模型内置的视觉能力，**无需调用 MCP** |

判断依据：如果模型 ID 中包含 `vl`、`vision`、`4v`、`sonnet`、`opus` 等多模态标识，则为多模态模型。

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

## 使用示例

```
用户: "帮我看看这张截图"（粘贴图片）
→ 判断：纯文本模型 → 调用 analyze_image → 返回文本 → 主模型回答

用户: "描述一下当前桌面"（纯文本）
→ 判断：纯文本模型 → 调用 describe_screen → 返回文本 → 主模型回答

用户: "这个视频讲了什么"（附视频文件）
→ 判断：纯文本模型 → 调用 analyze_video → 返回文本 → 主模型回答
```

## 注意事项

- 视觉 API 需要 `VISION_API_KEY` 环境变量
- 截图依赖 Windows PowerShell（GDI/CopyFromScreen）
- 音频仅支持本地文件（不支持远程 URL）
- 截图目录：`~/Pictures/Screenshots`（可配置）
