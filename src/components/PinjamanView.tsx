import React, { useMemo, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  HandCoins,
  History,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Anggota, PinjamanDana, RencanaAngsuranItem } from '../types/pura';
import { formatRupiah, formatTanggalIndo } from '../utils/format';

interface PinjamanViewProps {
  anggota: Anggota[];
  pinjamanDana: PinjamanDana[];
  canManage: boolean;
  onAddPinjamanDana: (item: Omit<PinjamanDana, 'id'>) => void;
  onBayarPinjamanDana: (
    id: string,
    jumlahBayar: number,
    tanggalBayar?: string,
    keterangan?: string
  ) => void;
  onUpdateRencanaPinjaman: (
    id: string,
    rencanaPengembalian: string,
    rencanaAngsuran: RencanaAngsuranItem[]
  ) => void;
  onDeletePinjamanDana: (id: string) => void;
  externalAddOpen?: boolean;
  onCloseExternalAdd?: () => void;
}

function addMonthsSafe(isoDate: string, monthsToAdd: number): string {
  const base = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(base.getTime())) return isoDate;
  base.setMonth(base.getMonth() + monthsToAdd);
  return base.toISOString().slice(0, 10);
}

function buildAutoRencanaSchedule(
  tanggalPinjam: string,
  jatuhTempo: string,
  totalNominal: number,
  terminCount: number
): RencanaAngsuranItem[] {
  const safeCount = Math.max(1, Math.min(12, terminCount));
  if (safeCount === 1) {
    return [
      {
        id: `rcn-${Date.now()}-1`,
        termin: 1,
        tanggalRencana: jatuhTempo || addMonthsSafe(tanggalPinjam, 1),
        nominalRencana: totalNominal,
        catatan: 'Pelunasan sekaligus',
      },
    ];
  }
  const perTerminBase = Math.floor(totalNominal / safeCount / 1000) * 1000 || Math.floor(totalNominal / safeCount);
  const items: RencanaAngsuranItem[] = [];
  let allocated = 0;
  for (let i = 1; i <= safeCount; i++) {
    const isLast = i === safeCount;
    const nominalRencana = isLast ? Math.max(0, totalNominal - allocated) : perTerminBase;
    allocated += nominalRencana;
    const tanggalRencana = isLast && jatuhTempo ? jatuhTempo : addMonthsSafe(tanggalPinjam, i);
    items.push({
      id: `rcn-${Date.now()}-${i}`,
      termin: i,
      tanggalRencana,
      nominalRencana,
      catatan: isLast ? `Pelunasan termin ${i}` : `Angsuran termin ${i}`,
    });
  }
  return items;
}

export function PinjamanView({
  anggota,
  pinjamanDana,
  canManage,
  onAddPinjamanDana,
  onBayarPinjamanDana,
  onUpdateRencanaPinjaman,
  onDeletePinjamanDana,
  externalAddOpen,
  onCloseExternalAdd,
}: PinjamanViewProps) {
  const [danaPeminjam, setDanaPeminjam] = useState(anggota[0]?.nama || '');
  const [danaNominal, setDanaNominal] = useState(500000);
  const [danaTanggal, setDanaTanggal] = useState('2026-11-21');
  const [danaTempo, setDanaTempo] = useState('2027-01-21');
  const [danaTerminCount, setDanaTerminCount] = useState(2);
  const [danaRencanaCatatan, setDanaRencanaCatatan] = useState('');
  const [danaKeperluan, setDanaKeperluan] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<'Semua' | 'Berjalan' | 'Lunas'>('Semua');
  const [search, setSearch] = useState('');
  const [bottomTab, setBottomTab] = useState<'riwayat' | 'rencana'>('riwayat');

  // Modal for Cicilan / Pelunasan Pinjaman Dana
  const [bayarTarget, setBayarTarget] = useState<PinjamanDana | null>(null);
  const [bayarNominal, setBayarNominal] = useState(0);
  const [bayarTanggal, setBayarTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [bayarKeterangan, setBayarKeterangan] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(pinjamanDana[0]?.id || null);

  // Modal for Editing Rencana Angsuran
  const [rencanaTarget, setRencanaTarget] = useState<PinjamanDana | null>(null);
  const [rencanaSummaryDraft, setRencanaSummaryDraft] = useState('');
  const [rencanaItemsDraft, setRencanaItemsDraft] = useState<RencanaAngsuranItem[]>([]);

  // Quick modal when triggered from TopBar
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const effectiveAddOpen = canManage && (modalAddOpen || Boolean(externalAddOpen));

  const statsDana = useMemo(() => {
    const berjalan = pinjamanDana
      .filter((p) => p.status === 'Berjalan')
      .reduce((acc, p) => acc + Math.max(0, p.nominal - p.sudahDikembalikan), 0);
    const totalKembali = pinjamanDana.reduce((acc, p) => acc + p.sudahDikembalikan, 0);
    const aktifCount = pinjamanDana.filter((p) => p.status === 'Berjalan').length;
    return { berjalan, totalKembali, aktifCount };
  }, [pinjamanDana]);

  const allInstallments = useMemo(() => {
    const rows: Array<{
      id: string;
      pinjamanId: string;
      peminjam: string;
      keperluan: string;
      statusPinjaman: 'Berjalan' | 'Lunas';
      tanggal: string;
      nominal: number;
      dicatatOleh: string;
      keterangan?: string;
      urutan: number;
    }> = [];
    pinjamanDana.forEach((p) => {
      const list = p.riwayatAngsuran || [];
      list.forEach((ang, idx) => {
        rows.push({
          id: ang.id,
          pinjamanId: p.id,
          peminjam: p.peminjam,
          keperluan: p.keperluan,
          statusPinjaman: p.status,
          tanggal: ang.tanggal,
          nominal: ang.nominal,
          dicatatOleh: ang.dicatatOleh,
          keterangan: ang.keterangan,
          urutan: idx + 1,
        });
      });
    });
    return rows.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [pinjamanDana]);

  const allPlannedInstallments = useMemo(() => {
    const rows: Array<{
      id: string;
      pinjamanId: string;
      peminjam: string;
      keperluan: string;
      statusPinjaman: 'Berjalan' | 'Lunas';
      termin: number;
      tanggalRencana: string;
      nominalRencana: number;
      catatan?: string;
      terpenuhi: boolean;
    }> = [];
    pinjamanDana.forEach((p) => {
      const list = p.rencanaAngsuran || [];
      let cumulativeTarget = 0;
      list.forEach((rcn) => {
        cumulativeTarget += rcn.nominalRencana;
        rows.push({
          id: rcn.id,
          pinjamanId: p.id,
          peminjam: p.peminjam,
          keperluan: p.keperluan,
          statusPinjaman: p.status,
          termin: rcn.termin,
          tanggalRencana: rcn.tanggalRencana,
          nominalRencana: rcn.nominalRencana,
          catatan: rcn.catatan,
          terpenuhi: p.status === 'Lunas' || p.sudahDikembalikan >= cumulativeTarget,
        });
      });
    });
    return rows.sort((a, b) => a.tanggalRencana.localeCompare(b.tanggalRencana));
  }, [pinjamanDana]);

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...pinjamanDana]
      .sort((a, b) => b.tanggalPinjam.localeCompare(a.tanggalPinjam))
      .filter((p) => {
        const matchStatus = filterStatus === 'Semua' || p.status === filterStatus;
        const matchQ =
          !q ||
          p.peminjam.toLowerCase().includes(q) ||
          p.keperluan.toLowerCase().includes(q);
        return matchStatus && matchQ;
      });
  }, [pinjamanDana, filterStatus, search]);

  const handleSubmitPinjamanDana = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || danaNominal <= 0 || !danaKeperluan.trim()) return;
    const schedule = buildAutoRencanaSchedule(
      danaTanggal,
      danaTempo,
      danaNominal,
      danaTerminCount
    );
    const defaultSummary =
      danaTerminCount === 1
        ? `1x pelunasan sekaligus pada ${formatTanggalIndo(danaTempo)}`
        : `${danaTerminCount}x angsuran (~${formatRupiah(
            Math.round(danaNominal / danaTerminCount)
          )}/termin)`;
    onAddPinjamanDana({
      tanggalPinjam: danaTanggal,
      peminjam: danaPeminjam.trim(),
      keperluan: danaKeperluan.trim(),
      nominal: danaNominal,
      sudahDikembalikan: 0,
      jatuhTempo: danaTempo,
      status: 'Berjalan',
      dicatatOleh: 'Pengurus / Bendahara Pura',
      rencanaPengembalian: danaRencanaCatatan.trim() || defaultSummary,
      rencanaAngsuran: schedule,
      riwayatAngsuran: [],
    });
    setDanaKeperluan('');
    setDanaRencanaCatatan('');
    setModalAddOpen(false);
    onCloseExternalAdd?.();
    setFeedback(
      `Pinjaman atas nama ${danaPeminjam} sebesar ${formatRupiah(
        danaNominal
      )} beserta rencana ${danaTerminCount}x angsuran berhasil dicatat.`
    );
    setTimeout(() => setFeedback(null), 4000);
  };

  const openEditRencana = (p: PinjamanDana) => {
    setRencanaTarget(p);
    setRencanaSummaryDraft(p.rencanaPengembalian || '');
    const baseItems =
      p.rencanaAngsuran && p.rencanaAngsuran.length > 0
        ? p.rencanaAngsuran
        : buildAutoRencanaSchedule(p.tanggalPinjam, p.jatuhTempo, p.nominal, 1);
    setRencanaItemsDraft(baseItems.map((item) => ({ ...item })));
  };

  return (
    <div className="space-y-6">
      {!canManage && (
        <div className="rounded-xl border border-[#E5DEC9] bg-white px-5 py-3 text-xs text-[#435349]">
          Anda masuk sebagai <strong className="text-[#142019]">Pengempon (Hanya Lihat)</strong>. Anda
          dapat memantau seluruh daftar pinjaman dana kas pura, pengembalian, serta sisa berjalan
          secara transparan. Pencatatan atau pelunasan pinjaman hanya dapat dilakukan oleh Pengurus.
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#EDE2C9] bg-[#FFFDF7] p-5">
          <p className="text-xs font-medium text-[#7C5B19]">Pinjaman Kas Berjalan</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#B45309] tabular-nums">
            {formatRupiah(statsDana.berjalan)}
          </p>
          <p className="mt-1 text-[11px] text-[#7C5B19]">
            Otomatis mengurangi saldo kas bersih tersedia
          </p>
        </div>
        <div className="rounded-2xl border border-[#DCE5DF] bg-white p-5">
          <p className="text-xs font-medium text-[#526358]">Total Dana Telah Dikembalikan</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#0D6B48] tabular-nums">
            {formatRupiah(statsDana.totalKembali)}
          </p>
          <p className="mt-1 text-[11px] text-[#59695E]">Akumulasi cicilan & pelunasan</p>
        </div>
        <div className="rounded-2xl border border-[#D4E6EA] bg-[#F9FEFF] p-5">
          <p className="text-xs font-medium text-[#375C6B]">Peminjam Berstatus Berjalan</p>
          <p className="mt-2 font-display text-2xl font-bold text-[#0369A1] tabular-nums">
            {statsDana.aktifCount} Pengajuan
          </p>
          <p className="mt-1 text-[11px] text-[#375C6B]">
            Dari total {pinjamanDana.length} catatan pinjaman
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
        {canManage && (
          <section className="rounded-2xl border border-[#E2E4DC] bg-white p-6 xl:col-span-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#B45309]">
                <HandCoins className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-[#142019]">
                  Formulir Peminjaman Kas Pura
                </h2>
                <p className="text-xs text-[#59695E]">
                  Catat kasbon seksi upacara atau pinjaman dana pengempon.
                </p>
              </div>
            </div>

            {feedback && (
              <div className="mt-4 rounded-lg border border-[#0D6B48]/25 bg-[#ECFDF5] px-3.5 py-2.5 text-xs font-medium text-[#0D6B48]">
                {feedback}
              </div>
            )}

            <form onSubmit={handleSubmitPinjamanDana} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Nama Peminjam / Seksi
                </label>
                <input
                  type="text"
                  required
                  list="anggota-peminjam-list"
                  value={danaPeminjam}
                  onChange={(e) => setDanaPeminjam(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
                <datalist id="anggota-peminjam-list">
                  {anggota.map((a) => (
                    <option key={a.id} value={a.nama} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Tanggal Pinjam</label>
                  <input
                    type="date"
                    required
                    value={danaTanggal}
                    onChange={(e) => setDanaTanggal(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Jatuh Tempo</label>
                  <input
                    type="date"
                    required
                    value={danaTempo}
                    onChange={(e) => setDanaTempo(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Nominal Pinjaman (Rp)
                </label>
                <input
                  type="number"
                  min={50000}
                  step={50000}
                  required
                  value={danaNominal}
                  onChange={(e) => setDanaNominal(Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-sm font-semibold focus:border-[#0D6B48] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">
                    Rencana Termin Angsuran
                  </label>
                  <select
                    value={danaTerminCount}
                    onChange={(e) => setDanaTerminCount(Number(e.target.value) || 1)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                  >
                    <option value={1}>1x (Sekaligus Lunas)</option>
                    <option value={2}>2x Angsuran</option>
                    <option value={3}>3x Angsuran</option>
                    <option value={4}>4x Angsuran</option>
                    <option value={6}>6x Angsuran</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">
                    Estimasi Per Angsuran
                  </label>
                  <div className="mt-1 rounded-lg border border-[#EFECE2] bg-[#FAF8F1] px-3 py-2 font-mono text-xs font-semibold text-[#0D6B48] tabular-nums">
                    {formatRupiah(Math.round(danaNominal / Math.max(1, danaTerminCount)))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Catatan Rencana Pengembalian (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dipotong setiap tanggal 5 dari honor/gaji"
                  value={danaRencanaCatatan}
                  onChange={(e) => setDanaRencanaCatatan(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Keperluan Pinjaman
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Panjar banten Piodalan atau pinjaman upacara keluarga"
                  value={danaKeperluan}
                  onChange={(e) => setDanaKeperluan(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0D6B48] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#095438]"
              >
                <Plus className="h-4 w-4" />
                Catat Peminjaman Dana
              </button>
            </form>
          </section>
        )}

        <section
          className={`rounded-2xl border border-[#E2E4DC] bg-white ${
            canManage ? 'xl:col-span-7' : 'xl:col-span-12'
          }`}
        >
          <div className="flex flex-col gap-3 border-b border-[#EFECE2] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-[#142019]">
                Daftar Pinjaman Kas & Pengembalian
              </h2>
              <p className="text-xs text-[#59695E]">
                Transparansi pinjaman berjalan yang memengaruhi Saldo Kas Pura
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg bg-[#F1F4F1] p-1">
                {(['Semua', 'Berjalan', 'Lunas'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilterStatus(tab)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      filterStatus === tab
                        ? 'bg-white text-[#142019] shadow-xs'
                        : 'text-[#526358]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="relative w-40">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B7B70]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari peminjam..."
                  className="w-full rounded-lg border border-[#D4DDD6] py-1.5 pl-8 pr-2.5 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EFECE2] text-[#59695E]">
                  <th className="px-5 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Peminjam & Keperluan</th>
                  <th className="px-4 py-3 text-right font-medium">Pinjaman</th>
                  <th className="px-4 py-3 text-right font-medium">Sisa Berjalan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Riwayat & Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F1EA]">
                {filteredList.map((p) => {
                  const sisa = Math.max(0, p.nominal - p.sudahDikembalikan);
                  const riwayat = p.riwayatAngsuran || [];
                  const rencanaList = p.rencanaAngsuran || [];
                  const isExpanded = expandedId === p.id;
                  let cumulativeRencana = 0;
                  return (
                    <React.Fragment key={p.id}>
                      <tr className="hover:bg-[#FAF9F4]">
                        <td className="px-5 py-3 font-mono text-[#526358] tabular-nums whitespace-nowrap">
                          {formatTanggalIndo(p.tanggalPinjam)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#142019]">{p.peminjam}</p>
                          <p className="text-[11px] text-[#59695E]">
                            {p.keperluan} · Tempo {formatTanggalIndo(p.jatuhTempo)}
                          </p>
                          {p.rencanaPengembalian && (
                            <p className="mt-0.5 text-[11px] font-medium text-[#0D6B48]">
                              Rencana: {p.rencanaPengembalian}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums whitespace-nowrap">
                          <div>{formatRupiah(p.nominal)}</div>
                          <div className="text-[10px] text-[#0D6B48]">
                            Terbayar {formatRupiah(p.sudahDikembalikan)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-[#B45309] tabular-nums whitespace-nowrap">
                          {formatRupiah(sisa)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`font-medium ${
                              p.status === 'Lunas' ? 'text-[#0D6B48]' : 'text-[#B45309]'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : p.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#DFD7BF] bg-[#FCF9F0] px-2.5 py-1 text-[11px] font-medium text-[#142019] hover:bg-[#F5EED8]"
                            >
                              <History className="h-3 w-3 text-[#0D6B48]" />
                              <span>
                                Rencana & Riwayat ({rencanaList.length}/{riwayat.length})
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="h-3 w-3 text-[#59695E]" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-[#59695E]" />
                              )}
                            </button>
                            {canManage && p.status === 'Berjalan' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setBayarTarget(p);
                                  setBayarNominal(sisa);
                                  setBayarTanggal(new Date().toISOString().slice(0, 10));
                                  setBayarKeterangan('');
                                }}
                                className="rounded-lg bg-[#0D6B48] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#095438]"
                              >
                                Bayar / Angsur
                              </button>
                            )}
                            {canManage && (
                              <button
                                type="button"
                                onClick={() => onDeletePinjamanDana(p.id)}
                                className="rounded p-1 text-[#6B7B70] hover:bg-red-50 hover:text-red-700"
                                aria-label={`Hapus pinjaman ${p.peminjam}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-[#FAF8F1]">
                          <td colSpan={6} className="px-5 py-4">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                              {/* Rencana Angsuran */}
                              <div className="rounded-xl border border-[#E6DFCA] bg-white p-3.5">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFECE2] pb-2">
                                  <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#142019]">
                                    <CalendarClock className="h-3.5 w-3.5 text-[#B45309]" />
                                    Rencana Angsuran ({rencanaList.length} termin)
                                  </p>
                                  {canManage && (
                                    <button
                                      type="button"
                                      onClick={() => openEditRencana(p)}
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0D6B48] hover:underline"
                                    >
                                      <Edit3 className="h-3 w-3" />
                                      Atur Rencana
                                    </button>
                                  )}
                                </div>
                                {p.rencanaPengembalian && (
                                  <p className="mt-2 text-[11px] text-[#526358]">
                                    Ringkasan: <strong className="text-[#142019]">{p.rencanaPengembalian}</strong>
                                  </p>
                                )}
                                {rencanaList.length === 0 ? (
                                  <p className="pt-2 text-[11px] text-[#59695E]">
                                    Belum ada jadwal rencana angsuran.
                                  </p>
                                ) : (
                                  <div className="mt-2 space-y-1.5">
                                    {rencanaList.map((rcn) => {
                                      cumulativeRencana += rcn.nominalRencana;
                                      const terpenuhi =
                                        p.status === 'Lunas' ||
                                        p.sudahDikembalikan >= cumulativeRencana;
                                      return (
                                        <div
                                          key={rcn.id}
                                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#FCF9F0] px-3 py-2 text-[11px]"
                                        >
                                          <div className="flex flex-wrap items-center gap-2 min-w-0">
                                            <span className="font-mono font-semibold text-[#B45309]">
                                              Termin {rcn.termin}
                                            </span>
                                            <span className="font-mono text-[#526358]">
                                              {formatTanggalIndo(rcn.tanggalRencana)}
                                            </span>
                                            <span className="text-[#34443A]">
                                              {rcn.catatan || `Rencana angsuran ${rcn.termin}`}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span
                                              className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                                                terpenuhi ? 'text-[#0D6B48]' : 'text-[#B45309]'
                                              }`}
                                            >
                                              {terpenuhi && <CheckCircle2 className="h-3 w-3" />}
                                              {terpenuhi ? 'Terpenuhi' : 'Terjadwal'}
                                            </span>
                                            <span className="font-mono font-semibold text-[#142019] tabular-nums">
                                              {formatRupiah(rcn.nominalRencana)}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Realisasi / Riwayat Angsuran */}
                              <div className="rounded-xl border border-[#E6DFCA] bg-white p-3.5">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFECE2] pb-2">
                                  <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#142019]">
                                    <History className="h-3.5 w-3.5 text-[#0D6B48]" />
                                    Riwayat Angsuran Terealisasi ({riwayat.length}x bayar)
                                  </p>
                                  {canManage && p.status === 'Berjalan' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setBayarTarget(p);
                                        setBayarNominal(Math.min(500000, sisa));
                                        setBayarTanggal(new Date().toISOString().slice(0, 10));
                                        setBayarKeterangan('');
                                      }}
                                      className="text-[11px] font-semibold text-[#0D6B48] hover:underline"
                                    >
                                      + Tambah Angsuran
                                    </button>
                                  )}
                                </div>
                                {riwayat.length === 0 ? (
                                  <p className="pt-2.5 text-[11px] text-[#59695E]">
                                    Belum ada angsuran atau pengembalian dana yang tercatat untuk pinjaman ini.
                                  </p>
                                ) : (
                                  <div className="mt-2 space-y-1.5">
                                    {riwayat.map((ang, idx) => (
                                      <div
                                        key={ang.id}
                                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#FAF9F4] px-3 py-2 text-[11px]"
                                      >
                                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                                          <span className="font-mono font-semibold text-[#0D6B48]">
                                            #{idx + 1}
                                          </span>
                                          <span className="font-mono text-[#526358]">
                                            {formatTanggalIndo(ang.tanggal)}
                                          </span>
                                          <span className="text-[#142019] font-medium">
                                            {ang.keterangan || `Angsuran ke-${idx + 1}`}
                                          </span>
                                          <span className="text-[#59695E]">
                                            · {ang.dicatatOleh}
                                          </span>
                                        </div>
                                        <span className="font-mono font-semibold text-[#0D6B48] tabular-nums">
                                          + {formatRupiah(ang.nominal)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Rencana & Riwayat Angsuran Seluruh Pinjaman */}
      <section className="rounded-2xl border border-[#E2E4DC] bg-white overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFECE2] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#0D6B48]">
              {bottomTab === 'riwayat' ? (
                <History className="h-4 w-4" />
              ) : (
                <CalendarClock className="h-4 w-4" />
              )}
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-[#142019]">
                {bottomTab === 'riwayat'
                  ? `Riwayat Angsuran & Pengembalian Kas (${allInstallments.length})`
                  : `Jadwal Rencana Angsuran Pinjaman (${allPlannedInstallments.length})`}
              </h2>
              <p className="text-xs text-[#59695E]">
                {bottomTab === 'riwayat'
                  ? 'Catatan kronologis setiap cicilan dan pelunasan yang telah dibayarkan'
                  : 'Daftar rencana pengembalian per termin sebagai acuan pemantauan bersama'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-[#F1F4F1] p-1">
            <button
              type="button"
              onClick={() => setBottomTab('riwayat')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                bottomTab === 'riwayat'
                  ? 'bg-white text-[#142019] shadow-xs'
                  : 'text-[#526358]'
              }`}
            >
              Riwayat Angsuran ({allInstallments.length})
            </button>
            <button
              type="button"
              onClick={() => setBottomTab('rencana')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                bottomTab === 'rencana'
                  ? 'bg-white text-[#142019] shadow-xs'
                  : 'text-[#526358]'
              }`}
            >
              Rencana Angsuran ({allPlannedInstallments.length})
            </button>
          </div>
        </div>

        {bottomTab === 'riwayat' ? (
          allInstallments.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#59695E]">
              Belum ada riwayat angsuran tercatat.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EFECE2] text-[#59695E]">
                    <th className="px-5 py-3 font-medium">Tanggal Bayar</th>
                    <th className="px-4 py-3 font-medium">Peminjam</th>
                    <th className="px-4 py-3 font-medium">Keterangan Angsuran</th>
                    <th className="px-4 py-3 font-medium">Pencatat</th>
                    <th className="px-5 py-3 text-right font-medium">Nominal Angsuran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F1EA]">
                  {allInstallments.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAF9F4]">
                      <td className="px-5 py-3 font-mono text-[#526358] tabular-nums whitespace-nowrap">
                        {formatTanggalIndo(item.tanggal)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#142019]">{item.peminjam}</p>
                        <p className="text-[11px] text-[#59695E] truncate max-w-[260px]">
                          {item.keperluan} ({item.statusPinjaman})
                        </p>
                      </td>
                      <td className="px-4 py-3 text-[#34443A]">
                        {item.keterangan || `Angsuran ke-${item.urutan}`}
                      </td>
                      <td className="px-4 py-3 text-[#59695E] whitespace-nowrap">
                        {item.dicatatOleh}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-semibold text-[#0D6B48] tabular-nums whitespace-nowrap">
                        + {formatRupiah(item.nominal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : allPlannedInstallments.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#59695E]">
            Belum ada jadwal rencana angsuran tersusun.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EFECE2] text-[#59695E]">
                  <th className="px-5 py-3 font-medium">Tanggal Rencana</th>
                  <th className="px-4 py-3 font-medium">Peminjam</th>
                  <th className="px-4 py-3 font-medium">Termin & Catatan</th>
                  <th className="px-4 py-3 font-medium">Status Rencana</th>
                  <th className="px-5 py-3 text-right font-medium">Target Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F1EA]">
                {allPlannedInstallments.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF9F4]">
                    <td className="px-5 py-3 font-mono text-[#526358] tabular-nums whitespace-nowrap">
                      {formatTanggalIndo(item.tanggalRencana)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#142019]">{item.peminjam}</p>
                      <p className="text-[11px] text-[#59695E] truncate max-w-[260px]">
                        {item.keperluan}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[#34443A]">
                      Termin {item.termin} · {item.catatan || 'Cicilan terjadwal'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          item.terpenuhi ? 'text-[#0D6B48]' : 'text-[#B45309]'
                        }`}
                      >
                        {item.terpenuhi ? 'Terpenuhi' : 'Terjadwal'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-[#142019] tabular-nums whitespace-nowrap">
                      {formatRupiah(item.nominalRencana)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal Tambah Cepat dari TopBar */}
      {effectiveAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#DDE3DE] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EFECE2] px-6 py-4">
              <h3 className="font-display text-base font-semibold text-[#142019]">
                Catat Peminjaman Dana Kas Pura
              </h3>
              <button
                type="button"
                onClick={() => {
                  setModalAddOpen(false);
                  onCloseExternalAdd?.();
                }}
                className="rounded-md p-1 text-[#59695E] hover:bg-[#F4F6F4]"
                aria-label="Tutup modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitPinjamanDana} className="space-y-4 p-6">
              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Nama Peminjam / Seksi
                </label>
                <input
                  type="text"
                  required
                  value={danaPeminjam}
                  onChange={(e) => setDanaPeminjam(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Tanggal Pinjam</label>
                  <input
                    type="date"
                    required
                    value={danaTanggal}
                    onChange={(e) => setDanaTanggal(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Jatuh Tempo</label>
                  <input
                    type="date"
                    required
                    value={danaTempo}
                    onChange={(e) => setDanaTempo(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">
                    Nominal Pinjaman (Rp)
                  </label>
                  <input
                    type="number"
                    min={50000}
                    step={50000}
                    required
                    value={danaNominal}
                    onChange={(e) => setDanaNominal(Number(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-sm font-semibold focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">
                    Rencana Termin Angsuran
                  </label>
                  <select
                    value={danaTerminCount}
                    onChange={(e) => setDanaTerminCount(Number(e.target.value) || 1)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                  >
                    <option value={1}>1x (Sekaligus Lunas)</option>
                    <option value={2}>2x Angsuran</option>
                    <option value={3}>3x Angsuran</option>
                    <option value={4}>4x Angsuran</option>
                    <option value={6}>6x Angsuran</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Catatan Rencana Pengembalian (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Cicilan setiap tanggal 5"
                  value={danaRencanaCatatan}
                  onChange={(e) => setDanaRencanaCatatan(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">Keperluan</label>
                <textarea
                  rows={2}
                  required
                  value={danaKeperluan}
                  onChange={(e) => setDanaKeperluan(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-[#EFECE2] pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalAddOpen(false);
                    onCloseExternalAdd?.();
                  }}
                  className="rounded-lg border border-[#D4DDD6] bg-white px-4 py-2 text-xs font-medium text-[#34443A]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0D6B48] px-4 py-2 text-xs font-medium text-white hover:bg-[#095438]"
                >
                  Simpan Pinjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cicilan / Pelunasan Pinjaman Dana */}
      {canManage && bayarTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#DDE3DE] bg-white p-6 shadow-xl">
            <h3 className="font-display text-base font-semibold text-[#142019]">
              Catat Angsuran / Pengembalian Pinjaman
            </h3>
            <p className="mt-1 text-xs text-[#59695E]">
              Peminjam: <strong className="text-[#142019]">{bayarTarget.peminjam}</strong> · Sisa{' '}
              {formatRupiah(Math.max(0, bayarTarget.nominal - bayarTarget.sudahDikembalikan))}
            </p>

            {(bayarTarget.riwayatAngsuran?.length || 0) > 0 && (
              <div className="mt-3 rounded-xl border border-[#EFECE2] bg-[#FAF8F1] p-3">
                <p className="text-[11px] font-semibold text-[#435349]">
                  Angsuran Sebelumnya ({bayarTarget.riwayatAngsuran?.length}x):
                </p>
                <div className="mt-1.5 space-y-1 max-h-28 overflow-y-auto">
                  {bayarTarget.riwayatAngsuran?.map((ang, idx) => (
                    <div
                      key={ang.id}
                      className="flex items-center justify-between text-[11px] text-[#526358]"
                    >
                      <span>
                        #{idx + 1} · {formatTanggalIndo(ang.tanggal)}
                      </span>
                      <span className="font-mono font-semibold text-[#0D6B48]">
                        {formatRupiah(ang.nominal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Tanggal Angsuran
                </label>
                <input
                  type="date"
                  required
                  value={bayarTanggal}
                  onChange={(e) => setBayarTanggal(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Nominal Angsuran (Rp)
                </label>
                <input
                  type="number"
                  min={10000}
                  max={Math.max(0, bayarTarget.nominal - bayarTarget.sudahDikembalikan)}
                  step={50000}
                  value={bayarNominal}
                  onChange={(e) => setBayarNominal(Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-sm font-semibold focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Keterangan Angsuran (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Angsuran ke-2 atau Pelunasan via Bendahara"
                  value={bayarKeterangan}
                  onChange={(e) => setBayarKeterangan(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setBayarTarget(null)}
                className="rounded-lg border border-[#D4DDD6] bg-white px-4 py-2 text-xs font-medium text-[#34443A]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onBayarPinjamanDana(
                    bayarTarget.id,
                    bayarNominal,
                    bayarTanggal,
                    bayarKeterangan
                  );
                  setExpandedId(bayarTarget.id);
                  setBayarTarget(null);
                }}
                className="rounded-lg bg-[#0D6B48] px-4 py-2 text-xs font-medium text-white hover:bg-[#095438]"
              >
                Simpan Angsuran
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Atur Rencana Angsuran */}
      {canManage && rencanaTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#DDE3DE] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EFECE2] pb-3">
              <div>
                <h3 className="font-display text-base font-semibold text-[#142019]">
                  Atur Rencana Angsuran — {rencanaTarget.peminjam}
                </h3>
                <p className="text-xs text-[#59695E]">
                  Total pinjaman {formatRupiah(rencanaTarget.nominal)} · Tempo{' '}
                  {formatTanggalIndo(rencanaTarget.jatuhTempo)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRencanaTarget(null)}
                className="rounded-md p-1 text-[#59695E] hover:bg-[#F4F6F4]"
                aria-label="Tutup modal rencana"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#34443A]">
                  Buat Cepat Jadwal Termin:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3, 4, 6].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => {
                        const generated = buildAutoRencanaSchedule(
                          rencanaTarget.tanggalPinjam,
                          rencanaTarget.jatuhTempo,
                          rencanaTarget.nominal,
                          cnt
                        );
                        setRencanaItemsDraft(generated);
                        setRencanaSummaryDraft(
                          cnt === 1
                            ? `1x pelunasan sekaligus pada ${formatTanggalIndo(
                                rencanaTarget.jatuhTempo
                              )}`
                            : `${cnt}x angsuran (~${formatRupiah(
                                Math.round(rencanaTarget.nominal / cnt)
                              )}/termin)`
                        );
                      }}
                      className="rounded-lg border border-[#DFD7BF] bg-[#FCF9F0] px-2.5 py-1 text-[11px] font-semibold text-[#142019] hover:bg-[#F5EED8]"
                    >
                      {cnt}x Termin
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Ringkasan Rencana Pengembalian
                </label>
                <input
                  type="text"
                  value={rencanaSummaryDraft}
                  onChange={(e) => setRencanaSummaryDraft(e.target.value)}
                  placeholder="Contoh: 3x angsuran bulanan @ Rp 500.000"
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#34443A]">
                    Rincian Tanggal & Nominal per Termin
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setRencanaItemsDraft((prev) => [
                        ...prev,
                        {
                          id: `rcn-${Date.now()}`,
                          termin: prev.length + 1,
                          tanggalRencana: rencanaTarget.jatuhTempo,
                          nominalRencana: 250000,
                          catatan: `Angsuran termin ${prev.length + 1}`,
                        },
                      ])
                    }
                    className="text-[11px] font-semibold text-[#0D6B48] hover:underline"
                  >
                    + Tambah Baris Termin
                  </button>
                </div>

                {rencanaItemsDraft.map((item, idx) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 gap-2 rounded-xl border border-[#EFECE2] bg-[#FAF9F4] p-2.5 sm:grid-cols-12 items-center"
                  >
                    <div className="sm:col-span-2 text-[11px] font-semibold text-[#B45309]">
                      Termin {idx + 1}
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="date"
                        value={item.tanggalRencana}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRencanaItemsDraft((prev) =>
                            prev.map((row, rIdx) =>
                              rIdx === idx ? { ...row, tanggalRencana: val } : row
                            )
                          );
                        }}
                        className="w-full rounded-lg border border-[#D4DDD6] bg-white px-2 py-1.5 font-mono text-[11px]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="number"
                        min={10000}
                        step={50000}
                        value={item.nominalRencana}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setRencanaItemsDraft((prev) =>
                            prev.map((row, rIdx) =>
                              rIdx === idx ? { ...row, nominalRencana: val } : row
                            )
                          );
                        }}
                        className="w-full rounded-lg border border-[#D4DDD6] bg-white px-2 py-1.5 font-mono text-[11px]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={item.catatan || ''}
                        placeholder="Catatan..."
                        onChange={(e) => {
                          const val = e.target.value;
                          setRencanaItemsDraft((prev) =>
                            prev.map((row, rIdx) => (rIdx === idx ? { ...row, catatan: val } : row))
                          );
                        }}
                        className="w-full rounded-lg border border-[#D4DDD6] bg-white px-2 py-1.5 text-[11px]"
                      />
                    </div>
                    <div className="sm:col-span-1 text-right">
                      {rencanaItemsDraft.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setRencanaItemsDraft((prev) =>
                              prev
                                .filter((_, rIdx) => rIdx !== idx)
                                .map((row, rIdx) => ({ ...row, termin: rIdx + 1 }))
                            )
                          }
                          className="rounded p-1 text-[#6B7B70] hover:bg-red-50 hover:text-red-700"
                          aria-label="Hapus termin"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3 border-t border-[#EFECE2] pt-4">
              <button
                type="button"
                onClick={() => setRencanaTarget(null)}
                className="rounded-lg border border-[#D4DDD6] bg-white px-4 py-2 text-xs font-medium text-[#34443A]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const normalized = rencanaItemsDraft.map((row, idx) => ({
                    ...row,
                    termin: idx + 1,
                  }));
                  onUpdateRencanaPinjaman(
                    rencanaTarget.id,
                    rencanaSummaryDraft.trim() || `${normalized.length}x rencana termin`,
                    normalized
                  );
                  setExpandedId(rencanaTarget.id);
                  setRencanaTarget(null);
                }}
                className="rounded-lg bg-[#0D6B48] px-4 py-2 text-xs font-medium text-white hover:bg-[#095438]"
              >
                Simpan Rencana Angsuran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
