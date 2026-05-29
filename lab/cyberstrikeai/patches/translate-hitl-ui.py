#!/usr/bin/env python3
"""Move visible HITL texts out of hard-coded Chinese."""

from __future__ import annotations

import json
import sys
from pathlib import Path


UPSTREAM_INLINE_PANEL = (
    "    const panel = document.createElement('div');\n"
    "    panel.className = 'hitl-inline-approval';\n"
    "    panel.innerHTML = `\n"
    "        <div class=\"hitl-input-help\"><strong>${escapeHtml(toolName)}</strong> "
    "\u5f85\u4eba\u5de5\u5ba1\u6279\u3002"
    "\u6a21\u5f0f\uff1a${escapeHtml(mode || '-')}\u3002</div>\n"
    "        ${allowEdit\n"
    "            ? `<div class=\"hitl-input-help\">"
    "\u5ba1\u67e5\u7f16\u8f91\u53c2\u6570\uff08JSON\uff0c\u53ef\u9009\uff09\uff1a"
    "\u7559\u7a7a\u8868\u793a\u6cbf\u7528\u539f\u53c2\u6570\u3002"
    "</div>\n"
    "               <textarea class=\"hitl-edit-args hitl-inline-edit\" placeholder='{\"command\":\"ls -la\"}'>${escapeHtml(argsJSON === '{}' ? '' : argsJSON)}</textarea>`\n"
    "            : '<div class=\"hitl-input-help\">"
    "\u5f53\u524d\u6a21\u5f0f\u4e0d\u652f\u6301\u6539\u53c2\uff0c"
    "\u4ec5\u53ef\u901a\u8fc7/\u62d2\u7edd\u3002"
    "</div>'\n"
    "        }\n"
    "        <div class=\"hitl-input-help\">"
    "\u5907\u6ce8\uff08\u53ef\u9009\uff09\uff1a"
    "\u5efa\u8bae\u5199\u5ba1\u6279\u4f9d\u636e\u3002"
    "</div>\n"
    "        <input class=\"hitl-config-input hitl-inline-comment\" type=\"text\" placeholder=\""
    "\u4f8b\u5982\uff1a\u5141\u8bb8\u53ea\u8bfb\u547d\u4ee4"
    "\">\n"
    "        <div class=\"hitl-pending-actions\">\n"
    "            <button class=\"btn-secondary hitl-inline-reject\">"
    "\u62d2\u7edd"
    "</button>\n"
    "            <button class=\"btn-primary hitl-inline-approve\">"
    "\u901a\u8fc7"
    "</button>\n"
    "        </div>\n"
    "        <div class=\"hitl-input-help hitl-inline-status\"></div>\n"
    "    `;\n"
)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    if old not in text:
        raise SystemExit(f"patch failed: marker not found for {label}")
    return text.replace(old, new, 1)


def patch_monitor_js(root: Path) -> None:
    path = root / "web/static/js/monitor.js"
    text = path.read_text(encoding="utf-8")

    helper = r'''
function hitlText(key, opts, fallback) {
    if (typeof window.t === 'function') {
        const out = window.t(key, opts || {});
        if (out && out !== key) return out;
    }
    let text = fallback || key;
    if (opts && typeof opts === 'object') {
        Object.keys(opts).forEach(function (name) {
            text = text.replace(new RegExp('{{\\s*' + name + '\\s*}}', 'g'), String(opts[name]));
        });
    }
    return text;
}

function hitlModeLabel(mode) {
    if (mode === 'review_edit') return hitlText('chat.hitlModeReviewEdit', null, 'Review & Edit');
    if (mode === 'approval') return hitlText('chat.hitlModeApproval', null, 'Approval');
    if (mode === 'off') return hitlText('chat.hitlModeOff', null, 'Off');
    return mode || '-';
}

'''
    text = replace_once(
        text,
        "function renderInlineHitlApproval(itemId, data) {\n",
        helper + "function renderInlineHitlApproval(itemId, data) {\n",
        "HITL i18n helpers",
    )

    new = r'''    const modeLabel = hitlModeLabel(mode);
    const pendingText = hitlText('hitl.inlinePendingTitle', { tool: toolName, mode: modeLabel }, '{{tool}} is waiting for human approval. Mode: {{mode}}.');
    const reviewHelp = hitlText('hitl.reviewEditHelp', null, 'Review & edit mode: provide a JSON object to override tool arguments. Example: {"command":"ls -la"}');
    const approvalHelp = hitlText('hitl.approvalHelp', null, 'Approval mode: only approve/reject, argument editing is disabled.');
    const commentHelp = hitlText('hitl.commentHelp', null, 'Comment (optional): briefly note the approval reason.');
    const commentPlaceholder = hitlText('hitl.commentPlaceholder', null, 'e.g. allow read-only command');
    const rejectText = hitlText('hitl.reject', null, 'Reject');
    const approveText = hitlText('hitl.approve', null, 'Approve');

    const panel = document.createElement('div');
    panel.className = 'hitl-inline-approval';
    panel.innerHTML = `
        <div class="hitl-input-help">${escapeHtml(pendingText)}</div>
        ${allowEdit
            ? `<div class="hitl-input-help">${escapeHtml(reviewHelp)}</div>
               <textarea class="hitl-edit-args hitl-inline-edit" placeholder='{"command":"ls -la"}'>${escapeHtml(argsJSON === '{}' ? '' : argsJSON)}</textarea>`
            : `<div class="hitl-input-help">${escapeHtml(approvalHelp)}</div>`
        }
        <div class="hitl-input-help">${escapeHtml(commentHelp)}</div>
        <input class="hitl-config-input hitl-inline-comment" type="text" placeholder="${escapeHtml(commentPlaceholder)}">
        <div class="hitl-pending-actions">
            <button class="btn-secondary hitl-inline-reject">${escapeHtml(rejectText)}</button>
            <button class="btn-primary hitl-inline-approve">${escapeHtml(approveText)}</button>
        </div>
        <div class="hitl-input-help hitl-inline-status"></div>
    `;
'''
    text = replace_once(text, UPSTREAM_INLINE_PANEL, new, "inline HITL panel texts")

    replacements = {
        "statusEl.textContent = 'JSON \u53c2\u6570\u683c\u5f0f\u9519\u8bef';": "statusEl.textContent = hitlText('hitl.invalidJson', null, 'Invalid JSON arguments');",
        "statusEl.textContent = '\u63d0\u4ea4\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5';": "statusEl.textContent = hitlText('hitl.submitRetry', null, 'Submit failed, please retry');",
        "statusEl.textContent = '\u5ba1\u6279\u51fd\u6570\u672a\u52a0\u8f7d';": "statusEl.textContent = hitlText('hitl.approvalFunctionMissing', null, 'Approval handler is not loaded');",
        "statusEl.textContent = decision === 'approve' ? '\u5df2\u901a\u8fc7\uff0c\u7b49\u5f85\u6267\u884c\u7ee7\u7eed...' : '\u5df2\u62d2\u7edd\uff0c\u53cd\u9988\u5df2\u4ea4\u7ed9\u6a21\u578b\u7ee7\u7eed\u8fed\u4ee3...';": "statusEl.textContent = decision === 'approve' ? hitlText('hitl.approvedStatus', null, 'Approved. Waiting for execution to continue...') : hitlText('hitl.rejectedStatus', null, 'Rejected. Feedback was sent to the model so it can continue...');",
        "statusEl.textContent = '\u63d0\u4ea4\u5931\u8d25\uff1a' + (e && e.message ? e.message : 'unknown error');": "statusEl.textContent = hitlText('hitl.submitFailedPrefix', null, 'Submit failed:') + ' ' + (e && e.message ? e.message : 'unknown error');",
    }
    for old_text, new_text in replacements.items():
        text = replace_once(text, old_text, new_text, old_text)

    path.write_text(text, encoding="utf-8")


def patch_i18n(root: Path) -> None:
    additions = {
        "en-US.json": {
            "inlinePendingTitle": "{{tool}} is waiting for human approval. Mode: {{mode}}.",
            "submitRetry": "Submit failed, please retry",
            "approvalFunctionMissing": "Approval handler is not loaded",
            "approvedStatus": "Approved. Waiting for execution to continue...",
            "rejectedStatus": "Rejected. Feedback was sent to the model so it can continue...",
        },
        "zh-CN.json": {
            "inlinePendingTitle": "{{tool}} is waiting for human approval. Mode: {{mode}}.",
            "reviewEditHelp": "Review & edit mode: provide a JSON object to override tool arguments. Example: {\"command\":\"ls -la\"}",
            "approvalHelp": "Approval mode: only approve/reject, argument editing is disabled.",
            "commentHelp": "Comment (optional): briefly note the approval reason.",
            "commentPlaceholder": "e.g. allow read-only command",
            "reject": "Reject",
            "approve": "Approve",
            "invalidJson": "Invalid JSON arguments",
            "submitFailedPrefix": "Submit failed:",
            "submitRetry": "Submit failed, please retry",
            "approvalFunctionMissing": "Approval handler is not loaded",
            "approvedStatus": "Approved. Waiting for execution to continue...",
            "rejectedStatus": "Rejected. Feedback was sent to the model so it can continue...",
        },
    }
    for filename, values in additions.items():
        path = root / "web/static/i18n" / filename
        data = json.loads(path.read_text(encoding="utf-8"))
        hitl = data.setdefault("hitl", {})
        hitl.update(values)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def patch_backend_hitl_messages(root: Path) -> None:
    path = root / "internal/handler/hitl.go"
    text = path.read_text(encoding="utf-8")
    required = {
        '"\u547d\u4e2d\u4eba\u673a\u534f\u540c\u5ba1\u6279"': '"HITL approval required"',
        '"\u4eba\u5de5\u62d2\u7edd\u672c\u6b21\u5de5\u5177\u8c03\u7528\uff0c\u6a21\u578b\u5c06\u57fa\u4e8e\u53cd\u9988\u7ee7\u7eed\u8fed\u4ee3"': '"Human rejected this tool call. The model will continue with the feedback."',
        '"\u4eba\u5de5\u786e\u8ba4\u901a\u8fc7\uff0c\u7ee7\u7eed\u6267\u884c"': '"Human approval granted. Continuing execution."',
    }
    optional = {
        '"HITL \u5ba1\u6279\u51b3\u7b56"': '"HITL approval decision"',
    }
    for old, new in required.items():
        text = replace_once(text, old, new, old)
    for old, new in optional.items():
        text = text.replace(old, new)
    path.write_text(text, encoding="utf-8")


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: translate-hitl-ui.py /path/to/CyberStrikeAI")
    root = Path(sys.argv[1]).resolve()
    patch_monitor_js(root)
    patch_i18n(root)
    patch_backend_hitl_messages(root)


if __name__ == "__main__":
    main()
