import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import KhachThue from '@/models/KhachThue';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'Thiếu ID khách thuê' }, { status: 400 });
    }

    await dbConnect();

    const khachThue = await KhachThue.findById(id);
    if (!khachThue) {
      return NextResponse.json({ message: 'Khách thuê không tồn tại' }, { status: 404 });
    }

    // Đặt mật khẩu mặc định là 123456
    khachThue.matKhau = '123456';
    await khachThue.save();

    return NextResponse.json({
      success: true,
      message: 'Đã tạo tài khoản '
    });

  } catch (error) {
    console.error('Error quick account creation:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
