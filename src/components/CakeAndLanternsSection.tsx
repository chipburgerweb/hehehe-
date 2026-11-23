import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Mic, MicOff, RotateCcw, Send, Sparkles, Wind } from 'lucide-react';
import { BirthdayConfig, NIGHT_FURY_ASSETS, WishLantern } from '../types/birthday';
import { musicBox } from '../utils/musicBox';

interface Props {
  config: BirthdayConfig;
  onAddWishLantern: (wish: string) => void;
  onLaunchPlasma: (x?: number, y?: number, count?: number) => void;
}

const INITIAL_CANDLES = [true, true, true, true, true];

export function CakeAndLanternsSection({
  config,
  onAddWishLantern,
  onLaunchPlasma,
}: Props) {
  const [candlesLit, setCandlesLit] = useState<boolean[]>(INITIAL_CANDLES);
  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [wishText, setWishText] = useState('');
  const [justCelebrated, setJustCelebrated] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const isDarkSky = config.skyMood === 'aurora';
  const remainingCount = candlesLit.filter(Boolean).length;
  const allBlownOut = remainingCount === 0;

  const stopMic = () => {
    setMicActive(false);
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopMic();
    };
  }, []);

  const triggerBlowAll = () => {
    setCandlesLit([false, false, false, false, false]);
    setJustCelebrated(true);
    stopMic();
    musicBox.playChime(783.99);
    onLaunchPlasma(0.5, 0.3, 6);
  };

  const handleToggleCandle = (idx: number) => {
    if (!candlesLit[idx]) return;
    const next = candlesLit.map((lit, i) => (i === idx ? false : lit));
    setCandlesLit(next);
    musicBox.playChime(523.25 + idx * 55);
    if (next.every((c) => !c)) {
      setJustCelebrated(true);
      stopMic();
      onLaunchPlasma(0.5, 0.3, 6);
    }
  };

  const handleRelight = () => {
    setCandlesLit(INITIAL_CANDLES);
    setJustCelebrated(false);
  };

  const handleToggleMicBlow = async () => {
    if (micActive) {
      stopMic();
      return;
    }
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      setMicActive(true);

      let blowFrames = 0;
      const monitor = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;

        if (avg > 44) {
          blowFrames += 1;
          if (blowFrames >= 8) {
            triggerBlowAll();
            return;
          }
        } else {
          blowFrames = Math.max(0, blowFrames - 1);
        }
        rafRef.current = window.requestAnimationFrame(monitor);
      };
      rafRef.current = window.requestAnimationFrame(monitor);
    } catch {
      setMicError('Mikrofon tidak diizinkan. Kamu bisa langsung klik tombol Tiup Semua Lilin.');
      setMicActive(false);
    }
  };

  const handleReleaseLantern = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = wishText.trim();
    if (!trimmed) return;
    onAddWishLantern(trimmed);
    setWishText('');
    musicBox.playChime(880);
    onLaunchPlasma(0.5, 0.45, 2);
  };

  return (
    <section
      id="tiup-lilin"
      className="relative z-10 mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-24"
    >
      {/* Header */}
      <div className="max-w-xl">
        <p
          className={`text-xs font-medium tracking-wide ${
            isDarkSky ? 'text-sky-300' : 'text-sky-700'
          }`}
        >
          04. Tiup Lilin &amp; Lentera Harapan
        </p>
        <h2
          className={`mt-2 font-display text-3xl font-semibold tracking-tight [text-wrap:balance] sm:text-4xl ${
            isDarkSky ? 'text-white' : 'text-[#082036]'
          }`}
        >
          Ucapkan Harapanmu, Tiup Lilinnya, dan Lepaskan ke Langit
        </h2>
      </div>

      {/* 2-Column Interactive Stage: Cake & Toothless + Sky Wish Lanterns */}
      <div className="mt-10 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
        {/* Left: Interactive Night Fury Sky Birthday Cake */}
        <div
          className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 sm:p-8 lg:col-span-6 ${
            isDarkSky
              ? 'border-sky-400/20 bg-gradient-to-b from-[#0C2138] to-[#071425] text-white'
              : 'border-sky-200 bg-gradient-to-b from-white to-[#E6F4FF] text-[#082036]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`font-mono text-xs tabular-nums ${
                isDarkSky ? 'text-sky-300' : 'text-sky-700'
              }`}
            >
              {allBlownOut
                ? 'Semua lilin padam · Harapan terkirim'
                : `${remainingCount} dari 5 lilin menyala`}
            </span>
            {allBlownOut && (
              <button
                type="button"
                onClick={handleRelight}
                className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  isDarkSky
                    ? 'text-sky-300 hover:text-white'
                    : 'text-sky-700 hover:text-[#082036]'
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Nyalakan Lagi</span>
              </button>
            )}
          </div>

          {/* Cake + Full-Body Toothless Scene */}
          <div className="relative my-6 flex flex-col items-center justify-center py-4">
            {/* Full-Body Toothless Watching the Cake */}
            <motion.img
              src={NIGHT_FURY_ASSETS.fullBody}
              alt="Toothless menemani kue ulang tahun"
              referrerPolicy="no-referrer"
              animate={
                justCelebrated
                  ? { y: [0, -16, 0, -10, 0], rotate: [0, -2, 2, 0] }
                  : { y: [0, -4, 0] }
              }
              transition={
                justCelebrated
                  ? { duration: 1.1, ease: 'easeOut' }
                  : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
              }
              className="pointer-events-none mb-2 w-56 select-none drop-shadow-[0_14px_20px_rgba(8,32,54,0.28)] sm:w-64"
            />

            {/* Interactive 5 Candles Row */}
            <div className="relative z-10 flex items-end gap-5 sm:gap-7">
              {candlesLit.map((isLit, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleToggleCandle(idx)}
                  aria-label={isLit ? `Tiup lilin ${idx + 1}` : `Lilin ${idx + 1} sudah padam`}
                  className="group flex flex-col items-center focus-visible:outline-2 focus-visible:outline-sky-500 cursor-pointer"
                >
                  {/* Flame */}
                  <div className="relative mb-1 flex h-8 w-6 items-end justify-center">
                    <AnimatePresence>
                      {isLit ? (
                        <motion.div
                          key="flame"
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0, y: -12 }}
                          transition={{ duration: 0.25 }}
                          className="animate-flame relative flex items-center justify-center"
                        >
                          <span className="h-7 w-4 rounded-full bg-gradient-to-t from-amber-500 via-yellow-300 to-white shadow-[0_0_16px_rgba(251,191,36,0.9)]" />
                          <span className="absolute bottom-0.5 h-3 w-2 rounded-full bg-sky-300/90" />
                        </motion.div>
                      ) : (
                        <motion.span
                          key="smoke"
                          initial={{ opacity: 0.7, y: 0 }}
                          animate={{ opacity: 0, y: -16 }}
                          transition={{ duration: 0.8 }}
                          className="h-4 w-1 rounded-full bg-slate-300/70 blur-[1px]"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  {/* Candle Stick */}
                  <div
                    className={`h-11 w-3 rounded-t-sm transition-transform group-hover:-translate-y-0.5 ${
                      idx % 2 === 0
                        ? 'bg-gradient-to-b from-sky-300 to-sky-500'
                        : 'bg-gradient-to-b from-indigo-200 to-sky-400'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Hand-crafted Sky-Blue Tiered Cake */}
            <div className="relative -mt-0.5 flex w-full max-w-[290px] flex-col items-center">
              {/* Top Frosting Layer */}
              <div className="relative h-14 w-[82%] rounded-t-2xl bg-gradient-to-b from-[#E0F2FE] to-[#7DD3FC] shadow-inner">
                <div className="absolute inset-x-0 top-0 flex justify-around">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-4 w-6 rounded-b-full bg-white/90"
                    />
                  ))}
                </div>
                <div className="flex h-full items-end justify-center pb-2">
                  <span className="font-mono text-xs font-semibold tracking-wider text-[#0C4A6E] tabular-nums">
                    {config.turningAge} TAHUN
                  </span>
                </div>
              </div>
              {/* Bottom Obsidian-Sky Layer */}
              <div className="flex h-16 w-full items-center justify-center rounded-t-xl rounded-b-2xl bg-gradient-to-r from-[#082036] via-[#0C4A6E] to-[#082036] px-4 shadow-md">
                <span className="truncate font-display text-base font-medium tracking-wide text-sky-100">
                  Happy Birthday, {config.recipientName}
                </span>
              </div>
              {/* Cake Plate */}
              <div className="mt-1 h-2.5 w-[108%] rounded-full bg-sky-200/80" />
            </div>
          </div>

          {/* Cake Action Controls */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={triggerBlowAll}
                disabled={allBlownOut}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#0284C7] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0369A1] disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                <Wind className="h-4 w-4" aria-hidden="true" />
                <span>{allBlownOut ? 'Selamat Ulang Tahun!' : 'Tiup Semua Lilin'}</span>
              </button>

              {!allBlownOut && (
                <button
                  type="button"
                  onClick={handleToggleMicBlow}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    micActive
                      ? 'border-amber-400 bg-amber-50 text-amber-900'
                      : isDarkSky
                      ? 'border-sky-400/30 bg-sky-950/60 text-sky-100 hover:bg-sky-900/60'
                      : 'border-sky-200 bg-white text-sky-900 hover:bg-sky-50'
                  }`}
                >
                  {micActive ? (
                    <>
                      <MicOff className="h-4 w-4 text-amber-600" aria-hidden="true" />
                      <span>Tiup ke Mic...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 text-[#0284C7]" aria-hidden="true" />
                      <span>Pakai Mikrofon</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {micError && (
              <p className="text-xs text-amber-600">{micError}</p>
            )}

            {!allBlownOut && !micError && (
              <p
                className={`text-xs ${
                  isDarkSky ? 'text-sky-200/70' : 'text-slate-500'
                }`}
              >
                Ketuk nyala api satu per satu, klik Tiup Semua Lilin, atau tiup langsung ke mikrofon.
              </p>
            )}
          </div>
        </div>

        {/* Right: Floating Wish Lantern Sky & Release Composer */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-sky-400/20 bg-gradient-to-b from-[#07182E] via-[#0C2A4D] to-[#0E3A66] p-6 text-white sm:p-8 lg:col-span-6">
          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-sky-300">Langit Lentera Harapan</p>
                <h3 className="mt-1 font-display text-2xl font-medium text-white">
                  Lepaskan Doa &amp; Harapanmu
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onLaunchPlasma(0.7, 0.35, 3)}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-sky-300/25 bg-sky-950/50 px-3.5 py-2 text-xs font-medium text-sky-100 transition-colors hover:bg-sky-900/60 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
                <span>Plasma Biru</span>
              </button>
            </div>

            {/* Floating Lanterns Sky Viewport */}
            <div className="relative mt-6 min-h-[260px] space-y-3 overflow-y-auto pr-1 sm:max-h-[300px]">
              <AnimatePresence initial={false}>
                {config.wishLanterns.map((lantern: WishLantern, index: number) => (
                  <motion.div
                    key={lantern.id}
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, delay: index === 0 ? 0 : 0.04 }}
                    className="flex items-start gap-3.5 rounded-2xl border border-amber-200/20 bg-gradient-to-r from-amber-300/12 via-sky-400/10 to-transparent p-4"
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-300/20 text-amber-200 shadow-[0_0_16px_rgba(252,211,77,0.35)]">
                      <Flame className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed text-sky-50">{lantern.wish}</p>
                      <p className="mt-1 font-mono text-[11px] text-sky-200/65">
                        {lantern.createdAt}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Cute Sitting Toothless + Wish Input Form */}
          <div className="relative mt-6 border-t border-sky-300/15 pt-5">
            <img
              src={NIGHT_FURY_ASSETS.sittingCute}
              alt="Toothless duduk manis menunggu harapan ulang tahun"
              referrerPolicy="no-referrer"
              className="pointer-events-none absolute -top-24 right-0 hidden w-28 select-none drop-shadow-xl sm:block"
            />
            <form onSubmit={handleReleaseLantern} className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="wish-lantern-input" className="sr-only">
                Tulis harapan ulang tahunmu
              </label>
              <input
                id="wish-lantern-input"
                type="text"
                value={wishText}
                onChange={(e) => setWishText(e.target.value)}
                placeholder={`Tulis harapan ulang tahun ke-${config.turningAge} di sini...`}
                maxLength={180}
                className="min-h-[46px] flex-1 rounded-xl border border-sky-300/25 bg-[#061325]/70 px-4 py-2.5 text-sm text-white placeholder:text-sky-200/50 focus:border-sky-300 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!wishText.trim()}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#38BDF8] px-5 py-2.5 text-sm font-semibold text-[#061325] transition-colors hover:bg-[#7DD3FC] disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>Terbangkan</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
