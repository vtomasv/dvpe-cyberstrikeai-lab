import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Brain,
  Github,
  Globe2,
  HardDriveDownload,
  Network,
  Rocket,
  ShieldCheck,
  Terminal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import { ModuleSection } from "@/components/lab/ModuleSection";
import { NetworkMap } from "@/components/lab/NetworkMap";
import { MODULES, TEAM_LABEL } from "@/data/lab";
import { useChecklist } from "@/hooks/useChecklist";
import { cn } from "@/lib/utils";

export default function Home() {
  const { isDone, toggle, completedCount, reset } = useChecklist();

  const allStepIds = useMemo(
    () => MODULES.flatMap((m) => m.steps.map((s) => s.id)),
    [],
  );
  const overallDone = completedCount(allStepIds);
  const overallTotal = allStepIds.length;
  const overallPct = overallTotal === 0 ? 0 : Math.round((overallDone / overallTotal) * 100);

  const moduleProgress = useMemo(
    () => MODULES.map((m) => ({
      id: m.id,
      number: m.number,
      title: m.title,
      done: completedCount(m.steps.map((s) => s.id)),
      total: m.steps.length,
    })),
    [completedCount],
  );

  const [activeModule, setActiveModule] = useState<string>(MODULES[0]?.id ?? "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => {
      const fromTop = 140;
      let current = MODULES[0]?.id ?? "";
      for (const m of MODULES) {
        const el = document.getElementById(m.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - fromTop <= 0) current = m.id;
      }
      setActiveModule(current);
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div ref={containerRef} className="dark min-h-screen bg-background text-foreground">
      <TopBar />

      <Hero
        overallPct={overallPct}
        overallDone={overallDone}
        overallTotal={overallTotal}
        moduleProgress={moduleProgress}
        onReset={reset}
      />

      <main className="container relative grid gap-10 pb-24 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:h-fit">
          <ModuleNav active={activeModule} done={completedCount} />
        </aside>


        <div className="space-y-10">
          <ArchitectureBlock />
          <EthicsBlock />

          {MODULES.map((mod, i) => (
            <ModuleSection
              key={mod.id}
              mod={mod}
              index={i}
              isDone={isDone}
              toggle={toggle}
              completedCount={completedCount}
            />
          ))}

          <Footer />
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function TopBar() {
  return (
    <div className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="mono inline-flex h-7 items-center rounded border border-primary/40 bg-primary/10 px-2 text-[11px] uppercase tracking-[0.24em] text-primary">
            DVPE × CSAI
          </span>
          <span className="display hidden text-sm text-muted-foreground sm:inline">
            Laboratorio de hacking ético / pivoting con IA local
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ExternalLink href="http://localhost:8090" icon={<Brain className="size-3.5" />}>
            CyberStrikeAI
          </ExternalLink>
          <ExternalLink href="http://localhost:6080" icon={<Terminal className="size-3.5" />}>
            Attacker-PC
          </ExternalLink>
          <ExternalLink
            href="https://github.com/vtomasv/dvpe-cyberstrikeai-lab"
            icon={<Github className="size-3.5" />}
          >
            GitHub
          </ExternalLink>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline" className="lg:hidden">
                Módulos
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="mt-6">
                <ModuleNav />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

function ExternalLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/40 px-2.5 py-1",
        "text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </a>
  );
}

type ModuleProgress = {
  id: string;
  number: string;
  title: string;
  done: number;
  total: number;
};

function Hero({
  overallPct,
  overallDone,
  overallTotal,
  moduleProgress,
  onReset,
}: {
  overallPct: number;
  overallDone: number;
  overallTotal: number;
  moduleProgress: ModuleProgress[];
  onReset: () => void;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="scanlines absolute inset-0 opacity-30" aria-hidden />
      <div className="container relative grid gap-10 py-16 lg:grid-cols-[1.3fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <p className="display mb-4 inline-flex items-center gap-3 rounded-full border border-border/70 bg-background/40 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            curso de ethical hacking · v1.0
          </p>
          <h1 className="display text-balance text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
            Pivoting interno guiado con{" "}
            <span className="text-primary">CyberStrikeAI</span> +{" "}
            <span className="text-primary">Ollama</span> local
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground">
            Un laboratorio reproducible que combina <span className="display text-foreground">DVPE</span> —
            10 contenedores vulnerables con 6 redes encadenadas— y un agente IA
            asistente corriendo sobre tu propio Ollama. El recorrido va paso a
            paso, registra tu progreso y oculta los spoilers detrás de botones
            para uso docente.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#m0">
              <Button size="lg" className="gap-2">
                <Rocket className="size-4" />
                Comenzar ahora
              </Button>
            </a>
            <a href="#arquitectura">
              <Button size="lg" variant="outline" className="gap-2 bg-background/30">
                <Network className="size-4" />
                Ver arquitectura
              </Button>
            </a>
            <Button size="lg" variant="ghost" onClick={onReset} className="gap-2">
              <HardDriveDownload className="size-4" />
              Reiniciar progreso
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 shadow-[0_30px_80px_-40px_oklch(0.82_0.18_155/0.35)]">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                progreso · global
              </span>
              <span className="mono text-sm text-primary">
                {overallDone}/{overallTotal}
              </span>
            </div>
            <Progress value={overallPct} className="my-5 h-2" />
            <ul className="space-y-2 text-sm">
              {moduleProgress.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-2 border-b border-border/40 py-1 last:border-0"
                >
                  <a href={`#${m.id}`} className="flex min-w-0 items-center gap-2 truncate hover:text-primary">
                    <span className="mono text-[11px] text-muted-foreground">{m.number}</span>
                    <span className="display truncate">{m.title}</span>
                  </a>
                  <span className="mono text-[11px] text-muted-foreground">
                    {m.done}/{m.total}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ModuleNav({
  active,
  done,
}: {
  active?: string;
  done?: (ids: string[]) => number;
}) {
  return (
    <nav className="space-y-1">
      <p className="display mb-2 px-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
        Recorrido
      </p>
      {MODULES.map((m) => {
        const team = TEAM_LABEL[m.team];
        const isActive = active === m.id;
        const total = m.steps.length;
        const completed = done ? done(m.steps.map((s) => s.id)) : 0;
        return (
          <a
            key={m.id}
            href={`#${m.id}`}
            className={cn(
              "group relative flex items-start gap-3 rounded-md border border-transparent px-2.5 py-2",
              "transition-colors",
              isActive
                ? "border-primary/40 bg-primary/[0.06]"
                : "hover:border-border/60 hover:bg-background/30",
            )}
          >
            <span
              className="mono mt-0.5 text-xs"
              style={{ color: team.color }}
            >
              {m.number}
            </span>
            <span className="min-w-0 flex-1">
              <span className="display block truncate text-sm">{m.title}</span>
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {team.label} · {completed}/{total}
              </span>
            </span>
          </a>
        );
      })}
    </nav>
  );
}

function ArchitectureBlock() {
  return (
    <section id="arquitectura" className="scroll-mt-24 space-y-6">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="display text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Arquitectura del laboratorio
          </p>
          <h2 className="display mt-1 text-3xl font-semibold">Topología de redes</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Sólo <span className="mono">network_a</span> publica puertos al
            host. El resto queda interno para forzar el pivoting tal como define
            la guía original de DVPE.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge icon={<Globe2 className="size-3.5" />} label="6 redes" />
          <Badge icon={<ShieldCheck className="size-3.5" />} label="10 hosts" />
          <Badge icon={<Brain className="size-3.5" />} label="Ollama local" />
        </div>
      </div>
      <NetworkMap />
    </section>
  );
}

function EthicsBlock() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-amber-300/30 bg-amber-300/[0.04] p-6">
      <div className="flex items-start gap-4">
        <span className="mt-1 inline-flex size-9 items-center justify-center rounded-md border border-amber-300/40 bg-amber-300/10 text-amber-200">
          <AlertTriangle className="size-4" />
        </span>
        <div className="space-y-2">
          <h2 className="display text-lg font-medium text-amber-100">
            Uso responsable
          </h2>
          <p className="text-sm text-amber-100/90">
            Este laboratorio es estrictamente educativo y autocontenido. Todo
            tráfico, exploit y credencial vive dentro de redes Docker
            aisladas. <span className="mono">No</span> utilices estas técnicas
            contra sistemas que no te pertenezcan o para los que no tengas
            autorización explícita por escrito.
          </p>
        </div>
      </div>
    </section>
  );
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/40 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
      {icon}
      {label}
    </span>
  );
}

function Footer() {
  return (
    <footer className="space-y-4 border-t border-border/60 pt-8 text-sm text-muted-foreground">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="display text-foreground">Créditos</p>
          <p className="mt-1">
            DVPE original por{" "}
            <a className="text-primary" href="https://github.com/franc205/dvpe" target="_blank" rel="noreferrer">
              franc205/dvpe
            </a>{" "}
            (Artistic License 2.0). CyberStrikeAI por{" "}
            <a className="text-primary" href="https://github.com/Ed1s0nZ/CyberStrikeAI" target="_blank" rel="noreferrer">
              Ed1s0nZ/CyberStrikeAI
            </a>
            . Guía de pivoting:{" "}
            <a
              className="text-primary"
              href="https://franc205.notion.site/ESPA-OL-From-Network-to-Network-Hands-On-Pivoting-Techniques-in-Internal-Environments-13b1f42ae1de80cd8c20f0e5a8d29a08"
              target="_blank"
              rel="noreferrer"
            >
              From Network to Network
            </a>
            .
          </p>
        </div>
        <div>
          <Separator className="my-3 md:hidden" />
          <p className="display text-foreground">Repositorio</p>
          <p className="mt-1">
            <a className="text-primary" href="https://github.com/vtomasv/dvpe-cyberstrikeai-lab" target="_blank" rel="noreferrer">
              github.com/vtomasv/dvpe-cyberstrikeai-lab
            </a>
          </p>
        </div>
      </div>
      <p className="mono pt-6 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        // hecho para enseñar · usado con responsabilidad
      </p>
    </footer>
  );
}
