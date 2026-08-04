/**
 * test-zen.mjs — opencode zen API 连通性实测（感知层）
 *
 * 用法：node test/test-zen.mjs [--skip-vision]
 * 验证：1) 模型列表  2) mimo-v2.5-free 图像感知
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listModels } from "../src/zen.js";
import { effectiveModel } from "../src/config.js";
import { analyzeImage } from "../src/tools.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = new Set(process.argv.slice(2));
const TEST_IMAGE = path.join(__dirname, "assets", "test-image.png");

function section(title) {
  console.log(`\n${"=".repeat(64)}\n▶ ${title}\n${"=".repeat(64)}`);
}
function pass(msg) {
  console.log(`  ✅ ${msg}`);
}
function fail(msg) {
  console.log(`  ❌ ${msg}`);
}

/* 1. 模型列表 */
section("1/2 模型列表 (GET /zen/v1/models)");
try {
  const models = await listModels();
  pass(`共 ${models.length} 个模型`);
  const mimo = models.find((m) => m.id.includes("mimo"));
  if (mimo) pass(`感知模型 mimo 可用：${mimo.id}`);
  else fail("未找到 mimo 系列模型（请检查 key 权限）");
  console.log(`  预览：${models.slice(0, 15).map((m) => m.id).join("、")}${models.length > 15 ? "…" : ""}`);
} catch (err) {
  fail(`模型列表获取失败：${err.message}`);
  console.error("\nAPI key 无效或网络问题。请检查 .env 中 OPENCODE_API_KEY。");
  process.exit(1);
}

/* 2. MiMo 图像感知 */
if (!args.has("--skip-vision")) {
  section(`2/2 图像感知 (${effectiveModel("image")})`);
  try {
    const res = await analyzeImage({
      source: TEST_IMAGE,
      prompt: "请用中文描述这张图片的内容，并读出图中的文字（如有）。",
    });
    pass(`图像感知成功，返回 ${res.text.length} 字`);
    console.log(`  >>> ${res.text.slice(0, 300)}`);
  } catch (err) {
    fail(`图像感知失败：${err.message}`);
    console.log("  （提示：可在 .env 将 MULTIMODAL_MODEL 换成支持视觉的模型）");
  }
}

console.log("\n实测完成。");

