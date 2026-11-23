import React, { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { Anggota, KeamananAkun, PuraProfil, UserRole, UserSession } from '../types/pura';
import { resolveKategoriKeanggotaan } from '../data/initialData';
import { downloadTextFile } from '../utils/format';
import { copyTextWithFallback, fetchSingleFileHtmlBundle } from '../utils/singleFileExport';

interface LoginViewProps {
  anggota: Anggota[];
  keamanan: KeamananAkun;
  profil: PuraProfil;
  onLogin: (session: UserSession) => void;
  justLoggedOut?: boolean;
}

export const UPLOADED_LOGO_PATH =
'/BDK-Denpasar/Lambang Emas Krama Hindu Denpasar.png';

function resolveRoleFromMember(member: Anggota): UserRole {
  const kategori = resolveKategoriKeanggotaan(member.jabatan, member.kategoriKeanggotaan);
  return kategori === 'Pengurus' ? 'Pengurus' : 'Anggota';
}

export function PuraEmblem({
  className = 'h-9 w-9',
  logoUrl,
}: {
  className?: string;
  logoUrl?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = logoUrl || UPLOADED_LOGO_PATH;

  if (!imgFailed) {
    return (
      <img
        src={src}
        alt="Logo Krama Hindu BDK Denpasar"
        onError={() => setImgFailed(true)}
        className={`${className} object-contain`}
      />
    );
  }

  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path
        d="M32 4l5.5 10.2 11.3-2.6-2.6 11.3L56 28.4l-9.8 5.6 2.6 11.3-11.3-2.6L32 53l-5.5-10.3-11.3 2.6 2.6-11.3L8 28.4l9.8-5.5-2.6-11.3 11.3 2.6L32 4z"
        fill="#FACC15"
        stroke="#CA8A04"
        strokeWidth="1.5"
      />
      <circle cx="32" cy="29" r="14" fill="#FFFBEB" stroke="#B91C1C" strokeWidth="2.2" />
      <path d="M23 36h18" stroke="#0D6B48" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M26 36v-5h3v-4l3-4 3 4v4h3v5"
        fill="#0D6B48"
        stroke="#0D6B48"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LoginView({
  anggota,
  keamanan,
  profil,
  onLogin,
  justLoggedOut,
}: LoginViewProps) {
  const [username, setUsername] = useState('pengurus');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bundleLoading, setBundleLoading] = useState(false);
  const [bundleStatus, setBundleStatus] = useState<string | null>(null);
  const [bundleCopied, setBundleCopied] = useState(false);

  const handleCopySingleHtml = async () => {
    setBundleStatus(null);
    setBundleLoading(true);
    try {
      const code = await fetchSingleFileHtmlBundle();
      if (!code) {
        setBundleStatus('Kode 1 file belum tersedia. Masuk lalu ekspor dari menu Laporan.');
        return;
      }
      const ok = await copyTextWithFallback(code);
      const sizeKb = Math.round(code.length / 1024);
      if (ok) {
        setBundleCopied(true);
        setBundleStatus(
          `Kode SIMAPURA 1 file HTML + CSS + JS (~${sizeKb.toLocaleString('id-ID')} KB) berhasil disalin.`
        );
        setTimeout(() => setBundleCopied(false), 3500);
      } else {
        downloadTextFile('simapura-bdk-denpasar-tunggal.html', code, 'text/html;charset=utf-8');
        setBundleStatus('Clipboard dibatasi browser — berkas .html langsung diunduh.');
      }
    } finally {
      setBundleLoading(false);
    }
  };

  const handleDownloadSingleHtml = async () => {
    setBundleStatus(null);
    setBundleLoading(true);
    try {
      const code = await fetchSingleFileHtmlBundle();
      if (!code) {
        setBundleStatus('Kode 1 file belum tersedia.');
        return;
      }
      downloadTextFile('simapura-bdk-denpasar-tunggal.html', code, 'text/html;charset=utf-8');
      const sizeKb = Math.round(code.length / 1024);
      setBundleStatus(
        `Berhasil mengunduh simapura-bdk-denpasar-tunggal.html (~${sizeKb.toLocaleString('id-ID')} KB).`
      );
    } finally {
      setBundleLoading(false);
    }
  };

  const loginWithMember = (member: Anggota, overrideRole?: UserRole) => {
    const role = overrideRole ?? resolveRoleFromMember(member);
    onLogin({
      nomorInduk: member.nomorInduk,
      nama: member.nama,
      jabatan: member.jabatan,
      role,
      loginAt: new Date().toISOString(),
    });
  };

  const isValidPasswordForRole = (input: string, role: UserRole): boolean => {
    const clean = input.trim();
    if (role === 'Pengurus') {
      if (clean === keamanan.passwordPengurus) return true;
      if (keamanan.passwordPengurus === '123456' && ['pengurus', 'pengurus123', 'admin'].includes(clean.toLowerCase())) {
        return true;
      }
      return false;
    }
    if (clean === keamanan.passwordPengempon) return true;
    if (keamanan.passwordPengempon === '123456' && ['pengempon', 'pengempon123'].includes(clean.toLowerCase())) {
      return true;
    }
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const q = username.trim().toLowerCase();
    if (!q) {
      setErrorMsg('Masukkan nama pengguna (contoh: pengurus, pengempon, atau BDK-P/001).');
      return;
    }

    if (q === 'pengurus' || q === 'admin' || q === 'ketua') {
      if (!isValidPasswordForRole(password, 'Pengurus')) {
        setErrorMsg('Kata sandi Pengurus tidak sesuai.');
        return;
      }
      loginWithMember(anggota[0], 'Pengurus');
      return;
    }

    if (q === 'bendahara') {
      if (!isValidPasswordForRole(password, 'Pengurus')) {
        setErrorMsg('Kata sandi Pengurus tidak sesuai.');
        return;
      }
      const b = anggota.find((a) => a.jabatan.toLowerCase().includes('bendahara')) || anggota[4];
      loginWithMember(b, 'Pengurus');
      return;
    }

    if (q === 'sekretaris') {
      if (!isValidPasswordForRole(password, 'Pengurus')) {
        setErrorMsg('Kata sandi Pengurus tidak sesuai.');
        return;
      }
      const s = anggota.find((a) => a.jabatan.toLowerCase().includes('sekretaris')) || anggota[2];
      loginWithMember(s, 'Pengurus');
      return;
    }

    if (q === 'pengempon' || q === 'anggota' || q === 'tamu') {
      if (!isValidPasswordForRole(password, 'Anggota')) {
        setErrorMsg('Kata sandi Pengempon tidak sesuai.');
        return;
      }
      const m =
        anggota.find((a) => a.jabatan === 'Anggota Pengempon' && a.status === 'Aktif') ||
        anggota[18];
      loginWithMember(m, 'Anggota');
      return;
    }

    const matched = anggota.find(
      (a) => a.nomorInduk.toLowerCase() === q || a.nama.toLowerCase().includes(q)
    );

    if (!matched) {
      setErrorMsg(
        'Nama pengguna tidak ditemukan. Gunakan "pengurus", "pengempon", atau No. Induk (BDK-P/001 s.d. BDK-P/030).'
      );
      return;
    }

    const resolvedRole = resolveRoleFromMember(matched);
    if (!isValidPasswordForRole(password, resolvedRole)) {
      setErrorMsg(`Kata sandi ${resolvedRole} tidak sesuai.`);
      return;
    }

    if (matched.status === 'Nonaktif') {
      setErrorMsg(
        `Akun ${matched.nama} berstatus Nonaktif. Hubungi Pengurus untuk aktivasi kembali.`
      );
      return;
    }

    loginWithMember(matched, resolvedRole);
  };

  const defaultPassHint =
    keamanan.passwordPengurus === '123456' && keamanan.passwordPengempon === '123456'
      ? 'Akun: pengurus / pengempon · Sandi awal: 123456'
      : 'Gunakan kata sandi yang telah ditetapkan oleh Pengurus';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{
        background: 'linear-gradient(155deg, #F1E1B5 0%, #FAF8EE 45%, #D4EAE0 100%)',
      }}
    >
      <div className="w-full max-w-[430px] rounded-3xl border border-[#E6DFC8] bg-white/95 px-6 py-9 shadow-xl shadow-[#0D6B48]/5 sm:px-9">
        {/* Centered Uploaded Krama Hindu BDK Denpasar Logo */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-[#EFE9D5] bg-white p-1.5 shadow-md">
          <PuraEmblem logoUrl={profil.logoUrl} className="h-full w-full" />
        </div>

        {/* Title & Subtitle */}
        <div className="mt-5 text-center">
          <h1 className="font-serif-title text-2xl sm:text-[28px] font-bold tracking-wider text-[#142019]">
            SIMAPURA
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-semibold text-[#0D6B48]">
            Sistem Manajemen {profil.namaPura}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-[#58675D]">
            Masuk untuk mengelola dan melihat data pengempon
          </p>
        </div>

        {/* Logout Status Banner */}
        {justLoggedOut && !errorMsg && (
          <div className="mt-5 rounded-xl border border-[#BFE6D1] bg-[#DFF4E8] px-4 py-3 text-xs font-medium text-[#115E3F]">
            Anda telah keluar.
          </div>
        )}

        {errorMsg && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-800">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1F2D24]">
              Nama pengguna <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="pengurus atau pengempon"
              className="mt-1.5 w-full rounded-xl border border-[#DCE2DC] bg-white px-4 py-3 text-sm text-[#142019] placeholder:text-[#96A29A] focus:border-[#0D6B48] focus:outline-none focus:ring-2 focus:ring-[#0D6B48]/15"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2D24]">
              Kata sandi <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              className="mt-1.5 w-full rounded-xl border border-[#DCE2DC] bg-white px-4 py-3 text-sm text-[#142019] placeholder:text-[#96A29A] focus:border-[#0D6B48] focus:outline-none focus:ring-2 focus:ring-[#0D6B48]/15"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-[#0D6B48] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#095438] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D6B48] focus-visible:ring-offset-2"
          >
            Masuk
          </button>
        </form>

        {/* Quick 1-Tap Role Selection (Controlled by Pengurus Security Setting) */}
        {keamanan.allowDemoQuickLogin && (
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => loginWithMember(anggota[0], 'Pengurus')}
              className="rounded-xl border border-[#D1E4D8] bg-[#F2FAF5] px-3 py-2 text-xs font-semibold text-[#0D6B48] transition-colors hover:bg-[#E4F4EA]"
            >
              Masuk Pengurus
            </button>
            <button
              type="button"
              onClick={() => {
                const m =
                  anggota.find((a) => a.jabatan === 'Anggota Pengempon' && a.status === 'Aktif') ||
                  anggota[18];
                loginWithMember(m, 'Anggota');
              }}
              className="rounded-xl border border-[#E5DEC9] bg-[#FCF9EE] px-3 py-2 text-xs font-semibold text-[#8A5A12] transition-colors hover:bg-[#F7F0D8]"
            >
              Masuk Pengempon
            </button>
          </div>
        )}

        {/* Explanatory Footer + Single-File Copy/Download */}
        <div className="mt-6 border-t border-[#ECEFE9] pt-4 text-center">
          <p className="text-[11px] leading-relaxed text-[#59695E]">
            Akses pengurus dapat menambah dan mengubah data; akses pengempon hanya melihat data dan
            laporan.
          </p>
          <p className="mt-1.5 font-mono text-[11px] text-[#7A887E]">{defaultPassHint}</p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-[#F2F4EF] pt-3.5">
            <button
              type="button"
              disabled={bundleLoading}
              onClick={handleCopySingleHtml}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DDD6] bg-[#F8FAF8] px-3 py-1.5 text-[11px] font-medium text-[#0D6B48] hover:bg-[#EDF5EF] disabled:opacity-60"
            >
              {bundleCopied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {bundleCopied ? 'Tersalin!' : 'Salin Kode 1 File HTML'}
            </button>
            <button
              type="button"
              disabled={bundleLoading}
              onClick={handleDownloadSingleHtml}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DDD6] bg-white px-3 py-1.5 text-[11px] font-medium text-[#34443A] hover:bg-[#F4F6F4] disabled:opacity-60"
            >
              <Download className="h-3 w-3 text-[#0D6B48]" />
              Unduh .html
            </button>
          </div>
          {bundleStatus && (
            <p className="mt-2 text-[11px] font-medium text-[#0D6B48]">{bundleStatus}</p>
          )}
        </div>
      </div>
    </div>
  );
}
