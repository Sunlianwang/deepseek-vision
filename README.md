# DeepSeek Vision · 给纯文本主模型做"眼睛"

> **你的模型没有视觉？一行 JSON 搞定。**
> 用免费的 MiMo-V2.5 Free 感知图片/音频/视频，推理还是你自己的主模型。
> 只需填入你的 opencode zen API key。

## 安装

### 第一步：获取 API Key

1. 打开 https://opencode.ai/auth
2. 登录后复制你的 API Key（`sk-` 开头）
3. 这是免费的，无需绑定支付方式

### 第二步：配置 MCP（选你用的客户端）

---

#### VS Code

**方式 A：全局配置（推荐，所有项目可用）**

1. 打开命令面板：`Ctrl + Shift + P`
2. 输入 `MCP: Open User Configuration` 并回车
3. 会打开文件 `C:\Users\你的用户名\AppData\Roaming\Code\User\mcp.json`
4. 在 `servers` 中添加以下内容：

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

> 如果 `servers` 已有其他 MCP，把 `deepseek-vision` 那段加进去即可，不要覆盖已有的。

**方式 B：项目级配置（仅当前项目可用）**

1. 在项目根目录创建 `.vscode/mcp.json` 文件
2. 内容同上（不需要 `gallery` 和 `version` 字段也行）：

```json
{
  "servers": {
    "deepseek-vision": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "github:Sunlianwang/deepseek-vision"],
      "env": { "OPENCODE_API_KEY": "sk-你的zen-key" }
    }
  }
}
```

5. 重启 VS Code

---

#### Cursor

**全局配置（所有项目可用）**

1. 打开 Cursor 设置：`Ctrl + Shift + P` → 输入 `Cursor: Open Global MCP`
2. 会打开文件 `C:\Users\你的用户名\.cursor\mcp.json`
3. 添加以下内容：

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

**项目级配置**

1. 在项目根目录创建 `.cursor/mcp.json` 文件
2. 内容同上
3. 重启 Cursor

---

#### Claude Code

**方式 A：命令行（最简单）**

```bash
claude mcp add deepseek-vision -- npx -y github:Sunlianwang/deepseek-vision
```

然后设置环境变量（在终端中执行）：

```bash
set OPENCODE_API_KEY=sk-你的zen-key
```

**方式 B：配置文件**

1. 在项目根目录创建 `.mcp.json` 文件
2. 内容：

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

3. 重启 Claude Code

---

#### opencode

1. 打开 opencode 配置文件：
   - 全局：`C:\Users\你的用户名\.config\opencode\opencode.json`
   - 项目级：项目根目录 `opencode.json`
2. 在 `mcp` 中添加：

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

3. 重启 opencode

---

#### Codex CLI

```bash
codex mcp add deepseek-vision -- npx -y github:Sunlianwang/deepseek-vision
```

---

#### Windsurf / Trae / WorkBuddy

1. 打开客户端的 MCP 设置面板
2. 添加 stdio 类型的 MCP Server：
   - **Command**: `npx`
   - **Args**: `-y github:Sunlianwang/deepseek-vision`
   - **Env**: `OPENCODE_API_KEY=sk-你的zen-key`
3. 重启客户端

---

### 第三步：验证

重启客户端后，对 agent 说：

```
调用 zen_status 检查配置
```

如果返回"API 连通正常"，说明安装成功。

## 使用

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

## 常见问题

**Q: npx 报错找不到命令？**
A: 需要安装 Node.js（>=18）。下载地址：https://nodejs.org

**Q: 如何确认 MCP 已生效？**
A: 对 agent 说 "调用 zen_status 检查配置"，如果返回 API 连通信息就说明成功。

**Q: 我的模型是纯文本的，能用吗？**
A: 能。本 MCP 只做感知（把图片变成文字），推理由你的主模型完成。

**Q: 我想换更强的感知模型？**
A: 在 `env` 中加 `MULTIMODAL_MODEL: "模型名"`，用 `list_models` 工具查看可用模型。

## 许可

MIT
