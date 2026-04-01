// 📁 components/shared/CategoryTabs.tsx

"use client";

import { Category } from "@/types";

interface CategoryTabsProps {
  categories: Category[];
  active: string; // category _id, or "all"
  onChange: (id: string) => void;
}

export default function CategoryTabs({
  categories,
  active,
  onChange,
}: CategoryTabsProps) {
  const all = [{ _id: "all", name: "All" }, ...categories];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-center sm:gap-2">
      {all.map((category) => {
        const isActive = active === category._id;
        return (
          <button
            key={category._id}
            onClick={() => onChange(category._id)}
            className={`shrink-0 rounded-full px-3 py-2 font-heading text-[13px] font-semibold transition-all duration-200 sm:px-5 sm:text-[15px] ${
              isActive
                ? "bg-primary text-white shadow-[0_4px_12px_rgba(235,108,108,0.30)]"
                : "bg-[#f5f0eb] text-foreground/60 hover:bg-primary/10 hover:text-primary"
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
