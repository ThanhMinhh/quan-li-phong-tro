import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SuCo from '@/models/SuCo';
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

    const suCos = await SuCo.find({
      khachThue: decoded.id
    }).sort({ ngayTao: -1 });

    return NextResponse.json({
      success: true,
      data: suCos
    });

  } catch (error) {
    console.error('Error fetching tenant issues:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

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
    const { tieuDe, moTa, mucDo, loaiSuCo } = body;

    await dbConnect();

    // Tìm hợp đồng của khách thuê để lấy ID phòng
    const hopDong = await HopDong.findOne({
      khachThueId: decoded.id,
      trangThai: 'hoatDong'
    });

    if (!hopDong) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy hợp đồng hoạt động của bạn' }, { status: 400 });
    }

    const newSuCo = new SuCo({
      tieuDe,
      moTa,
      loaiSuCo: loaiSuCo || 'khac',
      mucDoUuTien: mucDo || 'trungBinh',
      phong: hopDong.phong,
      khachThue: decoded.id,
      trangThai: 'moi',
      ngayTao: new Date(),
      ngayBaoCao: new Date()
    });

    await newSuCo.save();

    return NextResponse.json({
      success: true,
      message: 'Đã gửi báo cáo sự cố',
      data: newSuCo
    });

  } catch (error) {
    console.error('Error reporting tenant issue:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
