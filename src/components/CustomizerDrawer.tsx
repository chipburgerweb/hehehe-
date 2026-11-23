import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Check,
  Copy,
  Download,
  Eye,
  Plus,
  RotateCcw,
  Share2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  BirthdayConfig,
  MemoryCategory,
  MemoryItem,
  NIGHT_FURY_ASSETS,
  SkyMood,
} from '../types/birthday';
import { compressImageFile } from '../utils/imageUtils';

export type CustomizerTab = 'identity' | 'photos' | 'letter' | 'constellation' | 'share';

interface Props {
  isOpen: boolean;
  initialTab: CustomizerTab;
  config: BirthdayConfig;
  giftMode: boolean;
  storageWarning: string | null;
  onClose: () => void;
  onChangeConfig: (updater: (prev: BirthdayConfig) => BirthdayConfig) => void;
  onToggleGiftMode: (next: boolean) => void;
  onResetDefault: () => void;
}

const TABS: Array<{ id: CustomizerTab; label: string }> = [
  { id: 'identity', label: 'Identitas' },
  { id: 'photos', label: 'Foto Kita' },
  { id: 'letter', label: 'Surat' },
  { id: 'constellation', label: 'Konstelasi' },
  { id: 'share', label: 'Simpan' },
];

const SKY_OPTIONS: Array<{ id: SkyMood; title: string; desc: string }> = [
  {
    id: 'cerulean',
    title: 'Biru Langit Cerah',
    desc: 'Langit biru segar dengan awan putih lembut',
  },
  {
    id: 'twilight',
    title: 'Awan Senja Biru',
    desc: 'Perpaduan biru langit dan hangat mentari sore',
  },
  {
    id: 'aurora',
    title: 'Langit Malam Aurora',
    desc: 'Langit biru malam dengan kilau bintang Night Fury',
  },
];

export function CustomizerDrawer({
  isOpen,
  initialTab,
  config,
  giftMode,
  storageWarning,
  onClose,
  onChangeConfig,
  onToggleGiftMode,
  onResetDefault,
}: Props) {
  const [activeTab, setActiveTab] = useState<CustomizerTab>(initialTab);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [busySlot, setBusySlot] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  // Sync tab when reopened with a specific target tab
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setConfirmReset(false);
      setImportStatus(null);
    }
  }, [isOpen, initialTab]);

  const handleImageUpload = async (
    file: File | undefined,
    slotKey: string,
    onLoaded: (dataUrl: string) => void
  ) => {
    if (!file) return;
    setBusySlot(slotKey);
    try {
      const compressed = await compressImageFile(file, 1080, 0.82);
      onLoaded(compressed);
    } catch {
      setImportStatus('Gagal memuat gambar. Pastikan file berupa foto JPG/PNG/WebP.');
    } finally {
      setBusySlot(null);
    }
  };

  const handleAddMemory = () => {
    const newItem: MemoryItem = {
      id: `mem-${Date.now()}`,
      title: 'Momen Baru Kita',
      date: 'Hari Ini',
      location: 'Tempat Spesial',
      story: 'Tulis cerita singkat di balik foto ini...',
      category: 'Momen Favorit',
      imageDataUrl: null,
    };
    onChangeConfig((prev) => ({
      ...prev,
      memories: [newItem, ...prev.memories],
    }));
  };

  const handleUpdateMemory = (id: string, patch: Partial<MemoryItem>) => {
    onChangeConfig((prev) => ({
      ...prev,
      memories: prev.memories.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  };

  const handleDeleteMemory = (id: string) => {
    onChangeConfig((prev) => ({
      ...prev,
      memories: prev.memories.filter((m) => m.id !== id),
    }));
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (config.recipientName || 'kado').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    a.download = `kado-ulang-tahun-${safeName}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setImportStatus('File cadangan berhasil diunduh beserta seluruh fotonya.');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<BirthdayConfig>;
        if (!parsed.recipientName || !Array.isArray(parsed.memories)) {
          setImportStatus('Format file tidak cocok dengan cadangan web ini.');
          return;
        }
        onChangeConfig((prev) => ({
          ...prev,
          ...parsed,
        }));
        setImportStatus('Kustomisasi & foto berhasil dipulihkan dari file!');
      } catch {
        setImportStatus('File JSON tidak valid atau rusak.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Studio Kustomisasi Ucapan Ulang Tahun"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#04101E]/60 backdrop-blur-xs"
          />

          {/* Slide-over Studio Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex h-full w-full max-w-xl flex-col bg-white text-[#0B1F33] shadow-2xl"
          >
            {/* Studio Header */}
            <div className="flex items-center justify-between border-b border-sky-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <img
                  src={NIGHT_FURY_ASSETS.peekingSmile}
                  alt="Ikon Toothless"
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-lg bg-sky-50 object-contain p-1"
                />
                <div>
                  <h2 className="font-display text-lg font-semibold text-[#082036]">
                    Studio Kustomisasi
                  </h2>
                  <p className="text-xs text-slate-500">
                    Perubahan tersimpan otomatis di browser ini
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup Studio Kustomisasi"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-sky-50 hover:text-[#082036] cursor-pointer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-sky-100 bg-[#F7FBFF] px-4 py-2.5">
              <div className="flex items-center gap-1 overflow-x-auto">
                {TABS.map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#0284C7] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-sky-100/70 hover:text-[#082036]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Storage Warning if quota reached */}
            {storageWarning && (
              <div className="border-b border-amber-200 bg-amber-50 px-6 py-2.5 text-xs text-amber-800">
                {storageWarning}
              </div>
            )}

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* TAB 1: IDENTITAS & TEMA */}
              {activeTab === 'identity' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-700">Nama Pacar</span>
                      <input
                        type="text"
                        value={config.recipientName}
                        onChange={(e) =>
                          onChangeConfig((p) => ({ ...p, recipientName: e.target.value }))
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#0284C7] focus:outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-700">Nama Kamu (Pengirim)</span>
                      <input
                        type="text"
                        value={config.senderName}
                        onChange={(e) =>
                          onChangeConfig((p) => ({ ...p, senderName: e.target.value }))
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#0284C7] focus:outline-none"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-700">Usia Baru</span>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={config.turningAge}
                        onChange={(e) =>
                          onChangeConfig((p) => ({
                            ...p,
                            turningAge: Math.max(1, Number(e.target.value) || 1),
                          }))
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-mono text-sm tabular-nums focus:border-[#0284C7] focus:outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-700">Tanggal Ultah</span>
                      <input
                        type="date"
                        value={config.birthdayDate}
                        onChange={(e) =>
                          onChangeConfig((p) => ({ ...p, birthdayDate: e.target.value }))
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-xs focus:border-[#0284C7] focus:outline-none"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">Judul Web (Pojok Kiri Atas)</span>
                    <input
                      type="text"
                      value={config.siteBrand}
                      onChange={(e) =>
                        onChangeConfig((p) => ({ ...p, siteBrand: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#0284C7] focus:outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">Judul Utama Ucapan</span>
                    <input
                      type="text"
                      value={config.heroTitle}
                      onChange={(e) =>
                        onChangeConfig((p) => ({ ...p, heroTitle: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#0284C7] focus:outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">Kalimat Pembuka</span>
                    <textarea
                      rows={3}
                      value={config.heroSubtitle}
                      onChange={(e) =>
                        onChangeConfig((p) => ({ ...p, heroSubtitle: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm leading-relaxed focus:border-[#0284C7] focus:outline-none"
                    />
                  </label>

                  {/* Sky Atmosphere Picker */}
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-slate-700">Nuansa Biru Langit</span>
                    <div className="mt-2 grid grid-cols-1 gap-2.5">
                      {SKY_OPTIONS.map((option) => {
                        const selected = config.skyMood === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() =>
                              onChangeConfig((p) => ({ ...p, skyMood: option.id }))
                            }
                            className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-colors cursor-pointer ${
                              selected
                                ? 'border-[#0284C7] bg-sky-50'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <p className="text-sm font-semibold text-[#082036]">
                                {option.title}
                              </p>
                              <p className="text-xs text-slate-500">{option.desc}</p>
                            </div>
                            {selected && (
                              <Check className="h-4 w-4 shrink-0 text-[#0284C7]" aria-hidden="true" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FOTO KITA */}
              {activeTab === 'photos' && (
                <div className="space-y-7">
                  {/* Hero Main Photo */}
                  <div className="rounded-2xl border border-sky-100 bg-[#F7FBFF] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-[#082036]">
                          Foto Utama Halaman Depan
                        </h3>
                        <p className="text-xs text-slate-500">
                          Tampil berdampingan langsung dengan Toothless di atas.
                        </p>
                      </div>
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#0284C7] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0369A1] whitespace-nowrap shrink-0">
                        <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{busySlot === 'hero' ? 'Memproses...' : 'Pilih Foto'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleImageUpload(e.target.files?.[0], 'hero', (url) =>
                              onChangeConfig((p) => ({ ...p, heroPhotoDataUrl: url }))
                            )
                          }
                        />
                      </label>
                    </div>
                    {config.heroPhotoDataUrl && (
                      <div className="mt-3 flex items-center gap-3">
                        <img
                          src={config.heroPhotoDataUrl}
                          alt="Pratinjau foto utama"
                          referrerPolicy="no-referrer"
                          className="h-16 w-24 rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            onChangeConfig((p) => ({ ...p, heroPhotoDataUrl: null }))
                          }
                          className="text-xs font-medium text-rose-600 hover:underline cursor-pointer"
                        >
                          Hapus foto
                        </button>
                      </div>
                    )}
                    <input
                      type="text"
                      value={config.heroPhotoCaption}
                      onChange={(e) =>
                        onChangeConfig((p) => ({ ...p, heroPhotoCaption: e.target.value }))
                      }
                      placeholder="Keterangan singkat foto utama..."
                      className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#0284C7] focus:outline-none"
                    />
                  </div>

                  {/* Letter Photo */}
                  <div className="rounded-2xl border border-sky-100 bg-[#F7FBFF] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-[#082036]">
                          Foto Polaroid Surat
                        </h3>
                        <p className="text-xs text-slate-500">
                          Tampil di sebelah kanan isi surat ulang tahun.
                        </p>
                      </div>
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#0284C7] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0369A1] whitespace-nowrap shrink-0">
                        <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{busySlot === 'letter' ? 'Memproses...' : 'Pilih Foto'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleImageUpload(e.target.files?.[0], 'letter', (url) =>
                              onChangeConfig((p) => ({ ...p, letterPhotoDataUrl: url }))
                            )
                          }
                        />
                      </label>
                    </div>
                    {config.letterPhotoDataUrl && (
                      <div className="mt-3 flex items-center gap-3">
                        <img
                          src={config.letterPhotoDataUrl}
                          alt="Pratinjau foto surat"
                          referrerPolicy="no-referrer"
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            onChangeConfig((p) => ({ ...p, letterPhotoDataUrl: null }))
                          }
                          className="text-xs font-medium text-rose-600 hover:underline cursor-pointer"
                        >
                          Hapus foto
                        </button>
                      </div>
                    )}
                    <input
                      type="text"
                      value={config.letterPhotoCaption}
                      onChange={(e) =>
                        onChangeConfig((p) => ({ ...p, letterPhotoCaption: e.target.value }))
                      }
                      placeholder="Keterangan polaroid surat..."
                      className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#0284C7] focus:outline-none"
                    />
                  </div>

                  {/* Gallery Memories List */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[#082036]">
                        Galeri Kenangan ({config.memories.length} Foto)
                      </h3>
                      <button
                        type="button"
                        onClick={handleAddMemory}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-semibold text-[#0C4A6E] hover:bg-sky-200 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Tambah Momen</span>
                      </button>
                    </div>

                    <div className="mt-4 space-y-4">
                      {config.memories.map((mem) => (
                        <div
                          key={mem.id}
                          className="rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sky-100">
                              {mem.imageDataUrl ? (
                                <img
                                  src={mem.imageDataUrl}
                                  alt={mem.title}
                                  referrerPolicy="no-referrer"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-sky-700">
                                  Kosong
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-[#0284C7] hover:bg-sky-100">
                                  <Camera className="h-3 w-3" aria-hidden="true" />
                                  <span>
                                    {busySlot === mem.id
                                      ? 'Memproses...'
                                      : mem.imageDataUrl
                                      ? 'Ganti Foto'
                                      : 'Unggah Foto'}
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                      handleImageUpload(e.target.files?.[0], mem.id, (url) =>
                                        handleUpdateMemory(mem.id, { imageDataUrl: url })
                                      )
                                    }
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMemory(mem.id)}
                                  aria-label={`Hapus momen ${mem.title}`}
                                  className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                              </div>

                              <input
                                type="text"
                                value={mem.title}
                                onChange={(e) =>
                                  handleUpdateMemory(mem.id, { title: e.target.value })
                                }
                                placeholder="Judul momen"
                                className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium focus:border-[#0284C7] focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={mem.date}
                              onChange={(e) =>
                                handleUpdateMemory(mem.id, { date: e.target.value })
                              }
                              placeholder="Tanggal"
                              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-[#0284C7] focus:outline-none"
                            />
                            <input
                              type="text"
                              value={mem.location}
                              onChange={(e) =>
                                handleUpdateMemory(mem.id, { location: e.target.value })
                              }
                              placeholder="Lokasi"
                              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-[#0284C7] focus:outline-none"
                            />
                            <select
                              value={mem.category}
                              onChange={(e) =>
                                handleUpdateMemory(mem.id, {
                                  category: e.target.value as MemoryCategory,
                                })
                              }
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-[#0284C7] focus:outline-none"
                            >
                              <option value="Momen Favorit">Momen Favorit</option>
                              <option value="Petualangan">Petualangan</option>
                              <option value="Lucu">Lucu</option>
                            </select>
                          </div>

                          <textarea
                            rows={2}
                            value={mem.story}
                            onChange={(e) =>
                              handleUpdateMemory(mem.id, { story: e.target.value })
                            }
                            placeholder="Cerita singkat tentang foto ini..."
                            className="mt-2 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs leading-relaxed focus:border-[#0284C7] focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SURAT & PESAN */}
              {activeTab === 'letter' && (
                <div className="space-y-5">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">Judul Surat</span>
                    <input
                      type="text"
                      value={config.letterHeading}
                      onChange={(e) =>
                        onChangeConfig((p) => ({ ...p, letterHeading: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#0284C7] focus:outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">
                      Isi Surat Ulang Tahun (pisahkan paragraf dengan Enter)
                    </span>
                    <textarea
                      rows={9}
                      value={config.letterBody}
                      onChange={(e) =>
                        onChangeConfig((p) => ({ ...p, letterBody: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm leading-relaxed focus:border-[#0284C7] focus:outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">Kalimat Penutup</span>
                    <input
                      type="text"
                      value={config.letterClosing}
                      onChange={(e) =>
                        onChangeConfig((p) => ({ ...p, letterClosing: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#0284C7] focus:outline-none"
                    />
                  </label>

                  <div className="border-t border-slate-200 pt-5">
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-700">
                        Judul Pesan Rahasia Konstelasi
                      </span>
                      <input
                        type="text"
                        value={config.secretConstellationTitle}
                        onChange={(e) =>
                          onChangeConfig((p) => ({
                            ...p,
                            secretConstellationTitle: e.target.value,
                          }))
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#0284C7] focus:outline-none"
                      />
                    </label>

                    <label className="mt-4 block">
                      <span className="text-xs font-semibold text-slate-700">
                        Isi Pesan Rahasia (terbuka saat semua bintang menyala)
                      </span>
                      <textarea
                        rows={3}
                        value={config.secretConstellationMessage}
                        onChange={(e) =>
                          onChangeConfig((p) => ({
                            ...p,
                            secretConstellationMessage: e.target.value,
                          }))
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm leading-relaxed focus:border-[#0284C7] focus:outline-none"
                      />
                    </label>
                  </div>

                  <div className="border-t border-slate-200 pt-5">
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-700">
                        Pesan Lucu Toothless saat Dielus (1 kalimat per baris)
                      </span>
                      <textarea
                        rows={5}
                        value={config.toothlessQuotes.join('\n')}
                        onChange={(e) =>
                          onChangeConfig((p) => ({
                            ...p,
                            toothlessQuotes: e.target.value
                              .split('\n')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }))
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs leading-relaxed focus:border-[#0284C7] focus:outline-none"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 4: KONSTELASI */}
              {activeTab === 'constellation' && (
                <div className="space-y-4">
                  <p className="text-xs leading-relaxed text-slate-600">
                    Ubah 7 bintang alasan sayang yang membentuk peta sayap Night Fury.
                  </p>
                  {config.constellationStars.map((star, index) => (
                    <div
                      key={star.id}
                      className="rounded-2xl border border-slate-200 bg-[#F9FCFF] p-4"
                    >
                      <p className="font-mono text-xs font-semibold text-[#0284C7] tabular-nums">
                        Bintang {star.label}
                      </p>
                      <input
                        type="text"
                        value={star.title}
                        onChange={(e) =>
                          onChangeConfig((p) => ({
                            ...p,
                            constellationStars: p.constellationStars.map((s, i) =>
                              i === index ? { ...s, title: e.target.value } : s
                            ),
                          }))
                        }
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-[#0284C7] focus:outline-none"
                      />
                      <textarea
                        rows={2}
                        value={star.message}
                        onChange={(e) =>
                          onChangeConfig((p) => ({
                            ...p,
                            constellationStars: p.constellationStars.map((s, i) =>
                              i === index ? { ...s, message: e.target.value } : s
                            ),
                          }))
                        }
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-relaxed focus:border-[#0284C7] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: SIMPAN & MODE HADIAH */}
              {activeTab === 'share' && (
                <div className="space-y-6">
                  {/* Shareable Link Generator Card */}
                  <div className="rounded-2xl border border-sky-300 bg-gradient-to-br from-[#E0F2FE] via-[#F0Fdf4] to-sky-50 p-5 shadow-xs">
                    <div className="flex items-center gap-2 text-[#0284C7]">
                      <Share2 className="h-4 w-4" aria-hidden="true" />
                      <h3 className="font-display text-base font-semibold text-[#082036]">
                        Salin Link Khusus untuk Pacar
                      </h3>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      Bagikan link ini ke pacar kamu. Nama <span className="font-semibold text-[#082036]">{config.recipientName}</span> dan <span className="font-semibold text-[#082036]">{config.senderName}</span> akan otomatis langsung muncul di HP-nya tanpa ribet!
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      {(() => {
                        const publicOrigin = window.location.origin.replace('ais-dev-', 'ais-pre-');
                        const publicLink = `${publicOrigin}${window.location.pathname}?to=${encodeURIComponent(config.recipientName)}&from=${encodeURIComponent(config.senderName)}&age=${config.turningAge}`;
                        return (
                          <>
                            <input
                              type="text"
                              readOnly
                              value={publicLink}
                              className="min-h-[38px] flex-1 rounded-lg border border-sky-200 bg-white px-3 py-1.5 font-mono text-xs text-slate-700 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                void navigator.clipboard.writeText(publicLink);
                                setImportStatus('Link publik khusus pacar berhasil disalin!');
                                window.setTimeout(() => setImportStatus(null), 3000);
                              }}
                              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#0284C7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0369A1] whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Salin Link</span>
                            </button>
                          </>
                        );
                      })()}
                    </div>
                    {importStatus && (
                      <p className="mt-2 text-xs font-medium text-[#0284C7]">{importStatus}</p>
                    )}
                  </div>

                  {/* Gift Mode Card */}
                  <div className="rounded-2xl border border-sky-200 bg-[#F0F8FF] p-5">
                    <h3 className="font-display text-lg font-semibold text-[#082036]">
                      Mode Hadiah (Siap Ditunjukkan)
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      Aktifkan Mode Hadiah untuk menyembunyikan tombol Kustomisasi dan tombol
                      Ganti Foto agar pacarmu melihat halaman ulang tahun yang bersih dan murni
                      seperti kado spesial. Kamu selalu bisa membuka kembali Studio lewat tombol
                      kecil di bagian paling bawah halaman.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onToggleGiftMode(!giftMode);
                        if (!giftMode) onClose();
                      }}
                      className="mt-4 inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#0284C7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0369A1] cursor-pointer"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      <span>
                        {giftMode ? 'Keluar dari Mode Hadiah' : 'Aktifkan Mode Hadiah Sekarang'}
                      </span>
                    </button>
                  </div>

                  {/* Export & Import Backup */}
                  <div className="space-y-3 rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-sm font-semibold text-[#082036]">
                      Cadangkan &amp; Pindahkan Kado (.json)
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-600">
                      Simpan seluruh teks, pesan rahasia, dan semua foto kalian ke dalam satu file
                      cadangan agar bisa dibuka kembali kapan saja atau di perangkat lain.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleExportJson}
                        className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-sky-300 bg-white px-4 py-2 text-xs font-semibold text-[#0C4A6E] hover:bg-sky-50 cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Ekspor File Kado</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => importInputRef.current?.click()}
                        className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Impor File Kado</span>
                      </button>
                      <input
                        ref={importInputRef}
                        type="file"
                        accept="application/json,.json"
                        onChange={handleImportJson}
                        className="hidden"
                      />
                    </div>
                    {importStatus && (
                      <p className="pt-1 text-xs font-medium text-[#0284C7]">{importStatus}</p>
                    )}
                  </div>

                  {/* Reset Default */}
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-5">
                    <h3 className="text-sm font-semibold text-rose-900">Kembalikan ke Awal</h3>
                    <p className="mt-1 text-xs text-rose-700/90">
                      Menghapus semua kustomisasi dan foto yang tersimpan di browser ini lalu
                      mengembalikan contoh bawaan.
                    </p>
                    {!confirmReset ? (
                      <button
                        type="button"
                        onClick={() => setConfirmReset(true)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Reset Pengaturan</span>
                      </button>
                    ) : (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onResetDefault();
                            setConfirmReset(false);
                          }}
                          className="rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
                        >
                          Ya, Reset Semua
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmReset(false)}
                          className="rounded-lg bg-white px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-sky-100 bg-[#F7FBFF] px-6 py-4">
              <span className="text-xs text-slate-500">Semua perubahan langsung terlihat</span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-[#082036] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0C2F52] cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
