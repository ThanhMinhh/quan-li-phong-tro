import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import HopDong from '@/models/HopDong';
import Phong from '@/models/Phong';
import KhachThue from '@/models/KhachThue';
import ToaNha from '@/models/ToaNha';

export async function GET(request: NextRequest) {
  try {
    console.log('Form data API called');
    
    // Kiểm tra session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, role } = session.user;
    console.log(`User: ${id}, Role: ${role}`);

    await connectToDatabase();

    // 1. Lấy danh sách tòa nhà theo chủ sở hữu (nếu không phải admin)
    let toaNhaQuery = {};
    if (role !== 'admin') {
      toaNhaQuery = { chuSoHuu: id };
    }
    const toaNhaListFull = await ToaNha.find(toaNhaQuery).select('_id tenToaNha diaChi');
    const toaNhaIds = toaNhaListFull.map(t => t._id);

    // 2. Lấy danh sách phòng thuộc các tòa nhà trên
    const phongQuery = role === 'admin' ? {} : { toaNha: { $in: toaNhaIds } };
    const phongList = await Phong.find(phongQuery)
      .select('maPhong toaNha tang dienTich giaThue trangThai')
      .sort({ maPhong: 1 });
    const phongIds = phongList.map(p => p._id);

    // 3. Lấy danh sách hợp đồng hoạt động của các phòng trên
    const hopDongQuery = role === 'admin' 
      ? { trangThai: 'hoatDong' } 
      : { trangThai: 'hoatDong', phong: { $in: phongIds } };
    
    const hopDongList = await HopDong.find(hopDongQuery)
      .select('maHopDong phong nguoiDaiDien giaThue giaDien giaNuoc phiDichVu ngayThanhToan trangThai chiSoDienBanDau chiSoNuocBanDau ngayBatDau ngayKetThuc')
      .sort({ maHopDong: 1 });

    // 4. Lấy danh sách khách thuê liên quan đến các hợp đồng trên (để hiển thị tên)
    // Nếu là admin thì lấy tất cả, nếu là chủ nhà thì chỉ lấy khách thuê có hợp đồng tại phòng của mình
    let khachThueQuery = {};
    if (role !== 'admin') {
      const khachThueIds = hopDongList.map(hd => hd.nguoiDaiDien);
      khachThueQuery = { _id: { $in: khachThueIds } };
    }
    
    const khachThueList = await KhachThue.find(khachThueQuery)
      .select('hoTen soDienThoai email trangThai')
      .sort({ hoTen: 1 });

    return NextResponse.json({
      success: true,
      data: {
        hopDongList,
        phongList,
        khachThueList,
        toaNhaList: toaNhaListFull,
      },
    });

  } catch (error) {
    console.error('Error fetching form data:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
