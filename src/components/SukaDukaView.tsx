import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  Heart,
  HeartHandshake,
  MapPin,
  Plus,
  Printer,
  Search,
  Trash2,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import {
  Anggota,
  CatatanSukaDuka,
  JenisSukaDuka,
  KategoriSukaDuka,
  StatusSukaDuka,
} from '../types/pura';
import { exportToCsv, formatRupiah, formatTanggalIndo } from '../utils/format';

interface SukaDukaViewProps {
  sukaDuka: CatatanSukaDuka[];
  anggota: Anggota[];
  canManage: boolean;
  onAdd: (item: Omit<CatatanSukaDuka, 'id'>, catatKeKas?: boolean) => void;
  onUpdate: (item: CatatanSukaDuka) => void;
  onDelete: (id: string) => void;
  onCatatKeKas: (item: CatatanSukaDuka) => void;
  externalAddOpen?: boolean;
  onCloseExternalAdd?: () => void;
}

const KATEGORI_SUKA: KategoriSukaDuka[] = [
  'Pernikahan / Pawiwahan',
  'Kelahiran / Otonan / Tiga Bulanan',
  'Manusa Yadnya (Metatah / Lainnya)',
  'Purna Tugas / Penghargaan',
];

const KATEGORI_DUKA: KategoriSukaDuka[] = [
  'Kedukaan / Meninggal Dunia',
  'Sakit / Rawat Inap',
];

export function SukaDukaView({
  sukaDuka,
  anggota,
  canManage,
  onAdd,
  onUpdate,
  onDelete,
  onCatatKeKas,
  externalAddOpen,
  onCloseExternalAdd,
}: SukaDukaViewProps) {
  const [jenisFilter, setJenisFilter] = useState<'Semua' | JenisSukaDuka>('Semua');
  const [statusFilter, setStatusFilter] = useState<'Semua' | StatusSukaDuka>('Semua');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatatanSukaDuka | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatatanSukaDuka | null>(null);

  const [tanggal, setTanggal] = useState('2026-11-21');
  const [jenis, setJenis] = useState<JenisSukaDuka>('Suka');
  const [kategori, setKategori] = useState<KategoriSukaDuka>('Pernikahan / Pawiwahan');
  const [anggotaId, setAnggotaId] = useState<string>(anggota[0]?.id || '');
  const [namaKeluarga, setNamaKeluarga] = useState('');
  const [lokasiAcara, setLokasiAcara] = useState('');
  const [uraian, setUraian] = useState('');
  const [nominalSantunan, setNominalSantunan] = useState(300000);
  const [bentukBingkisan, setBentukBingkisan] = useState('');
  const [perwakilanPengurus, setPerwakilanPengurus] = useState(
    'I Wayan Arya Adnyana & Seksi Sosial'
  );
  const [status, setStatus] = useState<StatusSukaDuka>('Dijadwalkan');
  const [dicatatOleh, setDicatatOleh] = useState('Ni Kadek Ceryna Dewi');
  const [autoCatatKas, setAutoCatatKas] = useState(false);

  const effectiveModalOpen = canManage && (modalOpen || Boolean(externalAddOpen));

  const stats = useMemo(() => {
    const total = sukaDuka.length;
    const sukaCount = sukaDuka.filter((s) => s.jenis === 'Suka').length;
    const dukaCount = sukaDuka.filter((s) => s.jenis === 'Duka').length;
    const totalDanaTersalurkan = sukaDuka
      .filter((s) => s.status === 'Sudah Disalurkan')
      .reduce((acc, s) => acc + (s.nominalSantunan || 0), 0);
    const terjadwalCount = sukaDuka.filter((s) => s.status === 'Dijadwalkan').length;
    return { total, sukaCount, dukaCount, totalDanaTersalurkan, terjadwalCount };
  }, [sukaDuka]);

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...sukaDuka]
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
      .filter((item) => {
        const matchJenis = jenisFilter === 'Semua' || item.jenis === jenisFilter;
        const matchStatus = statusFilter === 'Semua' || item.status === statusFilter;
        const matchQ =
          !q ||
          item.namaKeluarga.toLowerCase().includes(q) ||
          item.kategori.toLowerCase().includes(q) ||
          item.lokasiAcara.toLowerCase().includes(q) ||
          item.uraian.toLowerCase().includes(q) ||
          item.perwakilanPengurus.toLowerCase().includes(q);
        return matchJenis && matchStatus && matchQ;
      });
  }, [sukaDuka, jenisFilter, statusFilter, search]);

  const openAdd = () => {
    setEditingItem(null);
    const defaultMember = anggota[0];
    setTanggal(new Date().toISOString().slice(0, 10));
    setJenis('Suka');
    setKategori('Pernikahan / Pawiwahan');
    setAnggotaId(defaultMember?.id || '');
    setNamaKeluarga(defaultMember ? `Keluarga ${defaultMember.nama}` : '');
    setLokasiAcara(defaultMember?.alamat || 'Denpasar');
    setUraian('');
    setNominalSantunan(300000);
    setBentukBingkisan('Tali kasih pengempon');
    setPerwakilanPengurus('I Wayan Arya Adnyana & Seksi Sosial');
    setStatus('Dijadwalkan');
    setDicatatOleh('Ni Kadek Ceryna Dewi');
    setAutoCatatKas(false);
    setModalOpen(true);
  };

  const openEdit = (item: CatatanSukaDuka) => {
    setEditingItem(item);
    setTanggal(item.tanggal);
    setJenis(item.jenis);
    setKategori(item.kategori);
    setAnggotaId(item.anggotaId || '');
    setNamaKeluarga(item.namaKeluarga);
    setLokasiAcara(item.lokasiAcara);
    setUraian(item.uraian);
    setNominalSantunan(item.nominalSantunan);
    setBentukBingkisan(item.bentukBingkisan || '');
    setPerwakilanPengurus(item.perwakilanPengurus);
    setStatus(item.status);
    setDicatatOleh(item.dicatatOleh);
    setAutoCatatKas(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    onCloseExternalAdd?.();
  };

  const handleJenisChange = (nextJenis: JenisSukaDuka) => {
    setJenis(nextJenis);
    if (nextJenis === 'Suka') {
      setKategori(KATEGORI_SUKA[0]);
      setNominalSantunan(300000);
    } else {
      setKategori(KATEGORI_DUKA[0]);
      setNominalSantunan(500000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKeluarga.trim() || !uraian.trim()) return;

    const payload: Omit<CatatanSukaDuka, 'id'> = {
      tanggal,
      jenis,
      kategori,
      anggotaId: anggotaId || undefined,
      namaKeluarga: namaKeluarga.trim(),
      lokasiAcara: lokasiAcara.trim() || 'Denpasar',
      uraian: uraian.trim(),
      nominalSantunan: Math.max(0, nominalSantunan),
      bentukBingkisan: bentukBingkisan.trim() || undefined,
      perwakilanPengurus: perwakilanPengurus.trim() || 'Pengurus Pura',
      status,
      dicatatOleh: dicatatOleh.trim() || 'Bendahara Pura',
      tercatatDiKas: editingItem?.tercatatDiKas ?? (autoCatatKas && nominalSantunan > 0),
    };

    if (editingItem) {
      onUpdate({ ...payload, id: editingItem.id });
    } else {
      onAdd(payload, autoCatatKas && nominalSantunan > 0);
    }
    closeModal();
  };

  const handleExportCsv = () => {
    exportToCsv(
      'catatan-suka-duka-pura-bdk-denpasar.csv',
      [
        'Tanggal',
        'Jenis',
        'Kategori',
        'Nama Anggota / Keluarga',
        'Lokasi',
        'Uraian',
        'Santunan Kas (Rp)',
        'Bingkisan',
        'Perwakilan Pengurus',
        'Status',
        'Tercatat di Kas',
      ],
      filteredList.map((s) => [
        s.tanggal,
        s.jenis,
        s.kategori,
        s.namaKeluarga,
        s.lokasiAcara,
        s.uraian,
        s.nominalSantunan,
        s.bentukBingkisan || '-',
        s.perwakilanPengurus,
        s.status,
        s.tercatatDiKas ? 'Ya' : 'Belum',
      ])
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[#DFDBCA] bg-white p-5">
          <p className="text-[11px] font-semibold tracking-wider text-[#526358]">
            TOTAL CATATAN SUKA DUKA
          </p>
          <p className="mt-2 font-serif-title text-2xl font-bold text-[#142019] tabular-nums">
            {stats.total} Peristiwa
          </p>
          <p className="mt-1 text-xs text-[#59695E]">
            {stats.terjadwalCount} dijadwalkan hadir/disalurkan
          </p>
        </div>

        <div className="rounded-xl border border-[#0D6B48]/20 bg-[#F4FBF7] p-5">
          <p className="text-[11px] font-semibold tracking-wider text-[#0D6B48]">
            PERISTIWA SUKA (SYUKURAN / YADNYA)
          </p>
          <p className="mt-2 font-serif-title text-2xl font-bold text-[#0D6B48] tabular-nums">
            {stats.sukaCount} Catatan
          </p>
          <p className="mt-1 text-xs text-[#3D6B55]">
            Pawiwahan, kelahiran, manusa yadnya, purna tugas
          </p>
        </div>

        <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-5">
          <p className="text-[11px] font-semibold tracking-wider text-[#475569]">
            PERISTIWA DUKA (KEDUKAAN / SAKIT)
          </p>
          <p className="mt-2 font-serif-title text-2xl font-bold text-[#334155] tabular-nums">
            {stats.dukaCount} Catatan
          </p>
          <p className="mt-1 text-xs text-[#475569]">
            Melayat kedukaan & kunjungan pemulihan sakit
          </p>
        </div>

        <div className="rounded-xl border border-[#EDE2C9] bg-[#FFFDF8] p-5">
          <p className="text-[11px] font-semibold tracking-wider text-[#7C5B19]">
            DANA SOSIAL TERSALURKAN
          </p>
          <p className="mt-2 font-mono text-xl font-bold text-[#B45309] tabular-nums">
            {formatRupiah(stats.totalDanaTersalurkan)}
          </p>
          <p className="mt-1 text-xs text-[#7C5B19]">
            Santunan & tali kasih solidaritas pengempon
          </p>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="no-print flex flex-col gap-4 rounded-xl border border-[#DDE3DE] bg-white p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-[#F1F4F1] p-1">
            {(['Semua', 'Suka', 'Duka'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setJenisFilter(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  jenisFilter === tab
                    ? 'bg-white text-[#142019] shadow-xs'
                    : 'text-[#526358] hover:text-[#142019]'
                }`}
              >
                {tab === 'Semua' ? 'Semua Jenis' : tab}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'Semua' | StatusSukaDuka)}
            className="rounded-lg border border-[#D4DDD6] bg-white px-3 py-1.5 text-xs text-[#142019] focus:border-[#0D6B48] focus:outline-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="Dijadwalkan">Dijadwalkan</option>
            <option value="Sudah Disalurkan">Sudah Disalurkan</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-64 sm:flex-initial">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7B70]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama keluarga, lokasi..."
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
              Catat Suka Duka
            </button>
          )}
        </div>
      </div>

      {!canManage && (
        <div className="rounded-xl border border-[#DDE3DE] bg-white px-5 py-3 text-xs text-[#435349]">
          Anda masuk sebagai <strong className="text-[#142019]">Pengempon (Hanya Lihat)</strong>. Anda dapat memantau informasi kunjungan suka duka anggota, jadwal kehadiran pengurus, serta santunan solidaritas yang telah disalurkan.
        </div>
      )}

      {/* List */}
      {filteredList.length === 0 ? (
        <div className="rounded-xl border border-[#DDE3DE] bg-white p-10 text-center">
          <p className="text-sm font-semibold text-[#142019]">
            Belum ada catatan suka duka yang sesuai filter.
          </p>
        </div>
      ) : (
        <div className="print-area grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredList.map((item) => {
            const isSuka = item.jenis === 'Suka';
            return (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-[#E2DCC8] bg-white p-5 sm:p-6 shadow-2xs space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-semibold ${
                          isSuka
                            ? 'bg-[#ECFDF5] text-[#0D6B48] border border-[#0D6B48]/20'
                            : 'bg-[#F1F5F9] text-[#334155] border border-[#94A3B8]/35'
                        }`}
                      >
                        {isSuka ? (
                          <Heart className="h-3 w-3 text-[#D97706]" />
                        ) : (
                          <HeartHandshake className="h-3 w-3 text-[#475569]" />
                        )}
                        {item.jenis}
                      </span>
                      <span className="rounded-md bg-[#FAF6EA] border border-[#E8DEC3] px-2 py-0.5 text-[11px] font-medium text-[#7C5B19]">
                        {item.kategori}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        item.status === 'Sudah Disalurkan'
                          ? 'text-[#0D6B48]'
                          : 'text-[#B45309]'
                      }`}
                    >
                      {item.status === 'Sudah Disalurkan' ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                      {item.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-base font-bold text-[#142019]">
                      {item.namaKeluarga}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#435349]">{item.uraian}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 rounded-xl border border-[#EFECE2] bg-[#FAF8F1] p-3.5 text-xs text-[#435349] sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-[#0D6B48] shrink-0" />
                      <span className="font-mono">{formatTanggalIndo(item.tanggal)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[#0D6B48] shrink-0" />
                      <span className="truncate">{item.lokasiAcara}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <Users className="h-3.5 w-3.5 text-[#0D6B48] shrink-0" />
                      <span>
                        <strong>Perwakilan Hadir:</strong> {item.perwakilanPengurus}
                      </span>
                    </div>
                    {item.bentukBingkisan && (
                      <div className="sm:col-span-2 text-[11px] text-[#59695E]">
                        <strong>Bingkisan / Sarana:</strong> {item.bentukBingkisan}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EFECE2] pt-3 text-xs">
                  <div>
                    <p className="text-[11px] text-[#59695E]">Dana Sosial / Tali Kasih</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#142019] tabular-nums">
                        {item.nominalSantunan > 0
                          ? formatRupiah(item.nominalSantunan)
                          : 'Kunjungan / Doa'}
                      </span>
                      {item.tercatatDiKas && (
                        <span className="rounded bg-[#E0F2FE] px-1.5 py-0.5 text-[10px] font-semibold text-[#0369A1]">
                          Tercatat di Buku Kas
                        </span>
                      )}
                    </div>
                  </div>

                  {canManage && (
                    <div className="no-print flex flex-wrap items-center gap-1.5">
                      {item.status === 'Dijadwalkan' && (
                        <button
                          type="button"
                          onClick={() =>
                            onUpdate({ ...item, status: 'Sudah Disalurkan' })
                          }
                          className="rounded-lg bg-[#0D6B48] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#095438]"
                        >
                          Tandai Disalurkan
                        </button>
                      )}
                      {item.nominalSantunan > 0 && !item.tercatatDiKas && (
                        <button
                          type="button"
                          onClick={() => onCatatKeKas(item)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#0369A1]/30 bg-[#F0F9FF] px-2.5 py-1.5 text-[11px] font-semibold text-[#0369A1] hover:bg-[#E0F2FE]"
                          title="Catat sebagai Pengeluaran Kas (Sosial & Suka Duka)"
                        >
                          <Wallet className="h-3 w-3" />
                          Catat ke Kas
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="rounded-md p-1.5 text-[#435349] hover:bg-[#F4F6F4] hover:text-[#0D6B48]"
                        aria-label={`Edit ${item.namaKeluarga}`}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="rounded-md p-1.5 text-[#6B7B70] hover:bg-red-50 hover:text-red-700"
                        aria-label={`Hapus ${item.namaKeluarga}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Suka Duka */}
      {effectiveModalOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#DDE3DE] bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#E9EEEA] bg-white px-6 py-4">
              <h3 className="font-display text-base font-semibold text-[#142019]">
                {editingItem ? 'Perbarui Catatan Suka Duka' : 'Catat Peristiwa Suka Duka Pengempon'}
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
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#F1F4F1] p-1">
                <button
                  type="button"
                  onClick={() => handleJenisChange('Suka')}
                  className={`rounded-md py-2 text-xs font-semibold transition-colors ${
                    jenis === 'Suka'
                      ? 'bg-[#0D6B48] text-white'
                      : 'text-[#526358] hover:text-[#142019]'
                  }`}
                >
                  Suka (Syukuran / Yadnya)
                </button>
                <button
                  type="button"
                  onClick={() => handleJenisChange('Duka')}
                  className={`rounded-md py-2 text-xs font-semibold transition-colors ${
                    jenis === 'Duka'
                      ? 'bg-[#334155] text-white'
                      : 'text-[#526358] hover:text-[#142019]'
                  }`}
                >
                  Duka (Kedukaan / Sakit)
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as KategoriSukaDuka)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                  >
                    {(jenis === 'Suka' ? KATEGORI_SUKA : KATEGORI_DUKA).map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Tanggal Acara</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Anggota Pengempon Terkait (Opsional)
                </label>
                <select
                  value={anggotaId}
                  onChange={(e) => {
                    setAnggotaId(e.target.value);
                    const m = anggota.find((a) => a.id === e.target.value);
                    if (m) {
                      setNamaKeluarga(`Keluarga ${m.nama}`);
                      if (m.alamat) setLokasiAcara(m.alamat);
                    }
                  }}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                >
                  <option value="">-- Pilih Anggota / Isikan Manual --</option>
                  {anggota.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nomorInduk} - {m.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">
                    Nama Anggota / Keluarga
                  </label>
                  <input
                    type="text"
                    required
                    value={namaKeluarga}
                    onChange={(e) => setNamaKeluarga(e.target.value)}
                    placeholder="Contoh: Keluarga I Putu Eka Pranata"
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Lokasi Acara</label>
                  <input
                    type="text"
                    required
                    value={lokasiAcara}
                    onChange={(e) => setLokasiAcara(e.target.value)}
                    placeholder="Alamat kediaman / RS"
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Uraian Peristiwa & Keterangan
                </label>
                <textarea
                  rows={2}
                  required
                  value={uraian}
                  onChange={(e) => setUraian(e.target.value)}
                  placeholder="Contoh: Kunjungan melayat / menghadiri upacara pawiwahan anggota..."
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">
                    Nominal Santunan / Tali Kasih (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={nominalSantunan}
                    onChange={(e) => setNominalSantunan(Number(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs font-semibold focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">
                    Bentuk Bingkisan / Sarana (Opsional)
                  </label>
                  <input
                    type="text"
                    value={bentukBingkisan}
                    onChange={(e) => setBentukBingkisan(e.target.value)}
                    placeholder="Mis. Parsel buah, karangan bunga"
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">
                    Perwakilan Pengurus Hadir
                  </label>
                  <input
                    type="text"
                    required
                    value={perwakilanPengurus}
                    onChange={(e) => setPerwakilanPengurus(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusSukaDuka)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                  >
                    <option value="Dijadwalkan">Dijadwalkan</option>
                    <option value="Sudah Disalurkan">Sudah Disalurkan</option>
                  </select>
                </div>
              </div>

              {!editingItem && nominalSantunan > 0 && (
                <label className="flex items-start gap-2.5 rounded-xl border border-[#E7E1CC] bg-[#FAF8F1] p-3 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCatatKas}
                    onChange={(e) => setAutoCatatKas(e.target.checked)}
                    className="mt-0.5 rounded border-[#C8D3CC] text-[#0D6B48]"
                  />
                  <span>
                    <strong className="text-[#142019]">
                      Sekaligus catat ke Pengeluaran Buku Kas Pura
                    </strong>
                    <span className="block text-[11px] text-[#59695E]">
                      Otomatis mencatat pengeluaran kategori &ldquo;Sosial &amp; Suka Duka&rdquo;
                      sebesar {formatRupiah(nominalSantunan)}.
                    </span>
                  </span>
                </label>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-[#E9EEEA] pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-[#D4DDD6] bg-white px-4 py-2 text-xs font-medium text-[#34443A]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0D6B48] px-4 py-2 text-xs font-semibold text-white hover:bg-[#095438]"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Simpan Catatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#DDE3DE] bg-white p-6 shadow-xl">
            <h3 className="font-display text-base font-semibold text-[#142019]">
              Hapus Catatan Suka Duka?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#435349]">
              Apakah Anda yakin ingin menghapus catatan{' '}
              <strong className="text-[#142019]">{deleteTarget.namaKeluarga}</strong> (
              {deleteTarget.kategori})?
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
                Hapus Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
