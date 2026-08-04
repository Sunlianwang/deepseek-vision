// zen.js — opencode zen API 客户端（OpenAI 兼容），仅用于感知层（多模态）
import { config } from "./config.js";

export class ZenError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ZenError";
    this.status = status;
  }
}

/** 统一 fetch：鉴权 + 超时 + 错误解析 */
async function zenFetch(pathname, options = {}, baseUrl) {
  if (!config.apiKey) {
    throw new ZenError(
      "未配置 OPENCODE_API_KEY。请在 .env 中填入你的 API key（获取：https://opencode.ai/auth）",
      401
    );
  }
  let res;
  try {
    res = await fetch(`${baseUrl || config.baseUrl}${pathname}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}`, ...(options.headers || {}) },
      signal: AbortSignal.timeout(config.timeoutMs),
    });
  } catch (err) {
    throw new ZenError(
      err.name === "TimeoutError" || err.name === "AbortError"
        ? `请求超时（${config.timeoutMs}ms）。可调大 REQUEST_TIMEOUT_MS`
        : `网络错误：${err.message}`
    );
  }
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }
  if (!res.ok) {
    throw new ZenError(
      `API 错误 (HTTP ${res.status})：${json?.error?.message || json?.message || text?.slice(0, 300)}`,
      res.status
    );
  }
  return json;
}

/**
 * chat/completions 对话。兼容不接受 temperature/max_tokens 的推理模型：
 * 带参数被 400 拒绝时自动去掉参数重试。
 */
export async function chatCompletions({ model, messages, maxTokens, temperature, baseUrl }) {
  const build = (withParams) => {
    const body = { model, messages };
    if (withParams) {
      if (maxTokens) body.max_tokens = maxTokens;
      if (temperature !== undefined) body.temperature = temperature;
    }
    return body;
  };
  let json;
  try {
    json = await zenFetch("/chat/completions", { method: "POST", body: JSON.stringify(build(true)) }, baseUrl);
  } catch (err) {
    if (err instanceof ZenError && err.status === 400) {
      json = await zenFetch("/chat/completions", { method: "POST", body: JSON.stringify(build(false)) }, baseUrl);
    } else throw err;
  }
  const content = json?.choices?.[0]?.message?.content ?? json?.choices?.[0]?.message?.reasoning_content ?? "";
  return { model, text: typeof content === "string" ? content : JSON.stringify(content ?? ""), usage: json?.usage ?? null };
}

/** 模型列表（OpenAI 风格 data 数组） */
export async function listModels(baseUrl) {
  const json = await zenFetch("/models", {}, baseUrl);
  const data = Array.isArray(json) ? json : json?.data ?? [];
  return data.map((m) => ({ id: m.id, name: m.name ?? m.id, ownedBy: m.owned_by ?? m.ownedBy ?? "" }));
}
