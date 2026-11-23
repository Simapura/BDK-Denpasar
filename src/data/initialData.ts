import {
  Anggota,
  CatatanSukaDuka,
  DokumentasiItem,
  JadwalPiodalan,
  KategoriKeanggotaan,
  KeamananAkun,
  PasalAdArt,
  PeminjamanPerlengkapan,
  PerlengkapanPura,
  PinjamanDana,
  PuraDatabase,
  PuraProfil,
  RencanaKerjaItem,
  SaranMasukan,
  TransaksiKeuangan,
} from '../types/pura';

export function resolveKategoriKeanggotaan(
  jabatan: string,
  explicit?: KategoriKeanggotaan
): KategoriKeanggotaan {
  if (explicit === 'Pembina' || explicit === 'Pengurus' || explicit === 'Anggota') {
    return explicit;
  }
  const lower = jabatan.toLowerCase();
  if (
    lower.includes('pembina') ||
    lower.includes('penasihat') ||
    lower.includes('sesepuh')
  ) {
    return 'Pembina';
  }
  if (
    lower.includes('ketua') ||
    lower.includes('sekretaris') ||
    lower.includes('bendahara') ||
    lower.includes('koordinator') ||
    lower.includes('pengurus')
  ) {
    return 'Pengurus';
  }
  return 'Anggota';
}

const RAW_MEMBERS: Array<Omit<Anggota, 'id' | 'nomorInduk' | 'iuranWajibBulanan'>> = [
  {
    nama: 'I Wayan Arya Adnyana',
    jabatan: 'Ketua Pengempon',
    unitKerja: 'Bagian Tata Usaha',
    telepon: '0812-3641-1001',
    alamat: 'Jl. Tukad Yeh Aya No. 42, Denpasar',
    status: 'Aktif',
    tanggalBergabung: '2019-03-15',
  },
  {
    nama: 'Ni Made Ratna Dewi, S.E.',
    jabatan: 'Wakil Ketua',
    unitKerja: 'Seksi Diklat Administrasi',
    telepon: '0813-3890-1002',
    alamat: 'Jl. Kenyeri Gg. Melati No. 8, Denpasar',
    status: 'Aktif',
    tanggalBergabung: '2019-03-15',
  },
  {
    nama: 'I Gusti Ngurah Suariana',
    jabatan: 'Sekretaris I',
    unitKerja: 'Pranata Komputer',
    telepon: '0819-9940-1003',
    alamat: 'Jl. Gurita IV No. 12, Sesetan',
    status: 'Aktif',
    tanggalBergabung: '2020-01-10',
  },
  {
    nama: 'Ni Luh Putu Sariani, S.Ag.',
    jabatan: 'Sekretaris II',
    unitKerja: 'Seksi Diklat Teknis',
    telepon: '0812-3801-1004',
    alamat: 'Jl. Nangka Selatan No. 115, Denpasar',
    status: 'Aktif',
    tanggalBergabung: '2020-04-20',
  },
  {
    nama: 'Ni Kadek Ceryna Dewi',
    jabatan: 'Bendahara I',
    unitKerja: 'Subbagian Keuangan',
    telepon: '0813-3720-1005',
    alamat: 'Jl. Pulau Batanta No. 27, Denpasar',
    status: 'Aktif',
    tanggalBergabung: '2019-03-15',
  },
  {
    nama: 'I Nyoman Gede Wirawan, S.Ak.',
    jabatan: 'Bendahara II',
    unitKerja: 'Subbagian Keuangan',
    telepon: '0852-3711-1006',
    alamat: 'Jl. Sedap Malam No. 63, Sanur',
    status: 'Aktif',
    tanggalBergabung: '2021-02-01',
  },
  {
    nama: 'Ni Wayan Puspitawati, S.Pd.H.',
    jabatan: 'Koordinator Seksi Banten',
    unitKerja: 'Widyaiswara',
    telepon: '0812-4622-1007',
    alamat: 'Jl. Hayam Wuruk No. 89, Denpasar',
    status: 'Aktif',
    tanggalBergabung: '2019-06-12',
  },
  {
    nama: 'Ni Kadek Ayu Lestari',
    jabatan: 'Anggota Seksi Banten',
    unitKerja: 'Bagian Tata Usaha',
    telepon: '0819-3600-1008',
    alamat: 'Jl. Kecubung No. 19, Denpasar',
    status: 'Aktif',
    tanggalBergabung: '2021-05-14',
  },
  {
    nama: 'Ni Komang Triana Putri, S.Psi.',
    jabatan: 'Anggota Seksi Banten',
    unitKerja: 'Seksi Diklat Administrasi',
    telepon: '0813-5321-1009',
    alamat: 'Jl. Ahmad Yani Utara No. 210, Denpasar',
    status: 'Aktif',
    tanggalBergabung: '2022-01-18',
  },
  {
    nama: 'I Ketut Suartana',
    jabatan: 'Koordinator Seksi Perlengkapan',
    unitKerja: 'Rumah Tangga & BMN',
    telepon: '0812-3945-1010',
    alamat: 'Jl. Trengguli No. 51, Penatih',
    status: 'Aktif',
    tanggalBergabung: '2019-03-15',
  },
  {
    nama: 'I Komang Agus Darmawan',
    jabatan: 'Anggota Seksi Perlengkapan',
    unitKerja: 'Rumah Tangga & BMN',
    telepon: '0857-3821-1011',
    alamat: 'Jl. Antasura No. 34, Peguyangan',
    status: 'Aktif',
    tanggalBergabung: '2020-08-05',
  },
  {
    nama: 'I Putu Eka Pranata',
    jabatan: 'Anggota Seksi Perlengkapan',
    unitKerja: 'Teknisi Sarana Diklat',
    telepon: '0819-1623-1012',
    alamat: 'Jl. Gunung Agung No. 78, Denpasar',
    status: 'Aktif',
    tanggalBergabung: '2021-11-02',
  },
  {
    nama: 'I Gede Mahendra Wijaya, S.H.',
    jabatan: 'Koordinator Keamanan & Pecalang',
    unitKerja: 'Keamanan Dalam BDK',
    telepon: '0812-3677-1013',
    alamat: 'Jl. Gatot Subroto Timur No. 45, Denpasar',
    status: 'Aktif',
    tanggalBergabung: '2019-09-01',
  },
  {
    nama: 'I Kadek Hendra Kusuma',
    jabatan: 'Anggota Keamanan & Pecalang',
    unitKerja: 'Keamanan Dalam BDK',
    telepon: '0813-3812-1014',
    alamat: 'Jl. Wr. Supratman No. 132, Kesiman',
    status: 'Aktif',
    tanggalBergabung: '2020-07-12',
  },
  {
    nama: 'Drs. Ida Bagus Ketut Mantra, M.Pd.',
    jabatan: 'Pembina / Penasihat Pura',
    unitKerja: 'Widyaiswara Utama',
    telepon: '0811-3980-1015',
    alamat: 'Griya Taman Sari, Sanur Kauh',
    status: 'Aktif',
    tanggalBergabung: '2019-03-15',
  },
  {
    nama: 'Ida Ayu Nyoman Suryani, S.Ag.',
    jabatan: 'Anggota Seksi Upakara',
    unitKerja: 'Seksi Diklat Teknis',
    telepon: '0812-3911-1016',
    alamat: 'Jl. Ratna No. 17, Tonja, Denpasar',
    status: 'Aktif',
    tanggalBergabung: '2020-03-04',
  },
  {
    nama: 'I Wayan Budiarta, S.IP.',
    jabatan: 'Koordinator Kebersihan & Taman',
    unitKerja: 'Rumah Tangga & BMN',
    telepon: '0852-3891-1017',
    alamat: 'Jl. Padang Kartika No. 9, Padangsambian',
    status: 'Aktif',
    tanggalBergabung: '2020-09-21',
  },
  {
    nama: 'Ni Made Dwi Anggraini, A.Md.',
    jabatan: 'Seksi Dokumentasi & Arsip',
    unitKerja: 'Perpustakaan BDK',
    telepon: '0819-3310-1018',
    alamat: 'Jl. Tukad Citarum No. 55, Renon',
    status: 'Aktif',
    tanggalBergabung: '2022-02-14',
  },
  {
    nama: 'I Nyoman Sukadana, S.T.',
    jabatan: 'Anggota Pengempon',
    unitKerja: 'Pranata Komputer',
    telepon: '0812-3874-1019',
    alamat: 'Jl. Sidakarya No. 88, Denpasar Selatan',
    status: 'Aktif',
    tanggalBergabung: '2021-04-09',
  },
  {
    nama: 'Ni Luh Gede Kartika Sari',
    jabatan: 'Anggota Pengempon',
    unitKerja: 'Bagian Tata Usaha',
    telepon: '0813-3701-1020',
    alamat: 'Jl. Bedugul No. 24, Sidakarya',
    status: 'Aktif',
    tanggalBergabung: '2021-08-17',
  },
  {
    nama: 'I Ketut Raka Jaya, M.Si.',
    jabatan: 'Anggota Pengempon',
    unitKerja: 'Widyaiswara Madya',
    telepon: '0811-3855-1021',
    alamat: 'Jl. Danau Tempe No. 31, Sanur',
    status: 'Aktif',
    tanggalBergabung: '2019-11-11',
  },
  {
    nama: 'Anak Agung Ngurah Oka, S.Sos.',
    jabatan: 'Anggota Pengempon',
    unitKerja: 'Seksi Diklat Administrasi',
    telepon: '0812-4689-1022',
    alamat: 'Puri Pemecutan Kaja, Denpasar Barat',
    status: 'Aktif',
    tanggalBergabung: '2020-06-01',
  },
  {
    nama: 'Ni Putu Indah Permatasari, S.E.',
    jabatan: 'Anggota Pengempon',
    unitKerja: 'Subbagian Keuangan',
    telepon: '0819-9912-1023',
    alamat: 'Jl. Mahendradatta Selatan No. 14',
    status: 'Aktif',
    tanggalBergabung: '2022-06-08',
  },
  {
    nama: 'I Made Oka Wiguna',
    jabatan: 'Anggota Pengempon',
    unitKerja: 'Pengemudi Dinas',
    telepon: '0852-3778-1024',
    alamat: 'Jl. Imam Bonjol Gg. V No. 11',
    status: 'Aktif',
    tanggalBergabung: '2020-10-15',
  },
  {
    nama: 'Ni Kadek Melani Cahyani, S.Kom.',
    jabatan: 'Seksi Dokumentasi & Arsip',
    unitKerja: 'Seksi Diklat Teknis',
    telepon: '0813-3940-1025',
    alamat: 'Jl. Teuku Umar Barat No. 92',
    status: 'Aktif',
    tanggalBergabung: '2023-01-09',
  },
  {
    nama: 'I Wayan Adi Saputra, S.Pd.',
    jabatan: 'Anggota Pengempon',
    unitKerja: 'Widyaiswara Muda',
    telepon: '0812-3890-1026',
    alamat: 'Jl. Hang Tuah No. 29, Sanur',
    status: 'Aktif',
    tanggalBergabung: '2023-03-20',
  },
  {
    nama: 'Ni Nyoman Yuliantari',
    jabatan: 'Anggota Seksi Konsumsi',
    unitKerja: 'Rumah Tangga & BMN',
    telepon: '0819-3644-1027',
    alamat: 'Jl. Kebo Iwa Utara No. 67',
    status: 'Aktif',
    tanggalBergabung: '2022-09-12',
  },
  {
    nama: 'I Putu Bagus Santika, S.H.',
    jabatan: 'Anggota Pengempon',
    unitKerja: 'Analis Kepegawaian',
    telepon: '0812-3698-1028',
    alamat: 'Jl. Raya Sesetan No. 201, Denpasar',
    status: 'Aktif',
    tanggalBergabung: '2023-07-03',
  },
  {
    nama: 'Ni Wayan Eka Rahayu, S.Pd.',
    jabatan: 'Anggota Seksi Konsumsi',
    unitKerja: 'Seksi Diklat Administrasi',
    telepon: '0813-3788-1029',
    alamat: 'Jl. Sekar Sari No. 15, Kesiman',
    status: 'Cuti',
    tanggalBergabung: '2021-01-25',
  },
  {
    nama: 'I Komang Dedy Pratama',
    jabatan: 'Anggota Pengempon',
    unitKerja: 'Mutasi KUA Kab. Badung',
    telepon: '0857-3910-1030',
    alamat: 'Jl. Raya Dalung No. 40, Kuta Utara',
    status: 'Nonaktif',
    tanggalBergabung: '2019-08-19',
  },
];

export const TARIF_IURAN_OPSI = [35000, 20000] as const;

const ANNUAL_PAYER_INDICES = new Set([0, 2, 4, 14, 20]);

export const INITIAL_ANGGOTA: Anggota[] = RAW_MEMBERS.map((m, idx) => {
  const kat = resolveKategoriKeanggotaan(m.jabatan);
  const tarif = kat === 'Pembina' || kat === 'Pengurus' || idx < 18 ? 35000 : 20000;
  return {
    ...m,
    id: `ang-${String(idx + 1).padStart(3, '0')}`,
    nomorInduk: `BDK-P/${String(idx + 1).padStart(3, '0')}`,
    kategoriKeanggotaan: kat,
    iuranWajibBulanan: tarif,
    skemaIuran: ANNUAL_PAYER_INDICES.has(idx) ? 'Tahunan' : 'Bulanan',
  };
});

export const INITIAL_PIODALAN: JadwalPiodalan[] = [
  {
    id: 'pio-01',
    namaPiodalan: 'Piodalan Purnama Sasih Kanem',
    jenisPiodalan: 'Piodalan Rutin (Purnama)',
    hariWaktu: 'Wraspati Wage, Sasih Kanem · 08.00 WITA',
    tanggalMasehi: '2026-12-03',
    pelinggihUtama: 'Padmasana & Pelinggih Ratu Ngurah',
    rincianBanten: [
      'Banten Pejati Lengkap (3 Tanding)',
      'Banten Dapetan & Peras Ajuman',
      'Canang Sari & Segehan Agung',
      'Suci Alit, Daksina Gede, & Sesayut Sidha Karya',
      'Soda Putih Kuning & Buah Musiman',
    ],
    penanggungJawab: 'Ni Wayan Puspitawati, S.Pd.H. (Seksi Banten)',
    halTerkait:
      'Pengempon hadir pukul 07.30 WITA mengenakan pakaian adat madya bernuansa putih-hijau/kuning. Ngaturang ayah penataan pelinggih dilaksanakan H-1 pukul 15.00 WITA.',
    estimasiBiaya: 1850000,
    status: 'Persiapan',
  },
  {
    id: 'pio-02',
    namaPiodalan: 'Piodalan Hari Suci Saraswati',
    jenisPiodalan: 'Piodalan Ageng (Otonan Ilmu Pengetahuan)',
    hariWaktu: 'Saniscara Umanis Wuku Watugunung · 07.30 WITA',
    tanggalMasehi: '2027-01-16',
    pelinggihUtama: 'Padmasana, Perpustakaan & Gedung Diklat BDK',
    rincianBanten: [
      'Banten Saraswati Agung & Sesayut Saraswati',
      'Banten Pejati (6 Tanding) untuk Pelinggih & Ruang Kerja',
      'Suci Sorohan & Tumpeng Putih Kuning',
      'Canang Genten, Daksina & Gebogan Buah',
      'Segehan Manca Warna di Candi Bentar',
    ],
    penanggungJawab: 'Ni Wayan Puspitawati, S.Pd.H. & Ni Made Ratna Dewi, S.E.',
    halTerkait:
      'Seluruh aparatur dan pengempon BDK Denpasar melaksanakan persembahyangan bersama, dilanjutkan ngelungsur tirta Saraswati untuk pustaka dan dokumen diklat.',
    estimasiBiaya: 3250000,
    status: 'Mendatang',
  },
  {
    id: 'pio-03',
    namaPiodalan: 'Rerahinan Tumpek Landep',
    jenisPiodalan: 'Upacara Otonan Sarana & Kendaraan Dinas',
    hariWaktu: 'Saniscara Kliwon Wuku Landep · 08.00 WITA',
    tanggalMasehi: '2027-02-06',
    pelinggihUtama: 'Padmasana & Pelataran Parkir BDK Denpasar',
    rincianBanten: [
      'Banten Pasupati & Sesayut Pasupati',
      'Banten Pejati & Tumpeng Brumbun',
      'Canang Sari & Segehan Putih Kuning',
      'Daksina, Peras, Penyeneng untuk Sarana Elektronik & Kendaraan',
    ],
    penanggungJawab: 'I Ketut Suartana (Seksi Perlengkapan)',
    halTerkait:
      'Kendaraan dinas, perangkat komputer ruang kelas, serta peralatan operasional diklat dibersihkan sehari sebelumnya untuk diprayascita dan diupacarai.',
    estimasiBiaya: 1450000,
    status: 'Mendatang',
  },
  {
    id: 'pio-04',
    namaPiodalan: 'Tilem Sasih Kesanga (Pecaruan Tawur)',
    jenisPiodalan: 'Pecaruan Menjelang Hari Suci Nyepi',
    hariWaktu: 'Anggara Wage, Tilem Kesanga · 10.00 WITA',
    tanggalMasehi: '2027-03-08',
    pelinggihUtama: 'Natar Mandala Pura & Candi Bentar Utama',
    rincianBanten: [
      'Caru Eka Sata / Ayam Brumbun Lengkap',
      'Banten Prayascita & Byakaon',
      'Banten Pejati & Daksina Pemuput',
      'Segehan Agung & Tabuh Arak Berem',
    ],
    penanggungJawab: 'Drs. Ida Bagus Ketut Mantra & Seksi Pecalang',
    halTerkait:
      'Dipuput oleh Jro Mangku Pura BDK bersama pengempon. Dilanjutkan pengerupukan terbatas dan penyucian area perkantoran sebelum Nyepi.',
    estimasiBiaya: 2600000,
    status: 'Mendatang',
  },
  {
    id: 'pio-05',
    namaPiodalan: 'Piodalan Purnama Sasih Kalima',
    jenisPiodalan: 'Piodalan Rutin (Purnama)',
    hariWaktu: 'Budha Pon, Sasih Kalima · 08.00 WITA',
    tanggalMasehi: '2026-11-04',
    pelinggihUtama: 'Padmasana & Pelinggih Taksu',
    rincianBanten: [
      'Banten Pejati (3 Tanding)',
      'Banten Dapetan & Ajuman Putih Kuning',
      'Canang Sari, Buah & Jajan Pasar',
      'Segehan Alit',
    ],
    penanggungJawab: 'Ni Kadek Ayu Lestari (Seksi Banten)',
    halTerkait:
      'Terlaksana dengan khidmat bersama 27 anggota pengempon aktif. Konsumsi ringan disediakan oleh Seksi Konsumsi.',
    estimasiBiaya: 1250000,
    status: 'Selesai',
  },
  {
    id: 'pio-06',
    namaPiodalan: 'Piodalan Purnama Sasih Kapat',
    jenisPiodalan: 'Piodalan Rutin (Purnama)',
    hariWaktu: 'Redite Umanis, Sasih Kapat · 08.30 WITA',
    tanggalMasehi: '2026-10-05',
    pelinggihUtama: 'Padmasana & Pelinggih Kemulan',
    rincianBanten: [
      'Banten Pejati (3 Tanding)',
      'Peras Soda & Daksina',
      'Canang Sari & Segehan',
    ],
    penanggungJawab: 'Ni Wayan Puspitawati, S.Pd.H.',
    halTerkait: 'Terlaksana lancar, disertai rapat evaluasi singkat kas triwulan III.',
    estimasiBiaya: 1180000,
    status: 'Selesai',
  },
];

// Generate realistic transactions across Sep, Oct, Nov 2026
function buildInitialTransactions(): TransaksiKeuangan[] {
  const txs: TransaksiKeuangan[] = [];
  let counter = 1;
  const addTx = (t: Omit<TransaksiKeuangan, 'id'>) => {
    txs.push({ ...t, id: `trx-${String(counter++).padStart(4, '0')}` });
  };

  // Annual dues (1x setahun = 12 bulan sekaligus) for members choosing Tahunan scheme
  INITIAL_ANGGOTA.slice(0, 28)
    .filter((ang) => ang.skemaIuran === 'Tahunan')
    .forEach((ang, i) => {
      addTx({
        tanggal: `2026-09-${String(4 + i).padStart(2, '0')}`,
        jenis: 'Pemasukan',
        kategori: 'Iuran Wajib Tahunan',
        uraian: `Iuran Wajib Tahun 2026 (12 Bln) - ${ang.nama}`,
        nominal: ang.iuranWajibBulanan * 12,
        anggotaId: ang.id,
        tahunIuran: '2026',
        skemaIuran: 'Tahunan',
        dicatatOleh: 'Ni Kadek Ceryna Dewi',
        keterangan: `Pembayaran sekaligus 1 tahun @ ${ang.iuranWajibBulanan === 35000 ? 'Rp 35.000' : 'Rp 20.000'}/bln`,
      });
    });

  // Monthly dues for Sep 2026 (active monthly members)
  INITIAL_ANGGOTA.slice(0, 28)
    .filter((ang) => ang.skemaIuran !== 'Tahunan')
    .forEach((ang, i) => {
      addTx({
        tanggal: `2026-09-${String(Math.min(25, 4 + Math.floor(i / 2))).padStart(2, '0')}`,
        jenis: 'Pemasukan',
        kategori: 'Iuran Wajib Bulanan',
        uraian: `Iuran Wajib September 2026 - ${ang.nama}`,
        nominal: ang.iuranWajibBulanan,
        anggotaId: ang.id,
        bulanIuran: '2026-09',
        skemaIuran: 'Bulanan',
        dicatatOleh: 'Ni Kadek Ceryna Dewi',
      });
    });

  // Monthly dues for Oct 2026 (active monthly members)
  INITIAL_ANGGOTA.slice(0, 28)
    .filter((ang) => ang.skemaIuran !== 'Tahunan')
    .forEach((ang, i) => {
      addTx({
        tanggal: `2026-10-${String(Math.min(27, 5 + Math.floor(i / 2))).padStart(2, '0')}`,
        jenis: 'Pemasukan',
        kategori: 'Iuran Wajib Bulanan',
        uraian: `Iuran Wajib Oktober 2026 - ${ang.nama}`,
        nominal: ang.iuranWajibBulanan,
        anggotaId: ang.id,
        bulanIuran: '2026-10',
        skemaIuran: 'Bulanan',
        dicatatOleh: 'Ni Kadek Ceryna Dewi',
      });
    });

  // Monthly dues for Nov 2026 (first 22 members covered; 6 monthly members pending so user can test recording!)
  INITIAL_ANGGOTA.slice(0, 22)
    .filter((ang) => ang.skemaIuran !== 'Tahunan')
    .forEach((ang, i) => {
      addTx({
        tanggal: `2026-11-${String(Math.min(19, 3 + Math.floor(i / 2))).padStart(2, '0')}`,
        jenis: 'Pemasukan',
        kategori: 'Iuran Wajib Bulanan',
        uraian: `Iuran Wajib November 2026 - ${ang.nama}`,
        nominal: ang.iuranWajibBulanan,
        anggotaId: ang.id,
        bulanIuran: '2026-11',
        skemaIuran: 'Bulanan',
        dicatatOleh: 'Ni Kadek Ceryna Dewi',
      });
    });

  // Punia & Operational Income
  addTx({
    tanggal: '2026-09-12',
    jenis: 'Pemasukan',
    kategori: 'Dana Operasional BDK',
    uraian: 'Saldo Kas Awal Periode Triwulan III & Subsidi Pemeliharaan Pura',
    nominal: 6500000,
    dicatatOleh: 'Ni Kadek Ceryna Dewi',
    keterangan: 'Berita Acara Serah Terima Kas Triwulan II 2026',
  });
  addTx({
    tanggal: '2026-10-05',
    jenis: 'Pemasukan',
    kategori: 'Punia / Sumbangan',
    uraian: 'Punia Peserta Diklat Angkatan IV & Pengempon Purnama Kapat',
    nominal: 1250000,
    dicatatOleh: 'I Nyoman Gede Wirawan, S.Ak.',
  });
  addTx({
    tanggal: '2026-11-04',
    jenis: 'Pemasukan',
    kategori: 'Punia / Sumbangan',
    uraian: 'Punia Sukarela Piodalan Purnama Sasih Kalima',
    nominal: 950000,
    dicatatOleh: 'I Nyoman Gede Wirawan, S.Ak.',
  });

  // Expenses
  addTx({
    tanggal: '2026-09-18',
    jenis: 'Pengeluaran',
    kategori: 'Pemeliharaan Pelinggih',
    uraian: 'Penggantian Kain Wastra & Tedung Pelindung Padmasana',
    nominal: 1650000,
    dicatatOleh: 'I Ketut Suartana',
    keterangan: 'Nota Toko Upakara Denpasar No. 412',
  });
  addTx({
    tanggal: '2026-09-24',
    jenis: 'Pengeluaran',
    kategori: 'Listrik, Air & Kebersihan',
    uraian: 'Pembelian Alat Kebersihan, Dupa, Minyak & Sabun Pembersih Natar',
    nominal: 420000,
    dicatatOleh: 'I Wayan Budiarta, S.IP.',
  });
  addTx({
    tanggal: '2026-10-04',
    jenis: 'Pengeluaran',
    kategori: 'Banten & Sarana Upacara',
    uraian: 'Pengadaan Banten Piodalan Purnama Sasih Kapat',
    nominal: 1180000,
    dicatatOleh: 'Ni Wayan Puspitawati, S.Pd.H.',
  });
  addTx({
    tanggal: '2026-10-05',
    jenis: 'Pengeluaran',
    kategori: 'Konsumsi Ngayah',
    uraian: 'Konsumsi Gotong Royong & Piodalan Sasih Kapat (30 Porsi)',
    nominal: 540000,
    dicatatOleh: 'Ni Nyoman Yuliantari',
  });
  addTx({
    tanggal: '2026-10-22',
    jenis: 'Pengeluaran',
    kategori: 'Pemeliharaan Pelinggih',
    uraian: 'Perbaikan Lampu Taman & Penerangan Candi Bentar',
    nominal: 780000,
    dicatatOleh: 'I Putu Eka Pranata',
  });
  addTx({
    tanggal: '2026-11-03',
    jenis: 'Pengeluaran',
    kategori: 'Banten & Sarana Upacara',
    uraian: 'Pengadaan Banten Pejati & Dapetan Piodalan Purnama Sasih Kalima',
    nominal: 1250000,
    dicatatOleh: 'Ni Wayan Puspitawati, S.Pd.H.',
  });
  addTx({
    tanggal: '2026-11-04',
    jenis: 'Pengeluaran',
    kategori: 'Konsumsi Ngayah',
    uraian: 'Konsumsi Ngayah & Rapat Koordinasi Pengempon November 2026',
    nominal: 600000,
    dicatatOleh: 'Ni Nyoman Yuliantari',
  });
  addTx({
    tanggal: '2026-11-12',
    jenis: 'Pengeluaran',
    kategori: 'Administrasi & Lainnya',
    uraian: 'Pencetakan Buku Kas, Map Arsip AD/ART & Alat Tulis Sekretariat',
    nominal: 285000,
    dicatatOleh: 'I Gusti Ngurah Suariana',
  });

  return txs.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

export const INITIAL_TRANSAKSI: TransaksiKeuangan[] = buildInitialTransactions();

export const INITIAL_GALERI: DokumentasiItem[] = [
  {
    id: 'gal-01',
    judul: 'Penataan Mandala & Pelataran Candi Bentar Pura BDK Denpasar',
    kategori: 'Pemeliharaan Pura',
    tanggal: '2026-11-10',
    lokasi: 'Mandala Utama Pura BDK Denpasar',
    imageUrl: '/src/assets/images/pura_bdk_courtyard_1795151447275.jpg',
    catatan:
      'Kegiatan rutin penataan taman kamboja, pembersihan pelataran batu alam, serta pengecekan pencahayaan Candi Bentar guna menjaga keasrian dan kesucian lingkungan pura.',
    fotografer: 'Ni Made Dwi Anggraini, A.Md.',
  },
  {
    id: 'gal-02',
    judul: 'Persiapan Banten Pejati & Canang Sari Piodalan Sasih Kalima',
    kategori: 'Piodalan',
    tanggal: '2026-11-04',
    lokasi: 'Bale Piyasan Pura BDK Denpasar',
    imageUrl: '/src/assets/images/piodalan_banten_ceremony_1795151447872.jpg',
    catatan:
      'Seksi Banten bersama ibu-ibu pengempon menata Banten Pejati, Dapetan, Soda, dan Gebogan buah sebelum pelaksanaan persembahyangan Purnama Sasih Kalima yang dipimpin Jro Mangku.',
    fotografer: 'Ni Kadek Melani Cahyani, S.Kom.',
  },
  {
    id: 'gal-03',
    judul: 'Ngayah & Gotong Royong Pembuatan Penjor Pengempon BDK',
    kategori: 'Gotong Royong',
    tanggal: '2026-10-18',
    lokasi: 'Natar Madya Pura BDK Denpasar',
    imageUrl: '/src/assets/images/gotong_royong_pengempon_1795151448570.jpg',
    catatan:
      'Sebanyak 28 anggota pengempon hadir bergotong royong merangkai janur, sampian penjor, dan hiasan bambu dalam suasana kekeluargaan dan keharmonisan pengabdian.',
    fotografer: 'I Gusti Ngurah Suariana',
  },
  {
    id: 'gal-04',
    judul: 'Pemasangan Wastra & Tedung Agung di Pelinggih Padmasana',
    kategori: 'Pemeliharaan Pura',
    tanggal: '2026-09-18',
    lokasi: 'Utama Mandala Pura BDK Denpasar',
    imageUrl: '/src/assets/images/pura_pelinggih_padmasana_1795151448831.jpg',
    catatan:
      'Penggantian kain wastra poleng, kuning keemasan, serta pemasangan Tedung Agung baru pada Pelinggih Padmasana agar tetap terawat dan khidmat saat persembahyangan.',
    fotografer: 'Ni Made Dwi Anggraini, A.Md.',
  },
];

export const INITIAL_AD_ART: PasalAdArt[] = [
  {
    id: 'ad-1',
    bagian: 'Anggaran Dasar',
    bab: 'BAB I',
    judul: 'Nama, Kedudukan, dan Azas Organisasi',
    isi: [
      'Pasal 1 (Nama): Organisasi pengelola tempat suci ini bernama Pengempon Pura Balai Diklat Keagamaan (BDK) Denpasar.',
      'Pasal 2 (Kedudukan): Berkedudukan di lingkungan Balai Diklat Keagamaan Denpasar, Provinsi Bali.',
      'Pasal 3 (Azas & Tujuan): Berazaskan Pancasila, ajaran Dharma Agama Hindu (Tri Hita Karana), serta bertujuan menjaga kesucian, kelestarian, tata kelola upacara piodalan, dan kerukunan seluruh pengempon.',
    ],
  },
  {
    id: 'ad-2',
    bagian: 'Anggaran Dasar',
    bab: 'BAB II',
    judul: 'Keanggotaan Pengempon',
    isi: [
      'Pasal 4 (Syarat Anggota): Anggota Pengempon Pura BDK Denpasar adalah pegawai ASN, PPPK, tenaga pendukung, serta purnabakti BDK Denpasar beragama Hindu yang mendaftarkan diri secara aktif dan tercatat dalam Buku Induk Pengempon (jumlah dasar 30 orang dan dapat bertambah/berkurang sesuai mutasi pegawai).',
      'Pasal 5 (Status Keanggotaan): Keanggotaan diklasifikasikan menjadi Aktif, Cuti (tugas belajar/penugasan luar kota), dan Nonaktif (pensiun/mutasi keluar satuan kerja).',
    ],
  },
  {
    id: 'ad-3',
    bagian: 'Anggaran Dasar',
    bab: 'BAB III',
    judul: 'Susunan Kepengurusan',
    isi: [
      'Pasal 6 (Struktur Pengurus): Kepengurusan terdiri atas Penasihat/Sesepuh, Ketua Pengempon, Wakil Ketua, Sekretaris I & II, Bendahara I & II, serta Seksi-Seksi (Seksi Banten/Upakara, Seksi Perlengkapan, Seksi Keamanan/Pecalang, Seksi Kebersihan, Seksi Dokumentasi, dan Seksi Konsumsi).',
      'Pasal 7 (Masa Bakti): Masa bakti pengurus ditetapkan selama 3 (tiga) tahun dan dapat dipilih kembali melalui Paruman Pengempon.',
    ],
  },
  {
    id: 'ad-4',
    bagian: 'Anggaran Dasar',
    bab: 'BAB IV',
    judul: 'Keuangan dan Transparansi Kas Pura',
    isi: [
      'Pasal 8 (Sumber Dana): Keuangan Pura bersumber dari Iuran Wajib Pengempon (bulanan maupun tahunan), Dana Punia sukarela, serta dukungan operasional pemeliharaan sesuai ketentuan.',
      'Pasal 9 (Prinsip Akuntabilitas): Seluruh pemasukan dan pengeluaran kas pura wajib dicatat secara terbuka, disertai bukti transaksi, dan dilaporkan secara berkala setiap bulan serta pada akhir tahun takwim.',
    ],
  },
  {
    id: 'art-1',
    bagian: 'Anggaran Rumah Tangga',
    bab: 'BAB I',
    judul: 'Hak, Kewajiban, dan Mutasi Anggota',
    isi: [
      'Pasal 1 (Kewajiban & Kisaran Iuran Pengempon): Setiap anggota aktif wajib mengikuti kegiatan ngayah/gotong royong persiapan piodalan sesuai jadwal seksi serta membayar iuran wajib sesuai dua tingkat kisaran yang disepakati, yaitu Rp 35.000 (tiga puluh lima ribu rupiah) atau Rp 20.000 (dua puluh ribu rupiah) per bulan. Pembayaran dapat dilakukan secara bulanan paling lambat tanggal 25 setiap bulannya atau sekaligus sekali setahun (12 bulan: Rp 420.000 atau Rp 240.000 per tahun).',
      'Pasal 2 (Hak & Solidaritas Suka Duka Pengempon): Setiap anggota berhak memperoleh informasi laporan keuangan secara terbuka, mengusulkan program kerja pada Paruman, serta mendapat perhatian/santunan Suka Duka (pernikahan, kelahiran, upacara manusa yadnya, sakit rawat inap, maupun kedukaan) sesuai kesepakatan.',
      'Pasal 3 (Pembaruan Data): Sekretaris berkewajiban memperbarui daftar 30+ anggota apabila terdapat anggota baru, mutasi masuk/keluar, maupun perubahan status cuti.',
    ],
  },
  {
    id: 'art-2',
    bagian: 'Anggaran Rumah Tangga',
    bab: 'BAB II',
    judul: 'Tata Laksana Piodalan & Sarana Upakara',
    isi: [
      'Pasal 4 (Jadwal Piodalan): Pura BDK Denpasar melaksanakan Piodalan Rutin setiap Purnama (Kapat, Kalima, Kanem, dst.) serta Piodalan Ageng pada Hari Suci Saraswati, Tumpek Landep, dan Pecaruan Tilem Kesanga.',
      'Pasal 5 (Rincian Banten): Seksi Banten menyiapkan daftar rincian banten minimal 7 (tujuh) hari sebelum hari pelaksanaan agar anggaran dapat diverifikasi oleh Bendahara dan Ketua.',
      'Pasal 6 (Busana & Etika): Seluruh pengempon yang ngaturang ayah wajib mengenakan busana adat madya yang bersih, rapi, dan sopan.',
    ],
  },
  {
    id: 'art-3',
    bagian: 'Anggaran Rumah Tangga',
    bab: 'BAB III',
    judul: 'Pengelolaan Dokumentasi, Inventaris & Pelaporan',
    isi: [
      'Pasal 7 (Dokumentasi Kegiatan): Seksi Dokumentasi mengarsipkan foto dan catatan pelaksanaan setiap upacara serta pemeliharaan fisik pura sebagai memori kelembagaan.',
      'Pasal 8 (Pelaporan Berkala): Bendahara menyusun Rekapitulasi Kas Masuk, Kas Keluar, dan Daftar Realisasi Iuran Anggota setiap akhir bulan untuk ditinjau bersama seluruh pengempon.',
    ],
  },
];

export const INITIAL_PINJAMAN_DANA: PinjamanDana[] = [
  {
    id: 'pinj-01',
    tanggalPinjam: '2026-10-15',
    peminjam: 'I Komang Agus Darmawan',
    keperluan: 'Pinjaman dana darurat upacara keluarga (Ngaben)',
    nominal: 1500000,
    sudahDikembalikan: 500000,
    jatuhTempo: '2027-01-15',
    status: 'Berjalan',
    dicatatOleh: 'Ni Kadek Ceryna Dewi',
    rencanaPengembalian: '3x angsuran bulanan @ Rp 500.000',
    rencanaAngsuran: [
      {
        id: 'rcn-p1-1',
        termin: 1,
        tanggalRencana: '2026-11-05',
        nominalRencana: 500000,
        catatan: 'Angsuran tahap I',
      },
      {
        id: 'rcn-p1-2',
        termin: 2,
        tanggalRencana: '2026-12-15',
        nominalRencana: 500000,
        catatan: 'Angsuran tahap II',
      },
      {
        id: 'rcn-p1-3',
        termin: 3,
        tanggalRencana: '2027-01-15',
        nominalRencana: 500000,
        catatan: 'Pelunasan tahap III',
      },
    ],
    riwayatAngsuran: [
      {
        id: 'ang-p1-1',
        tanggal: '2026-11-05',
        nominal: 500000,
        dicatatOleh: 'Ni Kadek Ceryna Dewi',
        keterangan: 'Angsuran ke-1',
      },
    ],
  },
  {
    id: 'pinj-02',
    tanggalPinjam: '2026-11-05',
    peminjam: 'Seksi Perlengkapan (I Ketut Suartana)',
    keperluan: 'Kasbon panjar pengadaan penjor & dekorasi Piodalan Sasih Kanem',
    nominal: 750000,
    sudahDikembalikan: 0,
    jatuhTempo: '2026-12-10',
    status: 'Berjalan',
    dicatatOleh: 'I Nyoman Gede Wirawan, S.Ak.',
    rencanaPengembalian: '1x pelunasan setelah Piodalan Sasih Kanem',
    rencanaAngsuran: [
      {
        id: 'rcn-p2-1',
        termin: 1,
        tanggalRencana: '2026-12-10',
        nominalRencana: 750000,
        catatan: 'Pertanggungjawaban & pelunasan kasbon',
      },
    ],
    riwayatAngsuran: [],
  },
  {
    id: 'pinj-03',
    tanggalPinjam: '2026-08-10',
    peminjam: 'I Made Oka Wiguna',
    keperluan: 'Pinjaman kas anggota (upacara Otonan)',
    nominal: 1000000,
    sudahDikembalikan: 1000000,
    jatuhTempo: '2026-10-10',
    status: 'Lunas',
    dicatatOleh: 'Ni Kadek Ceryna Dewi',
    rencanaPengembalian: '2x angsuran bulanan @ Rp 500.000',
    rencanaAngsuran: [
      {
        id: 'rcn-p3-1',
        termin: 1,
        tanggalRencana: '2026-09-10',
        nominalRencana: 500000,
        catatan: 'Angsuran tahap I',
      },
      {
        id: 'rcn-p3-2',
        termin: 2,
        tanggalRencana: '2026-10-10',
        nominalRencana: 500000,
        catatan: 'Pelunasan tahap II',
      },
    ],
    riwayatAngsuran: [
      {
        id: 'ang-p3-1',
        tanggal: '2026-09-10',
        nominal: 500000,
        dicatatOleh: 'Ni Kadek Ceryna Dewi',
        keterangan: 'Angsuran ke-1',
      },
      {
        id: 'ang-p3-2',
        tanggal: '2026-10-08',
        nominal: 500000,
        dicatatOleh: 'Ni Kadek Ceryna Dewi',
        keterangan: 'Pelunasan angsuran ke-2',
      },
    ],
  },
];

export const INITIAL_PERLENGKAPAN: PerlengkapanPura[] = [
  {
    id: 'prl-01',
    kodeBarang: 'INV-PURA-01',
    namaBarang: 'Tedung Agung Kuning-Putih',
    kategori: 'Upakara & Pelinggih',
    jumlahTotal: 6,
    kondisi: 'Baik',
    lokasiSimpan: 'Gedong Penyimpanan Bale Piyasan',
    keterangan: 'Digunakan untuk Pelinggih Padmasana & Ratu Ngurah',
  },
  {
    id: 'prl-02',
    kodeBarang: 'INV-PURA-02',
    namaBarang: 'Set Kain Wastra Poleng & Kuning Keemasan',
    kategori: 'Upakara & Pelinggih',
    jumlahTotal: 8,
    kondisi: 'Baik',
    lokasiSimpan: 'Lemari Arsip & Upakara',
  },
  {
    id: 'prl-03',
    kodeBarang: 'INV-PURA-03',
    namaBarang: 'Tenda Terop Lipat (3x3 Meter)',
    kategori: 'Tenda, Meja & Kursi',
    jumlahTotal: 3,
    kondisi: 'Baik',
    lokasiSimpan: 'Gudang Sarana BDK Selatan',
  },
  {
    id: 'prl-04',
    kodeBarang: 'INV-PURA-04',
    namaBarang: 'Kursi Lipat Pengempon',
    kategori: 'Tenda, Meja & Kursi',
    jumlahTotal: 40,
    kondisi: 'Baik',
    lokasiSimpan: 'Gudang Sarana BDK Selatan',
  },
  {
    id: 'prl-05',
    kodeBarang: 'INV-PURA-05',
    namaBarang: 'Sound System Portable & 2 Mikrofon Wireless',
    kategori: 'Elektronik & Sound',
    jumlahTotal: 2,
    kondisi: 'Baik',
    lokasiSimpan: 'Ruang Seksi Perlengkapan',
  },
  {
    id: 'prl-06',
    kodeBarang: 'INV-PURA-06',
    namaBarang: 'Perangkat Gambelan Gong Baleganjur Mini',
    kategori: 'Kesenian & Tabuh',
    jumlahTotal: 1,
    kondisi: 'Baik',
    lokasiSimpan: 'Bale Kulkul / Ruang Kesenian',
  },
  {
    id: 'prl-07',
    kodeBarang: 'INV-PURA-07',
    namaBarang: 'Bokor Kuningan & Dulang Banten',
    kategori: 'Upakara & Pelinggih',
    jumlahTotal: 14,
    kondisi: 'Baik',
    lokasiSimpan: 'Gedong Penyimpanan Bale Piyasan',
  },
  {
    id: 'prl-08',
    kodeBarang: 'INV-PURA-08',
    namaBarang: 'Peralatan Ngayah (Sapu Lidi, Sabit, Selang Air 30m)',
    kategori: 'Alat Kebersihan',
    jumlahTotal: 10,
    kondisi: 'Perlu Perbaikan',
    lokasiSimpan: 'Pojok Taman Utara Pura',
    keterangan: '2 sabit perlu diasah ulang sebelum gotong royong Desember',
  },
];

export const INITIAL_PEMINJAMAN_BARANG: PeminjamanPerlengkapan[] = [
  {
    id: 'pbr-01',
    perlengkapanId: 'prl-03',
    namaBarang: 'Tenda Terop Lipat (3x3 Meter)',
    peminjam: 'I Putu Eka Pranata',
    jumlah: 1,
    tanggalPinjam: '2026-11-18',
    rencanaKembali: '2026-11-24',
    keperluan: 'Upacara Manusa Yadnya di kediaman (Sesetan)',
    status: 'Dipinjam',
  },
  {
    id: 'pbr-02',
    perlengkapanId: 'prl-04',
    namaBarang: 'Kursi Lipat Pengempon',
    peminjam: 'I Putu Eka Pranata',
    jumlah: 15,
    tanggalPinjam: '2026-11-18',
    rencanaKembali: '2026-11-24',
    keperluan: 'Upacara Manusa Yadnya di kediaman (Sesetan)',
    status: 'Dipinjam',
  },
  {
    id: 'pbr-03',
    perlengkapanId: 'prl-05',
    namaBarang: 'Sound System Portable & 2 Mikrofon Wireless',
    peminjam: 'Panitia Diklat Keagamaan Hindu',
    jumlah: 1,
    tanggalPinjam: '2026-11-10',
    rencanaKembali: '2026-11-12',
    tanggalKembali: '2026-11-12',
    keperluan: 'Dharma Wacana Pagi Aula BDK Denpasar',
    status: 'Dikembalikan',
  },
];

export const DEFAULT_LOGO_URL =
  '/assets/aistudio/file_0000000094e482119e3d21450a83d9ca_5fb95b55.png';

export const INITIAL_PROFIL: PuraProfil = {
  namaPura: 'Pura BDK Denpasar',
  logoUrl: DEFAULT_LOGO_URL,
  alamatSingkat: 'Jl. Raya Mengwi, Km. 14 Beringkit Mengwitani Mengwi Badung Bali',
  alamatLengkap:
    'Kompleks Balai Diklat Keagamaan (BDK) Denpasar, Jl. Raya Mengwi, Km. 14 Beringkit, Mengwitani, Kec. Mengwi, Kabupaten Badung, Bali',
  kontakPengurus: '0812-3641-1001',
  emailResmi: 'purabdkdenpasar@kemenag-bdk.id',
  sambutanBeranda:
    'Om Swastyastu. Selamat datang di halaman resmi Pura BDK Denpasar. Halaman ini memuat informasi kepengurusan, agenda piodalan dan kegiatan, inventaris perlengkapan, transparansi pinjaman kas, serta laporan keuangan kas pura sebagai bentuk keterbukaan kepada seluruh pengempon.',
  jamOperasional: 'Setiap hari kerja 06.30 – 19.00 WITA · Piodalan & Hari Raya dibuka penuh',
  catatanAksesPeta:
    'Akses melalui gerbang utama Kompleks BDK Denpasar di Jl. Raya Mengwi, Km. 14 Beringkit, Mengwitani, Mengwi, Badung. Parkir kendaraan pengempon tersedia di area Nista Mandala.',
  googleMapsQuery:
    'Balai Diklat Keagamaan Denpasar, Jl. Raya Mengwi, Km. 14 Beringkit, Mengwitani, Mengwi, Badung, Bali',
  defaultIuranBulanan: 35000,
  opsiIuranKedua: 20000,
  osmLat: -8.5565,
  osmLng: 115.1778,
};

export const INITIAL_KEAMANAN: KeamananAkun = {
  passwordPengurus: '123456',
  passwordPengempon: '123456',
  allowDemoQuickLogin: true,
};

export const INITIAL_SARAN_MASUKAN: SaranMasukan[] = [
  {
    id: 'srn-01',
    tanggal: '2026-11-12',
    namaPengirim: 'I Made Adi Nugraha, S.E.',
    kategori: 'Pelayanan & Fasilitas',
    isiSaran:
      'Mohon penambahan 1 unit rak sandal dan tempat payung di sisi luar Candi Bentar agar tertata rapi saat musim hujan menjelang piodalan Desember.',
    status: 'Ditindaklanjuti',
    tanggapanPengurus:
      'Suksma masukannya. Seksi Perlengkapan telah menyiapkan pengadaan 2 rak kayu jati dan akan dipasang sebelum ngayah H-1 Piodalan Purnama Kanem.',
    ditanggapiOleh: 'I Ketut Suartana (Koord. Perlengkapan)',
  },
  {
    id: 'srn-02',
    tanggal: '2026-11-16',
    namaPengirim: 'Ni Luh Putu Ayu Permatasari',
    kategori: 'Upakara & Piodalan',
    isiSaran:
      'Usul agar daftar pembagian tugas ngayah mejejaitan H-1 ditempel di Bale Piyasan sekaligus dibagikan di grup pengempon lebih awal.',
    status: 'Ditinjau',
    tanggapanPengurus:
      'Masukan diterima, sedang disusun pembagian kelompok mejejaitan oleh Seksi Banten.',
    ditanggapiOleh: 'Ni Wayan Puspitawati, S.Pd.H.',
  },
  {
    id: 'srn-03',
    tanggal: '2026-11-20',
    namaPengirim: 'I Putu Arya Wibawa',
    kategori: 'Perlengkapan & Pinjaman',
    isiSaran:
      'Saran agar jadwal peminjaman kursi lipat dan tenda dilengkapi pengingat H-1 pengembalian agar selalu siap pakai untuk kegiatan mendadak di BDK.',
    status: 'Baru',
  },
];

export const INITIAL_RENCANA_KERJA: RencanaKerjaItem[] = [
  {
    id: 'rk-01',
    kodeProgram: 'RK-2026-01',
    namaProgram: 'Pelaksanaan Piodalan Purnama Sasih Kanem & Ngayah Pengempon',
    bidang: 'Upakara & Piodalan',
    periode: 'Triwulan IV 2026',
    targetTanggal: '2026-12-03',
    penanggungJawab: 'Ni Wayan Puspitawati, S.Pd.H.',
    estimasiAnggaran: 1850000,
    sumberDana: 'Kas Iuran Pengempon & Dana Punia',
    prioritas: 'Tinggi',
    status: 'Berjalan',
    progresPersen: 75,
    uraianTujuan:
      'Menyelenggarakan upacara Piodalan Purnama Sasih Kanem secara khidmat serta mengoordinasikan kegiatan ngayah mejejaitan H-1 oleh seluruh seksi.',
    indikatorKeberhasilan:
      'Seluruh banten pejati/suci siap H-1 pukul 16.00 WITA dan dihadiri minimal 85% pengempon aktif.',
    catatanRealisasi:
      'Pembagian kelompok mejejaitan dan daftar banten telah disusun; pengadaan sarana upakara sedang berjalan.',
  },
  {
    id: 'rk-02',
    kodeProgram: 'RK-2026-02',
    namaProgram: 'Perbaikan Penerangan Taman & Candi Bentar Pura',
    bidang: 'Pemeliharaan & Pembangunan',
    periode: 'Triwulan IV 2026',
    targetTanggal: '2026-10-25',
    penanggungJawab: 'I Putu Eka Pranata',
    estimasiAnggaran: 780000,
    sumberDana: 'Kas Pemeliharaan Pura',
    prioritas: 'Sedang',
    status: 'Selesai',
    progresPersen: 100,
    uraianTujuan:
      'Mengganti lampu taman sorot dan instalasi penerangan Candi Bentar agar area mandala tetap terang dan aman pada malam hari.',
    indikatorKeberhasilan:
      'Seluruh 8 titik lampu taman dan Candi Bentar menyala normal serta kabel tertata aman.',
    catatanRealisasi: 'Selesai dikerjakan pada 22 Oktober 2026 dan sudah dicatat pada Buku Kas.',
  },
  {
    id: 'rk-03',
    kodeProgram: 'RK-2026-03',
    namaProgram: 'Pengadaan Rak Sandal Jati & Tempat Payung Candi Bentar',
    bidang: 'Perlengkapan & Kebersihan',
    periode: 'Triwulan IV 2026',
    targetTanggal: '2026-12-01',
    penanggungJawab: 'I Ketut Suartana',
    estimasiAnggaran: 950000,
    sumberDana: 'Kas Perlengkapan Pura',
    prioritas: 'Sedang',
    status: 'Berjalan',
    progresPersen: 60,
    uraianTujuan:
      'Menindaklanjuti saran pengempon dengan menyediakan 2 unit rak sandal kayu jati dan tempat payung di sisi luar Candi Bentar menghadapi musim hujan.',
    indikatorKeberhasilan:
      '2 unit rak sandal terpasang rapi sebelum H-1 Piodalan Purnama Kanem.',
    catatanRealisasi: 'Pesanan pengrajin kayu sudah dalam tahap finishing.',
  },
  {
    id: 'rk-04',
    kodeProgram: 'RK-2026-04',
    namaProgram: 'Penertiban Realisasi Iuran Wajib (Rp 35.000 / Rp 20.000 & Tahunan)',
    bidang: 'Keuangan & Iuran',
    periode: 'Triwulan IV 2026',
    targetTanggal: '2026-12-28',
    penanggungJawab: 'Ni Kadek Ceryna Dewi',
    estimasiAnggaran: 0,
    sumberDana: 'Swadaya Administrasi Pengurus',
    prioritas: 'Rutin',
    status: 'Berjalan',
    progresPersen: 80,
    uraianTujuan:
      'Memastikan pencatatan iuran wajib sesuai dua kisaran (Rp 35.000 dan Rp 20.000) serta mendata pengempon yang memilih pelunasan sekaligus sekali setahun.',
    indikatorKeberhasilan:
      'Tingkat pelunasan iuran anggota aktif mencapai minimal 95% dan laporan kas akhir tahun tersaji tepat waktu.',
    catatanRealisasi: '5 anggota sudah tercatat skema tahunan 2026; penagihan bulan November berjalan.',
  },
  {
    id: 'rk-05',
    kodeProgram: 'RK-2027-01',
    namaProgram: 'Rangkaian Upacara Hari Suci Saraswati & Pecaruan Tilem Kesanga',
    bidang: 'Upakara & Piodalan',
    periode: 'Triwulan I 2027',
    targetTanggal: '2027-03-08',
    penanggungJawab: 'I Wayan Arya Adnyana',
    estimasiAnggaran: 5850000,
    sumberDana: 'Kas Pura, Punia & Dukungan Operasional BDK',
    prioritas: 'Tinggi',
    status: 'Direncanakan',
    progresPersen: 20,
    uraianTujuan:
      'Mempersiapkan Piodalan Ageng Hari Suci Saraswati (Januari 2027) serta Caru Eka Sata menjelang Hari Suci Nyepi (Maret 2027) di lingkungan BDK Denpasar.',
    indikatorKeberhasilan:
      'RAB dan daftar banten disahkan minimal 14 hari sebelum pelaksanaan dan upacara berjalan tertib.',
  },
  {
    id: 'rk-06',
    kodeProgram: 'RK-2027-02',
    namaProgram: 'Paruman Awal Tahun & Pembaruan Buku Induk Pengempon 2027',
    bidang: 'Sosial & Kemanusiaan',
    periode: 'Triwulan I 2027',
    targetTanggal: '2027-01-25',
    penanggungJawab: 'I Gusti Ngurah Suariana',
    estimasiAnggaran: 450000,
    sumberDana: 'Kas Administrasi & Konsumsi',
    prioritas: 'Sedang',
    status: 'Direncanakan',
    progresPersen: 15,
    uraianTujuan:
      'Melaksanakan rapat paruman awal tahun bersama Pembina, Pengurus, dan Anggota untuk evaluasi LPJ kas 2026 serta pemutakhiran data pegawai mutasi masuk/keluar.',
    indikatorKeberhasilan:
      'Notulen paruman, pengesahan rencana anggaran 2027, dan daftar anggota aktif terbaru terbit pada Januari 2027.',
  },
  {
    id: 'rk-07',
    kodeProgram: 'RK-2027-03',
    namaProgram: 'Pembinaan Dharma Wacana & Pesantian Rutin Purnama-Tilem',
    bidang: 'Pendidikan Dharma',
    periode: 'Tahunan 2027',
    targetTanggal: '2027-06-30',
    penanggungJawab: 'Drs. Ida Bagus Ketut Mantra, M.Pd.',
    estimasiAnggaran: 600000,
    sumberDana: 'Kas Pura & Punia Sukarela',
    prioritas: 'Rutin',
    status: 'Direncanakan',
    progresPersen: 10,
    uraianTujuan:
      'Menghidupkan kegiatan Dharma Wacana singkat serta latihan kidung/pesantian pengempon setiap persembahyangan Purnama dan Tilem.',
    indikatorKeberhasilan:
      'Terlaksananya minimal 6 kali Dharma Wacana dan partisipasi aktif kelompok pesantian pengempon.',
  },
];

export const INITIAL_SUKA_DUKA: CatatanSukaDuka[] = [
  {
    id: 'sd-01',
    tanggal: '2026-10-18',
    jenis: 'Duka',
    kategori: 'Kedukaan / Meninggal Dunia',
    anggotaId: 'ang-011',
    namaKeluarga: 'Keluarga I Komang Agus Darmawan',
    lokasiAcara: 'Jl. Antasura No. 34, Peguyangan, Denpasar',
    uraian:
      'Kunjungan melayat dan penyerahan dana sosial suka duka atas berpulangnya ayahanda terkasih (upacara Pitra Yadnya / Ngaben).',
    nominalSantunan: 500000,
    bentukBingkisan: 'Karangan bunga duka cita & dupa/bunga tabur',
    perwakilanPengurus: 'I Wayan Arya Adnyana & I Ketut Suartana',
    status: 'Sudah Disalurkan',
    dicatatOleh: 'Ni Kadek Ceryna Dewi',
    tercatatDiKas: true,
  },
  {
    id: 'sd-02',
    tanggal: '2026-11-02',
    jenis: 'Suka',
    kategori: 'Pernikahan / Pawiwahan',
    anggotaId: 'ang-009',
    namaKeluarga: 'Ni Komang Triana Putri, S.Psi.',
    lokasiAcara: 'Jl. Ahmad Yani Utara No. 210, Denpasar',
    uraian:
      'Kehadiran perwakilan pengempon pada upacara Pawiwahan anggota serta penyerahan tali kasih pengempon Pura BDK Denpasar.',
    nominalSantunan: 300000,
    bentukBingkisan: 'Kado kenang-kenangan keluarga',
    perwakilanPengurus: 'Ni Made Ratna Dewi, S.E. & Ni Wayan Puspitawati, S.Pd.H.',
    status: 'Sudah Disalurkan',
    dicatatOleh: 'Ni Kadek Ceryna Dewi',
    tercatatDiKas: true,
  },
  {
    id: 'sd-03',
    tanggal: '2026-11-11',
    jenis: 'Duka',
    kategori: 'Sakit / Rawat Inap',
    anggotaId: 'ang-029',
    namaKeluarga: 'Ni Wayan Eka Rahayu, S.Pd.',
    lokasiAcara: 'Jl. Sekar Sari No. 15, Kesiman / RSUD Wangaya',
    uraian:
      'Besuk pemulihan kesehatan pasca perawatan rawat inap dan penyampaian doa kesembuhan bersama keluarga pengempon.',
    nominalSantunan: 250000,
    bentukBingkisan: 'Parsel buah & minuman kesehatan',
    perwakilanPengurus: 'Ni Kadek Ceryna Dewi & Ni Luh Putu Sariani, S.Ag.',
    status: 'Sudah Disalurkan',
    dicatatOleh: 'I Gusti Ngurah Suariana',
    tercatatDiKas: false,
  },
  {
    id: 'sd-04',
    tanggal: '2026-11-24',
    jenis: 'Suka',
    kategori: 'Manusa Yadnya (Metatah / Lainnya)',
    anggotaId: 'ang-012',
    namaKeluarga: 'Keluarga I Putu Eka Pranata',
    lokasiAcara: 'Sesetan, Denpasar Selatan',
    uraian:
      'Undangan upacara Manusa Yadnya (Mepandes / Metatah) putra-putri pengempon di kediaman Sesetan.',
    nominalSantunan: 300000,
    bentukBingkisan: 'Tali kasih sukacita pengempon',
    perwakilanPengurus: 'I Ketut Suartana & I Gusti Ngurah Suariana',
    status: 'Dijadwalkan',
    dicatatOleh: 'I Gusti Ngurah Suariana',
    tercatatDiKas: false,
  },
];

export const INITIAL_DATABASE: PuraDatabase = {
  pengumuman:
    'Om Swastyastu. Selamat datang di halaman resmi Pura BDK Denpasar · Piodalan Purnama Sasih Kanem dilaksanakan 3 Desember 2026 pukul 08.00 WITA · Ngayah persiapan dilaksanakan H-1 pukul 15.00 WITA · Iuran wajib Rp 35.000 / Rp 20.000 per bulan (dapat dibayar bulanan atau sekali setahun).',
  profil: INITIAL_PROFIL,
  keamanan: INITIAL_KEAMANAN,
  anggota: INITIAL_ANGGOTA,
  piodalan: INITIAL_PIODALAN,
  transaksi: INITIAL_TRANSAKSI,
  pinjamanDana: INITIAL_PINJAMAN_DANA,
  perlengkapan: INITIAL_PERLENGKAPAN,
  peminjamanBarang: INITIAL_PEMINJAMAN_BARANG,
  galeri: INITIAL_GALERI,
  adArt: INITIAL_AD_ART,
  rencanaKerja: INITIAL_RENCANA_KERJA,
  sukaDuka: INITIAL_SUKA_DUKA,
  saranMasukan: INITIAL_SARAN_MASUKAN,
  pengesahanAdArt: {
    nomorKeputusan: 'KEP-04/PURA-BDK/DPS/2025',
    tanggalPenetapan: '2025-01-15',
    ketuaPura: 'I Wayan Arya Adnyana',
    sekretarisPura: 'I Gusti Ngurah Suariana',
    penasihat: 'Drs. Ida Bagus Ketut Mantra, M.Pd.',
  },
};
