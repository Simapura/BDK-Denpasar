import React from 'react';
import { Users, CalendarClock, ArrowDownLeft, Wallet } from 'lucide-react';
import {
  Anggota,
  JadwalPiodalan,
  PinjamanDana,
  TransaksiKeuangan,
} from '../types/pura';
import { daysUntil, formatRupiah, formatTanggalIndo } from '../utils/format';

interface StatCardsProps {
  anggota: Anggota[];
  piodalan: JadwalPiodalan[];
  transaksi: TransaksiKeuangan[];
  pinjamanDana: PinjamanDana[];
  onNavigate?: (menu: 'anggota' | 'piodalan' | 'keuangan' | 'perlengkapan' | 'pinjaman') => void;
}

export function StatCards({
  anggota,
  piodalan,
  transaksi,
  pinjamanDana,
  onNavigate,
}: StatCardsProps) {
  const totalAnggota = anggota.length;
  const aktifCount = anggota.filter((a) => a.status === 'Aktif').length;
  const cutiCount = anggota.filter((a) => a.status === 'Cuti').length;

  const upcomingPiodalan = [...piodalan]
    .filter((p) => p.status !== 'Selesai')
    .sort((a, b) => a.tanggalMasehi.localeCompare(b.tanggalMasehi))[0];

  const totalMasuk = transaksi
    .filter((t) => t.jenis === 'Pemasukan')
    .reduce((acc, t) => acc + t.nominal, 0);

  const totalKeluar = transaksi
    .filter((t) => t.jenis === 'Pengeluaran')
    .reduce((acc, t) => acc + t.nominal, 0);

  const pinjamanBerjalan = pinjamanDana
    .filter((p) => p.status === 'Berjalan')
    .reduce((acc, p) => acc + Math.max(0, p.nominal - p.sudahDikembalikan), 0);

  const saldoKasPura = totalMasuk - totalKeluar - pinjamanBerjalan;
  const hariTersisa = upcomingPiodalan ? daysUntil(upcomingPiodalan.tanggalMasehi) : null;

  return (
    <section
      aria-label="Ringkasan Statistik Pura"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {/* Card 1: Saldo Kas Pura (Pemasukan - Pengeluaran - Pinjaman Berjalan) */}
      <button
        type="button"
        onClick={() => onNavigate?.('keuangan')}
        className="group rounded-2xl border border-[#DFDBCA] bg-white p-5 text-left shadow-2xs transition-colors duration-150 hover:border-[#0D6B48]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D6B48]"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold tracking-wider text-[#526358]">
            SALDO KAS PURA
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F4EC] text-[#0D6B48] shrink-0">
            <Wallet className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2.5">
          <p className="font-serif-title text-2xl font-bold text-[#142019] tabular-nums">
            {formatRupiah(saldoKasPura)}
          </p>
        </div>
        <p className="mt-2 text-xs text-[#59695E]">
          Pemasukan – pengeluaran – pinjaman berjalan
        </p>
      </button>

      {/* Card 2: Saldo Kas Masuk & Keluar */}
      <button
        type="button"
        onClick={() => onNavigate?.('keuangan')}
        className="group rounded-2xl border border-[#D4E6EA] bg-[#F9FEFF] p-5 text-left shadow-2xs transition-colors duration-150 hover:border-[#0284C7]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7]"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold tracking-wider text-[#375C6B]">
            KAS MASUK & KELUAR
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E0F2FE] text-[#0369A1] shrink-0">
            <ArrowDownLeft className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2.5">
          <p className="font-mono text-xl font-bold text-[#0369A1] tabular-nums">
            + {formatRupiah(totalMasuk)}
          </p>
        </div>
        <p className="mt-2 text-xs font-medium text-[#C2410C] tabular-nums">
          Keluar: {formatRupiah(totalKeluar)} · Pinjaman: {formatRupiah(pinjamanBerjalan)}
        </p>
      </button>

      {/* Card 3: Anggota Aktif Pengempon */}
      <button
        type="button"
        onClick={() => onNavigate?.('anggota')}
        className="group rounded-2xl border border-[#DCE5DF] bg-white p-5 text-left shadow-2xs transition-colors duration-150 hover:border-[#0D6B48]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D6B48]"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold tracking-wider text-[#526358]">
            ANGGOTA AKTIF PENGEMPON
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E9F6EF] text-[#0D6B48] shrink-0">
            <Users className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="font-serif-title text-2xl font-bold text-[#142019] tabular-nums">
            {aktifCount}
          </span>
          <span className="font-mono text-xs text-[#59695E] tabular-nums">
            / {totalAnggota} terdaftar
          </span>
        </div>
        <p className="mt-2 text-xs text-[#59695E]">
          {cutiCount} cuti · {totalAnggota - aktifCount - cutiCount} nonaktif
        </p>
      </button>

      {/* Card 4: Jadwal Piodalan Terdekat */}
      <button
        type="button"
        onClick={() => onNavigate?.('piodalan')}
        className="group rounded-2xl border border-[#EDE2C9] bg-[#FFFDF8] p-5 text-left shadow-2xs transition-colors duration-150 hover:border-[#D97706]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold tracking-wider text-[#7C5B19]">
            PIODALAN TERDEKAT
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#B45309] shrink-0">
            <CalendarClock className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2.5">
          <p className="font-display text-base font-bold text-[#142019] truncate">
            {upcomingPiodalan ? upcomingPiodalan.namaPiodalan : 'Belum ada jadwal'}
          </p>
        </div>
        <p className="mt-2 text-xs font-medium text-[#B45309] tabular-nums truncate">
          {upcomingPiodalan
            ? `${formatTanggalIndo(upcomingPiodalan.tanggalMasehi)} · ${
                hariTersisa !== null && hariTersisa >= 0
                  ? `${hariTersisa} hari lagi`
                  : 'Terjadwal'
              }`
            : 'Tambahkan jadwal piodalan'}
        </p>
      </button>
    </section>
  );
}
