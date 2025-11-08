// src/index.ts

import dotenv from 'dotenv';
dotenv.config();

import app from './server';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`🔐 Auth endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/signup-coiffeur`);
  console.log(`   POST http://localhost:${PORT}/api/auth/signup-client`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
});