'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Building2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  matKhau: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: data.email,
        matKhau: data.matKhau,
        redirect: false,
      });

      if (result?.error) {
        setError('Email hoặc mật khẩu không đúng');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background with Image Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center grayscale-[0.2]"
        style={{ backgroundImage: 'url("/images/login-bg.png")' }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-background/90 via-background/60 to-background/90 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 max-w-md w-full px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-2xl shadow-primary/40 mb-6 transform hover:rotate-12 transition-transform duration-300">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          {/* <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-2 font-heading">
            Aura <span className="text-primary">Rental</span>
          </h1> */}
          <p className="text-muted-foreground text-sm uppercase tracking-[0.2em]">
            Hệ thống quản lý thông minh
          </p>
        </div>

        <Card className="glass-card shadow-2xl border-primary/10">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold font-heading">Đăng nhập</CardTitle>
            <CardDescription className="text-muted-foreground">
              Vui lòng nhập thông tin để truy cập hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className="bg-background/50 focus:bg-background transition-all"
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="matKhau">Mật khẩu</Label>
                </div>
                <div className="relative">
                  <Input
                    id="matKhau"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('matKhau')}
                    className="bg-background/50 focus:bg-background pr-10 transition-all"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-primary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {errors.matKhau && (
                  <p className="text-xs text-destructive mt-1">{errors.matKhau.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Đăng nhập ngay'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-sm text-muted-foreground">

        </p>
      </div>
    </div>
  );
}
