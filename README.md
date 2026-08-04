# DeepSeek Vision MCP Server

> 给纯文本主模型做"眼睛"——用免费的 MiMo-V2.5 Free 感知图片/音频/视频，推理由你自己的主模型完成。

[![npm version](https://img.shields.io/npm/v/deepseek-vision?style=flat-square&logo=npm&logoColor=white)](https://www.npmjs.com/package/deepseek-vision)

## What it does

当你的 agent 客户端使用纯文本模型（如 DeepSeek、自定义 baseURL 的模型）时，本 MCP 提供多模态感知能力：

```
用户发送图片/音频/视频 → MCP 用 mimo-v2.5-free 感知 → 返回文本 → 你的主模型推理回答
```

**不需要切换模型，不需要额外 API，只需要你的 opencode zen API key（免费）。**

---

## Prerequisites

1. **Node.js >= 18**（下载：https://nodejs.org）
2. **opencode zen API key**（获取：https://opencode.ai/auth，免费，无需绑定支付方式）

---

## Installation

### VS Code

编辑全局 MCP 配置文件 `C:\Users\<你的用户名>\AppData\Roaming\Code\User\mcp.json`：

```json
{
  "servers": {
    "deepseek-vision": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "deepseek-vision"],
      "env": {
        "OPENCODE_API_KEY": "sk-你的zen-key"
      }
    }
  }
}
```

> 打开方式：`Ctrl+Shift+P` → 输入 `MCP: Open User Configuration`
>
> 也可以在项目根目录创建 `.vscode/mcp.json`，内容相同。

**或者**使用项目级配置，在项目根目录创建 `.vscode/mcp.json`：

```json
{
  "servers": {
    "deepseek-vision": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "deepseek-vision"],
      "env": {
        "OPENCODE_API_KEY": "sk-你的zen-key"
      }
    }
  }
}
```

重启 VS Code。

---

### Cursor

编辑全局 MCP 配置文件 `C:\Users\<你的用户名>\.cursor\mcp.json`：

```json
{
  "mcpServers": {
    "deepseek-vision": {
      "command": "npx",
      "args": ["-y", "deepseek-vision"],
      "env": {
        "OPENCODE_API_KEY": "sk-你的zen-key"
      }
    }
  }
}
```

> 打开方式：`Ctrl+Shift+P` → 输入 `Cursor: Open Global MCP`
>
> 也可以在项目根目录创建 `.cursor/mcp.json`，内容相同。

重启 Cursor。

---

### Claude Code

运行以下命令注册 MCP server：

```bash
claude mcp add deepseek-vision -- npx -y deepseek-vision
```

然后在终端中设置环境变量（每次新开终端都需要执行）：

```powershell
set OPENCODE_API_KEY=sk-你的zen-key
```

或者创建项目根目录 `.mcp.json` 文件：

```json
{
  "mcpServers": {
    "deepseek-vision": {
      "command": "npx",
      "args": ["-y", "deepseek-vision"],
      "env": {
        "OPENCODE_API_KEY": "sk-你的zen-key"
      }
    }
  }
}
```

重启 Claude Code。

---

### opencode

编辑全局配置文件 `~/.config/opencode/opencode.json`：

```json
{
  "mcp": {
    "deepseek-vision": {
      "type": "local",
      "command": ["npx", "-y", "deepseek-vision"],
      "enabled": true,
      "environment": {
        "OPENCODE_API_KEY": "sk-你的zen-key"
      }
    }
  }
}
```

> 也可以在项目根目录创建 `opencode.json`，内容相同。

重启 opencode。

---

### Codex CLI

运行以下命令：

```bash
codex mcp add deepseek-vision -- npx -y deepseek-vision
```

---

### Windsurf

编辑项目根目录 `.windsurf/mcp_config.json`：

```json
{
  "mcpServers": {
    "deepseek-vision": {
      "command": "npx",
      "args": ["-y", "deepseek-vision"],
      "env": {
        "OPENCODE_API_KEY": "sk-你的zen-key"
      }
    }
  }
}
```

重启 Windsurf。

---

### Trae

编辑项目根目录 `.trae/mcp.json`：

```json
{
  "mcpServers": {
    "deepseek-vision": {
      "command": "npx",
      "args": ["-y", "deepseek-vision"],
      "env": {
        "OPENCODE_API_KEY": "sk-你的zen-key"
      }
    }
  }
}
```

重启 Trae。

---

### Zed

编辑 `~/.config/zed/settings.json`，在 `context_servers` 中添加：

```json
{
  "context_servers": {
    "deepseek-vision": {
      "command": "npx",
      "args": ["-y", "deepseek-vision"],
      "env": {
        "OPENCODE_API_KEY": "sk-你的zen-key"
      }
    }
  }
}
```

重启 Zed。

---

## Verify

重启客户端后，对 agent 说：

```
调用 zen_status 检查配置
```

返回"API 连通正常"即安装成功。

---

## Usage

### VS Code

```
请分析图片 D:\x\photo.png 的内容
```

> ⚠️ VS Code 用户：请提供**文件路径**，不要直接粘贴图片。VS Code 会把粘贴的图片作为 `image_url` 发给模型，纯文本模型不支持这个格式。

### Codex / Claude Code 桌面端

这些客户端支持直接粘贴图片，agent 会自动调用 MCP 工具处理。

### 所有客户端

agent 会调用 `hybrid_analyze` 感知媒体，然后用你的主模型推理回答。

---

## Tools

### hybrid_analyze（推荐）

万能入口：自动识别图片/音频/视频 → 感知 → 返回文本。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `source` | string | ✅ | 文件路径、URL 或 data URI |
| `task` | string | 否 | 用户关注点（聚焦感知） |
| `hint` | string | 否 | 显式指定类型：image / audio / video |

### analyze_image

图片感知：用 mimo-v2.5-free 识别/描述图片内容。

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `source` | string | ✅ | 图片本地路径、URL 或 data URI |
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

## Configuration

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
