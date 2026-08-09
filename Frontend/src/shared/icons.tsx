import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  CircleX,
  ClipboardList,
  Home,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  Minus,
  Package,
  Plus,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Moon,
  Wallet,
  X,
  type LucideIcon,
  ChartNoAxesColumn,
  Landmark,
  Notebook,
} from "lucide-react-native";



import type { TelaId } from "@/types/navigation";

export type IconComponent = LucideIcon;

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const CAIXA_ICONS: Record<string, LucideIcon> = {
  saldo_atual: Wallet,
  reserva_emergencia: Shield,
  objetivo_pessoal: Sparkles,
};

const ICONES_ROTATIVOS: LucideIcon[] = [Wallet, Shield, Sparkles, Package, LayoutGrid];

export function CaixaIcon({
  id,
  indice = 0,
  size = 40,
  color,
  strokeWidth = 2,
}: IconProps & { id: string; indice?: number }) {
  const Icon = CAIXA_ICONS[id] ?? ICONES_ROTATIVOS[indice % ICONES_ROTATIVOS.length];
  return (
    <Icon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
    />
  );
}

export const NAV_ICONS: Record<
  Extract<TelaId, "inicio" | "previsao" | "contas" | "caixas" | "painel">,
  LucideIcon
> = {
  inicio: Landmark,
  previsao: ChartNoAxesColumn,
  contas: ClipboardList,
  caixas: LayoutGrid,
  painel: Notebook,
};

export {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  CircleX,
  ClipboardList,
  Home,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  Minus,
  Moon,
  Package,
  Plus,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Wallet,
  X,
};
