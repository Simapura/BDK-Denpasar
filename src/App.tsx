import React, { useEffect, useState } from 'react';
import { INITIAL_DATABASE, resolveKategoriKeanggotaan } from './data/initialData';
import {
  Anggota,
  CatatanSukaDuka,
  DokumentasiItem,
  JadwalPiodalan,
  KeamananAkun,
  MenuId,
  PasalAdArt,
  PeminjamanPerlengkapan,
  PerlengkapanPura,
  PinjamanDana,
  PuraDatabase,
  PuraProfil,
  RencanaAngsuranItem,
  RencanaKerjaItem,
  SaranMasukan,
  TransaksiKeuangan,
  UserSession,
} from './types/pura';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { AnggotaView } from './components/AnggotaView';
import { PiodalanView } from './components/PiodalanView';
import { PerlengkapanView } from './components/PerlengkapanView';
import { PinjamanView } from './components/PinjamanView';
import { AdArtView } from './components/AdArtView';
import { RencanaKerjaView } from './components/RencanaKerjaView';
import { SukaDukaView } from './components/SukaDukaView';
import { GaleriView } from './components/GaleriView';
import { KeuanganView } from './components/KeuanganView';
import { SaranMasukanView } from './components/SaranMasukanView';
import { LaporanView } from './components/LaporanView';
import { PengaturanPengurusView } from './components/PengaturanPengurusView';
import { LoginView } from './components/LoginView';

const STORAGE_KEY = 'pura_bdk_denpasar_db_v1';
const SESSION_KEY = 'pura_bdk_denpasar_session_v1';

function loadInitialDb(): PuraDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_DATABASE;
    const parsed = JSON.parse(raw) as Partial<PuraDatabase>;
    if (
      parsed &&
      Array.isArray(parsed.anggota) &&
      Array.isArray(parsed.piodalan) &&
      Array.isArray(parsed.transaksi) &&
      Array.isArray(parsed.galeri) &&
      Array.isArray(parsed.adArt)
    ) {
      return {
        ...INITIAL_DATABASE,
        ...parsed,
        pengumuman:
          typeof parsed.pengumuman === 'string' && parsed.pengumuman.trim().length > 0
            ? parsed.pengumuman.includes('Rp 50.000')
              ? INITIAL_DATABASE.pengumuman
              : parsed.pengumuman
            : INITIAL_DATABASE.pengumuman,
        profil:
          parsed.profil && typeof parsed.profil === 'object'
            ? (() => {
                const isOldAddress =
                  parsed.profil.alamatSingkat?.includes('Kusuma Atmaja') ||
                  parsed.profil.alamatLengkap?.includes('Kusuma Atmaja') ||
                  parsed.profil.googleMapsQuery?.includes('Kusuma Atmaja');
                const migratedDefaultIuran =
                  !parsed.profil.defaultIuranBulanan || parsed.profil.defaultIuranBulanan === 50000
                    ? INITIAL_DATABASE.profil.defaultIuranBulanan
                    : parsed.profil.defaultIuranBulanan;
                const migratedKedua =
                  parsed.profil.opsiIuranKedua ?? INITIAL_DATABASE.profil.opsiIuranKedua;
                return {
                  ...INITIAL_DATABASE.profil,
                  ...parsed.profil,
                  defaultIuranBulanan: migratedDefaultIuran,
                  opsiIuranKedua: migratedKedua,
                  ...(isOldAddress
                    ? {
                        alamatSingkat: INITIAL_DATABASE.profil.alamatSingkat,
                        alamatLengkap: INITIAL_DATABASE.profil.alamatLengkap,
                        catatanAksesPeta: INITIAL_DATABASE.profil.catatanAksesPeta,
                        googleMapsQuery: INITIAL_DATABASE.profil.googleMapsQuery,
                        osmLat: INITIAL_DATABASE.profil.osmLat,
                        osmLng: INITIAL_DATABASE.profil.osmLng,
                      }
                    : {}),
                  logoUrl: parsed.profil.logoUrl || INITIAL_DATABASE.profil.logoUrl,
                  googleMapsQuery: isOldAddress
                    ? INITIAL_DATABASE.profil.googleMapsQuery
                    : parsed.profil.googleMapsQuery || INITIAL_DATABASE.profil.googleMapsQuery,
                };
              })()
            : INITIAL_DATABASE.profil,
        anggota: parsed.anggota.map((a) => {
          const initialMatch = INITIAL_DATABASE.anggota.find((ia) => ia.id === a.id);
          const updatedNama =
            a.nama === 'I Wayan Sudarma, S.Sos., M.Si.'
              ? 'I Wayan Arya Adnyana'
              : a.nama === 'I Made Arya Putra, S.Kom.'
              ? 'I Gusti Ngurah Suariana'
              : a.nama === 'Ni Ketut Sri Wahyuni, S.E., M.M.'
              ? 'Ni Kadek Ceryna Dewi'
              : a.nama;
          const updatedIuran =
            a.iuranWajibBulanan === 50000
              ? initialMatch?.iuranWajibBulanan ?? 35000
              : a.iuranWajibBulanan;
          return {
            ...a,
            nama: updatedNama,
            kategoriKeanggotaan: resolveKategoriKeanggotaan(a.jabatan, a.kategoriKeanggotaan),
            iuranWajibBulanan: updatedIuran,
            skemaIuran: a.skemaIuran || initialMatch?.skemaIuran || 'Bulanan',
          };
        }),
        adArt: parsed.adArt.map((pasal) => {
          const initialPasal = INITIAL_DATABASE.adArt.find((ip) => ip.id === pasal.id);
          if (
            initialPasal &&
            pasal.isi.some((line) => line.includes('Rp 50.000'))
          ) {
            return initialPasal;
          }
          return pasal;
        }),
        transaksi: (() => {
          const hasOldSeedIuran = parsed.transaksi.some(
            (t) =>
              t.kategori === 'Iuran Wajib Bulanan' &&
              t.nominal === 50000 &&
              t.id.startsWith('trx-00')
          );
          if (!hasOldSeedIuran) return parsed.transaksi;
          const customOrEdited = parsed.transaksi.filter(
            (t) => !(t.kategori === 'Iuran Wajib Bulanan' && t.nominal === 50000 && t.id.startsWith('trx-00'))
          );
          const initialIuranTx = INITIAL_DATABASE.transaksi.filter(
            (t) => t.kategori === 'Iuran Wajib Bulanan' || t.kategori === 'Iuran Wajib Tahunan'
          );
          return [...customOrEdited, ...initialIuranTx].sort((a, b) =>
            b.tanggal.localeCompare(a.tanggal)
          );
        })(),
        pengesahanAdArt:
          parsed.pengesahanAdArt && typeof parsed.pengesahanAdArt === 'object'
            ? {
                ...INITIAL_DATABASE.pengesahanAdArt,
                ...parsed.pengesahanAdArt,
                ketuaPura:
                  parsed.pengesahanAdArt.ketuaPura === 'I Wayan Sudarma, S.Sos., M.Si.'
                    ? 'I Wayan Arya Adnyana'
                    : parsed.pengesahanAdArt.ketuaPura,
                sekretarisPura:
                  parsed.pengesahanAdArt.sekretarisPura === 'I Made Arya Putra, S.Kom.'
                    ? 'I Gusti Ngurah Suariana'
                    : parsed.pengesahanAdArt.sekretarisPura,
              }
            : INITIAL_DATABASE.pengesahanAdArt,
        keamanan:
          parsed.keamanan && typeof parsed.keamanan === 'object'
            ? { ...INITIAL_DATABASE.keamanan, ...parsed.keamanan }
            : INITIAL_DATABASE.keamanan,
        pinjamanDana: Array.isArray(parsed.pinjamanDana)
          ? parsed.pinjamanDana.map((p) => {
              const initialMatch = INITIAL_DATABASE.pinjamanDana.find((ip) => ip.id === p.id);
              const migratedRiwayat = Array.isArray(p.riwayatAngsuran)
                ? p.riwayatAngsuran
                : initialMatch?.riwayatAngsuran && p.sudahDikembalikan === initialMatch.sudahDikembalikan
                ? initialMatch.riwayatAngsuran
                : p.sudahDikembalikan > 0
                ? [
                    {
                      id: `ang-migrated-${p.id}`,
                      tanggal: p.tanggalPinjam,
                      nominal: p.sudahDikembalikan,
                      dicatatOleh: p.dicatatOleh || 'Bendahara Pura',
                      keterangan:
                        p.status === 'Lunas'
                          ? 'Pelunasan tercatat'
                          : 'Angsuran sebelumnya tercatat',
                    },
                  ]
                : [];
              const migratedRencana = Array.isArray(p.rencanaAngsuran)
                ? p.rencanaAngsuran
                : initialMatch?.rencanaAngsuran || [
                    {
                      id: `rcn-migrated-${p.id}`,
                      termin: 1,
                      tanggalRencana: p.jatuhTempo,
                      nominalRencana: p.nominal,
                      catatan: 'Target pelunasan pinjaman',
                    },
                  ];
              const migratedRencanaText =
                p.rencanaPengembalian ||
                initialMatch?.rencanaPengembalian ||
                `Target pelunasan ${p.jatuhTempo}`;
              return {
                ...p,
                riwayatAngsuran: migratedRiwayat,
                rencanaAngsuran: migratedRencana,
                rencanaPengembalian: migratedRencanaText,
              };
            })
          : INITIAL_DATABASE.pinjamanDana,
        perlengkapan: Array.isArray(parsed.perlengkapan)
          ? parsed.perlengkapan
          : INITIAL_DATABASE.perlengkapan,
        peminjamanBarang: Array.isArray(parsed.peminjamanBarang)
          ? parsed.peminjamanBarang
          : INITIAL_DATABASE.peminjamanBarang,
        saranMasukan: Array.isArray(parsed.saranMasukan)
          ? parsed.saranMasukan
          : INITIAL_DATABASE.saranMasukan,
        rencanaKerja: Array.isArray(parsed.rencanaKerja)
          ? parsed.rencanaKerja
          : INITIAL_DATABASE.rencanaKerja,
        sukaDuka: Array.isArray(parsed.sukaDuka)
          ? parsed.sukaDuka
          : INITIAL_DATABASE.sukaDuka,
      } as PuraDatabase;
    }
    return INITIAL_DATABASE;
  } catch {
    return INITIAL_DATABASE;
  }
}

function loadInitialSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserSession>;
    if (parsed && parsed.nomorInduk && parsed.nama && parsed.role) {
      return parsed as UserSession;
    }
    return null;
  } catch {
    return null;
  }
}

export default function App() {
  const [db, setDb] = useState<PuraDatabase>(loadInitialDb);
  const [session, setSession] = useState<UserSession | null>(loadInitialSession);
  const [justLoggedOut, setJustLoggedOut] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // External triggers for TopBar & Pengaturan quick action buttons
  const [openAddAnggota, setOpenAddAnggota] = useState(false);
  const [openAddPiodalan, setOpenAddPiodalan] = useState(false);
  const [openAddPerlengkapan, setOpenAddPerlengkapan] = useState(false);
  const [openAddPinjaman, setOpenAddPinjaman] = useState(false);
  const [openAddAdArt, setOpenAddAdArt] = useState(false);
  const [openAddRencanaKerja, setOpenAddRencanaKerja] = useState(false);
  const [openAddSukaDuka, setOpenAddSukaDuka] = useState(false);
  const [openAddGaleri, setOpenAddGaleri] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      // Ignore storage quota issues safely
    }
  }, [db]);

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    setJustLoggedOut(false);
    setActiveMenu('dashboard');
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    } catch {
      // Ignore storage error
    }
  };

  const handleLogout = () => {
    setSession(null);
    setJustLoggedOut(true);
    setMobileMenuOpen(false);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore storage error
    }
  };

  if (!session) {
    return (
      <LoginView
        anggota={db.anggota}
        keamanan={db.keamanan}
        profil={db.profil}
        onLogin={handleLogin}
        justLoggedOut={justLoggedOut}
      />
    );
  }

  const isPengurus = session.role === 'Pengurus';
  const anggotaAktifCount = db.anggota.filter((a) => a.status === 'Aktif').length;
  const saranBaruCount = db.saranMasukan.filter((s) => s.status === 'Baru').length;

  // Pengaturan & Profil Handlers (Pengurus Only)
  const handleUpdatePengumuman = (text: string) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      pengumuman: text.trim() || prev.pengumuman,
    }));
  };

  const handleUpdateProfil = (profil: PuraProfil) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      profil,
    }));
  };

  const handleUpdateKeamanan = (keamanan: KeamananAkun) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      keamanan,
    }));
  };

  const handleUpdatePengesahanAdArt = (pengesahanAdArt: PuraDatabase['pengesahanAdArt']) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      pengesahanAdArt,
    }));
  };

  // CRUD Handlers: Anggota (Pengurus Only)
  const handleAddAnggota = (member: Omit<Anggota, 'id'>) => {
    if (!isPengurus) return;
    const id = `ang-${Date.now()}`;
    setDb((prev) => ({
      ...prev,
      anggota: [...prev.anggota, { ...member, id }],
    }));
  };

  const handleUpdateAnggota = (updated: Anggota) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      anggota: prev.anggota.map((a) => (a.id === updated.id ? updated : a)),
    }));
  };

  const handleDeleteAnggota = (id: string) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      anggota: prev.anggota.filter((a) => a.id !== id),
    }));
  };

  // CRUD Handlers: Piodalan (Pengurus Only)
  const handleAddPiodalan = (item: Omit<JadwalPiodalan, 'id'>) => {
    if (!isPengurus) return;
    const id = `pio-${Date.now()}`;
    setDb((prev) => ({
      ...prev,
      piodalan: [...prev.piodalan, { ...item, id }],
    }));
  };

  const handleUpdatePiodalan = (updated: JadwalPiodalan) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      piodalan: prev.piodalan.map((p) => (p.id === updated.id ? updated : p)),
    }));
  };

  const handleDeletePiodalan = (id: string) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      piodalan: prev.piodalan.filter((p) => p.id !== id),
    }));
  };

  // CRUD Handlers: Perlengkapan & Peminjaman Barang (Pengurus Only)
  const handleAddPerlengkapan = (item: Omit<PerlengkapanPura, 'id'>) => {
    if (!isPengurus) return;
    const id = `inv-${Date.now()}`;
    setDb((prev) => ({
      ...prev,
      perlengkapan: [...prev.perlengkapan, { ...item, id }],
    }));
  };

  const handleUpdatePerlengkapan = (updated: PerlengkapanPura) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      perlengkapan: prev.perlengkapan.map((item) =>
        item.id === updated.id ? updated : item
      ),
    }));
  };

  const handleDeletePerlengkapan = (id: string) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      perlengkapan: prev.perlengkapan.filter((item) => item.id !== id),
    }));
  };

  const handleAddPeminjamanBarang = (item: Omit<PeminjamanPerlengkapan, 'id'>) => {
    if (!isPengurus) return;
    const id = `pjm-brg-${Date.now()}`;
    setDb((prev) => ({
      ...prev,
      peminjamanBarang: [{ ...item, id }, ...prev.peminjamanBarang],
    }));
  };

  const handleReturnPeminjamanBarang = (id: string) => {
    if (!isPengurus) return;
    const today = new Date().toISOString().slice(0, 10);
    setDb((prev) => ({
      ...prev,
      peminjamanBarang: prev.peminjamanBarang.map((p) =>
        p.id === id ? { ...p, status: 'Dikembalikan', tanggalKembali: today } : p
      ),
    }));
  };

  // CRUD Handlers: Pinjaman Dana Kas (Pengurus Only)
  const handleAddPinjamanDana = (item: Omit<PinjamanDana, 'id'>) => {
    if (!isPengurus) return;
    const id = `pjm-kas-${Date.now()}`;
    setDb((prev) => ({
      ...prev,
      pinjamanDana: [{ ...item, riwayatAngsuran: item.riwayatAngsuran || [], id }, ...prev.pinjamanDana],
    }));
  };

  const handleBayarPinjamanDana = (
    id: string,
    jumlahBayar: number,
    tanggalBayar?: string,
    keterangan?: string
  ) => {
    if (!isPengurus || jumlahBayar <= 0) return;
    const tgl = tanggalBayar || new Date().toISOString().slice(0, 10);
    setDb((prev) => ({
      ...prev,
      pinjamanDana: prev.pinjamanDana.map((p) => {
        if (p.id !== id) return p;
        const sisa = Math.max(0, p.nominal - p.sudahDikembalikan);
        const applied = Math.min(jumlahBayar, sisa);
        if (applied <= 0) return p;
        const nextPaid = p.sudahDikembalikan + applied;
        const existingHistory = Array.isArray(p.riwayatAngsuran) ? p.riwayatAngsuran : [];
        const nextEntry = {
          id: `ang-${Date.now()}`,
          tanggal: tgl,
          nominal: applied,
          dicatatOleh: session?.nama || 'Pengurus Pura',
          keterangan:
            keterangan?.trim() ||
            (nextPaid >= p.nominal
              ? `Pelunasan (angsuran ke-${existingHistory.length + 1})`
              : `Angsuran ke-${existingHistory.length + 1}`),
        };
        return {
          ...p,
          sudahDikembalikan: nextPaid,
          status: nextPaid >= p.nominal ? 'Lunas' : 'Berjalan',
          riwayatAngsuran: [...existingHistory, nextEntry],
        };
      }),
    }));
  };

  const handleDeletePinjamanDana = (id: string) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      pinjamanDana: prev.pinjamanDana.filter((p) => p.id !== id),
    }));
  };

  const handleUpdateRencanaPinjaman = (
    id: string,
    rencanaPengembalian: string,
    rencanaAngsuran: RencanaAngsuranItem[]
  ) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      pinjamanDana: prev.pinjamanDana.map((p) =>
        p.id === id ? { ...p, rencanaPengembalian, rencanaAngsuran } : p
      ),
    }));
  };

  // CRUD Handlers: AD/ART (Pengurus Only)
  const handleAddPasal = (pasal: Omit<PasalAdArt, 'id'>) => {
    if (!isPengurus) return;
    const id = `pasal-${Date.now()}`;
    setDb((prev) => ({
      ...prev,
      adArt: [...prev.adArt, { ...pasal, id }],
    }));
  };

  const handleUpdatePasal = (updated: PasalAdArt) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      adArt: prev.adArt.map((p) => (p.id === updated.id ? updated : p)),
    }));
  };

  // CRUD Handlers: Rencana Kerja (Pengurus Only)
  const handleAddRencanaKerja = (item: Omit<RencanaKerjaItem, 'id'>) => {
    if (!isPengurus) return;
    const id = `rk-${Date.now()}`;
    setDb((prev) => ({
      ...prev,
      rencanaKerja: [...prev.rencanaKerja, { ...item, id }],
    }));
  };

  const handleUpdateRencanaKerja = (updated: RencanaKerjaItem) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      rencanaKerja: prev.rencanaKerja.map((r) => (r.id === updated.id ? updated : r)),
    }));
  };

  const handleDeleteRencanaKerja = (id: string) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      rencanaKerja: prev.rencanaKerja.filter((r) => r.id !== id),
    }));
  };

  // CRUD Handlers: Catatan Suka Duka (Pengurus Only)
  const handleAddSukaDuka = (
    item: Omit<CatatanSukaDuka, 'id'>,
    catatKeKas = false
  ) => {
    if (!isPengurus) return;
    const id = `sd-${Date.now()}`;
    const shouldAddKas = Boolean(catatKeKas && item.nominalSantunan > 0);
    setDb((prev) => ({
      ...prev,
      sukaDuka: [{ ...item, id, tercatatDiKas: shouldAddKas }, ...prev.sukaDuka],
      transaksi: shouldAddKas
        ? [
            {
              id: `trx-sd-${Date.now()}`,
              tanggal: item.tanggal,
              jenis: 'Pengeluaran',
              kategori: 'Sosial & Suka Duka',
              uraian: `Santunan ${item.jenis} (${item.kategori}) - ${item.namaKeluarga}`,
              nominal: item.nominalSantunan,
              dicatatOleh: session?.nama || item.dicatatOleh,
              keterangan: item.perwakilanPengurus,
            },
            ...prev.transaksi,
          ]
        : prev.transaksi,
    }));
  };

  const handleUpdateSukaDuka = (updated: CatatanSukaDuka) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      sukaDuka: prev.sukaDuka.map((s) => (s.id === updated.id ? updated : s)),
    }));
  };

  const handleDeleteSukaDuka = (id: string) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      sukaDuka: prev.sukaDuka.filter((s) => s.id !== id),
    }));
  };

  const handleCatatSukaDukaKeKas = (item: CatatanSukaDuka) => {
    if (!isPengurus || item.tercatatDiKas || item.nominalSantunan <= 0) return;
    setDb((prev) => ({
      ...prev,
      sukaDuka: prev.sukaDuka.map((s) =>
        s.id === item.id ? { ...s, tercatatDiKas: true } : s
      ),
      transaksi: [
        {
          id: `trx-sd-${Date.now()}`,
          tanggal: item.tanggal,
          jenis: 'Pengeluaran',
          kategori: 'Sosial & Suka Duka',
          uraian: `Santunan ${item.jenis} (${item.kategori}) - ${item.namaKeluarga}`,
          nominal: item.nominalSantunan,
          dicatatOleh: session?.nama || 'Bendahara Pura',
          keterangan: item.perwakilanPengurus,
        },
        ...prev.transaksi,
      ],
    }));
  };

  // CRUD Handlers: Galeri (Pengurus Only)
  const handleAddGaleri = (item: Omit<DokumentasiItem, 'id'>) => {
    if (!isPengurus) return;
    const id = `gal-${Date.now()}`;
    setDb((prev) => ({
      ...prev,
      galeri: [{ ...item, id }, ...prev.galeri],
    }));
  };

  const handleDeleteGaleri = (id: string) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      galeri: prev.galeri.filter((g) => g.id !== id),
    }));
  };

  // CRUD Handlers: Keuangan (Pengurus Only)
  const handleAddTransaksi = (trx: Omit<TransaksiKeuangan, 'id'>) => {
    if (!isPengurus) return;
    const id = `trx-${Date.now()}`;
    setDb((prev) => ({
      ...prev,
      transaksi: [{ ...trx, id }, ...prev.transaksi],
    }));
  };

  const handleDeleteTransaksi = (id: string) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      transaksi: prev.transaksi.filter((t) => t.id !== id),
    }));
  };

  // Saran & Masukan Handlers (All logged-in users can Add; Pengurus Only can Update/Delete)
  const handleAddSaran = (item: Omit<SaranMasukan, 'id'>) => {
    const id = `srn-${Date.now()}`;
    setDb((prev) => ({
      ...prev,
      saranMasukan: [{ ...item, id }, ...prev.saranMasukan],
    }));
  };

  const handleUpdateSaran = (updated: SaranMasukan) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      saranMasukan: prev.saranMasukan.map((s) => (s.id === updated.id ? updated : s)),
    }));
  };

  const handleDeleteSaran = (id: string) => {
    if (!isPengurus) return;
    setDb((prev) => ({
      ...prev,
      saranMasukan: prev.saranMasukan.filter((s) => s.id !== id),
    }));
  };

  const handleNavigateAndOpen = (menu: MenuId, triggerAdd = false) => {
    setActiveMenu(menu);
    if (!triggerAdd || !isPengurus) return;
    if (menu === 'anggota') setOpenAddAnggota(true);
    if (menu === 'piodalan') setOpenAddPiodalan(true);
    if (menu === 'perlengkapan') setOpenAddPerlengkapan(true);
    if (menu === 'pinjaman') setOpenAddPinjaman(true);
    if (menu === 'adart') setOpenAddAdArt(true);
    if (menu === 'rencana-kerja') setOpenAddRencanaKerja(true);
    if (menu === 'suka-duka') setOpenAddSukaDuka(true);
    if (menu === 'galeri') setOpenAddGaleri(true);
  };

  const quickActionConfig: Record<
    MenuId,
    { label: string; showForReadOnly: boolean; action: () => void }
  > = {
    dashboard: {
      label: isPengurus ? 'Catat Kas / Iuran' : 'Lihat Laporan',
      showForReadOnly: true,
      action: () => setActiveMenu(isPengurus ? 'keuangan' : 'laporan'),
    },
    'rencana-kerja': {
      label: 'Tambah Program Kerja',
      showForReadOnly: false,
      action: () => isPengurus && setOpenAddRencanaKerja(true),
    },
    'suka-duka': {
      label: 'Catat Suka Duka',
      showForReadOnly: false,
      action: () => isPengurus && setOpenAddSukaDuka(true),
    },
    anggota: {
      label: 'Tambah Anggota',
      showForReadOnly: false,
      action: () => isPengurus && setOpenAddAnggota(true),
    },
    piodalan: {
      label: 'Tambah Piodalan',
      showForReadOnly: false,
      action: () => isPengurus && setOpenAddPiodalan(true),
    },
    perlengkapan: {
      label: 'Tambah Perlengkapan',
      showForReadOnly: false,
      action: () => isPengurus && setOpenAddPerlengkapan(true),
    },
    pinjaman: {
      label: 'Catat Pinjaman Kas',
      showForReadOnly: false,
      action: () => isPengurus && setOpenAddPinjaman(true),
    },
    adart: {
      label: 'Tambah Pasal',
      showForReadOnly: false,
      action: () => isPengurus && setOpenAddAdArt(true),
    },
    galeri: {
      label: 'Tambah Dokumentasi',
      showForReadOnly: false,
      action: () => isPengurus && setOpenAddGaleri(true),
    },
    saran: {
      label: 'Lihat Beranda',
      showForReadOnly: true,
      action: () => setActiveMenu('dashboard'),
    },
    keuangan: {
      label: 'Lihat Laporan',
      showForReadOnly: true,
      action: () => setActiveMenu('laporan'),
    },
    laporan: {
      label: 'Cetak Laporan',
      showForReadOnly: true,
      action: () => window.print(),
    },
    pengaturan: {
      label: 'Kembali ke Beranda',
      showForReadOnly: false,
      action: () => setActiveMenu('dashboard'),
    },
  };

  const currentQuick = quickActionConfig[activeMenu];

  return (
    <div className="min-h-screen text-[#142019]">
      <Sidebar
        activeMenu={activeMenu}
        onSelectMenu={setActiveMenu}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        anggotaAktifCount={anggotaAktifCount}
        saranBaruCount={saranBaruCount}
        namaPura={db.profil.namaPura}
        logoUrl={db.profil.logoUrl}
        session={session}
        onLogout={handleLogout}
      />

      <div className="lg:pl-[264px] flex min-h-screen flex-col">
        <TopBar
          activeMenu={activeMenu}
          onSelectMenu={setActiveMenu}
          onOpenMobile={() => setMobileMenuOpen(true)}
          onQuickAction={currentQuick.action}
          quickActionLabel={currentQuick.label}
          showQuickAction={isPengurus || currentQuick.showForReadOnly}
          canManage={isPengurus}
          namaPura={db.profil.namaPura}
          logoUrl={db.profil.logoUrl}
          session={session}
          onLogout={handleLogout}
        />

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1280px]">
            {activeMenu === 'dashboard' && (
              <DashboardView
                data={db}
                session={session}
                onNavigate={setActiveMenu}
                onQuickRecordIuran={() => setActiveMenu('keuangan')}
                onUpdatePengumuman={handleUpdatePengumuman}
                onAddSaran={handleAddSaran}
                canManage={isPengurus}
              />
            )}
            {activeMenu === 'anggota' && (
              <AnggotaView
                anggota={db.anggota}
                tarifOpsi={[
                  db.profil.defaultIuranBulanan || 35000,
                  db.profil.opsiIuranKedua || 20000,
                ]}
                onAdd={handleAddAnggota}
                onUpdate={handleUpdateAnggota}
                onDelete={handleDeleteAnggota}
                canManage={isPengurus}
                externalAddOpen={openAddAnggota}
                onCloseExternalAdd={() => setOpenAddAnggota(false)}
              />
            )}
            {activeMenu === 'piodalan' && (
              <PiodalanView
                piodalan={db.piodalan}
                onAdd={handleAddPiodalan}
                onUpdate={handleUpdatePiodalan}
                onDelete={handleDeletePiodalan}
                canManage={isPengurus}
                externalAddOpen={openAddPiodalan}
                onCloseExternalAdd={() => setOpenAddPiodalan(false)}
              />
            )}
            {activeMenu === 'perlengkapan' && (
              <PerlengkapanView
                anggota={db.anggota}
                perlengkapan={db.perlengkapan}
                peminjamanBarang={db.peminjamanBarang}
                canManage={isPengurus}
                onAddPerlengkapan={handleAddPerlengkapan}
                onUpdatePerlengkapan={handleUpdatePerlengkapan}
                onDeletePerlengkapan={handleDeletePerlengkapan}
                onAddPeminjamanBarang={handleAddPeminjamanBarang}
                onReturnPeminjamanBarang={handleReturnPeminjamanBarang}
                externalAddOpen={openAddPerlengkapan}
                onCloseExternalAdd={() => setOpenAddPerlengkapan(false)}
              />
            )}
            {activeMenu === 'pinjaman' && (
              <PinjamanView
                anggota={db.anggota}
                pinjamanDana={db.pinjamanDana}
                canManage={isPengurus}
                onAddPinjamanDana={handleAddPinjamanDana}
                onBayarPinjamanDana={handleBayarPinjamanDana}
                onUpdateRencanaPinjaman={handleUpdateRencanaPinjaman}
                onDeletePinjamanDana={handleDeletePinjamanDana}
                externalAddOpen={openAddPinjaman}
                onCloseExternalAdd={() => setOpenAddPinjaman(false)}
              />
            )}
            {activeMenu === 'adart' && (
              <AdArtView
                adArt={db.adArt}
                pengesahan={db.pengesahanAdArt}
                onAddPasal={handleAddPasal}
                onUpdatePasal={handleUpdatePasal}
                canManage={isPengurus}
                externalAddOpen={openAddAdArt}
                onCloseExternalAdd={() => setOpenAddAdArt(false)}
              />
            )}
            {activeMenu === 'rencana-kerja' && (
              <RencanaKerjaView
                rencanaKerja={db.rencanaKerja}
                anggota={db.anggota}
                canManage={isPengurus}
                onAdd={handleAddRencanaKerja}
                onUpdate={handleUpdateRencanaKerja}
                onDelete={handleDeleteRencanaKerja}
                externalAddOpen={openAddRencanaKerja}
                onCloseExternalAdd={() => setOpenAddRencanaKerja(false)}
              />
            )}
            {activeMenu === 'galeri' && (
              <GaleriView
                galeri={db.galeri}
                onAdd={handleAddGaleri}
                onDelete={handleDeleteGaleri}
                canManage={isPengurus}
                externalAddOpen={openAddGaleri}
                onCloseExternalAdd={() => setOpenAddGaleri(false)}
              />
            )}
            {activeMenu === 'keuangan' && (
              <KeuanganView
                anggota={db.anggota}
                transaksi={db.transaksi}
                tarifOpsi={[
                  db.profil.defaultIuranBulanan || 35000,
                  db.profil.opsiIuranKedua || 20000,
                ]}
                onAddTransaksi={handleAddTransaksi}
                onDeleteTransaksi={handleDeleteTransaksi}
                canManage={isPengurus}
              />
            )}
            {activeMenu === 'suka-duka' && (
              <SukaDukaView
                sukaDuka={db.sukaDuka}
                anggota={db.anggota}
                canManage={isPengurus}
                onAdd={handleAddSukaDuka}
                onUpdate={handleUpdateSukaDuka}
                onDelete={handleDeleteSukaDuka}
                onCatatKeKas={handleCatatSukaDukaKeKas}
                externalAddOpen={openAddSukaDuka}
                onCloseExternalAdd={() => setOpenAddSukaDuka(false)}
              />
            )}
            {activeMenu === 'saran' && (
              <SaranMasukanView
                saranList={db.saranMasukan}
                session={session}
                canManage={isPengurus}
                onAddSaran={handleAddSaran}
                onUpdateSaran={handleUpdateSaran}
                onDeleteSaran={handleDeleteSaran}
              />
            )}
            {activeMenu === 'laporan' && (
              <LaporanView
                data={db}
                onImportDatabase={(imported) => {
                  if (isPengurus) setDb(imported);
                }}
                onResetDatabase={() => {
                  if (!isPengurus) return;
                  localStorage.removeItem(STORAGE_KEY);
                  setDb(INITIAL_DATABASE);
                }}
                canManage={isPengurus}
              />
            )}
            {activeMenu === 'pengaturan' && (
              <PengaturanPengurusView
                data={db}
                canManage={isPengurus}
                onUpdateProfil={handleUpdateProfil}
                onUpdatePengumuman={handleUpdatePengumuman}
                onUpdateKeamanan={handleUpdateKeamanan}
                onUpdatePengesahanAdArt={handleUpdatePengesahanAdArt}
                onAddGaleri={handleAddGaleri}
                onDeleteGaleri={handleDeleteGaleri}
                onAddAnggota={handleAddAnggota}
                onAddPerlengkapan={handleAddPerlengkapan}
                onAddTransaksi={handleAddTransaksi}
                onNavigateAndOpen={handleNavigateAndOpen}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
