import { NETWORKS } from "@/data/lab";
import { cn } from "@/lib/utils";
import { ServerCog } from "lucide-react";

export function NetworkMap() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {NETWORKS.map((net) => (
        <div
          key={net.id}
          className={cn(
            "relative overflow-hidden rounded-lg border border-border/70",
            "bg-card/60 p-4 shadow-[inset_0_1px_0_oklch(1_0_0/0.04)]",
          )}
        >
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <div>
              <p className="display text-xs uppercase tracking-[0.22em] text-muted-foreground">
                network_{net.id}
              </p>
              <p className="mono text-sm text-primary">{net.cidr}</p>
            </div>
            <span className="mono text-[11px] text-muted-foreground">
              {net.hosts.length} host{net.hosts.length === 1 ? "" : "s"}
            </span>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">{net.description}</p>
          <ul className="space-y-1.5">
            {net.hosts.map((host) => (
              <li
                key={`${net.id}-${host.name}`}
                className={cn(
                  "flex items-center justify-between gap-2 rounded border border-border/40",
                  "bg-background/40 px-2.5 py-1.5 text-sm",
                )}
              >
                <span className="flex items-center gap-2">
                  <ServerCog className="size-3.5 text-primary/80" />
                  <span className="display">{host.name}</span>
                </span>
                <span className="mono text-xs text-muted-foreground">{host.ip}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
