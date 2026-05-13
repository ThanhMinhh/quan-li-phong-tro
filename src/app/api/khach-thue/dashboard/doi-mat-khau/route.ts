import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import KhachThue from '@/models/KhachThue';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret');
    } catch (error) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: 'Thiếu thông tin mật khẩu' }, { status: 400 });
    }

    await dbConnect();

    // Tìm khách thuê và lấy cả mật khẩu (do select: false)
    const khachThue = await KhachThue.findById(decoded.id).select('+matKhau');
    
    if (!khachThue) {
      return NextResponse.json({ success: false, message: 'Khách thuê không tồn tại' }, { status: 404 });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await khachThue.comparePassword(currentPassword);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Mật khẩu hiện tại không chính xác' }, { status: 400 });
    }

    // Cập nhật mật khẩu mới
    khachThue.matKhau = newPassword;
    await khachThue.save();

    return NextResponse.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });

  } catch (error) {
    console.error('Error changing tenant password:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
