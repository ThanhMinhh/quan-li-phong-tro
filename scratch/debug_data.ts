import mongoose from 'mongoose';
import ToaNha from './src/models/ToaNha';
import Phong from './src/models/Phong';
import HopDong from './src/models/HopDong';
import HoaDon from './src/models/HoaDon';
import NguoiDung from './src/models/NguoiDung';
import dbConnect from './src/lib/mongodb';

async function debugData() {
  await dbConnect();
  
  const user = await NguoiDung.findOne({ email: 'chunha5@gmail.com' });
  if (!user) {
    console.log('User not found');
    return;
  }
  
  console.log('User ID:', user._id);
  
  const buildings = await ToaNha.find({ chuSoHuu: user._id });
  console.log('Buildings owned:', buildings.length);
  buildings.forEach(b => console.log(` - ${b.tenToaNha} (${b._id})`));
  
  const buildingIds = buildings.map(b => b._id);
  const rooms = await Phong.find({ toaNha: { $in: buildingIds } });
  console.log('Rooms in buildings:', rooms.length);
  
  const roomIds = rooms.map(r => r._id);
  const contracts = await HopDong.find({ phong: { $in: roomIds } });
  console.log('Contracts in buildings:', contracts.length);
  
  const invoices = await HoaDon.find({ phong: { $in: roomIds } });
  console.log('Invoices in buildings:', invoices.length);
  
  process.exit(0);
}

debugData();
