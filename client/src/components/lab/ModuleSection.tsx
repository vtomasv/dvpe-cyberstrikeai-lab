import { motion } from "framer-motion";
import { Check, ChevronRight, Clock4 } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CommandBlock } from "./CommandBlock";
import { Spoiler } from "./Spoiler";
import { TEAM_LABEL, type Module } from "@/data/lab";
import { cn } from "@/lib/utils";

type Props = {
  mod: Module;
  index: number;
  isDone: (id: string) => boolean;
  toggle: (id: string) => void;
  completedCount: (ids: string[]) => number;
};

export function ModuleSection({ mod, index, isDone, toggle, completedCount }: Props) {
  const stepIds = mod.steps.map((s) => s.id);
  const total = stepIds.length;
  const done = completedCount(stepIds);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const team = TEAM_LABEL[mod.team];

  return (
    <motion.section
      id={mod.id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.04 * index }}
      className={cn(
        "relative scroll-mt-24 rounded-xl border border-border/60",
        "bg-card/70 p-6 shadow-[inset_0_1px_0_oklch(1_0_0/0.04)] backdrop-blur-sm",
      )}
    >
      <header className="mb-6 flex flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-5">
          <span
            className="mono display flex size-12 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/40 text-sm tracking-[0.2em] text-primary"
          >
            {mod.number}
          </span>
          <div>
            <p className="display flex items-center gap-3 text-xs uppercase tracking-[0.22em]">
              <span
                className="rounded-full border px-2 py-0.5"
                style={{
                  borderColor: team.color,
                  color: team.color,
                }}
              >
                {team.label}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock4 className="size-3.5" />~{mod.estMin} min
              </span>
            </p>
            <h3 className="display mt-1 text-2xl font-semibold leading-tight">
              {mod.title}
            </h3>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{mod.subtitle}</p>
          </div>
        </div>
        <div className="w-full max-w-xs">
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span className="display uppercase tracking-[0.22em]">Progreso</span>
            <span className="mono">
              {done}/{total} · {pct}%
            </span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>
      </header>

      {mod.goals?.length > 0 && (
        <div className="mb-6 rounded-md border border-border/60 bg-background/30 p-4">
          <p className="display mb-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Objetivos
          </p>
          <ul className="space-y-1">
            {mod.goals.map((g) => (
              <li key={g} className="flex items-start gap-2 text-sm">
                <ChevronRight className="mt-1 size-3.5 text-primary" />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ol className="space-y-5">
        {mod.steps.map((step, i) => {
          const checked = isDone(step.id);
          return (
            <li
              key={step.id}
              className={cn(
                "relative rounded-lg border border-border/60 bg-background/30 p-5",
                "transition-colors",
                checked && "border-primary/40 bg-primary/[0.04]",
              )}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggle(step.id)}
                  className={cn(
                    "mt-1 flex size-7 shrink-0 items-center justify-center rounded-md border",
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/70 bg-background/40 text-muted-foreground hover:border-primary/60 hover:text-foreground",
                    "transition-colors",
                  )}
                  aria-label="Marcar paso completado"
                >
                  {checked ? (
                    <Check className="size-4" />
                  ) : (
                    <span className="mono text-xs">{i + 1}</span>
                  )}
                </button>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h4 className="display text-lg font-medium">{step.title}</h4>
                    <span className="mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      paso {i + 1}/{total}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>

                  {step.commands && step.commands.length > 0 && (
                    <div className="space-y-2">
                      {step.commands.map((c, ci) => (
                        <CommandBlock key={`${step.id}-cmd-${ci}`} as={c.as} code={c.code} explanation={c.explanation} />
                      ))}
                    </div>
                  )}

                  {step.hint && (
                    <p className="rounded-md border border-primary/30 bg-primary/[0.06] px-3 py-2 text-sm text-primary/90">
                      <span className="mono mr-2 text-[11px] uppercase tracking-[0.2em]">pista</span>
                      {step.hint}
                    </p>
                  )}

                  {step.spoiler && (
                    <Spoiler label={step.spoiler.label} content={step.spoiler.content} />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
        <span className="mono">
          // siguiente módulo: {index + 1 < 10 ? `0${index + 1}` : index + 1}
        </span>
        <Checkbox
          checked={done === total}
          aria-readonly
          className="pointer-events-none"
        />
      </div>
    </motion.section>
  );
}
