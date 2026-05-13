import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import HoaDon from '@/models/HoaDon';
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

    if (decoded.role !== 'khachThue') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const hoaDons = await HoaDon.find({
      khachThue: decoded.id
    })
    .sort({ nam: -1, thang: -1 })
    .populate('phong', 'maPhong');

    return NextResponse.json({
      success: true,
      data: hoaDons
    });

  } catch (error) {
    console.error('Error fetching tenant invoices:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
