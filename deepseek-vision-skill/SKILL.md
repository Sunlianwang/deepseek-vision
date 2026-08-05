---
name: deepseek-vision
description: 给纯文本模型加"眼睛"——通过视觉 API 分析图片、截屏、视频、音频。当用户发送媒体文件或要求分析屏幕内容时使用。
---

# DeepSeek Vision Skill

## 功能

通过视觉 API（Agnes 2.5 Flash）分析图片/截屏/视频/音频，把结果以文本返回给主模型。

## 何时使用

- 用户发送图片并要求分析
- 用户要求截屏并描述内容
- 用户发送视频/音频并要求理解
- 用户要求查看当前桌面/窗口

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

## 使用规则

1. **截屏分析优先**：用户说"看看当前桌面"→ 用 `describe_screen`
2. **已有图片**：用户给了文件路径 → 用 `analyze_image`
3. **视频/音频**：用户给了媒体文件 → 用 `analyze_video` / `transcribe_audio`
4. **不确定类型**：用 `hybrid_analyze`，它会自动识别
5. **所有工具返回文本**，主模型基于文本继续推理回答
6. **截图目录**：`~/Pictures/Screenshots`（可配置）

## 注意事项

- 视觉 API 需要 `VISION_API_KEY` 环境变量
- 截图依赖 Windows PowerShell（GDI/CopyFromScreen）
- 视频文件需本机可读
- 音频仅支持本地文件（不支持远程 URL）
