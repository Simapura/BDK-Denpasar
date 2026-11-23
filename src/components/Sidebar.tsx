import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  Package,
  HandCoins,
  BookOpen,
  Images,
  Wallet,
  HeartHandshake,
  MessageSquare,
  FileSpreadsheet,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { MenuId, UserSession } from '../types/pura';
import { PuraEmblem } from './LoginView';

interface SidebarProps {
  activeMenu: MenuId;
  onSelectMenu: (menu: MenuId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  anggotaAktifCount: number;
  saranBaruCount?: number;
  namaPura?: string;
  logoUrl?: string;
  session: UserSession;
  onLogout: () => void;
}

interface NavItem {
  id: MenuId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pengurusOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Beranda Utama Pura', icon: LayoutDashboard },
  { id: 'adart', label: 'AD/ART Organisasi', icon: BookOpen },
  { id: 'rencana-kerja', label: 'Rencana Kerja Pura', icon: ClipboardList },
  { id: 'anggota', label: 'Data Anggota & Pengempon', icon: Users },
  { id: 'piodalan', label: 'Jadwal & Jenis Piodalan', icon: CalendarDays },
  { id: 'perlengkapan', label: 'Perlengkapan Pura', icon: Package },
  { id: 'pinjaman', label: 'Pinjaman Kas Pura', icon: HandCoins },
  { id: 'keuangan', label: 'Keuangan: Masuk & Keluar', icon: Wallet },
  { id: 'suka-duka', label: 'Catatan Suka Duka', icon: HeartHandshake },
  { id: 'galeri', label: 'Dokumentasi & Galeri', icon: Images },
  { id: 'laporan', label: 'Laporan & Administrasi', icon: FileSpreadsheet },
  { id: 'pengaturan', label: 'Pengaturan Pengurus', icon: Settings, pengurusOnly: true },
  { id: 'saran', label: 'Saran & Masukan', icon: MessageSquare },
];

export function Sidebar({
  activeMenu,
  onSelectMenu,
  mobileOpen,
  onCloseMobile,
  anggotaAktifCount,
  saranBaruCount = 0,
  namaPura = 'Pura BDK Denpasar',
  logoUrl,
  session,
  onLogout,
}: SidebarProps) {
  const isPengurus = session.role === 'Pengurus';

  const handleSelect = (id: MenuId) => {
    onSelectMenu(id);
    onCloseMobile();
  };

  const visibleItems = NAV_ITEMS.filter((item) => !item.pengurusOnly || isPengurus);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white/95 text-[#1B2B22]">
      {/* Brand Identity Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#0D6B48] to-[#137953] px-5 py-4 text-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-xs">
            <PuraEmblem logoUrl={logoUrl} className="h-full w-full" />
          </div>
          <div className="min-w-0">
            <p className="font-serif-title text-base font-bold tracking-wider text-white truncate">
              SIMAPURA
            </p>
            <p className="text-[11px] text-[#FDE68A] truncate">
              Sistem Manajemen {namaPura}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-md p-1.5 text-white/80 hover:bg-white/15 hover:text-white lg:hidden"
          aria-label="Tutup menu navigasi"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Menu Utama">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`group flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-[13.5px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D6B48] ${
                isActive
                  ? 'bg-[#0D6B48] text-white font-semibold'
                  : item.pengurusOnly
                  ? 'border border-[#EDE2C9] bg-[#FFFDF7] text-[#92400E] hover:bg-[#FEF3C7]/60'
                  : 'text-[#425449] hover:bg-[#F5F1E2] hover:text-[#142019]'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive
                      ? 'text-[#F5C556]'
                      : item.pengurusOnly
                      ? 'text-[#D97706]'
                      : 'text-[#63786B] group-hover:text-[#0D6B48]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </span>
              {item.id === 'anggota' && (
                <span
                  className={`font-mono text-xs tabular-nums shrink-0 ${
                    isActive ? 'text-[#FDE68A] font-semibold' : 'text-[#63786B]'
                  }`}
                >
                  {anggotaAktifCount}
                </span>
              )}
              {item.id === 'saran' && saranBaruCount > 0 && (
                <span
                  className={`font-mono text-[11px] tabular-nums shrink-0 ${
                    isActive ? 'text-[#FDE68A] font-semibold' : 'text-[#B45309] font-semibold'
                  }`}
                >
                  {saranBaruCount} baru
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Active Account & Logout Footer */}
      <div className="border-t border-[#E8E2CF] bg-[#FCF9F0] px-4 py-4 space-y-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#142019] truncate">{session.nama}</p>
          <p className="mt-0.5 text-[11px] font-medium text-[#B45309] truncate">
            {isPengurus ? 'Pengurus · Kelola Penuh' : 'Pengempon · Hanya Lihat'} ·{' '}
            {session.nomorInduk}
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#DFD7BF] bg-white px-3 py-2 text-xs font-medium text-[#34443A] transition-colors hover:border-[#0D6B48] hover:text-[#0D6B48]"
        >
          <LogOut className="h-3.5 w-3.5 text-[#D97706]" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="no-print hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-[264px] border-r border-[#E6DFCA]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="no-print fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-[276px] max-w-[85vw] shadow-xl border-r border-[#E6DFCA]">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
