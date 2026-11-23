import React, { useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Edit3,
  HandCoins,
  MapPin,
  MessageSquarePlus,
  Package,
  Phone,
  Receipt,
  Send,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { KategoriSaran, MenuId, PuraDatabase, SaranMasukan, UserSession } from '../types/pura';
import { resolveKategoriKeanggotaan } from '../data/initialData';
import { StatCards } from './StatCards';
import { PetaPuraSection } from './PetaPuraSection';
import { formatRupiah, formatTanggalIndo, getMonthLabel } from '../utils/format';

interface DashboardViewProps {
  data: PuraDatabase;
  session: UserSession;
  onNavigate: (menu: MenuId) => void;
  onQuickRecordIuran: () => void;
  onUpdatePengumuman: (text: string) => void;
  onAddSaran: (item: Omit<SaranMasukan, 'id'>) => void;
  canManage: boolean;
}

export function DashboardView({
  data,
  session,
  onNavigate,
  onQuickRecordIuran,
  onUpdatePengumuman,
  onAddSaran,
  canManage,
}: DashboardViewProps) {
  const [editingPengumuman, setEditingPengumuman] = useState(false);
  const [draftPengumuman, setDraftPengumuman] = useState(data.pengumuman);

  // Quick Saran & Masukan inline form
  const [saranKategori, setSaranKategori] = useState<KategoriSaran>('Pelayanan & Fasilitas');
  const [saranText, setSaranText] = useState('');
  const [saranSuccess, setSaranSuccess] = useState<string | null>(null);

  const currentMonth = '2026-11';
  const currentYear = currentMonth.slice(0, 4);
  const tarifUtama = data.profil.defaultIuranBulanan || 35000;
  const tarifKedua = data.profil.opsiIuranKedua || 20000;

  const activeMembers = data.anggota.filter((a) => a.status === 'Aktif');
  const paidAnnualIds = new Set(
    data.transaksi
      .filter(
        (t) =>
          t.jenis === 'Pemasukan' &&
          t.kategori === 'Iuran Wajib Tahunan' &&
          t.tahunIuran === currentYear &&
          t.anggotaId
      )
      .map((t) => t.anggotaId as string)
  );
  const paidMonthlyIds = new Set(
    data.transaksi
      .filter(
        (t) =>
          t.jenis === 'Pemasukan' &&
          t.kategori === 'Iuran Wajib Bulanan' &&
          t.bulanIuran === currentMonth &&
          t.anggotaId
      )
      .map((t) => t.anggotaId as string)
  );
  const paidThisMonthIds = new Set([...paidAnnualIds, ...paidMonthlyIds]);
  const paidActiveMembers = activeMembers.filter((a) => paidThisMonthIds.has(a.id));
  const paidActiveCount = paidActiveMembers.length;
  const annualCoveredActiveCount = activeMembers.filter((a) => paidAnnualIds.has(a.id)).length;
  const monthlyTerkumpulValue = paidActiveMembers.reduce(
    (sum, m) => sum + (m.iuranWajibBulanan || tarifUtama),
    0
  );
  const duesProgress =
    activeMembers.length > 0 ? Math.round((paidActiveCount / activeMembers.length) * 100) : 0;

  const upcomingPiodalanCount = data.piodalan.filter((p) => p.status !== 'Selesai').length;
  const upcomingPiodalan = [...data.piodalan]
    .filter((p) => p.status !== 'Selesai')
    .sort((a, b) => a.tanggalMasehi.localeCompare(b.tanggalMasehi))[0];

  const recentTransactions = [...data.transaksi]
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    .slice(0, 6);

  const borrowedUnits = data.peminjamanBarang
    .filter((p) => p.status === 'Dipinjam')
    .reduce((acc, p) => acc + p.jumlah, 0);

  const activeLoansCount = data.pinjamanDana.filter((p) => p.status === 'Berjalan').length;
  const pembinaCount = data.anggota.filter(
    (a) => resolveKategoriKeanggotaan(a.jabatan, a.kategoriKeanggotaan) === 'Pembina'
  ).length;
  const pengurusCount = data.anggota.filter(
    (a) => resolveKategoriKeanggotaan(a.jabatan, a.kategoriKeanggotaan) === 'Pengurus'
  ).length;
  const anggotaBiasaCount = data.anggota.length - pembinaCount - pengurusCount;
  const recentSaran = [...data.saranMasukan]
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    .slice(0, 3);

  const handleQuickSaranSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saranText.trim()) return;
    onAddSaran({
      tanggal: new Date().toISOString().slice(0, 10),
      namaPengirim: session.nama,
      kategori: saranKategori,
      isiSaran: saranText.trim(),
      status: 'Baru',
    });
    setSaranText('');
    setSaranSuccess('Saran Anda berhasil dikirim ke Pengurus.');
    setTimeout(() => setSaranSuccess(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* PENGUMUMAN Marquee Bar */}
      <div className="flex items-stretch overflow-hidden rounded-xl border border-[#DFD7BF] bg-[#0D6B48] shadow-2xs">
        <div className="flex items-center bg-[#E3A924] px-3.5 py-2 text-[11px] font-bold tracking-wider text-[#142019] shrink-0">
          PENGUMUMAN
        </div>
        <div className="relative flex flex-1 items-center overflow-hidden px-3 text-xs font-medium text-white">
          <div className="animate-marquee">
            <span className="pr-12">{data.pengumuman}</span>
            <span className="pr-12 text-[#FDE68A]" aria-hidden="true">
              ◆
            </span>
            <span className="pr-12" aria-hidden="true">
              {data.pengumuman}
            </span>
          </div>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => {
              setDraftPengumuman(data.pengumuman);
              setEditingPengumuman(true);
            }}
            className="flex items-center gap-1 border-l border-white/15 bg-[#095438] px-3 text-[11px] font-medium text-[#FDE68A] hover:bg-[#07442D] shrink-0"
            title="Edit Pengumuman"
          >
            <Edit3 className="h-3 w-3" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        )}
      </div>

      {/* Om Swastyastu Emerald Hero Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D6B48] via-[#11714D] to-[#1A7D58] p-6 sm:p-8 text-white lg:col-span-7 shadow-sm">
          <div
            className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full border-[26px] border-white/6"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-10 -bottom-10 h-52 w-52 rounded-full border-[18px] border-white/6"
            aria-hidden="true"
          />

          <div className="relative z-10 flex h-full flex-col justify-between space-y-5">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-semibold tracking-widest text-[#F5C556]">
                  ◆ SIMAPURA · SISTEM MANAJEMEN PURA
                </p>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => onNavigate('pengaturan')}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1 text-[11px] font-medium text-[#FDE68A] hover:bg-white/25"
                  >
                    <Settings className="h-3 w-3" />
                    Pengaturan Pengurus
                  </button>
                )}
              </div>
              <h2 className="mt-2 font-serif-title text-2xl sm:text-3xl font-bold text-white">
                {data.profil.namaPura}
              </h2>
              <p className="mt-3 max-w-xl text-xs sm:text-sm leading-relaxed text-[#E4F3EC]">
                {data.profil.sambutanBeranda}
              </p>
            </div>

            <div className="space-y-2 border-t border-white/15 pt-4 text-xs text-[#DCEEE4]">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#F5C556] shrink-0" />
                  <span>{data.profil.alamatSingkat}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#F5C556] shrink-0" />
                  <span>Kontak {data.profil.kontakPengurus}</span>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[#F5C556] shrink-0" />
                  <span>{data.anggota.length} pengempon</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#F5C556] shrink-0" />
                  <span>{upcomingPiodalanCount} piodalan mendatang</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-[#F5C556] shrink-0" />
                  <span>
                    {data.perlengkapan.length} perlengkapan ({borrowedUnits} dipinjam)
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <HandCoins className="h-3.5 w-3.5 text-[#F5C556] shrink-0" />
                  <span>{activeLoansCount} pinjaman kas berjalan</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Monthly Dues Realization Panel + Quick Shortcuts */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#E2DCC8] bg-white p-6 lg:col-span-5 shadow-2xs">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-semibold text-[#142019]">
                Realisasi Iuran Wajib Pengempon
              </h2>
              <span className="font-mono text-xs text-[#59695E]">
                {getMonthLabel(currentMonth)}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#59695E]">
              Kisaran tarif iuran: {formatRupiah(tarifUtama)} &amp; {formatRupiah(tarifKedua)} /
              bulan (bayar bulanan atau sekali setahun).
            </p>

            <div className="mt-5">
              <div className="flex items-baseline justify-between">
                <span className="font-serif-title text-2xl font-bold text-[#142019] tabular-nums">
                  {paidActiveCount} dari {activeMembers.length} Anggota
                </span>
                <span className="font-mono text-sm font-semibold text-[#D97706] tabular-nums">
                  {duesProgress}%
                </span>
              </div>
              <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-[#EFECE2]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0D6B48] to-[#E3A924] transition-all duration-300"
                  style={{ width: `${duesProgress}%` }}
                />
              </div>
              <p className="mt-2.5 text-xs text-[#59695E] tabular-nums">
                Nilai terbayar bulan ini: {formatRupiah(monthlyTerkumpulValue)} ({annualCoveredActiveCount}{' '}
                tahunan) · Belum lunas: {activeMembers.length - paidActiveCount} anggota
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[#EFECE2] pt-4">
            {canManage ? (
              <button
                type="button"
                onClick={onQuickRecordIuran}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0D6B48] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#095438] whitespace-nowrap"
              >
                <Receipt className="h-3.5 w-3.5" />
                Catat Iuran
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('keuangan')}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0D6B48] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#095438] whitespace-nowrap"
              >
                <Receipt className="h-3.5 w-3.5" />
                Buku Kas
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('perlengkapan')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFD7BF] bg-[#FCF9F0] px-3 py-2 text-xs font-medium text-[#142019] transition-colors hover:bg-[#F5EED8] whitespace-nowrap"
            >
              <Package className="h-3.5 w-3.5 text-[#0D6B48]" />
              Perlengkapan
            </button>
            <button
              type="button"
              onClick={() => onNavigate('pinjaman')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFD7BF] bg-[#FCF9F0] px-3 py-2 text-xs font-medium text-[#142019] transition-colors hover:bg-[#F5EED8] whitespace-nowrap"
            >
              <HandCoins className="h-3.5 w-3.5 text-[#D97706]" />
              Pinjaman
            </button>
          </div>
        </div>
      </div>

      {/* 4 Top Summary Stat Cards */}
      <StatCards
        anggota={data.anggota}
        piodalan={data.piodalan}
        transaksi={data.transaksi}
        pinjamanDana={data.pinjamanDana}
        onNavigate={(m) => onNavigate(m)}
      />

      {/* Main 2-Column Interactive Grid: Upcoming Piodalan + Recent Ledger */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left: Piodalan Terdekat & Rincian Banten */}
        <section className="rounded-2xl border border-[#E2DCC8] bg-white xl:col-span-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#EFECE2] px-6 py-4">
            <div>
              <h2 className="font-display text-base font-semibold text-[#142019]">
                Agenda Piodalan Terdekat & Rincian Banten
              </h2>
              <p className="text-xs text-[#59695E]">
                Persiapan sarana upakara dan koordinator pelaksana
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('piodalan')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D6B48] hover:underline whitespace-nowrap shrink-0"
            >
              Lihat Semua
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {upcomingPiodalan ? (
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-[#B45309]">
                    {upcomingPiodalan.jenisPiodalan} · {upcomingPiodalan.status}
                  </p>
                  <h3 className="mt-0.5 font-serif-title text-lg font-bold text-[#142019]">
                    {upcomingPiodalan.namaPiodalan}
                  </h3>
                </div>
                <span className="font-mono text-xs font-medium text-[#142019] tabular-nums">
                  {formatTanggalIndo(upcomingPiodalan.tanggalMasehi)}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 border-y border-[#EFECE2] py-3 text-xs text-[#435349] sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[#0D6B48] shrink-0" />
                  <span>{upcomingPiodalan.hariWaktu}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#0D6B48] shrink-0" />
                  <span className="truncate">{upcomingPiodalan.pelinggihUtama}</span>
                </div>
              </div>

              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#142019]">
                  <ClipboardList className="h-3.5 w-3.5 text-[#0D6B48]" />
                  Rincian Banten yang Diperlukan:
                </p>
                <ul className="mt-2 space-y-1.5">
                  {upcomingPiodalan.rincianBanten.map((banten, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#34443A]">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-[#0D6B48] shrink-0" />
                      <span>{banten}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-[#59695E]">
                <span>PJ: {upcomingPiodalan.penanggungJawab}</span>
                <span className="font-mono font-medium text-[#142019] tabular-nums">
                  Est. Anggaran: {formatRupiah(upcomingPiodalan.estimasiBiaya)}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-[#59695E]">
              Belum ada jadwal piodalan mendatang.
            </div>
          )}
        </section>

        {/* Right: Mutasi Kas Terbaru */}
        <section className="rounded-2xl border border-[#E2DCC8] bg-white xl:col-span-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#EFECE2] px-6 py-4">
            <div>
              <h2 className="font-display text-base font-semibold text-[#142019]">
                Transparansi Mutasi Kas Terbaru
              </h2>
              <p className="text-xs text-[#59695E]">
                Pemasukan iuran/punia dan pengeluaran sarana upacara
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('keuangan')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D6B48] hover:underline whitespace-nowrap shrink-0"
            >
              Buku Kas
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EFECE2] text-[#59695E]">
                  <th className="px-5 py-3 font-medium">Tanggal</th>
                  <th className="px-3 py-3 font-medium">Uraian & Kategori</th>
                  <th className="px-5 py-3 text-right font-medium">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F1EA]">
                {recentTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-[#FAF9F4]">
                    <td className="px-5 py-3 font-mono text-[#526358] tabular-nums whitespace-nowrap">
                      {formatTanggalIndo(trx.tanggal)}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-[#142019] line-clamp-1">{trx.uraian}</p>
                      <p className="text-[11px] text-[#59695E]">
                        {trx.jenis} · {trx.kategori}
                      </p>
                    </td>
                    <td
                      className={`px-5 py-3 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                        trx.jenis === 'Pemasukan' ? 'text-[#0369A1]' : 'text-[#C2410C]'
                      }`}
                    >
                      {trx.jenis === 'Pemasukan' ? '+' : '-'} {formatRupiah(trx.nominal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Map Pura BDK Denpasar */}
      <PetaPuraSection
        profil={data.profil}
        canManage={canManage}
        onEditLocation={() => onNavigate('pengaturan')}
      />

      {/* Kolom Saran & Masukan Ringkas + Ringkasan Pengurus */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
        {/* Inline Kolom Saran & Masukan */}
        <section className="rounded-2xl border border-[#E2DCC8] bg-white p-6 xl:col-span-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#B45309]">
                <MessageSquarePlus className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-[#142019]">
                  Kolom Saran & Masukan
                </h2>
                <p className="text-xs text-[#59695E]">Kirim aspirasi langsung ke Pengurus</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('saran')}
              className="text-xs font-semibold text-[#0D6B48] hover:underline whitespace-nowrap"
            >
              Semua ({data.saranMasukan.length})
            </button>
          </div>

          {saranSuccess && (
            <div className="rounded-lg border border-[#0D6B48]/25 bg-[#ECFDF5] px-3 py-2 text-xs font-medium text-[#0D6B48]">
              {saranSuccess}
            </div>
          )}

          <form onSubmit={handleQuickSaranSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#34443A]">Kategori</label>
              <select
                value={saranKategori}
                onChange={(e) => setSaranKategori(e.target.value as KategoriSaran)}
                className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
              >
                <option value="Pelayanan & Fasilitas">Pelayanan & Fasilitas</option>
                <option value="Upakara & Piodalan">Upakara & Piodalan</option>
                <option value="Keuangan & Iuran">Keuangan & Iuran</option>
                <option value="Perlengkapan & Pinjaman">Perlengkapan & Pinjaman</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#34443A]">
                Pesan / Saran Pengempon
              </label>
              <textarea
                rows={3}
                required
                placeholder="Tuliskan usulan, masukan, atau keperluan perbaikan sarana pura..."
                value={saranText}
                onChange={(e) => setSaranText(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D6B48] px-4 py-2 text-xs font-semibold text-white hover:bg-[#095438]"
            >
              <Send className="h-3.5 w-3.5" />
              Kirim Saran / Masukan
            </button>
          </form>

          {recentSaran.length > 0 && (
            <div className="border-t border-[#EFECE2] pt-3 space-y-2.5">
              <p className="text-[11px] font-semibold tracking-wider text-[#59695E]">
                MASUKAN TERBARU
              </p>
              {recentSaran.map((s) => (
                <div key={s.id} className="rounded-xl bg-[#FAF8F1] p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#142019] truncate">{s.namaPengirim}</span>
                    <span
                      className={`text-[11px] font-semibold shrink-0 ${
                        s.status === 'Ditindaklanjuti'
                          ? 'text-[#0D6B48]'
                          : s.status === 'Ditinjau'
                          ? 'text-[#0369A1]'
                          : 'text-[#B45309]'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[#435349] line-clamp-2">{s.isiSaran}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Snapshot of Active Pengempon Directory */}
        <section className="rounded-2xl border border-[#E2DCC8] bg-white xl:col-span-7 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFECE2] px-6 py-4">
            <div>
              <h2 className="font-display text-base font-semibold text-[#142019]">
                Ringkasan Pembina, Pengurus & Anggota ({data.anggota.length} Orang)
              </h2>
              <p className="text-xs text-[#59695E]">
                {pembinaCount} Pembina · {pengurusCount} Pengurus · {anggotaBiasaCount} Anggota
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('anggota')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D6B48] hover:underline whitespace-nowrap"
            >
              <Users className="h-3.5 w-3.5" />
              Direktori Lengkap
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EFECE2] text-[#59695E]">
                  <th className="px-5 py-3 font-medium">No. Induk</th>
                  <th className="px-4 py-3 font-medium">Nama Lengkap</th>
                  <th className="px-4 py-3 font-medium">Unsur & Jabatan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Iuran Nov 2026</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F1EA]">
                {data.anggota.slice(0, 8).map((ang) => {
                  const lunasTahunan = paidAnnualIds.has(ang.id);
                  const lunas = paidThisMonthIds.has(ang.id);
                  const kat = resolveKategoriKeanggotaan(ang.jabatan, ang.kategoriKeanggotaan);
                  return (
                    <tr key={ang.id} className="hover:bg-[#FAF9F4]">
                      <td className="px-5 py-3 font-mono text-[#526358] tabular-nums whitespace-nowrap">
                        {ang.nomorInduk}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#142019] whitespace-nowrap">
                        {ang.nama}
                      </td>
                      <td className="px-4 py-3 text-[#435349] whitespace-nowrap">
                        <span
                          className={`mr-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                            kat === 'Pembina'
                              ? 'bg-[#FEF3C7] text-[#92400E]'
                              : kat === 'Pengurus'
                              ? 'bg-[#ECFDF5] text-[#0D6B48]'
                              : 'bg-[#F1F5F9] text-[#475569]'
                          }`}
                        >
                          {kat}
                        </span>
                        {ang.jabatan}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`font-medium ${
                            ang.status === 'Aktif'
                              ? 'text-[#0D6B48]'
                              : ang.status === 'Cuti'
                              ? 'text-[#B45309]'
                              : 'text-[#64748B]'
                          }`}
                        >
                          {ang.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <span className={`font-medium ${lunas ? 'text-[#0D6B48]' : 'text-[#B45309]'}`}>
                          {lunasTahunan ? 'Lunas (Tahunan)' : lunas ? 'Lunas' : 'Belum Tercatat'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Edit Pengumuman Modal (Pengurus Only) */}
      {canManage && editingPengumuman && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#E2DCC8] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EFECE2] pb-3">
              <h3 className="font-display text-base font-semibold text-[#142019]">
                Perbarui Pengumuman Beranda
              </h3>
              <button
                type="button"
                onClick={() => setEditingPengumuman(false)}
                className="rounded-md p-1 text-[#59695E] hover:bg-[#F4F6F4]"
                aria-label="Tutup modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-medium text-[#34443A]">
                Isi Teks Pengumuman Berjalan
              </label>
              <textarea
                rows={4}
                value={draftPengumuman}
                onChange={(e) => setDraftPengumuman(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#D4DDD6] px-3 py-2 text-xs leading-relaxed focus:border-[#0D6B48] focus:outline-none"
              />
            </div>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingPengumuman(false)}
                className="rounded-lg border border-[#D4DDD6] bg-white px-4 py-2 text-xs font-medium text-[#34443A]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (draftPengumuman.trim()) {
                    onUpdatePengumuman(draftPengumuman.trim());
                  }
                  setEditingPengumuman(false);
                }}
                className="rounded-lg bg-[#0D6B48] px-4 py-2 text-xs font-medium text-white hover:bg-[#095438]"
              >
                Simpan Pengumuman
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
