# 客户端接入指南（手动配置）

> 最快方式：运行根目录 `install.ps1`（Windows）或 `./install.sh`（macOS/Linux），
> 脚本自动注册 VS Code / Cursor / opencode / Claude Code / Codex 并安装 Skill。
> 以下为手动配置方式，覆盖全部主流客户端。

## 通用 stdio 配置片段（其余客户端通用）

```json
{
  "mcpServers": {
    "deepseek-vision": {
      "type": "stdio",
      "command": "node",
      "args": ["mcp-deepseek-vision/src/index.js"]
    }
  }
}
```

> 使用**相对路径**，客户端以项目根为工作目录启动。key 无需在此填写——Server 自动读取 `.env`。

## 各客户端注册方式

| 客户端 | 注册方式 |
|---|---|
| **VS Code** | 项目根 `.vscode/mcp.json`，内容为通用片段；Skill 放 `.vscode/skills/deepseek-vision.skill.md` |
| **Cursor** | 项目根 `.cursor/mcp.json`（同上）；Skill 规则放 `.cursor/rules/deepseek-vision.mdc` |
| **opencode** | `opencode.json` 的 `mcp` 段（结构不同，见下） |
| **Claude Code** | 命令行：`claude mcp add deepseek-vision --scope project -- node mcp-deepseek-vision/src/index.js`；Skill 放 `.claude/skills/deepseek-vision/` |
| **Codex** | 命令行：`codex mcp add deepseek-vision -- node mcp-deepseek-vision/src/index.js`；规则见根 `AGENTS.md` |
| **Windsurf / Trae** | MCP 设置面板添加 stdio server（command=`node`, args=`["mcp-deepseek-vision/src/index.js"]`）；规则放 `.windsurf/rules/` 或 `.trae/rules/` 的 `deepseek-vision.mdc` |
| **cc-haha / Kilo / WorkBuddy** | 各家 MCP 配置文件放通用 stdio 片段；规则用根 `AGENTS.md` |

## opencode 专用配置

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

## 进阶：BYOK（Bring Your Own Key / 换厂商）

推理层/感知层可分别指向**任意 OpenAI 兼容端点**，只需改 `.env`：

```bash
# 推理层 → DeepSeek 官方 API（前提：官方无多模态，感知层仍用其他端点）
TEXT_BASE_URL=https://api.deepseek.com
TEXT_MODEL=deepseek-chat          # 或 deepseek-reasoner

# 感知层 → opencode zen 免费 mimo（默认）
MULTIMODAL_BASE_URL=https://opencode.ai/zen/v1
MULTIMODAL_MODEL=mimo-v2.5-free

# 或感知层 → OpenRouter 视觉模型
# MULTIMODAL_BASE_URL=https://openrouter.ai/api/v1
# MULTIMODAL_MODEL=qwen/qwen-2.5-vl-72b-instruct
```

- DeepSeek 官方端点 `https://api.deepseek.com` 为 OpenAI 兼容（已实测端点可达）
- 若两个厂商 key 不同，需在 `src/config.js` 增加 `MULTIMODAL_API_KEY`/`TEXT_API_KEY` 变量（改动约 5 行）
