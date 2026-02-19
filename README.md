# Take Home Test Adhivasindo - Frontend (Ionic + React)

## Tech Stack

- **Framework:** Ionic 7 + React 18
- **Language:** TypeScript
- **HTTP Client:** Axios
- **Drag & Drop:** @dnd-kit
- **Routing:** React Router

## Persyaratan

- Node.js >= 16
- npm >= 8
- Ionic CLI

## Instalasi

### 1. Clone repository
```bash
git clone https://github.com/AdytDwiPutra/lms-frontend.git
cd lms-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Install Ionic CLI
```bash
npm install -g @ionic/cli
```

### 4. Setup konfigurasi API

Edit file `src/config.ts`:
```ts
const CONFIG = {
  API_URL:     'http://YOUR_IP:8100/api',
  STORAGE_URL: 'http://YOUR_IP:8100/storage',
};
```

Ganti `YOUR_IP` dengan IP lokal yg dipakai.

### 5. Jalankan aplikasi
```bash
ionic serve --port=4200
```

Aplikasi berjalan di `http://localhost:4200`


## Demo Akun (Username dan Password)

- **Admin** — admin@lms.com / password
- **Pemateri** — pemateri@lms.com / password
- **Peserta** — peserta@lms.com / password

### Authentication
- Login & Register
- JWT Token Management
- Auto redirect jika belum login

### Dashboard
- Hero banner modul featured
- Grid modul kompetensi dengan list materi
- Leaderboard nilai peserta
- Jadwal pemateri
- Mini calendar
- Statistik (khusus admin)

### Modul
- List modul dengan search & infinite scroll
- Tambah, edit, hapus modul (admin & pemateri)
- Upload thumbnail
- Relasi dengan pemateri

### Materi
- List materi per modul
- Tambah, edit, hapus materi
- Drag & drop untuk reorder urutan
- Support tipe: materi, video, quiz
- Halaman detail materi

### Peserta & Pemateri
- List dengan search
- Tambah, edit, hapus user
- Khusus admin

### Kalender
- Kalender interaktif
- Tampilkan jadwal per hari
- Indikator hari yang ada jadwal

### Lainnya
- Responsive (web & mobile)
- Settings (coming soon)
- Group Chat (coming soon)
- Profile user

## Build Android (Opsional)
```bash
ionic build
npx cap add android
npx cap sync
npx cap open android
```
