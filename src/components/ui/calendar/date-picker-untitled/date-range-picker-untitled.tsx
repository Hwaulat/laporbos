import React from 'react';
import { CalendarDays } from 'lucide-react';

export function DateRangePicker({
  value,
  onChange,
  showPresets,
  showDateInputs,
  onApply,
  onCancel,
}: any) {
  // A mock component to satisfy the usage API
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted cursor-pointer transition-colors">
      <CalendarDays className="h-4 w-4" />
      <span>Date Range</span>
    </div>
  );
}
