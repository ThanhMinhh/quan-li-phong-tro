'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, CreditCard, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
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

interface KhachThueInfo {
  _id: string;
  hoTen: string;
  soDienThoai: string;
  email: string;
  cccd: string;
  ngaySinh: string;
  gioiTinh: string;
  queQuan: string;
  ngheNghiep: string;
}

export default function TenantProfilePage() {
  const [info, setInfo] = useState<KhachThueInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    try {
      const token = localStorage.getItem('khachThueToken');
      const response = await fetch('/api/auth/khach-thue/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setInfo(result.data.khachThue);
      } else {
        toast.error(result.message || 'Không thể tải thông tin cá nhân');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('khachThueToken');
      const response = await fetch('/api/khach-thue/dashboard/doi-mat-khau', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Đổi mật khẩu thành công');
        setIsPasswordDialogOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(result.message || 'Không thể đổi mật khẩu');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !info) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
          <p className="text-gray-500">Quản lý thông tin tài khoản của bạn</p>
        </div>
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-xl">
              <Lock className="h-4 w-4 mr-2" />
              Đổi mật khẩu
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <form onSubmit={handleChangePassword}>
              <DialogHeader>
                <DialogTitle>Đổi mật khẩu</DialogTitle>
                <DialogDescription>
                  Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="current">Mật khẩu hiện tại</Label>
                  <div className="relative">
                    <Input
                      id="current"
                      type={showCurrentPassword ? "text" : "password"}
                      className="rounded-xl pr-10"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new">Mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="new"
                      type={showNewPassword ? "text" : "password"}
                      className="rounded-xl pr-10"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirm"
                    type="password"
                    className="rounded-xl"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)} className="rounded-xl">
                  Hủy
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 rounded-xl" disabled={submitting}>
                  {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 rounded-2xl overflow-hidden border-gray-100 shadow-sm">
          <CardContent className="pt-8 text-center">
            <div className="relative inline-block mb-4">
              <Avatar className="w-28 h-28 border-4 border-white shadow-xl">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl font-bold">
                  {info.hoTen.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{info.hoTen}</h2>
            <p className="text-gray-500 font-medium mb-4">{info.ngheNghiep || 'Khách thuê'}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full font-bold border border-green-100">
                Tài khoản xác thực
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 rounded-2xl border-gray-100 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">Chi tiết hồ sơ</CardTitle>
            <CardDescription>Các thông tin định danh và liên lạc của bạn</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
            <div className="space-y-1.5">
              <Label className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Phone className="h-3 w-3" /> Số điện thoại
              </Label>
              <p className="font-bold text-gray-900 text-lg">{info.soDienThoai}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Mail className="h-3 w-3" /> Email
              </Label>
              <p className="font-bold text-gray-900 text-lg truncate">{info.email || 'user15758@gmail.com'}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="h-3 w-3" /> CCCD/CMND
              </Label>
              <p className="font-bold text-gray-900 text-lg">{info.cccd}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Ngày sinh
              </Label>
              <p className="font-bold text-gray-900 text-lg">{format(new Date(info.ngaySinh), 'dd/MM/yyyy')}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-3 w-3" /> Quê quán
              </Label>
              <p className="font-bold text-gray-900 text-lg">{info.queQuan}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="h-3 w-3" /> Nghề nghiệp
              </Label>
              <p className="font-bold text-gray-900 text-lg">{info.ngheNghiep || 'Giáo viên'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-gray-50/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Bảo mật tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-blue-50/30 rounded-2xl border border-blue-100/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Mật khẩu đăng nhập</p>
                  <p className="text-xs text-gray-500 font-medium">Thay đổi mật khẩu định kỳ để bảo vệ tài khoản</p>
                </div>
              </div>
              <Button 
                variant="secondary" 
                className="rounded-xl font-bold px-6 bg-white hover:bg-gray-50 text-blue-600 border border-blue-100"
                onClick={() => setIsPasswordDialogOpen(true)}
              >
                Cập nhật
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
