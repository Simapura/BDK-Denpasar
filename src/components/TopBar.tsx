import React from 'react';
import { Eye, LogOut, Menu, Plus, ShieldCheck } from 'lucide-react';
import { MenuId, UserSession } from '../types/pura';
import { PuraEmblem } from './LoginView';

interface TopBarProps {
  activeMenu: MenuId;
  onSelectMenu: (menu: MenuId) => void;
  onOpenMobile: () => void;
  onQuickAction: () => void;
  quickActionLabel: string;
  showQuickAction: boolean;
  canManage: boolean;
  namaPura?: string;
  logoUrl?: string;
  session: UserSession;
  onLogout: () => void;
}

const MENU_TITLES: Record<MenuId, { title: string; breadcrumb: string }> = {
  dashboard: {
    title: 'Beranda SIMAPURA · Pura BDK Denpasar',
    breadcrumb: 'SIMAPURA · Pura BDK Denpasar / Beranda Utama & Peta Lokasi',
  },
  'rencana-kerja': {
    title: 'Rencana Kerja & Program Pengempon',
    breadcrumb: 'SIMAPURA · Pura BDK Denpasar / Program Kerja, Target & Realisasi',
  },
  anggota: {
    title: 'Data Anggota & Pengempon',
    breadcrumb: 'SIMAPURA · Pura BDK Denpasar / Buku Induk Pengempon',
  },
  piodalan: {
    title: 'Jadwal & Jenis Piodalan',
    breadcrumb: 'SIMAPURA · Pura BDK Denpasar / Kalender Upakara & Banten',
  },
  perlengkapan: {
    title: 'Perlengkapan Pura',
    breadcrumb: 'SIMAPURA · Pura BDK Denpasar / Inventaris & Peminjaman Barang',
  },
  pinjaman: {
    title: 'Pinjaman Kas Pura',
    breadcrumb: 'SIMAPURA · Pura BDK Denpasar / Pinjaman Dana & Pengembalian',
  },
  keuangan: {
    title: 'Keuangan: Pemasukan & Pengeluaran',
    breadcrumb: 'SIMAPURA · Pura BDK Denpasar / Buku Kas & Iuran Wajib (Bulanan & Tahunan)',
  },
  'suka-duka': {
    title: 'Catatan Suka Duka Pengempon',
    breadcrumb: 'SIMAPURA · Pura BDK Denpasar / Solidaritas Suka Duka & Dana Sosial',
  },
  adart: {
    title: 'AD/ART Organisasi',
    breadcrumb: 'SIMAPURA · Pura BDK Denpasar / Anggaran Dasar & Rumah Tangga',
  },
  galeri: {
    title: 'Dokumentasi & Galeri',
    breadcrumb: 'SIMAPURA · Pura BDK Denpasar / Arsip Foto & Catatan Kegiatan',
  },
  saran: {
    title: 'Kolom Saran & Masukan',
    breadcrumb: 'SIMAPURA · Pura BDK Denpasar / Aspirasi Pengempon & Tindak Lanjut',
  },
  laporan: {
    title: 'Laporan Keuangan & Administrasi',
    breadcrumb: 'SIMAPURA · Pura BDK Denpasar / Rekapitulasi & Ekspor Resmi',
  },
  pengaturan: {
    title: 'Pengaturan Khusus Pengurus',
    breadcrumb: 'SIMAPURA · Pura BDK Denpasar / Kelola Profil, Peta & Tambah Data',
  },
};

const MOBILE_TABS: Array<{ id: MenuId; label: string; pengurusOnly?: boolean }> = [
  { id: 'dashboard', label: 'Beranda' },
  { id: 'adart', label: 'AD/ART' },
  { id: 'rencana-kerja', label: 'Rencana Kerja' },
  { id: 'anggota', label: 'Anggota' },
  { id: 'keuangan', label: 'Keuangan' },
  { id: 'suka-duka', label: 'Suka Duka' },
  { id: 'piodalan', label: 'Piodalan' },
  { id: 'perlengkapan', label: 'Perlengkapan' },
  { id: 'pinjaman', label: 'Pinjaman' },
  { id: 'galeri', label: 'Galeri' },
  { id: 'laporan', label: 'Laporan' },
  { id: 'pengaturan', label: 'Pengaturan', pengurusOnly: true },
  { id: 'saran', label: 'Saran' },
];

export function TopBar({
  activeMenu,
  onSelectMenu,
  onOpenMobile,
  onQuickAction,
  quickActionLabel,
  showQuickAction,
  canManage,
  namaPura = 'Pura BDK Denpasar',
  logoUrl,
  session,
  onLogout,
}: TopBarProps) {
  const meta = MENU_TITLES[activeMenu];
  const visibleMobileTabs = MOBILE_TABS.filter((tab) => !tab.pengurusOnly || canManage);

  return (
    <header className="no-print sticky top-0 z-20 border-b border-[#E6DFCA] bg-[#FAF8F1]/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Emblem + Title OR Desktop Breadcrumb */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenMobile}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2DCC8] bg-white text-[#142019] hover:bg-[#F3EFE2] lg:hidden shrink-0"
            aria-label="Buka menu navigasi"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E6DFCA] bg-white p-0.5 shadow-2xs lg:hidden shrink-0">
            <PuraEmblem logoUrl={logoUrl} className="h-full w-full" />
          </div>

          <div className="min-w-0">
            <p className="hidden lg:block text-xs font-medium text-[#0D6B48] truncate">
              {meta.breadcrumb}
            </p>
            <h1 className="font-serif-title lg:font-display text-sm sm:text-base lg:text-lg font-bold text-[#142019] truncate">
              <span className="lg:hidden">SIMAPURA · {namaPura}</span>
              <span className="hidden lg:inline">{meta.title}</span>
            </h1>
          </div>
        </div>

        {/* Right: Role Pill + Action / Logout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2DCC8] bg-white px-3 py-1.5 text-[11px] sm:text-xs font-medium text-[#435349] whitespace-nowrap">
            {canManage ? (
              <ShieldCheck className="h-3.5 w-3.5 text-[#0D6B48]" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-[#D97706]" />
            )}
            <span className="hidden sm:inline">
              {session.role} · {canManage ? 'Kelola' : 'Hanya Lihat'}
            </span>
            <span className="sm:hidden">{session.role}</span>
          </span>

          {showQuickAction && (
            <button
              type="button"
              onClick={onQuickAction}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[#0D6B48] px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#095438] whitespace-nowrap shrink-0"
            >
              {canManage && <Plus className="h-3.5 w-3.5 shrink-0" />}
              <span>{quickActionLabel}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex lg:hidden items-center gap-1 rounded-xl border border-[#DFD7BF] bg-white px-3 py-1.5 text-xs font-semibold text-[#142019] hover:bg-[#F3EFE2]"
          >
            <LogOut className="h-3.5 w-3.5 text-[#D97706]" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Mobile Scrollable Tab Bar */}
      <nav
        aria-label="Navigasi Cepat Seluler"
        className="flex items-center gap-2 overflow-x-auto border-t border-[#ECE6D5] px-4 py-2.5 lg:hidden"
      >
        {visibleMobileTabs.map((tab) => {
          const active = activeMenu === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectMenu(tab.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-[#0D6B48] text-white font-semibold shadow-xs'
                  : 'text-[#435349] hover:bg-[#EFEAD9] hover:text-[#142019]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
