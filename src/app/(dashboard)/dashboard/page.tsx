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
  FileText,
  Plus,
  ArrowRight,
  Wallet,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { DashboardStats } from '@/types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const isStaff = session?.user?.role === 'nhanVien';
  const isOwner = session?.user?.role === 'chuNha';

  useEffect(() => {
    document.title = 'Tổng quan hệ thống';
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
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b']; // Emerald, Blue, Amber

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted animate-pulse rounded-lg" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="h-10 w-40 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse border-none bg-muted/30">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                <div className="h-8 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] bg-muted/20 animate-pulse rounded-xl" />
          <div className="h-[400px] bg-muted/20 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const pieData = [
    { name: 'Đang thuê', value: stats.phongDangThue },
    { name: 'Phòng trống', value: stats.phongTrong },
    { name: 'Bảo trì', value: stats.phongBaoTri },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Tổng quan hệ thống</h1>
          <p className="text-muted-foreground mt-1">Chào mừng quay trở lại, {session?.user?.name || 'Chủ trọ'}.</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 bg-card px-4 py-2 rounded-xl border border-border/50 shadow-sm">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      {/* Main Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Doanh thu tháng', value: formatCurrency(stats.doanhThuThang), trend: '+12.5%', icon: Wallet, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
          { label: 'Tỷ lệ lấp đầy', value: `${((stats.phongDangThue / stats.tongSoPhong) * 100).toFixed(1)}%`, trend: '+2.1%', icon: Activity, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
          { label: 'Hợp đồng sắp hết hạn', value: stats.hopDongSapHetHan, trend: 'Cần gia hạn', icon: FileText, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
          { label: 'Sự cố mới', value: stats.suCoCanXuLy, trend: 'Cần xử lý', icon: AlertCircle, color: 'from-rose-500 to-red-600', shadow: 'shadow-rose-500/20' },
        ].filter(Boolean).map((item: any, idx) => (
          <Card key={idx} className={`border-none shadow-xl ${item.shadow} hover:-translate-y-1 transition-all duration-300 overflow-hidden`}>
            <CardContent className="p-6 relative">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-10 rounded-bl-full`} />
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</p>
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold font-heading">{item.value}</h3>
                <Badge variant={idx === 3 ? 'destructive' : 'secondary'} className="rounded-full px-2 py-0.5 text-[10px]">
                  {item.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visual Data Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-none shadow-2xl shadow-gray-200/50 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-heading">Phân tích doanh thu</CardTitle>
                  <CardDescription>Xu hướng doanh thu 6 tháng gần nhất</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-none hover:bg-primary/20">Tháng này: {formatCurrency(stats.doanhThuThang)}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-6 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueChartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(value) => `${value / 1000000}M`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="var(--primary)" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        <Card className="border-none shadow-2xl shadow-gray-200/50 bg-white dark:bg-slate-900 rounded-3xl">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-2xl font-heading">Trạng thái phòng</CardTitle>
            <CardDescription>Cơ cấu lấp đầy hiện tại</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-6">
            <div className="h-[200px] mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-sm font-medium text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{item.value}</span>
                    <span className="text-[10px] text-muted-foreground">({((item.value / stats.tongSoPhong) * 100).toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.tongSoPhong}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Tổng số phòng</p>
              </div>
              <div className="w-px h-10 bg-gray-100" />
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-500">{stats.phongTrong}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Sẵn sàng</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
