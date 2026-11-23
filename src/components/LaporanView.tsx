import React, { useMemo, useRef, useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Download,
  FileCode,
  FileJson,
  Printer,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';
import { PuraDatabase } from '../types/pura';
import {
  downloadTextFile,
  exportToCsv,
  formatRupiah,
  formatTanggalIndo,
  getMonthLabel,
} from '../utils/format';
import {
  copyTextWithFallback,
  fetchSingleFileHtmlBundle,
} from '../utils/singleFileExport';

interface LaporanViewProps {
  data: PuraDatabase;
  onImportDatabase: (db: PuraDatabase) => void;
  onResetDatabase: () => void;
  canManage: boolean;
}

export function LaporanView({
  data,
  onImportDatabase,
  onResetDatabase,
  canManage,
}: LaporanViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [singleFileCode, setSingleFileCode] = useState<string | null>(null);
  const [singleFileLoading, setSingleFileLoading] = useState(false);
  const [singleFileStatus, setSingleFileStatus] = useState<string | null>(null);
  const [copiedSingleFile, setCopiedSingleFile] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const codeTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    data.transaksi.forEach((t) => {
      if (t.tanggal.length >= 7) months.add(t.tanggal.slice(0, 7));
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [data.transaksi]);

  const filteredTx = useMemo(() => {
    if (selectedPeriod === 'ALL') return data.transaksi;
    return data.transaksi.filter((t) => t.tanggal.startsWith(selectedPeriod));
  }, [data.transaksi, selectedPeriod]);

  const breakdown = useMemo(() => {
    const masukMap = new Map<string, number>();
    const keluarMap = new Map<string, number>();
    let totalMasuk = 0;
    let totalKeluar = 0;

    filteredTx.forEach((t) => {
      if (t.jenis === 'Pemasukan') {
        totalMasuk += t.nominal;
        masukMap.set(t.kategori, (masukMap.get(t.kategori) || 0) + t.nominal);
      } else {
        totalKeluar += t.nominal;
        keluarMap.set(t.kategori, (keluarMap.get(t.kategori) || 0) + t.nominal);
      }
    });

    return {
      totalMasuk,
      totalKeluar,
      saldoPeriode: totalMasuk - totalKeluar,
      masukByCat: Array.from(masukMap.entries()),
      keluarByCat: Array.from(keluarMap.entries()),
    };
  }, [filteredTx]);

  const handleExportLedgerCsv = () => {
    exportToCsv(
      `laporan-keuangan-pura-bdk-${selectedPeriod}.csv`,
      ['Tanggal', 'Jenis', 'Kategori', 'Uraian', 'Nominal (Rp)', 'Dicatat Oleh', 'Keterangan'],
      filteredTx.map((t) => [
        t.tanggal,
        t.jenis,
        t.kategori,
        t.uraian,
        t.nominal,
        t.dicatatOleh,
        t.keterangan || '',
      ])
    );
  };

  const handleExportBackupJson = () => {
    downloadTextFile(
      `backup-simapura-bdk-denpasar-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(data, null, 2),
      'application/json;charset=utf-8'
    );
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (
          parsed &&
          Array.isArray(parsed.anggota) &&
          Array.isArray(parsed.piodalan) &&
          Array.isArray(parsed.transaksi)
        ) {
          onImportDatabase(parsed as PuraDatabase);
          setImportStatus('Data cadangan (backup JSON) berhasil dipulihkan.');
        } else {
          setImportStatus('Format file JSON tidak sesuai struktur SIMAPURA (Sistem Manajemen Pura BDK Denpasar).');
        }
      } catch {
        setImportStatus('Gagal membaca file JSON. Pastikan file tidak rusak.');
      }
      setTimeout(() => setImportStatus(null), 5000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const loadSingleFileBundle = async (): Promise<string | null> => {
    if (singleFileCode) return singleFileCode;
    setSingleFileLoading(true);
    try {
      const code = await fetchSingleFileHtmlBundle();
      if (code) {
        setSingleFileCode(code);
        return code;
      }
      setSingleFileStatus(
        'Berkas HTML tunggal belum tersedia. Silakan jalankan build produksi terlebih dahulu.'
      );
      return null;
    } finally {
      setSingleFileLoading(false);
    }
  };

  const handleCopySingleFile = async () => {
    setSingleFileStatus(null);
    const code = await loadSingleFileBundle();
    if (!code) return;
    const ok = await copyTextWithFallback(code);
    const sizeKb = Math.round(code.length / 1024);
    if (ok) {
      setCopiedSingleFile(true);
      setSingleFileStatus(
        `Berhasil menyalin seluruh kode HTML + CSS + JS (~${sizeKb.toLocaleString('id-ID')} KB). Tinggal tempel (Ctrl+V) ke file .html.`
      );
      setTimeout(() => setCopiedSingleFile(false), 3500);
    } else {
      setCodeModalOpen(true);
      setSingleFileStatus(
        'Clipboard otomatis dibatasi browser. Silakan klik "Pilih Semua" lalu tekan Ctrl+C pada jendela kode.'
      );
    }
  };

  const handleDownloadSingleFile = async () => {
    setSingleFileStatus(null);
    const code = await loadSingleFileBundle();
    if (!code) return;
    downloadTextFile(
      'simapura-bdk-denpasar-tunggal.html',
      code,
      'text/html;charset=utf-8'
    );
    const sizeKb = Math.round(code.length / 1024);
    setSingleFileStatus(
      `File tunggal simapura-bdk-denpasar-tunggal.html (~${sizeKb.toLocaleString('id-ID')} KB) berhasil diunduh.`
    );
  };

  const handleOpenCodeModal = async () => {
    setSingleFileStatus(null);
    const code = await loadSingleFileBundle();
    if (code) {
      setCodeModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Toolbar */}
      <div className="no-print flex flex-col gap-4 rounded-xl border border-[#DDE3DE] bg-white p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-medium text-[#34443A]">Periode Laporan:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-lg border border-[#D4DDD6] bg-white px-3 py-2 text-xs font-medium text-[#142019] focus:border-[#158057] focus:outline-none"
          >
            <option value="ALL">Semua Periode Tercatat</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {getMonthLabel(m)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportLedgerCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DDD6] bg-white px-3.5 py-2 text-xs font-medium text-[#142019] hover:bg-[#F4F6F4]"
          >
            <Download className="h-3.5 w-3.5 text-[#158057]" />
            Ekspor CSV
          </button>
          {canManage && (
            <>
              <button
                type="button"
                onClick={handleExportBackupJson}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DDD6] bg-white px-3.5 py-2 text-xs font-medium text-[#142019] hover:bg-[#F4F6F4]"
              >
                <FileJson className="h-3.5 w-3.5 text-[#158057]" />
                Unduh Backup JSON
              </button>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#D4DDD6] bg-white px-3.5 py-2 text-xs font-medium text-[#142019] hover:bg-[#F4F6F4]">
                <Upload className="h-3.5 w-3.5 text-[#158057]" />
                <span>Impor Backup</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImportJson}
                  className="sr-only"
                />
              </label>
            </>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#158057] px-4 py-2 text-xs font-medium text-white hover:bg-[#0F6E4A]"
          >
            <Printer className="h-3.5 w-3.5" />
            Cetak Laporan Resmi
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="no-print rounded-xl border border-[#158057]/30 bg-[#EEF5F0] px-5 py-3 text-xs font-medium text-[#158057]">
          {importStatus}
        </div>
      )}

      {/* Single-File HTML + CSS + JS Bundle Card */}
      <section className="no-print rounded-xl border border-[#D4DDD6] bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF5F0] text-[#158057]">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-[#142019]">
                Kode 1 File Tunggal (HTML + CSS + JavaScript Siap Copas)
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#59695E]">
                Seluruh tampilan, gaya Tailwind CSS, logika aplikasi, AD/ART, Rencana Kerja, Suka Duka,
                Iuran, Keuangan, Pinjaman, Perlengkapan, Galeri, dan Saran digabung menjadi satu berkas{' '}
                <span className="font-mono font-medium text-[#142019]">.html</span> siap salin atau simpan offline.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={singleFileLoading}
              onClick={handleCopySingleFile}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#158057] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#0F6E4A] disabled:opacity-60"
            >
              {copiedSingleFile ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {singleFileLoading
                ? 'Menyiapkan Kode...'
                : copiedSingleFile
                ? 'Tersalin ke Clipboard'
                : 'Salin Kode 1 File'}
            </button>
            <button
              type="button"
              disabled={singleFileLoading}
              onClick={handleDownloadSingleFile}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DDD6] bg-white px-3.5 py-2 text-xs font-medium text-[#142019] hover:bg-[#F4F6F4] disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5 text-[#158057]" />
              Unduh File (.html)
            </button>
            <button
              type="button"
              disabled={singleFileLoading}
              onClick={handleOpenCodeModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DDD6] bg-white px-3.5 py-2 text-xs font-medium text-[#142019] hover:bg-[#F4F6F4] disabled:opacity-60"
            >
              <Code2 className="h-3.5 w-3.5 text-[#158057]" />
              Lihat Kode Siap Copas
            </button>
          </div>
        </div>
        {singleFileStatus && (
          <p className="mt-3 rounded-lg border border-[#158057]/25 bg-[#F4F9F6] px-3.5 py-2 text-xs font-medium text-[#158057]">
            {singleFileStatus}
          </p>
        )}
      </section>

      {/* Official Printable Report Sheet */}
      <article className="print-area rounded-xl border border-[#DDE3DE] bg-white p-6 sm:p-8">
        <header className="border-b border-[#E9EEEA] pb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-[#9A7422]">
              SIMAPURA · Pengempon Pura Balai Diklat Keagamaan Denpasar
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-[#142019]">
              Laporan Pertanggungjawaban Keuangan & Administrasi
            </h2>
            <p className="mt-1 text-xs text-[#59695E]">
              Periode:{' '}
              {selectedPeriod === 'ALL'
                ? 'Seluruh Periode Tercatat'
                : getMonthLabel(selectedPeriod)}
            </p>
          </div>
          <div className="text-left sm:text-right font-mono text-xs text-[#59695E] tabular-nums">
            <p>Total Anggota: {data.anggota.length} orang</p>
            <p>Aktif: {data.anggota.filter((a) => a.status === 'Aktif').length} orang</p>
          </div>
        </header>

        {/* Financial Summary Figures */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-b border-[#E9EEEA] pb-6 sm:grid-cols-3">
          <div>
            <p className="text-xs text-[#59695E]">Total Pemasukan Periode</p>
            <p className="mt-1 font-mono text-xl font-semibold text-[#15803D] tabular-nums">
              {formatRupiah(breakdown.totalMasuk)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#59695E]">Total Pengeluaran Periode</p>
            <p className="mt-1 font-mono text-xl font-semibold text-[#B45309] tabular-nums">
              {formatRupiah(breakdown.totalKeluar)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#59695E]">Selisih / Saldo Kas Periode</p>
            <p className="mt-1 font-mono text-xl font-semibold text-[#142019] tabular-nums">
              {formatRupiah(breakdown.saldoPeriode)}
            </p>
          </div>
        </div>

        {/* Category Breakdowns */}
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h3 className="font-display text-sm font-semibold text-[#142019]">
              Rincian Pemasukan per Pos
            </h3>
            <div className="mt-3 space-y-3">
              {breakdown.masukByCat.length === 0 ? (
                <p className="text-xs text-[#59695E]">Tidak ada pemasukan pada periode ini.</p>
              ) : (
                breakdown.masukByCat.map(([cat, amount]) => {
                  const pct =
                    breakdown.totalMasuk > 0
                      ? Math.round((amount / breakdown.totalMasuk) * 100)
                      : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#34443A]">{cat}</span>
                        <span className="font-mono font-medium text-[#0369A1] tabular-nums">
                          {formatRupiah(amount)} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#E6F2F8]">
                        <div
                          className="h-full rounded-full bg-[#0284C7]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-[#142019]">
              Rincian Pengeluaran per Pos
            </h3>
            <div className="mt-3 space-y-3">
              {breakdown.keluarByCat.length === 0 ? (
                <p className="text-xs text-[#59695E]">Tidak ada pengeluaran pada periode ini.</p>
              ) : (
                breakdown.keluarByCat.map(([cat, amount]) => {
                  const pct =
                    breakdown.totalKeluar > 0
                      ? Math.round((amount / breakdown.totalKeluar) * 100)
                      : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#34443A]">{cat}</span>
                        <span className="font-mono font-medium text-[#C2410C] tabular-nums">
                          {formatRupiah(amount)} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#FCECE6]">
                        <div
                          className="h-full rounded-full bg-[#EA580C]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Detailed Transaction Summary Table */}
        <div className="mt-8 border-t border-[#E9EEEA] pt-6">
          <h3 className="font-display text-sm font-semibold text-[#142019]">
            Lampiran Mutasi Transaksi ({filteredTx.length} Baris)
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E9EEEA] text-[#59695E]">
                  <th className="py-2.5 pr-4 font-medium">Tanggal</th>
                  <th className="py-2.5 pr-4 font-medium">Kategori</th>
                  <th className="py-2.5 pr-4 font-medium">Uraian</th>
                  <th className="py-2.5 text-right font-medium">Masuk</th>
                  <th className="py-2.5 text-right font-medium">Keluar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F3F0]">
                {filteredTx.map((t) => (
                  <tr key={t.id}>
                    <td className="py-2 pr-4 font-mono text-[#526358] tabular-nums whitespace-nowrap">
                      {formatTanggalIndo(t.tanggal)}
                    </td>
                    <td className="py-2 pr-4 text-[#435349] whitespace-nowrap">{t.kategori}</td>
                    <td className="py-2 pr-4 text-[#142019]">{t.uraian}</td>
                    <td className="py-2 text-right font-mono text-[#15803D] tabular-nums whitespace-nowrap">
                      {t.jenis === 'Pemasukan' ? formatRupiah(t.nominal) : '—'}
                    </td>
                    <td className="py-2 text-right font-mono text-[#B45309] tabular-nums whitespace-nowrap">
                      {t.jenis === 'Pengeluaran' ? formatRupiah(t.nominal) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Official Sign-Off */}
        <footer className="mt-10 grid grid-cols-1 gap-6 border-t border-[#E9EEEA] pt-6 text-xs text-[#435349] sm:grid-cols-2">
          <div>
            <p className="text-[#59695E]">Mengetahui, Ketua Pengempon Pura BDK Denpasar</p>
            <p className="mt-8 font-semibold text-[#142019]">
              {data.pengesahanAdArt.ketuaPura}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-[#59695E]">Denpasar · Bendahara I Pura BDK Denpasar</p>
            <p className="mt-8 font-semibold text-[#142019]">
              {data.anggota.find((a) => a.jabatan.toLowerCase().includes('bendahara i'))?.nama ||
                'Ni Kadek Ceryna Dewi'}
            </p>
          </div>
        </footer>
      </article>

      {/* Maintenance Reset Utility (Pengurus Only) */}
      {canManage && (
        <div className="no-print flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#DDE3DE] bg-white px-6 py-4">
          <div>
            <p className="text-xs font-semibold text-[#142019]">
              Pemeliharaan Penyimpanan Lokal Perangkat
            </p>
            <p className="text-[11px] text-[#59695E]">
              Seluruh perubahan anggota, jadwal, dokumentasi, dan transaksi tersimpan otomatis di
              browser ini.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset ke Data Awal
          </button>
        </div>
      )}

      {confirmResetOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#DDE3DE] bg-white p-6 shadow-xl">
            <h3 className="font-display text-base font-semibold text-[#142019]">
              Reset Data Sistem?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#435349]">
              Tindakan ini akan mengembalikan seluruh daftar anggota, jadwal piodalan, dan buku kas
              ke data awal (30 anggota standar). Pastikan Anda telah mengunduh backup JSON jika
              diperlukan.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="rounded-lg border border-[#D4DDD6] bg-white px-4 py-2 text-xs font-medium text-[#34443A] hover:bg-[#F4F6F4]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDatabase();
                  setConfirmResetOpen(false);
                }}
                className="rounded-lg bg-red-700 px-4 py-2 text-xs font-medium text-white hover:bg-red-800"
              >
                Ya, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
      {codeModalOpen && singleFileCode && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-[#DDE3DE] bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-[#E9EEEA] px-6 py-4">
              <div>
                <h3 className="font-display text-base font-semibold text-[#142019]">
                  Kode Tunggal HTML + CSS + JavaScript (Siap Copas)
                </h3>
                <p className="mt-0.5 text-xs text-[#59695E]">
                  Ukuran total: {Math.round(singleFileCode.length / 1024).toLocaleString('id-ID')} KB ·{' '}
                  {singleFileCode.length.toLocaleString('id-ID')} karakter
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCodeModalOpen(false)}
                className="rounded-md p-1.5 text-[#59695E] hover:bg-[#F4F6F4]"
                aria-label="Tutup jendela kode"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-5">
              <textarea
                ref={codeTextareaRef}
                readOnly
                value={singleFileCode}
                onFocus={(e) => e.currentTarget.select()}
                className="h-[54vh] w-full resize-none rounded-lg border border-[#D4DDD6] bg-[#FAFBF9] p-3 font-mono text-[11px] leading-relaxed text-[#142019] focus:border-[#158057] focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E9EEEA] px-6 py-4">
              <p className="text-[11px] text-[#59695E]">
                Tips: Klik tombol &ldquo;Pilih Semua &amp; Salin&rdquo;, lalu simpan sebagai{' '}
                <span className="font-mono text-[#142019]">index.html</span>.
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    codeTextareaRef.current?.focus();
                    codeTextareaRef.current?.select();
                    void handleCopySingleFile();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#158057] px-4 py-2 text-xs font-medium text-white hover:bg-[#0F6E4A]"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Pilih Semua &amp; Salin
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSingleFile}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DDD6] bg-white px-4 py-2 text-xs font-medium text-[#142019] hover:bg-[#F4F6F4]"
                >
                  <Download className="h-3.5 w-3.5 text-[#158057]" />
                  Unduh .html
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
