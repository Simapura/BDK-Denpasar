import React, { useMemo, useState } from 'react';
import { BookOpen, Download, Edit3, Plus, Printer, Search, X } from 'lucide-react';
import { PasalAdArt, PuraDatabase } from '../types/pura';
import { downloadTextFile, formatTanggalIndo } from '../utils/format';

interface AdArtViewProps {
  adArt: PasalAdArt[];
  pengesahan: PuraDatabase['pengesahanAdArt'];
  onAddPasal: (pasal: Omit<PasalAdArt, 'id'>) => void;
  onUpdatePasal: (pasal: PasalAdArt) => void;
  canManage: boolean;
  externalAddOpen?: boolean;
  onCloseExternalAdd?: () => void;
}

export function AdArtView({
  adArt,
  pengesahan,
  onAddPasal,
  onUpdatePasal,
  canManage,
  externalAddOpen,
  onCloseExternalAdd,
}: AdArtViewProps) {
  const [bagianFilter, setBagianFilter] = useState<'Semua' | 'Anggaran Dasar' | 'Anggaran Rumah Tangga'>('Semua');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPasal, setEditingPasal] = useState<PasalAdArt | null>(null);
  const [formBagian, setFormBagian] = useState<'Anggaran Dasar' | 'Anggaran Rumah Tangga'>(
    'Anggaran Dasar'
  );
  const [formBab, setFormBab] = useState('BAB V');
  const [formJudul, setFormJudul] = useState('');
  const [formIsiText, setFormIsiText] = useState('');

  const effectiveModalOpen = canManage && (modalOpen || Boolean(externalAddOpen));

  const filteredPasal = useMemo(() => {
    const q = search.trim().toLowerCase();
    return adArt.filter((item) => {
      const matchBagian = bagianFilter === 'Semua' || item.bagian === bagianFilter;
      const matchSearch =
        !q ||
        item.bab.toLowerCase().includes(q) ||
        item.judul.toLowerCase().includes(q) ||
        item.isi.some((line) => line.toLowerCase().includes(q));
      return matchBagian && matchSearch;
    });
  }, [adArt, bagianFilter, search]);

  const handleDownloadDocument = () => {
    const lines: string[] = [
      '====================================================================',
      'ANGGARAN DASAR & ANGGARAN RUMAH TANGGA (AD/ART)',
      'PENGEMPON PURA BALAI DIKLAT KEAGAMAAN (BDK) DENPASAR',
      '====================================================================',
      `Nomor Keputusan : ${pengesahan.nomorKeputusan}`,
      `Tanggal Penetapan: ${formatTanggalIndo(pengesahan.tanggalPenetapan)}`,
      '',
    ];

    (['Anggaran Dasar', 'Anggaran Rumah Tangga'] as const).forEach((bagian) => {
      lines.push('--------------------------------------------------------------------');
      lines.push(bagian.toUpperCase());
      lines.push('--------------------------------------------------------------------');
      adArt
        .filter((p) => p.bagian === bagian)
        .forEach((p) => {
          lines.push(`\n${p.bab} - ${p.judul}`);
          p.isi.forEach((ayat, idx) => {
            lines.push(`  ${idx + 1}. ${ayat}`);
          });
        });
      lines.push('');
    });

    lines.push('--------------------------------------------------------------------');
    lines.push(`Ketua Pengempon  : ${pengesahan.ketuaPura}`);
    lines.push(`Sekretaris Pura  : ${pengesahan.sekretarisPura}`);
    lines.push(`Penasihat/Sesepuh: ${pengesahan.penasihat}`);
    downloadTextFile('AD-ART-Pura-BDK-Denpasar.txt', lines.join('\n'));
  };

  const openAdd = () => {
    setEditingPasal(null);
    setFormBagian('Anggaran Rumah Tangga');
    setFormBab('BAB IV');
    setFormJudul('');
    setFormIsiText('');
    setModalOpen(true);
  };

  const openEdit = (pasal: PasalAdArt) => {
    setEditingPasal(pasal);
    setFormBagian(pasal.bagian);
    setFormBab(pasal.bab);
    setFormJudul(pasal.judul);
    setFormIsiText(pasal.isi.join('\n'));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPasal(null);
    onCloseExternalAdd?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isi = formIsiText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!formJudul.trim() || isi.length === 0) return;

    if (editingPasal) {
      onUpdatePasal({
        id: editingPasal.id,
        bagian: formBagian,
        bab: formBab,
        judul: formJudul,
        isi,
      });
    } else {
      onAddPasal({
        bagian: formBagian,
        bab: formBab,
        judul: formJudul,
        isi,
      });
    }
    closeModal();
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="no-print flex flex-col gap-4 rounded-xl border border-[#DDE3DE] bg-white p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-1 rounded-lg bg-[#F1F4F1] p-1 self-start">
          {(['Semua', 'Anggaran Dasar', 'Anggaran Rumah Tangga'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setBagianFilter(tab)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                bagianFilter === tab
                  ? 'bg-white text-[#142019] shadow-xs'
                  : 'text-[#526358] hover:text-[#142019]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-56 sm:flex-initial">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7B70]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pasal atau kata kunci..."
              className="w-full rounded-lg border border-[#D4DDD6] bg-white py-2 pl-9 pr-3 text-xs text-[#142019] focus:border-[#158057] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DDD6] bg-white px-3.5 py-2 text-xs font-medium text-[#142019] hover:bg-[#F4F6F4] whitespace-nowrap"
          >
            <Printer className="h-3.5 w-3.5 text-[#158057]" />
            Cetak
          </button>
          <button
            type="button"
            onClick={handleDownloadDocument}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DDD6] bg-white px-3.5 py-2 text-xs font-medium text-[#142019] hover:bg-[#F4F6F4] whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5 text-[#158057]" />
            Unduh AD/ART
          </button>
          {canManage && (
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#158057] px-4 py-2 text-xs font-medium text-white hover:bg-[#0F6E4A] whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Bab / Pasal
            </button>
          )}
        </div>
      </div>

      {/* Layout: Index Sidebar + Authoritative Document Canvas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <aside className="no-print rounded-xl border border-[#DDE3DE] bg-white p-5 lg:col-span-4">
          <div className="flex items-center gap-2 border-b border-[#E9EEEA] pb-3">
            <BookOpen className="h-4 w-4 text-[#158057]" />
            <h2 className="font-display text-sm font-semibold text-[#142019]">
              Daftar Bab & Pasal
            </h2>
          </div>
          <ul className="mt-3 space-y-1">
            {filteredPasal.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="block rounded-lg px-3 py-2 text-xs transition-colors hover:bg-[#F1F5F2]"
                >
                  <p className="font-mono text-[11px] font-medium text-[#158057]">
                    {item.bagian} · {item.bab}
                  </p>
                  <p className="font-medium text-[#142019]">{item.judul}</p>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-[#E9EEEA] pt-4 text-xs text-[#59695E] space-y-1">
            <p className="font-semibold text-[#142019]">Pengesahan Dokumen</p>
            <p className="font-mono text-[11px]">{pengesahan.nomorKeputusan}</p>
            <p>Ditetapkan: {formatTanggalIndo(pengesahan.tanggalPenetapan)}</p>
            <p>Ketua: {pengesahan.ketuaPura}</p>
            <p>Sekretaris: {pengesahan.sekretarisPura}</p>
          </div>
        </aside>

        <article className="print-area rounded-xl border border-[#DDE3DE] bg-white p-6 sm:p-8 lg:col-span-8">
          <header className="border-b border-[#E9EEEA] pb-6 text-center">
            <p className="text-xs font-medium text-[#9A7422]">
              Pengempon Pura Balai Diklat Keagamaan Denpasar
            </p>
            <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-[#142019]">
              Anggaran Dasar & Anggaran Rumah Tangga (AD/ART)
            </h2>
            <p className="mt-1.5 font-mono text-xs text-[#59695E]">
              Nomor Keputusan: {pengesahan.nomorKeputusan} · Ditetapkan{' '}
              {formatTanggalIndo(pengesahan.tanggalPenetapan)}
            </p>
          </header>

          <div className="mt-6 space-y-8">
            {filteredPasal.map((pasal) => (
              <section
                key={pasal.id}
                id={pasal.id}
                className="scroll-mt-20 border-b border-[#F0F3F0] pb-6 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-[#158057]">
                      {pasal.bagian} · {pasal.bab}
                    </p>
                    <h3 className="mt-0.5 font-display text-base font-bold text-[#142019]">
                      {pasal.judul}
                    </h3>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => openEdit(pasal)}
                      className="no-print inline-flex items-center gap-1 rounded-md border border-[#DDE3DE] px-2.5 py-1 text-[11px] font-medium text-[#435349] hover:bg-[#F4F6F4]"
                    >
                      <Edit3 className="h-3 w-3" />
                      Edit
                    </button>
                  )}
                </div>
                <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-[#2D3B33]">
                  {pasal.isi.map((ayat, idx) => (
                    <p key={idx}>{ayat}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <footer className="mt-8 grid grid-cols-1 gap-6 border-t border-[#E9EEEA] pt-6 text-xs text-[#435349] sm:grid-cols-3">
            <div>
              <p className="text-[#59695E]">Mengetahui, Penasihat/Sesepuh</p>
              <p className="mt-6 font-semibold text-[#142019]">{pengesahan.penasihat}</p>
            </div>
            <div>
              <p className="text-[#59695E]">Ketua Pengempon Pura</p>
              <p className="mt-6 font-semibold text-[#142019]">{pengesahan.ketuaPura}</p>
            </div>
            <div>
              <p className="text-[#59695E]">Sekretaris I</p>
              <p className="mt-6 font-semibold text-[#142019]">{pengesahan.sekretarisPura}</p>
            </div>
          </footer>
        </article>
      </div>

      {/* Add / Edit Pasal Modal */}
      {effectiveModalOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#DDE3DE] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E9EEEA] px-6 py-4">
              <h3 className="font-display text-base font-semibold text-[#142019]">
                {editingPasal ? 'Perbarui Ketentuan AD/ART' : 'Tambah Bab / Pasal AD/ART'}
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
                  <label className="block text-xs font-medium text-[#34443A]">Bagian Dokumen</label>
                  <select
                    value={formBagian}
                    onChange={(e) =>
                      setFormBagian(
                        e.target.value as 'Anggaran Dasar' | 'Anggaran Rumah Tangga'
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#158057] focus:outline-none"
                  >
                    <option value="Anggaran Dasar">Anggaran Dasar</option>
                    <option value="Anggaran Rumah Tangga">Anggaran Rumah Tangga</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Nomor Bab</label>
                  <input
                    type="text"
                    required
                    value={formBab}
                    onChange={(e) => setFormBab(e.target.value)}
                    placeholder="Contoh: BAB V"
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#158057] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">Judul Bab</label>
                <input
                  type="text"
                  required
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  placeholder="Contoh: Perubahan Anggaran & Pembubaran"
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#158057] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Isi Pasal / Ayat (pisahkan setiap pasal dengan baris baru)
                </label>
                <textarea
                  rows={5}
                  required
                  value={formIsiText}
                  onChange={(e) => setFormIsiText(e.target.value)}
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
                  Simpan Ketentuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
