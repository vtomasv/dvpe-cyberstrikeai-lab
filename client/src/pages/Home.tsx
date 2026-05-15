/**
 * Home — guía interactiva del laboratorio DVPE × CyberStrikeAI.
 *
 * Estilo: Console / Editorial-Tech.
 *   • Layout fijo tipo app-shell: header sticky, sidebar de módulos a la izquierda,
 *     panel central con UN módulo a la vez. Sin scroll vertical global.
 *   • Tipografías: Space Grotesk (display) + JetBrains Mono (mono).
 *   • Densidad alta, controles inline y micro-interacciones cortas.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Github,
  Layers,
  Map as MapIcon,
  Network,
  RotateCcw,
  Terminal,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { NetworkMap } from "@/components/lab/NetworkMap";
import { ModuleWorkspace } from "@/components/lab/ModuleWorkspace";
import { useChecklist, useLabNav } from "@/hooks/useChecklist";

import { MODULES, TEAM_LABEL } from "@/data/lab";
import { cn } from "@/lib/utils";

const REPO_URL = "https://github.com/vtomasv/dvpe-cyberstrikeai-lab";

export default function Home() {
  const { isDone, toggle, completedCount, reset } = useChecklist();
  const {
    activeModule,
    activeStepByModule,
    activeTabByModule,
    setActiveModule,
    setActiveStep,
    setActiveTab,
  } = useLabNav(MODULES[0].id);

  const allStepIds = useMemo(() => MODULES.flatMap((m) => m.steps.map((s) => s.id)), []);
  const totalSteps = allStepIds.length;
  const totalDone = completedCount(allStepIds);
  const totalPct = totalSteps === 0 ? 0 : Math.round((totalDone / totalSteps) * 100);

  const activeIdx = MODULES.findIndex((m) => m.id === activeModule);
  const safeActive = activeIdx === -1 ? 0 : activeIdx;
  const mod = MODULES[safeActive];

  const prevMod = MODULES[safeActive - 1];
  const nextMod = MODULES[safeActive + 1];

  const activeStepId = activeStepByModule[mod.id] ?? mod.steps[0]?.id;
  const activeTab = activeTabByModule[mod.id] ?? "manual";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [archOpen, setArchOpen] = useState(false);

  // Bloquear scroll global del body para garantizar layout sin scroll vertical.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const workspaceRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="grid h-screen min-h-screen grid-rows-[auto_1fr] overflow-hidden bg-background text-foreground">
      <TopBar
        totalDone={totalDone}
        totalSteps={totalSteps}
        totalPct={totalPct}
        onOpenSidebar={() => setSidebarOpen(true)}
        onOpenArchitecture={() => setArchOpen(true)}
        onReset={reset}
      />

      <div className="grid min-h-0 grid-cols-1 lg:grid-cols-[300px_1fr]">
        {/* Sidebar fija en desktop */}
        <Sidebar
          activeId={mod.id}
          onSelect={(id) => {
            setActiveModule(id);
            // foco al panel para accesibilidad
            requestAnimationFrame(() => workspaceRef.current?.focus());
          }}
          completedCount={completedCount}
        />

        {/* Workspace */}
        <div
          ref={workspaceRef}
          tabIndex={-1}
          className="min-h-0 outline-none"
        >
          <ModuleWorkspace
            mod={mod}
            isDone={isDone}
            toggle={toggle}
            completedCount={completedCount}
            activeStepId={activeStepId}
            activeTab={activeTab as "manual" | "csai"}
            onChangeStep={(stepId) => setActiveStep(mod.id, stepId)}
            onChangeTab={(tab) => setActiveTab(mod.id, tab)}
            onPrevModule={prevMod ? () => setActiveModule(prevMod.id) : undefined}
            onNextModule={nextMod ? () => setActiveModule(nextMod.id) : undefined}
            prevModuleTitle={prevMod?.title}
            nextModuleTitle={nextMod?.title}
          />
        </div>
      </div>

      {/* Sidebar como Sheet en mobile */}
      <MobileSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        activeId={mod.id}
        onSelect={(id) => {
          setActiveModule(id);
          setSidebarOpen(false);
        }}
        completedCount={completedCount}
      />

      {/* Diálogo de arquitectura */}
      <ArchitectureDialog open={archOpen} onOpenChange={setArchOpen} />
      {/* Listener global para cerrar/abrir arquitectura por teclado: 'a' */}
      <KeyboardShortcuts onArchitecture={() => setArchOpen(true)} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function TopBar({
  totalDone,
  totalSteps,
  totalPct,
  onOpenSidebar,
  onOpenArchitecture,
  onReset,
}: {
  totalDone: number;
  totalSteps: number;
  totalPct: number;
  onOpenSidebar: () => void;
  onOpenArchitecture: () => void;
  onReset: () => void;
}) {
  return (
    <header className="border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onOpenSidebar}
            aria-label="Abrir índice de módulos"
          >
            <Layers className="size-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="display rounded-md border border-primary/40 bg-primary/[0.08] px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-primary">
              DVPE × CSAI
            </span>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Laboratorio de hacking ético · pivoting con IA local
            </span>
          </div>
        </div>

        <div className="hidden items-center justify-center gap-3 xl:flex">
          <div className="flex w-[320px] items-center gap-3">
            <span className="mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Progreso
            </span>
            <Progress value={totalPct} className="h-1.5 flex-1" />
            <span className="mono text-[11px] text-primary">{totalDone}/{totalSteps}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="hidden gap-2 sm:inline-flex"
            onClick={onOpenArchitecture}
          >
            <Network className="size-4" /> Arquitectura
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hidden gap-2 sm:inline-flex"
            asChild
          >
            <a href="http://localhost:8090" target="_blank" rel="noreferrer">
              <Bot className="size-4" /> CyberStrikeAI
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hidden gap-2 sm:inline-flex"
            asChild
          >
            <a href="http://localhost:6080" target="_blank" rel="noreferrer">
              <Terminal className="size-4" /> Attacker-PC
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hidden gap-2 sm:inline-flex"
            asChild
          >
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              <Github className="size-4" /> GitHub
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={onReset}
            title="Reiniciar progreso del navegador"
          >
            <RotateCcw className="size-4" />
            <span className="hidden md:inline">Reiniciar</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */

function Sidebar({
  activeId,
  onSelect,
  completedCount,
}: {
  activeId: string;
  onSelect: (id: string) => void;
  completedCount: (ids: string[]) => number;
}) {
  return (
    <aside className="hidden border-r border-border/70 bg-background/40 lg:block">
      <ScrollArea className="h-full">
        <div className="px-4 pb-6 pt-5">
          <p className="mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Recorrido · 10 módulos
          </p>
          <h2 className="display mt-1 text-base">Pivoting interno + CyberStrikeAI</h2>
        </div>
        <ol className="px-2 pb-8">
          {MODULES.map((m) => {
            const stepIds = m.steps.map((s) => s.id);
            const done = completedCount(stepIds);
            const total = stepIds.length;
            const isActive = m.id === activeId;
            const team = TEAM_LABEL[m.team];
            return (
              <li key={m.id}>
                <button
                  onClick={() => onSelect(m.id)}
                  className={cn(
                    "group mb-1 flex w-full items-start gap-3 rounded-md border border-transparent px-3 py-2.5 text-left transition-colors",
                    isActive
                      ? "border-primary/40 bg-primary/[0.07]"
                      : "hover:border-border/60 hover:bg-background/60",
                  )}
                >
                  <span
                    className={cn(
                      "mono mt-0.5 inline-flex h-7 min-w-[2rem] items-center justify-center rounded-md border px-1.5 text-[11px] font-medium",
                      isActive
                        ? "border-primary/50 bg-primary/[0.12] text-primary"
                        : "border-border/60 text-muted-foreground",
                    )}
                  >
                    {m.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="display block truncate text-sm">{m.title}</span>
                    <span className="mt-0.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]">
                      <span style={{ color: team.color }}>{team.label}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="mono text-muted-foreground">
                        {done}/{total}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mx-4 mb-6 rounded-md border border-dashed border-amber-300/30 bg-amber-300/[0.05] p-3 text-xs text-amber-100/90">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-3.5 text-amber-300" />
            <span className="display uppercase tracking-[0.18em] text-amber-300">
              Aviso ético
            </span>
          </div>
          <p className="mt-1 leading-relaxed">
            Sólo para uso educativo. No exponer estos contenedores fuera de tu host
            ni replicar técnicas en redes ajenas sin autorización escrita.
          </p>
        </div>
      </ScrollArea>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */

function MobileSidebar({
  open,
  onOpenChange,
  activeId,
  onSelect,
  completedCount,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  activeId: string;
  onSelect: (id: string) => void;
  completedCount: (ids: string[]) => number;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Índice de módulos"
    >
      <button
        className="absolute inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
        aria-label="Cerrar"
      />
      <div className="absolute inset-y-0 left-0 w-[300px] max-w-[85%] border-r border-border/70 bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <span className="display text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Módulos
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100%-49px)]">
          <ol className="px-2 py-3">
            {MODULES.map((m) => {
              const stepIds = m.steps.map((s) => s.id);
              const done = completedCount(stepIds);
              const total = stepIds.length;
              const isActive = m.id === activeId;
              const team = TEAM_LABEL[m.team];
              return (
                <li key={m.id}>
                  <button
                    onClick={() => onSelect(m.id)}
                    className={cn(
                      "mb-1 flex w-full items-start gap-3 rounded-md border border-transparent px-3 py-2.5 text-left transition-colors",
                      isActive
                        ? "border-primary/40 bg-primary/[0.07]"
                        : "hover:border-border/60 hover:bg-background/60",
                    )}
                  >
                    <span
                      className={cn(
                        "mono mt-0.5 inline-flex h-7 min-w-[2rem] items-center justify-center rounded-md border px-1.5 text-[11px] font-medium",
                        isActive
                          ? "border-primary/50 bg-primary/[0.12] text-primary"
                          : "border-border/60 text-muted-foreground",
                      )}
                    >
                      {m.number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="display block truncate text-sm">{m.title}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]">
                        <span style={{ color: team.color }}>{team.label}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="mono text-muted-foreground">
                          {done}/{total}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </ScrollArea>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function KeyboardShortcuts({ onArchitecture }: { onArchitecture: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.key.toLowerCase() === "a" && !e.metaKey && !e.ctrlKey && !e.altKey) onArchitecture();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onArchitecture]);
  return null;
}

function ArchitectureDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {/* trigger gestionado externamente */}
        <span className="hidden" />
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="display flex items-center gap-2">
            <MapIcon className="size-4 text-primary" />
            Topología del laboratorio
          </DialogTitle>
          <DialogDescription>
            Sólo <span className="mono text-primary">network_a</span> publica puertos al host. El resto queda interno para forzar el pivoting.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <NetworkMap />
        </div>
      </DialogContent>
    </Dialog>
  );
}
