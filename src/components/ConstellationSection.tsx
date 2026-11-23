import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Sparkles, Star } from 'lucide-react';
import { BirthdayConfig, NIGHT_FURY_ASSETS } from '../types/birthday';
import { musicBox } from '../utils/musicBox';

interface Props {
  config: BirthdayConfig;
  onLaunchPlasma: (x?: number, y?: number, count?: number) => void;
}

const PENTATONIC_FREQS = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66];

export function ConstellationSection({ config, onLaunchPlasma }: Props) {
  const [litIds, setLitIds] = useState<string[]>([config.constellationStars[0]?.id ?? 'star-1']);
  const [selectedStarId, setSelectedStarId] = useState<string>(
    config.constellationStars[0]?.id ?? 'star-1'
  );

  const stars = config.constellationStars;
  const isComplete = stars.length > 0 && stars.every((s) => litIds.includes(s.id));
  const selectedStar = stars.find((s) => s.id === selectedStarId) ?? stars[0];

  const handleStarClick = (starId: string, index: number) => {
    setSelectedStarId(starId);
    musicBox.playChime(PENTATONIC_FREQS[index % PENTATONIC_FREQS.length]);

    if (!litIds.includes(starId)) {
      const nextLit = [...litIds, starId];
      setLitIds(nextLit);
      const completedNow = stars.every((s) => nextLit.includes(s.id));
      if (completedNow) {
        onLaunchPlasma(0.5, 0.35, 5);
      } else {
        onLaunchPlasma(undefined, undefined, 1);
      }
    }
  };

  const handleConnectAll = () => {
    const allIds = stars.map((s) => s.id);
    setLitIds(allIds);
    if (stars.length > 0) {
      setSelectedStarId(stars[stars.length - 1].id);
    }
    musicBox.playChime(1046.5);
    onLaunchPlasma(0.5, 0.35, 5);
  };

  const handleReset = () => {
    setLitIds(stars[0] ? [stars[0].id] : []);
    if (stars[0]) setSelectedStarId(stars[0].id);
  };

  // Determine lines between consecutive stars when both endpoints are illuminated
  const connections: Array<{ x1: number; y1: number; x2: number; y2: number; active: boolean }> = [];
  for (let i = 0; i < stars.length - 1; i++) {
    const a = stars[i];
    const b = stars[i + 1];
    connections.push({
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
      active: litIds.includes(a.id) && litIds.includes(b.id),
    });
  }
  // Close wing loop when complete
  if (stars.length >= 3) {
    connections.push({
      x1: stars[stars.length - 1].x,
      y1: stars[stars.length - 1].y,
      x2: stars[0].x,
      y2: stars[0].y,
      active: isComplete,
    });
  }

  return (
    <section
      id="konstelasi"
      className="relative z-10 mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="overflow-hidden rounded-3xl border border-sky-400/20 bg-gradient-to-br from-[#061325] via-[#0A1F3B] to-[#081529] text-white shadow-xl">
        {/* Header Bar Inside Obsidian Sky Frame */}
        <div className="flex flex-col justify-between gap-5 border-b border-sky-300/15 px-6 py-7 sm:px-10 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-wide text-sky-300">
              02. Peta Konstelasi Night Fury
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white [text-wrap:balance] sm:text-4xl">
              Nyalakan {stars.length} Bintang untuk Membuka Pesan Langit
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-sky-200/80 tabular-nums">
              {litIds.length} / {stars.length} Bintang Menyala
            </span>
            {!isComplete ? (
              <button
                type="button"
                onClick={handleConnectAll}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#0284C7] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0369A1] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sambungkan Semua</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-sky-300/25 bg-sky-950/60 px-4 py-2 text-xs font-medium text-sky-100 transition-colors hover:bg-sky-900/60 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Ulangi</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Constellation Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Interactive Starfield Canvas Area */}
          <div className="relative min-h-[380px] overflow-hidden border-b border-sky-300/15 p-4 sm:min-h-[450px] lg:col-span-7 lg:border-r lg:border-b-0">
            {/* Subtle background star speckles */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              {/* Soft Aurora Glow when complete */}
              <defs>
                <radialGradient id="auroraGlow" cx="50%" cy="48%" r="55%">
                  <stop
                    offset="0%"
                    stopColor={isComplete ? '#F472B6' : '#38BDF8'}
                    stopOpacity={isComplete ? '0.26' : '0.14'}
                  />
                  <stop
                    offset="55%"
                    stopColor="#0284C7"
                    stopOpacity={isComplete ? '0.15' : '0.06'}
                  />
                  <stop offset="100%" stopColor="#061325" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="100" height="100" fill="url(#auroraGlow)" />

              {/* Constellation guide lines */}
              {connections.map((line, i) => (
                <line
                  key={i}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={line.active ? '#7DD3FC' : 'rgba(125,211,252,0.16)'}
                  strokeWidth={line.active ? 0.55 : 0.25}
                  strokeDasharray={line.active ? undefined : '1.2 1.2'}
                  style={{ transition: 'stroke 0.4s ease, stroke-width 0.4s ease' }}
                />
              ))}
            </svg>

            {/* Bio-Luminescent Starlight Night Fury Silhouette / Awakening */}
            <motion.div
              animate={{
                opacity: isComplete ? 0.92 : 0.22,
                scale: isComplete ? 1.03 : 0.95,
              }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center p-6"
            >
              <img
                src={NIGHT_FURY_ASSETS.auroraWings}
                alt="Night Fury bercahaya aurora di tengah konstelasi"
                referrerPolicy="no-referrer"
                className="max-h-[340px] w-auto object-contain drop-shadow-[0_0_28px_rgba(244,114,182,0.38)] select-none"
              />
            </motion.div>

            {/* Interactive Star Nodes */}
            {stars.map((star, index) => {
              const isLit = litIds.includes(star.id);
              const isSelected = selectedStar?.id === star.id;
              return (
                <button
                  key={star.id}
                  type="button"
                  onClick={() => handleStarClick(star.id, index)}
                  style={{ left: `${star.x}%`, top: `${star.y}%` }}
                  aria-label={`Bintang ${star.label}: ${star.title}`}
                  className="group absolute z-20 -translate-x-1/2 -translate-y-1/2 p-2 focus-visible:outline-2 focus-visible:outline-sky-300 cursor-pointer"
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 ${
                      isSelected
                        ? 'scale-115 border-white bg-[#38BDF8] text-[#061325] shadow-[0_0_24px_rgba(56,189,248,0.85)]'
                        : isLit
                        ? 'border-sky-300 bg-sky-400/30 text-white shadow-[0_0_16px_rgba(56,189,248,0.55)] hover:scale-110'
                        : 'border-sky-300/35 bg-[#081A32]/90 text-sky-200/80 hover:scale-110 hover:border-sky-300'
                    }`}
                  >
                    <Star
                      className={`h-4 w-4 ${isLit ? 'fill-current' : ''}`}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-1 block text-center font-mono text-[10px] font-medium text-sky-100/90 tabular-nums">
                    {star.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Reading Pane: Active Star Reason + Secret Reveal */}
          <div className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-5">
            <div>
              {selectedStar && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedStar.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="font-mono text-xs text-sky-300 tabular-nums">
                      Bintang {selectedStar.label} dari 0{stars.length}
                    </p>
                    <h3 className="mt-3 font-display text-2xl font-medium text-white sm:text-3xl">
                      {selectedStar.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-sky-100/85 sm:text-base">
                      {selectedStar.message}
                    </p>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Quick Star Selector List */}
              <div className="mt-8 border-t border-sky-300/15 pt-5">
                <p className="text-xs text-sky-200/70">Pilih bintang untuk membaca:</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {stars.map((star, idx) => {
                    const isLit = litIds.includes(star.id);
                    const isSel = selectedStar?.id === star.id;
                    return (
                      <button
                        key={star.id}
                        type="button"
                        onClick={() => handleStarClick(star.id, idx)}
                        className={`rounded-lg px-3 py-1.5 font-mono text-xs tabular-nums transition-colors cursor-pointer ${
                          isSel
                            ? 'bg-sky-400 font-semibold text-[#061325]'
                            : isLit
                            ? 'bg-sky-400/20 text-sky-100 hover:bg-sky-400/30'
                            : 'bg-white/5 text-sky-200/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {star.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Secret Message Revealed When All Stars Are Lit */}
            <AnimatePresence>
              {isComplete ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mt-8 rounded-2xl border border-pink-300/30 bg-gradient-to-br from-sky-500/20 via-fuchsia-500/15 to-transparent p-5"
                >
                  <p className="text-xs font-semibold text-pink-200">
                    Konstelasi Lengkap · Pesan Rahasia Terbuka
                  </p>
                  <h4 className="mt-1.5 font-display text-lg font-medium text-white">
                    {config.secretConstellationTitle}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-sky-50/90">
                    {config.secretConstellationMessage}
                  </p>
                </motion.div>
              ) : (
                <div className="mt-8 border-t border-sky-300/15 pt-5 text-xs text-sky-200/65">
                  Ketuk setiap bintang pada peta langit di samping untuk menyalakan sayap Night Fury
                  dan membuka pesan rahasia di baliknya.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
