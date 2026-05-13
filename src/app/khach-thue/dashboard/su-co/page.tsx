'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Clock, Plus, MessageSquare, X, Info } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SuCo {
  _id: string;
  tieuDe: string;
  moTa: string;
  loaiSuCo: string;
  mucDoUuTien: 'thap' | 'trungBinh' | 'cao' | 'khancap';
  trangThai: 'moi' | 'dangXuLy' | 'daXong' | 'daHuy';
  ngayTao: string;
}

interface TenantInfo {
  khachThue: {
    _id: string;
    hoTen: string;
  };
  hopDongHienTai: {
    phong: {
      _id: string;
      maPhong: string;
    };
  } | null;
}

export default function TenantSuCoPage() {
  const [suCos, setSuCos] = useState<SuCo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);

  const [formData, setFormData] = useState({
    tieuDe: '',
    moTa: '',
    loaiSuCo: 'dienNuoc',
    mucDoUuTien: 'trungBinh'
  });

  useEffect(() => {
    fetchSuCos();
    fetchTenantInfo();
  }, []);

  const fetchSuCos = async () => {
    try {
      const token = localStorage.getItem('khachThueToken');
      const response = await fetch('/api/khach-thue/dashboard/su-co', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setSuCos(result.data);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantInfo = async () => {
    try {
      const token = localStorage.getItem('khachThueToken');
      const response = await fetch('/api/auth/khach-thue/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setTenantInfo(result.data);
      }
    } catch (error) {
      console.error('Error fetching tenant info:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantInfo?.hopDongHienTai) {
      toast.error('Bạn cần có hợp đồng hoạt động để báo cáo sự cố');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('khachThueToken');
      const response = await fetch('/api/khach-thue/dashboard/su-co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Gửi báo cáo sự cố thành công');
        setIsDialogOpen(false);
        setFormData({ tieuDe: '', moTa: '', loaiSuCo: 'dienNuoc', mucDoUuTien: 'trungBinh' });
        fetchSuCos();
      } else {
        toast.error(result.message || 'Không thể gửi báo cáo');
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast.error('Có lỗi xảy ra khi gửi báo cáo');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'daXong':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Đã xong</Badge>;
      case 'dangXuLy':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Đang xử lý</Badge>;
      case 'moi':
        return <Badge variant="secondary">Mới</Badge>;
      case 'daHuy':
        return <Badge variant="outline" className="text-gray-400 border-gray-400">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'khancap':
        return <Badge variant="destructive" className="animate-pulse">Khẩn cấp</Badge>;
      case 'cao':
        return <Badge variant="destructive">Cao</Badge>;
      case 'trungBinh':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Trung bình</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Thấp</Badge>;
    }
  };

  const getLoaiSuCoText = (type: string) => {
    switch (type) {
      case 'dienNuoc': return 'Điện nước';
      case 'noiThat': return 'Nội thất';
      case 'vesinh': return 'Vệ sinh';
      case 'anNinh': return 'An ninh';
      default: return 'Khác';
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
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo sự cố</h1>
          <p className="text-gray-500">Thông báo cho quản lý về các vấn đề hỏng hóc trong phòng của bạn</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#004D40] hover:bg-[#003d33] h-12 px-6 rounded-xl font-semibold">
              <Plus className="h-5 w-5 mr-2" />
              Báo sự cố mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
            <form onSubmit={handleSubmit}>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">Báo cáo sự cố mới</DialogTitle>
                    <DialogDescription className="text-gray-500 mt-1">
                      Nhập thông tin sự cố mới
                    </DialogDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setIsDialogOpen(false)}>
                    <X className="h-5 w-5 text-gray-400" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">Phòng</Label>
                    <div className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 flex items-center text-gray-900 font-medium">
                      {tenantInfo?.hopDongHienTai?.phong?.maPhong || 'Đang tải...'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">Khách thuê</Label>
                    <div className="h-auto min-h-12 w-full rounded-2xl border border-yellow-100 bg-yellow-50 px-4 py-2 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-700 font-bold text-xs">
                        {tenantInfo?.khachThue?.hoTen?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-yellow-800">{tenantInfo?.khachThue?.hoTen}</p>
                        <p className="text-[10px] text-yellow-700 opacity-80">Thông tin tự động lấy từ tài khoản</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">Tiêu đề</Label>
                    <Input
                      placeholder="Nhập tiêu đề sự cố"
                      className="h-12 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      value={formData.tieuDe}
                      onChange={(e) => setFormData(prev => ({ ...prev, tieuDe: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">Mô tả chi tiết</Label>
                    <Textarea
                      placeholder="Mô tả chi tiết về sự cố..."
                      className="rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 min-h-[120px] resize-none"
                      value={formData.moTa}
                      onChange={(e) => setFormData(prev => ({ ...prev, moTa: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700">Loại sự cố</Label>
                      <select
                        className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.loaiSuCo}
                        onChange={(e) => setFormData(prev => ({ ...prev, loaiSuCo: e.target.value }))}
                      >
                        <option value="dienNuoc">Điện nước</option>
                        <option value="noiThat">Nội thất</option>
                        <option value="vesinh">Vệ sinh</option>
                        <option value="anNinh">An ninh</option>
                        <option value="khac">Khác</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700">Mức độ ưu tiên</Label>
                      <select
                        className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.mucDoUuTien}
                        onChange={(e) => setFormData(prev => ({ ...prev, mucDoUuTien: e.target.value as any }))}
                      >
                        <option value="thap">Thấp</option>
                        <option value="trungBinh">Trung bình</option>
                        <option value="cao">Cao</option>
                        <option value="khancap">Khẩn cấp</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="bg-gray-50 p-6 flex flex-row justify-end gap-3 sm:justify-end">
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} className="h-12 px-8 rounded-2xl font-bold border-gray-200">
                  Hủy
                </Button>
                <Button type="submit" className="bg-[#004D40] hover:bg-[#003d33] h-12 px-8 rounded-2xl font-bold" disabled={submitting}>
                  {submitting ? 'Đang gửi...' : 'Báo cáo'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suCos.length === 0 ? (
          <Card className="col-span-full border-dashed border-2 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <CardTitle className="text-xl mb-2">Chưa có báo cáo nào</CardTitle>
            <CardDescription>Các sự cố bạn báo cáo sẽ xuất hiện tại đây.</CardDescription>
          </Card>
        ) : (
          suCos.map((sc) => (
            <Card key={sc._id} className="hover:shadow-md transition-shadow rounded-2xl overflow-hidden border-gray-100">
              <CardHeader className="pb-3 bg-gray-50/50">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-white">{getLoaiSuCoText(sc.loaiSuCo)}</Badge>
                  <div className="flex gap-1">
                    {getPriorityBadge(sc.mucDoUuTien)}
                    {getStatusBadge(sc.trangThai)}
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-1 font-bold text-gray-900">{sc.tieuDe}</CardTitle>
                <CardDescription className="flex items-center text-xs text-gray-500 font-medium">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(new Date(sc.ngayTao), 'dd/MM/yyyy HH:mm')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 min-h-[60px] leading-relaxed">
                  {sc.moTa}
                </p>
                {/* <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="w-full rounded-xl font-semibold border-gray-200">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Phản hồi
                  </Button>
                </div> */}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
