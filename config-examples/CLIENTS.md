# 客户端接入指南

## VS Code

### 全局配置（推荐）

1. `Ctrl + Shift + P` → 输入 `MCP: Open User Configuration`
2. 打开文件：`C:\Users\你的用户名\AppData\Roaming\Code\User\mcp.json`
3. 在 `servers` 中添加：

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

4. 重启 VS Code

### 项目级配置

1. 在项目根目录创建 `.vscode/mcp.json`
2. 内容同上（可省略 `gallery` 和 `version`）
3. 重启 VS Code

---

## Cursor

### 全局配置

1. `Ctrl + Shift + P` → 输入 `Cursor: Open Global MCP`
2. 打开文件：`C:\Users\你的用户名\.cursor\mcp.json`
3. 添加：

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

4. 重启 Cursor

### 项目级配置

1. 在项目根目录创建 `.cursor/mcp.json`
2. 内容同上
3. 重启 Cursor

---

## Claude Code

### 命令行（最简单）

```bash
claude mcp add deepseek-vision -- npx -y deepseek-vision
```

### 配置文件

1. 在项目根目录创建 `.mcp.json`
2. 内容：

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

3. 重启 Claude Code

---

## opencode

1. 打开配置文件：
   - 全局：`C:\Users\你的用户名\.config\opencode\opencode.json`
   - 项目级：项目根目录 `opencode.json`
2. 在 `mcp` 中添加：

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

3. 重启 opencode

---

## Codex CLI

```bash
codex mcp add deepseek-vision -- npx -y deepseek-vision
```

---

## Windsurf / Trae / WorkBuddy

1. 打开客户端的 MCP 设置面板
2. 添加 stdio 类型的 MCP Server：
   - **Command**: `npx`
   - **Args**: `-y deepseek-vision`
   - **Env**: `OPENCODE_API_KEY=sk-你的zen-key`
3. 重启客户端

---

## API Key

从 https://opencode.ai/auth 获取，填入 `env` 字段即可。免费模型无需绑定支付方式。

