import mongoose from 'mongoose';

const MONGO_OPTIONS = {
  // How long (ms) the driver waits before timing out while selecting a server
  serverSelectionTimeoutMS: 10000,
  // How long (ms) a single socket may stay idle before being closed
  socketTimeoutMS: 45000,
  // How long (ms) to wait for a new connection to be established
  connectTimeoutMS: 10000,
  // Retry failed reads/writes automatically (Atlas supports this)
  retryWrites: true,
  retryReads: true,
  // Keep the connection alive at the TCP level
  family: 4, // Force IPv4 – avoids IPv6 ECONNRESET on some networks
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Reconnect automatically on unexpected disconnection
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected – retrying in 5 s…');
      setTimeout(() => connectDB(), 5000);
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('⚠️  Server will continue running but database features will not work.');
    console.error('💡 Please check your MONGODB_URI in backend/.env file.');
    console.log('🔄 Retrying connection in 5 s…');
    setTimeout(() => connectDB(), 5000);
  }
};

export default connectDB;
