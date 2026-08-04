# 各客户端安装指南

## VS Code

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

或者使用项目级配置，在项目根目录创建 `.vscode/mcp.json`，内容相同。重启 VS Code。

---

## Cursor

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

或者在项目根目录创建 `.cursor/mcp.json`，内容相同。重启 Cursor。

---

## Claude Code

运行以下命令注册：

```bash
claude mcp add deepseek-vision -- npx -y deepseek-vision
```

然后设置环境变量：

```powershell
set OPENCODE_API_KEY=sk-你的zen-key
```

或者创建项目根目录 `.mcp.json`：

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

## opencode

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

或者在项目根目录创建 `opencode.json`，内容相同。重启 opencode。

---

## Codex CLI

Codex 使用 TOML 格式。编辑 `~/.codex/config.toml`（CLI 和 IDE 扩展共享）：

```toml
[mcp_servers.deepseek-vision]
command = "npx"
args = ["-y", "deepseek-vision"]
env = { OPENCODE_API_KEY = "sk-你的zen-key" }
```

或者通过 CLI 添加：

```bash
codex mcp add deepseek-vision -- npx -y deepseek-vision
```

然后设置环境变量：

```powershell
set OPENCODE_API_KEY=sk-你的zen-key
```

---

## Windsurf

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

## Trae

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

## Zed

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

## API Key

从 https://opencode.ai/auth 获取，填入 `env` 字段即可。免费模型无需绑定支付方式。
