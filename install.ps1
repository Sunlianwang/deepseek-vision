# ============================================================
# deepseek-vision 一键安装（Windows / PowerShell）
# 用法:
#   powershell -ExecutionPolicy Bypass -File install.ps1
#   powershell -ExecutionPolicy Bypass -File install.ps1 -Key sk-你的opencode-zen-key
# 自动完成: 生成 .env → npm install → 注册 MCP(检测到的客户端) → 安装 Skill
# ============================================================
param([string]$Key = "")

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
# 相对路径：clone 到任意位置均可使用（客户端以项目根为 cwd 启动 MCP）
$serverRel = "src\index.js"
$serverRelJson = ($serverRel -replace "\\", "\\")
$serverAbs = Join-Path $root $serverRel

Write-Host ""
Write-Host "=== deepseek-vision 一键安装 ===" -ForegroundColor Cyan

$envFile = Join-Path $root ".env"

# 1. 确认 key（优先级: -Key 参数 > 环境变量 > 已有 .env > 交互输入）
if (-not $Key) { $Key = $env:OPENCODE_API_KEY }
# 检查全局配置
$globalDir = "$env:USERPROFILE\.deepseek-vision"
$globalEnv = Join-Path $globalDir ".env"
if (-not $Key -and (Test-Path $globalEnv)) {
    $m = Select-String -Path $globalEnv -Pattern '^OPENCODE_API_KEY=(.+)$' | Select-Object -First 1
    if ($m) { $Key = $m.Matches[0].Groups[1].Value.Trim(); Write-Host "  ✅ 复用全局配置中的 key" -ForegroundColor Green }
}
if (-not $Key -and (Test-Path $envFile)) {
    $m = Select-String -Path $envFile -Pattern '^OPENCODE_API_KEY=(.+)$' | Select-Object -First 1
    if ($m) { $Key = $m.Matches[0].Groups[1].Value.Trim(); Write-Host "  ✅ 复用已有 .env 中的 key" -ForegroundColor Green }
}
if (-not $Key) {
    Write-Host "请输入你的 opencode zen API key（获取: https://opencode.ai/auth）:" -ForegroundColor Yellow
    $Key = Read-Host
}
if (-not $Key) { Write-Error "未提供 API key，安装中止" }

# 2. 生成全局配置（key 只存一份，所有项目共用）
New-Item -ItemType Directory -Force -Path $globalDir | Out-Null
if (-not (Test-Path $globalEnv)) {
    @"
# deepseek-vision 全局配置（key 只存本地，勿提交）
# 本 MCP 只做多模态感知（眼睛），推理由你的 agent 主模型完成
OPENCODE_API_KEY=$Key
MULTIMODAL_MODEL=mimo-v2.5-free
"@ | Set-Content -Path $globalEnv -Encoding UTF8
    Write-Host "  ✅ 全局配置已生成: $globalEnv" -ForegroundColor Green
} else {
    Write-Host "  ⏭ 全局配置已存在（如需更换 key 请手动编辑 $globalEnv）" -ForegroundColor Yellow
}
# 同时生成项目级 .env（兼容性）
if (-not (Test-Path $envFile)) {
    @"
# deepseek-vision 配置（key 仅存本地，勿提交）
# 本 MCP 只做多模态感知（眼睛），推理由你的 agent 主模型完成
OPENCODE_API_KEY=$Key
MULTIMODAL_MODEL=mimo-v2.5-free
"@ | Set-Content -Path $envFile -Encoding UTF8
    Write-Host "  ✅ 项目级 .env 已生成" -ForegroundColor Green
} else {
    Write-Host "  ⏭ .env 已存在" -ForegroundColor Yellow
}

# 3. 安装依赖
if (-not (Test-Path (Join-Path $root "node_modules"))) {
    Write-Host "  安装依赖中…"
    Push-Location $root
    npm install --silent
    Pop-Location
}
Write-Host "  ✅ 依赖就绪" -ForegroundColor Green

# 4. 注册 MCP（检测已安装的客户端）
function Write-IfMissing($path, $content) {
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
        Set-Content -Path $path -Value $content -Encoding UTF8
        Write-Host "  ✅ 已注册: $path" -ForegroundColor Green
    } else {
        Write-Host "  ⏭ 已存在: $path（请手动合并）" -ForegroundColor Yellow
    }
}

# VS Code 格式：顶层用 "servers"（含 env 传 key + gallery/version）
$vscodeConfig = @"
{
  "servers": {
    "deepseek-vision": {
      "type": "stdio",
      "command": "node",
      "args": ["$serverRelJson"],
      "env": { "OPENCODE_API_KEY": "$Key" },
      "gallery": "https://api.mcp.github.com",
      "version": "1.0.0"
    }
  }
}
"@

# Cursor 格式：顶层用 "mcpServers"（含 env 传 key）
$cursorConfig = @"
{
  "mcpServers": {
    "deepseek-vision": {
      "command": "node",
      "args": ["$serverRelJson"],
      "env": { "OPENCODE_API_KEY": "$Key" }
    }
  }
}
"@

# Claude Code 格式：顶层用 "mcpServers"（含 env 传 key）
$claudeConfig = @"
{
  "mcpServers": {
    "deepseek-vision": {
      "command": "node",
      "args": ["$serverRelJson"],
      "env": { "OPENCODE_API_KEY": "$Key" }
    }
  }
}
"@

Write-Host "  注册 MCP…"
# VS Code（项目级 .vscode/mcp.json —— 用 "servers" 格式）
Write-IfMissing (Join-Path $root ".vscode\mcp.json") $vscodeConfig
# Cursor（项目级 .cursor/mcp.json —— 用 "mcpServers" 格式）
Write-IfMissing (Join-Path $root ".cursor\mcp.json") $cursorConfig
# Claude Code（项目级 .mcp.json）
Write-IfMissing (Join-Path $root ".mcp.json") $claudeConfig
# opencode（JSON 结构不同，含 environment 传 key）
$oc = Join-Path $root "opencode.json"
if (-not (Test-Path $oc)) {
    @"
{
  "`$schema": "https://opencode.ai/config.json",
  "mcp": {
    "deepseek-vision": {
      "type": "local",
      "command": ["node", "$serverRelJson"],
      "enabled": true,
      "environment": { "OPENCODE_API_KEY": "$Key" }
    }
  }
}
"@ | Set-Content -Path $oc -Encoding UTF8
    Write-Host "  ✅ 已注册: opencode.json" -ForegroundColor Green
} else {
    Write-Host "  ⏭ 已存在: opencode.json（请手动合并）" -ForegroundColor Yellow
}
# Claude Code / Codex CLI（命令行注册）
foreach ($cli in @(@{cmd="claude"; args="mcp add deepseek-vision --scope project -- node `"$serverRel`""}, @{cmd="codex"; args="mcp add deepseek-vision -- node `"$serverRel`""})) {
    if (Get-Command $cli.cmd -ErrorAction SilentlyContinue) {
        Write-Host "  ✅ 检测到 $($cli.cmd)，运行: $($cli.cmd) $($cli.args)" -ForegroundColor Green
        try { Invoke-Expression "$($cli.cmd) $($cli.args)" | Out-Null } catch { Write-Host "    ⚠ 注册失败（可手动执行上面的命令）" -ForegroundColor Yellow }
    }
}

# 5. 安装 Skill（opencode / claude / agents 通用）
foreach ($dst in @("$root\.opencode\skills\deepseek-vision", "$root\.claude\skills\deepseek-vision", "$root\.agents\skills\deepseek-vision")) {
    if (-not (Test-Path $dst)) {
        New-Item -ItemType Directory -Force -Path $dst | Out-Null
        Copy-Item (Join-Path $root "skill\deepseek-vision\*") $dst -Recurse
        Write-Host "  ✅ Skill → $dst" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== 安装完成 ===" -ForegroundColor Cyan
Write-Host "验证：在任意 agent 客户端中说 “调用 zen_status 检查配置” 或 “分析这张图”"
Write-Host "手动配置其他客户端（Cursor/Windsurf/Trae 等）见 config-examples\CLIENTS.md"
