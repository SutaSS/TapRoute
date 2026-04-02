# TapRoute - Platform Perencanaan Perjalanan Berbasis AI

TapRoute adalah platform inovatif yang menggabungkan kecerdasan buatan dengan ekosistem UMKM lokal untuk menghadirkan pengalaman perencanaan perjalanan yang personal, transparan, dan mendukung pengusaha lokal.

## Deskripsi Proyek

TapRoute menyediakan solusi terintegrasi bagi wisatawan untuk merencanakan, memesan, dan membayar paket wisata dengan harga yang jelas dan tetap. Platform ini mengandeng UMKM lokal sebagai mitra, memberikan mereka akses ke pasar yang lebih luas sambil memberikan pengalaman otentik kepada pengguna.

### Proposisi Nilai Utama

- Pembangkitan itinerary personal berbasis AI yang mempertimbangkan durasi, anggaran, dan preferensi
- Integrasi seamless antara perencanaan, pemesanan, dan perkulakan
- Transparansi harga penuh tanpa biaya tersembunyi
- Dukungan langsung untuk UMKM lokal melalui ekosistem platform

## Model Bisnis

### Untuk Pengguna
- Layanan sepenuhnya gratis (tidak ada biaya langganan atau biaya AI)
- Transparansi harga final di front-end sebelum pembayaran
- Kemudahan modifikasi itinerary sampai pembayaran dilakukan

### Untuk Mitra UMKM
- Komisi platform sebesar 7.5% - 10% dari setiap transaksi
- Eksposur pasar yang lebih luas melalui rekomendasi AI
- Sistem booking terintegrasi tanpa kompleksitas manajemen

## Arsitektur Teknologi

### Stack Utama
- Frontend: Next.js 13, React 18, TypeScript, TailwindCSS
- Backend: Next.js API Routes
- Database: PostgreSQL dengan Prisma ORM
- AI Integration: Groq SDK (LLaMA 3.3 70B) untuk pembangkitan itinerary
- Payment Gateway: Midtrans untuk pemrosesan pembayaran
- Authentication: Implementasi session-based dengan bcryptjs

### Struktur Database

#### Tabel Users
- Menyimpan informasi pengguna (nama, email, password ter-hash)
- Relasi dengan itineraries dan bookings

#### Tabel Itineraries
- Menyimpan detail perjalanan (destinasi, durasi, anggaran, preferensi)
- Menyimpan itinerary hasil AI dalam format JSON
- Status tracking: draft, planned, paid, completed
- Flag is_final untuk kontrol edit (tidak dapat diedit setelah pembayaran)

#### Tabel Bookings
- Mencatat setiap pemesanan dengan detail harga
- Penyimpanan kalkulasi komisi platform dan revenue UMKM
- Integrasi dengan Midtrans untuk snapshot token

#### Tabel ChatMessages
- Mendukung fitur chat dalam konteks itinerary
- Memungkinkan komunikasi user dengan sistem AI

## Fitur Utama

### 1. Dashboard (Halaman Utama)
- Menampilkan seluruh trip pengguna dengan status
- Filter otomatis: rencana, terbayar (history), selesai
- CTA untuk membuat trip baru
- Responsive design untuk desktop dan mobile

### 2. Pembuatan Trip
- Form input: destinasi, durasi, anggaran, preferensi
- Integrasi AI untuk menghasilkan itinerary terstruktur
- Loading state yang user-friendly
- Preview itinerary sebelum finalisasi

### 3. Editor Itinerary
- Keputusan edit terbatas hanya untuk status "draft" dan "planned"
- Tidak dapat diedit setelah pembayaran
- Modifikasi parsial menggunakan prompt khusus (tidak regenerasi penuh)
- Preservasi struktur itinerary yang stabil

### 4. Sistem Pemesanan dan Pembayaran
- Booking button aktif hanya setelah itinerary finalized
- Kalkulasi transparan:
  - Harga dasar aktivitas
  - Biaya platform (10%)
  - Revenue UMKM
- Integrasi Midtrans untuk pembayaran secure
- Update status itinerary menjadi "paid" setelah transaksi berhasil

### 5. Profil Pengguna
- Manajemen data pengguna
- Riwayat transaksi
- Preferensi perjalanan

## Alur Pengguna

### Alur Pembuatan Trip
```
Login -> Dashboard -> Buat Trip Baru -> Input Form -> Generate AI 
-> Preview Itinerary -> Edit (opsional) -> Finalisasi 
-> Booking -> Pembayaran (Midtrans) -> Konfirmasi
```

### Alur Trip Existing
- Jika belum dibayar: User dapat melihat, mengedit, atau membatalkan
- Jika sudah dibayar: Read-only (tidak dapat dimodifikasi)

## Struktur Proyek

```
taproute/
├── prisma/
│   ├── schema.prisma        # Definisi database schema
│   └── seed.ts              # Script seed data
├── public/                  # Asset statis
├── src/
│   ├── app/
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # Authentication endpoints
│   │   │   ├── booking/     # Booking logic
│   │   │   ├── edit/        # Edit itinerary
│   │   │   ├── generate/    # AI generation
│   │   │   ├── trips/       # Trip management
│   │   │   └── webhooks/    # Midtrans webhook
│   │   ├── dashboard/       # Dashboard page
│   │   ├── create/          # Create trip page
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup page
│   │   └── trip/            # Trip detail pages
│   ├── components/          # Reusable React components
│   ├── lib/
│   │   ├── db.ts           # Prisma client setup
│   │   ├── llm.ts          # LLM integration (Groq)
│   │   ├── midtrans.ts     # Payment gateway integration
│   │   └── prompts.ts      # LLM prompt templates
│   ├── types/              # TypeScript definitions
│   └── middleware.ts       # Next.js middleware
├── package.json            # Dependencies
├── tsconfig.json          # TypeScript config
├── next.config.js         # Next.js config
└── tailwind.config.ts     # Tailwind CSS config
```

## Instalasi dan Setup

### Prasyarat
- Node.js 18+
- PostgreSQL database
- API key dari Groq AI
- Midtrans merchant account (opsional, untuk pembayaran)

### Langkah-Langkah

1. Clone repository
```bash
git clone <repository-url>
cd taproute
```

2. Install dependencies
```bash
npm install
```

3. Konfigurasi environment
```bash
cp .env.example .env.local
```

Sesuaikan value:
- DATABASE_URL: PostgreSQL connection string
- DIRECT_URL: Direct database URL (untuk Prisma)
- GROQ_API_KEY: API key dari Groq
- MIDTRANS_SERVER_KEY: Midtrans server key (opsional)
- MIDTRANS_CLIENT_KEY: Midtrans client key (opsional)

4. Setup database
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Jalankan development server
```bash
npm run dev
```

6. Buka browser
```
http://localhost:3000
```

## Skrip NPM

- npm run dev: Jalankan development server (hot reload)
- npm run build: Build untuk production
- npm start: Jalankan production server
- npm run lint: Jalankan ESLint untuk code quality

## API Endpoints

### Authentication
- POST /api/auth/register: Registrasi pengguna baru
- POST /api/auth/login: Login dan mendapatkan session
- POST /api/auth/logout: Logout

### Trip Management
- GET /api/trips: Dapatkan seluruh trip pengguna
- GET /api/trips/[id]: Dapatkan detail trip
- POST /api/generate: Generate itinerary baru dengan AI
- PUT /api/edit: Edit itinerary existing

### Booking & Payment
- POST /api/booking: Buat booking baru
- POST /api/webhooks/midtrans: Webhook Midtrans untuk konfirmasi pembayaran

### User Profile
- GET /api/profile: Dapatkan profil pengguna
- PUT /api/profile: Update profil pengguna

## Prompts untuk AI

### Generate Itinerary
AI menggunakan prompt terstruktur untuk menghasilkan itinerary dalam format JSON dengan elemen:
- Day number dan aktivitas per hari
- Place name dan deskripsi
- Estimated price per aktivitas
- Category (destination atau umkm)
- Flag untuk booking availability dan status UMKM

### Edit Itinerary
Edit prompt memungkinkan modifikasi parsial berdasarkan user request tanpa perlu regenerasi keseluruhan itinerary.

## Logical Pricing

Sistem pricing dirancang untuk transparansi maksimal:

- Harga yang ditampilkan di UI adalah harga final yang akan dibayarkan user
- Semua kalkulasi pajak dan biaya dilakukan di server
- Tidak ada biaya tambahan di checkout
- Kalkulasi komisi platform:
```
Platform Fee = Harga Dasar x 10%
UMKM Revenue = Harga Dasar - Platform Fee
Final Price = Harga Dasar + Tax (jika ada)
```

## Deployment

### Vercel (Recommended)
1. Push code ke GitHub
2. Connect repository di Vercel dashboard
3. Set environment variables
4. Deploy secara otomatis

### Docker
```bash
docker build -t taproute .
docker run -p 3000:3000 taproute
```

## Implementasi untuk Hackathon

### Fokus Utama
- Satu alur lengkap yang berfungsi sempurna (buat -> generate -> edit -> booking)
- UI yang terlihat profesional dan responsif
- Demo yang bisa selesai < 2 menit
- Perlihatkan integrasi UMKM dan transparansi pricing

### Yang Tidak Diimplementasi
- Database UMKM lengkap (gunakan data simulasi/hardcoded)
- Sistem pembayaran real (mock saja)
- Chat system lengkap (minimal bahwa fitur tersedia)

## Kontribusi

Untuk development berkelanjutan, ikuti guidelines:
- Feature branches dengan naming convention: feature/nama-fitur
- Pull request dengan deskripsi lengkap
- Test sebelum merge
- Follow code style yang sudah ada

## Lisensi

Proprietary - Maxy Academy Training Project

Terakhir diperbarui: April 2026
Status Project: Hackathon Ready
