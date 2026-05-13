'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, Info, AlertTriangle, FileText, CheckCircle2, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ThongBao {
  _id: string;
  tieuDe: string;
  noiDung: string;
  loai: 'chung' | 'hoaDon' | 'suCo' | 'hopDong' | 'khac';
  ngayGui: string;
  daDoc: string[];
}

export default function TenantThongBaoPage() {
  const [thongBaos, setThongBaos] = useState<ThongBao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThongBaos();
  }, []);

  const fetchThongBaos = async () => {
    try {
      const token = localStorage.getItem('khachThueToken');
      const response = await fetch('/api/khach-thue/dashboard/thong-bao', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setThongBaos(result.data);
      } else {
        toast.error(result.message || 'Không thể tải thông báo');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'hoaDon': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'suCo': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'hopDong': return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getBadge = (type: string) => {
    switch (type) {
      case 'hoaDon': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Hóa đơn</Badge>;
      case 'suCo': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Sự cố</Badge>;
      case 'hopDong': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Hợp đồng</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none">Thông báo</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
        <p className="text-gray-500">Cập nhật những tin tức mới nhất từ ban quản lý tòa nhà</p>
      </div>

      <div className="space-y-4">
        {thongBaos.length === 0 ? (
          <Card className="border-dashed border-2 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-gray-300" />
            </div>
            <CardTitle className="text-xl mb-2 text-gray-400 font-medium">Bạn chưa có thông báo nào</CardTitle>
          </Card>
        ) : (
          thongBaos.map((tb) => (
            <Card key={tb._id} className="hover:shadow-md transition-shadow rounded-2xl border-gray-100 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className={`w-full md:w-16 flex items-center justify-center p-4 md:p-0 ${
                    tb.loai === 'hoaDon' ? 'bg-blue-50' : 
                    tb.loai === 'suCo' ? 'bg-orange-50' : 
                    tb.loai === 'hopDong' ? 'bg-emerald-50' : 'bg-gray-50'
                  }`}>
                    {getIcon(tb.loai)}
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        {getBadge(tb.loai)}
                        <h3 className="text-lg font-bold text-gray-900">{tb.tieuDe}</h3>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-full">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        {format(new Date(tb.ngayGui), 'HH:mm - dd/MM/yyyy', { locale: vi })}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {tb.noiDung}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
