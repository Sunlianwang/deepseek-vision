# Vision MCP Server

> 给 DeepSeek 等纯文本模型加"眼睛"——截图分析、图片识别，用免费的 Agnes 2.5 Flash。

[![npm version](https://img.shields.io/npm/v/deepseek-vision?style=flat-square&logo=npm&logoColor=white)](https://www.npmjs.com/package/deepseek-vision)

## 功能

| 工具 | 说明 |
|---|---|
| `describe_screen` | 截屏 + 视觉分析（全屏/主屏/指定窗口） |
| `take_screenshot` | 纯截屏保存 |
| `list_windows` | 列出所有可见窗口 |
| `analyze_image` | 图片分析 |
| `list_models` | 列出可用模型 |
| `zen_status` | 配置自检 |

## 前置条件

1. **Node.js >= 18**（下载：https://nodejs.org）
2. **Agnes API key**（获取：https://www.agnes-ai.cn，当前免费）

---

## 安装

### Codex

编辑全局配置 `~/.codex/config.toml`：

```toml
[mcp_servers.deepseek-vision]
command = "npx"
args = ["-y", "deepseek-vision"]
env = { VISION_API_KEY = "你的Agnes API-key" }
```

或命令行：

```bash
codex mcp add deepseek-vision -- npx -y deepseek-vision
```

重启 Codex。

---

### Claude Code

编辑全局配置 `~/.claude/mcp.json`：

```json
{
  "mcpServers": {
    "deepseek-vision": {
      "command": "npx",
      "args": ["-y", "deepseek-vision"],
      "env": { "VISION_API_KEY": "你的Agnes API-key" }
    }
  }
}
```

或项目级 `.mcp.json`，内容同上。

或命令行：

```bash
claude mcp add deepseek-vision -- npx -y deepseek-vision
```

重启 Claude Code。

---

### opencode

编辑全局配置 `~/.config/opencode/opencode.json`：

```json
{
  "mcp": {
    "deepseek-vision": {
      "type": "local",
      "command": ["npx", "-y", "deepseek-vision"],
      "enabled": true,
      "environment": { "VISION_API_KEY": "你的Agnes API-key" }
    }
  }
}
```

或项目级 `opencode.json`，内容同上。

重启 opencode。

---

## 验证

重启客户端后，对 agent 说：

```
调用 zen_status 检查配置
```

返回"API 连通正常"即安装成功。

---

## Skill（可选，让 agent 自动调用工具）

Skill 是告诉 agent **什么时候、怎么调用** MCP 工具的指令文件。没有 Skill，agent 可能不知道要调用我们的工具。

### 安装

把 `deepseek-vision-skill/SKILL.md` 复制到客户端的 skill 目录：

**Claude Code**：`~/.claude/skills/deepseek-vision/SKILL.md`
**opencode**：`~/.config/opencode/skills/deepseek-vision/SKILL.md`

```bash
# Claude Code
mkdir -p ~/.claude/skills/deepseek-vision
cp deepseek-vision-skill/SKILL.md ~/.claude/skills/deepseek-vision/

# opencode
mkdir -p ~/.config/opencode/skills/deepseek-vision
cp deepseek-vision-skill/SKILL.md ~/.config/opencode/skills/deepseek-vision/
```

安装后重启客户端，agent 会自动发现并加载 Skill。

Skill 包含三条核心规则：
1. 图片/截图 → 必须调用 MCP 工具
2. 禁止用 OCR/Read 代替
3. 根据模型 ID 判断走 MCP 还是内置多模态

---

## 使用示例

```
"帮我看看当前桌面在干什么"
"分析这张图片 D:\x\photo.png"
"现在有哪些窗口开着"
```

---

## 配置项

| 变量 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `VISION_API_KEY` | ✅ | - | Agnes API key |
| `VISION_MODEL` | 否 | `agnes-2.5-flash` | 视觉模型 |
| `VISION_BASE_URL` | 否 | `https://api.agnes-ai.cn/v1` | 中国端点 |
| `VISION_SCREENSHOT_DIR` | 否 | `~/Pictures/Screenshots` | 截图保存目录 |

---

## 许可

MIT

