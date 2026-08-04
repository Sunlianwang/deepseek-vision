# 客户端接入指南

## 最简方式：一行 JSON 搞定

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

### Cursor

在 `.cursor/mcp.json` 中加：

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

### Claude Code

在 `.mcp.json` 中加（同 Cursor 格式），或命令行：

```bash
claude mcp add deepseek-vision -- npx -y github:Sunlianwang/deepseek-vision
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

### Codex

```bash
codex mcp add deepseek-vision -- npx -y github:Sunlianwang/deepseek-vision
```

### Windsurf / Trae / WorkBuddy

MCP 设置面板添加 stdio server：
- command: `npx`
- args: `["-y", "github:Sunlianwang/deepseek-vision"]`
- env: `{ "OPENCODE_API_KEY": "sk-你的zen-key" }`

## API Key

从 https://opencode.ai/auth 获取，填入 `env` 字段即可。免费模型无需绑定支付方式。
