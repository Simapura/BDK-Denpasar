import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MessageSquarePlus,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import {
  KategoriSaran,
  SaranMasukan,
  StatusSaran,
  UserSession,
} from '../types/pura';
import { formatTanggalIndo } from '../utils/format';

interface SaranMasukanViewProps {
  saranList: SaranMasukan[];
  session: UserSession;
  canManage: boolean;
  onAddSaran: (item: Omit<SaranMasukan, 'id'>) => void;
  onUpdateSaran: (updated: SaranMasukan) => void;
  onDeleteSaran: (id: string) => void;
}

const KATEGORI_LIST: KategoriSaran[] = [
  'Pelayanan & Fasilitas',
  'Upakara & Piodalan',
  'Keuangan & Iuran',
  'Perlengkapan & Pinjaman',
  'Lainnya',
];

export function SaranMasukanView({
  saranList,
  session,
  canManage,
  onAddSaran,
  onUpdateSaran,
  onDeleteSaran,
}: SaranMasukanViewProps) {
  const [kategori, setKategori] = useState<KategoriSaran>('Pelayanan & Fasilitas');
  const [isiSaran, setIsiSaran] = useState('');
  const [kirimAnonim, setKirimAnonim] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<'Semua' | StatusSaran>('Semua');

  // Pengurus response modal
  const [replyTarget, setReplyTarget] = useState<SaranMasukan | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState<StatusSaran>('Ditindaklanjuti');

  const counts = useMemo(() => {
    return {
      total: saranList.length,
      baru: saranList.filter((s) => s.status === 'Baru').length,
      ditinjau: saranList.filter((s) => s.status === 'Ditinjau').length,
      selesai: saranList.filter((s) => s.status === 'Ditindaklanjuti').length,
    };
  }, [saranList]);

  const filteredSaran = useMemo(() => {
    return [...saranList]
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
      .filter((s) => filterStatus === 'Semua' || s.status === filterStatus);
  }, [saranList, filterStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isiSaran.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    onAddSaran({
      tanggal: today,
      namaPengirim: kirimAnonim ? 'Pengempon (Anonim)' : session.nama,
      kategori,
      isiSaran: isiSaran.trim(),
      status: 'Baru',
    });
    setIsiSaran('');
    setFeedback('Saran dan masukan Anda telah dikirim ke Pengurus Pura BDK Denpasar.');
    setTimeout(() => setFeedback(null), 4000);
  };

  const openReplyModal = (item: SaranMasukan) => {
    setReplyTarget(item);
    setReplyText(item.tanggapanPengurus || '');
    setReplyStatus(item.status === 'Baru' ? 'Ditindaklanjuti' : item.status);
  };

  const handleSaveReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !replyTarget) return;
    onUpdateSaran({
      ...replyTarget,
      status: replyStatus,
      tanggapanPengurus: replyText.trim() || undefined,
      ditanggapiOleh: replyText.trim() ? session.nama : replyTarget.ditanggapiOleh,
    });
    setReplyTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#DCE5DF] bg-white p-5">
          <p className="text-xs font-medium text-[#526358]">Total Masukan Masuk</p>
          <p className="mt-2 font-display text-2xl font-bold text-[#142019] tabular-nums">
            {counts.total}
          </p>
        </div>
        <div className="rounded-2xl border border-[#EDE2C9] bg-[#FFFDF7] p-5">
          <p className="text-xs font-medium text-[#7C5B19]">Menunggu Tinjauan</p>
          <p className="mt-2 font-display text-2xl font-bold text-[#B45309] tabular-nums">
            {counts.baru}
          </p>
        </div>
        <div className="rounded-2xl border border-[#D4E6EA] bg-[#F9FEFF] p-5">
          <p className="text-xs font-medium text-[#375C6B]">Sedang Ditinjau</p>
          <p className="mt-2 font-display text-2xl font-bold text-[#0369A1] tabular-nums">
            {counts.ditinjau}
          </p>
        </div>
        <div className="rounded-2xl border border-[#DCE5DF] bg-[#F4FBF7] p-5">
          <p className="text-xs font-medium text-[#0D6B48]">Sudah Ditindaklanjuti</p>
          <p className="mt-2 font-display text-2xl font-bold text-[#0D6B48] tabular-nums">
            {counts.selesai}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
        {/* Submit Form (Available to All Pengempon & Pengurus) */}
        <section className="rounded-2xl border border-[#E2E4DC] bg-white p-6 xl:col-span-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#0D6B48]">
              <MessageSquarePlus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-[#142019]">
                Kirim Saran atau Masukan
              </h2>
              <p className="text-xs text-[#59695E]">
                Aspirasi pengempon untuk kemajuan pelayanan & kegiatan Pura BDK Denpasar
              </p>
            </div>
          </div>

          {feedback && (
            <div className="mt-4 rounded-xl border border-[#0D6B48]/25 bg-[#ECFDF5] px-4 py-3 text-xs font-medium text-[#0D6B48]">
              {feedback}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#34443A]">Pengirim</label>
              <p className="mt-1 rounded-lg border border-[#E5EAE6] bg-[#F9FAF8] px-3 py-2 text-xs font-medium text-[#142019]">
                {kirimAnonim ? 'Pengempon (Anonim)' : `${session.nama} (${session.role})`}
              </p>
              <label className="mt-2 inline-flex items-center gap-2 text-xs text-[#526358] cursor-pointer">
                <input
                  type="checkbox"
                  checked={kirimAnonim}
                  onChange={(e) => setKirimAnonim(e.target.checked)}
                  className="rounded border-[#C8D3CC] text-[#0D6B48] focus:ring-[#0D6B48]"
                />
                Kirim sebagai anonim (sembunyikan nama saya)
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#34443A]">Kategori Masukan</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value as KategoriSaran)}
                className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
              >
                {KATEGORI_LIST.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#34443A]">
                Isi Saran / Usulan / Masukan
              </label>
              <textarea
                rows={4}
                required
                placeholder="Tuliskan saran terkait piodalan, kebersihan pelinggih, perlengkapan, keuangan, atau fasilitas pura..."
                value={isiSaran}
                onChange={(e) => setIsiSaran(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2.5 text-xs leading-relaxed focus:border-[#0D6B48] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D6B48] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#095438]"
            >
              <Send className="h-3.5 w-3.5" />
              Kirim Saran & Masukan
            </button>
          </form>
        </section>

        {/* Feedback Board */}
        <section className="rounded-2xl border border-[#E2E4DC] bg-white xl:col-span-7">
          <div className="flex flex-col gap-3 border-b border-[#EFECE2] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-[#142019]">
                Kotak Aspirasi & Tanggapan Pengurus
              </h2>
              <p className="text-xs text-[#59695E]">
                Transparansi masukan pengempon dan tindak lanjut pengurus
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-[#F1F4F1] p-1">
              {(['Semua', 'Baru', 'Ditinjau', 'Ditindaklanjuti'] as const).map((tab) => (
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
          </div>

          <div className="divide-y divide-[#EFECE2]">
            {filteredSaran.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#59695E]">
                Belum ada saran atau masukan pada status ini.
              </div>
            ) : (
              filteredSaran.map((item) => (
                <article key={item.id} className="p-6 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-[#142019]">{item.namaPengirim}</p>
                      <p className="text-[11px] text-[#59695E]">
                        {item.kategori} · {formatTanggalIndo(item.tanggal)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          item.status === 'Ditindaklanjuti'
                            ? 'text-[#0D6B48]'
                            : item.status === 'Ditinjau'
                            ? 'text-[#0369A1]'
                            : 'text-[#B45309]'
                        }`}
                      >
                        {item.status === 'Ditindaklanjuti' ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Clock className="h-3.5 w-3.5" />
                        )}
                        {item.status}
                      </span>
                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => openReplyModal(item)}
                            className="rounded-lg border border-[#D4DDD6] bg-white px-2.5 py-1 text-[11px] font-medium text-[#0D6B48] hover:bg-[#ECFDF5]"
                          >
                            Tanggapi
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteSaran(item.id)}
                            className="rounded p-1 text-[#6B7B70] hover:bg-red-50 hover:text-red-700"
                            aria-label="Hapus saran"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-[#26352C]">{item.isiSaran}</p>

                  {item.tanggapanPengurus && (
                    <div className="rounded-xl border border-[#DCE5DF] bg-[#F6FBF8] px-4 py-3 text-xs">
                      <p className="font-semibold text-[#0D6B48]">
                        Tanggapan Pengurus{' '}
                        {item.ditanggapiOleh ? `· ${item.ditanggapiOleh}` : ''}
                      </p>
                      <p className="mt-1 leading-relaxed text-[#34443A]">
                        {item.tanggapanPengurus}
                      </p>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Pengurus Reply Modal */}
      {canManage && replyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#DDE3DE] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EFECE2] px-6 py-4">
              <h3 className="font-display text-base font-semibold text-[#142019]">
                Tanggapi Saran Pengempon
              </h3>
              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                className="rounded-md p-1 text-[#59695E] hover:bg-[#F4F6F4]"
                aria-label="Tutup modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveReply} className="space-y-4 p-6">
              <div className="rounded-xl bg-[#F9FAF8] p-3.5 text-xs text-[#435349]">
                <p className="font-semibold text-[#142019]">{replyTarget.namaPengirim}</p>
                <p className="mt-1 leading-relaxed">{replyTarget.isiSaran}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">Status Tindak Lanjut</label>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value as StatusSaran)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                >
                  <option value="Baru">Baru</option>
                  <option value="Ditinjau">Ditinjau</option>
                  <option value="Ditindaklanjuti">Ditindaklanjuti</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Tanggapan Resmi Pengurus
                </label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan penjelasan atau rencana tindak lanjut pengurus..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-[#EFECE2] pt-4">
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  className="rounded-lg border border-[#D4DDD6] bg-white px-4 py-2 text-xs font-medium text-[#34443A]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0D6B48] px-4 py-2 text-xs font-medium text-white hover:bg-[#095438]"
                >
                  Simpan Tanggapan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
