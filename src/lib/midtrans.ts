// ============================================================
// TapRoute — Midtrans Snap Client
// ============================================================
// Inisialisasi Midtrans Snap untuk payment gateway
// Mode: Sandbox (development)
//
// Environment variables yang dibutuhkan di .env:
//   MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
//   MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
//
// Install: npm install midtrans-client

import midtransClient from 'midtrans-client';

// ------------------------------------------------------------
// Midtrans Snap Instance (Sandbox)
// ------------------------------------------------------------
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

export default snap;
