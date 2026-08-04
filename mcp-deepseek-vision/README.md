# deepseek-vision-mcp

多模态 MCP Server：感知层（mimo-v2.5-free 免费）+ 推理层（deepseek-v4-flash-free）双模型流水线，统一走 opencode zen API（OpenAI 兼容）。

## 使用

```bash
npm install        # 首次
node src/index.js  # stdio 启动（供客户端 MCP 注册）
```

key 与模型配置在 `.env`（自动向上查找，可放本目录或项目根）：

```
OPENCODE_API_KEY=sk-你的key
MULTIMODAL_MODEL=mimo-v2.5-free
TEXT_MODEL=deepseek-v4-flash-free
```

## 工具

| 工具 | 说明 |
|---|---|
| `hybrid_analyze` | 万能入口：自动识别媒体类型 → 感知 → DeepSeek 推理 |
| `analyze_image` / `transcribe_audio` / `analyze_video` | 分媒体专用（视频需 ffmpeg） |
| `deepseek_think` | DeepSeek 纯文本推理 |
| `list_models` / `zen_status` | 模型列表 / 配置自检 |

## 测试

```bash
node test/test-zen.mjs   # API 连通（模型/文本/图像）
node test/test-mcp.mjs   # MCP 协议握手 + 全链路
```

## 设计

- 纯 ESM 零构建；感知/推理可分别指向不同 OpenAI 兼容端点（`.env` 的 `MULTIMODAL_BASE_URL` / `TEXT_BASE_URL`）
- 推理模型不接受 `temperature`/`max_tokens` 时自动降级重试
- 工具失败返回可读中文错误，不中断 MCP 协议
- key 只读 `.env`，`zen_status` 脱敏显示
