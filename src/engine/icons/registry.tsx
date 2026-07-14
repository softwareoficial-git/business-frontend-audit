import React from 'react';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Home 
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface IconConfig {
  component: LucideIcon;
  label: string;
}

export const ICON_REGISTRY: Record<string, IconConfig> = {
  'stock': {
    component: Package,
    label: 'Inventario'
  },
  'sales': {
    component: ShoppingCart,
    label: 'Ventas'
  },
  'staff': {
    component: Users,
    label: 'Personal'
  },
  'reports': {
    component: BarChart3,
    label: 'Reportes'
  },
  'home': {
    component: Home,
    label: 'Inicio'
  }
};

export const Icon = ({ name, size = 24, className = "" }: { name: string, size?: number, className?: string }) => {
  const iconConfig = ICON_REGISTRY[name];
  if (!iconConfig) return null;

  const IconComponent = iconConfig.component;
  return <IconComponent size={size} className={`engine-icon ${className}`} />;
};
