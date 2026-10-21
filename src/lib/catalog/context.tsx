"use client";

import { createContext, useContext, useMemo } from "react";
import type { Catalog, CatalogLesson, CatalogModule } from "./types";

export interface CatalogApi extends Catalog {
  lessons: CatalogLesson[];
  lessonById: Map<string, CatalogLesson>;
  moduleById: Map<string, CatalogModule>;
  lessonUrl: (id: string) => string;
}

const Ctx = createContext<CatalogApi | null>(null);

export function makeCatalogApi(catalog: Catalog): CatalogApi {
  const lessons = catalog.modules.flatMap((m) => m.lessons);
  const lessonById = new Map(lessons.map((l) => [l.id, l]));
  const moduleById = new Map(catalog.modules.map((m) => [m.id, m]));
  return {
    ...catalog,
    lessons,
    lessonById,
    moduleById,
    lessonUrl: (id) => {
      const l = lessonById.get(id);
      return l ? `/learn/${l.moduleSlug}/${l.slug}` : "/learn";
    },
  };
}

export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: React.ReactNode }) {
  const api = useMemo(() => makeCatalogApi(catalog), [catalog]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCatalog(): CatalogApi {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCatalog must be used inside CatalogProvider");
  return c;
}
