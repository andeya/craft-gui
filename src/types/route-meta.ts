// Route metadata interface
export interface RouteMeta {
  title: string;
  icon: string;
  showInMenu?: boolean;
  description?: string;
  order?: number;
}

export namespace RouteMeta {
  export function getIconName(meta: any): string {
    return (meta?.icon as string) || "article";
  }

  export function getTitle(meta: any): string {
    return (meta?.title as string) || "Untitled";
  }
}

// Page component interface with metadata
export interface PageComponent {
  default: any;
  meta?: RouteMeta;
}
