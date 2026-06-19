#!/usr/bin/env python3
"""Make Eino tool-call compatibility failures actionable for the lab."""

from __future__ import annotations

import sys
from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    # Idempotente: si el cambio ya esta aplicado, no hacemos nada.
    if new in text:
        return text
    # Tolerante a drift del upstream: si el marcador ya no existe (porque la
    # version clonada de CyberStrikeAI cambio ese codigo), avisamos por stderr
    # y seguimos sin abortar el build. Esto solo omite un ajuste de UX/copy
    # puntual; el laboratorio sigue funcionando.
    if old not in text:
        print(
            f"[patch][warn] marcador no encontrado para '{label}' "
            f"(probable cambio de version del upstream); se omite este ajuste.",
            file=sys.stderr,
        )
        return text
    return text.replace(old, new, 1)


def patch_multi_agent_handler(root: Path) -> None:
    path = root / "internal/handler/multi_agent.go"
    text = path.read_text(encoding="utf-8")

    text = replace_once(
        text,
        '		errMsg := "执行失败: " + runErr.Error()\n',
        '		errMsg := h.formatEinoRunErrorMessage(orch, runErr)\n',
        "streaming Eino run error message",
    )
    text = replace_once(
        text,
        '		errMsg := "执行失败: " + runErr.Error()\n',
        '		errMsg := h.formatEinoRunErrorMessage(strings.TrimSpace(req.Orchestration), runErr)\n',
        "non-streaming Eino run error message",
    )

    helper = r'''
func (h *AgentHandler) formatEinoRunErrorMessage(orch string, err error) string {
	if err == nil {
		return "Ejecucion fallida"
	}
	raw := err.Error()
	msg := "Ejecucion fallida: " + raw
	if strings.Contains(strings.ToLower(raw), "thought_signature") {
		return "Ejecucion fallida: Gemini rechazo el siguiente turno de herramientas porque falta thought_signature. " +
			"Esto ocurre con modelos Gemini 3.x cuando la capa OpenAI-compatible no preserva esa metadata entre tool calls. " +
			"Usa gemini-2.5-flash para flujos con herramientas, o usa OpenAI/Claude hasta actualizar la compatibilidad. " +
			"Detalle original: " + raw
	}
	if !strings.Contains(strings.ToLower(raw), "no tool call") {
		return msg
	}

	mode := config.NormalizeMultiAgentOrchestration(orch)
	provider := ""
	baseURL := ""
	model := ""
	if h != nil && h.config != nil {
		provider = strings.TrimSpace(h.config.OpenAI.Provider)
		baseURL = strings.TrimSpace(h.config.OpenAI.BaseURL)
		model = strings.TrimSpace(h.config.OpenAI.Model)
	}
	return "Ejecucion fallida: el modo Eino " + mode + " esperaba una llamada a herramienta, " +
		"pero el modelo respondio sin tool call. Config actual: provider=" + provider +
		", base_url=" + baseURL + ", model=" + model + ". En el laboratorio usa el modo ReAct " +
		"para modelos locales que no sigan bien tool-calling, o cambia a un modelo con tool-calling estable " +
		"como llama3.1:8b, Gemini u OpenAI. Detalle original: " + raw
}

'''
    text = replace_once(
        text,
        "// persistEinoAgentTraceForResume 在 Eino 运行异常结束时写入代理轨迹（库列 last_react_*），供下一请求 loadHistoryFromAgentTrace 软续跑。\n",
        helper + "// persistEinoAgentTraceForResume 在 Eino 运行异常结束时写入代理轨迹（库列 last_react_*），供下一请求 loadHistoryFromAgentTrace 软续跑。\n",
        "Eino no-tool-call helper",
    )
    path.write_text(text, encoding="utf-8")


def patch_chat_ui(root: Path) -> None:
    path = root / "web/static/js/chat.js"
    text = path.read_text(encoding="utf-8")

    helper = r'''
function chatAgentModeUsesStructuredToolCalls(mode) {
    return chatAgentModeIsEinoSingle(mode) || chatAgentModeIsEino(mode);
}

function chatLLMIsKnownWeakForEinoToolCalls(cfg) {
    const openai = cfg && cfg.openai ? cfg.openai : {};
    const provider = String(openai.provider || '').trim().toLowerCase();
    const baseURL = String(openai.base_url || '').trim().toLowerCase();
    const model = String(openai.model || '').trim().toLowerCase();
    if (provider === 'gemini' || provider === 'google' || provider === 'claude' || provider === 'anthropic') {
        return false;
    }
    if (!baseURL.includes('ollama')) return false;
    return model.startsWith('gemma') || model.startsWith('deepseek-r1');
}

function chatAgentModeNormalizeForLLM(mode, cfg) {
    if (chatAgentModeUsesStructuredToolCalls(mode) && chatLLMIsKnownWeakForEinoToolCalls(cfg)) {
        return CHAT_AGENT_MODE_REACT;
    }
    return mode;
}

function chatAgentModeCompatibilityMessage() {
    return 'Este modo requiere tool-calling estable. Con este modelo local usa ReAct o cambia a llama3.1:8b, Gemini u OpenAI.';
}

'''
    text = replace_once(
        text,
        "function normalizeHitlMode(mode) {\n",
        helper + "function normalizeHitlMode(mode) {\n",
        "chat LLM compatibility helpers",
    )

    text = replace_once(
        text,
        "    if (s === CHAT_AGENT_MODE_REACT || chatAgentModeIsEinoSingle(s)) return s;\n"
        "    if (chatAgentModeIsEino(s)) {\n"
        "        return multiOn ? s : CHAT_AGENT_MODE_REACT;\n"
        "    }\n",
        "    if (s === CHAT_AGENT_MODE_REACT) return s;\n"
        "    if (chatAgentModeIsEinoSingle(s)) return chatAgentModeNormalizeForLLM(s, cfg);\n"
        "    if (chatAgentModeIsEino(s)) {\n"
        "        return multiOn ? chatAgentModeNormalizeForLLM(s, cfg) : CHAT_AGENT_MODE_REACT;\n"
        "    }\n",
        "normalize stored mode for weak local LLMs",
    )

    text = replace_once(
        text,
        "        normalizeStored: chatAgentModeNormalizeStored,\n"
        "        normalizeOrchestration: normalizeOrchestrationClient\n",
        "        normalizeStored: chatAgentModeNormalizeStored,\n"
        "        normalizeForLLM: chatAgentModeNormalizeForLLM,\n"
        "        normalizeOrchestration: normalizeOrchestrationClient\n",
        "expose normalizeForLLM",
    )

    text = replace_once(
        text,
        "function selectAgentMode(mode) {\n"
        "    const ok = mode === CHAT_AGENT_MODE_REACT || chatAgentModeIsEinoSingle(mode) || chatAgentModeIsEino(mode);\n"
        "    if (!ok) return;\n"
        "    try {\n",
        "function selectAgentMode(mode) {\n"
        "    const ok = mode === CHAT_AGENT_MODE_REACT || chatAgentModeIsEinoSingle(mode) || chatAgentModeIsEino(mode);\n"
        "    if (!ok) return;\n"
        "    const normalized = chatAgentModeNormalizeForLLM(mode, window.__csaiAppConfig || null);\n"
        "    if (normalized !== mode) {\n"
        "        mode = normalized;\n"
        "        showChatToast(chatAgentModeCompatibilityMessage(), 'warning');\n"
        "    }\n"
        "    try {\n",
        "select mode compatibility guard",
    )

    text = replace_once(
        text,
        "            window.__csaiMultiAgentPublic = cfg.multi_agent || null;\n",
        "            window.__csaiMultiAgentPublic = cfg.multi_agent || null;\n"
        "            window.__csaiAppConfig = cfg || null;\n",
        "store app config for chat compatibility",
    )

    text = replace_once(
        text,
        "        const modeSel = document.getElementById('agent-mode-select');\n"
        "        const modeVal = modeSel ? modeSel.value : CHAT_AGENT_MODE_REACT;\n",
        "        const modeSel = document.getElementById('agent-mode-select');\n"
        "        let modeVal = modeSel ? modeSel.value : CHAT_AGENT_MODE_REACT;\n"
        "        const normalizedModeVal = chatAgentModeNormalizeForLLM(modeVal, window.__csaiAppConfig || null);\n"
        "        if (normalizedModeVal !== modeVal) {\n"
        "            modeVal = normalizedModeVal;\n"
        "            try { localStorage.setItem(AGENT_MODE_STORAGE_KEY, modeVal); } catch (e) { /* ignore */ }\n"
        "            syncAgentModeFromValue(modeVal);\n"
        "            showChatToast(chatAgentModeCompatibilityMessage(), 'warning');\n"
        "        }\n",
        "send mode compatibility guard",
    )
    path.write_text(text, encoding="utf-8")


def patch_reasoning_effort_max(root: Path) -> None:
    """Evita el 400 'reasoning_effort does not support max' degradando 'max' a 'high'.

    Algunos endpoints OpenAI-compatible (Gemini via capa OpenAI, gateways, etc.)
    solo aceptan none/low/medium/high/xhigh para reasoning_effort y rechazan
    'max' con HTTP 400. El config.yaml del upstream trae effort: max por
    defecto, asi que si el binario llega a leerlo (mode auto/on) se dispara el
    error en el nodo Eino [node_1, ChatModel]. Este parche degrada 'max' a
    'high' en internal/reasoning/eino.go, que es un valor universalmente
    aceptado, sin tocar el resto de la logica de razonamiento.
    """
    path = root / "internal/reasoning/eino.go"
    text = path.read_text(encoding="utf-8")

    # Rama applyOpenAICompat: 'max' generaba ExtraFields["reasoning_effort"]="max".
    text = replace_once(
        text,
        '	if e == "max" {\n'
        '		if cfg.ExtraFields == nil {\n'
        '			cfg.ExtraFields = make(map[string]any)\n'
        '		}\n'
        '		cfg.ExtraFields["reasoning_effort"] = "max"\n'
        '		return\n'
        '	}\n',
        '	if e == "max" {\n'
        '		// Lab fix: muchos endpoints OpenAI-compatible rechazan "max" (400).\n'
        '		// Degradamos a "high", que es un valor universalmente aceptado.\n'
        '		cfg.ReasoningEffort = einoopenai.ReasoningEffortLevelHigh\n'
        '		return\n'
        '	}\n',
        "openai_compat reasoning_effort max -> high",
    )

    # Rama applyDeepseek: reasoning_effort se pasa via effortStringForAPI(effort);
    # forzamos que 'max' baje a 'high' antes de serializar.
    text = replace_once(
        text,
        'func effortStringForAPI(e string) string {\n'
        '	// Gateways expect lowercase strings; "max" kept as max.\n'
        '	return strings.ToLower(strings.TrimSpace(e))\n'
        '}\n',
        'func effortStringForAPI(e string) string {\n'
        '	// Lab fix: "max" no es aceptado por varios endpoints OpenAI-compatible\n'
        '	// (solo none/low/medium/high/xhigh); lo degradamos a "high".\n'
        '	norm := strings.ToLower(strings.TrimSpace(e))\n'
        '	if norm == "max" {\n'
        '		norm = "high"\n'
        '	}\n'
        '	return norm\n'
        '}\n',
        "effortStringForAPI max -> high",
    )

    # Rama applyOutputConfigEffort tambien usa effortStringForAPI, asi que ya
    # queda cubierta por el cambio anterior.
    path.write_text(text, encoding="utf-8")


def patch_webshell_ui(root: Path) -> None:
    path = root / "web/static/js/webshell.js"
    text = path.read_text(encoding="utf-8")
    text = replace_once(
        text,
        "function wsSelectAgentMode(mode) {\n"
        "    try { localStorage.setItem('cyberstrike-chat-agent-mode', mode); } catch (e) { /* */ }\n",
        "function wsSelectAgentMode(mode) {\n"
        "    if (typeof window.csaiChatAgentMode === 'object' && typeof window.csaiChatAgentMode.normalizeForLLM === 'function') {\n"
        "        var normalized = window.csaiChatAgentMode.normalizeForLLM(mode, window.__csaiAppConfig || null);\n"
        "        if (normalized !== mode) {\n"
        "            mode = normalized;\n"
        "            if (typeof window.showChatToast === 'function') window.showChatToast('Este modo requiere tool-calling estable. Con este modelo local usa ReAct o cambia a llama3.1:8b, Gemini u OpenAI.', 'warning');\n"
        "        }\n"
        "    }\n"
        "    try { localStorage.setItem('cyberstrike-chat-agent-mode', mode); } catch (e) { /* */ }\n",
        "webshell select mode compatibility guard",
    )
    path.write_text(text, encoding="utf-8")


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: improve-eino-toolcall-errors.py /path/to/CyberStrikeAI")
    root = Path(sys.argv[1]).resolve()
    patch_multi_agent_handler(root)
    patch_chat_ui(root)
    patch_webshell_ui(root)
    patch_reasoning_effort_max(root)


if __name__ == "__main__":
    main()
