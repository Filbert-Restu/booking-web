// src/utils/documentUtils.ts
import type { Document } from '@/types/document';

export const documentHelpers = {
  // --- 1. Helpers Umum ---
  getRoomInfo: (doc: Document) => {
    const { room_code, room_id } = doc.content || {};
    if (room_id) {
      return `Ruang ${room_code || room_id}`;
    }
    return '-';
  },

  getBookingDate: (doc: Document) => {
    if (doc.content?.booking_date) {
      // Gunakan string jika content.booking_date bertipe string/number
      return new Date(String(doc.content.booking_date)).toLocaleDateString(
        'id-ID',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        },
      );
    }
    return '-';
  },

  getCurrentHolder: (doc: Document) => {
    if (doc.status === 'IN_PROGRESS' && doc.currentHolder) {
      return doc.currentHolder.role?.name || doc.currentHolder.name;
    }
    return '-';
  },

  getEventName: (doc: Document) => {
    // Ambil dari purpose (field saat reservasi) atau event_name sebagai fallback
    const eventName = doc.content?.purpose || doc.content?.event_name;
    return eventName ? String(eventName) : 'Tidak ada nama';
  },

  // --- 2. Helpers Ketua Pelaksana (Pengganti fungsi lama Anda) ---
  getKetuaPelaksanaNama: (doc: Document) => {
    return doc.content?.ketua_pelaksana_nama
      ? String(doc.content.ketua_pelaksana_nama)
      : '-';
  },

  getKetuaPelaksanaNim: (doc: Document) => {
    return doc.content?.ketua_pelaksana_nim
      ? String(doc.content.ketua_pelaksana_nim)
      : '-';
  },

  getKetuaPelaksanaHp: (doc: Document) => {
    return doc.content?.ketua_pelaksana_hp
      ? String(doc.content.ketua_pelaksana_hp)
      : '-';
  },
};
