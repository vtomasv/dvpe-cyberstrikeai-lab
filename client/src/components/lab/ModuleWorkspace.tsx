/**
 * ModuleWorkspace
 * ---------------
 * Panel central de la guía. Muestra UN módulo a la vez con:
 *   - Header compacto (número, título, equipo, tiempo, progreso)
 *   - Tabs Manual (Attacker-PC) ↔ Asistido (CyberStrikeAI)
 *   - Stepper interno: un paso/bloque visible por vez con navegación ←/→
 *   - Persistencia de paso y tab activos por módulo (delegada al padre)
 */

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  Circle,
  Clock,
  Cpu,
  Sparkles,
  Target,
  Terminal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

import { CommandBlock } from "@/components/lab/CommandBlock";
import { Spoiler } from "@/components/lab/Spoiler";
import type { CSAIBlock, Module, Step } from "@/data/lab";
import { TEAM_LABEL } from "@/data/lab";
import { cn } from "@/lib/utils";

type TabKey = "manual" | "csai";

type Props = {
  mod: Module;
  isDone: (id: string) => boolean;
  toggle: (id: string) => void;
  completedCount: (ids: string[]) => number;
  activeStepId?: string;
  activeTab: TabKey;
  onChangeStep: (stepId: string) => void;
  onChangeTab: (tab: TabKey) => void;
  onPrevModule?: () => void;
  onNextModule?: () => void;
  prevModuleTitle?: string;
  nextModuleTitle?: string;
};

export function ModuleWorkspace({
  mod,
  isDone,
  toggle,
  completedCount,
  activeStepId,
  activeTab,
  onChangeStep,
  onChangeTab,
  onPrevModule,
  onNextModule,
  prevModuleTitle,
  nextModuleTitle,
}: Props) {
  const team = TEAM_LABEL[mod.team];

  // Items navegables: en manual son los pasos; en csai son los bloques.
  const items = useMemo(() => {
    if (activeTab === "manual") {
      return mod.steps.map((s) => ({ kind: "step" as const, id: s.id, data: s }));
    }
    const blocks = mod.csai?.blocks ?? [];
    return blocks.map((b) => ({ kind: "csai" as const, id: b.id, data: b }));
  }, [activeTab, mod]);

  const activeIndex = Math.max(
    0,
    items.findIndex((i) => i.id === activeStepId),
  );
  const safeIndex = activeIndex === -1 ? 0 : activeIndex;
  const current = items[safeIndex];

  // Si el step activo no pertenece al tab actual, ajustamos al primero.
  useEffect(() => {
    if (!activeStepId || activeIndex === -1) {
      if (items[0]) onChangeStep(items[0].id);
    }
  }, [activeStepId, activeIndex, items, onChangeStep]);

  const stepIds = mod.steps.map((s) => s.id);
  const done = completedCount(stepIds);
  const total = stepIds.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col">
      {/* Header compacto del módulo */}
      <header className="border-b border-border/60 bg-background/40 px-6 pt-5 pb-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="mono" style={{ color: team.color }}>{mod.number}</span>
              <span
                className="inline-flex items-center gap-1.5 rounded border border-border/60 bg-background/40 px-2 py-0.5"
                style={{ color: team.color }}
              >
                {team.label}
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Clock className="size-3.5" /> {mod.estMin} min
              </span>
            </div>
            <h2 className="display mt-1.5 text-2xl font-semibold leading-tight sm:text-3xl">
              {mod.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{mod.subtitle}</p>
          </div>
          <div className="min-w-[220px] max-w-[320px] flex-1">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span>Progreso del módulo</span>
              <span className="mono text-primary">{done}/{total}</span>
            </div>
            <Progress value={pct} className="mt-2 h-1.5" />
          </div>
        </div>

        {/* Objetivos compactos */}
        <ul className="mt-4 grid gap-1.5 text-sm sm:grid-cols-2">
          {mod.goals.map((g, i) => (
            <li key={i} className="flex items-start gap-2 text-muted-foreground">
              <Target className="mt-0.5 size-3.5 text-primary/70" />
              <span>{g}</span>
            </li>
          ))}
        </ul>

        {/* Tabs Manual / CSAI */}
        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={(v) => onChangeTab(v as TabKey)}>
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="manual" className="gap-2 text-sm">
                <Terminal className="size-3.5" />
                Manual · Attacker-PC
                <span className="mono ml-1 text-[10px] text-muted-foreground">
                  {mod.steps.length} pasos
                </span>
              </TabsTrigger>
              <TabsTrigger value="csai" className="gap-2 text-sm" disabled={!mod.csai}>
                <Bot className="size-3.5" />
                Asistido · CyberStrikeAI
                <span className="mono ml-1 text-[10px] text-muted-foreground">
                  {mod.csai?.blocks.length ?? 0} bloques
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Body con dos columnas: lista de pasos + detalle */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[260px_1fr]">
        {/* Lista vertical compacta */}
        <aside className="hidden border-r border-border/60 bg-background/30 lg:block">
          <ScrollArea className="h-full">
            <ol className="p-3">
              {items.map((item, idx) => {
                const isActive = idx === safeIndex;
                const checked = item.kind === "step" ? isDone(item.id) : false;
                const title =
                  item.kind === "step"
                    ? (item.data as Step).title
                    : (item.data as CSAIBlock).title;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onChangeStep(item.id)}
                      className={cn(
                        "group flex w-full items-start gap-2 rounded-md border border-transparent px-2.5 py-2 text-left transition-colors",
                        isActive
                          ? "border-primary/40 bg-primary/[0.06]"
                          : "hover:border-border/60 hover:bg-background/40",
                      )}
                    >
                      <span className="mt-0.5">
                        {item.kind === "step" ? (
                          checked ? (
                            <CheckCircle2 className="size-4 text-primary" />
                          ) : (
                            <Circle className="size-4 text-muted-foreground/60" />
                          )
                        ) : (
                          <Sparkles className="size-4 text-primary/70" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {item.kind === "step" ? `paso ${idx + 1}` : `bloque ${idx + 1}`}
                        </span>
                        <span className="display block truncate text-sm">{title}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </ScrollArea>
        </aside>

        {/* Detalle del paso/bloque actual */}
        <div className="min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="mx-auto max-w-3xl p-6 pb-10">
              <AnimatePresence mode="wait">
                {current && (
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                    className="space-y-5"
                  >
                    {current.kind === "step" ? (
                      <StepCard
                        step={current.data as Step}
                        index={safeIndex}
                        total={items.length}
                        checked={isDone(current.id)}
                        onToggle={() => toggle(current.id)}
                      />
                    ) : (
                      <CSAICard
                        block={current.data as CSAIBlock}
                        index={safeIndex}
                        total={items.length}
                        role={mod.csai?.role}
                        model={mod.csai?.model}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navegación inferior */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    if (safeIndex > 0) onChangeStep(items[safeIndex - 1].id);
                    else if (onPrevModule) onPrevModule();
                  }}
                  disabled={safeIndex === 0 && !onPrevModule}
                >
                  <ArrowLeft className="size-4" />
                  {safeIndex > 0
                    ? "Anterior"
                    : prevModuleTitle
                      ? `Módulo anterior · ${prevModuleTitle}`
                      : "Anterior"}
                </Button>

                <span className="mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {safeIndex + 1} / {items.length}
                </span>

                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    if (safeIndex < items.length - 1) {
                      // Marcar el paso manual completado al avanzar (UX fluida).
                      if (current?.kind === "step" && !isDone(current.id)) {
                        toggle(current.id);
                      }
                      onChangeStep(items[safeIndex + 1].id);
                    } else if (onNextModule) {
                      if (current?.kind === "step" && !isDone(current.id)) {
                        toggle(current.id);
                      }
                      onNextModule();
                    }
                  }}
                  disabled={safeIndex === items.length - 1 && !onNextModule}
                >
                  {safeIndex < items.length - 1
                    ? "Siguiente"
                    : nextModuleTitle
                      ? `Módulo siguiente · ${nextModuleTitle}`
                      : "Finalizar"}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function StepCard({
  step,
  index,
  total,
  checked,
  onToggle,
}: {
  step: Step;
  index: number;
  total: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            paso {index + 1} de {total}
          </p>
          <h3 className="display mt-1 text-xl font-medium">{step.title}</h3>
        </div>
        <Button
          size="sm"
          variant={checked ? "default" : "outline"}
          onClick={onToggle}
          className="gap-2 bg-background/30"
        >
          {checked ? (
            <>
              <CheckCircle2 className="size-4" /> Completado
            </>
          ) : (
            <>
              <Circle className="size-4" /> Marcar paso
            </>
          )}
        </Button>
      </div>

      <p className="text-sm text-foreground/90">{step.description}</p>

      {step.commands && step.commands.length > 0 && (
        <div className="space-y-3">
          {step.commands.map((c, i) => (
            <CommandBlock
              key={`${step.id}-cmd-${i}`}
              as={c.as}
              code={c.code}
              explanation={c.explanation}
            />
          ))}
        </div>
      )}

      {step.hint && (
        <p className="rounded-md border border-border/60 bg-background/30 px-3 py-2 text-sm text-muted-foreground">
          <span className="mono mr-2 text-[10px] uppercase tracking-[0.18em] text-primary">
            pista
          </span>
          {step.hint}
        </p>
      )}

      {step.spoiler && (
        <Spoiler label={step.spoiler.label} content={step.spoiler.content} />
      )}
    </article>
  );
}

function CSAICard({
  block,
  index,
  total,
  role,
  model,
}: {
  block: CSAIBlock;
  index: number;
  total: number;
  role?: string;
  model?: string;
}) {
  return (
    <article className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            bloque {index + 1} de {total} · CyberStrikeAI
          </p>
          <h3 className="display mt-1 text-xl font-medium">{block.title}</h3>
        </div>
        {(role || model) && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {role && (
              <span className="inline-flex items-center gap-1 rounded border border-border/60 bg-background/40 px-2 py-1">
                <Bot className="size-3.5" /> {role}
              </span>
            )}
            {model && (
              <span className="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/[0.06] px-2 py-1 text-primary">
                <Cpu className="size-3.5" /> {model}
              </span>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-foreground/90">{block.description}</p>

      <div>
        <p className="mono mb-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          prompt sugerido
        </p>
        <CommandBlock as="csai" code={block.prompt} />
      </div>

      <div className="rounded-md border border-border/60 bg-background/30 px-3 py-2 text-sm">
        <p className="mono mb-1 text-[10px] uppercase tracking-[0.18em] text-primary">
          se espera
        </p>
        <p className="text-foreground/90">{block.expect}</p>
      </div>

      {block.hint && (
        <p className="rounded-md border border-amber-300/30 bg-amber-300/[0.06] px-3 py-2 text-sm text-amber-100/95">
          <span className="mono mr-2 text-[10px] uppercase tracking-[0.18em] text-amber-300">
            HITL
          </span>
          {block.hint}
        </p>
      )}
    </article>
  );
}
