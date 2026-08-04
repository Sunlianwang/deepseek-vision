/**
 * test-mcp.mjs — MCP stdio 协议握手实测（不依赖任何客户端）
 *
 * 手工实现 MCP JSON-RPC over stdio：
 *   1. initialize
 *   2. notifications/initialized
 *   3. tools/list（确认 6 个工具注册成功）
 *   4. tools/call hybrid_analyze（真实感知测试图）
 *   5. tools/call zen_status（连通性自检）
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER = path.join(__dirname, "..", "src", "index.js");
const TEST_IMAGE = path.join(__dirname, "assets", "test-image.png");

const child = spawn(process.execPath, [SERVER], { stdio: ["pipe", "pipe", "pipe"] });
let buf = "";
let nextId = 0;
const pending = new Map();

child.stderr.on("data", (d) => process.stderr.write(d));
child.stdout.on("data", (d) => {
  buf += d.toString();
  let idx;
  while ((idx = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    if (msg.id !== undefined && pending.has(msg.id)) {
      const { resolve, label } = pending.get(msg.id);
      pending.delete(msg.id);
      resolve({ msg, label });
    }
  }
});

function send(method, params = {}) {
  const id = ++nextId;
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  return new Promise((resolve) => pending.set(id, { resolve, label: method }));
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fail = (m) => console.log(`  ❌ ${m}`);
const pass = (m) => console.log(`  ✅ ${m}`);

try {
  console.log("\n========== MCP 协议握手测试 ==========");

  /* 1. initialize */
  const init = await send("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "deepseek-vision-test", version: "0.0.1" },
  });
  if (init.msg.result?.serverInfo?.name === "deepseek-vision") pass("initialize 握手成功");
  else fail(`initialize 异常：${JSON.stringify(init.msg).slice(0, 200)}`);
  child.stdin.write(
    JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n"
  );

  /* 2. tools/list */
  const list = await send("tools/list");
  const tools = list.msg.result?.tools ?? [];
  const want = ["analyze_image", "transcribe_audio", "analyze_video", "hybrid_analyze", "list_models", "zen_status"];
  const got = tools.map((t) => t.name);
  pass(`tools/list 返回 ${tools.length} 个工具：${got.join("、")}`);
  const missing = want.filter((w) => !got.includes(w));
  if (missing.length) fail(`缺少工具：${missing.join("、")}`);
  else pass("6 个工具全部注册");

  /* 3. tools/call hybrid_analyze（测试图片 → 感知文本返回） */
  console.log("\n>>> 调用 hybrid_analyze（测试图片 → 感知文本）…");
  const hybrid = await send("tools/call", {
    name: "hybrid_analyze",
    arguments: {
      source: TEST_IMAGE,
      task: "识别图中所有文字与元素",
    },
  });
  const hybridText = hybrid.msg.result?.content?.[0]?.text ?? JSON.stringify(hybrid.msg).slice(0, 300);
  console.log(`  >>> ${hybridText.slice(0, 300)}`);
  if (hybridText.startsWith("❌")) fail(`hybrid_analyze 调用失败：${hybridText}`);
  else pass("hybrid_analyze 感知成功（返回感知文本，供主模型推理）");

  /* 4. tools/call zen_status */
  const status = await send("tools/call", { name: "zen_status", arguments: {} });
  const statusText = status.msg.result?.content?.[0]?.text ?? "";
  console.log(`\n${statusText}`);
  if (statusText.includes("✅")) pass("zen_status 自检通过");
  else fail("zen_status 自检未通过（见上方输出）");

  console.log("\n========== MCP 测试完成 ==========\n");
} catch (err) {
  fail(`测试异常：${err.message}`);
  process.exitCode = 1;
} finally {
  child.kill();
}
