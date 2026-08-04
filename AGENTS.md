# AGENTS.md — 给纯文本主模型做"眼睛"（deepseek-vision）

本 MCP **只做多模态感知（眼睛）**，不做推理（大脑）：

- 感知层：`mimo-v2.5-free`（免费多模态，走用户自己的 opencode zen API key）
- 推理层：**你的主模型** —— 拿到感知文本后结合用户任务完成推理回答

## 对 agent 的强制要求

1. 用户提供 **图片 / 音频 / 视频** 并要求分析时，**必须调用 deepseek-vision MCP 工具**（`hybrid_analyze` / `analyze_image` / `transcribe_audio` / `analyze_video`）获取感知文本，**禁止**声称自己能直接查看媒体。
2. **如果用户在聊天中直接粘贴了图片/音频/视频，请要求用户提供文件的本地路径**（如 "请提供这张图片的文件路径，如 D:\x\photo.png"），然后调用 MCP 工具。不要尝试直接处理粘贴的媒体内容。
3. **拿到感知文本后，由你自己（主模型）基于它完成推理与回答**——感知结果是你的眼睛，回答是你的大脑。
4. **优先 `hybrid_analyze`**：传 `source`（本地绝对路径或 URL）+ `task`（可选，聚焦感知）。
5. 工具报错先调 `zen_status` / `list_models` 排查。
6. 视频分析需本机 ffmpeg；音频不支持 URL（用本地路径）。

## 工具速查

| 场景 | 工具 |
|---|---|
| 图片/音频/视频感知（一步到位） | `hybrid_analyze` |
| 图片感知 | `analyze_image` |
| 音频转写 | `transcribe_audio` |
| 视频抽帧感知 | `analyze_video` |
| 排查 | `zen_status` / `list_models` |

## 配置

- Key：`.env` → `OPENCODE_API_KEY`（用户自己的 opencode zen key，获取 https://opencode.ai/auth）
- 换感知模型：`MULTIMODAL_MODEL`（默认 `mimo-v2.5-free`，免费）
- 客户端接入：见 `config-examples/CLIENTS.md`；安装：`install.ps1` / `install.sh`
