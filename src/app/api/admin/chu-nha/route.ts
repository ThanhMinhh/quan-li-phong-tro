import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import NguoiDung from '@/models/NguoiDung';

// GET: Lấy danh sách chủ nhà (dùng cho dropdown chọn chủ sở hữu)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const chuNhaList = await NguoiDung.find(
      { vaiTro: 'chuNha', trangThai: 'hoatDong' },
      { _id: 1, ten: 1, email: 1, soDienThoai: 1 }
    ).sort({ ten: 1 });

    return NextResponse.json({ success: true, data: chuNhaList });
  } catch (error) {
    console.error('Error fetching chu nha list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
