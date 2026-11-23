import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Download,
  Edit3,
  PauseCircle,
  Plus,
  Printer,
  Search,
  Target,
  Trash2,
  User,
  Wallet,
  X,
} from 'lucide-react';
import {
  Anggota,
  BidangRencanaKerja,
  PrioritasRencanaKerja,
  RencanaKerjaItem,
  StatusRencanaKerja,
} from '../types/pura';
import { exportToCsv, formatRupiah, formatTanggalIndo } from '../utils/format';

interface RencanaKerjaViewProps {
  rencanaKerja: RencanaKerjaItem[];
  anggota: Anggota[];
  canManage: boolean;
  onAdd: (item: Omit<RencanaKerjaItem, 'id'>) => void;
  onUpdate: (item: RencanaKerjaItem) => void;
  onDelete: (id: string) => void;
  externalAddOpen?: boolean;
  onCloseExternalAdd?: () => void;
}

const BIDANG_LIST: BidangRencanaKerja[] = [
  'Upakara & Piodalan',
  'Pemeliharaan & Pembangunan',
  'Perlengkapan & Kebersihan',
  'Keuangan & Iuran',
  'Sosial & Kemanusiaan',
  'Pendidikan Dharma',
];

const STATUS_LIST: StatusRencanaKerja[] = [
  'Direncanakan',
  'Berjalan',
  'Selesai',
  'Ditunda',
];

const PRIORITAS_LIST: PrioritasRencanaKerja[] = ['Tinggi', 'Sedang', 'Rutin'];

const EMPTY_FORM: Omit<RencanaKerjaItem, 'id'> = {
  kodeProgram: '',
  namaProgram: '',
  bidang: 'Upakara & Piodalan',
  periode: 'Triwulan IV 2026',
  targetTanggal: '2026-12-15',
  penanggungJawab: 'I Wayan Arya Adnyana',
  estimasiAnggaran: 500000,
  sumberDana: 'Kas Iuran Pengempon',
  prioritas: 'Sedang',
  status: 'Direncanakan',
  progresPersen: 0,
  uraianTujuan: '',
  indikatorKeberhasilan: '',
  catatanRealisasi: '',
};

export function RencanaKerjaView({
  rencanaKerja,
  anggota,
  canManage,
  onAdd,
  onUpdate,
  onDelete,
  externalAddOpen,
  onCloseExternalAdd,
}: RencanaKerjaViewProps) {
  const [statusFilter, setStatusFilter] = useState<'Semua' | StatusRencanaKerja>('Semua');
  const [bidangFilter, setBidangFilter] = useState<'Semua' | BidangRencanaKerja>('Semua');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RencanaKerjaItem | null>(null);
  const [form, setForm] = useState<Omit<RencanaKerjaItem, 'id'>>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<RencanaKerjaItem | null>(null);

  const effectiveModalOpen = canManage && (modalOpen || Boolean(externalAddOpen));

  const stats = useMemo(() => {
    const total = rencanaKerja.length;
    const selesai = rencanaKerja.filter((r) => r.status === 'Selesai').length;
    const berjalan = rencanaKerja.filter((r) => r.status === 'Berjalan').length;
    const direncanakan = rencanaKerja.filter((r) => r.status === 'Direncanakan').length;
    const totalAnggaran = rencanaKerja.reduce((acc, r) => acc + (r.estimasiAnggaran || 0), 0);
    const avgProgres =
      total > 0
        ? Math.round(rencanaKerja.reduce((acc, r) => acc + r.progresPersen, 0) / total)
        : 0;
    return { total, selesai, berjalan, direncanakan, totalAnggaran, avgProgres };
  }, [rencanaKerja]);

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...rencanaKerja]
      .sort((a, b) => a.targetTanggal.localeCompare(b.targetTanggal))
      .filter((item) => {
        const matchStatus = statusFilter === 'Semua' || item.status === statusFilter;
        const matchBidang = bidangFilter === 'Semua' || item.bidang === bidangFilter;
        const matchQ =
          !q ||
          item.kodeProgram.toLowerCase().includes(q) ||
          item.namaProgram.toLowerCase().includes(q) ||
          item.bidang.toLowerCase().includes(q) ||
          item.penanggungJawab.toLowerCase().includes(q) ||
          item.periode.toLowerCase().includes(q) ||
          item.uraianTujuan.toLowerCase().includes(q);
        return matchStatus && matchBidang && matchQ;
      });
  }, [rencanaKerja, statusFilter, bidangFilter, search]);

  const openAdd = () => {
    const nextIdx = rencanaKerja.length + 1;
    setEditingItem(null);
    setForm({
      ...EMPTY_FORM,
      kodeProgram: `RK-2026-${String(nextIdx).padStart(2, '0')}`,
    });
    setModalOpen(true);
  };

  const openEdit = (item: RencanaKerjaItem) => {
    setEditingItem(item);
    setForm({
      kodeProgram: item.kodeProgram,
      namaProgram: item.namaProgram,
      bidang: item.bidang,
      periode: item.periode,
      targetTanggal: item.targetTanggal,
      penanggungJawab: item.penanggungJawab,
      estimasiAnggaran: item.estimasiAnggaran,
      sumberDana: item.sumberDana,
      prioritas: item.prioritas,
      status: item.status,
      progresPersen: item.progresPersen,
      uraianTujuan: item.uraianTujuan,
      indikatorKeberhasilan: item.indikatorKeberhasilan,
      catatanRealisasi: item.catatanRealisasi || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    onCloseExternalAdd?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.namaProgram.trim()) return;

    const normalizedProgres =
      form.status === 'Selesai'
        ? 100
        : Math.max(0, Math.min(100, Number(form.progresPersen) || 0));

    const payload: Omit<RencanaKerjaItem, 'id'> = {
      ...form,
      kodeProgram:
        form.kodeProgram.trim() || `RK-2026-${String(rencanaKerja.length + 1).padStart(2, '0')}`,
      namaProgram: form.namaProgram.trim(),
      periode: form.periode.trim() || 'Tahun 2026/2027',
      penanggungJawab: form.penanggungJawab.trim() || 'Pengurus Pura',
      sumberDana: form.sumberDana.trim() || 'Kas Pura',
      progresPersen: normalizedProgres,
      uraianTujuan: form.uraianTujuan.trim(),
      indikatorKeberhasilan: form.indikatorKeberhasilan.trim(),
      catatanRealisasi: form.catatanRealisasi?.trim() || undefined,
    };

    if (editingItem) {
      onUpdate({ ...payload, id: editingItem.id });
    } else {
      onAdd(payload);
    }
    closeModal();
  };

  const handleQuickStatusChange = (item: RencanaKerjaItem, nextStatus: StatusRencanaKerja) => {
    onUpdate({
      ...item,
      status: nextStatus,
      progresPersen: nextStatus === 'Selesai' ? 100 : item.progresPersen,
    });
  };

  const handleExportCsv = () => {
    exportToCsv(
      'rencana-kerja-pura-bdk-denpasar.csv',
      [
        'Kode',
        'Nama Program Kerja',
        'Bidang',
        'Periode',
        'Target Tanggal',
        'Penanggung Jawab',
        'Prioritas',
        'Status',
        'Progres (%)',
        'Estimasi Anggaran (Rp)',
        'Sumber Dana',
        'Indikator Keberhasilan',
      ],
      filteredList.map((r) => [
        r.kodeProgram,
        r.namaProgram,
        r.bidang,
        r.periode,
        r.targetTanggal,
        r.penanggungJawab,
        r.prioritas,
        r.status,
        r.progresPersen,
        r.estimasiAnggaran,
        r.sumberDana,
        r.indikatorKeberhasilan,
      ])
    );
  };

  const getStatusStyle = (status: StatusRencanaKerja) => {
    if (status === 'Selesai') return 'bg-[#ECFDF5] text-[#0D6B48] border-[#0D6B48]/20';
    if (status === 'Berjalan') return 'bg-[#E0F2FE] text-[#0369A1] border-[#0369A1]/20';
    if (status === 'Ditunda') return 'bg-[#FEF2F2] text-[#B91C1C] border-[#B91C1C]/20';
    return 'bg-[#FEF3C7] text-[#92400E] border-[#D97706]/25';
  };

  const getStatusIcon = (status: StatusRencanaKerja) => {
    if (status === 'Selesai') return <CheckCircle2 className="h-3.5 w-3.5" />;
    if (status === 'Berjalan') return <Clock className="h-3.5 w-3.5" />;
    if (status === 'Ditunda') return <PauseCircle className="h-3.5 w-3.5" />;
    return <Target className="h-3.5 w-3.5" />;
  };

  const getPrioritasStyle = (prioritas: PrioritasRencanaKerja) => {
    if (prioritas === 'Tinggi') return 'bg-[#FEE2E2] text-[#991B1B]';
    if (prioritas === 'Sedang') return 'bg-[#FEF3C7] text-[#92400E]';
    return 'bg-[#F1F5F9] text-[#475569]';
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[#DFDBCA] bg-white p-5">
          <p className="text-[11px] font-semibold tracking-wider text-[#526358]">
            TOTAL PROGRAM KERJA
          </p>
          <p className="mt-2 font-serif-title text-2xl font-bold text-[#142019] tabular-nums">
            {stats.total} Program
          </p>
          <p className="mt-1 text-xs text-[#59695E]">
            {stats.direncanakan} direncanakan · {stats.berjalan} berjalan
          </p>
        </div>

        <div className="rounded-xl border border-[#D4E6EA] bg-[#F9FEFF] p-5">
          <p className="text-[11px] font-semibold tracking-wider text-[#375C6B]">
            PROGRAM TERLAKSANA
          </p>
          <p className="mt-2 font-serif-title text-2xl font-bold text-[#0369A1] tabular-nums">
            {stats.selesai} dari {stats.total}
          </p>
          <p className="mt-1 text-xs text-[#375C6B]">
            Rata-rata capaian progres: {stats.avgProgres}%
          </p>
        </div>

        <div className="rounded-xl border border-[#EDE2C9] bg-[#FFFDF8] p-5">
          <p className="text-[11px] font-semibold tracking-wider text-[#7C5B19]">
            ESTIMASI TOTAL ANGGARAN
          </p>
          <p className="mt-2 font-mono text-xl font-bold text-[#B45309] tabular-nums">
            {formatRupiah(stats.totalAnggaran)}
          </p>
          <p className="mt-1 text-xs text-[#7C5B19]">Alokasi rencana program kerja</p>
        </div>

        <div className="rounded-xl border border-[#0D6B48]/20 bg-gradient-to-br from-[#0D6B48] to-[#137953] p-5 text-white">
          <p className="text-[11px] font-semibold tracking-wider text-[#FDE68A]">
            RATA-RATA REALISASI
          </p>
          <p className="mt-2 font-serif-title text-2xl font-bold text-white tabular-nums">
            {stats.avgProgres}%
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-[#F5C556] transition-all duration-300"
              style={{ width: `${stats.avgProgres}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="no-print flex flex-col gap-4 rounded-xl border border-[#DDE3DE] bg-white p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F1F4F1] p-1">
              {(['Semua', ...STATUS_LIST] as const).map((tab) => {
                const active = statusFilter === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStatusFilter(tab)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-white text-[#142019] shadow-xs'
                        : 'text-[#526358] hover:text-[#142019]'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <select
              value={bidangFilter}
              onChange={(e) => setBidangFilter(e.target.value as 'Semua' | BidangRencanaKerja)}
              className="rounded-lg border border-[#D4DDD6] bg-white px-3 py-1.5 text-xs text-[#142019] focus:border-[#0D6B48] focus:outline-none"
            >
              <option value="Semua">Semua Bidang ({rencanaKerja.length})</option>
              {BIDANG_LIST.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-64 sm:flex-initial">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7B70]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari program, kode, PJ..."
                className="w-full rounded-lg border border-[#D4DDD6] bg-white py-2 pl-9 pr-3 text-xs text-[#142019] focus:border-[#0D6B48] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DDD6] bg-white px-3.5 py-2 text-xs font-medium text-[#142019] hover:bg-[#F4F6F4] whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5 text-[#0D6B48]" />
              Ekspor CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DDD6] bg-white px-3.5 py-2 text-xs font-medium text-[#142019] hover:bg-[#F4F6F4] whitespace-nowrap"
            >
              <Printer className="h-3.5 w-3.5 text-[#0D6B48]" />
              Cetak
            </button>
            {canManage && (
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D6B48] px-4 py-2 text-xs font-semibold text-white hover:bg-[#095438] whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Program Kerja
              </button>
            )}
          </div>
        </div>
      </div>

      {!canManage && (
        <div className="rounded-xl border border-[#DDE3DE] bg-white px-5 py-3 text-xs text-[#435349]">
          Anda masuk sebagai <strong className="text-[#142019]">Pengempon (Hanya Lihat)</strong>. Anda dapat memantau seluruh rencana kerja pengurus, jadwal pelaksanaan, estimasi anggaran, dan progres realisasinya secara terbuka.
        </div>
      )}

      {/* Program Kerja Cards */}
      {filteredList.length === 0 ? (
        <div className="rounded-xl border border-[#DDE3DE] bg-white p-10 text-center">
          <p className="text-sm font-semibold text-[#142019]">
            Belum ada program rencana kerja yang sesuai filter.
          </p>
          <p className="mt-1 text-xs text-[#59695E]">
            Coba ubah filter bidang, status, atau kata kunci pencarian.
          </p>
        </div>
      ) : (
        <div className="print-area space-y-4">
          {filteredList.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-[#E2DCC8] bg-white p-5 sm:p-6 shadow-2xs transition-colors hover:border-[#0D6B48]/35"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                {/* Left Info */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[#FAF6EA] border border-[#E8DEC3] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#7C5B19]">
                      {item.kodeProgram}
                    </span>
                    <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-medium text-[#334155]">
                      {item.bidang}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${getPrioritasStyle(
                        item.prioritas
                      )}`}
                    >
                      Prioritas {item.prioritas}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getStatusStyle(
                        item.status
                      )}`}
                    >
                      {getStatusIcon(item.status)}
                      {item.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#142019]">
                      {item.namaProgram}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#435349]">
                      {item.uraianTujuan}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#EFECE2] bg-[#FAF8F1] px-4 py-3 text-xs space-y-1.5">
                    <p className="flex items-start gap-2 text-[#142019]">
                      <ClipboardCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0D6B48]" />
                      <span>
                        <strong>Indikator Keberhasilan:</strong> {item.indikatorKeberhasilan}
                      </span>
                    </p>
                    {item.catatanRealisasi && (
                      <p className="pl-5.5 text-[11px] text-[#59695E]">
                        <strong>Catatan Progres:</strong> {item.catatanRealisasi}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Metadata & Progress */}
                <div className="w-full lg:w-80 shrink-0 rounded-xl border border-[#ECE8DA] bg-[#FCFBF7] p-4 space-y-3 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[#59695E]">
                        <Calendar className="h-3.5 w-3.5 text-[#0D6B48]" />
                        Periode / Target
                      </span>
                      <span className="font-medium text-[#142019] text-right">
                        {item.periode} ({formatTanggalIndo(item.targetTanggal)})
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[#59695E]">
                        <User className="h-3.5 w-3.5 text-[#0D6B48]" />
                        Penanggung Jawab
                      </span>
                      <span className="font-medium text-[#142019] text-right truncate max-w-[175px]">
                        {item.penanggungJawab}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[#59695E]">
                        <Wallet className="h-3.5 w-3.5 text-[#D97706]" />
                        Est. Anggaran
                      </span>
                      <span className="font-mono font-semibold text-[#142019] tabular-nums">
                        {item.estimasiAnggaran > 0 ? formatRupiah(item.estimasiAnggaran) : 'Swadaya'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#59695E] text-right">
                      Sumber: {item.sumberDana}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="border-t border-[#EAE5D3] pt-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-[#59695E]">Progres Pelaksanaan</span>
                      <span className="font-mono text-[#0D6B48] tabular-nums">
                        {item.progresPersen}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#E8E2CF]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.status === 'Selesai'
                            ? 'bg-[#0D6B48]'
                            : item.status === 'Ditunda'
                            ? 'bg-[#DC2626]'
                            : 'bg-gradient-to-r from-[#0D6B48] to-[#E3A924]'
                        }`}
                        style={{ width: `${item.progresPersen}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions for Pengurus */}
                  {canManage && (
                    <div className="no-print flex flex-wrap items-center justify-between gap-2 border-t border-[#EAE5D3] pt-3">
                      <select
                        aria-label={`Ubah status ${item.namaProgram}`}
                        value={item.status}
                        onChange={(e) =>
                          handleQuickStatusChange(item, e.target.value as StatusRencanaKerja)
                        }
                        className="rounded-lg border border-[#D4DDD6] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#142019] focus:border-[#0D6B48] focus:outline-none"
                      >
                        {STATUS_LIST.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#D4DDD6] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#34443A] hover:bg-[#F4F6F4]"
                        >
                          <Edit3 className="h-3 w-3 text-[#0D6B48]" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="rounded-lg p-1.5 text-[#6B7B70] hover:bg-red-50 hover:text-red-700"
                          aria-label={`Hapus ${item.namaProgram}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {effectiveModalOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#DDE3DE] bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#E9EEEA] bg-white px-6 py-4">
              <h3 className="font-display text-base font-semibold text-[#142019]">
                {editingItem ? 'Perbarui Program Rencana Kerja' : 'Tambah Program Rencana Kerja Baru'}
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Kode Program</label>
                  <input
                    type="text"
                    required
                    value={form.kodeProgram}
                    onChange={(e) => setForm({ ...form, kodeProgram: e.target.value })}
                    placeholder="RK-2026-08"
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#34443A]">
                    Bidang Rencana Kerja
                  </label>
                  <select
                    value={form.bidang}
                    onChange={(e) =>
                      setForm({ ...form, bidang: e.target.value as BidangRencanaKerja })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                  >
                    {BIDANG_LIST.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Nama Program / Kegiatan Kerja
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pengecatan & Perawatan Candi Bentar Menjelang Saraswati"
                  value={form.namaProgram}
                  onChange={(e) => setForm({ ...form, namaProgram: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Periode</label>
                  <input
                    type="text"
                    required
                    placeholder="Triwulan I 2027"
                    value={form.periode}
                    onChange={(e) => setForm({ ...form, periode: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Target Tanggal</label>
                  <input
                    type="date"
                    required
                    value={form.targetTanggal}
                    onChange={(e) => setForm({ ...form, targetTanggal: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Prioritas</label>
                  <select
                    value={form.prioritas}
                    onChange={(e) =>
                      setForm({ ...form, prioritas: e.target.value as PrioritasRencanaKerja })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                  >
                    {PRIORITAS_LIST.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">
                    Penanggung Jawab / Koordinator
                  </label>
                  <input
                    type="text"
                    required
                    list="rk-anggota-list"
                    value={form.penanggungJawab}
                    onChange={(e) => setForm({ ...form, penanggungJawab: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                  <datalist id="rk-anggota-list">
                    {anggota.map((a) => (
                      <option key={a.id} value={a.nama} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">
                    Estimasi Anggaran (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    required
                    value={form.estimasiAnggaran}
                    onChange={(e) =>
                      setForm({ ...form, estimasiAnggaran: Number(e.target.value) || 0 })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Sumber Dana</label>
                  <input
                    type="text"
                    required
                    value={form.sumberDana}
                    onChange={(e) => setForm({ ...form, sumberDana: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => {
                      const nextSt = e.target.value as StatusRencanaKerja;
                      setForm({
                        ...form,
                        status: nextSt,
                        progresPersen: nextSt === 'Selesai' ? 100 : form.progresPersen,
                      });
                    }}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                  >
                    {STATUS_LIST.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">
                    Progres ({form.progresPersen}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={form.progresPersen}
                    onChange={(e) =>
                      setForm({ ...form, progresPersen: Number(e.target.value) || 0 })
                    }
                    className="mt-2.5 w-full accent-[#0D6B48]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Uraian Tujuan & Kegiatan
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.uraianTujuan}
                  onChange={(e) => setForm({ ...form, uraianTujuan: e.target.value })}
                  placeholder="Jelaskan maksud, tujuan, dan ruang lingkup kegiatan..."
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs leading-relaxed focus:border-[#0D6B48] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Indikator Keberhasilan / Target Capaian
                </label>
                <input
                  type="text"
                  required
                  value={form.indikatorKeberhasilan}
                  onChange={(e) => setForm({ ...form, indikatorKeberhasilan: e.target.value })}
                  placeholder="Contoh: Kegiatan selesai tepat waktu dengan partisipasi >= 80% anggota"
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Catatan Realisasi / Tindak Lanjut (Opsional)
                </label>
                <input
                  type="text"
                  value={form.catatanRealisasi || ''}
                  onChange={(e) => setForm({ ...form, catatanRealisasi: e.target.value })}
                  placeholder="Perkembangan terbaru pelaksanaan program..."
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
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
                  className="rounded-lg bg-[#0D6B48] px-4 py-2 text-xs font-semibold text-white hover:bg-[#095438]"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Simpan Program Kerja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#DDE3DE] bg-white p-6 shadow-xl">
            <h3 className="font-display text-base font-semibold text-[#142019]">
              Hapus Program Rencana Kerja?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#435349]">
              Apakah Anda yakin ingin menghapus program{' '}
              <strong className="text-[#142019]">{deleteTarget.namaProgram}</strong> (
              {deleteTarget.kodeProgram}) dari daftar rencana kerja?
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-[#D4DDD6] bg-white px-4 py-2 text-xs font-medium text-[#34443A]"
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
                Hapus Program
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
