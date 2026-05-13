import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Phong from '@/models/Phong';
import HoaDon from '@/models/HoaDon';
import SuCo from '@/models/SuCo';
import HopDong from '@/models/HopDong';
import ToaNha from '@/models/ToaNha';

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

    const userId = session.user.id;
    const userRole = session.user.role;

    let roomQuery: any = {};
    let buildingIds: any[] = [];

    if (userRole === 'chuNha') {
      const ownedBuildings = await ToaNha.find({ chuSoHuu: userId }).select('_id');
      buildingIds = ownedBuildings.map(b => b._id);
      roomQuery.toaNha = { $in: buildingIds };
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get room stats
    const totalPhong = await Phong.countDocuments(roomQuery);
    const phongTrong = await Phong.countDocuments({ ...roomQuery, trangThai: 'trong' });
    const phongDangThue = await Phong.countDocuments({ ...roomQuery, trangThai: 'dangThue' });
    const phongBaoTri = await Phong.countDocuments({ ...roomQuery, trangThai: 'baoTri' });

    // Get room IDs for further filtering
    const ownedRooms = await Phong.find(roomQuery).select('_id');
    const roomIds = ownedRooms.map(r => r._id);

    // Get revenue stats
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    const doanhThuThang = await HoaDon.aggregate([
      {
        $match: {
          ngayThanhToan: {
            $gte: startOfMonth,
            $lte: endOfMonth
          },
          trangThai: 'daThanhToan',
          ...(userRole === 'chuNha' ? { phong: { $in: roomIds } } : {})
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$tongTien' }
        }
      }
    ]);

    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);
    
    const doanhThuNam = await HoaDon.aggregate([
      {
        $match: {
          ngayThanhToan: {
            $gte: startOfYear,
            $lte: endOfYear
          },
          trangThai: 'daThanhToan',
          ...(userRole === 'chuNha' ? { phong: { $in: roomIds } } : {})
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$tongTien' }
        }
      }
    ]);

    // Get pending invoices (due in next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const hoaDonSapDenHan = await HoaDon.countDocuments({
      hanThanhToan: { $lte: nextWeek },
      trangThai: 'chuaThanhToan',
      ...(userRole === 'chuNha' ? { phong: { $in: roomIds } } : {})
    });

    // Get pending issues
    const suCoCanXuLy = await SuCo.countDocuments({
      trangThai: { $in: ['moi', 'dangXuLy'] },
      ...(userRole === 'chuNha' ? { phong: { $in: roomIds } } : {})
    });

    // Get contracts expiring in next 30 days
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    
    const hopDongSapHetHan = await HopDong.countDocuments({
      ngayKetThuc: { $lte: nextMonth },
      trangThai: 'hoatDong',
      ...(userRole === 'chuNha' ? { phong: { $in: roomIds } } : {})
    });

    // Get revenue chart data (last 6 months)
    const revenueChartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const monthLabel = d.toLocaleDateString('vi-VN', { month: 'short' });

      const monthRevenue = await HoaDon.aggregate([
        {
          $match: {
            ngayThanhToan: { $gte: start, $lte: end },
            trangThai: 'daThanhToan',
            ...(userRole === 'chuNha' ? { phong: { $in: roomIds } } : {})
          }
        },
        { $group: { _id: null, total: { $sum: '$tongTien' } } }
      ]);

      revenueChartData.push({
        name: monthLabel,
        total: monthRevenue[0]?.total || 0,
      });
    }

    const stats = {
      tongSoPhong: totalPhong,
      phongTrong,
      phongDangThue,
      phongBaoTri,
      doanhThuThang: doanhThuThang[0]?.total || 0,
      doanhThuNam: doanhThuNam[0]?.total || 0,
      hoaDonSapDenHan,
      suCoCanXuLy,
      hopDongSapHetHan,
      revenueChartData,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
