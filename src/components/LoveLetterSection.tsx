import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, LockOpen, Mail } from 'lucide-react';
import { BirthdayConfig, NIGHT_FURY_ASSETS } from '../types/birthday';
import { compressImageFile, formatIndonesianDate } from '../utils/imageUtils';
import { musicBox } from '../utils/musicBox';

interface Props {
  config: BirthdayConfig;
  giftMode: boolean;
  onUpdateLetterPhoto: (dataUrl: string) => void;
  onLaunchPlasma: (x?: number, y?: number, count?: number) => void;
}

export function LoveLetterSection({
  config,
  giftMode,
  onUpdateLetterPhoto,
  onLaunchPlasma,
}: Props) {
  const [isOpened, setIsOpened] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isDarkSky = config.skyMood === 'aurora';

  const handleOpenLetter = () => {
    setIsOpened(true);
    musicBox.playChime(659.25);
    onLaunchPlasma(0.5, 0.4, 2);
  };

  const handleLetterPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const compressed = await compressImageFile(file, 1080, 0.84);
      onUpdateLetterPhoto(compressed);
    } catch {
      // Ignore invalid image silently
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const paragraphs = config.letterBody
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section
      id="surat"
      className="relative z-10 mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-24"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleLetterPhotoUpload}
        className="hidden"
        aria-label="Unggah foto untuk surat"
      />

      {/* Section Title */}
      <div className="max-w-xl">
        <p
          className={`text-xs font-medium tracking-wide ${
            isDarkSky ? 'text-sky-300' : 'text-sky-700'
          }`}
        >
          03. Surat dari Balik Awan
        </p>
        <h2
          className={`mt-2 font-display text-3xl font-semibold tracking-tight [text-wrap:balance] sm:text-4xl ${
            isDarkSky ? 'text-white' : 'text-[#082036]'
          }`}
        >
          Sepucuk Surat yang Dijaga Langsung oleh Toothless
        </h2>
      </div>

      {/* Letter Container with Upside-Down Hanging Toothless! */}
      <div className="relative mt-16 sm:mt-20">
        {/* Upside-down Smiling Toothless peeking down onto the letter */}
        <motion.div
          animate={{ rotate: [-1.5, 1.8, -1.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: 'top center' }}
          className="pointer-events-none absolute -top-24 right-4 z-20 w-44 sm:-top-32 sm:right-12 sm:w-64"
        >
          <img
            src={NIGHT_FURY_ASSETS.upsideDown}
            alt="Toothless bergelantungan terbalik sambil tersenyum mengintip surat"
            referrerPolicy="no-referrer"
            className="h-auto w-full select-none drop-shadow-[0_14px_20px_rgba(8,32,54,0.28)]"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {!isOpened ? (
            /* Sealed Tactile Envelope View */
            <motion.div
              key="sealed"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className={`relative overflow-hidden rounded-3xl border px-6 py-16 text-center sm:px-12 sm:py-20 ${
                isDarkSky
                  ? 'border-sky-400/25 bg-gradient-to-b from-[#0E243D] to-[#081729] text-white'
                  : 'border-sky-200 bg-gradient-to-b from-white to-[#EDF7FF] text-[#082036]'
              }`}
            >
              {/* Subtle geometric envelope flap lines */}
              <svg
                viewBox="0 0 800 180"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-x-0 top-0 h-32 w-full opacity-25"
                aria-hidden="true"
              >
                <path
                  d="M0 0 L400 155 L800 0"
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="1.5"
                />
              </svg>

              <div className="relative z-10 mx-auto max-w-lg pt-6">
                <p
                  className={`font-mono text-xs tabular-nums ${
                    isDarkSky ? 'text-sky-300' : 'text-sky-700'
                  }`}
                >
                  Untuk {config.recipientName} · {formatIndonesianDate(config.birthdayDate)}
                </p>
                <h3 className="mt-3 font-display text-2xl font-medium sm:text-3xl">
                  {config.letterHeading}
                </h3>
                <p
                  className={`mt-3 text-sm ${
                    isDarkSky ? 'text-sky-100/75' : 'text-slate-600'
                  }`}
                >
                  Segel biru ini hanya untukmu. Klik tombol di bawah untuk membuka surat ulang
                  tahunmu.
                </p>

                <button
                  type="button"
                  onClick={handleOpenLetter}
                  className="mt-8 inline-flex min-h-[48px] items-center gap-2.5 rounded-xl bg-[#0284C7] px-7 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#0369A1] cursor-pointer"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>Buka Segel Surat</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* Unfolded Editorial Letter View */
            <motion.div
              key="opened"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 gap-8 rounded-3xl border border-sky-200/90 bg-white p-6 text-[#0B1F33] shadow-sm sm:p-10 lg:grid-cols-12 lg:gap-12 lg:p-14"
            >
              {/* Left 7 cols: Full Letter Manuscript */}
              <div className="lg:col-span-7">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-sky-700">
                  <span>Untuk {config.recipientName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {formatIndonesianDate(config.birthdayDate)}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-2xl font-semibold leading-snug text-[#082036] sm:text-3xl">
                  {config.letterHeading}
                </h3>

                <div className="mt-6 space-y-4 text-[15px] leading-[1.8] text-slate-700 sm:text-base">
                  {paragraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                <div className="mt-10 border-t border-sky-100 pt-6">
                  <p className="text-sm text-slate-500">{config.letterClosing}</p>
                  <p className="mt-1 font-display text-2xl font-medium italic text-[#0284C7]">
                    {config.senderName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpened(false)}
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-700 cursor-pointer"
                >
                  <LockOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Lipat kembali surat</span>
                </button>
              </div>

              {/* Right 5 cols: Pinned Couple Polaroid Photo */}
              <div className="flex flex-col justify-center lg:col-span-5">
                <div className="rounded-2xl border border-sky-100 bg-[#F4FAFF] p-3.5 sm:p-4">
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#0C4A6E]">
                    {config.letterPhotoDataUrl ? (
                      <img
                        src={config.letterPhotoDataUrl}
                        alt={`Foto kenangan surat ${config.recipientName} dan ${config.senderName}`}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#0284C7] via-[#38BDF8] to-[#082F49] p-6 text-center text-white">
                        <p className="font-display text-xl font-medium">
                          Bingkai Surat Kita
                        </p>
                        <p className="mt-2 max-w-[210px] text-xs leading-relaxed text-sky-50/90">
                          Tempelkan foto polaroid spesial kalian berdua untuk mendampingi surat ini.
                        </p>
                        {!giftMode && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#0C4A6E] cursor-pointer"
                          >
                            <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{isUploading ? 'Menyimpan...' : 'Unggah Foto Surat'}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {!giftMode && config.letterPhotoDataUrl && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-[#082036]/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-[#082036] cursor-pointer"
                      >
                        <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Ganti Foto</span>
                      </button>
                    )}
                  </div>
                  <p className="mt-3 px-1 text-center font-display text-sm italic text-slate-600">
                    {config.letterPhotoCaption}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
