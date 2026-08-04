# AGENTS.md — 多模态统一工作流（deepseek-vision）

本项目提供"感知层 + 推理层"双模型流水线，**文本 / 图像 / 音频 / 视频**全部通过 DeepSeek 完成，**无需手动切换模型**：

- 感知层：`mimo-v2.5-free`（免费多模态）→ 推理层：`deepseek-v4-flash-free`（免费 DeepSeek）
- 全部走 opencode zen API，key 在 `.env` 的 `OPENCODE_API_KEY`（自动读取）

## 对 agent 的强制要求

1. 用户提供 **图片 / 音频 / 视频** 并要求分析时，**必须调用 deepseek-vision MCP 工具**（`hybrid_analyze` / `analyze_image` / `transcribe_audio` / `analyze_video`），**禁止**声称自己能直接查看媒体，**禁止**要求用户切换模型。
2. **优先 `hybrid_analyze`**：传 `source`（本地绝对路径或 URL）+ `task`，自动完成"感知→推理"并返回答案。
3. 纯文本任务且用户点名 DeepSeek 时，调用 `deepseek_think`。
4. 工具报错先调 `zen_status` / `list_models` 排查。
5. 视频分析需本机 ffmpeg；音频不支持 URL（用本地路径）。

## 工具速查

| 场景 | 工具 |
|---|---|
| 图片/音频/视频/文本（一步到位） | `hybrid_analyze` |
| 图片理解 | `analyze_image` |
| 音频转写 | `transcribe_audio` |
| 视频抽帧分析 | `analyze_video` |
| 纯文本 DeepSeek 推理 | `deepseek_think` |
| 排查 | `zen_status` / `list_models` |

## 配置

- Key：`.env` → `OPENCODE_API_KEY`（获取 https://opencode.ai/auth）
- 换模型：`MULTIMODAL_MODEL`（感知层）、`TEXT_MODEL`（推理层，可改 `deepseek-v4-flash` 付费版）
- 客户端接入：见 `config-examples/CLIENTS.md`；安装：`install.ps1` / `install.sh`
