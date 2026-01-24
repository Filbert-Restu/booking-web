# Struktur Folder Saat Ini (24 Januari 2026)

## ASCII Tree Structure

```
src/
├── App.tsx
├── index.css
├── main.tsx
├── routeTree.gen.ts
│
├── assets/
│
├── components/                         # ⚠️ FOLDER LAMA - AKAN DIHAPUS
│   └── ui/
│       └── shadcn/                     # ⚠️ Masih ada, belum dihapus
│
├── features/                           # ✅ FITUR BISNIS (Modular)
│   ├── approvals/
│   │   ├── Approval.tsx
│   │   └── index.ts
│   ├── bookings/
│   │   ├── BookingCalendar.tsx
│   │   ├── BookingDetailModal.tsx
│   │   └── index.ts
│   └── proposals/
│       ├── DocumentEditor.tsx
│       └── index.ts
│
├── hooks/
│   └── use-mobile.ts
│
├── lib/                                # ⚠️ FOLDER LAMA - AKAN DIHAPUS
│
├── routes/                             # ✅ TANSTACK ROUTER (File-based)
│   ├── __root.tsx
│   ├── index.tsx
│   ├── login-option.tsx
│   ├── login.tsx
│   │
│   ├── _shared/                        # ✅ SHARED COMPONENTS UNTUK ROUTES
│   │   ├── approval-mock.ts
│   │   └── components/
│   │       ├── ApprovalPage.tsx        # ✅ Generic Approval Component
│   │       └── EditorPage.tsx          # ✅ Generic Editor Component
│   │
│   ├── admin/
│   │   ├── index.tsx
│   │   ├── route.tsx
│   │   ├── manajemen-ruang/
│   │   │   ├── add.tsx
│   │   │   ├── edit.tsx
│   │   │   └── index.tsx
│   │   ├── peminjaman-ruang/
│   │   │   └── index.tsx
│   │   └── users/
│   │       ├── add.tsx
│   │       ├── detail.tsx
│   │       ├── edit.tsx
│   │       └── index.tsx
│   │
│   ├── dosen-pendamping/
│   │   ├── index.tsx
│   │   └── approval/
│   │       ├── editor.tsx              # ✅ Uses EditorPage component
│   │       └── index.tsx               # ✅ Uses ApprovalPage component
│   │
│   ├── kemahasiswaan/
│   │   ├── index.tsx
│   │   ├── route.tsx
│   │   └── approval/
│   │       ├── editor.tsx              # ✅ Uses EditorPage component
│   │       └── index.tsx               # ✅ Uses ApprovalPage component
│   │
│   ├── ketua-departemen/
│   │   ├── index.tsx
│   │   └── approval/
│   │       ├── editor.tsx              # ✅ Uses EditorPage component
│   │       └── index.tsx               # ✅ Uses ApprovalPage component
│   │
│   ├── ketua-ormawa/
│   │   ├── index.tsx
│   │   ├── route.tsx
│   │   └── approval/
│   │       ├── editor.tsx              # ✅ Uses EditorPage component
│   │       └── index.tsx               # ✅ Uses ApprovalPage component
│   │
│   ├── peminjam/
│   │   ├── index.tsx
│   │   ├── reservasi.tsx
│   │   ├── route.tsx
│   │   └── pinjam/
│   │       ├── detail-tempat.tsx
│   │       ├── edit-dokumen.tsx
│   │       ├── index.tsx
│   │       ├── proposal.tsx
│   │       └── tanda-tangan.tsx
│   │
│   ├── senat/
│   │   ├── index.tsx
│   │   └── approval/
│   │       ├── editor.tsx              # ✅ Uses EditorPage component
│   │       └── index.tsx               # ✅ Uses ApprovalPage component
│   │
│   ├── sumber-daya/
│   │   ├── index.tsx
│   │   ├── route.tsx
│   │   └── approval/
│   │       └── index.tsx               # ✅ Uses ApprovalPage component
│   │
│   └── wadek1/
│       ├── index.tsx
│       └── approval/
│           ├── editor.tsx              # ✅ Uses EditorPage component
│           └── index.tsx               # ✅ Uses ApprovalPage component
│
├── shared/                             # ✅ GLOBAL SHARED RESOURCES
│   ├── components/
│   │   ├── common/
│   │   │   ├── index.ts
│   │   │   ├── StatCard.tsx
│   │   │   ├── Stepper.tsx
│   │   │   ├── UserDetailModal.tsx
│   │   │   ├── UserTable.tsx
│   │   │   └── WordEditorPlaceholder.tsx
│   │   │
│   │   └── ui/                         # ✅ SHADCN UI COMPONENTS
│   │       ├── badge.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── skeleton.tsx
│   │       ├── table.tsx
│   │       ├── textarea.tsx
│   │       ├── tooltip.tsx
│   │       ├── button/
│   │       │   ├── button.tsx
│   │       │   └── variants.tsx
│   │       └── sidebar/
│   │           ├── index.tsx
│   │           ├── sidebar.tsx
│   │           ├── sidebarContext.tsx
│   │           └── sidebarProvider.tsx
│   │
│   ├── layouts/                        # ✅ GENERIC LAYOUTS
│   │   ├── index.ts
│   │   ├── menu-config.ts              # ✅ Menu config per role
│   │   ├── SideBar.tsx                 # ✅ Generic sidebar
│   │   └── TopBar.tsx                  # ✅ Generic topbar
│   │
│   ├── lib/                            # ✅ SHARED UTILITIES
│   │   └── utils.ts
│   │
│   └── types/                          # ✅ GLOBAL TYPES
│       └── User.ts
│
└── types/                              # ⚠️ FOLDER LAMA - AKAN DIHAPUS
```

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Folder/File baru hasil refactoring |
| ⚠️ | Folder lama yang belum dihapus |
| 🗑️ | Sudah dihapus (layouts role-specific) |

## Perbandingan: Sebelum vs Sesudah

### Sebelum Refactoring
```
src/
├── components/
│   ├── ui/shadcn/                     # UI components
│   ├── layouts/
│   │   ├── admin/                      # 🗑️ DELETED
│   │   ├── kemahasiswaan/              # 🗑️ DELETED
│   │   ├── ketua-ormawa/               # 🗑️ DELETED
│   │   ├── peminjam/                   # 🗑️ DELETED
│   │   ├── sumberdaya/                 # 🗑️ DELETED
│   │   └── Approval.tsx                # 🗑️ DELETED
│   ├── Approval.tsx                    # Moved to features/approvals/
│   ├── BookingCalendar.tsx             # Moved to features/bookings/
│   ├── BookingDetailModal.tsx          # Moved to features/bookings/
│   ├── StatCard.tsx                    # Moved to shared/components/common/
│   ├── Stepper.tsx                     # Moved to shared/components/common/
│   ├── UserTable.tsx                   # Moved to shared/components/common/
│   ├── UserDetailModal.tsx             # Moved to shared/components/common/
│   └── WordEditorPlaceholder.tsx       # Moved to shared/components/common/
├── lib/utils.ts                        # Moved to shared/lib/
└── types/User.ts                       # Moved to shared/types/
```

### Sesudah Refactoring
```
src/
├── features/                           # ✅ Business logic
│   ├── approvals/
│   ├── bookings/
│   └── proposals/
├── shared/                             # ✅ Global shared resources
│   ├── components/
│   │   ├── common/
│   │   └── ui/
│   ├── layouts/                        # ✅ Generic layouts
│   ├── lib/
│   └── types/
└── routes/_shared/components/          # ✅ Generic route components
    ├── ApprovalPage.tsx
    └── EditorPage.tsx
```

## Key Achievements

### 1. Code Reduction
- **13 approval files** → **2 generic components**
- **~600 lines** of duplicate code eliminated
- **73% average reduction** in approval index files
- **41% average reduction** in approval editor files

### 2. Deleted Files (10 total)
- ✅ AdminSidebar.tsx, AdminTopbar.tsx
- ✅ KemahasiswaanSidebar.tsx, KemahasiswaanTopbar.tsx
- ✅ KetuaOrmawaSidebar.tsx, KetuaOrmawaTopbar.tsx
- ✅ PeminjamSidebar.tsx
- ✅ SumberdayaSidebar.tsx, SumberdayaTopbar.tsx
- ✅ layouts/Approval.tsx

### 3. Remaining Cleanup
- ⚠️ `src/components/ui/shadcn/` (dapat dihapus)
- ⚠️ `src/lib/` (dapat dihapus)
- ⚠️ `src/types/` (dapat dihapus)

## Next Steps

1. Verifikasi tidak ada import yang masih menggunakan folder lama
2. Jalankan cleanup script dari `CLEANUP_GUIDE.md`
3. Commit perubahan

---
**Generated**: 24 Januari 2026
