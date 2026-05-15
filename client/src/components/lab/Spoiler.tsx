import { useState } from "react";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  content: string;
};

export function Spoiler({ label, content }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-md border border-dashed border-amber-400/40 bg-amber-400/[0.06]",
        "px-3 py-2 text-sm",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-amber-300/90">
          <ShieldAlert className="size-3.5" />
          <span className="display text-xs uppercase tracking-[0.18em]">
            Spoiler · uso docente
          </span>
        </span>
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded border border-amber-300/30 px-2 py-0.5",
            "text-xs text-amber-200 hover:bg-amber-300/10",
          )}
        >
          {open ? (
            <>
              <EyeOff className="size-3.5" /> Ocultar
            </>
          ) : (
            <>
              <Eye className="size-3.5" /> {label}
            </>
          )}
        </button>
      </div>
      {open && (
        <p className="mono mt-2 whitespace-pre-wrap break-words text-amber-100/95">
          {content}
        </p>
      )}
    </div>
  );
}
