// 📁 components/admin/MenuToolbar.tsx
// Fully controlled — all state lives in AdminMenuPage and flows down as props.
// This component is a pure UI shell: it renders inputs and fires callbacks.

"use client";

import { Search, ChevronDown } from "lucide-react";

interface MenuToolbarProps {
  // Controlled values (from AdminMenuPage state)
  search: string;
  isAvailable: string;
  date: string;
  // Callbacks
  onSearch: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDateChange: (value: string) => void;
}

export default function MenuToolbar({
  search,
  isAvailable,
  date,
  onSearch,
  onStatusChange,
  onDateChange,
}: MenuToolbarProps) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
      {/* ── Search ── */}
      <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px] sm:flex-1">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted"
        />
        <input
          type="text"
          placeholder="Search menu items…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full rounded-[10px] bg-white py-2.5 pl-8 pr-3 font-body text-[13px] text-admin-text ring-1 ring-black/[0.08] placeholder:text-admin-muted focus:outline-none focus:ring-2 focus:ring-admin-accent/30 transition-all duration-150"
        />
      </div>

      {/* ── Status filter ── */}
      <FilterSelect
        value={isAvailable}
        onChange={onStatusChange}
        defaultLabel="All Statuses"
        options={[
          { value: "available", label: "Available" },
          { value: "unavailable", label: "Out of Stock" },
        ]}
      />

      {/* ── Date filter ── */}
      <FilterSelect
        value={date}
        onChange={onDateChange}
        defaultLabel="All Dates"
        options={[
          { value: "today", label: "Today" },
          { value: "week", label: "This Week" },
          { value: "month", label: "This Month" },
        ]}
      />
    </div>
  );
}

// ── Reusable controlled select ────────────────────────────────────────────────

interface FilterSelectProps {
  value: string;
  defaultLabel: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function FilterSelect({
  value,
  defaultLabel,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <div className="relative w-full sm:w-auto">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-[10px] bg-admin-bg py-2.5 pl-3.5 pr-8 font-body text-[13px] font-semibold text-admin-text ring-1 ring-black/[0.08] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-admin-accent/30 sm:w-auto"
      >
        <option value="">{defaultLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-muted"
      />
    </div>
  );
}
