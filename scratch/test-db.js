const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://vtmcuber_db_user:cUdpxNnjEmZWn7by@demo.rrzfqlp.mongodb.net/demophongtro?appName=Demo";

console.log('Connecting to MongoDB...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Connection error details:');
    console.error('Name:', err.name);
    console.error('Message:', err.message);
    if (err.reason) console.error('Reason:', err.reason);
    process.exit(1);
  });
