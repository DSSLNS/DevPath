"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useCatalog } from "@/lib/catalog/context";
import { learnerStore, useLearnerState } from "@/lib/store/hooks";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClass } from "@/components/ui/button";
import { CareerPathGrid } from "./path-card";

export function PathsView() {
  const catalog = useCatalog();
  const state = useLearnerState();
  const tracks = catalog.paths.filter((p) => !p.steps);
  return (
    <div className="space-y-10">
      <CareerPathGrid headingLevel={2} />
      <section aria-labelledby="js-h">
        <h2 id="js-h" className="mb-1 text-lg font-semibold">
          JavaScript tracks
        </h2>
        <p className="mb-3 text-sm text-muted">Focused routes through the JavaScript curriculum, organised by module.</p>
        <div className="grid gap-3 md:grid-cols-3">
          {tracks.map((p) => (
            <article key={p.id} className="flex flex-col rounded-lg border border-border bg-surface p-4">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted">{p.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {state.settings.pathId === p.id ? (
                  <Badge tone="success">
                    <Check className="h-3 w-3" aria-hidden /> Your current path
                  </Badge>
                ) : (
                  <Button size="sm" onClick={() => learnerStore.updateSettings({ pathId: p.id })}>
                    Follow this track
                  </Button>
                )}
                <Link href="/learn" className={buttonClass("ghost", "sm")}>
                  View modules
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
