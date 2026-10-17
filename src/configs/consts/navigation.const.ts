import {
  Box,
  CheckSquare2,
  House,
  type LucideIcon,
  QrCode,
  Truck,
} from "lucide-react";
import { type PagePath, pages } from "@/configs/paths/pages.path";
import type { View } from "@/configs/types/navigation.type";

export const navigation: {
  id: View;
  label: string;
  href: PagePath;
  Icon: LucideIcon;
}[] = [
  { id: "dashboard", label: "Обзор", href: pages.DASHBOARD, Icon: House },
  { id: "boxes", label: "Коробки", href: pages.BOXES, Icon: Box },
  { id: "plan", label: "План", href: pages.PLAN, Icon: CheckSquare2 },
  { id: "labels", label: "Этикетки", href: pages.LABELS, Icon: QrCode },
  { id: "progress", label: "Прогресс", href: pages.PROGRESS, Icon: Truck },
];
