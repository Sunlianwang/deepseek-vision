# 客户端接入指南（手动配置）

> 最快方式：运行根目录 `install.ps1`（Windows）或 `./install.sh`（macOS/Linux），
> 脚本自动注册 VS Code / Cursor / Claude Code / opencode 并安装 Skill。
> 以下为手动配置方式，覆盖全部主流客户端。

> ⚠️ 本 MCP 只做感知（眼睛），推理由你的 agent 客户端主模型完成，无需在这里配置任何推理模型。

## 各客户端配置格式

### VS Code

项目根 `.vscode/mcp.json`（**注意顶层是 `servers`，不是 `mcpServers`**）：

```json
{
  "servers": {
    "deepseek-vision": {
      "type": "stdio",
      "command": "node",
      "args": ["mcp-deepseek-vision/src/index.js"]
    }
  }
}
```

> 如需全局生效，把配置写到 `C:\Users\你的用户名\AppData\Roaming\Code\User\mcp.json` 的 `servers` 段中。
> Skill 放 `.vscode/skills/deepseek-vision.skill.md`。

### Cursor

项目根 `.cursor/mcp.json`（**顶层用 `mcpServers`**）：

```json
{
  "mcpServers": {
    "deepseek-vision": {
      "command": "node",
      "args": ["mcp-deepseek-vision/src/index.js"]
    }
  }
}
```

> Skill 规则放 `.cursor/rules/deepseek-vision.mdc`。

### Claude Code

项目根 `.mcp.json`（**顶层用 `mcpServers`**）：

```json
{
  "mcpServers": {
    "deepseek-vision": {
      "command": "node",
      "args": ["mcp-deepseek-vision/src/index.js"]
    }
  }
}
```

或命令行注册：
```bash
claude mcp add deepseek-vision --scope project -- node mcp-deepseek-vision/src/index.js
```

> Skill 放 `.claude/skills/deepseek-vision/`。

### opencode

项目根 `opencode.json`：

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

> Skill 放 `.opencode/skills/deepseek-vision/`。

### Codex CLI

命令行注册：
```bash
codex mcp add deepseek-vision -- node mcp-deepseek-vision/src/index.js
```

> 规则见根 `AGENTS.md`。

### Windsurf / Trae

MCP 设置面板添加 stdio server（command=`node`, args=`["mcp-deepseek-vision/src/index.js"]`）。
规则放 `.windsurf/rules/deepseek-vision.mdc` 或 `.trae/rules/deepseek-vision.mdc`。

### cc-haha / Kilo / WorkBuddy

各家 MCP 配置文件格式各不同，请参照上述各客户端的 JSON 结构。规则用根 `AGENTS.md`。
