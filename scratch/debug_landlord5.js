const { MongoClient, ObjectId } = require('mongodb');

async function debugLandlord5() {
  const uri = "mongodb+srv://vtmcuber_db_user:cUdpxNnjEmZWn7by@demo.rrzfqlp.mongodb.net/demophongtro?appName=Demo";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    
    const userId = "6a04b0d987e01a9e2df12f46";
    const user = await db.collection('nguoidungs').findOne({ _id: new ObjectId(userId) });
    console.log('User:', user.ten, user.vaiTro);

    const buildings = await db.collection('toanhas').find({ chuSoHuu: new ObjectId(userId) }).toArray();
    console.log('Owned buildings:', buildings.length);
    buildings.forEach(b => console.log(` - ${b.tenToaNha} (${b._id})`));

    const buildingIds = buildings.map(b => b._id);
    const rooms = await db.collection('phongs').find({ toaNha: { $in: buildingIds } }).toArray();
    console.log('Rooms in those buildings:', rooms.length);

    const roomIds = rooms.map(r => r._id);
    const contracts = await db.collection('hopdongs').find({ phong: { $in: roomIds } }).toArray();
    console.log('Contracts in those buildings:', contracts.length);

    const invoices = await db.collection('hoadons').find({ phong: { $in: roomIds } }).toArray();
    console.log('Invoices in those buildings:', invoices.length);

  } finally {
    await client.close();
  }
}

debugLandlord5();
