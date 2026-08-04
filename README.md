# DeepSeek Vision MCP Server

> 给纯文本主模型做"眼睛"——用免费的 MiMo-V2.5 Free 感知图片/音频/视频，推理由你自己的主模型完成。

[![npm version](https://img.shields.io/npm/v/deepseek-vision?style=flat-square&logo=npm&logoColor=white)](https://www.npmjs.com/package/deepseek-vision)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](https://opensource.org/licenses/MIT)

## What it does

当你的 agent 客户端使用纯文本模型（如 DeepSeek、自定义 baseURL 的模型）时，本 MCP 提供多模态感知能力：

```
用户发送图片/音频/视频 → MCP 用 mimo-v2.5-free 感知 → 返回文本 → 你的主模型推理回答
```

**不需要切换模型，不需要额外 API，只需要你的 opencode zen API key（免费）。**

---

## Quick Start

### 前置条件

1. **Node.js >= 18**（下载：https://nodejs.org）
2. **opencode zen API key**（获取：https://opencode.ai/auth，免费，无需绑定支付方式）

### 一键安装（选你用的客户端）

---

#### VS Code

打开命令面板 `Ctrl+Shift+P` → 输入 `MCP: Open User Configuration` → 编辑 `mcp.json`：

```json
{
  "servers": {
    "deepseek-vision": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "deepseek-vision"],
      "env": { "OPENCODE_API_KEY": "sk-你的zen-key" },
      "gallery": "https://api.mcp.github.com",
      "version": "1.0.0"
    }
  }
}
```

> 也可以在项目根目录创建 `.vscode/mcp.json`，格式相同。

---

#### Cursor

编辑 `~/.cursor/mcp.json`（全局）或项目根 `.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "deepseek-vision": {
      "command": "npx",
      "args": ["-y", "deepseek-vision"],
      "env": { "OPENCODE_API_KEY": "sk-你的zen-key" }
    }
  }
}
```

---

#### Claude Code

```bash
claude mcp add deepseek-vision -- npx -y deepseek-vision
```

或手动创建 `.mcp.json`（同 Cursor 格式）。

---

#### opencode

编辑 `~/.config/opencode/opencode.json`（全局）或项目根 `opencode.json`：

```json
{
  "mcp": {
    "deepseek-vision": {
      "type": "local",
      "command": ["npx", "-y", "deepseek-vision"],
      "enabled": true,
      "environment": { "OPENCODE_API_KEY": "sk-你的zen-key" }
    }
  }
}
```

---

#### Codex CLI

```bash
codex mcp add deepseek-vision -- npx -y deepseek-vision
```

---

#### Windsurf / Trae / 其他

MCP 设置面板 → 添加 stdio server：
- **Command**: `npx`
- **Args**: `-y deepseek-vision`
- **Env**: `OPENCODE_API_KEY=sk-你的zen-key`

---

### 验证安装

重启客户端后，对 agent 说：

```
调用 zen_status 检查配置
```

返回"API 连通正常"即安装成功。

---

## 使用

```
请分析图片 D:\x\photo.png 的内容
```

agent 会自动调用 `hybrid_analyze` 感知图片，然后用你的主模型推理回答。

> ⚠️ **重要：请提供文件路径，不要直接在聊天中粘贴图片！**
>
> 纯文本模型不支持直接接收图片。粘贴图片会导致 `image_url` 报错。
> 正确做法：输入文件路径（如 `D:\x\photo.png`），MCP 会自动读取并感知。

---

## Tools

### hybrid_analyze（推荐）

万能入口：自动识别图片/音频/视频 → 感知 → 返回文本。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `source` | string | ✅ | 文件路径或 URL |
| `task` | string | 否 | 用户关注点（聚焦感知） |
| `hint` | string | 否 | 显式指定类型：image / audio / video |

### analyze_image

图片感知：用 mimo-v2.5-free 识别/描述图片内容。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `source` | string | ✅ | 图片本地路径或 URL |
| `prompt` | string | 否 | 关注点（默认完整描述） |
| `detail` | string | 否 | 分辨率：auto / low / high |

### transcribe_audio

音频感知：转写并理解音频内容。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `source` | string | ✅ | 音频本地路径（mp3/wav/m4a） |
| `prompt` | string | 否 | 附加要求 |

### analyze_video

视频感知：自动抽帧后描述内容（需 ffmpeg）。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `source` | string | ✅ | 视频本地路径 |
| `prompt` | string | 否 | 关注点 |
| `frames` | number | 否 | 抽帧数量 1-8，默认 4 |

### list_models

列出你的 opencode zen 账号可用的全部模型。

### zen_status

显示配置（端点、模型、key）并做 API 连通性自检。

---

## 配置项

在客户端配置的 `env` / `environment` 字段中设置：

| 变量 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `OPENCODE_API_KEY` | ✅ | - | 你的 zen key |
| `MULTIMODAL_MODEL` | 否 | `mimo-v2.5-free` | 感知模型 |
| `OPENCODE_BASE_URL` | 否 | `https://opencode.ai/zen/v1` | 感知端点 |

---

## FAQ

**Q: npx 报错找不到命令？**
A: 需要安装 Node.js >= 18。下载：https://nodejs.org

**Q: 如何确认 MCP 已生效？**
A: 对 agent 说 "调用 zen_status 检查配置"。

**Q: 我的模型是纯文本的，能用吗？**
A: 能。MCP 只做感知（把媒体变成文字），推理由你的主模型完成。

**Q: 我想换更强的感知模型？**
A: 在 `env` 中加 `MULTIMODAL_MODEL: "模型名"`。用 `list_models` 查看可用模型。

**Q: 视频分析报错？**
A: 需要安装 ffmpeg 并加入 PATH。或用 `analyze_image` 逐帧分析。

**Q: API key 安全吗？**
A: key 只存在于你本地的客户端配置中，不会上传到任何地方。

---

## License

MIT
