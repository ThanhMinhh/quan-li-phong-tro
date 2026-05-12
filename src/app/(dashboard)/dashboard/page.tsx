'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  DoorOpen, 
  Users, 
  Receipt, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Clock,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { DashboardStats } from '@/types';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const isStaff = session?.user?.role === 'nhanVien';

  useEffect(() => {
    document.title = 'Tổng quan';
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setStats(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse glass-card">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Tổng quan hệ thống</h1>
          <p className="text-muted-foreground mt-1">Chào mừng quay trở lại.</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 bg-card px-4 py-2 rounded-xl border border-border/50">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng số phòng', value: stats.tongSoPhong, sub: `${stats.phongDangThue} đang thuê`, icon: Building2, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Phòng trống', value: stats.phongTrong, sub: `${((stats.phongTrong / stats.tongSoPhong) * 100).toFixed(1)}% khả dụng`, icon: DoorOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          !isStaff 
            ? { label: 'Doanh thu tháng', value: formatCurrency(stats.doanhThuThang), sub: '+12% so với tháng trước', icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' }
            : { label: 'Hợp đồng mới', value: stats.hopDongSapHetHan, sub: 'Cần theo dõi gia hạn', icon: FileText, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Sự cố cần xử lý', value: stats.suCoCanXuLy, sub: 'Cần phản hồi ngay', icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
        ].map((item, idx) => (
          <Card key={idx} className="glass-card hover:scale-[1.02] transition-transform duration-300 overflow-hidden group">
            <CardContent className="p-6 relative">
              <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${item.bg} opacity-20 group-hover:scale-110 transition-transform duration-500`} />
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-heading">{item.value}</h3>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  {item.sub}
                  {idx === 2 && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grid Layout for details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities Section */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-heading">Hoạt động gần đây</CardTitle>
              <CardDescription>Các tương tác mới nhất trên hệ thống</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">Xem tất cả</Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              { type: 'New Tenant', title: 'Khách thuê mới đăng ký', detail: 'Nguyễn Văn A - Phòng P101', time: '10 phút trước', badge: 'Mới', variant: 'secondary' as const },
              !isStaff && { type: 'Payment', title: 'Thanh toán thành công', detail: 'Phòng P102 - 2,500,000 VNĐ', time: '2 giờ trước', badge: 'Hoàn thành', variant: 'outline' as const },
              { type: 'Issue', title: 'Báo cáo sự cố', detail: 'Phòng P105 - Hỏng điều hòa', time: '5 giờ trước', badge: 'Cần xử lý', variant: 'destructive' as const },
              { type: 'Contract', title: 'Hợp đồng sắp hết hạn', detail: 'Trần Thị B - Tòa nhà Sunshine', time: '1 ngày trước', badge: 'Cảnh báo', variant: 'secondary' as const },
            ].filter(Boolean).map((activity: any, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                    {activity.type === 'New Tenant' ? <Users className="w-5 h-5" /> : activity.type === 'Payment' ? <Receipt className="w-5 h-5" /> : activity.type === 'Issue' ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.detail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground mb-1">{activity.time}</p>
                  <Badge variant={activity.variant} className="text-[10px] px-2 py-0">{activity.badge}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Breakdown Section */}
        <div className="space-y-6">
          <Card className="glass-card overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-heading">Trạng thái phòng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Đang thuê', value: stats.phongDangThue, color: 'bg-primary' },
                  { label: 'Phòng trống', value: stats.phongTrong, color: 'bg-emerald-500' },
                  { label: 'Bảo trì', value: stats.phongBaoTri, color: 'bg-amber-500' },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-1000`}
                        style={{ width: `${(item.value / stats.tongSoPhong) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {!isStaff && (
            <Card className="glass-card bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6" />
                  <h4 className="font-bold font-heading">Tăng trưởng 2026</h4>
                </div>
                <p className="text-xs opacity-80 mb-4">Hệ thống đang hoạt động với công suất tối ưu. Tỷ lệ lấp đầy phòng tăng 5% so với quý trước.</p>
                <Button variant="secondary" className="w-full bg-white text-primary hover:bg-white/90">Xuất báo cáo</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
