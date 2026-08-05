// zen.js — 智谱 API 客户端（OpenAI 兼容）
import { config } from "./config.js";

export async function chat(model, content) {
  if (!config.apiKey) throw new Error("未配置 VISION_API_KEY");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), config.timeoutMs);
  try {
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model, messages: [{ role: "user", content }] }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? "";
  } finally {
    clearTimeout(timer);
  }
}

export async function listModels() {
  if (!config.apiKey) throw new Error("未配置 VISION_API_KEY");
  const res = await fetch(`${config.baseUrl}/models`, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : data?.data ?? []).map(m => m.id);
}
