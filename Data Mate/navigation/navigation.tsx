import { ReactNode } from "react";
import { Shield, Search, TrendingUp, GitGraph as GraphUp, Zap, Database, Activity, Package2, Settings, Home } from "lucide-react";

type NavItem = { 
  title: string; 
  href: string; 
  icon: ReactNode; 
  admin?: boolean 
};

export const NAV_ITEMS: NavItem[] = [
  { title: "Overview", href: "/", icon: <Home /> },
  { title: "Audience Intelligence", href: "/audiences", icon: <Zap /> },
  { title: "Semantic Search", href: "/semantic-search", icon: <Search /> },
  { title: "Graph Explorer", href: "/graph-explorer", icon: <GraphUp /> },
  { title: "Insights Copilot", href: "/insights-copilot", icon: <Shield /> },
  { title: "Data Quality", href: "/data-quality", icon: <Database /> },

  // ADMIN
  { title: "Scraper Health", href: "/admin/scraper-health", icon: <Activity />, admin: true },
  { title: "Jobs & Queue", href: "/admin/jobs", icon: <Package2 />, admin: true },
  { title: "Exports / API Keys", href: "/admin/exports", icon: <Package2 />, admin: true },

  { title: "Settings", href: "/settings", icon: <Settings /> },
];