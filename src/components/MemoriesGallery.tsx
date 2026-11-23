import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, ChevronLeft, ChevronRight, ImagePlus, X } from 'lucide-react';
import {
  BirthdayConfig,
  MemoryCategory,
  MemoryItem,
  NIGHT_FURY_ASSETS,
} from '../types/birthday';
import { compressImageFile } from '../utils/imageUtils';

interface Props {
  config: BirthdayConfig;
  giftMode: boolean;
  onUpdateMemoryPhoto: (memoryId: string, dataUrl: string) => void;
  onOpenPhotoStudio: () => void;
}

const CATEGORIES: Array<'Semua' | MemoryCategory> = [
  'Semua',
  'Momen Favorit',
  'Petualangan',
  'Lucu',
];

const SKY_GRADIENTS = [
  'from-[#0284C7] via-[#38BDF8] to-[#0C4A6E]',
  'from-[#0369A1] via-[#0EA5E9] to-[#1E3A8A]',
  'from-[#0C4A6E] via-[#0284C7] to-[#38BDF8]',
  'from-[#1D4ED8] via-[#38BDF8] to-[#0F172A]',
  'from-[#0EA5E9] via-[#7DD3FC] to-[#0369A1]',
];

export function MemoriesGallery({
  config,
  giftMode,
  onUpdateMemoryPhoto,
  onOpenPhotoStudio,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | MemoryCategory>('Semua');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const quickFileInputRef = useRef<HTMLInputElement | null>(null);
  const activeUploadTargetRef = useRef<string | null>(null);

  const isDarkSky = config.skyMood === 'aurora';

  const filteredMemories =
    selectedCategory === 'Semua'
      ? config.memories
      : config.memories.filter((m) => m.category === selectedCategory);

  const activeMemory: MemoryItem | null =
    lightboxIndex !== null && filteredMemories[lightboxIndex]
      ? filteredMemories[lightboxIndex]
      : null;

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % filteredMemories.length
        );
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + filteredMemories.length) % filteredMemories.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, filteredMemories.length]);

  const triggerQuickUpload = (memoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    activeUploadTargetRef.current = memoryId;
    quickFileInputRef.current?.click();
  };

  const handleQuickFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = activeUploadTargetRef.current;
    if (!file || !targetId) return;
    setUploadingId(targetId);
    try {
      const compressed = await compressImageFile(file, 1080, 0.82);
      onUpdateMemoryPhoto(targetId, compressed);
    } catch {
      // Ignore upload error silently
    } finally {
      setUploadingId(null);
      e.target.value = '';
    }
  };

  return (
    <section
      id="kenangan"
      className="relative z-10 mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-24"
    >
      {/* Hidden input for quick per-card photo upload */}
      <input
        ref={quickFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleQuickFileSelected}
        className="hidden"
        aria-label="Unggah foto kenangan"
      />

      {/* Section Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-xl">
          <p
            className={`text-xs font-medium tracking-wide ${
              isDarkSky ? 'text-sky-300' : 'text-sky-700'
            }`}
          >
            01. Galeri Awan &amp; Kenangan Kita
          </p>
          <h2
            className={`mt-2 font-display text-3xl font-semibold tracking-tight [text-wrap:balance] sm:text-4xl ${
              isDarkSky ? 'text-white' : 'text-[#082036]'
            }`}
          >
            Setiap Bingkai yang Membuat Langit Terasa Lebih Dekat
          </h2>
        </div>

        {/* Interactive Filter Tabs + Add Photo CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="tablist"
            aria-label="Filter kategori kenangan"
            className={`inline-flex items-center gap-1 rounded-xl p-1 ${
              isDarkSky ? 'bg-sky-950/80' : 'bg-sky-100/90'
            }`}
          >
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => {
                    setSelectedCategory(category);
                    setLightboxIndex(null);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? isDarkSky
                        ? 'bg-[#0284C7] text-white shadow-sm'
                        : 'bg-white text-[#082036] shadow-sm'
                      : isDarkSky
                      ? 'text-sky-200/80 hover:text-white'
                      : 'text-sky-900/70 hover:text-[#082036]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {!giftMode && (
            <button
              type="button"
              onClick={onOpenPhotoStudio}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-sky-300 bg-white px-3.5 py-2 text-xs font-semibold text-[#0C4A6E] transition-colors hover:bg-sky-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Kelola Foto</span>
            </button>
          )}
        </div>
      </div>

      {/* Media-First Asymmetric Bento Grid */}
      {filteredMemories.length === 0 ? (
        <div
          className={`mt-10 rounded-2xl border p-12 text-center ${
            isDarkSky
              ? 'border-sky-400/20 bg-sky-950/40 text-sky-100'
              : 'border-sky-200 bg-white/80 text-slate-600'
          }`}
        >
          <p className="text-sm">Belum ada foto pada kategori ini.</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[260px]">
          {filteredMemories.map((memory, idx) => {
            const isHeroTile = idx === 0 && selectedCategory === 'Semua';
            const gradient = SKY_GRADIENTS[idx % SKY_GRADIENTS.length];
            return (
              <motion.article
                key={memory.id}
                layout
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => setLightboxIndex(idx)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-shadow ${
                  isDarkSky
                    ? 'border-sky-400/20 bg-[#0B1E33] hover:shadow-[0_14px_30px_rgba(2,132,199,0.22)]'
                    : 'border-sky-200/80 bg-white hover:shadow-[0_14px_30px_rgba(12,74,110,0.12)]'
                } ${
                  isHeroTile
                    ? 'min-h-[340px] sm:col-span-2 lg:col-span-2 lg:row-span-2'
                    : 'min-h-[250px] lg:col-span-1 lg:row-span-1'
                }`}
              >
                {memory.imageDataUrl ? (
                  <img
                    src={memory.imageDataUrl}
                    alt={memory.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className={`relative flex h-full w-full flex-col justify-between bg-gradient-to-br ${gradient} p-5 text-white`}
                  >
                    <svg
                      viewBox="0 0 280 160"
                      className="pointer-events-none absolute right-0 bottom-0 h-36 w-56 opacity-20"
                      aria-hidden="true"
                    >
                      <path
                        d="M20 140 Q 85 75 160 115 T 280 95 L 280 160 L 20 160 Z"
                        fill="#FFFFFF"
                      />
                    </svg>
                    <div className="relative z-10 flex items-center justify-between text-[11px] font-medium text-sky-50/85">
                      <span>{memory.category}</span>
                      <span className="font-mono tabular-nums">{memory.date}</span>
                    </div>
                    {!giftMode && (
                      <div className="relative z-10 my-auto flex justify-center">
                        <button
                          type="button"
                          onClick={(e) => triggerQuickUpload(memory.id, e)}
                          disabled={uploadingId === memory.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3.5 py-2 text-xs font-semibold text-[#0C4A6E] shadow-sm transition-transform hover:scale-105 cursor-pointer"
                        >
                          <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>
                            {uploadingId === memory.id ? 'Menyimpan...' : 'Pasang Foto'}
                          </span>
                        </button>
                      </div>
                    )}
                    <div className="h-10" />
                  </div>
                )}

                {/* Contrast Scrim & Clean Metadata */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 text-white">
                  <div className="flex items-center gap-1.5 text-[11px] text-sky-100/85">
                    <span>{memory.date}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{memory.location}</span>
                  </div>
                  <h3
                    className={`mt-1 font-display font-medium leading-snug text-white ${
                      isHeroTile ? 'text-xl sm:text-2xl' : 'text-base'
                    }`}
                  >
                    {memory.title}
                  </h3>
                </div>

                {/* Quick replace button when hovering an existing uploaded photo in edit mode */}
                {!giftMode && memory.imageDataUrl && (
                  <button
                    type="button"
                    onClick={(e) => triggerQuickUpload(memory.id, e)}
                    className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-lg bg-[#082036]/80 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 cursor-pointer"
                  >
                    <Camera className="h-3 w-3" aria-hidden="true" />
                    <span>Ganti</span>
                  </button>
                )}
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Fullscreen High-Contrast Lightbox with Peeking Toothless */}
      <AnimatePresence>
        {activeMemory && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#04101E]/85 p-4 backdrop-blur-md sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={`Detail foto ${activeMemory.title}`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative grid w-full max-w-4xl grid-cols-1 overflow-visible rounded-2xl bg-white text-[#0B1F33] shadow-2xl md:grid-cols-12"
            >
              {/* Peeking Cute Toothless on Top Right Edge */}
              <img
                src={NIGHT_FURY_ASSETS.peekingSmile}
                alt="Toothless mengintip kenangan kita"
                referrerPolicy="no-referrer"
                className="pointer-events-none absolute -top-16 right-12 z-20 hidden w-24 select-none drop-shadow-lg md:block"
              />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                aria-label="Tutup pratinjau foto"
                className="absolute top-3 right-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-[#082036]/85 text-white transition-colors hover:bg-[#082036] cursor-pointer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>

              {/* Left Media Frame */}
              <div className="relative min-h-[280px] overflow-hidden rounded-t-2xl bg-[#0C4A6E] md:col-span-7 md:min-h-[440px] md:rounded-l-2xl md:rounded-tr-none">
                {activeMemory.imageDataUrl ? (
                  <img
                    src={activeMemory.imageDataUrl}
                    alt={activeMemory.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#0284C7] via-[#38BDF8] to-[#0C4A6E] p-8 text-center text-white">
                    <p className="font-display text-2xl font-medium">{activeMemory.title}</p>
                    <p className="mt-2 max-w-xs text-xs text-sky-50/90">
                      Unggah foto asli momen ini agar bingkai ini menampilkan senyum kalian berdua.
                    </p>
                    {!giftMode && (
                      <button
                        type="button"
                        onClick={(e) => triggerQuickUpload(activeMemory.id, e)}
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#0C4A6E] cursor-pointer"
                      >
                        <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Unggah Foto Sekarang</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Prev / Next Controls */}
                {filteredMemories.length > 1 && (
                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxIndex(
                          (lightboxIndex - 1 + filteredMemories.length) %
                            filteredMemories.length
                        )
                      }
                      aria-label="Foto sebelumnya"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/80 cursor-pointer"
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <span className="rounded-md bg-black/55 px-2.5 py-1 font-mono text-xs text-white tabular-nums backdrop-blur-sm">
                      {lightboxIndex + 1} / {filteredMemories.length}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxIndex((lightboxIndex + 1) % filteredMemories.length)
                      }
                      aria-label="Foto berikutnya"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/80 cursor-pointer"
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right Story Details */}
              <div className="flex flex-col justify-between p-6 sm:p-8 md:col-span-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-sky-700">
                    <span>{activeMemory.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{activeMemory.date}</span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-[#082036]">
                    {activeMemory.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {activeMemory.location}
                  </p>
                  <p className="mt-5 text-sm leading-relaxed text-slate-700">
                    {activeMemory.story}
                  </p>
                </div>

                {!giftMode && (
                  <div className="mt-8 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={(e) => triggerQuickUpload(activeMemory.id, e)}
                      className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3.5 py-2 text-xs font-semibold text-[#0284C7] transition-colors hover:bg-sky-100 cursor-pointer"
                    >
                      <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Ganti Foto Momen Ini</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
