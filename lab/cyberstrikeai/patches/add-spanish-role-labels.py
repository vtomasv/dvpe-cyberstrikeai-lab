#!/usr/bin/env python3
"""Display CyberStrikeAI's internal default role name in Spanish."""

from __future__ import annotations

import sys
from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    if old not in text:
        raise SystemExit(f"patch failed: marker not found for {label}")
    return text.replace(old, new, 1)


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: add-spanish-role-labels.py /path/to/CyberStrikeAI")

    root = Path(sys.argv[1]).resolve()
    path = root / "web/static/js/roles.js"
    text = path.read_text(encoding="utf-8")

    text = replace_once(
        text,
        """function rolePlainDescription(role) {
    const raw = typeof role.description === 'string' ? role.description.trim() : '';
    if (!raw) return '';
    if (raw === 'roles.noDescription' || raw === 'roles.noDescriptionShort') return '';
    return raw;
}
""",
        """function rolePlainDescription(role) {
    const raw = typeof role.description === 'string' ? role.description.trim() : '';
    if (!raw) return '';
    if (raw === 'roles.noDescription' || raw === 'roles.noDescriptionShort') return '';
    return raw;
}

function roleDisplayName(role) {
    if (role && role.name === '默认') return 'Predeterminado';
    return (role && role.name) || '';
}
""",
        "role display helper",
    )

    text = text.replace(
        "${escapeHtml(role.name)}</div>",
        "${escapeHtml(roleDisplayName(role))}</div>",
    )
    text = text.replace(
        "${escapeHtml(role.name)}\n                </h3>",
        "${escapeHtml(roleDisplayName(role))}\n                </h3>",
    )

    path.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
