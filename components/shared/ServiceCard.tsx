// 📁 components/shared/ServiceCard.tsx

import {
  Utensils,
  Briefcase,
  Package,
  Gift,
  ChefHat,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";
import { ServiceItem } from "@/types";
import Button from "@/components/ui/Button";

const iconMap: Record<string, LucideIcon> = {
  utensils: Utensils,
  briefcase: Briefcase,
  package: Package,
  gift: Gift,
  "chef-hat": ChefHat,
  "calendar-check": CalendarCheck,
};

interface ServiceCardProps {
  service: ServiceItem;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const Icon = iconMap[service.icon] ?? Utensils;

  return (
    <div className="group flex flex-col justify-between rounded-[24px] bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.06] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)]">
      {/* ── Top: title + description ── */}
      <div>
        <h3 className="font-heading text-xl font-bold text-foreground">
          {service.title}
        </h3>
        <p className="mt-3 font-body text-[15px] leading-relaxed text-foreground/60">
          {service.description}
        </p>
      </div>

      {/* ── Bottom: button + icon ── */}
      <div className="mt-8 flex items-end justify-between">
        <Button href="/contact" size="sm">
          Book Us
        </Button>

        {/* Icon tile */}
        <div className="flex h-[88px] w-[110px] items-center justify-center rounded-[20px] bg-primary/8 transition-colors duration-300 group-hover:bg-primary/12">
          <Icon
            size={44}
            className="text-primary transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </div>
    </div>
  );
}
