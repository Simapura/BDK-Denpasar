import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Edit3,
  Info,
  MapPin,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { JadwalPiodalan, StatusPiodalan } from '../types/pura';
import { formatRupiah, formatTanggalLengkap } from '../utils/format';

interface PiodalanViewProps {
  piodalan: JadwalPiodalan[];
  onAdd: (item: Omit<JadwalPiodalan, 'id'>) => void;
  onUpdate: (item: JadwalPiodalan) => void;
  onDelete: (id: string) => void;
  canManage: boolean;
  externalAddOpen?: boolean;
  onCloseExternalAdd?: () => void;
}

const EMPTY_PIODALAN: Omit<JadwalPiodalan, 'id'> = {
  namaPiodalan: '',
  jenisPiodalan: 'Piodalan Rutin (Purnama)',
  hariWaktu: '',
  tanggalMasehi: '2026-12-18',
  pelinggihUtama: 'Padmasana & Pelinggih Utama',
  rincianBanten: ['Banten Pejati Lengkap', 'Canang Sari & Segehan'],
  penanggungJawab: 'Seksi Banten Pura BDK',
  halTerkait: '',
  estimasiBiaya: 1500000,
  status: 'Mendatang',
};

export function PiodalanView({
  piodalan,
  onAdd,
  onUpdate,
  onDelete,
  canManage,
  externalAddOpen,
  onCloseExternalAdd,
}: PiodalanViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Aktif' | 'Selesai'>('Semua');
  const [selectedId, setSelectedId] = useState<string>(piodalan[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JadwalPiodalan | null>(null);
  const [formState, setFormState] = useState<Omit<JadwalPiodalan, 'id'>>(EMPTY_PIODALAN);
  const [bantenText, setBantenText] = useState('');

  const effectiveModalOpen = canManage && (isModalOpen || Boolean(externalAddOpen));

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...piodalan]
      .sort((a, b) => a.tanggalMasehi.localeCompare(b.tanggalMasehi))
      .filter((p) => {
        const matchStatus =
          statusFilter === 'Semua' ||
          (statusFilter === 'Selesai' ? p.status === 'Selesai' : p.status !== 'Selesai');
        const matchQuery =
          !q ||
          p.namaPiodalan.toLowerCase().includes(q) ||
          p.jenisPiodalan.toLowerCase().includes(q) ||
          p.rincianBanten.some((b) => b.toLowerCase().includes(q));
        return matchStatus && matchQuery;
      });
  }, [piodalan, search, statusFilter]);

  const activeItem =
    filteredList.find((p) => p.id === selectedId) || filteredList[0] || piodalan[0];

  const openAdd = () => {
    setEditingItem(null);
    setFormState(EMPTY_PIODALAN);
    setBantenText(EMPTY_PIODALAN.rincianBanten.join('\n'));
    setIsModalOpen(true);
  };

  const openEdit = (item: JadwalPiodalan) => {
    setEditingItem(item);
    setFormState({
      namaPiodalan: item.namaPiodalan,
      jenisPiodalan: item.jenisPiodalan,
      hariWaktu: item.hariWaktu,
      tanggalMasehi: item.tanggalMasehi,
      pelinggihUtama: item.pelinggihUtama,
      rincianBanten: item.rincianBanten,
      penanggungJawab: item.penanggungJawab,
      halTerkait: item.halTerkait,
      estimasiBiaya: item.estimasiBiaya,
      status: item.status,
    });
    setBantenText(item.rincianBanten.join('\n'));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    onCloseExternalAdd?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBanten = bantenText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const payload: Omit<JadwalPiodalan, 'id'> = {
      ...formState,
      rincianBanten: parsedBanten.length > 0 ? parsedBanten : ['Banten Pejati'],
    };
    if (editingItem) {
      onUpdate({ ...payload, id: editingItem.id });
    } else {
      onAdd(payload);
    }
    closeModal();
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 rounded-xl border border-[#DDE3DE] bg-white p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-1 rounded-lg bg-[#F1F4F1] p-1 self-start">
          {(['Semua', 'Aktif', 'Selesai'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-white text-[#142019] shadow-xs'
                  : 'text-[#526358] hover:text-[#142019]'
              }`}
            >
              {tab === 'Aktif' ? 'Mendatang & Persiapan' : tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64 sm:flex-initial">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7B70]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari jenis piodalan atau banten..."
              className="w-full rounded-lg border border-[#D4DDD6] bg-white py-2 pl-9 pr-3 text-xs text-[#142019] focus:border-[#158057] focus:outline-none"
            />
          </div>
          {canManage && (
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#158057] px-4 py-2 text-xs font-medium text-white hover:bg-[#0F6E4A] whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Jadwal Piodalan
            </button>
          )}
        </div>
      </div>

      {/* Main Split: Table of Piodalan + Detail Rincian Banten */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
        {/* Piodalan Table */}
        <div className="rounded-xl border border-[#DDE3DE] bg-white xl:col-span-7">
          <div className="border-b border-[#E9EEEA] px-6 py-4">
            <h2 className="font-display text-base font-semibold text-[#142019]">
              Daftar Jadwal, Jenis Piodalan & Rincian Banten
            </h2>
            <p className="text-xs text-[#59695E]">
              Klik baris upacara untuk meninjau daftar lengkap sarana banten dan ketentuan teknis
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E9EEEA] text-[#59695E]">
                  <th className="px-5 py-3 font-medium">Nama & Jenis Piodalan</th>
                  <th className="px-4 py-3 font-medium">Hari / Waktu</th>
                  <th className="px-4 py-3 font-medium">Ringkasan Banten</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  {canManage && <th className="px-5 py-3 text-right font-medium">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F3F0]">
                {filteredList.map((item) => {
                  const isSelected = activeItem?.id === item.id;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#EEF4F0]' : 'hover:bg-[#F9FAF9]'
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-[#142019]">{item.namaPiodalan}</p>
                        <p className="text-[11px] text-[#59695E]">{item.jenisPiodalan}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-mono font-medium text-[#142019] tabular-nums whitespace-nowrap">
                          {item.tanggalMasehi}
                        </p>
                        <p className="text-[11px] text-[#59695E]">{item.hariWaktu}</p>
                      </td>
                      <td className="px-4 py-3.5 text-[#34443A]">
                        <p className="line-clamp-2 max-w-[220px]">
                          {item.rincianBanten.slice(0, 2).join(', ')}
                          {item.rincianBanten.length > 2
                            ? ` (+${item.rincianBanten.length - 2} jenis lainnya)`
                            : ''}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`font-medium ${
                            item.status === 'Persiapan'
                              ? 'text-[#B45309]'
                              : item.status === 'Mendatang'
                              ? 'text-[#158057]'
                              : 'text-[#64748B]'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      {canManage && (
                        <td
                          className="px-5 py-3.5 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              className="rounded-md p-1.5 text-[#435349] hover:bg-[#E2EBE5] hover:text-[#158057]"
                              aria-label={`Edit ${item.namaPiodalan}`}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(item.id)}
                              className="rounded-md p-1.5 text-[#6B7B70] hover:bg-red-50 hover:text-red-700"
                              aria-label={`Hapus ${item.namaPiodalan}`}
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
        </div>

        {/* Right Detail Inspector: Rincian Banten & Hal Terkait */}
        <div className="rounded-xl border border-[#DDE3DE] bg-white xl:col-span-5">
          {activeItem ? (
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-[#E9EEEA] pb-4">
                <div>
                  <p className="text-xs font-medium text-[#9A7422]">
                    {activeItem.jenisPiodalan} · {activeItem.status}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold text-[#142019]">
                    {activeItem.namaPiodalan}
                  </h3>
                </div>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => openEdit(activeItem)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#D4DDD6] px-3 py-1.5 text-xs font-medium text-[#142019] hover:bg-[#F4F6F4] shrink-0"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Ubah
                  </button>
                )}
              </div>

              <dl className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <Calendar className="mt-0.5 h-4 w-4 text-[#158057] shrink-0" />
                  <div>
                    <dt className="text-[#59695E]">Tanggal & Waktu Pelaksanaan</dt>
                    <dd className="font-medium text-[#142019]">
                      {formatTanggalLengkap(activeItem.tanggalMasehi)}
                    </dd>
                    <dd className="text-[#435349]">{activeItem.hariWaktu}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 text-[#158057] shrink-0" />
                  <div>
                    <dt className="text-[#59695E]">Pelinggih / Area Upacara</dt>
                    <dd className="font-medium text-[#142019]">{activeItem.pelinggihUtama}</dd>
                  </div>
                </div>
              </dl>

              <div className="border-t border-[#E9EEEA] pt-4">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold text-[#142019]">
                  <ClipboardList className="h-4 w-4 text-[#158057]" />
                  Rincian Sarana Banten yang Diperlukan
                </h4>
                <ul className="mt-3 space-y-2">
                  {activeItem.rincianBanten.map((banten, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-[#2B3A31]"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-[#158057] shrink-0" />
                      <span>{banten}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-[#E9EEEA] pt-4">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold text-[#142019]">
                  <Info className="h-4 w-4 text-[#9A7422]" />
                  Hal-Hal Terkait & Ketentuan Pengempon
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-[#435349]">
                  {activeItem.halTerkait || 'Tidak ada catatan tambahan.'}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#F0F3F0] pt-3 text-xs">
                  <span className="text-[#59695E]">
                    PJ: <strong className="text-[#142019]">{activeItem.penanggungJawab}</strong>
                  </span>
                  <span className="font-mono font-semibold text-[#158057] tabular-nums">
                    Anggaran: {formatRupiah(activeItem.estimasiBiaya)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#59695E]">
              Pilih jadwal piodalan untuk melihat detail rincian banten.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {effectiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[#DDE3DE] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E9EEEA] px-6 py-4">
              <h3 className="font-display text-base font-semibold text-[#142019]">
                {editingItem ? 'Perbarui Jadwal Piodalan' : 'Tambah Jadwal Piodalan Baru'}
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
                  <label className="block text-xs font-medium text-[#34443A]">Nama Piodalan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Piodalan Purnama Kapitu"
                    value={formState.namaPiodalan}
                    onChange={(e) => setFormState({ ...formState, namaPiodalan: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#158057] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Jenis Piodalan</label>
                  <input
                    type="text"
                    required
                    value={formState.jenisPiodalan}
                    onChange={(e) => setFormState({ ...formState, jenisPiodalan: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#158057] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Tanggal Masehi</label>
                  <input
                    type="date"
                    required
                    value={formState.tanggalMasehi}
                    onChange={(e) => setFormState({ ...formState, tanggalMasehi: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#158057] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#34443A]">
                    Hari (Wuku/Sasih) & Jam Pelaksanaan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Redite Pon, Sasih Kapitu · 08.00 WITA"
                    value={formState.hariWaktu}
                    onChange={(e) => setFormState({ ...formState, hariWaktu: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#158057] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Pelinggih Utama</label>
                  <input
                    type="text"
                    required
                    value={formState.pelinggihUtama}
                    onChange={(e) => setFormState({ ...formState, pelinggihUtama: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#158057] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Status Pelaksanaan</label>
                  <select
                    value={formState.status}
                    onChange={(e) =>
                      setFormState({ ...formState, status: e.target.value as StatusPiodalan })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#158057] focus:outline-none"
                  >
                    <option value="Persiapan">Persiapan</option>
                    <option value="Mendatang">Mendatang</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Rincian Banten (tulis 1 jenis banten per baris)
                </label>
                <textarea
                  rows={4}
                  required
                  value={bantenText}
                  onChange={(e) => setBantenText(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs leading-relaxed focus:border-[#164A34] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Penanggung Jawab</label>
                  <input
                    type="text"
                    required
                    value={formState.penanggungJawab}
                    onChange={(e) =>
                      setFormState({ ...formState, penanggungJawab: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#164A34] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">
                    Estimasi Anggaran Banten (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    required
                    value={formState.estimasiBiaya}
                    onChange={(e) =>
                      setFormState({ ...formState, estimasiBiaya: Number(e.target.value) || 0 })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#164A34] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Hal-Hal Terkait & Ketentuan Busana / Ayahan
                </label>
                <textarea
                  rows={2}
                  value={formState.halTerkait}
                  onChange={(e) => setFormState({ ...formState, halTerkait: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#164A34] focus:outline-none"
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
                  className="rounded-lg bg-[#164A34] px-4 py-2 text-xs font-medium text-white hover:bg-[#113828]"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
