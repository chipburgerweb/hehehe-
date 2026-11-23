import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Heart, Music, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { BirthdayConfig, NIGHT_FURY_ASSETS } from '../types/birthday';
import { compressImageFile, formatIndonesianDate } from '../utils/imageUtils';
import { musicBox } from '../utils/musicBox';

interface Props {
  config: BirthdayConfig;
  giftMode: boolean;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  onLaunchPlasma: (x?: number, y?: number, count?: number) => void;
  onUpdateHeroPhoto: (dataUrl: string) => void;
  onOpenCustomizer: (tab?: 'identity' | 'photos' | 'letter' | 'constellation' | 'share') => void;
}

export function HeroSkyStage({
  config,
  giftMode,
  isMusicPlaying,
  onToggleMusic,
  onLaunchPlasma,
  onUpdateHeroPhoto,
  onOpenCustomizer,
}: Props) {
  const [petCount, setPetCount] = useState(0);
  const [activeQuote, setActiveQuote] = useState<string | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const quoteTimerRef = useRef<number | null>(null);

  const formattedBirthday = formatIndonesianDate(config.birthdayDate);
  const isDarkSky = config.skyMood === 'aurora';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: relX * 16, y: relY * 12 });
  };

  const handleMouseLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

  const handlePetToothless = (e: React.MouseEvent) => {
    const quotes =
      config.toothlessQuotes.length > 0
        ? config.toothlessQuotes
        : ['Selamat ulang tahun! Toothless ikut bahagia hari ini!'];
    const nextQuote = quotes[petCount % quotes.length];
    setPetCount((c) => c + 1);
    setActiveQuote(nextQuote);
    musicBox.playChime(587.33 + (petCount % 4) * 65);
    onLaunchPlasma(e.clientX / window.innerWidth, e.clientY / window.innerHeight, 1);

    if (quoteTimerRef.current) window.clearTimeout(quoteTimerRef.current);
    quoteTimerRef.current = window.setTimeout(() => {
      setActiveQuote(null);
    }, 4200);
  };

  const handleHeroFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const compressed = await compressImageFile(file, 1200, 0.85);
      onUpdateHeroPhoto(compressed);
      onLaunchPlasma(0.65, 0.35, 2);
    } catch {
      // Ignore invalid image silently
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleStartCelebration = () => {
    onLaunchPlasma(undefined, undefined, 4);
    if (!isMusicPlaying) {
      onToggleMusic();
    }
    const target = document.getElementById('kenangan');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative z-10 mx-auto max-w-[1200px] px-5 pt-10 pb-14 sm:px-8 lg:pt-16 lg:pb-20">
      {/* Split-Screen Editorial Hero */}
      <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Editorial Typography & Dominant CTA */}
        <div className="flex flex-col justify-between lg:col-span-6">
          <div>
            {/* Clean Unboxed Metadata */}
            <div
              className={`flex flex-wrap items-center gap-2 text-xs font-medium tracking-wide ${
                isDarkSky ? 'text-sky-300/90' : 'text-sky-800/80'
              }`}
            >
              <span>Ulang Tahun ke-{config.turningAge}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{formattedBirthday}</span>
              <span aria-hidden="true">·</span>
              <span>Dari {config.senderName}</span>
            </div>

            {/* Display Headline */}
            <h1
              className={`mt-5 font-display text-[clamp(2.5rem,4.5vw,4rem)] leading-[1.06] font-semibold tracking-tight [text-wrap:balance] ${
                isDarkSky ? 'text-white' : 'text-[#082036]'
              }`}
            >
              {config.heroTitle}
            </h1>

            {/* Subtitle */}
            <p
              className={`mt-6 max-w-xl text-base leading-relaxed sm:text-[17px] ${
                isDarkSky ? 'text-sky-100/80' : 'text-slate-600'
              }`}
            >
              {config.heroSubtitle}
            </p>

            {/* Primary & Secondary Actions */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleStartCelebration}
                className="inline-flex min-h-[46px] items-center gap-2.5 rounded-xl bg-[#0284C7] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#0369A1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284C7] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>Buka Kejutan</span>
              </button>

              <button
                type="button"
                onClick={onToggleMusic}
                className={`inline-flex min-h-[46px] items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isDarkSky
                    ? 'border-sky-400/30 bg-sky-950/50 text-sky-100 hover:bg-sky-900/60'
                    : 'border-sky-200 bg-white/80 text-sky-900 hover:bg-sky-50'
                }`}
              >
                {isMusicPlaying ? (
                  <>
                    <Volume2 className="h-4 w-4 text-[#0284C7]" aria-hidden="true" />
                    <span>Matikan Musik</span>
                  </>
                ) : (
                  <>
                    <Music className="h-4 w-4 text-[#0284C7]" aria-hidden="true" />
                    <span>Putar Kotak Musik</span>
                  </>
                )}
              </button>

              {!giftMode && (
                <button
                  type="button"
                  onClick={() => onOpenCustomizer('photos')}
                  className={`inline-flex min-h-[46px] items-center gap-2 px-3 py-2 text-sm font-medium underline-offset-4 hover:underline whitespace-nowrap shrink-0 cursor-pointer ${
                    isDarkSky ? 'text-sky-300' : 'text-sky-700'
                  }`}
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  <span>Ganti Foto & Teks</span>
                </button>
              )}
            </div>
          </div>

          {/* Subtle Interactive Hint at Bottom of Left Column */}
          <div
            className={`mt-10 border-t pt-5 text-xs leading-relaxed ${
              isDarkSky
                ? 'border-sky-300/15 text-sky-200/70'
                : 'border-sky-900/10 text-slate-500'
            }`}
          >
            Sentuh Toothless di sebelah kanan untuk mengelusnya dan melihat pesan kecil dari langit,
            atau klik di mana saja untuk meluncurkan percikan plasma biru.
          </div>
        </div>

        {/* Right Column: Interactive Sky Window + Couple Photo + Perched Night Fury */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative flex flex-col justify-center lg:col-span-6"
        >
          <div
            className={`relative min-h-[400px] w-full overflow-visible rounded-2xl border p-4 sm:p-5 lg:h-full ${
              isDarkSky
                ? 'border-sky-400/20 bg-gradient-to-br from-[#0B2239] via-[#0F2F52] to-[#071426]'
                : 'border-sky-200/90 bg-gradient-to-br from-[#D8EEFF] via-[#EFF8FF] to-[#BAE6FD]/60'
            }`}
          >
            {/* Couple Main Hero Photo Frame */}
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl bg-[#0B1F33] sm:h-[380px] lg:h-[420px]">
              {config.heroPhotoDataUrl ? (
                <img
                  src={config.heroPhotoDataUrl}
                  alt={`Foto bersama ${config.recipientName} dan ${config.senderName}`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out"
                  style={{
                    transform: `scale(1.03) translate(${parallax.x * -0.35}px, ${parallax.y * -0.35}px)`,
                  }}
                />
              ) : (
                /* Curated Artistic Sky Placeholder until user uploads their photo */
                <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-[#0EA5E9] via-[#38BDF8] to-[#0C4A6E] p-6 text-center text-white">
                  <svg
                    viewBox="0 0 400 220"
                    className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
                    aria-hidden="true"
                  >
                    <circle cx="320" cy="54" r="32" fill="#FEF9C3" />
                    <path
                      d="M0 165 Q 70 120 150 155 T 310 148 T 400 160 L 400 220 L 0 220 Z"
                      fill="#FFFFFF"
                    />
                    <path
                      d="M0 190 Q 95 155 190 182 T 400 175 L 400 220 L 0 220 Z"
                      fill="#E0F2FE"
                    />
                  </svg>
                  <div className="relative z-10 max-w-xs">
                    <p className="font-display text-2xl font-medium tracking-tight text-white">
                      {config.recipientName} &amp; {config.senderName}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-sky-50/90">
                      Pasang foto favorit kalian berdua di sini agar tampil megah bersama Toothless.
                    </p>
                    {!giftMode && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#0C4A6E] shadow-sm transition-transform hover:scale-[1.02] cursor-pointer"
                      >
                        <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{isUploading ? 'Memproses...' : 'Unggah Foto Kita'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Subtle bottom scrim for caption legibility */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-4 pt-12 pb-3.5">
                <p className="max-w-[70%] text-xs font-medium text-white/95">
                  {config.heroPhotoCaption}
                </p>
              </div>

              {/* Quick photo swap button in Edit Mode */}
              {!giftMode && config.heroPhotoDataUrl && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-[#082036]/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-[#082036] cursor-pointer"
                >
                  <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Ganti Foto</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleHeroFileChange}
                className="hidden"
                aria-label="Unggah foto utama"
              />
            </div>

            {/* Interactive Blue-Lit Toothless Perched on the Frame */}
            <motion.button
              type="button"
              onClick={handlePetToothless}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.94, rotate: -3 }}
              style={{
                x: parallax.x * 0.7,
                y: parallax.y * 0.5,
              }}
              aria-label="Elus Toothless untuk pesan kejutan"
              className="group absolute -right-3 -bottom-8 z-20 w-44 sm:-right-6 sm:-bottom-10 sm:w-56 lg:w-64 focus-visible:outline-2 focus-visible:outline-sky-500 cursor-pointer"
            >
              <img
                src={NIGHT_FURY_ASSETS.blueCrouch}
                alt="Toothless Night Fury menemani bingkai foto"
                referrerPolicy="no-referrer"
                className="h-auto w-full drop-shadow-[0_18px_22px_rgba(8,32,54,0.38)] select-none"
              />
              <span className="sr-only">Elus Toothless</span>
            </motion.button>

            {/* Speech Bubble when Toothless is petted */}
            <AnimatePresence>
              {activeQuote && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.22 }}
                  className="absolute right-3 bottom-32 z-30 max-w-[260px] rounded-xl border border-sky-200 bg-white/95 px-4 py-3 text-left text-xs leading-relaxed text-[#0B1F33] shadow-lg sm:right-6 sm:bottom-40"
                >
                  <div className="flex items-start gap-2">
                    <Heart
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-[#0284C7] text-[#0284C7]"
                      aria-hidden="true"
                    />
                    <p className="font-medium">{activeQuote}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Full-Width 4-Column Milestone Strip Below Hero Split */}
      <div
        className={`mt-14 grid grid-cols-2 gap-6 border-t pt-8 sm:grid-cols-4 lg:mt-16 ${
          isDarkSky ? 'border-sky-300/15' : 'border-sky-900/10'
        }`}
      >
        <div>
          <p
            className={`font-mono text-2xl font-medium tabular-nums sm:text-3xl ${
              isDarkSky ? 'text-sky-300' : 'text-[#0284C7]'
            }`}
          >
            {config.turningAge} Tahun
          </p>
          <p
            className={`mt-1 text-xs font-medium ${
              isDarkSky ? 'text-sky-100/75' : 'text-slate-600'
            }`}
          >
            Babak Baru untuk {config.recipientName}
          </p>
        </div>

        <div>
          <p
            className={`font-mono text-2xl font-medium tabular-nums sm:text-3xl ${
              isDarkSky ? 'text-sky-300' : 'text-[#0284C7]'
            }`}
          >
            {config.memories.length} Momen
          </p>
          <p
            className={`mt-1 text-xs font-medium ${
              isDarkSky ? 'text-sky-100/75' : 'text-slate-600'
            }`}
          >
            Tersimpan di Galeri Awan
          </p>
        </div>

        <div>
          <p
            className={`font-mono text-2xl font-medium tabular-nums sm:text-3xl ${
              isDarkSky ? 'text-sky-300' : 'text-[#0284C7]'
            }`}
          >
            {config.constellationStars.length} Bintang
          </p>
          <p
            className={`mt-1 text-xs font-medium ${
              isDarkSky ? 'text-sky-100/75' : 'text-slate-600'
            }`}
          >
            Konstelasi Alasan Sayang
          </p>
        </div>

        <div>
          <p
            className={`font-mono text-2xl font-medium tabular-nums sm:text-3xl ${
              isDarkSky ? 'text-sky-300' : 'text-[#0284C7]'
            }`}
          >
            {config.wishLanterns.length} Lentera
          </p>
          <p
            className={`mt-1 text-xs font-medium ${
              isDarkSky ? 'text-sky-100/75' : 'text-slate-600'
            }`}
          >
            Harapan Terbang di Langit
          </p>
        </div>
      </div>

      {/* Subtle Editorial Marquee Divider */}
      <div
        aria-hidden="true"
        className={`mt-12 overflow-hidden border-y py-3 ${
          isDarkSky ? 'border-sky-300/15 text-sky-300/60' : 'border-sky-900/10 text-sky-800/55'
        }`}
      >
        <div className="animate-marquee flex w-max gap-8 text-xs font-medium tracking-wider whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, idx) => (
            <span key={idx} className="inline-flex items-center gap-8">
              <span>Selamat Ulang Tahun {config.recipientName}</span>
              <span>·</span>
              <span>Langit Biru &amp; Night Fury</span>
              <span>·</span>
              <span>Kenangan Kita Berdua</span>
              <span>·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
