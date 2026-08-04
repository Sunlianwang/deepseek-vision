# 客户端接入指南

> **全局安装**：运行根目录 `install.ps1`（Windows）或 `./install.sh`（macOS/Linux），
> API key 存储在 `~/.deepseek-vision/.env`（全局一份），MCP 注册到各客户端的全局配置。
> 之后所有项目自动可用，无需重复安装。

> ⚠️ 本 MCP 只做感知（眼睛），推理由你的 agent 客户端主模型完成。

## 各客户端配置格式

### VS Code

**全局**（所有项目可用）：写入 `C:\Users\你的用户名\AppData\Roaming\Code\User\mcp.json` 的 `servers` 段：

```json
{
  "servers": {
    "deepseek-vision": {
      "type": "stdio",
      "command": "node",
      "args": ["mcp-deepseek-vision/src/index.js"],
      "env": { "OPENCODE_API_KEY": "sk-你的zen-key" }
    }
  }
}
```

**项目级**（仅当前项目）：项目根 `.vscode/mcp.json`（格式同上）。

> Skill 全局放 `~/.vscode/skills/deepseek-vision.skill.md`，项目级放 `.vscode/skills/`。

### Cursor

**全局**：写入 `~/.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "deepseek-vision": {
      "command": "node",
      "args": ["mcp-deepseek-vision/src/index.js"],
      "env": { "OPENCODE_API_KEY": "sk-你的zen-key" }
    }
  }
}
```

**项目级**：项目根 `.cursor/mcp.json`（格式同上）。

> Skill 规则全局放 `~/.cursor/rules/deepseek-vision.mdc`，项目级放 `.cursor/rules/`。

### Claude Code

**全局**：写入 `~/.claude/mcp.json`：

```json
{
  "mcpServers": {
    "deepseek-vision": {
      "command": "node",
      "args": ["mcp-deepseek-vision/src/index.js"],
      "env": { "OPENCODE_API_KEY": "sk-你的zen-key" }
    }
  }
}
```

或命令行全局注册：
```bash
claude mcp add --global deepseek-vision -- node mcp-deepseek-vision/src/index.js
```

> Skill 全局放 `~/.claude/skills/deepseek-vision/`。

### opencode

**全局**：写入 `~/.config/opencode/opencode.json`：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "deepseek-vision": {
      "type": "local",
      "command": ["node", "mcp-deepseek-vision/src/index.js"],
      "enabled": true
    }
  }
}
```

> Skill 全局放 `~/.config/opencode/skills/deepseek-vision/`。

### Codex CLI

```bash
codex mcp add deepseek-vision -- node mcp-deepseek-vision/src/index.js
```

> 规则见根 `AGENTS.md`。
