import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ThongBao from '@/models/ThongBao';
import HopDong from '@/models/HopDong';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
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

    await dbConnect();

    // 1. Tìm hợp đồng của khách thuê để lấy ID tòa nhà
    const hopDong = await HopDong.findOne({
      khachThueId: decoded.id,
      trangThai: 'hoatDong'
    }).populate('phong');

    // 2. Lấy thông báo
    const query: any = {
      $or: [
        // Thông báo gửi đích danh cho khách thuê này
        { nguoiNhan: decoded.id },
      ]
    };

    if (hopDong && (hopDong.phong as any)?.toaNha) {
      const toaNhaId = (hopDong.phong as any).toaNha;
      query.$or.push(
        // Thông báo dành riêng cho tòa nhà này
        { toaNha: toaNhaId },
        // Thông báo chung không chỉ định tòa nhà
        { 
          toaNha: { $exists: false },
          loai: 'chung'
        },
        {
          toaNha: null,
          loai: 'chung'
        }
      );
    } else {
      // Nếu khách thuê chưa có phòng/tòa nhà, chỉ lấy thông báo chung không gán tòa nhà
      query.$or.push({
        toaNha: { $exists: false },
        loai: 'chung'
      }, {
        toaNha: null,
        loai: 'chung'
      });
    }

    const thongBaos = await ThongBao.find(query).sort({ ngayGui: -1 });

    return NextResponse.json({
      success: true,
      data: thongBaos
    });

  } catch (error) {
    console.error('Error fetching tenant notifications:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
