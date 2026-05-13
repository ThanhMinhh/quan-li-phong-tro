import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import HoaDon from '@/models/HoaDon';
import HopDong from '@/models/HopDong';
import Phong from '@/models/Phong';
import ToaNha from '@/models/ToaNha';
import KhachThue from '@/models/KhachThue';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PhiDichVu } from '@/types';

// GET - Lấy danh sách hóa đơn
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const hopDongId = searchParams.get('hopDongId');
    const trangThai = searchParams.get('trangThai');
    const toaNhaId = searchParams.get('toaNhaId');

    // Nếu có ID, lấy hóa đơn cụ thể
    if (id) {
      const hoaDon = await HoaDon.findById(id)
        .populate('hopDong', 'maHopDong')
        .populate('phong', 'maPhong')
        .populate('khachThue', 'hoTen soDienThoai');
      
      if (!hoaDon) {
        return NextResponse.json(
          { message: 'Hóa đơn không tồn tại' },
          { status: 404 }
        );
      }

      const hoaDonObj = hoaDon.toObject();
      
      // Xử lý dữ liệu cũ không có chỉ số điện nước
      if (hoaDonObj.chiSoDienBanDau === undefined) {
        hoaDonObj.chiSoDienBanDau = 0;
      }
      if (hoaDonObj.chiSoDienCuoiKy === undefined) {
        hoaDonObj.chiSoDienCuoiKy = hoaDonObj.chiSoDienBanDau;
      }
      if (hoaDonObj.chiSoNuocBanDau === undefined) {
        hoaDonObj.chiSoNuocBanDau = 0;
      }
      if (hoaDonObj.chiSoNuocCuoiKy === undefined) {
        hoaDonObj.chiSoNuocCuoiKy = hoaDonObj.chiSoNuocBanDau;
      }

      return NextResponse.json({
        success: true,
        data: hoaDonObj
      });
    }

    const query: Record<string, unknown> = {};
    if (hopDongId) {
      query.hopDong = hopDongId;
    }
    if (trangThai) {
      query.trangThai = trangThai;
    }
    
    // Phân quyền dữ liệu
    const userRole = session.user.role;
    const userId = session.user.id;

    if (userRole !== 'admin') {
      // Đối với bất kỳ ai không phải Admin (Chủ nhà, Nhân viên, hoặc vai trò không xác định)
      // Mặc định: Chỉ xem những gì thuộc sở hữu hoặc được gán quản lý
      
      // 1. Lấy danh sách tòa nhà thuộc sở hữu (đối với chuNha) hoặc tất cả (đối với nhanVien tạm thời)
      let ownedBuildingIds: any[] = [];
      if (userRole === 'chuNha' || !userRole) {
        const ownedBuildings = await ToaNha.find({ chuSoHuu: userId }).select('_id');
        ownedBuildingIds = ownedBuildings.map(b => b._id);
      }
      
      // 2. Lấy danh sách phòng thuộc các tòa nhà đó
      const accessibleRooms = userRole === 'nhanVien' 
        ? await Phong.find().select('_id') // Nhân viên tạm thời xem tất cả nếu không lọc
        : await Phong.find({ toaNha: { $in: ownedBuildingIds } }).select('_id');
      
      const accessibleRoomIds = accessibleRooms.map(r => r._id);
      
      if (toaNhaId && toaNhaId !== 'all') {
        // Nếu có lọc theo tòa nhà, kiểm tra quyền truy cập
        const canAccessToaNha = userRole === 'nhanVien' || ownedBuildingIds.some(id => id.toString() === toaNhaId);
        
        if (canAccessToaNha) {
          const filteredRooms = await Phong.find({ toaNha: toaNhaId }).select('_id');
          query.phong = { $in: filteredRooms.map(r => r._id) };
        } else {
          query.phong = { $in: accessibleRoomIds };
        }
      } else {
        query.phong = { $in: accessibleRoomIds };
      }
    } else {
      // Admin: Xem tất cả, lọc theo tòa nhà nếu có
      if (toaNhaId && toaNhaId !== 'all') {
        const rooms = await Phong.find({ toaNha: toaNhaId }).select('_id');
        query.phong = { $in: rooms.map(r => r._id) };
      }
    }

    const skip = (page - 1) * limit;

    const hoaDons = await HoaDon.find(query)
      .populate('hopDong', 'maHopDong')
      .populate('phong', 'maPhong')
      .populate('khachThue', 'hoTen soDienThoai')
      .sort({ nam: -1, thang: -1 })
      .skip(skip)
      .limit(limit);

    // Xử lý dữ liệu cũ không có chỉ số điện nước
    const processedHoaDons = hoaDons.map(hoaDon => {
      const hoaDonObj = hoaDon.toObject();
      
      // Nếu không có chỉ số điện nước, tạo giá trị mặc định
      if (hoaDonObj.chiSoDienBanDau === undefined) {
        hoaDonObj.chiSoDienBanDau = 0;
      }
      if (hoaDonObj.chiSoDienCuoiKy === undefined) {
        hoaDonObj.chiSoDienCuoiKy = hoaDonObj.chiSoDienBanDau;
      }
      if (hoaDonObj.chiSoNuocBanDau === undefined) {
        hoaDonObj.chiSoNuocBanDau = 0;
      }
      if (hoaDonObj.chiSoNuocCuoiKy === undefined) {
        hoaDonObj.chiSoNuocCuoiKy = hoaDonObj.chiSoNuocBanDau;
      }
      
      return hoaDonObj;
    });

    const total = await HoaDon.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: processedHoaDons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching hoa don:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Tạo hóa đơn mới
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const {
      maHoaDon,
      hopDong,
      thang,
      nam,
      tienPhong,
      chiSoDienBanDau,
      chiSoDienCuoiKy,
      chiSoNuocBanDau,
      chiSoNuocCuoiKy,
      phiDichVu,
      ghiChu
    } = body;

    // Validate required fields
    if (!hopDong) {
      return NextResponse.json(
        { message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Kiểm tra hợp đồng tồn tại
    const hopDongData = await HopDong.findById(hopDong)
      .populate('phong')
      .populate('khachThueId');
    
    if (!hopDongData) {
      return NextResponse.json(
        { message: 'Hợp đồng không tồn tại' },
        { status: 404 }
      );
    }

    // Tạo mã hóa đơn (sử dụng mã từ frontend hoặc tự sinh)
    let finalMaHoaDon = maHoaDon;
    
    if (!finalMaHoaDon || finalMaHoaDon.trim() === '') {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      finalMaHoaDon = `HD${year}${month}${day}${randomNum}`;
    }

    // Kiểm tra mã hóa đơn đã tồn tại chưa
    const existingHoaDon = await HoaDon.findOne({ maHoaDon: finalMaHoaDon });
    if (existingHoaDon) {
      // Nếu mã từ frontend bị trùng, tự sinh mã mới
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      finalMaHoaDon = `HD${year}${month}${day}${randomNum}`;
    }

    let hoaDonData: Record<string, unknown> = {
      maHoaDon: finalMaHoaDon,
      hopDong: hopDong,
      phong: hopDongData.phong,
      khachThue: hopDongData.nguoiDaiDien,
      ghiChu
    };

    // Hóa đơn hàng tháng
    if (!thang || !nam || tienPhong === undefined) {
      return NextResponse.json(
        { message: 'Thiếu thông tin cho hóa đơn hàng tháng' },
        { status: 400 }
      );
    }

    // Kiểm tra hóa đơn tháng này đã tồn tại chưa
    const existingMonthlyHoaDon = await HoaDon.findOne({
      hopDong: hopDong,
      thang,
      nam
    });
    
    if (existingMonthlyHoaDon) {
      return NextResponse.json(
        { message: `Hóa đơn tháng ${thang}/${nam} đã tồn tại` },
        { status: 400 }
      );
    }

    // Tự động tính chỉ số điện nước
    let chiSoDienBanDauValue = chiSoDienBanDau;
    let chiSoDienCuoiKyValue = chiSoDienCuoiKy;
    let chiSoNuocBanDauValue = chiSoNuocBanDau;
    let chiSoNuocCuoiKyValue = chiSoNuocCuoiKy;

    // Tìm hóa đơn gần nhất để lấy chỉ số cuối kỳ
    const lastHoaDon = await HoaDon.findOne({
      hopDong: hopDong,
      $or: [
        { nam: { $lt: nam } },
        { nam: nam, thang: { $lt: thang } }
      ]
    }).sort({ nam: -1, thang: -1 });

    if (lastHoaDon) {
      // Hóa đơn tiếp theo: lấy chỉ số cuối kỳ từ hóa đơn trước
      chiSoDienBanDauValue = lastHoaDon.chiSoDienCuoiKy;
      chiSoNuocBanDauValue = lastHoaDon.chiSoNuocCuoiKy;
    } else {
      // Hóa đơn đầu tiên: lấy chỉ số ban đầu từ hợp đồng
      chiSoDienBanDauValue = hopDongData.chiSoDienBanDau;
      chiSoNuocBanDauValue = hopDongData.chiSoNuocBanDau;
    }

    // Nếu không có chỉ số cuối kỳ từ form, sử dụng chỉ số ban đầu
    if (!chiSoDienCuoiKyValue) {
      chiSoDienCuoiKyValue = chiSoDienBanDauValue;
    }
    if (!chiSoNuocCuoiKyValue) {
      chiSoNuocCuoiKyValue = chiSoNuocBanDauValue;
    }

    // Tính số điện nước
    const soDien = chiSoDienCuoiKyValue - chiSoDienBanDauValue;
    const soNuoc = chiSoNuocCuoiKyValue - chiSoNuocBanDauValue;

    // Tính tiền điện nước
    const tienDienTinh = soDien * hopDongData.giaDien;
    const tienNuocTinh = soNuoc * hopDongData.giaNuoc;

    const tongTien = tienPhong + tienDienTinh + tienNuocTinh + (phiDichVu?.reduce((sum: number, phi: PhiDichVu) => sum + phi.gia, 0) || 0);

    hoaDonData = {
      ...hoaDonData,
      thang,
      nam,
      tienPhong,
      tienDien: tienDienTinh,
      soDien,
      chiSoDienBanDau: chiSoDienBanDauValue,
      chiSoDienCuoiKy: chiSoDienCuoiKyValue,
      tienNuoc: tienNuocTinh,
      soNuoc,
      chiSoNuocBanDau: chiSoNuocBanDauValue,
      chiSoNuocCuoiKy: chiSoNuocCuoiKyValue,
      phiDichVu: phiDichVu || [],
      tongTien,
      trangThai: 'chuaThanhToan',
      hanThanhToan: new Date(nam, thang - 1, hopDongData.ngayThanhToan) // Hạn thanh toán theo ngày quy định trong hợp đồng
    };

    const hoaDon = new HoaDon(hoaDonData);
    await hoaDon.save();

    // Populate để trả về dữ liệu đầy đủ
    await hoaDon.populate([
      { path: 'hopDong', select: 'maHopDong' },
      { path: 'phong', select: 'maPhong' },
      { path: 'khachThue', select: 'hoTen soDienThoai' }
    ]);

    return NextResponse.json({
      success: true,
      data: hoaDon,
      message: 'Tạo hóa đơn thành công'
    });
  } catch (error) {
    console.error('Error creating hoa don:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật hóa đơn
export async function PUT(request: NextRequest) {
  try {
    console.log('PUT request received for hoa-don');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized request');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    console.log('Database connected');

    const body = await request.json();
    console.log('Request body:', body);
    const {
      id,
      maHoaDon,
      hopDong,
      thang,
      nam,
      tienPhong,
      chiSoDienBanDau,
      chiSoDienCuoiKy,
      chiSoNuocBanDau,
      chiSoNuocCuoiKy,
      phiDichVu,
      trangThai,
      hanThanhToan,
      ghiChu
    } = body;

    // Validate required fields
    if (!id) {
      console.log('Missing ID');
      return NextResponse.json(
        { message: 'Thiếu ID hóa đơn' },
        { status: 400 }
      );
    }

    // Kiểm tra hóa đơn tồn tại
    console.log('Looking for hoa don with ID:', id);
    const existingHoaDon = await HoaDon.findById(id);
    if (!existingHoaDon) {
      console.log('Hoa don not found');
      return NextResponse.json(
        { message: 'Hóa đơn không tồn tại' },
        { status: 404 }
      );
    }

    // Kiểm tra hợp đồng tồn tại
    console.log('Looking for hop dong with ID:', hopDong);
    const hopDongData = await HopDong.findById(hopDong);
    if (!hopDongData) {
      console.log('Hop dong not found');
      return NextResponse.json(
        { message: 'Hợp đồng không tồn tại' },
        { status: 404 }
      );
    }

    // Tính số điện nước
    const soDien = chiSoDienCuoiKy - chiSoDienBanDau;
    const soNuoc = chiSoNuocCuoiKy - chiSoNuocBanDau;

    // Tính tiền điện nước
    const tienDienTinh = soDien * hopDongData.giaDien;
    const tienNuocTinh = soNuoc * hopDongData.giaNuoc;

    const tongTien = tienPhong + tienDienTinh + tienNuocTinh + (phiDichVu?.reduce((sum: number, phi: PhiDichVu) => sum + phi.gia, 0) || 0);

    // Cập nhật hóa đơn
    const updatedHoaDon = await HoaDon.findByIdAndUpdate(
      id,
      {
        maHoaDon,
        hopDong,
        thang,
        nam,
        tienPhong,
        tienDien: tienDienTinh,
        soDien,
        chiSoDienBanDau,
        chiSoDienCuoiKy,
        tienNuoc: tienNuocTinh,
        soNuoc,
        chiSoNuocBanDau,
        chiSoNuocCuoiKy,
        phiDichVu: phiDichVu || [],
        tongTien,
        trangThai,
        hanThanhToan: new Date(hanThanhToan),
        ghiChu
      },
      { new: true }
    ).populate([
      { path: 'hopDong', select: 'maHopDong' },
      { path: 'phong', select: 'maPhong' },
      { path: 'khachThue', select: 'hoTen soDienThoai' }
    ]);

    return NextResponse.json({
      success: true,
      data: updatedHoaDon,
      message: 'Cập nhật hóa đơn thành công'
    });
  } catch (error) {
    console.error('Error updating hoa don:', error);
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

// DELETE - Xóa hóa đơn
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Thiếu ID hóa đơn' },
        { status: 400 }
      );
    }

    const deletedHoaDon = await HoaDon.findByIdAndDelete(id);
    if (!deletedHoaDon) {
      return NextResponse.json(
        { message: 'Hóa đơn không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa hóa đơn thành công'
    });
  } catch (error) {
    console.error('Error deleting hoa don:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}