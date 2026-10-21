"use client";

import { useEffect } from "react";
import { learnerStore, useStoreMeta } from "@/lib/store/hooks";

export function VisitTracker({ id, type = "kb" }: { id: string; type?: "kb" | "project" }) {
  const meta = useStoreMeta();
  useEffect(() => {
    if (meta.hydrated) learnerStore.visit({ type, id });
  }, [meta.hydrated, id, type]);
  return null;
}
