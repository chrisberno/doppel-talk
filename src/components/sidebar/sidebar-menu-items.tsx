"use client";

import { LayoutDashboard, Wand2, FolderOpen, Settings, Mic, ChevronDown, FileText } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import Link from "next/link";
import { cn } from "~/lib/utils";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  children?: MenuItem[];
}

export default function SidebarMenuItems() {
  const path = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Create"]);

  let items: MenuItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      active: false,
    },
    {
      title: "Create",
      url: "/dashboard/create",
      icon: Wand2,
      active: false,
      children: [
        {
          title: "Doppel Voice Clones",
          url: "/dashboard/voice-recorder",
          icon: Mic,
          active: false,
        },
      ],
    },
    {
      title: "Script Book",
      url: "/dashboard/scripts",
      icon: FileText,
      active: false,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: FolderOpen,
      active: false,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
      active: false,
    },
  ];

  // Set active state for items and children
  items = items.map((item) => ({
    ...item,
    active: path === item.url,
    children: item.children?.map((child) => ({
      ...child,
      active: path === child.url,
    })),
  }));

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const isExpanded = (title: string) => expandedItems.includes(title);

  return (
    <>
      {items.map((item) => (
        <div key={item.title}>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild={!item.children}
              isActive={item.active || item.children?.some((c) => c.active)}
              className={cn(
                "group hover:bg-primary/10 hover:text-primary relative h-10 w-full justify-start rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                (item.active || item.children?.some((c) => c.active)) && "bg-primary/15 text-primary shadow-sm",
              )}
              onClick={item.children ? () => toggleExpand(item.title) : undefined}
            >
              {item.children ? (
                <div className="flex w-full cursor-pointer items-center gap-3">
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      item.active || item.children?.some((c) => c.active)
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary",
                    )}
                  />
                  <span className="truncate">{item.title}</span>
                  <ChevronDown
                    className={cn(
                      "ml-auto h-4 w-4 transition-transform duration-200",
                      isExpanded(item.title) && "rotate-180",
                    )}
                  />
                </div>
              ) : (
                <Link
                  href={item.url}
                  onClick={handleMenuClick}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      item.active
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary",
                    )}
                  />
                  <span className="truncate">{item.title}</span>
                  {item.active && (
                    <div className="bg-primary absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full" />
                  )}
                </Link>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Child items */}
          {item.children && isExpanded(item.title) && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => (
                <SidebarMenuItem key={child.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={child.active}
                    className={cn(
                      "group hover:bg-primary/10 hover:text-primary relative h-9 w-full justify-start rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
                      child.active && "bg-primary/15 text-primary shadow-sm",
                    )}
                  >
                    <Link
                      href={child.url}
                      onClick={handleMenuClick}
                      className="flex cursor-pointer items-center gap-3"
                    >
                      <child.icon
                        className={cn(
                          "h-4 w-4 transition-colors duration-200",
                          child.active
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-primary",
                        )}
                      />
                      <span className="truncate text-xs">{child.title}</span>
                      {child.active && (
                        <div className="bg-primary absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}
