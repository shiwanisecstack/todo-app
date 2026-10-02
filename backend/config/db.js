import mongoose from "mongoose";

// Enhanced database connection function
const connectDB = async () => {
  try {
    // Validate environment variable exists
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }
    // Connection options for better performance and reliability
    const connectionOptions = {
      // Connection pool settings
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4
      // Additional security and performance options
      retryWrites: true,
      w: "majority",

      // Connection timeout settings
      connectTimeoutMS: 10000,
    };
    const connection = await mongoose.connect(process.env.MONGO_URI, connectionOptions);

    console.log(`✅ MongoDB connected successfully!`);
    console.log(`   Host: ${connection.connection.host}`);
    console.log(`   Port: ${connection.connection.port}`);
    console.log(`   Database: ${connection.connection.name}`);
    console.log(`   Version: ${connection.connection.version}`);

    // Handle connection events for better monitoring
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected successfully');
    });
    // Handle process termination gracefully
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down MongoDB connection...');
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
    return connection;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    // Provide more detailed error information
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 Possible causes:');
      console.error('   - MongoDB server is not running');
      console.error('   - Network connectivity issues');
      console.error('   - Incorrect MONGO_URI format');
      console.error('   - Firewall blocking the connection');
    }  
    // Exit process with error code
    process.exit(1);
  }
};
// Optional: Connection status checker
export const checkConnectionStatus = () => {
  if (mongoose.connection.readyState === 1) {
    return {
      connected: true,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    };
  }
  return {
    connected: false,
    readyState: mongoose.connection.readyState
  };
};

// Optional: Reconnect function for handling disconnections
export const reconnectDB = async () => {
  try {
    console.log('🔄 Attempting to reconnect to MongoDB...');
    
    // Close existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }  
    // Reconnect
    const connection = await connectDB();
    console.log('✅ Successfully reconnected to MongoDB');
    
    return connection;
  } catch (error) {
    console.error('❌ Failed to reconnect to MongoDB:', error.message);
    throw error;
  }
};
// Optional: Connection statistics
export const getConnectionStats = () => {
  return {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    connectionCount: mongoose.connections.length,
    isMongooseConnected: mongoose.connection.readyState === 1
  };
};

// Export default function
export default connectDB;

// Optional: Graceful shutdown function
export const gracefulShutdown = async (message = 'Shutting down gracefully') => {
  console.log(`\n${message}`);  
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed successfully');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
};
