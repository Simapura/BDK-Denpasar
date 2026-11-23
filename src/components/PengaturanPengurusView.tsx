import React, { useState } from 'react';
import {
  BookOpen,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  Eye,
  EyeOff,
  HandCoins,
  HeartHandshake,
  ImagePlus,
  KeyRound,
  Lock,
  MapPin,
  Megaphone,
  MessageSquare,
  PackagePlus,
  RotateCcw,
  Save,
  Settings,
  Trash2,
  Upload,
  UserPlus,
  Wallet,
} from 'lucide-react';
import {
  Anggota,
  DokumentasiItem,
  KategoriKeanggotaan,
  KategoriKeuangan,
  KeamananAkun,
  MenuId,
  PerlengkapanPura,
  PuraDatabase,
  PuraProfil,
  TransaksiKeuangan,
} from '../types/pura';
import { DEFAULT_LOGO_URL } from '../data/initialData';

interface PengaturanPengurusViewProps {
  data: PuraDatabase;
  canManage: boolean;
  onUpdateProfil: (profil: PuraProfil) => void;
  onUpdatePengumuman: (text: string) => void;
  onUpdateKeamanan: (keamanan: KeamananAkun) => void;
  onUpdatePengesahanAdArt: (pengesahan: PuraDatabase['pengesahanAdArt']) => void;
  onAddGaleri: (item: Omit<DokumentasiItem, 'id'>) => void;
  onDeleteGaleri: (id: string) => void;
  onAddAnggota: (member: Omit<Anggota, 'id'>) => void;
  onAddPerlengkapan: (item: Omit<PerlengkapanPura, 'id'>) => void;
  onAddTransaksi: (trx: Omit<TransaksiKeuangan, 'id'>) => void;
  onNavigateAndOpen: (menu: MenuId, triggerAdd?: boolean) => void;
}

export function PengaturanPengurusView({
  data,
  canManage,
  onUpdateProfil,
  onUpdatePengumuman,
  onUpdateKeamanan,
  onUpdatePengesahanAdArt,
  onAddGaleri,
  onDeleteGaleri,
  onAddAnggota,
  onAddPerlengkapan,
  onAddTransaksi,
  onNavigateAndOpen,
}: PengaturanPengurusViewProps) {
  const [activeTab, setActiveTab] = useState<
    'pengumuman' | 'foto' | 'password' | 'tambah' | 'pengesahan'
  >('pengumuman');

  // Tab 1: Pengumuman, Logo, Profil & Google Maps
  const [profilForm, setProfilForm] = useState<PuraProfil>(data.profil);
  const [pengumumanDraft, setPengumumanDraft] = useState(data.pengumuman);

  // Tab 2: Tambah Foto Galeri langsung
  const [fotoJudul, setFotoJudul] = useState('');
  const [fotoKategori, setFotoKategori] = useState<DokumentasiItem['kategori']>('Piodalan');
  const [fotoTanggal, setFotoTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [fotoLokasi, setFotoLokasi] = useState('Mandala Utama Pura BDK Denpasar');
  const [fotoFotografer, setFotoFotografer] = useState('Seksi Dokumentasi Pengempon');
  const [fotoUrl, setFotoUrl] = useState('/src/assets/images/piodalan_banten_ceremony_1795151447872.jpg');
  const [fotoCatatan, setFotoCatatan] = useState('');

  // Tab 3: Edit Kata Sandi / Password
  const [passPengurus, setPassPengurus] = useState(data.keamanan.passwordPengurus);
  const [passPengempon, setPassPengempon] = useState(data.keamanan.passwordPengempon);
  const [allowQuickLogin, setAllowQuickLogin] = useState(data.keamanan.allowDemoQuickLogin);
  const [showPassPengurus, setShowPassPengurus] = useState(false);
  const [showPassPengempon, setShowPassPengempon] = useState(false);

  // Tab 4: Inline Tambah Data Lainnya
  const [newNamaAnggota, setNewNamaAnggota] = useState('');
  const [newKategoriAnggota, setNewKategoriAnggota] = useState<KategoriKeanggotaan>('Anggota');
  const [newJabatan, setNewJabatan] = useState('Anggota Pengempon');
  const [newUnitKerja, setNewUnitKerja] = useState('Bagian Tata Usaha');
  const [newTelepon, setNewTelepon] = useState('0812-');
  const [newAlamat, setNewAlamat] = useState('Denpasar');
  const [newTarifAnggota, setNewTarifAnggota] = useState(
    data.profil.defaultIuranBulanan || 35000
  );
  const [newSkemaAnggota, setNewSkemaAnggota] = useState<'Bulanan' | 'Tahunan'>('Bulanan');

  const [newTrxJenis, setNewTrxJenis] = useState<'Pemasukan' | 'Pengeluaran'>('Pemasukan');
  const [newTrxKategori, setNewTrxKategori] = useState<KategoriKeuangan>('Punia / Sumbangan');
  const [newTrxNominal, setNewTrxNominal] = useState(100000);
  const [newTrxUraian, setNewTrxUraian] = useState('');

  const [newBarangNama, setNewBarangNama] = useState('');
  const [newBarangJumlah, setNewBarangJumlah] = useState(1);
  const [newBarangLokasi, setNewBarangLokasi] = useState('Gedong Penyimpanan Bale Piyasan');

  // Tab 5: Pengesahan AD/ART
  const [pengesahanForm, setPengesahanForm] = useState(data.pengesahanAdArt);

  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  if (!canManage) {
    return (
      <div className="rounded-2xl border border-[#E5DEC9] bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEF3C7] text-[#B45309]">
          <Lock className="h-5 w-5" />
        </div>
        <h2 className="mt-4 font-display text-lg font-semibold text-[#142019]">
          Halaman Khusus Pengurus Pura
        </h2>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#59695E]">
          Menu Pengaturan Pengurus hanya dapat diakses oleh pengurus terdaftar untuk mengubah isi
          pengumuman, menambah foto galeri, mengedit kata sandi, mengatur Google Maps, serta
          menambah data lainnya.
        </p>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 4000);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfilForm((prev) => ({ ...prev, logoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfil = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfil(profilForm);
    onUpdatePengumuman(pengumumanDraft);
    showToast('Isi pengumuman, logo, profil pura, dan pengaturan Google Maps berhasil disimpan.');
  };

  const handleQuickSavePengumumanOnly = () => {
    if (!pengumumanDraft.trim()) return;
    onUpdatePengumuman(pengumumanDraft);
    showToast('Teks pengumuman beranda berhasil diperbarui!');
  };

  const handleSaveFoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fotoJudul.trim() || !fotoCatatan.trim()) return;
    onAddGaleri({
      judul: fotoJudul.trim(),
      kategori: fotoKategori,
      tanggal: fotoTanggal,
      lokasi: fotoLokasi.trim() || 'Mandala Pura BDK Denpasar',
      imageUrl: fotoUrl,
      catatan: fotoCatatan.trim(),
      fotografer: fotoFotografer.trim() || 'Seksi Dokumentasi',
    });
    setFotoJudul('');
    setFotoCatatan('');
    showToast('Foto dokumentasi baru berhasil ditambahkan ke Galeri Pura.');
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passPengurus.trim().length < 4 || passPengempon.trim().length < 4) {
      showToast('Kata sandi minimal terdiri dari 4 karakter.');
      return;
    }
    onUpdateKeamanan({
      passwordPengurus: passPengurus.trim(),
      passwordPengempon: passPengempon.trim(),
      allowDemoQuickLogin: allowQuickLogin,
    });
    showToast('Kata sandi akun Pengurus & Pengempon berhasil diperbarui.');
  };

  const handleQuickAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNamaAnggota.trim()) return;
    const nextNo = `BDK-P/${String(data.anggota.length + 1).padStart(3, '0')}`;
    onAddAnggota({
      nomorInduk: nextNo,
      nama: newNamaAnggota.trim(),
      kategoriKeanggotaan: newKategoriAnggota,
      jabatan: newJabatan.trim() || 'Anggota Pengempon',
      unitKerja: newUnitKerja.trim() || 'BDK Denpasar',
      telepon: newTelepon.trim(),
      alamat: newAlamat.trim(),
      status: 'Aktif',
      tanggalBergabung: new Date().toISOString().slice(0, 10),
      iuranWajibBulanan: newTarifAnggota,
      skemaIuran: newSkemaAnggota,
    });
    setNewNamaAnggota('');
    showToast(`${newKategoriAnggota} baru (${nextNo}) berhasil ditambahkan.`);
  };

  const handleQuickAddTrx = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTrxNominal <= 0 || !newTrxUraian.trim()) return;
    onAddTransaksi({
      tanggal: new Date().toISOString().slice(0, 10),
      jenis: newTrxJenis,
      kategori: newTrxKategori,
      uraian: newTrxUraian.trim(),
      nominal: newTrxNominal,
      dicatatOleh: 'Pengurus Pura',
    });
    setNewTrxUraian('');
    showToast(`Transaksi ${newTrxJenis.toLowerCase()} berhasil dicatat ke Buku Kas.`);
  };

  const handleQuickAddBarang = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarangNama.trim()) return;
    onAddPerlengkapan({
      kodeBarang: `INV-PURA-${String(data.perlengkapan.length + 1).padStart(2, '0')}`,
      namaBarang: newBarangNama.trim(),
      kategori: 'Upakara & Pelinggih',
      jumlahTotal: Math.max(1, newBarangJumlah),
      kondisi: 'Baik',
      lokasiSimpan: newBarangLokasi.trim(),
    });
    setNewBarangNama('');
    setNewBarangJumlah(1);
    showToast('Perlengkapan baru berhasil ditambahkan ke daftar inventaris.');
  };

  const handleSavePengesahan = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePengesahanAdArt(pengesahanForm);
    showToast('Data pengesahan AD/ART dan penandatangan laporan berhasil disimpan.');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#0D6B48]/20 bg-gradient-to-r from-[#0D6B48] to-[#137953] p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-[#FDE68A]">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#FDE68A]">
                PANEL KHUSUS PENGURUS
              </p>
              <h2 className="font-serif-title text-xl font-bold text-white">
                Pengaturan Pengumuman, Foto, Kata Sandi & Data Pura
              </h2>
            </div>
          </div>
          <p className="max-w-sm text-xs text-[#DCEEE4]">
            Pusat kendali Pengurus untuk mengubah pengumuman beranda, menambah foto dokumentasi,
            mengedit kata sandi masuk, mengatur logo, Google Maps, dan menambah data cepat.
          </p>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl bg-[#EAE5D3] p-1 w-fit">
        {[
          { id: 'pengumuman', label: 'Pengumuman, Logo & Maps' },
          { id: 'foto', label: 'Tambah Foto Galeri' },
          { id: 'password', label: 'Edit Kata Sandi' },
          { id: 'tambah', label: 'Tambah Data Lainnya' },
          { id: 'pengesahan', label: 'Pengesahan AD/ART' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() =>
              setActiveTab(
                tab.id as 'pengumuman' | 'foto' | 'password' | 'tambah' | 'pengesahan'
              )
            }
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-[#0D6B48] shadow-xs'
                : 'text-[#525E56] hover:text-[#142019]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2 rounded-xl border border-[#0D6B48]/25 bg-[#ECFDF5] px-4 py-3 text-xs font-medium text-[#0D6B48]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* TAB 1: PENGUMUMAN, LOGO, PROFIL & GOOGLE MAPS */}
      {activeTab === 'pengumuman' && (
        <form onSubmit={handleSaveProfil} className="space-y-6">
          {/* Dedicated Pengumuman Editor Card */}
          <div className="rounded-2xl border border-[#EDE2C9] bg-[#FFFDF7] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#B45309]">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-[#142019]">
                    Ubah Isi Pengumuman Beranda (Ticker Atas)
                  </h3>
                  <p className="text-xs text-[#59695E]">
                    Teks ini berjalan di pita emas-hijau bagian paling atas halaman Beranda.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickSavePengumumanOnly}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0D6B48] px-4 py-2 text-xs font-semibold text-white hover:bg-[#095438]"
              >
                <Save className="h-3.5 w-3.5" />
                Perbarui Pengumuman Saja
              </button>
            </div>
            <textarea
              rows={3}
              required
              value={pengumumanDraft}
              onChange={(e) => setPengumumanDraft(e.target.value)}
              className="w-full rounded-xl border border-[#DFD7BF] bg-white px-3.5 py-2.5 text-xs leading-relaxed focus:border-[#0D6B48] focus:outline-none"
            />
          </div>

          {/* Logo, Profil & Google Maps */}
          <div className="rounded-2xl border border-[#E2E4DC] bg-white p-6 space-y-5">
            <h3 className="font-display text-base font-semibold text-[#142019]">
              Logo Organisasi, Profil Pura & Lokasi Google Maps
            </h3>

            {/* Logo Upload & Preview */}
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#EFECE2] bg-[#FAF8F1] p-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#DFD7BF] bg-white p-1.5 shadow-2xs">
                <img
                  src={profilForm.logoUrl || DEFAULT_LOGO_URL}
                  alt="Preview Logo Pura"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-[200px] space-y-2">
                <p className="text-xs font-semibold text-[#142019]">
                  Logo Krama Hindu / Pura BDK Denpasar
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#D4DDD6] bg-white px-3 py-1.5 text-xs font-medium text-[#0D6B48] hover:bg-[#ECFDF5]">
                    <Upload className="h-3.5 w-3.5" />
                    Ganti Gambar Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setProfilForm((prev) => ({ ...prev, logoUrl: DEFAULT_LOGO_URL }))
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-[#E2DCC8] bg-white px-3 py-1.5 text-xs text-[#59695E] hover:text-[#142019]"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset ke Logo Unggahan
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#34443A]">Nama Pura</label>
                <input
                  type="text"
                  required
                  value={profilForm.namaPura}
                  onChange={(e) => setProfilForm({ ...profilForm, namaPura: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Kontak Resmi Pengurus
                </label>
                <input
                  type="text"
                  required
                  value={profilForm.kontakPengurus}
                  onChange={(e) => setProfilForm({ ...profilForm, kontakPengurus: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Alamat Singkat (Beranda)
                </label>
                <input
                  type="text"
                  required
                  value={profilForm.alamatSingkat}
                  onChange={(e) => setProfilForm({ ...profilForm, alamatSingkat: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Kisaran Iuran I / Bulan (Rp)
                </label>
                <input
                  type="number"
                  min={5000}
                  step={5000}
                  required
                  value={profilForm.defaultIuranBulanan}
                  onChange={(e) =>
                    setProfilForm({
                      ...profilForm,
                      defaultIuranBulanan: Number(e.target.value) || 35000,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs font-semibold focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Kisaran Iuran II / Bulan (Rp)
                </label>
                <input
                  type="number"
                  min={5000}
                  step={5000}
                  required
                  value={profilForm.opsiIuranKedua ?? 20000}
                  onChange={(e) =>
                    setProfilForm({
                      ...profilForm,
                      opsiIuranKedua: Number(e.target.value) || 20000,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs font-semibold focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#34443A]">
                Alamat Lengkap Kompleks Pura BDK Denpasar
              </label>
              <input
                type="text"
                required
                value={profilForm.alamatLengkap}
                onChange={(e) => setProfilForm({ ...profilForm, alamatLengkap: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#34443A]">
                Sambutan Beranda (Kartu Hijau Utama)
              </label>
              <textarea
                rows={3}
                required
                value={profilForm.sambutanBeranda}
                onChange={(e) => setProfilForm({ ...profilForm, sambutanBeranda: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs leading-relaxed focus:border-[#0D6B48] focus:outline-none"
              />
            </div>

            {/* Google Maps Settings */}
            <div className="rounded-xl border border-[#EFECE2] bg-[#FAF8F1] p-4 space-y-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-[#142019]">
                <MapPin className="h-4 w-4 text-[#0D6B48]" />
                Pengaturan Google Maps BDK Denpasar
              </p>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Kata Kunci / Alamat Titik Google Maps
                </label>
                <input
                  type="text"
                  required
                  value={profilForm.googleMapsQuery}
                  onChange={(e) =>
                    setProfilForm({ ...profilForm, googleMapsQuery: e.target.value })
                  }
                  placeholder="Contoh: Balai Diklat Keagamaan Denpasar, Jl. Raya Mengwi, Km. 14 Beringkit"
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] bg-white px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={profilForm.osmLat}
                    onChange={(e) =>
                      setProfilForm({ ...profilForm, osmLat: parseFloat(e.target.value) || -8.6698 })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] bg-white px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#34443A]">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={profilForm.osmLng}
                    onChange={(e) =>
                      setProfilForm({
                        ...profilForm,
                        osmLng: parseFloat(e.target.value) || 115.2335,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[#D4DDD6] bg-white px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">
                  Petunjuk Akses & Area Parkir
                </label>
                <input
                  type="text"
                  required
                  value={profilForm.catatanAksesPeta}
                  onChange={(e) =>
                    setProfilForm({ ...profilForm, catatanAksesPeta: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] bg-white px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0D6B48] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#095438]"
              >
                <Save className="h-4 w-4" />
                Simpan Semua Pengaturan
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: TAMBAH FOTO & GALERI LANGSUNG */}
      {activeTab === 'foto' && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
          <form
            onSubmit={handleSaveFoto}
            className="rounded-2xl border border-[#E2E4DC] bg-white p-6 space-y-4 xl:col-span-5"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#0D6B48]">
                <ImagePlus className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-[#142019]">
                  Unggah Foto Kegiatan Baru
                </h3>
                <p className="text-xs text-[#59695E]">
                  Langsung tersimpan ke menu Dokumentasi & Galeri
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#34443A]">
                Pilih Foto dari HP / Komputer
              </label>
              <div className="mt-1.5 flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#D4DDD6] bg-[#FAF8F1] px-3.5 py-2 text-xs font-semibold text-[#0D6B48] hover:bg-[#ECFDF5]">
                  <Upload className="h-3.5 w-3.5" />
                  Pilih File Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryFileChange}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-[#59695E]">JPG / PNG / WebP</span>
              </div>
              <div className="mt-3 aspect-[16/9] w-full overflow-hidden rounded-xl border border-[#E2E4DC] bg-[#F3F5F3]">
                <img
                  src={fotoUrl}
                  alt="Pratinjau foto baru"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#34443A]">Judul Kegiatan</label>
              <input
                type="text"
                required
                placeholder="Contoh: Ngayah Persiapan Piodalan Purnama Kanem"
                value={fotoJudul}
                onChange={(e) => setFotoJudul(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#34443A]">Kategori</label>
                <select
                  value={fotoKategori}
                  onChange={(e) => setFotoKategori(e.target.value as DokumentasiItem['kategori'])}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                >
                  <option value="Piodalan">Piodalan</option>
                  <option value="Gotong Royong">Gotong Royong</option>
                  <option value="Pemeliharaan Pura">Pemeliharaan Pura</option>
                  <option value="Rapat Pengempon">Rapat Pengempon</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">Tanggal</label>
                <input
                  type="date"
                  required
                  value={fotoTanggal}
                  onChange={(e) => setFotoTanggal(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#34443A]">Lokasi</label>
                <input
                  type="text"
                  required
                  value={fotoLokasi}
                  onChange={(e) => setFotoLokasi(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#34443A]">Fotografer</label>
                <input
                  type="text"
                  value={fotoFotografer}
                  onChange={(e) => setFotoFotografer(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#34443A]">Catatan Kegiatan</label>
              <textarea
                rows={3}
                required
                placeholder="Ringkasan kegiatan atau jumlah pengempon yang hadir..."
                value={fotoCatatan}
                onChange={(e) => setFotoCatatan(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D6B48] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#095438]"
            >
              <ImagePlus className="h-4 w-4" />
              Tambahkan Foto ke Galeri
            </button>
          </form>

          <section className="rounded-2xl border border-[#E2E4DC] bg-white p-6 xl:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-semibold text-[#142019]">
                  Daftar Foto Dokumentasi Tersimpan ({data.galeri.length})
                </h3>
                <p className="text-xs text-[#59695E]">Kelola arsip foto kegiatan Pura BDK Denpasar</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateAndOpen('galeri', false)}
                className="text-xs font-semibold text-[#0D6B48] hover:underline"
              >
                Buka Halaman Galeri
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.galeri.map((g) => (
                <div
                  key={g.id}
                  className="overflow-hidden rounded-xl border border-[#EFECE2] bg-[#FAF9F4]"
                >
                  <div className="aspect-[16/10] w-full bg-[#E5EAE6]">
                    <img src={g.imageUrl} alt={g.judul} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-3.5 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#142019] truncate">{g.judul}</p>
                      <p className="text-[11px] text-[#59695E] truncate">
                        {g.kategori} · {g.tanggal}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteGaleri(g.id)}
                      className="rounded p-1.5 text-[#6B7B70] hover:bg-red-50 hover:text-red-700 shrink-0"
                      aria-label={`Hapus foto ${g.judul}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: EDIT KATA SANDI / PASSWORD */}
      {activeTab === 'password' && (
        <form
          onSubmit={handleSavePassword}
          className="rounded-2xl border border-[#E2E4DC] bg-white p-6 space-y-5 max-w-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#B45309]">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-[#142019]">
                Pengaturan Kata Sandi Masuk (Pengurus & Pengempon)
              </h3>
              <p className="text-xs text-[#59695E]">
                Ubah kata sandi login untuk mengamankan akses kelola Pengurus dan akses lihat
                Pengempon.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#34443A]">
                Kata Sandi Pengurus (Kelola Penuh)
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassPengurus ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={passPengurus}
                  onChange={(e) => setPassPengurus(e.target.value)}
                  className="w-full rounded-lg border border-[#D4DDD6] px-3 py-2 pr-9 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassPengurus(!showPassPengurus)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#59695E]"
                  aria-label="Lihat sandi pengurus"
                >
                  {showPassPengurus ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-[#59695E]">
                Berlaku untuk akun pengurus, bendahara, sekretaris, dan ketua.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#34443A]">
                Kata Sandi Pengempon / Anggota (Hanya Lihat)
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassPengempon ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={passPengempon}
                  onChange={(e) => setPassPengempon(e.target.value)}
                  className="w-full rounded-lg border border-[#D4DDD6] px-3 py-2 pr-9 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassPengempon(!showPassPengempon)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#59695E]"
                  aria-label="Lihat sandi pengempon"
                >
                  {showPassPengempon ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-[#59695E]">
                Berlaku untuk login pengempon dan nomor induk anggota.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-2.5 rounded-xl border border-[#EFECE2] bg-[#FAF8F1] p-3.5 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={allowQuickLogin}
              onChange={(e) => setAllowQuickLogin(e.target.checked)}
              className="mt-0.5 rounded border-[#C8D3CC] text-[#0D6B48] focus:ring-[#0D6B48]"
            />
            <span>
              <strong className="text-[#142019]">Tampilkan tombol Masuk Cepat (1-Klik)</strong>
              <span className="block mt-0.5 text-[#59695E]">
                Nonaktifkan opsi ini jika Anda ingin seluruh pengguna wajib mengetikkan kata sandi
                secara manual di halaman masuk.
              </span>
            </span>
          </label>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0D6B48] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#095438]"
            >
              <Save className="h-4 w-4" />
              Simpan Perubahan Kata Sandi
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: TAMBAH DATA LAINNYA (INLINE FORMS + PINTASAN) */}
      {activeTab === 'tambah' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Inline 1: Tambah Anggota Baru */}
            <form
              onSubmit={handleQuickAddMember}
              className="rounded-2xl border border-[#E2E4DC] bg-white p-5 space-y-3"
            >
              <div className="flex items-center gap-2 text-[#0D6B48]">
                <UserPlus className="h-4 w-4" />
                <h3 className="font-display text-sm font-semibold text-[#142019]">
                  Tambah Anggota / Pengurus
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Pembina', 'Pengurus', 'Anggota'] as const).map((kat) => (
                  <button
                    key={kat}
                    type="button"
                    onClick={() => {
                      setNewKategoriAnggota(kat);
                      setNewJabatan(
                        kat === 'Pembina'
                          ? 'Pembina / Penasihat Pura'
                          : kat === 'Pengurus'
                          ? 'Pengurus / Koordinator Seksi'
                          : 'Anggota Pengempon'
                      );
                    }}
                    className={`rounded-lg border py-1.5 text-[11px] font-semibold transition-colors ${
                      newKategoriAnggota === kat
                        ? 'border-[#0D6B48] bg-[#ECFDF5] text-[#0D6B48]'
                        : 'border-[#D4DDD6] bg-white text-[#59695E]'
                    }`}
                  >
                    {kat}
                  </button>
                ))}
              </div>
              <input
                type="text"
                required
                placeholder="Nama lengkap & gelar"
                value={newNamaAnggota}
                onChange={(e) => setNewNamaAnggota(e.target.value)}
                className="w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Jabatan (mis. Pembina / Pengurus / Anggota)"
                value={newJabatan}
                onChange={(e) => setNewJabatan(e.target.value)}
                className="w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Unit Kerja"
                  value={newUnitKerja}
                  onChange={(e) => setNewUnitKerja(e.target.value)}
                  className="w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="No. Telepon"
                  value={newTelepon}
                  onChange={(e) => setNewTelepon(e.target.value)}
                  className="w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Alamat Domisili"
                value={newAlamat}
                onChange={(e) => setNewAlamat(e.target.value)}
                className="w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newTarifAnggota}
                  onChange={(e) => setNewTarifAnggota(Number(e.target.value) || 35000)}
                  className="rounded-lg border border-[#D4DDD6] px-2.5 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                >
                  <option value={data.profil.defaultIuranBulanan || 35000}>
                    Iuran Rp {(data.profil.defaultIuranBulanan || 35000).toLocaleString('id-ID')}/bln
                  </option>
                  <option value={data.profil.opsiIuranKedua || 20000}>
                    Iuran Rp {(data.profil.opsiIuranKedua || 20000).toLocaleString('id-ID')}/bln
                  </option>
                </select>
                <select
                  value={newSkemaAnggota}
                  onChange={(e) =>
                    setNewSkemaAnggota(e.target.value as 'Bulanan' | 'Tahunan')
                  }
                  className="rounded-lg border border-[#D4DDD6] px-2.5 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                >
                  <option value="Bulanan">Bayar Bulanan</option>
                  <option value="Tahunan">Sekali Setahun</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-[#0D6B48] py-2 text-xs font-semibold text-white hover:bg-[#095438]"
              >
                Simpan Anggota Baru
              </button>
            </form>

            {/* Inline 2: Catat Pemasukan / Pengeluaran Kas */}
            <form
              onSubmit={handleQuickAddTrx}
              className="rounded-2xl border border-[#E2E4DC] bg-white p-5 space-y-3"
            >
              <div className="flex items-center gap-2 text-[#0369A1]">
                <Wallet className="h-4 w-4" />
                <h3 className="font-display text-sm font-semibold text-[#142019]">
                  Catat Kas Masuk / Keluar
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newTrxJenis}
                  onChange={(e) => {
                    const j = e.target.value as 'Pemasukan' | 'Pengeluaran';
                    setNewTrxJenis(j);
                    setNewTrxKategori(
                      j === 'Pemasukan' ? 'Punia / Sumbangan' : 'Banten & Sarana Upacara'
                    );
                  }}
                  className="rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                >
                  <option value="Pemasukan">Pemasukan</option>
                  <option value="Pengeluaran">Pengeluaran</option>
                </select>
                <input
                  type="number"
                  min={1000}
                  step={5000}
                  required
                  value={newTrxNominal}
                  onChange={(e) => setNewTrxNominal(Number(e.target.value) || 0)}
                  className="rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs font-semibold focus:border-[#0D6B48] focus:outline-none"
                />
              </div>
              <select
                value={newTrxKategori}
                onChange={(e) => setNewTrxKategori(e.target.value as KategoriKeuangan)}
                className="w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
              >
                {newTrxJenis === 'Pemasukan' ? (
                  <>
                    <option value="Punia / Sumbangan">Punia / Sumbangan</option>
                    <option value="Iuran Wajib Bulanan">Iuran Wajib Bulanan</option>
                    <option value="Iuran Wajib Tahunan">Iuran Wajib Tahunan</option>
                    <option value="Dana Operasional BDK">Dana Operasional BDK</option>
                  </>
                ) : (
                  <>
                    <option value="Banten & Sarana Upacara">Banten & Sarana Upacara</option>
                    <option value="Pemeliharaan Pelinggih">Pemeliharaan Pelinggih</option>
                    <option value="Konsumsi Ngayah">Konsumsi Ngayah</option>
                    <option value="Listrik, Air & Kebersihan">Listrik, Air & Kebersihan</option>
                    <option value="Sosial & Suka Duka">Sosial &amp; Suka Duka</option>
                    <option value="Administrasi & Lainnya">Administrasi & Lainnya</option>
                  </>
                )}
              </select>
              <input
                type="text"
                required
                placeholder="Uraian singkat transaksi..."
                value={newTrxUraian}
                onChange={(e) => setNewTrxUraian(e.target.value)}
                className="w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-[#0369A1] py-2 text-xs font-semibold text-white hover:bg-[#075985]"
              >
                Simpan ke Buku Kas
              </button>
            </form>

            {/* Inline 3: Tambah Perlengkapan Pura */}
            <form
              onSubmit={handleQuickAddBarang}
              className="rounded-2xl border border-[#E2E4DC] bg-white p-5 space-y-3"
            >
              <div className="flex items-center gap-2 text-[#B45309]">
                <PackagePlus className="h-4 w-4" />
                <h3 className="font-display text-sm font-semibold text-[#142019]">
                  Tambah Perlengkapan Baru
                </h3>
              </div>
              <input
                type="text"
                required
                placeholder="Nama barang (mis. Penjor Hias / Tedung)"
                value={newBarangNama}
                onChange={(e) => setNewBarangNama(e.target.value)}
                className="w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#59695E]">Jumlah Unit</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newBarangJumlah}
                    onChange={(e) => setNewBarangJumlah(Math.max(1, Number(e.target.value) || 1))}
                    className="mt-0.5 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#59695E]">Lokasi Simpan</label>
                  <input
                    type="text"
                    required
                    value={newBarangLokasi}
                    onChange={(e) => setNewBarangLokasi(e.target.value)}
                    className="mt-0.5 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-[#B45309] py-2 text-xs font-semibold text-white hover:bg-[#92400E]"
              >
                Simpan Perlengkapan
              </button>
            </form>
          </div>

          {/* Shortcut Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                title: 'Rencana Kerja Pura',
                btn: 'Tambah Program Kerja',
                icon: ClipboardList,
                onClick: () => onNavigateAndOpen('rencana-kerja', true),
              },
              {
                title: 'Jadwal & Banten Piodalan',
                btn: 'Tambah Piodalan',
                icon: CalendarPlus,
                onClick: () => onNavigateAndOpen('piodalan', true),
              },
              {
                title: 'Pinjaman Dana Kas Pura',
                btn: 'Catat Pinjaman Kas',
                icon: HandCoins,
                onClick: () => onNavigateAndOpen('pinjaman', true),
              },
              {
                title: 'Pasal AD/ART Organisasi',
                btn: 'Tambah Pasal Baru',
                icon: BookOpen,
                onClick: () => onNavigateAndOpen('adart', true),
              },
              {
                title: 'Catatan Suka Duka',
                btn: 'Catat Suka Duka',
                icon: HeartHandshake,
                onClick: () => onNavigateAndOpen('suka-duka', true),
              },
              {
                title: 'Saran & Masukan Pengempon',
                btn: 'Tanggapi Saran',
                icon: MessageSquare,
                onClick: () => onNavigateAndOpen('saran', false),
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={item.onClick}
                  className="flex items-center gap-3 rounded-2xl border border-[#E2E4DC] bg-white p-4 text-left transition-colors hover:border-[#0D6B48]/50 hover:bg-[#F9FCFA]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#0D6B48] shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#142019] truncate">{item.title}</p>
                    <p className="text-[11px] font-medium text-[#0D6B48]">{item.btn} →</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: PENGESAHAN AD/ART */}
      {activeTab === 'pengesahan' && (
        <form
          onSubmit={handleSavePengesahan}
          className="rounded-2xl border border-[#E2E4DC] bg-white p-6 space-y-5"
        >
          <div>
            <h3 className="font-display text-base font-semibold text-[#142019]">
              Data Pengesahan AD/ART & Penandatangan Resmi
            </h3>
            <p className="text-xs text-[#59695E]">
              Digunakan pada dokumen AD/ART organisasi dan halaman cetak laporan administrasi pura.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#34443A]">
                Nomor Keputusan Pengesahan
              </label>
              <input
                type="text"
                required
                value={pengesahanForm.nomorKeputusan}
                onChange={(e) =>
                  setPengesahanForm({ ...pengesahanForm, nomorKeputusan: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#34443A]">Tanggal Penetapan</label>
              <input
                type="date"
                required
                value={pengesahanForm.tanggalPenetapan}
                onChange={(e) =>
                  setPengesahanForm({ ...pengesahanForm, tanggalPenetapan: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 font-mono text-xs focus:border-[#0D6B48] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-[#34443A]">
                Ketua Pengempon Pura
              </label>
              <input
                type="text"
                required
                value={pengesahanForm.ketuaPura}
                onChange={(e) =>
                  setPengesahanForm({ ...pengesahanForm, ketuaPura: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#34443A]">Sekretaris Pura</label>
              <input
                type="text"
                required
                value={pengesahanForm.sekretarisPura}
                onChange={(e) =>
                  setPengesahanForm({ ...pengesahanForm, sekretarisPura: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#34443A]">
                Penasihat / Sesepuh Pura
              </label>
              <input
                type="text"
                required
                value={pengesahanForm.penasihat}
                onChange={(e) =>
                  setPengesahanForm({ ...pengesahanForm, penasihat: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-[#D4DDD6] px-3 py-2 text-xs focus:border-[#0D6B48] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0D6B48] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#095438]"
            >
              <Save className="h-4 w-4" />
              Simpan Data Pengesahan
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
