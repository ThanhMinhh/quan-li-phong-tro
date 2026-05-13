"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  Building2,
  DoorOpen,
  Users,
  FileText,
  Receipt,
  CreditCard,
  AlertTriangle,
  Bell,
  Settings,
  Shield,
  Home,
  Building,
  Globe,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()

  // Tạo navigation items dựa trên role
  const navMain = React.useMemo(() => {
    const role = session?.user?.role;
    
    const items = [];

    // Quản lý cơ bản - Ẩn đối với nhân viên
    if (role !== 'nhanVien') {
      items.push({
        title: "Quản lý cơ bản",
        url: "#",
        icon: Building,
        isActive: true,
        items: [
          { title: "Tòa nhà", url: "/dashboard/toa-nha" },
          { title: "Phòng", url: "/dashboard/phong" },
          { title: "Khách thuê", url: "/dashboard/khach-thue" },
        ],
      });
    }

    // Tài chính - Nhân viên chỉ thấy Hóa đơn
    if (role === 'nhanVien') {
      items.push({
        title: "Tài chính",
        url: "#",
        icon: Receipt,
        items: [
          { title: "Hóa đơn", url: "/dashboard/hoa-don" },
        ],
      });
    } else {
      items.push({
        title: "Tài chính",
        url: "#",
        icon: Receipt,
        items: [
          { title: "Hợp đồng", url: "/dashboard/hop-dong" },
          { title: "Hóa đơn", url: "/dashboard/hoa-don" },
        ],
      });
    }

    // Vận hành - Tất cả mọi người thấy
    items.push({
      title: "Vận hành",
      url: "#",
      icon: AlertTriangle,
      items: [
        { title: "Sự cố", url: "/dashboard/su-co" },
        { title: "Thông báo", url: "/dashboard/thong-bao" },
      ],
    });

    // Quản trị - Chỉ Admin thấy
    if (role === 'admin') {
      items.push({
        title: "Quản trị",
        url: "#",
        icon: Shield,
        items: [
          { title: "Quản lý tài khoản", url: "/dashboard/quan-ly-tai-khoan" },
        ],
      });
    }

    // Hồ sơ - Tất cả mọi người thấy
    items.push({
      title: "Hồ sơ",
      url: "/dashboard/ho-so",
      icon: Settings,
    });

    return items;
  }, [session?.user?.role])

  const userData = React.useMemo(() => ({
    name: session?.user?.name || "User",
    email: session?.user?.email || "user@example.com",
    avatar: session?.user?.avatar || "/avatars/default.jpg",
  }), [session])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 text-primary-foreground transform group-hover:rotate-6 transition-transform duration-300">
                  <Building2 className="size-6" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                  <span className="truncate font-bold text-lg font-heading tracking-tight">Smart Management</span>
                  <span className="truncate text-[10px] uppercase tracking-widest text-muted-foreground"></span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
