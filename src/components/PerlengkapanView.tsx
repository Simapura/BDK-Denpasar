import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  Package,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import {
  Anggota,
  KondisiBarang,
  PeminjamanPerlengkapan,
  PerlengkapanPura,
} from '../types/pura';
import { formatTanggalIndo } from '../utils/format';

interface PerlengkapanViewProps {
  anggota: Anggota[];
  perlengkapan: PerlengkapanPura[];
  peminjamanBarang: PeminjamanPerlengkapan[];
  canManage: boolean;
  onAddPerlengkapan: (item: Omit<PerlengkapanPura, 'id'>) => void;
  onUpdatePerlengkapan: (item: PerlengkapanPura) => void;
  onDeletePerlengkapan: (id: string) => void;
  onAddPeminjamanBarang: (item: Omit<PeminjamanPerlengkapan, 'id'>) => void;
  onReturnPeminjamanBarang: (id: string) => void;
  externalAddOpen?: boolean;
  onCloseExternalAdd?: () => void;
}

const EMPTY_BARANG: Omit<PerlengkapanPura, 'id'> = {
  kodeBarang: '',
  namaBarang: '',
  kategori: 'Upakara & Pelinggih',
  jumlahTotal: 1,
  kondisi: 'Baik',
  lokasiSimpan: 'Gedong Penyimpanan Bale Piyasan',
  keterangan: '',
};

export function PerlengkapanView({
  anggota,
  perlengkapan,
  peminjamanBarang,
  canManage,
  onAddPerlengkapan,
  onUpdatePerlengkapan,
  onDeletePerlengkapan,
  onAddPeminjamanBarang,
  onReturnPeminjamanBarang,
  externalAddOpen,
  onCloseExternalAdd,
}: PerlengkapanViewProps) {
  // Modals for Perlengkapan
  const [modalBarangOpen, setModalBarangOpen] = useState(false);
  const [editingBarang, setEditingBarang] = useState<PerlengkapanPura | null>(null);
  const [formBarang, setFormBarang] = useState<Omit<PerlengkapanPura, 'id'>>(EMPTY_BARANG);

  // Modal for Peminjaman Barang
  const [modalPinjamBarangOpen, setModalPinjamBarangOpen] = useState(false);
  const [pinjamBarangId, setPinjamBarangId] = useState(perlengkapan[0]?.id || '');
  const [pinjamBarangPeminjam, setPinjamBarangPeminjam] = useState(anggota[0]?.nama || '');
  const [pinjamBarangJumlah, setPinjamBarangJumlah] = useState(1);
  const [pinjamBarangTanggal, setPinjamBarangTanggal] = useState('2026-11-21');
  const [pinjamBarangKembali, setPinjamBarangKembali] = useState('2026-11-26');
  const [pinjamBarangKeperluan, setPinjamBarangKeperluan] = useState('');

  const effectiveBarangModalOpen = canManage && (modalBarangOpen || Boolean(externalAddOpen));

  const borrowedMap = useMemo(() => {
    const map = new Map<string, number>();
    peminjamanBarang
      .filter((p) => p.status === 'Dipinjam')
      .forEach((p) => {
        map.set(p.perlengkapanId, (map.get(p.perlengkapanId) || 0) + p.jumlah);
      });
    return map;
  }, [peminjamanBarang]);

  const statsPerlengkapan = useMemo(() => {
    const totalJenis = perlengkapan.length;
    const totalUnit = perlengkapan.reduce((acc, b) => acc + b.jumlahTotal, 0);
    const totalDipinjam = peminjamanBarang
      .filter((p) => p.status === 'Dipinjam')
      .reduce((acc, p) => acc + p.jumlah, 0);
    const perluPerbaikan = perlengkapan.filter((b) => b.kondisi !== 'Baik').length;
    return { totalJenis, totalUnit, totalDipinjam, perluPerbaikan };
  }, [perlengkapan, peminjamanBarang]);

  const openAddBarang = () => {
    setEditingBarang(null);
    setFormBarang({
      ...EMPTY_BARANG,
      kodeBarang: `INV-PURA-${String(perlengkapan.length + 1).padStart(2, '0')}`,
    });
    setModalBarangOpen(true);
  };

  const openEditBarang = (item: PerlengkapanPura) => {
    setEditingBarang(item);
    setFormBarang({
      kodeBarang: item.kodeBarang,
      namaBarang: item.namaBarang,
      kategori: item.kategori,
      jumlahTotal: item.jumlahTotal,
      kondisi: item.kondisi,
      lokasiSimpan: item.lokasiSimpan,
      keterangan: item.keterangan || '',
    });
    setModalBarangOpen(true);
  };

  const closeBarangModal = () => {
    setModalBarangOpen(false);
    setEditingBarang(null);
    onCloseExternalAdd?.();
  };

  const handleSubmitBarang = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !formBarang.namaBarang.trim()) return;
    if (editingBarang) {
      onUpdatePerlengkapan({ ...formBarang, id: editingBarang.id });
    } else {
      onAddPerlengkapan(formBarang);
    }
    closeBarangModal();
  };

  const handleSubmitPinjamBarang = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    const item = perlengkapan.find((p) => p.id === pinjamBarangId);
    if (!item || !pinjamBarangKeperluan.trim()) return;
    onAddPeminjamanBarang({
      perlengkapanId: item.id,
      namaBarang: item.namaBarang,
      peminjam: pinjamBarangPeminjam.trim(),
      jumlah: Math.max(1, pinjamBarangJumlah),
      tanggalPinjam: pinjamBarangTanggal,
      rencanaKembali: pinjamBarangKembali,
      keperluan: pinjamBarangKeperluan.trim(),
      status: 'Dipinjam',
    });
    setPinjamBarangKeperluan('');
    setModalPinjamBarangOpen(false);
  };

  return (
    <div className="space-y-6">
      {!canManage && (
        <div className="rounded-xl border border-[#E5DEC9] bg-white px-5 py-3 text-xs text-[#435349]">
          Anda masuk sebagai <strong className="text-[#142019]">Pengempon (Hanya Lihat)</strong>. Anda
          dapat memantau daftar inventaris perlengkapan dan status sirkulasi peminjaman barang
          secara transparan. Penambahan atau pembaruan inventaris hanya dapat dilakukan oleh Pengurus.
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#DCE5DF] bg-white p-5">
          <p className="text-xs font-medium text-[#526358]">Jenis Perlengkapan</p>
          <p className="mt-2 font-display text-2xl font-bold text-[#142019] tabular-nums">
            {statsPerlengkapan.totalJenis}
          </p>
        </div>
        <div className="rounded-2xl border border-[#D4E6EA] bg-[#F9FEFF] p-5">
          <p className="text-xs font-medium text-[#375C6B]">Total Unit Tersedia</p>
          <p className="mt-2 font-display text-2xl font-bold text-[#0369A1] tabular-nums">
            {Math.max(0, statsPerlengkapan.totalUnit - statsPerlengkapan.totalDipinjam)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#EDE2C9] bg-[#FFFDF7] p-5">
          <p className="text-xs font-medium text-[#7C5B19]">Unit Sedang Dipinjam</p>
          <p className="mt-2 font-display text-2xl font-bold text-[#B45309] tabular-nums">
            {statsPerlengkapan.totalDipinjam}
          </p>
        </div>
        <div className="rounded-2xl border border-[#EEDAD2] bg-[#FFFAF8] p-5">
          <p className="text-xs font-medium text-[#7C4732]">Perlu Perbaikan</p>
          <p className="mt-2 font-display text-2xl font-bold text-[#C2410C] tabular-nums">
            {statsPerlengkapan.perluPerbaikan}
          </p>
        </div>
      </div>

      {/* Inventory Table */}
      <section className="rounded-2xl border border-[#E2E4DC] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFECE2] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#0D6B48]">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-[#142019]">
                Daftar Inventaris & Sarana Perlengkapan Pura
              </h2>
              <p className="text-xs text-[#59695E]">
                Sarana upakara, tabuh, tenda, kursi, dan alat ngayah milik Pura BDK Denpasar
              </p>
            </div>
          </div>
          {canManage && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setModalPinjamBarangOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DDD6] bg-white px-3.5 py-2 text-xs font-medium text-[#0D6B48] hover:bg-[#F3F8F5] whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5" />
                Catat Pinjam Barang
              </button>
              <button
                type="button"
                onClick={openAddBarang}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D6B48] px-4 py-2 text-xs font-medium text-white hover:bg-[#095438] whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Perlengkapan
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EFECE2] text-[#59695E]">
                <th className="px-5 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Nama Perlengkapan</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 text-right font-medium">Dipinjam</th>
                <th className="px-4 py-3 text-right font-medium">Tersedia</th>
                <th className="px-4 py-3 font-medium">Kondisi</th>
                <th className="px-4 py-3 font-medium">Lokasi Simpan</th>
                {canManage && <th className="px-5 py-3 text-right font-medium">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F1EA]">
              {perlengkapan.map((item) => {
                const dipinjam = borrowedMap.get(item.id) || 0;
                const tersedia = Math.max(0, item.jumlahTotal - dipinjam);
                return (
                  <tr key={item.id} className="hover:bg-[#FAF9F4]">
                    <td className="px-5 py-3 font-mono text-[#526358] whitespace-nowrap">
                      {item.kodeBarang}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#142019]">{item.namaBarang}</p>
                      {item.keterangan && (
                        <p className="text-[11px] text-[#59695E]">{item.keterangan}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#435349] whitespace-nowrap">{item.kategori}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {item.jumlahTotal}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[#B45309] tabular-nums">
                      {dipinjam}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-[#0D6B48] tabular-nums">
                      {tersedia}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`font-medium ${
                          item.kondisi === 'Baik'
                            ? 'text-[#0D6B48]'
                            : item.kondisi === 'Perlu Perbaikan'
                            ? 'text-[#B45309]'
                            : 'text-[#DC2626]'
                        }`}
                      >
                        {item.kondisi}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#59695E]">{item.lokasiSimpan}</td>
                    {canManage && (
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditBarang(item)}
                            className="rounded-md p-1.5 text-[#435349] hover:bg-[#E9EEEA] hover:text-[#0D6B48]"
                            aria-label={`Edit ${item.namaBarang}`}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeletePerlengkapan(item.id)}
                            className="rounded-md p-1.5 text-[#6B7B70] hover:bg-red-50 hover:text-red-700"
                            aria-label={`Hapus ${item.namaBarang}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Equipment Borrowing History Table */}
      <section className="rounded-2xl border border-[#E2E4DC] bg-white">
        <div className="border-b border-[#EFECE2] px-6 py-4">
          <h2 className="font-display text-base font-semibold text-[#142019]">
            Sirkulasi Peminjaman Barang Perlengkapan
          </h2>
          <p className="text-xs text-[#59695E]">
            Riwayat barang keluar untuk kegiatan pengempon maupun acara kedinasan BDK
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EFECE2] text-[#59695E]">
                <th className="px-5 py-3 font-medium">Tgl Pinjam</th>
                <th className="px-4 py-3 font-medium">Barang & Jumlah</th>
                <th className="px-4 py-3 font-medium">Peminjam</th>
                <th className="px-4 py-3 font-medium">Keperluan</th>
                <th className="px-4 py-3 font-medium">Rencana Kembali</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {canManage && <th className="px-5 py-3 text-right font-medium">Tindakan</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F1EA]">
              {peminjamanBarang.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF9F4]">
                  <td className="px-5 py-3 font-mono text-[#526358] tabular-nums whitespace-nowrap">
                    {formatTanggalIndo(p.tanggalPinjam)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#142019]">
                    {p.namaBarang} ·{' '}
                    <span className="font-mono text-[#0D6B48]">{p.jumlah} unit</span>
                  </td>
                  <td className="px-4 py-3 text-[#34443A]">{p.peminjam}</td>
                  <td className="px-4 py-3 text-[#59695E]">{p.keperluan}</td>
                  <td className="px-4 py-3 font-mono text-[#526358] tabular-nums whitespace-nowrap">
                    {formatTanggalIndo(p.rencanaKembali)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 font-medium ${
                        p.status === 'Dikembalikan' ? 'text-[#0D6B48]' : 'text-[#B45309]'
                      }`}
                    >
                      {p.status === 'Dikembalikan' && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {p.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      {p.status === 'Dipinjam' ? (
                        <button
                          type="button"
                          onClick={() => onReturnPeminjamanBarang(p.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#0D6B48] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#095438]"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Tandai Kembali
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#6B7B70]">
                          Selesai {p.tanggalKembali ? formatTanggalIndo(p.tanggalKembali) : ''}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Add / Edit Perlengkapan */}
      {effectiveBarangModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#DDE3DE] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EFECE2] px-6 py-4">
              <h3 className="font-display text-base font-semibold text-[#142019]">
                {editingBarang
                  ? 'Perbarui Data Perlengkapan'
                  : 'Tambah Inventaris Perlengkapan Baru'}
              </h3>
              <button
                type="button"
                onClick={closeBarangModal}
                className="rounded-md p-1 text-[#59695E] hover:bg-[#F4F6F4]"
                aria-label="Tutup modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitBarang} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Kode Barang</label>
                  <input
                    type="text"
                    required
                    value={formBarang.kodeBarang}
                    onChange={(e) => setFormBarang({ ...formBarang, kodeBarang: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Kategori</label>
                  <select
                    value={formBarang.kategori}
                    onChange={(e) =>
                      setFormBarang({
                        ...formBarang,
                        kategori: e.target.value as PerlengkapanPura['kategori'],
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                  >
                    <option value="Upakara & Pelinggih">Upakara & Pelinggih</option>
                    <option value="Kesenian & Tabuh">Kesenian & Tabuh</option>
                    <option value="Tenda, Meja & Kursi">Tenda, Meja & Kursi</option>
                    <option value="Elektronik & Sound">Elektronik & Sound</option>
                    <option value="Alat Kebersihan">Alat Kebersihan</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Nama Perlengkapan
                </label>
                <input
                  type="text"
                  required
                  value={formBarang.namaBarang}
                  onChange={(e) => setFormBarang({ ...formBarang, namaBarang: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Jumlah Total</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formBarang.jumlahTotal}
                    onChange={(e) =>
                      setFormBarang({
                        ...formBarang,
                        jumlahTotal: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Kondisi</label>
                  <select
                    value={formBarang.kondisi}
                    onChange={(e) =>
                      setFormBarang({ ...formBarang, kondisi: e.target.value as KondisiBarang })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                  >
                    <option value="Baik">Baik</option>
                    <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                    <option value="Rusak">Rusak</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Lokasi Penyimpanan
                </label>
                <input
                  type="text"
                  required
                  value={formBarang.lokasiSimpan}
                  onChange={(e) => setFormBarang({ ...formBarang, lokasiSimpan: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Catatan / Keterangan (opsional)
                </label>
                <input
                  type="text"
                  value={formBarang.keterangan || ''}
                  onChange={(e) => setFormBarang({ ...formBarang, keterangan: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-[#EFECE2] pt-4">
                <button
                  type="button"
                  onClick={closeBarangModal}
                  className="rounded-lg border border-[#D4DDD6] bg-white px-4 py-2 text-xs font-medium text-[#34443A] hover:bg-[#F4F6F4]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0D6B48] px-4 py-2 text-xs font-medium text-white hover:bg-[#095438]"
                >
                  Simpan Perlengkapan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Catat Peminjaman Barang */}
      {canManage && modalPinjamBarangOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#DDE3DE] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EFECE2] px-6 py-4">
              <h3 className="font-display text-base font-semibold text-[#142019]">
                Catat Peminjaman Perlengkapan Pura
              </h3>
              <button
                type="button"
                onClick={() => setModalPinjamBarangOpen(false)}
                className="rounded-md p-1 text-[#59695E] hover:bg-[#F4F6F4]"
                aria-label="Tutup modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitPinjamBarang} className="space-y-4 p-6">
              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Pilih Perlengkapan
                </label>
                <select
                  value={pinjamBarangId}
                  onChange={(e) => setPinjamBarangId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                >
                  {perlengkapan.map((item) => {
                    const sisa = Math.max(0, item.jumlahTotal - (borrowedMap.get(item.id) || 0));
                    return (
                      <option key={item.id} value={item.id}>
                        {item.namaBarang} (Tersedia: {sisa} unit)
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">
                    Nama Peminjam
                  </label>
                  <input
                    type="text"
                    required
                    value={pinjamBarangPeminjam}
                    onChange={(e) => setPinjamBarangPeminjam(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Jumlah Unit</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={pinjamBarangJumlah}
                    onChange={(e) => setPinjamBarangJumlah(Math.max(1, Number(e.target.value) || 1))}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Tanggal Pinjam</label>
                  <input
                    type="date"
                    required
                    value={pinjamBarangTanggal}
                    onChange={(e) => setPinjamBarangTanggal(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">
                    Rencana Kembali
                  </label>
                  <input
                    type="date"
                    required
                    value={pinjamBarangKembali}
                    onChange={(e) => setPinjamBarangKembali(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">Keperluan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kegiatan upacara keluarga / acara BDK"
                  value={pinjamBarangKeperluan}
                  onChange={(e) => setPinjamBarangKeperluan(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-[#EFECE2] pt-4">
                <button
                  type="button"
                  onClick={() => setModalPinjamBarangOpen(false)}
                  className="rounded-lg border border-[#D4DDD6] bg-white px-4 py-2 text-xs font-medium text-[#34443A]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0D6B48] px-4 py-2 text-xs font-medium text-white hover:bg-[#095438]"
                >
                  Simpan Peminjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
