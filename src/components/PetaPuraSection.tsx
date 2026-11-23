import React, { useState } from 'react';
import {
  Check,
  Compass,
  Copy,
  ExternalLink,
  MapPin,
  Navigation,
  Settings,
} from 'lucide-react';
import { PuraProfil } from '../types/pura';

interface PetaPuraSectionProps {
  profil: PuraProfil;
  canManage: boolean;
  onEditLocation?: () => void;
}

type ZonaMandala = 'utama' | 'madya' | 'nista';

const ZONA_INFO: Record<
  ZonaMandala,
  { title: string; subtitle: string; detail: string; fasilitas: string[] }
> = {
  utama: {
    title: 'Utama Mandala (Jeroan Pura)',
    subtitle: 'Zona Suci Persembahyangan Utama',
    detail:
      'Area paling suci untuk persembahyangan bersama, pemujaan Ida Sang Hyang Widhi Wasa, serta penempatan banten upacara pada hari piodalan.',
    fasilitas: ['Padmasana Utama', 'Pelinggih Taksu & Penglurah', 'Bale Piyasan & Meja Banten'],
  },
  madya: {
    title: 'Madya Mandala (Jaba Tengah)',
    subtitle: 'Zona Persiapan Upakara & Wantilan',
    detail:
      'Tempat berkumpul pengempon, persiapan canang/mejejaitan H-1 piodalan, tempat tabuh baleganjur, serta ruang koordinasi pengurus.',
    fasilitas: ['Candi Bentar & Apit Lawang', 'Wantilan Ngayah Pengempon', 'Sekretariat & Ruang Sound'],
  },
  nista: {
    title: 'Nista Mandala (Jaba Sisi)',
    subtitle: 'Zona Akses, Gudang Perlengkapan & Parkir',
    detail:
      'Akses masuk dari pelataran BDK Denpasar, lokasi penyimpanan tenda/kursi lipat dan alat ngayah, serta area parkir tertib pengempon.',
    fasilitas: ['Gedong Inventaris Perlengkapan', 'Taman & Keran Air Suci', 'Area Parkir Pengempon'],
  },
};

export function PetaPuraSection({ profil, canManage, onEditLocation }: PetaPuraSectionProps) {
  const [mapMode, setMapMode] = useState<'gmaps' | 'denah' | 'osm'>('gmaps');
  const [selectedZona, setSelectedZona] = useState<ZonaMandala>('utama');
  const [copied, setCopied] = useState(false);

  const gmapsQuery = encodeURIComponent(
    profil.googleMapsQuery ||
      'Balai Diklat Keagamaan Denpasar, Jl. Raya Mengwi, Km. 14 Beringkit, Mengwitani, Mengwi, Badung, Bali'
  );
  const gmapsEmbedUrl = `https://maps.google.com/maps?q=${gmapsQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  const gmapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${gmapsQuery}`;
  const gmapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${gmapsQuery}`;

  const delta = 0.0045;
  const bbox = `${(profil.osmLng - delta).toFixed(4)},${(profil.osmLat - delta).toFixed(4)},${(
    profil.osmLng + delta
  ).toFixed(4)},${(profil.osmLat + delta).toFixed(4)}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${profil.osmLat}%2C${profil.osmLng}`;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(profil.alamatLengkap);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback ignored safely
    }
  };

  const activeZona = ZONA_INFO[selectedZona];

  return (
    <section className="rounded-2xl border border-[#E2DCC8] bg-white shadow-2xs overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[#EFECE2] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#0D6B48]">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-[#142019]">
              Google Map & Denah Lokasi {profil.namaPura}
            </h2>
            <p className="text-xs text-[#59695E]">{profil.alamatSingkat}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-[#F1EFE4] p-1">
            <button
              type="button"
              onClick={() => setMapMode('gmaps')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                mapMode === 'gmaps'
                  ? 'bg-white text-[#0D6B48] shadow-xs font-semibold'
                  : 'text-[#525E56]'
              }`}
            >
              Google Maps BDK
            </button>
            <button
              type="button"
              onClick={() => setMapMode('denah')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                mapMode === 'denah'
                  ? 'bg-white text-[#0D6B48] shadow-xs font-semibold'
                  : 'text-[#525E56]'
              }`}
            >
              Denah Kompleks
            </button>
            <button
              type="button"
              onClick={() => setMapMode('osm')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                mapMode === 'osm'
                  ? 'bg-white text-[#0D6B48] shadow-xs font-semibold'
                  : 'text-[#525E56]'
              }`}
            >
              Peta Jalan
            </button>
          </div>

          {canManage && onEditLocation && (
            <button
              type="button"
              onClick={onEditLocation}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFD7BF] bg-[#FCF9F0] px-3 py-1.5 text-xs font-medium text-[#142019] hover:bg-[#F5EED8] whitespace-nowrap"
            >
              <Settings className="h-3.5 w-3.5 text-[#0D6B48]" />
              Edit Lokasi
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Map Canvas */}
        <div className="lg:col-span-7 border-b border-[#EFECE2] lg:border-b-0 lg:border-r bg-[#F8FAF7]">
          {mapMode === 'gmaps' && (
            <div className="relative h-[320px] sm:h-[360px] w-full">
              <iframe
                title={`Google Maps ${profil.namaPura}`}
                src={gmapsEmbedUrl}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl border border-[#E2DCC8] bg-white/95 px-3 py-2 text-[11px] shadow-sm">
                <p className="font-semibold text-[#0D6B48]">{profil.namaPura}</p>
                <p className="text-[#526358] max-w-[230px] truncate">{profil.alamatSingkat}</p>
              </div>
            </div>
          )}

          {mapMode === 'osm' && (
            <div className="relative h-[320px] sm:h-[360px] w-full">
              <iframe
                title={`Peta Jalan ${profil.namaPura}`}
                src={osmEmbedUrl}
                className="h-full w-full border-0"
                loading="lazy"
              />
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl border border-[#E2DCC8] bg-white/95 px-3 py-2 text-[11px] shadow-sm">
                <p className="font-semibold text-[#0D6B48]">{profil.namaPura}</p>
                <p className="font-mono text-[#526358] tabular-nums">
                  {profil.osmLat.toFixed(4)}, {profil.osmLng.toFixed(4)}
                </p>
              </div>
            </div>
          )}

          {mapMode === 'denah' && (
            <div className="p-5 sm:p-6">
              <div className="mb-3 flex items-center justify-between text-xs text-[#59695E]">
                <span className="inline-flex items-center gap-1.5 font-medium text-[#0D6B48]">
                  <Compass className="h-3.5 w-3.5" />
                  Klik area mandala untuk melihat rincian fasilitas pura
                </span>
                <span className="font-mono text-[11px]">Utara ↑</span>
              </div>

              <svg
                viewBox="0 0 640 340"
                className="w-full h-auto rounded-xl border border-[#DCE5DF] bg-[#FCF9F0]"
                role="img"
                aria-label="Denah Kawasan Tri Mandala Pura BDK Denpasar"
              >
                <g onClick={() => setSelectedZona('utama')} className="cursor-pointer">
                  <rect
                    x="20"
                    y="18"
                    width="600"
                    height="98"
                    rx="12"
                    fill={selectedZona === 'utama' ? '#DCFCE7' : '#F2F7F4'}
                    stroke={selectedZona === 'utama' ? '#0D6B48' : '#C3D6CA'}
                    strokeWidth={selectedZona === 'utama' ? '2.5' : '1.5'}
                  />
                  <text x="36" y="42" fill="#0D6B48" fontSize="13" fontWeight="700">
                    UTAMA MANDALA (Jeroan)
                  </text>
                  <rect x="245" y="48" width="150" height="48" rx="8" fill="#0D6B48" />
                  <text
                    x="320"
                    y="70"
                    textAnchor="middle"
                    fill="#FDE68A"
                    fontSize="12"
                    fontWeight="700"
                  >
                    PADMASANA
                  </text>
                  <text x="320" y="86" textAnchor="middle" fill="#FFFFFF" fontSize="10">
                    Pelinggih Utama
                  </text>
                  <rect x="440" y="54" width="150" height="40" rx="6" fill="#FFFFFF" stroke="#0D6B48" />
                  <text x="515" y="78" textAnchor="middle" fill="#142019" fontSize="11" fontWeight="600">
                    Bale Piyasan
                  </text>
                </g>

                <g onClick={() => setSelectedZona('madya')} className="cursor-pointer">
                  <rect
                    x="20"
                    y="128"
                    width="600"
                    height="94"
                    rx="12"
                    fill={selectedZona === 'madya' ? '#FEF3C7' : '#FAF6EA'}
                    stroke={selectedZona === 'madya' ? '#D97706' : '#E2D8BC'}
                    strokeWidth={selectedZona === 'madya' ? '2.5' : '1.5'}
                  />
                  <text x="36" y="152" fill="#92400E" fontSize="13" fontWeight="700">
                    MADYA MANDALA (Jaba Tengah)
                  </text>
                  <rect x="44" y="164" width="180" height="42" rx="6" fill="#FFFFFF" stroke="#D97706" />
                  <text x="134" y="189" textAnchor="middle" fill="#142019" fontSize="11" fontWeight="600">
                    Wantilan & Ngayah Banten
                  </text>
                  <rect x="276" y="132" width="88" height="22" rx="4" fill="#B45309" />
                  <text x="320" y="147" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="600">
                    Candi Bentar
                  </text>
                  <rect x="420" y="164" width="170" height="42" rx="6" fill="#FFFFFF" stroke="#D97706" />
                  <text x="505" y="189" textAnchor="middle" fill="#142019" fontSize="11" fontWeight="600">
                    Sekretariat & Sound
                  </text>
                </g>

                <g onClick={() => setSelectedZona('nista')} className="cursor-pointer">
                  <rect
                    x="20"
                    y="234"
                    width="600"
                    height="88"
                    rx="12"
                    fill={selectedZona === 'nista' ? '#E0F2FE' : '#F4F7F9'}
                    stroke={selectedZona === 'nista' ? '#0369A1' : '#C8D8E4'}
                    strokeWidth={selectedZona === 'nista' ? '2.5' : '1.5'}
                  />
                  <text x="36" y="258" fill="#0369A1" fontSize="13" fontWeight="700">
                    NISTA MANDALA (Pelataran & Akses BDK)
                  </text>
                  <rect x="44" y="268" width="190" height="38" rx="6" fill="#FFFFFF" stroke="#0369A1" />
                  <text x="139" y="291" textAnchor="middle" fill="#142019" fontSize="11" fontWeight="600">
                    Gedong Perlengkapan & Tenda
                  </text>
                  <rect x="260" y="268" width="190" height="38" rx="6" fill="#FFFFFF" stroke="#0369A1" />
                  <text x="355" y="291" textAnchor="middle" fill="#142019" fontSize="11" fontWeight="600">
                    Area Parkir Pengempon
                  </text>
                  <rect x="470" y="268" width="120" height="38" rx="6" fill="#0369A1" />
                  <text x="530" y="291" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="600">
                    Jl. Raya Mengwi Km. 14
                  </text>
                </g>
              </svg>
            </div>
          )}
        </div>

        {/* Location Details & Action Links */}
        <div className="flex flex-col justify-between p-6 lg:col-span-5 space-y-5">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#0D6B48]">
                ALAMAT & AKSES LOKASI
              </p>
              <p className="mt-1.5 text-xs leading-relaxed font-medium text-[#142019]">
                {profil.alamatLengkap}
              </p>
            </div>

            <div className="rounded-xl border border-[#EFECE2] bg-[#FCF9F0] p-3.5 text-xs">
              <p className="font-semibold text-[#142019]">
                {mapMode === 'denah' ? activeZona.title : 'Petunjuk Akses Kawasan BDK Denpasar'}
              </p>
              <p className="mt-1 leading-relaxed text-[#526358]">
                {mapMode === 'denah' ? activeZona.detail : profil.catatanAksesPeta}
              </p>
              {mapMode === 'denah' && (
                <ul className="mt-2 space-y-1 text-[11px] text-[#0D6B48] font-medium">
                  {activeZona.fasilitas.map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-[11px] font-medium text-[#7C5B19]">
                Jam Tangkil: {profil.jamOperasional}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-[#EFECE2] pt-4">
            <button
              type="button"
              onClick={handleCopyAddress}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4DDD6] bg-white px-3 py-2 text-xs font-medium text-[#142019] hover:bg-[#F5F7F5]"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#0D6B48]" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#59695E]" />
                  Salin Alamat
                </>
              )}
            </button>
            <a
              href={gmapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0D6B48] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#095438]"
            >
              <Navigation className="h-3.5 w-3.5" />
              Rute Google Maps
            </a>
            <a
              href={gmapsExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFD7BF] bg-[#FCF9F0] px-3 py-2 text-xs font-medium text-[#142019] hover:bg-[#F5EED8]"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#D97706]" />
              Buka Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
