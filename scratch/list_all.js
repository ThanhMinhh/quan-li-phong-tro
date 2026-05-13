const { MongoClient } = require('mongodb');

async function listAll() {
  const uri = "mongodb+srv://vtmcuber_db_user:cUdpxNnjEmZWn7by@demo.rrzfqlp.mongodb.net/demophongtro?appName=Demo"; // Adjust if needed
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    
    console.log('--- USERS ---');
    const users = await db.collection('nguoidungs').find({}).toArray();
    users.forEach(u => console.log(`${u.ten} (${u.vaiTro}) - ${u.email} - ID: ${u._id}`));
    
    console.log('\n--- BUILDINGS ---');
    const buildings = await db.collection('toanhas').find({}).toArray();
    buildings.forEach(b => console.log(`${b.tenToaNha} - Owner: ${b.chuSoHuu}`));
    
    console.log('\n--- ROOMS ---');
    const roomsCount = await db.collection('phongs').countDocuments({});
    console.log('Total rooms:', roomsCount);
    
    console.log('\n--- CONTRACTS ---');
    const contractsCount = await db.collection('hopdongs').countDocuments({});
    console.log('Total contracts:', contractsCount);

  } finally {
    await client.close();
  }
}

listAll();
