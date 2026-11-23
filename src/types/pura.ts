export type MenuId =
  | 'dashboard'
  | 'adart'
  | 'rencana-kerja'
  | 'anggota'
  | 'piodalan'
  | 'perlengkapan'
  | 'pinjaman'
  | 'keuangan'
  | 'suka-duka'
  | 'galeri'
  | 'laporan'
  | 'pengaturan'
  | 'saran';

export type StatusKeaktifan = 'Aktif' | 'Cuti' | 'Nonaktif';

export type KategoriKeanggotaan = 'Pembina' | 'Pengurus' | 'Anggota';

export type SkemaIuran = 'Bulanan' | 'Tahunan';

export interface Anggota {
  id: string;
  nomorInduk: string;
  nama: string;
  kategoriKeanggotaan?: KategoriKeanggotaan;
  jabatan: string;
  unitKerja: string;
  telepon: string;
  alamat: string;
  status: StatusKeaktifan;
  tanggalBergabung: string;
  iuranWajibBulanan: number;
  skemaIuran?: SkemaIuran;
}

export type StatusPiodalan = 'Mendatang' | 'Persiapan' | 'Selesai';

export interface JadwalPiodalan {
  id: string;
  namaPiodalan: string;
  jenisPiodalan: string;
  hariWaktu: string;
  tanggalMasehi: string;
  pelinggihUtama: string;
  rincianBanten: string[];
  penanggungJawab: string;
  halTerkait: string;
  estimasiBiaya: number;
  status: StatusPiodalan;
}

export type JenisTransaksi = 'Pemasukan' | 'Pengeluaran';

export type KategoriKeuangan =
  | 'Iuran Wajib Bulanan'
  | 'Iuran Wajib Tahunan'
  | 'Punia / Sumbangan'
  | 'Dana Operasional BDK'
  | 'Banten & Sarana Upacara'
  | 'Pemeliharaan Pelinggih'
  | 'Konsumsi Ngayah'
  | 'Listrik, Air & Kebersihan'
  | 'Sosial & Suka Duka'
  | 'Administrasi & Lainnya';

export interface TransaksiKeuangan {
  id: string;
  tanggal: string;
  jenis: JenisTransaksi;
  kategori: KategoriKeuangan;
  uraian: string;
  nominal: number;
  anggotaId?: string;
  bulanIuran?: string; // Format: YYYY-MM
  tahunIuran?: string; // Format: YYYY (untuk pembayaran sekaligus 1 tahun)
  skemaIuran?: SkemaIuran;
  dicatatOleh: string;
  keterangan?: string;
}

export interface AngsuranPinjaman {
  id: string;
  tanggal: string;
  nominal: number;
  dicatatOleh: string;
  keterangan?: string;
}

export interface RencanaAngsuranItem {
  id: string;
  termin: number;
  tanggalRencana: string;
  nominalRencana: number;
  catatan?: string;
}

export interface PinjamanDana {
  id: string;
  tanggalPinjam: string;
  peminjam: string;
  keperluan: string;
  nominal: number;
  sudahDikembalikan: number;
  jatuhTempo: string;
  status: 'Berjalan' | 'Lunas';
  dicatatOleh: string;
  rencanaPengembalian?: string;
  rencanaAngsuran?: RencanaAngsuranItem[];
  riwayatAngsuran?: AngsuranPinjaman[];
}

export type KondisiBarang = 'Baik' | 'Perlu Perbaikan' | 'Rusak';

export interface PerlengkapanPura {
  id: string;
  kodeBarang: string;
  namaBarang: string;
  kategori:
    | 'Upakara & Pelinggih'
    | 'Kesenian & Tabuh'
    | 'Tenda, Meja & Kursi'
    | 'Elektronik & Sound'
    | 'Alat Kebersihan';
  jumlahTotal: number;
  kondisi: KondisiBarang;
  lokasiSimpan: string;
  keterangan?: string;
}

export interface PeminjamanPerlengkapan {
  id: string;
  perlengkapanId: string;
  namaBarang: string;
  peminjam: string;
  jumlah: number;
  tanggalPinjam: string;
  rencanaKembali: string;
  tanggalKembali?: string;
  keperluan: string;
  status: 'Dipinjam' | 'Dikembalikan';
}

export interface DokumentasiItem {
  id: string;
  judul: string;
  kategori: 'Piodalan' | 'Gotong Royong' | 'Rapat Pengempon' | 'Pemeliharaan Pura';
  tanggal: string;
  lokasi: string;
  imageUrl: string;
  catatan: string;
  fotografer: string;
}

export interface PasalAdArt {
  id: string;
  bagian: 'Anggaran Dasar' | 'Anggaran Rumah Tangga';
  bab: string;
  judul: string;
  isi: string[];
}

export type KategoriSaran =
  | 'Pelayanan & Fasilitas'
  | 'Upakara & Piodalan'
  | 'Keuangan & Iuran'
  | 'Perlengkapan & Pinjaman'
  | 'Lainnya';

export type StatusSaran = 'Baru' | 'Ditinjau' | 'Ditindaklanjuti';

export interface SaranMasukan {
  id: string;
  tanggal: string;
  namaPengirim: string;
  kategori: KategoriSaran;
  isiSaran: string;
  status: StatusSaran;
  tanggapanPengurus?: string;
  ditanggapiOleh?: string;
}

export interface PuraProfil {
  namaPura: string;
  logoUrl: string;
  alamatSingkat: string;
  alamatLengkap: string;
  kontakPengurus: string;
  emailResmi: string;
  sambutanBeranda: string;
  jamOperasional: string;
  catatanAksesPeta: string;
  googleMapsQuery: string;
  defaultIuranBulanan: number;
  opsiIuranKedua?: number;
  osmLat: number;
  osmLng: number;
}

export interface KeamananAkun {
  passwordPengurus: string;
  passwordPengempon: string;
  allowDemoQuickLogin: boolean;
}

export type BidangRencanaKerja =
  | 'Upakara & Piodalan'
  | 'Pemeliharaan & Pembangunan'
  | 'Perlengkapan & Kebersihan'
  | 'Keuangan & Iuran'
  | 'Sosial & Kemanusiaan'
  | 'Pendidikan Dharma';

export type StatusRencanaKerja = 'Direncanakan' | 'Berjalan' | 'Selesai' | 'Ditunda';

export type PrioritasRencanaKerja = 'Tinggi' | 'Sedang' | 'Rutin';

export interface RencanaKerjaItem {
  id: string;
  kodeProgram: string;
  namaProgram: string;
  bidang: BidangRencanaKerja;
  periode: string;
  targetTanggal: string;
  penanggungJawab: string;
  estimasiAnggaran: number;
  sumberDana: string;
  prioritas: PrioritasRencanaKerja;
  status: StatusRencanaKerja;
  progresPersen: number;
  uraianTujuan: string;
  indikatorKeberhasilan: string;
  catatanRealisasi?: string;
}

export type JenisSukaDuka = 'Suka' | 'Duka';

export type KategoriSukaDuka =
  | 'Pernikahan / Pawiwahan'
  | 'Kelahiran / Otonan / Tiga Bulanan'
  | 'Manusa Yadnya (Metatah / Lainnya)'
  | 'Kedukaan / Meninggal Dunia'
  | 'Sakit / Rawat Inap'
  | 'Purna Tugas / Penghargaan';

export type StatusSukaDuka = 'Dijadwalkan' | 'Sudah Disalurkan';

export interface CatatanSukaDuka {
  id: string;
  tanggal: string;
  jenis: JenisSukaDuka;
  kategori: KategoriSukaDuka;
  anggotaId?: string;
  namaKeluarga: string;
  lokasiAcara: string;
  uraian: string;
  nominalSantunan: number;
  bentukBingkisan?: string;
  perwakilanPengurus: string;
  status: StatusSukaDuka;
  dicatatOleh: string;
  tercatatDiKas?: boolean;
}

export interface PuraDatabase {
  pengumuman: string;
  profil: PuraProfil;
  keamanan: KeamananAkun;
  anggota: Anggota[];
  piodalan: JadwalPiodalan[];
  transaksi: TransaksiKeuangan[];
  pinjamanDana: PinjamanDana[];
  perlengkapan: PerlengkapanPura[];
  peminjamanBarang: PeminjamanPerlengkapan[];
  galeri: DokumentasiItem[];
  adArt: PasalAdArt[];
  rencanaKerja: RencanaKerjaItem[];
  sukaDuka: CatatanSukaDuka[];
  saranMasukan: SaranMasukan[];
  pengesahanAdArt: {
    nomorKeputusan: string;
    tanggalPenetapan: string;
    ketuaPura: string;
    sekretarisPura: string;
    penasihat: string;
  };
}

export type UserRole = 'Pengurus' | 'Anggota';

export interface UserSession {
  nomorInduk: string;
  nama: string;
  jabatan: string;
  role: UserRole;
  loginAt: string;
}
