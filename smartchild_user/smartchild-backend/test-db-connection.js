import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const testConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    
    console.log("Database connection successful!");
    console.log("Host:", process.env.DB_HOST);
    console.log("Database:", process.env.DB_NAME);
    console.log("User:", process.env.DB_USER);
    
    await connection.end();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    console.log("Environment variables:");
    console.log("DB_HOST:", process.env.DB_HOST);
    console.log("DB_USER:", process.env.DB_USER);
    console.log("DB_NAME:", process.env.DB_NAME);
    console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "*** (set)" : "undefined");
  }
};

testConnection();
