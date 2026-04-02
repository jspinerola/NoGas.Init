"use client"

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import {
    Car,
    LayoutDashboard,
    History,
    Bell,
    MapPin,
    Settings,
    Wrench,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard},
    { href: "/vehicles", label: "My Vehicles", icon: Car},
    { href: "/services", label: "Services", icon: Wrench},
    { href: "/history", label: "History", icon: History},
    { href: "/reminders", label: "Reminders", icon: Bell},
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void}) {
    const pathName = usePathname();

    return (
        <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => {
                const isActive = pathName === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavClick}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                            isActive
                                ? "bg-sidebar-accent text-primary"
                                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                        )}
                    >
                        <item.icon className="h-5 w-5 shrink-0"/>
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-sidebar p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex h-16 items-center border-b border-border px-4">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">AutoCare</span>
          </Link>
        </div>
        <SidebarContent onNavClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden h-screen flex-col border-r border-border bg-sidebar transition-all duration-300 md:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">AutoCare</span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="mr-2 h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
