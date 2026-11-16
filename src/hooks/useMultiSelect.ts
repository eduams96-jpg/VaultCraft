"use client";

import { useState, useMemo, useCallback } from "react";
import type React from "react";

export function useMultiSelect<T extends { id: string }>(filteredItems: T[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const allFilteredSelected = useMemo(
    () =>
      filteredItems.length > 0 &&
      filteredItems.every((item) => selectedSet.has(item.id)),
    [filteredItems, selectedSet]
  );

  const toggleSelectId = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAllFiltered = useCallback(() => {
    const visibleIds = new Set(filteredItems.map((i) => i.id));
    setSelectedIds((prev) => {
      const prevSet = new Set(prev);
      const allSelectedNow =
        filteredItems.length > 0 && filteredItems.every((i) => prevSet.has(i.id));
      if (allSelectedNow) {
        return prev.filter((id) => !visibleIds.has(id));
      }
      return Array.from(new Set([...prev, ...visibleIds]));
    });
  }, [filteredItems]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return {
    selectedIds,
    selectedSet,
    allFilteredSelected,
    toggleSelectId,
    toggleSelectAllFiltered,
    clearSelection,
    setSelectedIds,
  };
}
