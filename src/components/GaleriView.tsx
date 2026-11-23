import React, { useMemo, useState } from 'react';
import { Camera, ImagePlus, MapPin, Trash2, Upload, X } from 'lucide-react';
import { DokumentasiItem } from '../types/pura';
import { formatTanggalIndo } from '../utils/format';

interface GaleriViewProps {
  galeri: DokumentasiItem[];
  onAdd: (item: Omit<DokumentasiItem, 'id'>) => void;
  onDelete: (id: string) => void;
  canManage: boolean;
  externalAddOpen?: boolean;
  onCloseExternalAdd?: () => void;
}

const PRESET_IMAGES = [
  {
    label: 'Halaman Pura & Candi Bentar',
    url: '/src/assets/images/pura_bdk_courtyard_1795151447275.jpg',
  },
  {
    label: 'Banten Piodalan & Bale Piyasan',
    url: '/src/assets/images/piodalan_banten_ceremony_1795151447872.jpg',
  },
  {
    label: 'Gotong Royong Pembuatan Penjor',
    url: '/src/assets/images/gotong_royong_pengempon_1795151448570.jpg',
  },
  {
    label: 'Pelinggih Padmasana Pura BDK',
    url: '/src/assets/images/pura_pelinggih_padmasana_1795151448831.jpg',
  },
];

export function GaleriView({
  galeri,
  onAdd,
  onDelete,
  canManage,
  externalAddOpen,
  onCloseExternalAdd,
}: GaleriViewProps) {
  const [kategoriFilter, setKategoriFilter] = useState<'Semua' | DokumentasiItem['kategori']>(
    'Semua'
  );
  const [lightboxItem, setLightboxItem] = useState<DokumentasiItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState<DokumentasiItem['kategori']>('Piodalan');
  const [tanggal, setTanggal] = useState('2026-11-20');
  const [lokasi, setLokasi] = useState('Mandala Utama Pura BDK Denpasar');
  const [fotografer, setFotografer] = useState('Ni Made Dwi Anggraini, A.Md.');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[1].url);
  const [catatan, setCatatan] = useState('');

  const effectiveModalOpen = canManage && (modalOpen || Boolean(externalAddOpen));

  const filteredGaleri = useMemo(() => {
    return [...galeri]
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
      .filter((item) => kategoriFilter === 'Semua' || item.kategori === kategoriFilter);
  }, [galeri, kategoriFilter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const closeModal = () => {
    setModalOpen(false);
    onCloseExternalAdd?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !catatan.trim()) return;
    onAdd({
      judul: judul.trim(),
      kategori,
      tanggal,
      lokasi: lokasi.trim(),
      imageUrl,
      catatan: catatan.trim(),
      fotografer: fotografer.trim() || 'Seksi Dokumentasi',
    });
    setJudul('');
    setCatatan('');
    closeModal();
  };

  return (
    <div className="space-y-6">
      {/* Filter & Upload Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-[#DDE3DE] bg-white p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F1F4F1] p-1 self-start">
          {(
            ['Semua', 'Piodalan', 'Gotong Royong', 'Pemeliharaan Pura', 'Rapat Pengempon'] as const
          ).map((kat) => (
            <button
              key={kat}
              type="button"
              onClick={() => setKategoriFilter(kat)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                kategoriFilter === kat
                  ? 'bg-white text-[#142019] shadow-xs'
                  : 'text-[#526358] hover:text-[#142019]'
              }`}
            >
              {kat}
            </button>
          ))}
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#158057] px-4 py-2 text-xs font-medium text-white hover:bg-[#0F6E4A] whitespace-nowrap self-start lg:self-auto"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            Tambah Dokumentasi Kegiatan
          </button>
        )}
      </div>

      {/* Gallery Grid */}
      {filteredGaleri.length === 0 ? (
        <div className="rounded-xl border border-[#DDE3DE] bg-white p-12 text-center">
          <p className="text-sm font-medium text-[#142019]">
            Belum ada arsip dokumentasi untuk kategori ini.
          </p>
          {canManage && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#158057] px-4 py-2 text-xs font-medium text-white hover:bg-[#0F6E4A]"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Tambah Arsip Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredGaleri.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-xl border border-[#DDE3DE] bg-white transition-colors hover:border-[#158057]/40"
            >
              <button
                type="button"
                onClick={() => setLightboxItem(item)}
                className="relative block aspect-[4/3] w-full overflow-hidden bg-[#E8ECE9] text-left focus-visible:outline-none"
              >
                {failedImages[item.id] ? (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#0F6E4A] to-[#0A4D33] p-6 text-center text-white">
                    <Camera className="h-10 w-10 text-[#E6C578]/90" />
                    <p className="mt-2 text-xs font-medium text-[#E6C578]">
                      Arsip Dokumentasi Pura BDK Denpasar
                    </p>
                  </div>
                ) : (
                  <img
                    src={item.imageUrl}
                    alt={item.judul}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [item.id]: true }))
                    }
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                )}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-xs font-medium text-[#E6C578]">
                    {item.kategori} · {formatTanggalIndo(item.tanggal)}
                  </p>
                  <h3 className="mt-1 font-display text-base font-bold leading-snug">
                    {item.judul}
                  </h3>
                </div>
              </button>

              <div className="p-5 space-y-3">
                <p className="text-xs leading-relaxed text-[#34443A] line-clamp-3">
                  {item.catatan}
                </p>
                <div className="flex items-center justify-between gap-3 border-t border-[#F0F3F0] pt-3 text-[11px] text-[#59695E]">
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-[#158057] shrink-0" />
                    <span className="truncate">{item.lokasi}</span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setLightboxItem(item)}
                      className="font-medium text-[#158057] hover:underline"
                    >
                      Baca Catatan
                    </button>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="rounded p-1 text-[#6B7B70] hover:bg-red-50 hover:text-red-700"
                        aria-label={`Hapus ${item.judul}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Lightbox Detail Modal */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="relative aspect-[16/10] w-full bg-[#0F6E4A]">
              {failedImages[lightboxItem.id] ? (
                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-white">
                  <Camera className="h-12 w-12 text-[#E6C578]/90" />
                  <p className="mt-2 text-xs font-medium text-[#E6C578]">
                    Arsip Dokumentasi Pura BDK Denpasar
                  </p>
                </div>
              ) : (
                <img
                  src={lightboxItem.imageUrl}
                  alt={lightboxItem.judul}
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setFailedImages((prev) => ({ ...prev, [lightboxItem.id]: true }))
                  }
                  className="h-full w-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="absolute right-4 top-4 rounded-lg bg-black/60 p-2 text-white hover:bg-black/80"
                aria-label="Tutup pratinjau"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-xs font-medium text-[#9A7422]">
                {lightboxItem.kategori} · {formatTanggalIndo(lightboxItem.tanggal)} ·{' '}
                {lightboxItem.lokasi}
              </p>
              <h3 className="font-display text-xl font-bold text-[#142019]">
                {lightboxItem.judul}
              </h3>
              <p className="text-sm leading-relaxed text-[#2D3B33]">{lightboxItem.catatan}</p>
              <p className="flex items-center gap-1.5 pt-2 text-xs text-[#59695E]">
                <Camera className="h-3.5 w-3.5 text-[#158057]" />
                Dokumentasi oleh: {lightboxItem.fotografer}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Documentation Modal */}
      {effectiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[#DDE3DE] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E9EEEA] px-6 py-4">
              <h3 className="font-display text-base font-semibold text-[#142019]">
                Arsip Dokumentasi & Catatan Kegiatan Baru
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
              <div>
                <label className="block text-xs font-medium text-[#34443A]">Judul Kegiatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Persembahyangan Bersama Purnama Kanem"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#158057] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) =>
                      setKategori(e.target.value as DokumentasiItem['kategori'])
                    }
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#158057] focus:outline-none"
                  >
                    <option value="Piodalan">Piodalan</option>
                    <option value="Gotong Royong">Gotong Royong</option>
                    <option value="Pemeliharaan Pura">Pemeliharaan Pura</option>
                    <option value="Rapat Pengempon">Rapat Pengempon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Tanggal Kegiatan</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#158057] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Lokasi Pura</label>
                  <input
                    type="text"
                    required
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#158057] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">
                    Petugas Dokumentasi
                  </label>
                  <input
                    type="text"
                    value={fotografer}
                    onChange={(e) => setFotografer(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#158057] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Unggah Foto dari Perangkat atau Pilih Arsip Pura
                </label>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#D4DDD6] bg-[#F8FAF8] px-3 py-2 text-xs font-medium text-[#142019] hover:bg-[#EFF3F0]">
                    <Upload className="h-3.5 w-3.5 text-[#158057]" />
                    <span>Pilih File Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <select
                    value={PRESET_IMAGES.some((p) => p.url === imageUrl) ? imageUrl : ''}
                    onChange={(e) => {
                      if (e.target.value) setImageUrl(e.target.value);
                    }}
                    className="flex-1 rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#164A34] focus:outline-none"
                  >
                    <option value="">-- Atau pilih foto arsip pura --</option>
                    {PRESET_IMAGES.map((img) => (
                      <option key={img.url} value={img.url}>
                        {img.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Catatan Pelaksanaan Kegiatan
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ringkasan jalannya upacara, jumlah pengempon yang hadir, atau keterangan pemeliharaan..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs leading-relaxed focus:border-[#164A34] focus:outline-none"
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
                  Simpan Dokumentasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
