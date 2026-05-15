import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SHELL_LABEL } from "@/data/lab";
import { cn } from "@/lib/utils";

type Props = {
  as?: string;
  code: string;
  explanation?: string;
};

export function CommandBlock({ as = "host", code, explanation }: Props) {
  const [copied, setCopied] = useState(false);
  const label = SHELL_LABEL[as] ?? as;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* sin clipboard */
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-md border border-border/70 bg-secondary/40">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-background/40 px-3 py-1.5">
        <span
          className={cn(
            "mono text-[11px] uppercase tracking-[0.18em]",
            "text-muted-foreground",
          )}
        >
          <span className="text-primary">▌</span> {label}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          <span className="ml-1.5">{copied ? "Copiado" : "Copiar"}</span>
        </Button>
      </div>
      <pre className="mono overflow-x-auto px-3 py-3 text-[13px] leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
      {explanation && (
        <p className="border-t border-border/60 bg-background/30 px-3 py-2 text-xs text-muted-foreground">
          {explanation}
        </p>
      )}
    </div>
  );
}
