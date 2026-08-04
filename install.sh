#!/usr/bin/env bash
# ============================================================
# deepseek-vision 一键安装（Linux / macOS / WSL）
# 用法:
#   ./install.sh
#   OPENCODE_API_KEY=sk-xxx ./install.sh
# 自动完成: 生成 .env → npm install → 注册 MCP(检测到的客户端) → 安装 Skill
# ============================================================
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
# 相对路径：clone 到任意位置均可使用（客户端以项目根为 cwd 启动 MCP）
SERVER="mcp-deepseek-vision/src/index.js"

echo ""
echo "=== deepseek-vision 一键安装 ==="

# 1. 确认 key（优先级: 环境变量 > 全局配置 > 交互输入）
KEY="${OPENCODE_API_KEY:-}"
GLOBAL_DIR="$HOME/.deepseek-vision"
GLOBAL_ENV="$GLOBAL_DIR/.env"
if [ -z "$KEY" ] && [ -f "$GLOBAL_ENV" ]; then
  KEY=$(grep '^OPENCODE_API_KEY=' "$GLOBAL_ENV" | cut -d= -f2- | tr -d '"' | tr -d "'")
  [ -n "$KEY" ] && echo "  ✅ 复用全局配置中的 key"
fi
if [ -z "$KEY" ]; then
  read -rp "请输入你的 opencode zen API key（获取: https://opencode.ai/auth）: " KEY
fi
[ -z "$KEY" ] && { echo "❌ 未提供 API key，安装中止" >&2; exit 1; }

# 2. 生成全局配置（key 只存一份，所有项目共用）
mkdir -p "$GLOBAL_DIR"
if [ ! -f "$GLOBAL_ENV" ]; then
  cat > "$GLOBAL_ENV" <<EOF
# deepseek-vision 全局配置（key 只存本地，勿提交）
# 本 MCP 只做多模态感知（眼睛），推理由你的 agent 主模型完成
OPENCODE_API_KEY=$KEY
MULTIMODAL_MODEL=mimo-v2.5-free
EOF
  echo "  ✅ 全局配置已生成: $GLOBAL_ENV"
else
  echo "  ⏭ 全局配置已存在（如需更换 key 请手动编辑 $GLOBAL_ENV）"
fi
# 同时生成项目级 .env（兼容性）
ENV_FILE="$ROOT/.env"
if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" <<EOF
# deepseek-vision 配置（key 仅存本地，勿提交）
# 本 MCP 只做多模态感知（眼睛），推理由你的 agent 主模型完成
OPENCODE_API_KEY=$KEY
MULTIMODAL_MODEL=mimo-v2.5-free
EOF
  echo "  ✅ 项目级 .env 已生成"
else
  echo "  ⏭ .env 已存在"
fi

# 3. 安装依赖
if [ ! -d "$ROOT/mcp-deepseek-vision/node_modules" ]; then
  echo "  安装依赖中…"
  (cd "$ROOT/mcp-deepseek-vision" && npm install --silent)
fi
echo "  ✅ 依赖就绪"

# 4. 注册 MCP
write_if_missing() { # $1=path $2=content
  if [ ! -f "$1" ]; then
    mkdir -p "$(dirname "$1")"
    printf '%s\n' "$2" > "$1"
    echo "  ✅ 已注册: $1"
  else
    echo "  ⏭ 已存在: $1（请手动合并）"
  fi
}

# VS Code 格式（顶层 "servers"）
VSCODE_CFG="{
  \"servers\": {
    \"deepseek-vision\": {
      \"type\": \"stdio\",
      \"command\": \"node\",
      \"args\": [\"$SERVER\"]
    }
  }
}"

# Cursor / Claude Code 格式（顶层 "mcpServers"）
CURSOR_CFG="{
  \"mcpServers\": {
    \"deepseek-vision\": {
      \"command\": \"node\",
      \"args\": [\"$SERVER\"]
    }
  }
}"

echo "  注册 MCP…"
write_if_missing "$ROOT/.vscode/mcp.json" "$VSCODE_CFG"
write_if_missing "$ROOT/.cursor/mcp.json" "$CURSOR_CFG"
write_if_missing "$ROOT/.mcp.json" "$CURSOR_CFG"
if [ ! -f "$ROOT/opencode.json" ]; then
  cat > "$ROOT/opencode.json" <<EOF
{
  "\$schema": "https://opencode.ai/config.json",
  "mcp": {
    "deepseek-vision": {
      "type": "local",
      "command": ["node", "$SERVER"],
      "enabled": true
    }
  }
}
EOF
  echo "  ✅ 已注册: opencode.json"
else
  echo "  ⏭ 已存在: opencode.json（请手动合并）"
fi

# Claude Code / Codex CLI（命令行注册）
for cli in "claude mcp add deepseek-vision --scope project -- node $SERVER" "codex mcp add deepseek-vision -- node $SERVER"; do
  cmd="${cli%% *}"
  if command -v "$cmd" >/dev/null 2>&1; then
    echo "  ✅ 检测到 $cmd，运行: $cli"
    eval "$cli" >/dev/null 2>&1 || echo "    ⚠ 注册失败（可手动执行上面的命令）"
  fi
done

# 5. 安装 Skill（opencode / claude / agents 通用）
for dst in "$ROOT/.opencode/skills/deepseek-vision" "$ROOT/.claude/skills/deepseek-vision" "$ROOT/.agents/skills/deepseek-vision"; do
  if [ ! -d "$dst" ]; then
    mkdir -p "$dst"
    cp -r "$ROOT/skill/deepseek-vision/." "$dst/"
    echo "  ✅ Skill → $dst"
  fi
done

echo ""
echo "=== 安装完成 ==="
echo "验证：在任意 agent 客户端中说 “调用 zen_status 检查配置” 或 “分析这张图”"
echo "手动配置其他客户端（Cursor/Windsurf/Trae 等）见 config-examples/CLIENTS.md"
