import { useCallback, useEffect, useState } from 'react';
import { SlidersHorizontal, Volume2, VolumeX } from 'lucide-react';
import { BirthdayConfig, NIGHT_FURY_ASSETS } from './types/birthday';
import { DEFAULT_BIRTHDAY_CONFIG } from './data/defaultConfig';
import { PlasmaBurstRequest, SkyAtmosphereCanvas } from './components/SkyAtmosphereCanvas';
import { HeroSkyStage } from './components/HeroSkyStage';
import { MemoriesGallery } from './components/MemoriesGallery';
import { ConstellationSection } from './components/ConstellationSection';
import { LoveLetterSection } from './components/LoveLetterSection';
import { CakeAndLanternsSection } from './components/CakeAndLanternsSection';
import { CustomizerDrawer, CustomizerTab } from './components/CustomizerDrawer';
import { musicBox } from './utils/musicBox';

const STORAGE_KEY = 'langit_untukmu_night_fury_v1';

function loadSavedConfig(): BirthdayConfig {
  let baseConfig = DEFAULT_BIRTHDAY_CONFIG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<BirthdayConfig>;
      baseConfig = {
        ...DEFAULT_BIRTHDAY_CONFIG,
        ...parsed,
        memories: Array.isArray(parsed.memories)
          ? parsed.memories
          : DEFAULT_BIRTHDAY_CONFIG.memories,
        constellationStars: Array.isArray(parsed.constellationStars)
          ? parsed.constellationStars
          : DEFAULT_BIRTHDAY_CONFIG.constellationStars,
        wishLanterns: Array.isArray(parsed.wishLanterns)
          ? parsed.wishLanterns
          : DEFAULT_BIRTHDAY_CONFIG.wishLanterns,
      };
    }
  } catch {
    // fallback
  }

  // Check URL query and hash parameters for instant sharing on any device
  if (typeof window !== 'undefined') {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash.includes('?') ? window.location.hash.split('?')[1] : ''
    );
    const toParam = searchParams.get('to') || hashParams.get('to');
    const fromParam = searchParams.get('from') || hashParams.get('from');
    const ageParam = searchParams.get('age') || hashParams.get('age');
    if (toParam) {
      baseConfig = {
        ...baseConfig,
        recipientName: toParam,
        heroTitle: `Selamat Ulang Tahun, ${toParam}.`,
      };
    }
    if (fromParam) {
      baseConfig = {
        ...baseConfig,
        senderName: fromParam,
      };
    }
    if (ageParam && !Number.isNaN(Number(ageParam))) {
      baseConfig = {
        ...baseConfig,
        turningAge: Number(ageParam),
      };
    }
  }

  return baseConfig;
}

export default function App() {
  const [config, setConfig] = useState<BirthdayConfig>(() => loadSavedConfig());
  const [giftMode, setGiftMode] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customizerTab, setCustomizerTab] = useState<CustomizerTab>('identity');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [burstRequest, setBurstRequest] = useState<PlasmaBurstRequest | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  // Persist customizations to localStorage safely
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setStorageWarning(null);
    } catch {
      setStorageWarning(
        'Memori browser hampir penuh karena banyak foto. Gunakan Ekspor File Kado di tab Simpan untuk mencadangkan.'
      );
    }
  }, [config]);

  useEffect(() => {
    return () => {
      musicBox.stop();
    };
  }, []);

  const launchPlasma = useCallback((x?: number, y?: number, count = 2) => {
    setBurstRequest({
      id: Date.now() + Math.random(),
      x,
      y,
      count,
    });
  }, []);

  const handleToggleMusic = useCallback(() => {
    musicBox.toggle((playing) => setIsMusicPlaying(playing));
  }, []);

  const handleOpenCustomizer = useCallback((tab: CustomizerTab = 'identity') => {
    setCustomizerTab(tab);
    setIsCustomizerOpen(true);
  }, []);

  const handleUpdateConfig = useCallback(
    (updater: (prev: BirthdayConfig) => BirthdayConfig) => {
      setConfig((prev) => updater(prev));
    },
    []
  );

  const handleAddWishLantern = useCallback((wish: string) => {
    const timeLabel = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
    setConfig((prev) => ({
      ...prev,
      wishLanterns: [
        {
          id: `lantern-${Date.now()}`,
          wish,
          createdAt: `Diterbangkan pukul ${timeLabel}`,
          xOffset: 20 + Math.random() * 60,
        },
        ...prev.wishLanterns,
      ],
    }));
  }, []);

  const handleResetDefault = useCallback(() => {
    setConfig(DEFAULT_BIRTHDAY_CONFIG);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const skyCanvasClass =
    config.skyMood === 'aurora'
      ? 'bg-gradient-to-b from-[#04101F] via-[#091E36] to-[#051224] text-sky-50'
      : config.skyMood === 'twilight'
      ? 'bg-gradient-to-b from-[#E6F4FF] via-[#F5FAFF] to-[#FFF7ED] text-[#082036]'
      : 'bg-gradient-to-b from-[#E0F2FE] via-[#F2F9FF] to-[#E6F4FE] text-[#082036]';

  const isDarkSky = config.skyMood === 'aurora';

  return (
    <div className={`relative min-h-screen transition-colors duration-500 ${skyCanvasClass}`}>
      {/* Interactive Atmospheric Clouds & Night Fury Plasma Fireworks Layer */}
      <SkyAtmosphereCanvas skyMood={config.skyMood} burstRequest={burstRequest} />

      {/* 3-Zone Top Bar Contract */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
          isDarkSky
            ? 'border-sky-300/15 bg-[#061426]/80 text-white'
            : 'border-sky-900/10 bg-[#F2F9FF]/85 text-[#082036]'
        }`}
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-5 py-3.5 sm:px-8">
          {/* Zone 1: Single-line Wordmark */}
          <a
            href="#"
            className="font-display text-lg font-semibold tracking-tight whitespace-nowrap shrink-0"
          >
            {config.siteBrand}
          </a>

          {/* Zone 2: 4 Clean Single-Line Nav Links */}
          <nav
            aria-label="Navigasi utama"
            className={`hidden items-center gap-7 text-sm font-medium md:flex ${
              isDarkSky ? 'text-sky-100/80' : 'text-slate-600'
            }`}
          >
            <a
              href="#kenangan"
              className="underline-offset-4 transition-colors hover:text-[#0284C7] hover:underline whitespace-nowrap shrink-0"
            >
              Kenangan
            </a>
            <a
              href="#konstelasi"
              className="underline-offset-4 transition-colors hover:text-[#0284C7] hover:underline whitespace-nowrap shrink-0"
            >
              Konstelasi
            </a>
            <a
              href="#surat"
              className="underline-offset-4 transition-colors hover:text-[#0284C7] hover:underline whitespace-nowrap shrink-0"
            >
              Surat
            </a>
            <a
              href="#tiup-lilin"
              className="underline-offset-4 transition-colors hover:text-[#0284C7] hover:underline whitespace-nowrap shrink-0"
            >
              Tiup Lilin
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="shrink-0">
            {!giftMode ? (
              <button
                type="button"
                onClick={() => handleOpenCustomizer('identity')}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-[#082036] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0C3559] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Kustomisasi</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleToggleMusic}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-[#0284C7] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0369A1] whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isMusicPlaying ? (
                  <>
                    <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Musik Aktif</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Putar Musik</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Editorial Story Journey */}
      <main>
        <HeroSkyStage
          config={config}
          giftMode={giftMode}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={handleToggleMusic}
          onLaunchPlasma={launchPlasma}
          onUpdateHeroPhoto={(dataUrl) =>
            setConfig((prev) => ({ ...prev, heroPhotoDataUrl: dataUrl }))
          }
          onOpenCustomizer={handleOpenCustomizer}
        />

        <MemoriesGallery
          config={config}
          giftMode={giftMode}
          onUpdateMemoryPhoto={(memoryId, dataUrl) =>
            setConfig((prev) => ({
              ...prev,
              memories: prev.memories.map((m) =>
                m.id === memoryId ? { ...m, imageDataUrl: dataUrl } : m
              ),
            }))
          }
          onOpenPhotoStudio={() => handleOpenCustomizer('photos')}
        />

        <ConstellationSection config={config} onLaunchPlasma={launchPlasma} />

        <LoveLetterSection
          config={config}
          giftMode={giftMode}
          onUpdateLetterPhoto={(dataUrl) =>
            setConfig((prev) => ({ ...prev, letterPhotoDataUrl: dataUrl }))
          }
          onLaunchPlasma={launchPlasma}
        />

        <CakeAndLanternsSection
          config={config}
          onAddWishLantern={handleAddWishLantern}
          onLaunchPlasma={launchPlasma}
        />
      </main>

      {/* Quiet Editorial Footer */}
      <footer
        className={`relative z-10 border-t ${
          isDarkSky
            ? 'border-sky-300/15 bg-[#04101F]/70 text-sky-200/75'
            : 'border-sky-900/10 bg-white/60 text-slate-600'
        }`}
      >
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 px-5 py-10 sm:flex-row sm:px-8">
          <div className="flex items-center gap-3.5">
            <img
              src={NIGHT_FURY_ASSETS.peekingSmile}
              alt="Toothless tersenyum"
              referrerPolicy="no-referrer"
              className="h-10 w-10 rounded-full bg-sky-100/70 object-contain p-1"
            />
            <div className="text-xs leading-relaxed">
              <p className={`font-medium ${isDarkSky ? 'text-white' : 'text-[#082036]'}`}>
                Dibuat khusus untuk ulang tahun ke-{config.turningAge} {config.recipientName}
              </p>
              <p>Dari {config.senderName}, di bawah langit biru yang sama.</p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs font-medium">
            <button
              type="button"
              onClick={() => launchPlasma(undefined, undefined, 4)}
              className="transition-colors hover:text-[#0284C7] cursor-pointer"
            >
              Ledakkan Plasma
            </button>
            <button
              type="button"
              onClick={() => {
                if (giftMode) setGiftMode(false);
                handleOpenCustomizer('identity');
              }}
              className="transition-colors hover:text-[#0284C7] cursor-pointer"
            >
              {giftMode ? 'Buka Editor' : 'Studio Kustomisasi'}
            </button>
          </div>
        </div>
      </footer>

      {/* Customization Slide-over Studio */}
      <CustomizerDrawer
        isOpen={isCustomizerOpen}
        initialTab={customizerTab}
        config={config}
        giftMode={giftMode}
        storageWarning={storageWarning}
        onClose={() => setIsCustomizerOpen(false)}
        onChangeConfig={handleUpdateConfig}
        onToggleGiftMode={setGiftMode}
        onResetDefault={handleResetDefault}
      />
    </div>
  );
}
