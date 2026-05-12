# Hệ thống quản lý phòng trọ

Hệ thống quản lý phòng trọ hiện đại và toàn diện được xây dựng với Next.js 15, TypeScript và MongoDB.

## 🚀 Tính năng chính

### 📊 Dashboard
- Thống kê tổng quan về phòng, doanh thu, hóa đơn
- Biểu đồ doanh thu theo tháng
- Danh sách hóa đơn sắp đến hạn
- Danh sách sự cố cần xử lý
- Hợp đồng sắp hết hạn

### 🏢 Quản lý tòa nhà
- CRUD thông tin tòa nhà
- Upload ảnh tòa nhà
- Quản lý tiện ích chung
- Xem danh sách phòng theo tòa nhà

### 🏠 Quản lý phòng
- CRUD thông tin phòng
- Upload ảnh phòng
- Lọc phòng theo trạng thái
- Xem lịch sử thuê phòng
- Quản lý tiện nghi phòng

### 👥 Quản lý khách thuê
- CRUD thông tin khách thuê
- Upload ảnh CCCD
- Lịch sử thuê phòng
- Lịch sử thanh toán

### 📄 Quản lý hợp đồng
- Tạo hợp đồng mới
- Upload file hợp đồng PDF
- Gia hạn hợp đồng
- Chấm dứt hợp đồng
- In hợp đồng

### ⚡ Quản lý chỉ số điện nước
- Ghi chỉ số hàng tháng
- Upload ảnh chỉ số
- Tự động tính tiêu thụ
- Lịch sử chỉ số

### 🧾 Quản lý hóa đơn
- Tạo hóa đơn tự động theo chu kỳ
- Tính toán tự động: tiền điện, nước, dịch vụ
- Gửi thông báo hóa đơn
- In hóa đơn
- Xuất báo cáo Excel


### 🚨 Quản lý sự cố
- Khách thuê báo cáo sự cố
- Phân loại và ưu tiên sự cố
- Theo dõi tiến độ xử lý
- Upload ảnh sự cố

### 🔔 Thông báo
- Gửi thông báo đến khách thuê
- Thông báo theo phòng/tòa nhà
- Lịch sử thông báo

### ⚙️ Cài đặt hệ thống
- Quản lý người dùng
- Cấu hình hệ thống
- Sao lưu và khôi phục dữ liệu
- Cài đặt thông báo

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4.1
- **State Management**: React Hooks, Context API
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: lucide-react

### Backend
- **API**: Next.js API Routes (App Router)
- **Authentication**: NextAuth.js (JWT + Session)
- **Database**: MongoDB với Mongoose ODM

### Additional Libraries
- **Date handling**: date-fns
- **Charts**: recharts
- **Toast notifications**: sonner
- **File upload**: uploadthing hoặc cloudinary

## 📦 Cài đặt

### Yêu cầu hệ thống
- **Node.js**: Phiên bản 18 trở lên (Khuyến nghị: Node.js 20+)
- **npm**: Đi kèm với Node.js
- **MongoDB Atlas**: URI connection string (hoặc MongoDB local)
- **Git**: Để clone repository
- **Code Editor**: VS Code (khuyến nghị) hoặc bất kỳ editor nào

--
