'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface HoaDon {
  _id: string;
  maHoaDon: string;
  thang: number;
  nam: number;
  tongTien: number;
  trangThai: 'chuaThanhToan' | 'daThanhToan' | 'quaHan';
  hanThanhToan: string;
  phong: {
    maPhong: string;
  };
}

export default function TenantHoaDonPage() {
  const [hoaDons, setHoaDons] = useState<HoaDon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHoaDons();
  }, []);

  const fetchHoaDons = async () => {
    try {
      const token = localStorage.getItem('khachThueToken');
      const response = await fetch('/api/khach-thue/dashboard/hoa-don', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setHoaDons(result.data);
      } else {
        toast.error(result.message || 'Không thể tải danh sách hóa đơn');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'daThanhToan':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Đã thanh toán</Badge>;
      case 'chuaThanhToan':
        return <Badge variant="outline" className="text-orange-500 border-orange-500">Chưa thanh toán</Badge>;
      case 'quaHan':
        return <Badge variant="destructive">Quá hạn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách hóa đơn</h1>
          <p className="text-gray-500">Xem và quản lý các hóa đơn tiền phòng hàng tháng của bạn</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {hoaDons.length === 0 ? (
          <Card className="border-dashed border-2 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <CardTitle className="text-xl mb-2">Chưa có hóa đơn nào</CardTitle>
            <CardDescription>Bạn hiện không có hóa đơn nào trong hệ thống.</CardDescription>
          </Card>
        ) : (
          hoaDons.map((hd) => (
            <Card key={hd._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">{hd.maHoaDon}</span>
                        {getStatusBadge(hd.trangThai)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-500 gap-2">
                          <Calendar className="h-3 w-3" />
                          Tháng {hd.thang}/{hd.nam}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 gap-2">
                          <AlertCircle className="h-3 w-3" />
                          Hạn thanh toán: {format(new Date(hd.hanThanhToan), 'dd/MM/yyyy')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-between gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Tổng tiền</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {hd.tongTien.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(`/hoa-don/${hd._id}`, '_blank')}>
                        <Eye className="h-4 w-4 mr-2" />
                        Chi tiết
                      </Button>

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
