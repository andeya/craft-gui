import { getAppName } from "../utils/app-config";

// Route metadata interface
export interface RouteMeta {
  title: string;
  icon: string;
  showInMenu: boolean;
  description: string;
  order: number;
  groupTitle: string;
  groupOrder: number;
}

export namespace RouteMeta {
  export function getIconName(meta: any): string {
    return (meta?.icon as string) || "article";
  }

  export function getTitle(meta: any): string {
    return (meta?.title as string) || getAppName();
  }
}

// Page component interface with metadata
export interface PageComponent {
  default: any;
  meta?: RouteMeta;
}

// Menu item interface
export interface RouteInfo extends RouteMeta {
  path: string;
}

export interface RouteGroupInfo {
  title: string;
  order: number;
  routes: RouteInfo[];
}
