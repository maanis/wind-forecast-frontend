import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, CircleHelp, Clock, LayoutDashboard, LineChart } from "lucide-react";
import type { ReactNode } from "react";

import { HelpDialog, useHelpDialog } from "@/components/help-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useFilters } from "@/hooks/use-api";
import { CUTOFF_OPTIONS, MAX_DATE, MIN_DATE, isValidDate } from "@/lib/filters";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/forecast", label: "Day Forecast", icon: LineChart },
  { to: "/accuracy", label: "Accuracy", icon: BarChart3 },
] as const;

export function CutoffSelect({ value, onChange, id }: { value: string | undefined; onChange: (v: string) => void; id: string }) {
  const options = value && !CUTOFF_OPTIONS.includes(value) ? [...CUTOFF_OPTIONS, value].sort() : CUTOFF_OPTIONS;
  return (
    <Select value={value ?? ""} onValueChange={onChange}>
      <SelectTrigger id={id} className="tabular h-8 w-[92px] text-sm">
        <SelectValue placeholder="--:--" />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {options.map((o) => <SelectItem key={o} value={o} className="tabular">{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export function DateInput({ value, onChange, id, min = MIN_DATE, max = MAX_DATE }: { value: string | undefined; onChange: (v: string) => void; id: string; min?: string; max?: string }) {
  return (
    <Input
      id={id}
      type="date"
      min={min}
      max={max}
      value={value ?? ""}
      onChange={(e) => isValidDate(e.target.value) && onChange(e.target.value)}
      className="tabular h-8 w-[148px] text-sm"
    />
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const help = useHelpDialog();
  const { date, cutoff, setDate, setCutoff } = useFilters();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex min-h-screen w-full bg-background">
        <aside className="sticky top-0 hidden h-screen w-14 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex lg:w-56" aria-label="Primary">
          <div className="flex h-14 items-center border-b border-sidebar-border px-4">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              <span className="text-primary">W</span><span className="hidden lg:inline">ind Forecast Desk</span><span className="lg:hidden">FD</span>
            </span>
          </div>
          <nav className="flex flex-col gap-0.5 p-2">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = path.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  search={((p: Record<string, unknown>) => ({ date: p["date"], cutoff: p["cutoff"] })) as never}
                  title={label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-8 items-center gap-2.5 rounded-sm px-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto hidden border-t border-sidebar-border p-4 text-xs text-muted-foreground lg:block">
            GB wind · Day-ahead · MW
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex min-h-14 flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-card px-4 py-2 md:px-6">
            <nav className="flex gap-1 md:hidden" aria-label="Primary mobile">
              {NAV.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} search={((p: Record<string, unknown>) => ({ date: p["date"], cutoff: p["cutoff"] })) as never} aria-label={label}
                  className={cn("flex size-8 items-center justify-center rounded-sm", path.startsWith(to) ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted")}>
                  <Icon className="size-4" aria-hidden />
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Label htmlFor="tb-date" className="text-xs text-muted-foreground">Delivery date</Label>
              <DateInput id="tb-date" value={date} onChange={setDate} />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="tb-cutoff" className="text-xs text-muted-foreground">Cutoff</Label>
              <CutoffSelect id="tb-cutoff" value={cutoff} onChange={setCutoff} />
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3.5" aria-hidden /> D-1, Europe/London
              </span>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => help.onOpenChange(true)}>
              <CircleHelp className="size-4" aria-hidden /> Help guide
            </Button>
          </header>
          <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
      <HelpDialog {...help} />
    </TooltipProvider>
  );
}
