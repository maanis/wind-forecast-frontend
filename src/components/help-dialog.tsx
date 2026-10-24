import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const KEY = "wfd-help-dismissed";

const STEPS = [
  ["Set your decision cutoff", "Choose the London-time cutoff on D-1 when you commit. Only forecasts published before it are used."],
  ["Review the day-ahead forecast", "On Day Forecast, compare the forecast with actuals and the indicative expected range."],
  ["Check historical accuracy", "On Accuracy, see how large and how directional errors were across January and by lead time."],
  ["Translate error into a buffer", "Use bias and the P90/P10 tails as indicative inputs when sizing procurement cover, alongside market and reserve constraints."],
] as const;

const GLOSSARY = [
  ["MAE", "Average absolute miss in MW."],
  ["RMSE", "Error measure that weights large misses more."],
  ["Bias", "Average of forecast − actual. Positive = over-forecast."],
  ["wMAPE", "Total absolute error ÷ total actual generation."],
  ["P10 / P90 error", "Signed percentiles of forecast − actual: the under- and over-forecast tails."],
  ["Lead time", "Hours between forecast publication and delivery."],
  ["Cutoff", "Decision time on D-1, Europe/London local time."],
] as const;

export function useHelpDialog() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {
      /* storage unavailable */
    }
  }, []);
  const onOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o) {
      try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    }
  };
  return { open, onOpenChange };
}

export function HelpDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>How to use Wind Forecast Desk</DialogTitle>
          <DialogDescription>Evaluate day-ahead wind forecasts against measured generation. All values in MW.</DialogDescription>
        </DialogHeader>
        <ol className="flex flex-col gap-3">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="flex gap-3">
              <span className="tabular flex size-5 shrink-0 items-center justify-center rounded-sm border border-border text-xs font-semibold text-primary">{i + 1}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{t}</p>
                <p className="text-xs text-muted-foreground">{d}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="border-t border-border pt-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Glossary</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
            {GLOSSARY.map(([t, d]) => (
              <div key={t} className="contents">
                <dt className="font-medium text-foreground">{t}</dt>
                <dd className="text-muted-foreground">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
        <DialogFooter>
          <Button size="sm" onClick={() => onOpenChange(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
