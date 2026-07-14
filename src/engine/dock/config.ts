export interface DockItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

export const DOCK_CONFIG: DockItem[] = [
  { id: 'home', label: 'Inicio', icon: 'home', route: '/' },
  { id: 'stock', label: 'Inventario', icon: 'stock', route: '/stock' },
  { id: 'sales', label: 'Ventas', icon: 'sales', route: '/sales' },
  { id: 'staff', label: 'Personal', icon: 'staff', route: '/staff' },
  { id: 'reports', label: 'Reportes', icon: 'reports', route: '/reports' },
  { id: 'logout', label: 'Salir', icon: 'logout', route: '/logout' },
];
