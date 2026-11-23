import React, { useMemo, useState } from 'react';
import {
  Download,
  Edit3,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserMinus,
  UserX,
  X,
} from 'lucide-react';
import { Anggota, KategoriKeanggotaan, SkemaIuran, StatusKeaktifan } from '../types/pura';
import { resolveKategoriKeanggotaan } from '../data/initialData';
import { exportToCsv, formatRupiah, formatTanggalIndo } from '../utils/format';

interface AnggotaViewProps {
  anggota: Anggota[];
  tarifOpsi?: [number, number];
  onAdd: (member: Omit<Anggota, 'id'>) => void;
  onUpdate: (member: Anggota) => void;
  onDelete: (id: string) => void;
  canManage: boolean;
  externalAddOpen?: boolean;
  onCloseExternalAdd?: () => void;
}

const EMPTY_FORM: Omit<Anggota, 'id'> = {
  nomorInduk: '',
  nama: '',
  kategoriKeanggotaan: 'Anggota',
  jabatan: 'Anggota Pengempon',
  unitKerja: 'Bagian Tata Usaha',
  telepon: '',
  alamat: '',
  status: 'Aktif',
  tanggalBergabung: '2026-11-20',
  iuranWajibBulanan: 35000,
  skemaIuran: 'Bulanan',
};

const KATEGORI_DEFAULT_JABATAN: Record<KategoriKeanggotaan, string> = {
  Pembina: 'Pembina / Penasihat Pura',
  Pengurus: 'Pengurus / Koordinator Seksi',
  Anggota: 'Anggota Pengempon',
};

export function AnggotaView({
  anggota,
  tarifOpsi = [35000, 20000],
  onAdd,
  onUpdate,
  onDelete,
  canManage,
  externalAddOpen,
  onCloseExternalAdd,
}: AnggotaViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | StatusKeaktifan>('Semua');
  const [kategoriFilter, setKategoriFilter] = useState<'Semua' | KategoriKeanggotaan>('Semua');
  const [editingMember, setEditingMember] = useState<Anggota | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState<Omit<Anggota, 'id'>>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Anggota | null>(null);

  const effectiveModalOpen = canManage && (isModalOpen || Boolean(externalAddOpen));

  const counts = useMemo(() => {
    let pembina = 0;
    let pengurus = 0;
    let anggotaBiasa = 0;
    anggota.forEach((a) => {
      const kat = resolveKategoriKeanggotaan(a.jabatan, a.kategoriKeanggotaan);
      if (kat === 'Pembina') pembina += 1;
      else if (kat === 'Pengurus') pengurus += 1;
      else anggotaBiasa += 1;
    });
    return {
      semua: anggota.length,
      aktif: anggota.filter((a) => a.status === 'Aktif').length,
      cuti: anggota.filter((a) => a.status === 'Cuti').length,
      nonaktif: anggota.filter((a) => a.status === 'Nonaktif').length,
      pembina,
      pengurus,
      anggotaBiasa,
    };
  }, [anggota]);

  const filteredAnggota = useMemo(() => {
    const q = search.trim().toLowerCase();
    return anggota.filter((a) => {
      const kat = resolveKategoriKeanggotaan(a.jabatan, a.kategoriKeanggotaan);
      const matchKategori = kategoriFilter === 'Semua' || kat === kategoriFilter;
      const matchStatus = statusFilter === 'Semua' || a.status === statusFilter;
      const matchSearch =
        !q ||
        a.nama.toLowerCase().includes(q) ||
        a.nomorInduk.toLowerCase().includes(q) ||
        a.jabatan.toLowerCase().includes(q) ||
        kat.toLowerCase().includes(q) ||
        a.unitKerja.toLowerCase().includes(q);
      return matchKategori && matchStatus && matchSearch;
    });
  }, [anggota, search, statusFilter, kategoriFilter]);

  const openAddModal = () => {
    const nextNum = anggota.length + 1;
    setEditingMember(null);
    setFormState({
      ...EMPTY_FORM,
      nomorInduk: `BDK-P/${String(nextNum).padStart(3, '0')}`,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member: Anggota) => {
    const kat = resolveKategoriKeanggotaan(member.jabatan, member.kategoriKeanggotaan);
    setEditingMember(member);
    setFormState({
      nomorInduk: member.nomorInduk,
      nama: member.nama,
      kategoriKeanggotaan: kat,
      jabatan: member.jabatan,
      unitKerja: member.unitKerja,
      telepon: member.telepon,
      alamat: member.alamat,
      status: member.status,
      tanggalBergabung: member.tanggalBergabung,
      iuranWajibBulanan: member.iuranWajibBulanan,
      skemaIuran: member.skemaIuran || 'Bulanan',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    onCloseExternalAdd?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.nama.trim()) return;
    if (editingMember) {
      onUpdate({ ...formState, id: editingMember.id });
    } else {
      const nextNum = anggota.length + 1;
      onAdd({
        ...formState,
        nomorInduk:
          formState.nomorInduk.trim() || `BDK-P/${String(nextNum).padStart(3, '0')}`,
      });
    }
    closeModal();
  };

  const handleQuickStatusChange = (member: Anggota, nextStatus: StatusKeaktifan) => {
    onUpdate({ ...member, status: nextStatus });
  };

  const handleExportCsv = () => {
    exportToCsv(
      'data-anggota-pengempon-pura-bdk-denpasar.csv',
      [
        'No. Induk',
        'Nama Lengkap',
        'Unsur Keanggotaan',
        'Jabatan / Seksi',
        'Unit Kerja BDK',
        'Telepon',
        'Alamat',
        'Status Keaktifan',
        'Iuran Bulanan (Rp)',
        'Skema Bayar',
        'Tanggal Bergabung',
      ],
      filteredAnggota.map((a) => [
        a.nomorInduk,
        a.nama,
        resolveKategoriKeanggotaan(a.jabatan, a.kategoriKeanggotaan),
        a.jabatan,
        a.unitKerja,
        a.telepon,
        a.alamat,
        a.status,
        a.iuranWajibBulanan,
        a.skemaIuran === 'Tahunan' ? 'Sekali Setahun (12 Bln)' : 'Bulanan',
        a.tanggalBergabung,
      ])
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Action & Filter Toolbar */}
      <div className="flex flex-col gap-4 rounded-xl border border-[#DDE3DE] bg-white p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#FAF6EA] border border-[#E8DEC3] p-1">
              {(
                [
                  { id: 'Semua', label: `Semua Unsur (${counts.semua})` },
                  { id: 'Pembina', label: `Pembina (${counts.pembina})` },
                  { id: 'Pengurus', label: `Pengurus (${counts.pengurus})` },
                  { id: 'Anggota', label: `Anggota (${counts.anggotaBiasa})` },
                ] as const
              ).map((tab) => {
                const active = kategoriFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setKategoriFilter(tab.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-[#0D6B48] text-white shadow-xs'
                        : 'text-[#526358] hover:text-[#142019]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-[#F1F4F1] p-1">
              {(['Semua', 'Aktif', 'Cuti', 'Nonaktif'] as const).map((tab) => {
                const count =
                  tab === 'Semua'
                    ? counts.semua
                    : tab === 'Aktif'
                    ? counts.aktif
                    : tab === 'Cuti'
                    ? counts.cuti
                    : counts.nonaktif;
                const active = statusFilter === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStatusFilter(tab)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-white text-[#142019] shadow-xs'
                        : 'text-[#526358] hover:text-[#142019]'
                    }`}
                  >
                    {tab} ({count})
                  </button>
                );
              })}
            </div>
          </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-72 sm:flex-initial">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7B70]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, NIP/KTA, pembina, pengurus..."
              className="w-full rounded-lg border border-[#D4DDD6] bg-white py-2 pl-9 pr-3 text-xs text-[#142019] placeholder:text-[#7D8C82] focus:border-[#158057] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DDD6] bg-white px-3.5 py-2 text-xs font-medium text-[#142019] transition-colors hover:bg-[#F4F6F4] whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5 text-[#158057]" />
            Ekspor CSV
          </button>
          {canManage && (
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#158057] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#0F6E4A] whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Anggota
            </button>
          )}
        </div>
        </div>
      </div>

      {!canManage && (
        <div className="rounded-xl border border-[#DDE3DE] bg-white px-5 py-3 text-xs text-[#435349]">
          Anda masuk sebagai <strong className="text-[#142019]">Pengempon (Hanya Lihat)</strong>. Penambahan, pembaruan, atau penghapusan data anggota hanya dapat dilakukan oleh Pengurus Pura.
        </div>
      )}

      {/* Members Data Table */}
      <div className="rounded-xl border border-[#DDE3DE] bg-white">
        <div className="flex items-center justify-between border-b border-[#E9EEEA] px-6 py-4">
          <div>
            <h2 className="font-display text-base font-semibold text-[#142019]">
              Buku Induk Data Anggota & Pengempon Pura BDK Denpasar
            </h2>
            <p className="text-xs text-[#59695E]">
              Menampilkan {filteredAnggota.length} dari {anggota.length} anggota terdaftar · Dapat
              ditambah, dikurangi, atau diperbarui sewaktu-waktu
            </p>
          </div>
        </div>

        {filteredAnggota.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-[#142019]">
              Tidak ada anggota yang sesuai dengan filter pencarian.
            </p>
            <p className="mt-1 text-xs text-[#59695E]">
              Coba ubah kata kunci pencarian atau filter status.
            </p>
            {canManage && (
              <button
                type="button"
                onClick={openAddModal}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#158057] px-4 py-2 text-xs font-medium text-white hover:bg-[#0F6E4A]"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Anggota Baru
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E9EEEA] text-[#59695E]">
                  <th className="px-5 py-3 font-medium">No</th>
                  <th className="px-4 py-3 font-medium">No. Induk</th>
                  <th className="px-4 py-3 font-medium">Nama Lengkap & Alamat</th>
                  <th className="px-4 py-3 font-medium">Unsur & Jabatan / Seksi</th>
                  <th className="px-4 py-3 font-medium">Unit Kerja BDK</th>
                  <th className="px-4 py-3 font-medium">No. Telepon</th>
                  <th className="px-4 py-3 font-medium">Status Keaktifan</th>
                  <th className="px-4 py-3 text-right font-medium">Iuran Wajib</th>
                  {canManage && <th className="px-5 py-3 text-right font-medium">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F3F0]">
                {filteredAnggota.map((member, index) => {
                  const kategori = resolveKategoriKeanggotaan(
                    member.jabatan,
                    member.kategoriKeanggotaan
                  );
                  return (
                  <tr key={member.id} className="hover:bg-[#F9FAF9]">
                    <td className="px-5 py-3 font-mono text-[#6B7B70] tabular-nums">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 font-mono text-[#526358] tabular-nums whitespace-nowrap">
                      {member.nomorInduk}
                    </td>
                    <td className="px-4 py-3 min-w-[220px]">
                      <p className="font-medium text-[#142019]">{member.nama}</p>
                      <p className="text-[11px] text-[#59695E] truncate max-w-[260px]">
                        {member.alamat || '-'} · Gabung {formatTanggalIndo(member.tanggalBergabung)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[#34443A] whitespace-nowrap">
                      <span
                        className={`mr-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          kategori === 'Pembina'
                            ? 'bg-[#FEF3C7] text-[#92400E]'
                            : kategori === 'Pengurus'
                            ? 'bg-[#ECFDF5] text-[#0D6B48]'
                            : 'bg-[#F1F5F9] text-[#475569]'
                        }`}
                      >
                        {kategori}
                      </span>
                      <span>{member.jabatan}</span>
                    </td>
                    <td className="px-4 py-3 text-[#59695E] whitespace-nowrap">
                      {member.unitKerja}
                    </td>
                    <td className="px-4 py-3 font-mono text-[#526358] tabular-nums whitespace-nowrap">
                      {member.telepon}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {member.status === 'Aktif' ? (
                          <UserCheck className="h-3.5 w-3.5 text-[#15803D]" />
                        ) : member.status === 'Cuti' ? (
                          <UserMinus className="h-3.5 w-3.5 text-[#B45309]" />
                        ) : (
                          <UserX className="h-3.5 w-3.5 text-[#64748B]" />
                        )}
                        {canManage ? (
                          <select
                            aria-label={`Ubah status ${member.nama}`}
                            value={member.status}
                            onChange={(e) =>
                              handleQuickStatusChange(member, e.target.value as StatusKeaktifan)
                            }
                            className={`bg-transparent text-xs font-medium focus:outline-none cursor-pointer ${
                              member.status === 'Aktif'
                                ? 'text-[#15803D]'
                                : member.status === 'Cuti'
                                ? 'text-[#B45309]'
                                : 'text-[#64748B]'
                            }`}
                          >
                            <option value="Aktif">Aktif</option>
                            <option value="Cuti">Cuti</option>
                            <option value="Nonaktif">Nonaktif</option>
                          </select>
                        ) : (
                          <span
                            className={`text-xs font-medium ${
                              member.status === 'Aktif'
                                ? 'text-[#15803D]'
                                : member.status === 'Cuti'
                                ? 'text-[#B45309]'
                                : 'text-[#64748B]'
                            }`}
                          >
                            {member.status}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[#142019] tabular-nums whitespace-nowrap">
                      <p className="font-semibold">
                        {formatRupiah(member.iuranWajibBulanan)}
                        <span className="font-sans text-[10px] font-normal text-[#59695E]">/bln</span>
                      </p>
                      <p
                        className={`font-sans text-[10px] font-medium ${
                          member.skemaIuran === 'Tahunan'
                            ? 'text-[#B45309]'
                            : 'text-[#59695E]'
                        }`}
                      >
                        {member.skemaIuran === 'Tahunan'
                          ? `Sekali Setahun (${formatRupiah(member.iuranWajibBulanan * 12)})`
                          : 'Bayar Bulanan'}
                      </p>
                    </td>
                    {canManage && (
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(member)}
                            className="rounded-md p-1.5 text-[#435349] transition-colors hover:bg-[#E9EEEA] hover:text-[#158057]"
                            title="Edit Data Anggota"
                            aria-label={`Edit ${member.nama}`}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(member)}
                            className="rounded-md p-1.5 text-[#6B7B70] transition-colors hover:bg-red-50 hover:text-red-700"
                            title="Hapus Anggota"
                            aria-label={`Hapus ${member.nama}`}
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
        )}
      </div>

      {/* Add / Edit Member Modal */}
      {effectiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#DDE3DE] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E9EEEA] px-6 py-4">
              <h3 className="font-display text-base font-semibold text-[#142019]">
                {editingMember ? 'Perbarui Data Anggota Pengempon' : 'Tambah Anggota Pengempon Baru'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md p-1 text-[#59695E] hover:bg-[#F4F6F4]"
                aria-label="Tutup modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">No. Induk / KTA</label>
                  <input
                    type="text"
                    required
                    value={formState.nomorInduk || `BDK-P/${String(anggota.length + 1).padStart(3, '0')}`}
                    onChange={(e) => setFormState({ ...formState, nomorInduk: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs text-[#142019] focus:border-[#158057] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Status Keaktifan</label>
                  <select
                    value={formState.status}
                    onChange={(e) =>
                      setFormState({ ...formState, status: e.target.value as StatusKeaktifan })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs text-[#142019] focus:border-[#158057] focus:outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Unsur Keanggotaan Pura <span className="text-[#DC2626]">*</span>
                </label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(['Pembina', 'Pengurus', 'Anggota'] as const).map((kat) => {
                    const selected =
                      (formState.kategoriKeanggotaan || 'Anggota') === kat;
                    return (
                      <button
                        key={kat}
                        type="button"
                        onClick={() => {
                          const isGenericJabatan =
                            !formState.jabatan.trim() ||
                            Object.values(KATEGORI_DEFAULT_JABATAN).includes(formState.jabatan);
                          setFormState({
                            ...formState,
                            kategoriKeanggotaan: kat,
                            jabatan: isGenericJabatan
                              ? KATEGORI_DEFAULT_JABATAN[kat]
                              : formState.jabatan,
                          });
                        }}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                          selected
                            ? kat === 'Pembina'
                              ? 'border-[#D97706] bg-[#FEF3C7] text-[#92400E]'
                              : kat === 'Pengurus'
                              ? 'border-[#0D6B48] bg-[#ECFDF5] text-[#0D6B48]'
                              : 'border-[#334155] bg-[#F1F5F9] text-[#1E293B]'
                            : 'border-[#D4DDD6] bg-white text-[#59695E] hover:bg-[#F9FAF9]'
                        }`}
                      >
                        {kat}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1 text-[11px] text-[#59695E]">
                  Pembina & Anggota berstatus akses lihat; Pengurus memiliki hak kelola penuh.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Nama Lengkap (beserta gelar jika ada)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: I Made Sudira, S.Pd."
                  value={formState.nama}
                  onChange={(e) => setFormState({ ...formState, nama: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs text-[#142019] focus:border-[#158057] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">
                    Jabatan / Seksi di Pura
                  </label>
                  <input
                    type="text"
                    required
                    list="jabatan-pura-suggestions"
                    value={formState.jabatan}
                    onChange={(e) => setFormState({ ...formState, jabatan: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs text-[#142019] focus:border-[#158057] focus:outline-none"
                  />
                  <datalist id="jabatan-pura-suggestions">
                    <option value="Pembina / Penasihat Pura" />
                    <option value="Pembina Utama" />
                    <option value="Ketua Pengempon" />
                    <option value="Wakil Ketua" />
                    <option value="Sekretaris I" />
                    <option value="Bendahara I" />
                    <option value="Koordinator Seksi Banten" />
                    <option value="Koordinator Seksi Perlengkapan" />
                    <option value="Anggota Pengempon" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Unit Kerja BDK</label>
                  <input
                    type="text"
                    required
                    value={formState.unitKerja}
                    onChange={(e) => setFormState({ ...formState, unitKerja: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs text-[#142019] focus:border-[#158057] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">No. Telepon / WA</label>
                  <input
                    type="text"
                    required
                    placeholder="0812-xxxx-xxxx"
                    value={formState.telepon}
                    onChange={(e) => setFormState({ ...formState, telepon: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs text-[#142019] focus:border-[#158057] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">
                    Tarif Iuran Wajib / Bulan (Rp)
                  </label>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {tarifOpsi.map((tarif) => (
                      <button
                        key={tarif}
                        type="button"
                        onClick={() =>
                          setFormState({ ...formState, iuranWajibBulanan: tarif })
                        }
                        className={`rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${
                          formState.iuranWajibBulanan === tarif
                            ? 'border-[#0D6B48] bg-[#ECFDF5] text-[#0D6B48]'
                            : 'border-[#D4DDD6] bg-white text-[#59695E] hover:bg-[#F9FAF9]'
                        }`}
                      >
                        {formatRupiah(tarif)}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    required
                    value={formState.iuranWajibBulanan}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        iuranWajibBulanan: Number(e.target.value) || 0,
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs text-[#142019] focus:border-[#164A34] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Frekuensi / Skema Pembayaran Iuran
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {(
                    [
                      {
                        id: 'Bulanan' as SkemaIuran,
                        title: 'Bulanan',
                        sub: `${formatRupiah(formState.iuranWajibBulanan)} / bulan`,
                      },
                      {
                        id: 'Tahunan' as SkemaIuran,
                        title: 'Sekali Setahun (12 Bln)',
                        sub: `${formatRupiah(formState.iuranWajibBulanan * 12)} / tahun`,
                      },
                    ] as const
                  ).map((opt) => {
                    const active = (formState.skemaIuran || 'Bulanan') === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormState({ ...formState, skemaIuran: opt.id })}
                        className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                          active
                            ? 'border-[#0D6B48] bg-[#ECFDF5] text-[#0D6B48]'
                            : 'border-[#D4DDD6] bg-white text-[#435349] hover:bg-[#F9FAF9]'
                        }`}
                      >
                        <p className="text-xs font-semibold">{opt.title}</p>
                        <p className="font-mono text-[11px] opacity-85">{opt.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">Alamat Domisili</label>
                <input
                  type="text"
                  placeholder="Jl. ... Denpasar"
                  value={formState.alamat}
                  onChange={(e) => setFormState({ ...formState, alamat: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs text-[#142019] focus:border-[#164A34] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[#E9EEEA] pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-[#D4DDD6] bg-white px-4 py-2 text-xs font-medium text-[#34443A] hover:bg-[#F4F6F4]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#164A34] px-4 py-2 text-xs font-medium text-white hover:bg-[#0F6E4A]"
                >
                  {editingMember ? 'Simpan Perubahan' : 'Tambahkan Anggota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#DDE3DE] bg-white p-6 shadow-xl">
            <h3 className="font-display text-base font-semibold text-[#142019]">
              Konfirmasi Hapus Anggota
            </h3>
            <p className="mt-2 text-xs text-[#435349] leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong className="text-[#142019]">{deleteTarget.nama}</strong>{' '}
              ({deleteTarget.nomorInduk}) dari daftar anggota pengempon? Riwayat transaksi keuangan
              yang sudah dicatat tetap tersimpan untuk keperluan audit kas.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-[#D4DDD6] bg-white px-4 py-2 text-xs font-medium text-[#34443A] hover:bg-[#F4F6F4]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="rounded-lg bg-red-700 px-4 py-2 text-xs font-medium text-white hover:bg-red-800"
              >
                Hapus Anggota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
