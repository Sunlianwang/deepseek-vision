// zen.js — 智谱 API 客户端（OpenAI 兼容）
import { config } from "./config.js";

export class ApiError extends Error {
  constructor(message, status) { super(message); this.name = "ApiError"; this.status = status; }
}

async function apiFetch(pathname, options = {}) {
  if (!config.apiKey) throw new ApiError("未配置 OPENCODE_API_KEY", 401);
  let res;
  try {
    res = await fetch(`${config.baseUrl}${pathname}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}`, ...(options.headers || {}) },
      signal: AbortSignal.timeout(config.timeoutMs),
    });
  } catch (err) {
    throw new ApiError(err.name === "TimeoutError" ? `请求超时（${config.timeoutMs}ms）` : `网络错误：${err.message}`);
  }
  const text = await res.text();
  let json; try { json = text ? JSON.parse(text) : null; } catch { json = null; }
  if (!res.ok) throw new ApiError(`API 错误 (HTTP ${res.status})：${json?.error?.message || text?.slice(0, 200)}`, res.status);
  return json;
}

export async function chatCompletions({ model, messages, temperature }) {
  const body = { model, messages };
  if (temperature !== undefined) body.temperature = temperature;
  const json = await apiFetch("/chat/completions", { method: "POST", body: JSON.stringify(body) });
  const content = json?.choices?.[0]?.message?.content ?? "";
  return { model, text: typeof content === "string" ? content : JSON.stringify(content ?? "") };
}

export async function listModels() {
  const json = await apiFetch("/models");
  return (Array.isArray(json) ? json : json?.data ?? []).map((m) => ({ id: m.id }));
}
