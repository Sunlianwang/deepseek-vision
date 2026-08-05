# Vision MCP Server

> 给 DeepSeek 等纯文本模型加"眼睛"——截图分析、图片识别、视频/音频理解，用免费的 GLM-4.6V-Flash。

[![npm version](https://img.shields.io/npm/v/deepseek-vision?style=flat-square&logo=npm&logoColor=white)](https://www.npmjs.com/package/deepseek-vision)

## 功能

| 工具 | 说明 |
|---|---|
| `describe_screen` | 截屏 + 视觉分析（全屏/主屏/指定窗口） |
| `take_screenshot` | 纯截屏保存 |
| `list_windows` | 列出所有可见窗口 |
| `analyze_image` | 图片分析 |
| `analyze_video` | 视频分析 |
| `transcribe_audio` | 音频转写 |
| `hybrid_analyze` | 万能感知入口 |
| `list_models` | 列出可用模型 |
| `zen_status` | 配置自检 |

## 前置条件

1. **Node.js >= 18**（下载：https://nodejs.org）
2. **智谱 API key**（获取：https://open.bigmodel.cn，免费注册）

---

## 安装

### Codex

编辑全局配置 `~/.codex/config.toml`：

```toml
[mcp_servers.deepseek-vision]
command = "npx"
args = ["-y", "deepseek-vision"]
env = { VISION_API_KEY = "你的智谱API-key" }
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
      "env": { "VISION_API_KEY": "你的智谱API-key" }
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
      "environment": { "VISION_API_KEY": "你的智谱API-key" }
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
| `VISION_API_KEY` | ✅ | - | 智谱 API key |
| `VISION_MODEL` | 否 | `glm-4.6v-flash` | 感知模型 |
| `VISION_BASE_URL` | 否 | `https://open.bigmodel.cn/api/paas/v4` | API 端点 |
| `VISION_SCREENSHOT_DIR` | 否 | `C:\Users\Administrator\Pictures\Screenshots` | 截图保存目录 |

---

## 许可

MIT
