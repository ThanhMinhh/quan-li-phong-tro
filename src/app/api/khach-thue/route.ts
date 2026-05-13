import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import KhachThue from '@/models/KhachThue';
import HopDong from '@/models/HopDong';
import Phong from '@/models/Phong';
import ToaNha from '@/models/ToaNha';
import { updateKhachThueStatus } from '@/lib/status-utils';
import { z } from 'zod';

const khachThueSchema = z.object({
  hoTen: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  soDienThoai: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ').optional(),
  cccd: z.string().regex(/^[0-9]{12}$/, 'CCCD phải có 12 chữ số'),
  ngaySinh: z.string().min(1, 'Ngày sinh là bắt buộc'),
  gioiTinh: z.enum(['nam', 'nu', 'khac']),
  queQuan: z.string().min(1, 'Quê quán là bắt buộc'),
  ngheNghiep: z.string().optional(),
  matKhau: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const trangThai = searchParams.get('trangThai') || '';

    const query: any = {};
    
    if (search) {
      query.$or = [
        { hoTen: { $regex: search, $options: 'i' } },
        { soDienThoai: { $regex: search, $options: 'i' } },
        { cccd: { $regex: search, $options: 'i' } },
        { queQuan: { $regex: search, $options: 'i' } },
        { ngheNghiep: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (trangThai) {
      query.trangThai = trangThai;
    }

    // Phân quyền dữ liệu
    const userRole = session.user.role;
    const userId = session.user.id;

    if (userRole !== 'admin') {
      // 1. Lấy danh sách tòa nhà thuộc sở hữu (đối với chuNha)
      let ownedBuildingIds: any[] = [];
      if (userRole === 'chuNha' || !userRole) {
        const ownedBuildings = await ToaNha.find({ chuSoHuu: userId }).select('_id');
        ownedBuildingIds = ownedBuildings.map(b => b._id);
      } else {
        // nhanVien tạm thời thấy tất cả
        const allBuildings = await ToaNha.find().select('_id');
        ownedBuildingIds = allBuildings.map(b => b._id);
      }

      // 2. Lấy danh sách phòng thuộc các tòa nhà đó
      const rooms = await Phong.find({ toaNha: { $in: ownedBuildingIds } }).select('_id');
      const roomIds = rooms.map(r => r._id);

      // 3. Lấy danh sách hợp đồng cho các phòng đó
      const contracts = await HopDong.find({ phong: { $in: roomIds } }).select('khachThueId');
      
      // 4. Trích xuất tất cả ID khách thuê từ các hợp đồng đó
      const tenantIdsSet = new Set<string>();
      contracts.forEach(contract => {
        if (Array.isArray(contract.khachThueId)) {
          contract.khachThueId.forEach(id => tenantIdsSet.add(id.toString()));
        } else if (contract.khachThueId) {
          tenantIdsSet.add(contract.khachThueId.toString());
        }
      });
      
      const tenantIds = Array.from(tenantIdsSet);
      query._id = { $in: tenantIds };
    }

    const khachThueList = await KhachThue.find(query)
      .select('+matKhau') // Include password field to check if exists
      .sort({ hoTen: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Cập nhật trạng thái khách thuê dựa trên hợp đồng
    await Promise.all(
      khachThueList.map(khach => updateKhachThueStatus(khach._id.toString()))
    );

    // Lấy lại dữ liệu với trạng thái đã cập nhật
    const updatedKhachThueList = await KhachThue.find(query)
      .select('+matKhau') // Include password field to check if exists
      .sort({ hoTen: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Thêm thông tin hợp đồng và phòng cho mỗi khách thuê
    const khachThueListWithContracts = await Promise.all(
      updatedKhachThueList.map(async (khachThue) => {
        const hopDong = await HopDong.findOne({
          khachThueId: khachThue._id,
          trangThai: 'hoatDong',
          $or: [
            {
              ngayBatDau: { $lte: new Date() },
              ngayKetThuc: { $gte: new Date() }
            }
          ]
        })
        .populate('phong', 'maPhong toaNha')
        .populate({
          path: 'phong',
          populate: {
            path: 'toaNha',
            select: 'tenToaNha'
          }
        });
        
        const hasPass = !!khachThue.matKhau;
        const khachThueObj = khachThue.toObject();
        
        return {
          ...khachThueObj,
          matKhau: hasPass ? '******' : undefined,
          hopDongHienTai: hopDong
        };
      })
    );

    const total = await KhachThue.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: khachThueListWithContracts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching khach thue:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = khachThueSchema.parse(body);

    await dbConnect();

    // Check if phone or CCCD already exists
    const existingKhachThue = await KhachThue.findOne({
      $or: [
        { soDienThoai: validatedData.soDienThoai },
        { cccd: validatedData.cccd }
      ]
    });

    if (existingKhachThue) {
      return NextResponse.json(
        { message: 'Số điện thoại hoặc CCCD đã được sử dụng' },
        { status: 400 }
      );
    }

    const newKhachThue = new KhachThue({
      ...validatedData,
      ngaySinh: new Date(validatedData.ngaySinh),
      trangThai: 'chuaThue', // Mặc định là chưa thuê, sẽ được cập nhật tự động
    });

    await newKhachThue.save();

    // Cập nhật trạng thái dựa trên hợp đồng
    await updateKhachThueStatus(newKhachThue._id.toString());

    return NextResponse.json({
      success: true,
      data: newKhachThue,
      message: 'Khách thuê đã được tạo thành công',
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating khach thue:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
