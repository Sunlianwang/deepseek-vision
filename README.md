# DeepSeek Vision · 给纯文本主模型做"眼睛"

> **你的模型没有视觉？一行 JSON 搞定。**
> 用免费的 MiMo-V2.5 Free 感知图片/音频/视频，推理还是你自己的主模型。
> 只需填入你的 opencode zen API key。

## 安装（一行命令）

### VS Code

在 `.vscode/mcp.json` 或全局 `mcp.json` 的 `servers` 中加：

```json
{
  "servers": {
    "deepseek-vision": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "github:Sunlianwang/deepseek-vision"],
      "env": { "OPENCODE_API_KEY": "sk-你的zen-key" },
      "gallery": "https://api.mcp.github.com",
      "version": "1.0.0"
    }
  }
}
```

### Cursor / Claude Code

在 `.cursor/mcp.json` 或 `.mcp.json` 中加：

```json
{
  "mcpServers": {
    "deepseek-vision": {
      "command": "npx",
      "args": ["-y", "github:Sunlianwang/deepseek-vision"],
      "env": { "OPENCODE_API_KEY": "sk-你的zen-key" }
    }
  }
}
```

### opencode

在 `opencode.json` 中加：

```json
{
  "mcp": {
    "deepseek-vision": {
      "type": "local",
      "command": ["npx", "-y", "github:Sunlianwang/deepseek-vision"],
      "enabled": true,
      "environment": { "OPENCODE_API_KEY": "sk-你的zen-key" }
    }
  }
}
```

### 或者 clone 后本地使用

```bash
git clone https://github.com/Sunlianwang/deepseek-vision
cd deepseek-vision && npm install
```

然后在客户端配置中用 `node src/index.js` 代替 `npx`。

## API Key

从 https://opencode.ai/auth 获取你的 opencode zen API key，填入配置的 `env` 字段即可。
免费模型 `mimo-v2.5-free` 无需绑定支付方式。

## 使用

安装后，对你的 agent 说：

```
请分析图片 D:\x\photo.png 的内容
```

agent 会自动调用 `hybrid_analyze` 感知图片，然后用你的主模型推理回答。

**注意**：请提供**文件路径**，不要直接在聊天中粘贴图片（纯文本模型不支持直接接收图片）。

## 工具

| 工具 | 说明 |
|---|---|
| `hybrid_analyze` | 万能入口：自动识别图片/音频/视频 → 感知 → 返回文本 |
| `analyze_image` / `transcribe_audio` / `analyze_video` | 分媒体专用 |
| `list_models` / `zen_status` | 模型列表 / 配置自检 |

## 配置项（`env` 字段）

| 变量 | 必填 | 说明 |
|---|---|---|
| `OPENCODE_API_KEY` | ✅ | 你的 zen key |
| `MULTIMODAL_MODEL` | 否 | 感知模型，默认 `mimo-v2.5-free` |
| `OPENCODE_BASE_URL` | 否 | 感知端点，默认 `https://opencode.ai/zen/v1` |

## 许可

MIT
