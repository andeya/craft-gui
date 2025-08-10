// Route metadata interface
export interface RouteMeta {
  title: string;
  icon: string;
  showInMenu?: boolean;
  description?: string;
  order?: number;
}

// Page component interface with metadata
export interface PageComponent {
  default: any;
  meta?: RouteMeta;
}
