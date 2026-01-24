# Cleanup Script - Hapus Folder dan File Lama

## ✅ STATUS: Sebagian Sudah Dibersihkan

### File/Folder yang SUDAH DIHAPUS:
- ✅ `src/components/layouts/admin/` (AdminSidebar.tsx, AdminTopbar.tsx)
- ✅ `src/components/layouts/kemahasiswaan/` (KemahasiswaanSidebar.tsx, KemahasiswaanTopbar.tsx)
- ✅ `src/components/layouts/ketua-ormawa/` (KetuaOrmawaSidebar.tsx, KetuaOrmawaTopbar.tsx)
- ✅ `src/components/layouts/peminjam/` (PeminjamSidebar.tsx)
- ✅ `src/components/layouts/sumberdaya/` (SumberdayaSidebar.tsx, SumberdayaTopbar.tsx)
- ✅ `src/components/layouts/Approval.tsx`
- ✅ `src/components/layouts/` (entire directory)

**Catatan**: File-file di atas sudah dihapus menggunakan `git rm` dan sudah di-stage untuk commit.

---

## ⚠️ File/Folder yang BELUM DIHAPUS (Opsional)

Folder berikut dapat dihapus setelah verifikasi bahwa tidak ada yang menggunakannya lagi:

### 1. Hapus Folder UI Lama

**Sebelum menghapus**, pastikan semua import sudah menggunakan `@/shared/components/ui/*`:

```bash
# Masuk ke direktori booking-web
cd "d:\KULIAH\Semester 6\PKL_3\booking-mainrepo\booking-web"

# Verifikasi tidak ada yang menggunakan src/components/ui
git grep "from '@/components/ui" src/
# Atau
git grep "from '../../components/ui" src/

# Jika output kosong, aman untuk dihapus
git rm -r src/components/ui

# Commit
git commit -m "chore: remove old src/components/ui folder"
```

### 2. Hapus Folder Lib Lama

**Sebelum menghapus**, pastikan semua import sudah menggunakan `@/shared/lib/*`:

```bash
# Verifikasi tidak ada yang menggunakan src/lib
git grep "from '@/lib" src/
# Atau
git grep "from '../../lib" src/

# Jika output kosong, aman untuk dihapus
git rm -r src/lib

# Commit
git commit -m "chore: remove old src/lib folder"
```

### 3. Hapus Folder Types Lama

**Sebelum menghapus**, pastikan semua import sudah menggunakan `@/shared/types/*`:

```bash
# Verifikasi tidak ada yang menggunakan src/types
git grep "from '@/types" src/
# Atau  
git grep "from '../../types" src/

# Jika output kosong, aman untuk dihapus
git rm -r src/types

# Commit
git commit -m "chore: remove old src/types folder"
```

---

## 🎯 Quick Cleanup (All at Once)

Jika sudah yakin semua sudah migrasi dengan benar, jalankan sekaligus:

```bash
cd "d:\KULIAH\Semester 6\PKL_3\booking-mainrepo\booking-web"

# Hapus semuanya sekaligus
git rm -r src/components/ui src/lib src/types

# Commit
git commit -m "chore: remove old ui, lib, and types folders after migration"
```

---

## Verifikasi Setelah Cleanup

Setelah menghapus folder lama, pastikan:

1. Build masih berhasil:
```bash
npm run build
```

2. Tidak ada error TypeScript:
```bash
npm run type-check
# atau
npx tsc --noEmit
```

3. Development server masih berjalan:
```bash
npm run dev
```

4. Test semua route dan fitur utama

## Rollback (jika ada masalah)

Jika ada masalah setelah cleanup, Anda bisa rollback dengan Git:

```bash
# Batalkan commit terakhir (tapi pertahankan perubahan)
git reset --soft HEAD~1

# Atau batalkan semua perubahan (restore file yang dihapus)
git reset --hard HEAD~1
```

---
**Catatan**: Jangan jalankan cleanup ini sampai Anda yakin semua fitur berjalan dengan baik!
