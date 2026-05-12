import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import NguoiDung from '@/models/NguoiDung';
import ToaNha from '@/models/ToaNha';
import Phong from '@/models/Phong';
import KhachThue from '@/models/KhachThue';
import HopDong from '@/models/HopDong';
import HoaDon from '@/models/HoaDon';
import SuCo from '@/models/SuCo';

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function daysAgo(n: number) { return new Date(Date.now() - n * 86400000); }

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    await Promise.all([
      NguoiDung.deleteMany({}), ToaNha.deleteMany({}), Phong.deleteMany({}),
      KhachThue.deleteMany({}), HopDong.deleteMany({}), HoaDon.deleteMany({}),
      SuCo.deleteMany({}),
    ]);

    // ── NGƯỜI DÙNG ──────────────────────────────────────
    const admin = await new NguoiDung({
      ten: 'Nguyễn Văn An', email: 'admin@gmail.com', matKhau: '123456',
      soDienThoai: '0326132124', vaiTro: 'admin', trangThai: 'hoatDong',
      name: 'Nguyễn Văn An', password: '123456', phone: '0326132124', role: 'admin', isActive: true,
    }).save();

    const chuNha1 = await new NguoiDung({
      ten: 'Trần Thị Hoa', email: 'chuNha1@example.com', matKhau: '123456',
      soDienThoai: '0912345678', vaiTro: 'chuNha', trangThai: 'hoatDong',
      name: 'Trần Thị Hoa', password: '123456', phone: '0912345678', role: 'chuNha', isActive: true,
    }).save();

    const chuNha2 = await new NguoiDung({
      ten: 'Phạm Quốc Hùng', email: 'chuNha2@example.com', matKhau: '123456',
      soDienThoai: '0978123456', vaiTro: 'chuNha', trangThai: 'hoatDong',
      name: 'Phạm Quốc Hùng', password: '123456', phone: '0978123456', role: 'chuNha', isActive: true,
    }).save();

    const nhanVien1 = await new NguoiDung({
      ten: 'Lê Văn Minh', email: 'nhanVien1@example.com', matKhau: '123456',
      soDienThoai: '0987654321', vaiTro: 'nhanVien', trangThai: 'hoatDong',
      name: 'Lê Văn Minh', password: '123456', phone: '0987654321', role: 'nhanVien', isActive: true,
    }).save();

    const nhanVien2 = await new NguoiDung({
      ten: 'Vũ Thị Lan', email: 'nhanVien2@example.com', matKhau: '123456',
      soDienThoai: '0966111222', vaiTro: 'nhanVien', trangThai: 'hoatDong',
      name: 'Vũ Thị Lan', password: '123456', phone: '0966111222', role: 'nhanVien', isActive: true,
    }).save();

    // ── 5 TÒA NHÀ HÀ NỘI ──────────────────────────────
    const toaNhaData = [
      { tenToaNha: 'Nhà trọ Đống Đa', diaChi: { soNha: '18', duong: 'Tây Sơn', phuong: 'Phường Thịnh Quang', quan: 'Đống Đa', thanhPho: 'Hà Nội' }, chuSoHuu: chuNha1._id, tongSoPhong: 12, tienNghiChung: ['wifi', 'camera', 'giuXe', 'baoVe'], moTa: 'Nhà trọ Đống Đa, gần Đại học Kinh tế Quốc dân, tiện ích đầy đủ.' },
      { tenToaNha: 'Nhà trọ Cầu Giấy', diaChi: { soNha: '52', duong: 'Xuân Thủy', phuong: 'Phường Dịch Vọng', quan: 'Cầu Giấy', thanhPho: 'Hà Nội' }, chuSoHuu: chuNha1._id, tongSoPhong: 15, tienNghiChung: ['wifi', 'camera', 'giuXe', 'thangMay'], moTa: 'Gần ĐHQGHN, khu vực sầm uất, an ninh tốt.' },
      { tenToaNha: 'Nhà trọ Hoàng Mai', diaChi: { soNha: '76', duong: 'Giải Phóng', phuong: 'Phường Tương Mai', quan: 'Hoàng Mai', thanhPho: 'Hà Nội' }, chuSoHuu: chuNha2._id, tongSoPhong: 10, tienNghiChung: ['wifi', 'camera', 'giuXe'], moTa: 'Nhà trọ yên tĩnh, phù hợp sinh viên và người đi làm.' },
      { tenToaNha: 'Nhà trọ Thanh Xuân', diaChi: { soNha: '34B', duong: 'Nguyễn Trãi', phuong: 'Phường Thanh Xuân Trung', quan: 'Thanh Xuân', thanhPho: 'Hà Nội' }, chuSoHuu: chuNha2._id, tongSoPhong: 13, tienNghiChung: ['wifi', 'camera', 'giuXe', 'baoVe', 'thangMay'], moTa: 'Trung tâm Thanh Xuân, gần BigC, Aeon Mall.' },
      { tenToaNha: 'Nhà trọ Hà Đông', diaChi: { soNha: '120', duong: 'Quang Trung', phuong: 'Phường La Khê', quan: 'Hà Đông', thanhPho: 'Hà Nội' }, chuSoHuu: chuNha1._id, tongSoPhong: 11, tienNghiChung: ['wifi', 'giuXe', 'sanPhoi'], moTa: 'Khu vực Hà Đông mới phát triển, giá hợp lý.' },
    ];
    const danhSachToaNha = await Promise.all(toaNhaData.map(d => new ToaNha(d).save()));

    // ── PHÒNG (10-15 phòng/tòa, đủ trạng thái) ─────────
    const tienNghiOptions = ['dieuhoa', 'nonglanh', 'tulanh', 'giuong', 'tuquanao', 'banlamviec', 'tivi', 'wifi', 'maygiat', 'bep'];
    const trangThaiPhong = ['trong', 'trong', 'dangThue', 'dangThue', 'dangThue', 'dangThue', 'baoTri'];
    const danhSachPhong: any[] = [];

    const soPhongMoiToa = [12, 15, 10, 13, 11];
    for (let t = 0; t < danhSachToaNha.length; t++) {
      const toa = danhSachToaNha[t];
      const prefix = ['DD', 'CG', 'HM', 'TX', 'HD'][t];
      const soPhong = soPhongMoiToa[t];
      for (let i = 1; i <= soPhong; i++) {
        const tang = Math.ceil(i / 4);
        const giaThue = randInt(28, 55) * 100000;
        const trangThai = i <= 2 ? 'trong' : i === 3 ? 'baoTri' : 'dangThue';
        const phong = await new Phong({
          maPhong: `${prefix}${String(i).padStart(3, '0')}`,
          toaNha: toa._id, tang, dienTich: randInt(18, 35),
          giaThue, tienCoc: giaThue * 2,
          tienNghi: tienNghiOptions.slice(0, randInt(4, 7)),
          trangThai, soNguoiToiDa: randInt(1, 3),
          moTa: `Phòng tầng ${tang}, đầy đủ nội thất cơ bản.`,
        }).save();
        danhSachPhong.push(phong);
      }
    }

    // Phòng đang thuê
    const phongDangThue = danhSachPhong.filter(p => p.trangThai === 'dangThue');

    // ── KHÁCH THUÊ ──────────────────────────────────────
    // ── KHÁCH THUÊ ──────────────────────────────────────
    const surnames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
    const midNam = ['Văn', 'Hữu', 'Minh', 'Đức', 'Quốc', 'Gia', 'Anh', 'Thế', 'Tùng', 'Thanh', 'Quang', 'Hùng'];
    const midNu = ['Thị', 'Ngọc', 'Thu', 'Mai', 'Phương', 'Diệu', 'Quỳnh', 'Tuyết', 'Hồng', 'Mỹ', 'Kim', 'Bích'];
    const namesNam = ['An', 'Bình', 'Cường', 'Dũng', 'Hải', 'Hùng', 'Huy', 'Khánh', 'Khoa', 'Kiệt', 'Long', 'Minh', 'Nam', 'Phúc', 'Quân', 'Sơn', 'Tùng', 'Tuấn', 'Việt', 'Anh', 'Bảo', 'Hoàng', 'Thắng', 'Thịnh'];
    const namesNu = ['Anh', 'Bích', 'Chi', 'Dung', 'Đào', 'Giang', 'Hà', 'Hạnh', 'Hoa', 'Huệ', 'Lan', 'Liên', 'Linh', 'Mai', 'Nga', 'Nhi', 'Oanh', 'Phương', 'Quỳnh', 'Tâm', 'Thảo', 'Thủy', 'Trang', 'Vy', 'Yến', 'Trâm'];

    const queQuan = ['Hà Nội', 'Nam Định', 'Thái Bình', 'Hà Nam', 'Ninh Bình', 'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Hải Phòng', 'Hải Dương', 'Hưng Yên', 'Bắc Ninh', 'Vĩnh Phúc', 'Phú Thọ', 'Bắc Giang', 'Quảng Ninh', 'Lạng Sơn', 'Thái Nguyên', 'Tuyên Quang', 'Yên Bái'];
    const ngheNghiep = ['Sinh viên', 'Nhân viên văn phòng', 'Kỹ sư', 'Giáo viên', 'Kế toán', 'Lập trình viên', 'Nhân viên kinh doanh', 'Y tá', 'Nhân viên ngân hàng', 'Thiết kế đồ họa', 'Kiến trúc sư', 'Bác sĩ', 'Dược sĩ', 'Công nhân', 'Tài xế', 'Freelancer'];

    const usedNames = new Set<string>();
    const generateUniqueName = (isFemale: boolean) => {
      let fullName = '';
      let attempts = 0;
      do {
        const ho = rand(surnames);
        const dem = isFemale ? rand(midNu) : rand(midNam);
        const ten = isFemale ? rand(namesNu) : rand(namesNam);
        fullName = `${ho} ${dem} ${ten}`;
        attempts++;
      } while (usedNames.has(fullName) && attempts < 100);
      usedNames.add(fullName);
      return fullName;
    };

    const danhSachKhach: any[] = [];
    for (let i = 0; i < 60; i++) {
      const giNu = i % 2 === 0;
      const hoTen = generateUniqueName(giNu);
      const k = await new KhachThue({
        hoTen,
        soDienThoai: `0${randInt(32, 99)}${randInt(1000000, 9999999)}`,
        email: `user${i + 100}${randInt(10, 99)}@gmail.com`,
        cccd: `${randInt(100, 999)}${randInt(100, 999)}${randInt(100, 999)}${randInt(100, 999)}`,
        ngaySinh: new Date(1990 + randInt(0, 15), randInt(0, 11), randInt(1, 28)),
        gioiTinh: giNu ? 'nu' : 'nam',
        queQuan: rand(queQuan),
        ngheNghiep: rand(ngheNghiep),
        trangThai: i < phongDangThue.length ? 'dangThue' : 'chuaThue',
      }).save();
      danhSachKhach.push(k);
    }

    // ── HỢP ĐỒNG (~55 bản ghi) ─────────────────────────
    const danhSachHopDong: any[] = [];
    const phuongThucTT = ['tienMat', 'chuyenKhoan', 'viDienTu'] as const;
    let hdIndex = 0;
    for (const phong of phongDangThue) {
      const khach = danhSachKhach[hdIndex % danhSachKhach.length];
      const startMonth = randInt(1, 8);
      const ngayBatDau = new Date(2024, startMonth - 1, 1);
      const ngayKetThuc = new Date(2025, startMonth + 5, 1);
      const giaDien = 3500, giaNuoc = 15000;
      const giaThue = phong.giaThue;
      const hd = await new HopDong({
        maHopDong: `HD2024${String(hdIndex + 1).padStart(4, '0')}`,
        phong: phong._id, khachThueId: [khach._id], nguoiDaiDien: khach._id,
        ngayBatDau, ngayKetThuc, giaThue,
        tienCoc: giaThue * 2, chuKyThanhToan: 'thang', ngayThanhToan: 5,
        dieuKhoan: 'Thanh toán trước ngày 5 hàng tháng. Không hút thuốc, không nuôi thú cưng. Giữ yên tĩnh sau 22h.',
        giaDien, giaNuoc,
        chiSoDienBanDau: randInt(500, 2000),
        chiSoNuocBanDau: randInt(10, 100),
        phiDichVu: [{ ten: 'Phí wifi', gia: 100000 }, { ten: 'Phí vệ sinh', gia: 50000 }],
        trangThai: 'hoatDong',
      }).save();
      danhSachHopDong.push({ hd, khach, phong, giaDien, giaNuoc });
      hdIndex++;
    }
    // Thêm hợp đồng đã hết hạn/hủy để đủ 55+
    for (let i = 0; i < 10; i++) {
      const phong = danhSachPhong[i % danhSachPhong.length];
      const khach = danhSachKhach[(hdIndex + i) % danhSachKhach.length];
      const ngayBatDau = new Date(2023, i % 12, 1);
      const ngayKetThuc = new Date(2024, (i + 6) % 12, 1);
      const giaThue = phong.giaThue;
      await new HopDong({
        maHopDong: `HD2023${String(i + 1).padStart(4, '0')}`,
        phong: phong._id, khachThueId: [khach._id], nguoiDaiDien: khach._id,
        ngayBatDau, ngayKetThuc, giaThue,
        tienCoc: giaThue * 2, chuKyThanhToan: 'thang', ngayThanhToan: 5,
        dieuKhoan: 'Thanh toán trước ngày 5 hàng tháng.',
        giaDien: 3500, giaNuoc: 15000,
        chiSoDienBanDau: randInt(100, 1000), chiSoNuocBanDau: randInt(5, 50),
        phiDichVu: [{ ten: 'Phí wifi', gia: 100000 }],
        trangThai: i % 3 === 0 ? 'daHuy' : 'hetHan',
      }).save();
    }

    // ── HÓA ĐƠN (~60 bản ghi) ─────────────────────────
    const danhSachHoaDon: any[] = [];
    const trangThaiHoaDon = ['daThanhToan', 'daThanhToan', 'chuaThanhToan', 'quaHan'] as const;

    for (let i = 0; i < danhSachHopDong.length; i++) {
      const { hd, khach, phong, giaDien, giaNuoc } = danhSachHopDong[i];
      // Tạo 2 hóa đơn (2 tháng) cho mỗi hợp đồng
      for (let m = 0; m < 2; m++) {
        const thang = m === 0 ? 4 : 5;
        const nam = 2025;
        const dienBanDau = randInt(500, 3000);
        const dienCuoiKy = dienBanDau + randInt(60, 120);
        const nuocBanDau = randInt(10, 100);
        const nuocCuoiKy = nuocBanDau + randInt(5, 15);
        const soDien = dienCuoiKy - dienBanDau;
        const soNuoc = nuocCuoiKy - nuocBanDau;
        const tienPhong = phong.giaThue;
        const tienDien = soDien * giaDien;
        const tienNuoc = soNuoc * giaNuoc;
        const phiDV = 150000;
        const tongTien = tienPhong + tienDien + tienNuoc + phiDV;
        const ttStatus = trangThaiHoaDon[(i + m) % trangThaiHoaDon.length];
        const payload: any = {
          maHoaDon: `HDON-${String(i * 2 + m + 1).padStart(4, '0')}`,
          hopDong: hd._id, phong: phong._id, khachThue: khach._id,
          thang, nam,
          tienPhong, tienDien, soDien, chiSoDienBanDau: dienBanDau, chiSoDienCuoiKy: dienCuoiKy,
          tienNuoc, soNuoc, chiSoNuocBanDau: nuocBanDau, chiSoNuocCuoiKy: nuocCuoiKy,
          phiDichVu: [{ ten: 'Phí wifi', gia: 100000 }, { ten: 'Phí vệ sinh', gia: 50000 }],
          tongTien,
          trangThai: ttStatus,
          hanThanhToan: new Date(nam, thang - 1, 10),
        };
        if (ttStatus === 'daThanhToan') {
          payload.ngayThanhToan = daysAgo(randInt(1, 30));
          payload.phuongThucThanhToan = 'chuyenKhoan';
        }
        const hoaDon = await new HoaDon(payload).save();
        danhSachHoaDon.push({ hoaDon, khach });
      }
    }



    // ── SỰ CỐ (~60 bản ghi) ─────────────────────────────
    const loaiSuCo = ['dienNuoc', 'noiThat', 'vesinh', 'anNinh', 'khac'] as const;
    const mucDoUuTien = ['thap', 'trungBinh', 'cao', 'khancap'] as const;
    const trangThaiSuCo = ['moi', 'dangXuLy', 'daXong', 'daXong', 'daHuy'] as const;
    const tieuDeSuCo = [
      'Điều hòa không lạnh', 'Vòi nước rò rỉ', 'Đường điện bị chập', 'Tắc cống nhà vệ sinh',
      'Cửa phòng bị hỏng khóa', 'Bóng đèn hành lang hỏng', 'Máy bơm nước yếu', 'Trần nhà bị thấm dột',
      'Ổ điện bị cháy', 'Quạt thông gió hỏng', 'Camera an ninh không hoạt động', 'Chuột phá hoại đồ dùng',
    ];

    const nhanVienList = [nhanVien1._id, nhanVien2._id];
    for (let i = 0; i < 60; i++) {
      const phong = rand(phongDangThue);
      const khach = danhSachKhach[i % danhSachKhach.length];
      const trangThai = trangThaiSuCo[i % trangThaiSuCo.length];
      const ngayBaoCao = daysAgo(randInt(1, 90));
      const suCoPayload: any = {
        phong: phong._id, khachThue: khach._id,
        tieuDe: tieuDeSuCo[i % tieuDeSuCo.length],
        moTa: `Chi tiết sự cố: ${tieuDeSuCo[i % tieuDeSuCo.length].toLowerCase()}. Cần xử lý sớm để đảm bảo sinh hoạt bình thường.`,
        loaiSuCo: loaiSuCo[i % loaiSuCo.length],
        mucDoUuTien: mucDoUuTien[i % mucDoUuTien.length],
        trangThai, ngayBaoCao,
      };
      if (trangThai === 'dangXuLy' || trangThai === 'daXong') {
        suCoPayload.nguoiXuLy = nhanVienList[i % 2];
        suCoPayload.ghiChuXuLy = 'Đã tiếp nhận và đang tiến hành xử lý theo quy trình.';
        suCoPayload.ngayXuLy = daysAgo(randInt(1, 30));
      }
      if (trangThai === 'daXong') {
        suCoPayload.ngayHoanThanh = daysAgo(randInt(0, 10));
      }
      await new SuCo(suCoPayload).save();
    }

    // Đếm kết quả
    const [cntHD, cntHDon, cntSC] = await Promise.all([
      HopDong.countDocuments(), HoaDon.countDocuments(),
      SuCo.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Seed data lớn đã được tạo thành công!',
      data: {
        nguoiDung: 5,
        toaNha: danhSachToaNha.length,
        phong: danhSachPhong.length,
        khachThue: danhSachKhach.length,
        hopDong: cntHD,
        hoaDon: cntHDon,
        suCo: cntSC,
        taiKhoan: {
          admin: 'admin@example.com / 123456',
          chuNha1: 'chuNha1@example.com / 123456',
          chuNha2: 'chuNha2@example.com / 123456',
          nhanVien1: 'nhanVien1@example.com / 123456',
          nhanVien2: 'nhanVien2@example.com / 123456',
        },
      },
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}
