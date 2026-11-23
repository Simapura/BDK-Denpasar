import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  Anggota,
  JenisTransaksi,
  KategoriKeuangan,
  SkemaIuran,
  TransaksiKeuangan,
} from '../types/pura';
import { formatRupiah, formatTanggalIndo, getMonthLabel } from '../utils/format';

interface KeuanganViewProps {
  anggota: Anggota[];
  transaksi: TransaksiKeuangan[];
  tarifOpsi?: [number, number];
  onAddTransaksi: (trx: Omit<TransaksiKeuangan, 'id'>) => void;
  onDeleteTransaksi: (id: string) => void;
  canManage: boolean;
}

const KATEGORI_MASUK: KategoriKeuangan[] = [
  'Iuran Wajib Bulanan',
  'Iuran Wajib Tahunan',
  'Punia / Sumbangan',
  'Dana Operasional BDK',
];

const KATEGORI_KELUAR: KategoriKeuangan[] = [
  'Banten & Sarana Upacara',
  'Pemeliharaan Pelinggih',
  'Konsumsi Ngayah',
  'Listrik, Air & Kebersihan',
  'Sosial & Suka Duka',
  'Administrasi & Lainnya',
];

const isIuranKategori = (kat: KategoriKeuangan) =>
  kat === 'Iuran Wajib Bulanan' || kat === 'Iuran Wajib Tahunan';

export function KeuanganView({
  anggota,
  transaksi,
  tarifOpsi = [35000, 20000],
  onAddTransaksi,
  onDeleteTransaksi,
  canManage,
}: KeuanganViewProps) {
  const [activeTab, setActiveTab] = useState<'ledger' | 'iuran-matrix'>('ledger');

  const initialMember = anggota[0];
  const initialSkema: SkemaIuran = initialMember?.skemaIuran === 'Tahunan' ? 'Tahunan' : 'Bulanan';
  const initialTarif = initialMember?.iuranWajibBulanan || tarifOpsi[0];

  // Form state
  const [jenis, setJenis] = useState<JenisTransaksi>('Pemasukan');
  const [kategori, setKategori] = useState<KategoriKeuangan>(
    initialSkema === 'Tahunan' ? 'Iuran Wajib Tahunan' : 'Iuran Wajib Bulanan'
  );
  const [tanggal, setTanggal] = useState('2026-11-20');
  const [bulanIuran, setBulanIuran] = useState('2026-11');
  const [tahunIuran, setTahunIuran] = useState('2026');
  const [anggotaId, setAnggotaId] = useState<string>(initialMember?.id || '');
  const [nominal, setNominal] = useState<number>(
    initialSkema === 'Tahunan' ? initialTarif * 12 : initialTarif
  );
  const [uraian, setUraian] = useState('');
  const [dicatatOleh, setDicatatOleh] = useState('Ni Kadek Ceryna Dewi');
  const [keterangan, setKeterangan] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Ledger filter state
  const [filterJenis, setFilterJenis] = useState<'Semua' | JenisTransaksi>('Semua');
  const [searchLedger, setSearchLedger] = useState('');
  const [matrixMonth, setMatrixMonth] = useState('2026-11');

  const totals = useMemo(() => {
    const masuk = transaksi
      .filter((t) => t.jenis === 'Pemasukan')
      .reduce((acc, t) => acc + t.nominal, 0);
    const keluar = transaksi
      .filter((t) => t.jenis === 'Pengeluaran')
      .reduce((acc, t) => acc + t.nominal, 0);
    return { masuk, keluar, saldo: masuk - keluar };
  }, [transaksi]);

  const filteredLedger = useMemo(() => {
    const q = searchLedger.trim().toLowerCase();
    return [...transaksi]
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
      .filter((t) => {
        const matchJenis = filterJenis === 'Semua' || t.jenis === filterJenis;
        const matchQ =
          !q ||
          t.uraian.toLowerCase().includes(q) ||
          t.kategori.toLowerCase().includes(q) ||
          t.dicatatOleh.toLowerCase().includes(q);
        return matchJenis && matchQ;
      });
  }, [transaksi, filterJenis, searchLedger]);

  const matrixYear = matrixMonth.slice(0, 4);

  // Paid map for selected matrixMonth (checks both Monthly payment for matrixMonth AND Annual payment for matrixYear)
  const paidMapForMonth = useMemo(() => {
    const map = new Map<string, { trx: TransaksiKeuangan; jenisBayar: SkemaIuran }>();
    transaksi.forEach((t) => {
      if (t.jenis !== 'Pemasukan' || !t.anggotaId) return;
      if (t.kategori === 'Iuran Wajib Tahunan' && t.tahunIuran === matrixYear) {
        map.set(t.anggotaId, { trx: t, jenisBayar: 'Tahunan' });
      } else if (
        t.kategori === 'Iuran Wajib Bulanan' &&
        t.bulanIuran === matrixMonth &&
        !map.has(t.anggotaId)
      ) {
        map.set(t.anggotaId, { trx: t, jenisBayar: 'Bulanan' });
      }
    });
    return map;
  }, [transaksi, matrixMonth, matrixYear]);

  const handleJenisSwitch = (nextJenis: JenisTransaksi) => {
    setJenis(nextJenis);
    if (nextJenis === 'Pemasukan') {
      const m = anggota.find((a) => a.id === anggotaId);
      const isTahunan = m?.skemaIuran === 'Tahunan';
      setKategori(isTahunan ? 'Iuran Wajib Tahunan' : 'Iuran Wajib Bulanan');
      const base = m?.iuranWajibBulanan || tarifOpsi[0];
      setNominal(isTahunan ? base * 12 : base);
    } else {
      setKategori('Banten & Sarana Upacara');
      setNominal(250000);
    }
  };

  const handleSelectKategori = (nextKat: KategoriKeuangan) => {
    setKategori(nextKat);
    if (jenis === 'Pemasukan' && isIuranKategori(nextKat)) {
      const m = anggota.find((a) => a.id === anggotaId);
      const base = m?.iuranWajibBulanan || tarifOpsi[0];
      setNominal(nextKat === 'Iuran Wajib Tahunan' ? base * 12 : base);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nominal <= 0) return;

    const selectedMember = anggota.find((a) => a.id === anggotaId);
    const isIuran = jenis === 'Pemasukan' && isIuranKategori(kategori);
    const isTahunan = kategori === 'Iuran Wajib Tahunan';
    const computedUraian =
      uraian.trim() ||
      (isIuran && selectedMember
        ? isTahunan
          ? `Iuran Wajib Tahun ${tahunIuran} (12 Bln) - ${selectedMember.nama}`
          : `Iuran Wajib ${getMonthLabel(bulanIuran)} - ${selectedMember.nama}`
        : `${kategori} (${formatTanggalIndo(tanggal)})`);

    onAddTransaksi({
      tanggal,
      jenis,
      kategori,
      uraian: computedUraian,
      nominal,
      anggotaId: isIuran ? anggotaId : undefined,
      bulanIuran: isIuran && !isTahunan ? bulanIuran : undefined,
      tahunIuran: isIuran && isTahunan ? tahunIuran : undefined,
      skemaIuran: isIuran ? (isTahunan ? 'Tahunan' : 'Bulanan') : undefined,
      dicatatOleh: dicatatOleh.trim() || 'Bendahara Pura BDK',
      keterangan: keterangan.trim() || undefined,
    });

    setUraian('');
    setKeterangan('');
    setFeedbackMsg(`Transaksi ${jenis.toLowerCase()} sebesar ${formatRupiah(nominal)} berhasil dicatat.`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleQuickPayMember = (member: Anggota, mode: SkemaIuran = 'Bulanan') => {
    if (paidMapForMonth.has(member.id)) return;
    const base = member.iuranWajibBulanan || tarifOpsi[0];
    if (mode === 'Tahunan') {
      onAddTransaksi({
        tanggal: '2026-11-20',
        jenis: 'Pemasukan',
        kategori: 'Iuran Wajib Tahunan',
        uraian: `Iuran Wajib Tahun ${matrixYear} (12 Bln) - ${member.nama}`,
        nominal: base * 12,
        anggotaId: member.id,
        tahunIuran: matrixYear,
        skemaIuran: 'Tahunan',
        dicatatOleh: 'Ni Kadek Ceryna Dewi',
        keterangan: `Pembayaran sekaligus 1 tahun @ ${formatRupiah(base)}/bln`,
      });
      return;
    }
    onAddTransaksi({
      tanggal: '2026-11-20',
      jenis: 'Pemasukan',
      kategori: 'Iuran Wajib Bulanan',
      uraian: `Iuran Wajib ${getMonthLabel(matrixMonth)} - ${member.nama}`,
      nominal: base,
      anggotaId: member.id,
      bulanIuran: matrixMonth,
      skemaIuran: 'Bulanan',
      dicatatOleh: 'Ni Kadek Ceryna Dewi',
    });
  };

  const activeMembers = anggota.filter((a) => a.status === 'Aktif');
  const paidActiveInMatrix = activeMembers.filter((m) => paidMapForMonth.has(m.id)).length;
  const annualSchemeCount = activeMembers.filter((m) => m.skemaIuran === 'Tahunan').length;
  const monthlySchemeCount = activeMembers.length - annualSchemeCount;

  return (
    <div className="space-y-6">
      {/* Top Financial Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#D4E6EA] bg-[#F9FEFF] p-5">
          <p className="text-xs font-medium text-[#375C6B]">Total Pemasukan Kas Pura</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#0369A1] tabular-nums">
            {formatRupiah(totals.masuk)}
          </p>
        </div>
        <div className="rounded-xl border border-[#EEDAD2] bg-[#FFFAF8] p-5">
          <p className="text-xs font-medium text-[#7C4732]">Total Pengeluaran Kas Pura</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#C2410C] tabular-nums">
            {formatRupiah(totals.keluar)}
          </p>
        </div>
        <div className="rounded-xl border border-[#F5DFA6] bg-gradient-to-r from-[#0F6E4A] to-[#0D8468] p-5 text-white">
          <p className="text-xs font-medium text-[#FDE68A]">Saldo Bersih Kas Pura Saat Ini</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-white tabular-nums">
            {formatRupiah(totals.saldo)}
          </p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 rounded-lg bg-[#E7ECE8] p-1">
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`rounded-md px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'ledger'
                ? 'bg-white text-[#142019] shadow-xs'
                : 'text-[#526358] hover:text-[#142019]'
            }`}
          >
            {canManage ? 'Formulir Pencatatan & Buku Kas' : 'Buku Kas Umum Transparan'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('iuran-matrix')}
            className={`rounded-md px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'iuran-matrix'
                ? 'bg-white text-[#142019] shadow-xs'
                : 'text-[#526358] hover:text-[#142019]'
            }`}
          >
            Kontrol Iuran Wajib ({paidActiveInMatrix}/{activeMembers.length} Lunas)
          </button>
        </div>
      </div>

      {!canManage && (
        <div className="rounded-xl border border-[#DDE3DE] bg-white px-5 py-3 text-xs text-[#435349]">
          Anda masuk sebagai <strong className="text-[#142019]">Pengempon (Hanya Lihat)</strong>. Anda dapat memantau seluruh pemasukan, pengeluaran, serta status iuran bulanan/tahunan secara transparan. Pencatatan transaksi hanya dapat dilakukan oleh Pengurus / Bendahara.
        </div>
      )}

      {activeTab === 'ledger' ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
          {/* Transparent Input Form (Pengurus Only) */}
          {canManage && (
            <section className="rounded-xl border border-[#DDE3DE] bg-white p-6 xl:col-span-5">
            <h2 className="font-display text-base font-semibold text-[#142019]">
              Formulir Pencatatan Keuangan Transparan
            </h2>
            <p className="mt-1 text-xs text-[#59695E]">
              Catat iuran wajib ({formatRupiah(tarifOpsi[0])} / {formatRupiah(tarifOpsi[1])} bulanan atau sekaligus 1 tahun), punia, maupun pengeluaran pura.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-[#F1F4F1] p-1">
              <button
                type="button"
                onClick={() => handleJenisSwitch('Pemasukan')}
                className={`rounded-md py-2 text-xs font-semibold transition-colors ${
                  jenis === 'Pemasukan'
                    ? 'bg-[#0369A1] text-white'
                    : 'text-[#526358] hover:text-[#142019]'
                }`}
              >
                Pemasukan Kas
              </button>
              <button
                type="button"
                onClick={() => handleJenisSwitch('Pengeluaran')}
                className={`rounded-md py-2 text-xs font-semibold transition-colors ${
                  jenis === 'Pengeluaran'
                    ? 'bg-[#C2410C] text-white'
                    : 'text-[#526358] hover:text-[#142019]'
                }`}
              >
                Pengeluaran Kas
              </button>
            </div>

            {feedbackMsg && (
              <div className="mt-4 rounded-lg border border-[#164A34]/30 bg-[#EEF5F0] px-3.5 py-2.5 text-xs font-medium text-[#164A34]">
                {feedbackMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Tanggal Transaksi</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#164A34] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) => handleSelectKategori(e.target.value as KategoriKeuangan)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#164A34] focus:outline-none"
                  >
                    {(jenis === 'Pemasukan' ? KATEGORI_MASUK : KATEGORI_KELUAR).map((kat) => (
                      <option key={kat} value={kat}>
                        {kat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {jenis === 'Pemasukan' && isIuranKategori(kategori) && (
                <div className="space-y-3 rounded-xl border border-[#E7ECE8] bg-[#FAFBF9] p-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#34443A]">
                      Frekuensi Pembayaran Iuran
                    </label>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectKategori('Iuran Wajib Bulanan')}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          kategori === 'Iuran Wajib Bulanan'
                            ? 'border-[#0D6B48] bg-[#ECFDF5] text-[#0D6B48]'
                            : 'border-[#D4DDD6] bg-white text-[#526358]'
                        }`}
                      >
                        Bulanan (1 Bulan)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectKategori('Iuran Wajib Tahunan')}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          kategori === 'Iuran Wajib Tahunan'
                            ? 'border-[#D97706] bg-[#FEF3C7] text-[#92400E]'
                            : 'border-[#D4DDD6] bg-white text-[#526358]'
                        }`}
                      >
                        Sekali Setahun (12 Bln)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-[#34443A]">
                        Nama Anggota Pengempon
                      </label>
                      <select
                        value={anggotaId}
                        onChange={(e) => {
                          setAnggotaId(e.target.value);
                          const m = anggota.find((a) => a.id === e.target.value);
                          if (m) {
                            const nextKat: KategoriKeuangan =
                              m.skemaIuran === 'Tahunan'
                                ? 'Iuran Wajib Tahunan'
                                : 'Iuran Wajib Bulanan';
                            setKategori(nextKat);
                            setNominal(
                              nextKat === 'Iuran Wajib Tahunan'
                                ? m.iuranWajibBulanan * 12
                                : m.iuranWajibBulanan
                            );
                          }
                        }}
                        className="mt-1 w-full rounded-lg border border-[#D4DDD6] bg-white px-3 py-2 text-xs focus:border-[#164A34] focus:outline-none"
                      >
                        {anggota.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nomorInduk} - {m.nama} ({formatRupiah(m.iuranWajibBulanan)} ·{' '}
                            {m.skemaIuran === 'Tahunan' ? 'Tahunan' : 'Bulanan'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {kategori === 'Iuran Wajib Tahunan' ? (
                      <div>
                        <label className="block text-xs font-medium text-[#34443A]">
                          Tahun Iuran (12 Bulan)
                        </label>
                        <select
                          value={tahunIuran}
                          onChange={(e) => setTahunIuran(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[#D4DDD6] bg-white px-3 py-2 font-mono text-xs focus:border-[#164A34] focus:outline-none"
                        >
                          <option value="2025">2025</option>
                          <option value="2026">2026</option>
                          <option value="2027">2027</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-[#34443A]">Bulan Iuran</label>
                        <input
                          type="month"
                          required
                          value={bulanIuran}
                          onChange={(e) => setBulanIuran(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[#D4DDD6] bg-white px-3 py-2 font-mono text-xs focus:border-[#164A34] focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#34443A]">Nominal (Rp)</label>
                {jenis === 'Pemasukan' && isIuranKategori(kategori) && (
                  <div className="mt-1 mb-1.5 flex flex-wrap gap-1.5">
                    {tarifOpsi.map((tarif) => {
                      const targetNominal =
                        kategori === 'Iuran Wajib Tahunan' ? tarif * 12 : tarif;
                      const active = nominal === targetNominal;
                      return (
                        <button
                          key={tarif}
                          type="button"
                          onClick={() => setNominal(targetNominal)}
                          className={`rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${
                            active
                              ? 'border-[#0D6B48] bg-[#ECFDF5] text-[#0D6B48]'
                              : 'border-[#D4DDD6] bg-white text-[#526358] hover:bg-[#F9FAF9]'
                          }`}
                        >
                          {formatRupiah(targetNominal)}{' '}
                          <span className="font-sans font-normal opacity-80">
                            ({kategori === 'Iuran Wajib Tahunan' ? `${formatRupiah(tarif)}×12` : 'Bulanan'})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  required
                  value={nominal}
                  onChange={(e) => setNominal(Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-sm font-semibold text-[#142019] focus:border-[#164A34] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Uraian Transaksi{' '}
                  {jenis === 'Pemasukan' && isIuranKategori(kategori)
                    ? '(opsional, otomatis terisi nama anggota)'
                    : ''}
                </label>
                <input
                  type="text"
                  required={!(jenis === 'Pemasukan' && isIuranKategori(kategori))}
                  placeholder={
                    jenis === 'Pemasukan'
                      ? 'Contoh: Punia Piodalan Purnama Kanem'
                      : 'Contoh: Belanja Banten Pejati & Canang Sari Piodalan'
                  }
                  value={uraian}
                  onChange={(e) => setUraian(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#164A34] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Dicatat Oleh</label>
                  <input
                    type="text"
                    required
                    value={dicatatOleh}
                    onChange={(e) => setDicatatOleh(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#164A34] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">
                    No. Nota / Keterangan
                  </label>
                  <input
                    type="text"
                    placeholder="Opsional"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#164A34] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#158057] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0F6E4A]"
              >
                <Plus className="h-4 w-4" />
                Simpan Transaksi {jenis}
              </button>
            </form>
          </section>
          )}

          {/* Transparent Ledger Table */}
          <section
            className={`rounded-xl border border-[#DDE3DE] bg-white ${
              canManage ? 'xl:col-span-7' : 'xl:col-span-12'
            }`}
          >
            <div className="flex flex-col gap-3 border-b border-[#E9EEEA] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-base font-semibold text-[#142019]">
                  Buku Kas Umum (Transparansi Mutasi)
                </h2>
                <p className="text-xs text-[#59695E]">
                  {filteredLedger.length} entri transaksi keuangan tercatat
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg bg-[#F1F4F1] p-1">
                  {(['Semua', 'Pemasukan', 'Pengeluaran'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFilterJenis(tab)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        filterJenis === tab
                          ? 'bg-white text-[#142019] shadow-xs'
                          : 'text-[#526358]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="relative w-44">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B7B70]" />
                  <input
                    type="text"
                    value={searchLedger}
                    onChange={(e) => setSearchLedger(e.target.value)}
                    placeholder="Cari uraian..."
                    className="w-full rounded-lg border border-[#D4DDD6] py-1.5 pl-8 pr-2.5 text-xs focus:border-[#164A34] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="max-h-[580px] overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-[#E9EEEA] text-[#59695E]">
                    <th className="px-5 py-3 font-medium">Tanggal</th>
                    <th className="px-3 py-3 font-medium">Uraian & Pencatat</th>
                    <th className="px-3 py-3 font-medium">Kategori</th>
                    <th className="px-4 py-3 text-right font-medium">Nominal</th>
                    {canManage && <th className="px-4 py-3 text-right font-medium">Hapus</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F3F0]">
                  {filteredLedger.map((trx) => (
                    <tr key={trx.id} className="hover:bg-[#F9FAF9]">
                      <td className="px-5 py-3 font-mono text-[#526358] tabular-nums whitespace-nowrap">
                        {formatTanggalIndo(trx.tanggal)}
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-[#142019]">{trx.uraian}</p>
                        <p className="text-[11px] text-[#59695E]">
                          Oleh: {trx.dicatatOleh}
                          {trx.keterangan ? ` · ${trx.keterangan}` : ''}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-[#435349] whitespace-nowrap">
                        {trx.kategori}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                          trx.jenis === 'Pemasukan' ? 'text-[#15803D]' : 'text-[#B45309]'
                        }`}
                      >
                        {trx.jenis === 'Pemasukan' ? '+' : '-'} {formatRupiah(trx.nominal)}
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => onDeleteTransaksi(trx.id)}
                            className="rounded p-1 text-[#6B7B70] hover:bg-red-50 hover:text-red-700"
                            aria-label={`Hapus transaksi ${trx.uraian}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : (
        /* Monthly & Annual Dues Checklist Matrix */
        <section className="rounded-xl border border-[#DDE3DE] bg-white">
          <div className="flex flex-col gap-4 border-b border-[#E9EEEA] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-[#142019]">
                Daftar Realisasi Iuran Wajib Pengempon (Bulanan & Tahunan)
              </h2>
              <p className="text-xs text-[#59695E]">
                Periode {getMonthLabel(matrixMonth)} · {paidActiveInMatrix} dari{' '}
                {activeMembers.length} anggota aktif tercatat lunas (termasuk pembayar sekali setahun{' '}
                {matrixYear})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-[#34443A]">Pilih Bulan:</label>
              <input
                type="month"
                value={matrixMonth}
                onChange={(e) => setMatrixMonth(e.target.value)}
                className="rounded-lg border border-[#D4DDD6] px-3 py-1.5 font-mono text-xs focus:border-[#164A34] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 border-b border-[#E9EEEA] bg-[#FAF8F1] px-6 py-4 sm:grid-cols-3 text-xs">
            <div className="rounded-lg border border-[#E7E1CC] bg-white px-4 py-2.5">
              <p className="text-[11px] text-[#59695E]">Kisaran Iuran Tingkat I</p>
              <p className="mt-0.5 font-mono font-semibold text-[#142019]">
                {formatRupiah(tarifOpsi[0])}/bln{' '}
                <span className="font-sans text-[11px] font-normal text-[#59695E]">
                  ({formatRupiah(tarifOpsi[0] * 12)}/thn)
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-[#E7E1CC] bg-white px-4 py-2.5">
              <p className="text-[11px] text-[#59695E]">Kisaran Iuran Tingkat II</p>
              <p className="mt-0.5 font-mono font-semibold text-[#142019]">
                {formatRupiah(tarifOpsi[1])}/bln{' '}
                <span className="font-sans text-[11px] font-normal text-[#59695E]">
                  ({formatRupiah(tarifOpsi[1] * 12)}/thn)
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-[#E7E1CC] bg-white px-4 py-2.5">
              <p className="text-[11px] text-[#59695E]">Skema Anggota Aktif</p>
              <p className="mt-0.5 font-semibold text-[#0D6B48]">
                {monthlySchemeCount} Bulanan · {annualSchemeCount} Sekali Setahun
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E9EEEA] text-[#59695E]">
                  <th className="px-5 py-3 font-medium">No. Induk</th>
                  <th className="px-4 py-3 font-medium">Nama Pengempon</th>
                  <th className="px-4 py-3 font-medium">Status & Skema</th>
                  <th className="px-4 py-3 text-right font-medium">Tarif Iuran</th>
                  <th className="px-4 py-3 font-medium">Status {getMonthLabel(matrixMonth)}</th>
                  {canManage && <th className="px-5 py-3 text-right font-medium">Tindakan Cepat</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F3F0]">
                {anggota.map((member) => {
                  const payment = paidMapForMonth.get(member.id);
                  const isAnnualPref = member.skemaIuran === 'Tahunan';
                  return (
                    <tr key={member.id} className="hover:bg-[#F9FAF9]">
                      <td className="px-5 py-3 font-mono text-[#526358] tabular-nums whitespace-nowrap">
                        {member.nomorInduk}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#142019]">{member.nama}</td>
                      <td className="px-4 py-3 text-[#435349] whitespace-nowrap">
                        <span>{member.status}</span>
                        <span className="mx-1.5 text-[#C5CEC8]">·</span>
                        <span
                          className={`font-medium ${
                            isAnnualPref ? 'text-[#B45309]' : 'text-[#59695E]'
                          }`}
                        >
                          {isAnnualPref ? 'Sekali Setahun' : 'Bulanan'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums whitespace-nowrap">
                        <span className="font-semibold text-[#142019]">
                          {formatRupiah(member.iuranWajibBulanan)}
                        </span>
                        <span className="text-[10px] text-[#59695E]">/bln</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {payment ? (
                          <span
                            className={`inline-flex items-center gap-1.5 font-medium ${
                              payment.jenisBayar === 'Tahunan'
                                ? 'text-[#0D6B48]'
                                : 'text-[#15803D]'
                            }`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {payment.jenisBayar === 'Tahunan'
                              ? `Lunas Tahunan ${matrixYear} (${formatTanggalIndo(payment.trx.tanggal)})`
                              : `Lunas Bulanan (${formatTanggalIndo(payment.trx.tanggal)})`}
                          </span>
                        ) : member.status === 'Nonaktif' ? (
                          <span className="text-[#64748B]">Dibebaskan (Nonaktif)</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-medium text-[#B45309]">
                            <Clock className="h-3.5 w-3.5" />
                            Belum Tercatat
                          </span>
                        )}
                      </td>
                      {canManage && (
                        <td className="px-5 py-3 text-right whitespace-nowrap">
                          {!payment && member.status !== 'Nonaktif' ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleQuickPayMember(member, 'Bulanan')}
                                className="rounded-lg bg-[#158057] px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-[#0F6E4A] whitespace-nowrap"
                              >
                                Catat Bulanan
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickPayMember(member, 'Tahunan')}
                                className="rounded-lg border border-[#D97706]/40 bg-[#FEF3C7] px-2.5 py-1.5 text-[11px] font-medium text-[#92400E] hover:bg-[#FDE68A] whitespace-nowrap"
                                title={`Catat lunas 1 tahun (${formatRupiah(member.iuranWajibBulanan * 12)})`}
                              >
                                Catat 1 Thn
                              </button>
                            </div>
                          ) : (
                            <span className="font-mono text-[11px] text-[#6B7B70]">—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
