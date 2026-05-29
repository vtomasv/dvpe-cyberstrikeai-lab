#!/usr/bin/env python3
"""Add Google Gemini as an OpenAI-compatible provider in CyberStrikeAI."""

from __future__ import annotations

import sys
from pathlib import Path


GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai"
GEMINI_MODEL = "gemini-2.5-flash"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    if old not in text:
        raise SystemExit(f"patch failed: marker not found for {label}")
    return text.replace(old, new, 1)


def patch_index(root: Path) -> None:
    path = root / "web/templates/index.html"
    text = path.read_text(encoding="utf-8")
    old = (
        '                                                <option value="openai">OpenAI / 兼容 OpenAI 协议</option>\n'
        '                                                <option value="claude">Claude (Anthropic Messages API)</option>'
    )
    new = (
        '                                                <option value="openai">OpenAI / 兼容 OpenAI 协议</option>\n'
        '                                                <option value="gemini">Gemini (Google AI Studio / OpenAI-compatible)</option>\n'
        '                                                <option value="claude">Claude (Anthropic Messages API)</option>'
    )
    path.write_text(replace_once(text, old, new, "Gemini provider option"), encoding="utf-8")


def patch_settings_js(root: Path) -> None:
    path = root / "web/static/js/settings.js"
    text = path.read_text(encoding="utf-8")

    helper = f"""
const GEMINI_OPENAI_BASE_URL = '{GEMINI_BASE_URL}';
const GEMINI_DEFAULT_MODEL = '{GEMINI_MODEL}';

function isGeminiProvider(value) {{
    const v = (value || '').toString().trim().toLowerCase();
    return v === 'gemini' || v === 'google';
}}

function syncLLMProviderDefaults(forceGeminiDefaults) {{
    const providerEl = document.getElementById('openai-provider');
    const baseEl = document.getElementById('openai-base-url');
    const modelEl = document.getElementById('openai-model');
    const keyEl = document.getElementById('openai-api-key');
    if (!providerEl || !baseEl || !modelEl) return;

    if (isGeminiProvider(providerEl.value)) {{
        const base = (baseEl.value || '').trim();
        const model = (modelEl.value || '').trim();
        const shouldReplaceBase = !base || /api\\.openai\\.com|ollama-proxy|api\\.anthropic\\.com/i.test(base);
        const shouldReplaceModel = !model || /^(gpt-|claude|llama|gemma|qwen|deepseek)/i.test(model);
        if (forceGeminiDefaults || shouldReplaceBase) baseEl.value = GEMINI_OPENAI_BASE_URL;
        if (forceGeminiDefaults || shouldReplaceModel) modelEl.value = GEMINI_DEFAULT_MODEL;
        baseEl.placeholder = GEMINI_OPENAI_BASE_URL;
        modelEl.placeholder = GEMINI_DEFAULT_MODEL;
        if (keyEl) keyEl.placeholder = 'Gemini API Key';
    }} else {{
        baseEl.placeholder = 'https://api.openai.com/v1';
        modelEl.placeholder = 'gpt-4';
        if (keyEl) keyEl.placeholder = 'OpenAI-compatible API Key';
    }}
}}
"""
    text = replace_once(
        text,
        "let c2NavSyncedOnce = false;\n",
        "let c2NavSyncedOnce = false;\n" + helper,
        "Gemini settings helper",
    )

    text = replace_once(
        text,
        "        document.getElementById('openai-model').value = currentConfig.openai.model || '';\n",
        "        document.getElementById('openai-model').value = currentConfig.openai.model || '';\n"
        "        syncLLMProviderDefaults(false);\n"
        "        if (providerEl && !providerEl.dataset.geminiDefaultsBound) {\n"
        "            providerEl.dataset.geminiDefaultsBound = '1';\n"
        "            providerEl.addEventListener('change', function () { syncLLMProviderDefaults(true); });\n"
        "        }\n",
        "Gemini provider defaults binding",
    )

    path.write_text(text, encoding="utf-8")


def patch_i18n(root: Path) -> None:
    replacements = {
        "web/static/i18n/en-US.json": ('"openaiConfig": "OpenAI config"', '"openaiConfig": "LLM config"'),
        "web/static/i18n/zh-CN.json": ('"openaiConfig": "OpenAI 配置"', '"openaiConfig": "LLM 配置"'),
    }
    for rel, (old, new) in replacements.items():
        path = root / rel
        text = path.read_text(encoding="utf-8")
        path.write_text(replace_once(text, old, new, rel), encoding="utf-8")


def patch_openai_backend(root: Path) -> None:
    bridge = root / "internal/openai/claude_bridge.go"
    text = bridge.read_text(encoding="utf-8")
    old = """func isClaudeProvider(cfg *config.OpenAIConfig) bool {
	if cfg == nil {
		return false
	}
	return strings.EqualFold(strings.TrimSpace(cfg.Provider), "claude") ||
		strings.EqualFold(strings.TrimSpace(cfg.Provider), "anthropic")
}
"""
    new = old + f"""
func isGeminiProvider(cfg *config.OpenAIConfig) bool {{
	if cfg == nil {{
		return false
	}}
	provider := strings.TrimSpace(cfg.Provider)
	return strings.EqualFold(provider, "gemini") ||
		strings.EqualFold(provider, "google")
}}

func defaultOpenAIBaseURL(cfg *config.OpenAIConfig) string {{
	if isGeminiProvider(cfg) {{
		return "{GEMINI_BASE_URL}"
	}}
	return "https://api.openai.com/v1"
}}
"""
    bridge.write_text(replace_once(text, old, new, "Gemini backend helpers"), encoding="utf-8")

    openai_go = root / "internal/openai/openai.go"
    text = openai_go.read_text(encoding="utf-8")
    text = text.replace(
        '	if baseURL == "" {\n		baseURL = "https://api.openai.com/v1"\n	}\n',
        '	if baseURL == "" {\n		baseURL = defaultOpenAIBaseURL(c.config)\n	}\n',
    )
    openai_go.write_text(text, encoding="utf-8")

    handler = root / "internal/handler/config.go"
    text = handler.read_text(encoding="utf-8")
    text = replace_once(
        text,
        '		if strings.EqualFold(strings.TrimSpace(req.Provider), "claude") {\n'
        '			baseURL = "https://api.anthropic.com"\n'
        "		} else {\n"
        '			baseURL = "https://api.openai.com/v1"\n'
        "		}\n",
        '		if strings.EqualFold(strings.TrimSpace(req.Provider), "claude") {\n'
        '			baseURL = "https://api.anthropic.com"\n'
        '		} else if strings.EqualFold(strings.TrimSpace(req.Provider), "gemini") || strings.EqualFold(strings.TrimSpace(req.Provider), "google") {\n'
        f'			baseURL = "{GEMINI_BASE_URL}"\n'
        "		} else {\n"
        '			baseURL = "https://api.openai.com/v1"\n'
        "		}\n",
        "Gemini test default base URL",
    )
    text = replace_once(
        text,
        '		"max_completion_tokens": 5,\n',
        '		"max_completion_tokens": 5,\n'
        "	}\n"
        '	if strings.EqualFold(strings.TrimSpace(req.Provider), "gemini") || strings.EqualFold(strings.TrimSpace(req.Provider), "google") {\n'
        '		delete(payload, "max_completion_tokens")\n'
        '		payload["max_tokens"] = 5\n',
        "Gemini test max token field",
    )
    handler.write_text(text, encoding="utf-8")

    openapi = root / "internal/handler/openapi.go"
    text = openapi.read_text(encoding="utf-8")
    text = text.replace("LLM提供商（openai/claude）", "LLM提供商（openai/gemini/claude）")
    openapi.write_text(text, encoding="utf-8")


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: add-gemini-provider.py /path/to/CyberStrikeAI")
    root = Path(sys.argv[1]).resolve()
    patch_index(root)
    patch_settings_js(root)
    patch_i18n(root)
    patch_openai_backend(root)


if __name__ == "__main__":
    main()
