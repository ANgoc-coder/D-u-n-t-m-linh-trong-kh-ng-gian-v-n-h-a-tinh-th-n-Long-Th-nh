import { useEffect, useRef, useState, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import BoomerangVideoBg from './BoomerangVideoBg';

gsap.registerPlugin(ScrollToPlugin);
import {
  MapPin,
  Calendar,
  User,
  Volume2,
  VolumeX,
  Clock,
  ArrowRight,
  BookOpen,
  Heart,
  Info,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Camera,
  Compass,
  FileText,
  Activity
} from 'lucide-react';
import contentDataRaw from './data/contentData.json';

// Define explicit TypeScript types for absolute type safety
interface ImageAsset {
  key: string;
  url: string;
  description: string;
  aspectRatio: string;
  photographer?: string;
  title?: string;
}

interface SlideData {
  id: string;
  title: string;
  subtitle: string;
  layout: string;
  bgImage?: string;
  content: string;
  highlights: string[];
  images?: ImageAsset[];
  audioUrl?: string;
}

const contentData = contentDataRaw as SlideData[];

const renderParagraph = (text: string, className?: string, key?: any) => {
  let cleanText = text.trim();
  if (cleanText.startsWith('_**') && cleanText.endsWith('**_')) {
    cleanText = cleanText.slice(3, -3);
  } else if (cleanText.startsWith('**') && cleanText.endsWith('**')) {
    cleanText = cleanText.slice(2, -2);
  } else if (cleanText.startsWith('_') && cleanText.endsWith('_')) {
    cleanText = cleanText.slice(1, -1);
  }
  return (
    <p key={key} className={className}>
      {cleanText}
    </p>
  );
};

// Nav clusters grouped for Scrollspy UI
const NAV_CLUSTERS = [
  { label: 'Khởi Hành', slides: ['s1'] },
  { label: 'Hồn Làng', slides: ['s2'] },
  { label: 'Hậu Chiến', slides: ['s3'] },
  { label: 'Đạo Lương', slides: ['s4'] },
  { label: 'Lòng Nhân', slides: ['s5'] },
  { label: 'Biết Đủ', slides: ['s6'] },
  { label: 'Diệu Âm', slides: ['s7'] },
  { label: 'Đình - Chùa - Thánh Thất', slides: ['s9', 's10', 's11', 's12', 's13', 's14', 's15', 's16'] }
];

// Reusable elegant responsive custom SongPlayer with live waveforms
function SongPlayer({ slide, isEditMode, setEditingPhoto, setSelectedPhoto, onUpdateAudioUrl }: { 
  slide: SlideData; 
  isEditMode: boolean; 
  setEditingPhoto: (val: any) => void;
  setSelectedPhoto: (val: any) => void;
  onUpdateAudioUrl?: (url: string) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [customTrack, setCustomTrack] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState<string>("");
  const [showUrlForm, setShowUrlForm] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const track = customTrack || slide.audioUrl || "https://assets.mixkit.co/music/preview/mixkit-traditional-oriental-meditation-101.mp3";
  const coverImage = slide.images?.[0];
  
  useEffect(() => {
    if (slide.audioUrl) {
      setInputUrl(slide.audioUrl);
    }
  }, [slide.audioUrl]);

  useEffect(() => {
    return () => {
      if (customTrack && customTrack.startsWith('blob:')) {
        URL.revokeObjectURL(customTrack);
      }
    };
  }, [customTrack]);

  // Autoplay on first user interaction to bypass modern browser blocks
  useEffect(() => {
    let playInitiated = false;
    
    const startAutoplay = () => {
      if (playInitiated) return;
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            playInitiated = true;
            cleanup();
          })
          .catch(err => {
            console.log("Autoplay block or delay, waiting for next user gesture:", err);
          });
      }
    };

    const cleanup = () => {
      window.removeEventListener('click', startAutoplay);
      window.removeEventListener('scroll', startAutoplay);
      window.removeEventListener('keydown', startAutoplay);
      window.removeEventListener('touchstart', startAutoplay);
    };

    window.addEventListener('click', startAutoplay);
    window.addEventListener('scroll', startAutoplay);
    window.addEventListener('keydown', startAutoplay);
    window.addEventListener('touchstart', startAutoplay);

    // Try starting immediately (if browser policy permits)
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          playInitiated = true;
          cleanup();
        })
        .catch(() => {
          // Normal block, wait for interaction
        });
    }

    return () => cleanup();
  }, [track]);

  const handleAudioUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (customTrack && customTrack.startsWith('blob:')) {
        URL.revokeObjectURL(customTrack);
      }
      const url = URL.createObjectURL(file);
      setCustomTrack(url);
      setCustomFileName(file.name);
      setIsPlaying(false);
      setCurrentTime(0);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
        setTimeout(() => {
          audioRef.current?.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.log("Autoplay block:", err));
        }, 150);
      }
    }
  };

  const handleUrlSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim() && onUpdateAudioUrl) {
      onUpdateAudioUrl(inputUrl.trim());
      setCustomTrack(null);
      setCustomFileName(null);
      setShowUrlForm(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Autoplay block:", e));
    }
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };
  
  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };
  
  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      audioRef.current.muted = vol === 0;
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMute = !isMuted;
      audioRef.current.muted = nextMute;
      setIsMuted(nextMute);
      if (nextMute) {
        audioRef.current.volume = 0;
      } else {
        audioRef.current.volume = volume;
      }
    }
  };
  
  const changeSpeed = () => {
    const rates = [1.0, 1.25, 1.5, 0.75];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };
  
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [track]);
  
  return (
    <div className="flex flex-col space-y-4 w-full text-slate-100">
      <audio 
        ref={audioRef}
        src={track}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Visual cover display with Vinyl disk rotation */}
      <div className="relative rounded-2xl overflow-hidden min-h-[300px] md:min-h-[400px] shadow-heritage border border-white/15 bg-black/45 p-6 flex flex-col justify-end group">
        
        {/* Cover image (editable click!) */}
        <div 
          onClick={() => {
            if (isEditMode && coverImage) {
              setEditingPhoto({ img: coverImage, slideId: slide.id });
            } else if (coverImage) {
              setSelectedPhoto(coverImage);
            }
          }}
          className={`absolute inset-0 cursor-pointer overflow-hidden z-0 ${
            isEditMode ? 'ring-2 ring-dashed ring-amber-400 ring-offset-2 ring-offset-emerald-950 m-2 rounded-xl' : ''
          }`}
        >
          {coverImage?.url ? (
            <img
              src={coverImage.url}
              alt={coverImage.description || "Song Cover"}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : ''}`}
            />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-400">
              Chưa có ảnh bìa bài hát
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-10" />
          
          {isEditMode && (
            <div className="absolute top-4 right-4 bg-amber-400 text-black font-sans font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-md shadow-lg flex items-center gap-1 z-20 animate-pulse">
              ✎ ĐỔI ẢNH BÌA BÀI HÁT
            </div>
          )}
        </div>
        
        {/* Vinyl disk decoration that spins when playing */}
        <div className="absolute right-6 top-6 w-20 h-20 md:w-28 md:h-28 rounded-full border border-white/10 shadow-2xl bg-[#111] z-20 flex items-center justify-center overflow-hidden pointer-events-none">
          <div className={`w-full h-full rounded-full border-4 border-[#222] relative flex items-center justify-center bg-[conic-gradient(#111,#333,#111,#333,#111)] ${
            isPlaying ? 'animate-spin' : ''
          }`} style={{ animationDuration: '6s' }}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-900 rounded-full border border-black flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rounded-full" />
            </div>
          </div>
        </div>

        {/* Text descriptions inside cover */}
        <div className="relative z-10 text-white space-y-2 mt-auto">
          <span className="text-[9px] font-sans px-2.5 py-0.5 rounded bg-[rgba(110,13,37,0.85)] border border-[rgba(235,178,80,0.3)] text-amber-300 uppercase tracking-widest font-semibold inline-block">
            Bản Thu Âm Điền Dã
          </span>
          <h4 className="font-charm text-xl md:text-2xl font-bold tracking-wide text-amber-200 leading-snug">
            {coverImage?.title || "Dấu Chân Thực Địa"}
          </h4>
          <p className="text-[11px] font-serif italic text-slate-100 whitespace-pre-wrap leading-relaxed opacity-95">
            {coverImage?.description || "Nhật ký thu âm điền dã của nhóm sinh viên."}
          </p>
        </div>
      </div>
      
      {/* Player Controller UI */}
      <div className="liquid-glass p-5 rounded-2xl border border-white/20 shadow-lg space-y-4">
        {/* Waveform visualizer */}
        <div className="flex items-end justify-between px-2 h-10 gap-0.5">
          {Array.from({ length: 24 }).map((_, i) => {
            const randomH = isPlaying ? (15 + (Math.sin(currentTime * (i + 1)) * 12) + (Math.random() * 8)) : 8;
            return (
              <div
                key={i}
                style={{ height: `${Math.max(4, Math.min(32, randomH))}px` }}
                className={`w-[3px] rounded-t-sm transition-all duration-150 ${isPlaying ? 'bg-amber-400' : 'bg-slate-500/50'}`}
              />
            );
          })}
        </div>

        {/* Time Progress slider */}
        <div className="space-y-1">
          <div className="relative flex items-center">
            <input 
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-amber-300 bg-white/10 h-1 rounded-lg cursor-pointer outline-none"
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-300 leading-none">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main controls row */}
        <div className="flex items-center justify-between gap-4 pt-1">
          {/* Speed Indicator */}
          <button 
            type="button"
            onClick={changeSpeed}
            className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Độ tốc phát nhạc"
          >
            {playbackRate}x speed
          </button>

          {/* PLAY/PAUSE */}
          <button 
            type="button"
            onClick={handlePlayPause}
            className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all text-sm cursor-pointer"
            title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>

          {/* Volume control */}
          <div className="flex items-center gap-1.5">
            <button 
              type="button"
              onClick={toggleMute}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Tắt tiếng"
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <input 
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-12 sm:w-16 accent-amber-300 bg-white/10 h-1 rounded cursor-pointer outline-none"
            />
          </div>
        </div>

        {/* Elegant Audio Selection and Upload controls */}
        <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/20 text-[10px] md:text-xs font-sans font-medium text-emerald-200 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex-1 justify-center">
              <span>🎧 CHỌN FILE ÂM THANH...</span>
              <input 
                type="file" 
                accept="audio/*" 
                onChange={handleAudioUpload} 
                className="hidden" 
              />
            </label>
            
            {isEditMode && onUpdateAudioUrl && (
              <button
                type="button"
                onClick={() => setShowUrlForm(!showUrlForm)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[10px] md:text-xs font-sans font-medium text-amber-300 transition-all cursor-pointer"
              >
                {showUrlForm ? "HỦY NHẬP LINK" : "SỬA LINK URL"}
              </button>
            )}
          </div>

          {customFileName && (
            <div className="text-[10px] font-mono text-center text-emerald-300 bg-emerald-950/20 py-1 rounded border border-emerald-500/10 px-2 truncate">
              ✓ Đang phát file: {customFileName}
            </div>
          )}

          {showUrlForm && isEditMode && onUpdateAudioUrl && (
            <form onSubmit={handleUrlSubmit} className="flex gap-2 items-center mt-1 pt-1 border-t border-white/5">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Dán URL âm thanh (http...)"
                className="bg-black/40 border border-white/10 rounded px-2.5 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 font-sans flex-1"
              />
              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-500 text-black font-sans font-bold text-xs px-3 py-1.5 rounded transition-all cursor-pointer"
              >
                ÁP DỤNG
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeSlide, setActiveSlide] = useState<string>('s1');
  const [selectedSlideData, setSelectedSlideData] = useState<SlideData | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<ImageAsset | null>(null);

  const [slides, setSlides] = useState<SlideData[]>(() => {
    try {
      // First check for new override format (tiny, fast, custom-safe)
      const overridesSaved = localStorage.getItem('viet_slides_overrides');
      if (overridesSaved) {
        const overrides = JSON.parse(overridesSaved);
        return contentData.map(slide => {
          const slideOverride = overrides[slide.id];
          if (slideOverride) {
            return {
              ...slide,
              audioUrl: slideOverride.audioUrl || slide.audioUrl,
              images: slide.images ? slide.images.map(img => {
                const imgOverride = slideOverride.images?.[img.key];
                if (imgOverride) {
                  return {
                    ...img,
                    ...imgOverride
                  };
                }
                return img;
              }) : slide.images
            };
          }
          return slide;
        });
      }

      // Fallback fallback: Check for legacy full slide array format
      const saved = localStorage.getItem('viet_slides_data');
      if (saved) {
        const parsed = JSON.parse(saved) as SlideData[];
        return parsed.map(slide => {
          const rawSlide = contentData.find(s => s.id === slide.id);
          if (rawSlide) {
            return {
              ...rawSlide,
              ...slide,
              images: slide.images?.map(img => {
                const rawImg = rawSlide.images?.find(i => i.key === img.key);
                if (rawImg) {
                  return {
                    ...rawImg,
                    ...img,
                    title: rawImg.title || img.title,
                    description: rawImg.description || img.description,
                    url: img.url && img.url.startsWith('data:') ? img.url : rawImg.url
                  };
                }
                return img;
              })
            };
          }
          return slide;
        });
      }
    } catch (e) {
      console.error(e);
    }
    return contentData;
  });

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingPhoto, setEditingPhoto] = useState<{ img: ImageAsset; slideId: string } | null>(null);

  const updateSlidesState = (newSlides: SlideData[]) => {
    setSlides(newSlides);
    try {
      // Build minimal overrides object containing only changed fields compared to original contentData json
      const overrides: Record<string, { 
        images: Record<string, { url?: string; title?: string; description?: string }>,
        audioUrl?: string;
      }> = {};
      
      newSlides.forEach(slide => {
        const rawSlide = contentData.find(s => s.id === slide.id);
        if (rawSlide) {
          const audioUrlChanged = slide.audioUrl !== rawSlide.audioUrl;
          if (audioUrlChanged && slide.audioUrl) {
            if (!overrides[slide.id]) {
              overrides[slide.id] = { images: {} };
            }
            overrides[slide.id].audioUrl = slide.audioUrl;
          }

          if (slide.images) {
            slide.images.forEach(img => {
              const rawImg = rawSlide.images?.find(i => i.key === img.key);
              if (rawImg) {
                const urlChanged = img.url !== rawImg.url;
                const titleChanged = img.title !== rawImg.title;
                const descChanged = img.description !== rawImg.description;
                
                if (urlChanged || titleChanged || descChanged) {
                  if (!overrides[slide.id]) {
                    overrides[slide.id] = { images: {}, audioUrl: slide.audioUrl || undefined };
                  }
                  overrides[slide.id].images[img.key] = {
                    ...(urlChanged ? { url: img.url } : {}),
                    ...(titleChanged ? { title: img.title } : {}),
                    ...(descChanged ? { description: img.description } : {}),
                  };
                }
              }
            });
          }
        }
      });

      localStorage.setItem('viet_slides_overrides', JSON.stringify(overrides));
      // Delete old key to free up precious quota
      localStorage.removeItem('viet_slides_data');
    } catch (e) {
      console.error('Error saving slides overrides:', e);
      try {
        // Clear full storage if extremely corrupted as a fail-safe
        localStorage.clear();
        // Attempt clean retry of the minimal overrides
        const overrides: Record<string, any> = {};
        newSlides.forEach(slide => {
          const rawSlide = contentData.find(s => s.id === slide.id);
          if (rawSlide) {
            const audioUrlChanged = slide.audioUrl !== rawSlide.audioUrl;
            if (audioUrlChanged && slide.audioUrl) {
              if (!overrides[slide.id]) {
                overrides[slide.id] = { images: {} };
              }
              overrides[slide.id].audioUrl = slide.audioUrl;
            }

            if (slide.images) {
              slide.images.forEach(img => {
                const rawImg = rawSlide.images?.find(i => i.key === img.key);
                if (rawImg) {
                  const urlChanged = img.url !== rawImg.url;
                  const titleChanged = img.title !== rawImg.title;
                  const descChanged = img.description !== rawImg.description;
                  if (urlChanged || titleChanged || descChanged) {
                    if (!overrides[slide.id]) {
                      overrides[slide.id] = { images: {}, audioUrl: slide.audioUrl || undefined };
                    }
                    overrides[slide.id].images[img.key] = {
                      ...(urlChanged ? { url: img.url } : {}),
                      ...(titleChanged ? { title: img.title } : {}),
                      ...(descChanged ? { description: img.description } : {}),
                    };
                  }
                }
              });
            }
          }
        });
        localStorage.setItem('viet_slides_overrides', JSON.stringify(overrides));
      } catch (innerError) {
        console.error('Secondary hard-save fail:', innerError);
      }
    }
  };

  const handleRestoreDefaultPhoto = (key: string, slideId: string) => {
    const rawSlide = contentDataRaw.find((s: any) => s.id === slideId);
    if (!rawSlide || !rawSlide.images) return;
    const rawImg = rawSlide.images.find((i: any) => i.key === key) as ImageAsset | undefined;
    if (!rawImg) return;

    const updatedSlides = slides.map(s => {
      if (s.id === slideId && s.images) {
        return {
          ...s,
          images: s.images.map(img => {
            if (img.key === key) {
              return { ...img, url: rawImg.url, title: rawImg.title, description: rawImg.description };
            }
            return img;
          })
        };
      }
      return s;
    });
    updateSlidesState(updatedSlides);
    
    if (editingPhoto && editingPhoto.img.key === key) {
      setEditingPhoto({
        img: { ...editingPhoto.img, url: rawImg.url, title: rawImg.title, description: rawImg.description },
        slideId
      });
    }
  };
  
  // Clean Web Audio API soundscape coordinator
  const [audioActive, setAudioActive] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // References for GSAP animations
  const appContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Active track indicator horizontal scroll for monument slides
  const monumentScrollRef = useRef<HTMLDivElement>(null);

  // Init soundscape with soft pentatonic bells imitating temple wind chimes
  const triggerTempleChime = () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'suspended') {
      return;
    }
    
    // Vietnamese ancient pentatonic scale (Thiếu thăng)
    // C5, D5, F5, G5, A5, C6 (Hz)
    const pentatonicScale = [523.25, 587.33, 698.46, 783.99, 880.00, 1046.50];
    const pickedFreq = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];
    
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Soft chime resonance (Triangle combined with Sine decay)
    osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(pickedFreq, ctx.currentTime);
    
    // Add sub-hum for deep resonance
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(pickedFreq / 2, ctx.currentTime);
    
    // Low pass filter for warmth
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.Q.setValueAtTime(1, ctx.currentTime);

    // Dynamic clean curve
    const duration = 2.5 + Math.random() * 2.0; // long ringing tail
    gainNode.gain.setValueAtTime(0.0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    subGain.gain.setValueAtTime(0.0, ctx.currentTime);
    subGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.1);
    subGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration - 0.5);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    subOsc.connect(gainNode);

    osc.start(ctx.currentTime);
    subOsc.start(ctx.currentTime);
    
    osc.stop(ctx.currentTime + duration);
    subOsc.stop(ctx.currentTime + duration);
  };

  const toggleAudio = async () => {
    if (!audioActive) {
      // Lazy-load audio context securely to prevent browser autoplay blocks
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      setAudioActive(true);
      // Play first chime immediately
      triggerTempleChime();
      
      // Schedule random periodic ringing (every 4-9 seconds)
      const ringCycle = () => {
        triggerTempleChime();
        const nextDelay = 4000 + Math.random() * 5000;
        audioIntervalRef.current = setTimeout(ringCycle, nextDelay);
      };
      audioIntervalRef.current = setTimeout(ringCycle, 5000);
    } else {
      if (audioIntervalRef.current) {
        clearTimeout(audioIntervalRef.current);
      }
      setAudioActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) {
        clearTimeout(audioIntervalRef.current);
      }
    };
  }, []);

  // Set up Scroll Detection (IntersectionObserver)
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -40% 0px',
      threshold: 0.1,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const slideId = entry.target.id;
          setActiveSlide(slideId);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    
    Object.values(sectionRefs.current).forEach((el) => {
      if (el && el instanceof Element) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Handle smooth navigation with GSAP
  const handleScrollTo = (slideId: string) => {
    const targetElement = sectionRefs.current[slideId];
    if (targetElement) {
      // Offset by 75px to prevent hidden content behind the fixed sticky header
      const yOffset = targetElement.getBoundingClientRect().top + window.pageYOffset - 75;
      gsap.to(window, {
        duration: 1.2,
        scrollTo: { y: yOffset, autoKill: false },
        ease: 'power3.inOut'
      });
      setActiveSlide(slideId);
    }
  };

  // GSAP spring-like stagger transition setup for elements with .fade-rise class
  useEffect(() => {
    const activeSection = sectionRefs.current[activeSlide];
    if (activeSection) {
      const fadeElements = activeSection.querySelectorAll('.fade-rise');
      if (fadeElements.length > 0) {
        gsap.killTweensOf(fadeElements);
        gsap.fromTo(fadeElements,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            stagger: 0.12,
            ease: 'power3.out',
            overwrite: 'auto'
          }
        );
      }
    }
  }, [activeSlide]);

  // Get active cluster based on active slide
  const getActiveCluster = () => {
    const found = NAV_CLUSTERS.find((cluster) => cluster.slides.includes(activeSlide));
    return found ? found.label : 'Khởi Hành';
  };

  return (
    <div ref={appContainerRef} className="min-h-screen bg-transparent text-[--color-brown-dark] font-serif selection:bg-[--color-crimson-accent] selection:text-[--color-beige-light] overflow-x-hidden relative">
      
      {/* Absolute Beautiful Seamless Boomerang Video Background Loop */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden bg-[#121a11]">
        <BoomerangVideoBg
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_131941_d136af49-e243-493a-be14-6ff3f24e09e6.mp4"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#121a11]/40 via-transparent to-[#121a11]/50 mix-blend-multiply" />
      </div>

      {/* Editorial Decorative Header */}
      <header className="fixed top-0 left-0 w-full z-40 bg-[rgba(255,255,255,0.7)] backdrop-blur-md border-b border-white/20 flex justify-between items-center px-4 md:px-12 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[--color-brown-medium] flex items-center justify-center text-[--color-beige-light] font-charm font-bold text-xl border border-[--color-gold-accent] shadow-sm">
            印
          </div>
          <div>
            <h1 className="font-charm text-xl md:text-2xl font-bold text-[--color-crimson-accent] tracking-wider leading-none">
              Dấu Ấn Tâm Linh
            </h1>
            <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-[--color-brown-medium] mt-1 font-semibold hidden md:block">
              Không gian văn hóa tinh thần Long Thành thế kỷ 21
            </p>
          </div>
        </div>

        {/* Scrollspy Nav Menu */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {NAV_CLUSTERS.map((cluster) => {
            const isClusterActive = cluster.slides.includes(activeSlide);
            return (
              <button
                key={cluster.label}
                onClick={() => handleScrollTo(cluster.slides[0])}
                className={`px-3 py-1.5 rounded-md text-[13px] font-sans transition-all duration-300 font-medium ${
                  isClusterActive
                    ? 'bg-[--color-crimson-accent] text-[--color-beige-light] shadow-heritage'
                    : 'text-[--color-brown-medium] hover:text-[--color-crimson-accent] hover:bg-[rgba(110,13,37,0.05)]'
                }`}
              >
                {cluster.label}
              </button>
            );
          })}
        </nav>

        {/* Right side interactions */}
        <div className="flex items-center gap-3">
          {/* Ambient Bell Trigger */}
          <button
            onClick={toggleAudio}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-sans font-medium transition-all duration-300 ${
              audioActive
                ? 'bg-[--color-gold-accent] text-[--color-brown-dark] border-[--color-brown-medium] spiritual-glow'
                : 'bg-transparent text-[--color-brown-medium] border-[rgba(110,13,37,0.2)] hover:border-[--color-crimson-accent]'
            }`}
            title="Kích hoạt âm thanh Phong Linh tự nhiên"
          >
            {audioActive ? (
              <>
                <Volume2 size={15} className="text-[--color-crimson-accent] animate-bounce" />
                <span className="hidden sm:inline">Chuông Chánh Niệm: Bật</span>
              </>
            ) : (
              <>
                <VolumeX size={15} />
                <span className="hidden sm:inline">Chuông Chánh Niệm: Tắt</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Mobiles Secondary Navigation Row */}
      <div className="lg:hidden fixed top-[64px] left-0 w-full z-30 bg-white/75 backdrop-blur-md border-b border-black/10 px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none">
        {NAV_CLUSTERS.map((cluster) => {
          const isClusterActive = cluster.slides.includes(activeSlide);
          return (
            <button
              key={cluster.label}
              onClick={() => handleScrollTo(cluster.slides[0])}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-sans whitespace-nowrap transition-all ${
                isClusterActive
                  ? 'bg-[--color-crimson-accent] text-white'
                  : 'bg-black/5 text-[--color-brown-medium]'
              }`}
            >
              {cluster.label}
            </button>
          );
        })}
      </div>

      {/* Floating Interactive Map / Index Side HUD */}
      <div className="fixed right-6 bottom-8 z-30 hidden xl:flex flex-col items-center gap-3 bg-white/80 backdrop-blur-md p-3.5 rounded-full border border-white/40 shadow-heritage">
        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[--color-crimson-accent]">
          Hành Trình
        </span>
        <div className="h-44 w-[2px] bg-[rgba(110,13,37,0.1)] relative">
          <div
            className="absolute top-0 left-0 w-full bg-[--color-crimson-accent] transition-all duration-300"
            style={{
              height: `${(slides.findIndex((s) => s.id === activeSlide) / (slides.length - 1)) * 100}%`,
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          {slides.map((slide, index) => {
            const isActive = slide.id === activeSlide;
            return (
              <button
                key={slide.id}
                onClick={() => handleScrollTo(slide.id)}
                className={`w-3 h-3 rounded-full border transition-all ${
                  isActive
                    ? 'bg-[--color-crimson-accent] border-[--color-crimson-accent] scale-125'
                    : 'bg-transparent border-[rgba(110,13,37,0.4)] hover:border-[--color-crimson-accent]'
                }`}
                title={`${index + 1}. ${slide.title}`}
              />
            );
          })}
        </div>
      </div>

      {/* ==================== EXHIBITION SLIDES ==================== */}
      <main className="pt-24 lg:pt-20">
        
        {slides.map((slide, idx) => {
          const isHero = slide.layout === 'hero';
          const isHeroLeft = slide.layout === 'hero_text_left';
          const isBento = slide.layout === 'bento';
          const isSplit = slide.layout === 'split';
          const isSplitRev = slide.layout === 'split_reverse';
          const isHorizontalRow = slide.layout === 'horizontal_row';
          const isHorizontalRowShrine = slide.layout === 'horizontal_row_shrine';
          const isBentoHeritage = slide.layout === 'bento_heritage';
          const isBentoArch = slide.layout === 'bento_architectural';
          const isMosaic = slide.layout === 'mosaic';
          const isHeroEnd = slide.layout === 'hero_end';
          const isSplitAudio = slide.layout === 'split_audio';

          return (
            <section
              key={slide.id}
              id={slide.id}
              ref={(el) => {
                sectionRefs.current[slide.id] = el;
              }}
              className="min-h-screen py-16 md:py-24 px-4 md:px-12 flex flex-col justify-center border-b border-[rgba(110,13,37,0.07)] relative overflow-hidden"
              style={{ contentVisibility: isSplitAudio ? 'visible' : 'auto' }}
            >
              
              {/* Subtle background calligraphy block or watermarks to increase expensive heritage feel */}
              <div className="absolute right-4 top-1/4 select-none pointer-events-none opacity-[0.03] font-charm text-[16vw] font-bold text-[--color-brown-medium]">
                {idx + 1}
              </div>

              {/* -------------------- 1. HERO LAYOUT -------------------- */}
              {isHero && (
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
                  <div className="lg:col-span-12 text-center max-w-4xl mx-auto">
                    <motion.span 
                      initial={{ opacity: 0, y: -20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className={`font-sans text-xs uppercase tracking-[0.3em] font-bold px-3 py-1 rounded-full inline-block mb-3 ${
                        slide.id === 's1' 
                          ? 'text-[#000000] bg-[#c5dcd2]' 
                          : 'text-[--color-crimson-accent] bg-[rgba(110,13,37,0.06)]'
                      }`}
                    >
                      GIỚI THIỆU • Chương I
                    </motion.span>
                    
                    <motion.h2 
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className="font-charm text-4xl md:text-7xl font-bold text-white mt-2 mb-6 tracking-wide leading-tight"
                    >
                      {slide.title}
                    </motion.h2>
                    
                    <motion.p 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      className="font-serif text-lg md:text-2xl italic text-[#cde5d9] mb-8 font-medium leading-relaxed"
                    >
                      “{slide.subtitle}”
                    </motion.p>
                  </div>

                  <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
                    <motion.div 
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="liquid-glass p-6 rounded-2xl shadow-heritage fade-rise"
                    >
                      {slide.content.split('\n\n').map((para, pIdx) => (
                        <p key={pIdx} className="text-base md:text-lg text-[--color-brown-dark] leading-relaxed mb-4">
                          {para}
                        </p>
                      ))}
                    </motion.div>
                  </div>

                  {/* S1 Landscape Hero Graphics overlay with filters specified by style guide */}
                  <div className="lg:col-span-6 relative">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98, rotate: -1 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className="rounded-2xl overflow-hidden shadow-heritage border border-[--color-gold-accent] p-2 liquid-glass relative group fade-rise"
                    >
                      <div className="h-[280px] md:h-[400px] overflow-hidden rounded-xl relative">
                        <img
                          src={slide.images?.[0]?.url}
                          alt={slide.images?.[0]?.description}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover grayscale-[20%] sepia-[15%] transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-85" />
                        <div className="absolute bottom-4 left-4 right-4 text-white p-2">
                          <p className="text-xs font-sans flex items-center gap-2 opacity-90 mb-1">
                            <Camera size={14} className="text-[--color-gold-accent]" />
                            <span>{slide.images?.[0]?.photographer || "Ảnh: Nguyễn Kim Thủy Tiên (2026)"}</span>
                          </p>
                          <p className="text-xs md:text-sm font-serif italic text-white/95">
                            {slide.images?.[0]?.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Stylized vintage layout corners */}
                      <div className="absolute top-4 left-4 w-5 h-5 border-t border-l border-[--color-gold-accent]/60" />
                      <div className="absolute top-4 right-4 w-5 h-5 border-t border-r border-[--color-gold-accent]/60" />
                      <div className="absolute bottom-4 left-4 w-5 h-5 border-b border-l border-[--color-gold-accent]/60" />
                      <div className="absolute bottom-4 right-4 w-5 h-5 border-b border-r border-[--color-gold-accent]/60" />
                    </motion.div>
                  </div>

                  <div className="lg:col-span-12 mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {slide.highlights.map((hlt, hIdx) => {
                      const linesList = hlt.split('\n');
                      const hasTitle = linesList.length > 1;
                      return (
                        <motion.div
                          key={hIdx}
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 * hIdx }}
                          className="liquid-glass-dark text-[--color-beige-light] p-5 rounded-xl border border-white/10 shadow-heritage flex flex-col justify-between fade-rise"
                        >
                          {hasTitle ? (
                            <div className="space-y-2">
                              <h4 className={`font-charm text-xl md:text-2xl font-bold leading-snug ${slide.id === 's1' ? 'text-white' : 'text-[--color-gold-accent]'}`}>
                                {linesList[0]}
                              </h4>
                              <p className="text-xs md:text-sm leading-relaxed text-slate-200 font-serif whitespace-pre-wrap">
                                {linesList.slice(1).join('\n')}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm md:text-base leading-relaxed text-slate-100 font-serif whitespace-pre-wrap">
                              {hlt}
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* -------------------- 2. BENTO GRID LAYOUT (S2) -------------------- */}
              {isBento && (
                <div className="max-w-7xl mx-auto w-full z-10 flex flex-col gap-8">
                  <div className="text-center md:text-left max-w-3xl">
                    <span 
                      className="text-[--color-crimson-accent] font-sans text-xs uppercase tracking-[0.3em] font-bold"
                      style={slide.id === 's2' ? { color: '#f2ffa4' } : undefined}
                    >
                      KÝ ỨC ĐIỀN DÃ • Chương II
                    </span>
                    <h2 className={`font-charm text-4xl md:text-6xl font-bold mt-2 mb-3 ${slide.id === 's2' ? 'text-white' : 'text-[--color-crimson-accent]'}`}>
                      {slide.title}
                    </h2>
                    <p className="font-sans text-sm md:text-base text-[--color-brown-medium] tracking-wide font-medium">
                      {slide.subtitle}
                    </p>
                  </div>

                  {/* Bento Grid Architecture */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Big Narrative Text Box */}
                    <div className="lg:col-span-7 liquid-glass-dark text-[--color-beige-light] p-6 md:p-8 rounded-2xl border border-white/10 shadow-heritage flex flex-col justify-between fade-rise">
                      <div>
                        <div className="space-y-4 font-serif text-sm md:text-base leading-relaxed text-slate-100">
                          {slide.content.split('\n\n').map((para, paraIdx) => (
                            renderParagraph(para, undefined, paraIdx)
                          ))}
                        </div>
                      </div>
                      <div className="mt-8 pt-4 border-t border-[rgba(220,171,107,0.2)] flex justify-between items-center">
                        <button
                          onClick={() => setSelectedSlideData(slide)}
                          className="px-4 py-2 bg-[--color-crimson-accent] text-white rounded-lg text-xs font-sans font-medium flex items-center gap-2 hover:bg-[#851631] transition-all"
                        >
                          <BookOpen size={14} /> Read Full Essay
                        </button>
                        <span 
                          className="text-[10px] uppercase font-sans tracking-widest text-[--color-gold-accent]"
                          style={slide.id === 's2' ? { color: '#f2ffa4' } : undefined}
                        >
                          Long Thành Đô Thị Hóa
                        </span>
                      </div>
                    </div>

                    {/* Bento Satellite Images Grid */}
                    <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                      {slide.images?.map((img, iIdx) => (
                        <div
                          key={img.key}
                          onClick={() => setSelectedPhoto(img)}
                          className="relative cursor-pointer group liquid-glass p-1.5 rounded-xl shadow-sm border border-white/10 overflow-hidden transition-all duration-300 hover:scale-[1.02] fade-rise"
                        >
                          <div className="aspect-square overflow-hidden rounded-lg">
                            <img
                              src={img.url}
                              alt={img.description}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover grayscale-[30%] sepia-[10%] group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
                              <p className="text-[9px] font-sans text-[--color-gold-accent] select-none uppercase tracking-wider font-semibold">
                                {img.title || img.key.replace('.jpg', '').replace(/_/g, ' ')}
                              </p>
                              <p className="text-[10px] font-serif italic line-clamp-none opacity-90 mt-0.5">
                                {img.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Highlights Rows */}
                    {slide.id !== 's2' && (
                      <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-2">
                        {slide.highlights.map((hlt, hIdx) => (
                          <div
                            key={hIdx}
                            className="liquid-glass p-4 rounded-xl border border-white/20 shadow-sm hover:border-[--color-crimson-accent] transition-colors fade-rise"
                          >
                            <div className="w-5 h-5 rounded-full bg-[rgba(110,13,37,0.06)] flex items-center justify-center text-xs font-sans font-bold text-[--color-crimson-accent] mb-2">
                              {hIdx + 1}
                            </div>
                            <p className="text-xs text-[--color-brown-dark] font-serif leading-relaxed">
                              {hlt}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* -------------------- 3. SPLIT WORKSPACE SIDEBARS (S3, S4, S7, S8) -------------------- */}
              {(isSplit || isSplitRev) && (
                <div className="max-w-7xl mx-auto w-full z-10">
                  <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch ${isSplitRev ? 'lg:flex-row-reverse' : ''}`}>
                    
                    {/* Media representation - PORTRAIT / BACKGROUND CARD */}
                    <div className={`lg:col-span-5 flex flex-col justify-center ${isSplitRev ? 'lg:order-last' : 'lg:order-first'}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="liquid-glass p-3.5 rounded-2xl border border-white/20 shadow-heritage relative fade-rise"
                      >
                        <div className="relative rounded-xl overflow-hidden min-h-[300px] md:min-h-[480px]">
                          <img
                            src={slide.images?.[0]?.url}
                            alt={slide.images?.[0]?.description}
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover grayscale-[15%] sepia-[5%]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                            {!slide.images?.[0]?.title && slide.id !== 's7' && slide.id !== 's13' && (
                              <span className="text-[10px] font-sans px-2 py-0.5 rounded-md bg-[--color-crimson-accent] uppercase tracking-widest font-semibold inline-block">
                                Ảnh Chân Dung Nhân Vật
                              </span>
                            )}
                            <h4 className="font-charm text-xl md:text-2xl font-bold tracking-wide text-[--color-gold-accent] leading-snug">
                              {slide.images?.[0]?.title || slide.title}
                            </h4>
                            <p className="text-xs font-serif italic text-white/90 whitespace-pre-wrap leading-relaxed">
                              {slide.images?.[0]?.title ? slide.images[0].description : (slide.images?.[0]?.description ? `“${slide.images[0].description}”` : '')}
                            </p>
                          </div>
                        </div>

                        {/* Extra tiny sub bento indicators inside photo */}
                        {slide.images && slide.images.length > 1 && (
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {slide.images.slice(1).map((subImg) => (
                              <div
                                key={subImg.key}
                                onClick={() => setSelectedPhoto(subImg)}
                                className="cursor-pointer overflow-hidden rounded-lg relative h-16 group"
                              >
                                <img
                                  src={subImg.url}
                                  alt={subImg.description}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Maximize2 size={14} className="text-white" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Clean deep narrative scrolled container */}
                    <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                      <div>
                        <span 
                          className="text-[--color-crimson-accent] font-sans text-xs uppercase tracking-[0.3em] font-bold"
                          style={["s3", "s4", "s7", "s13", "s15"].includes(slide.id) ? { color: '#ffffff' } : undefined}
                        >
                          Ký Thác Điền Dã • Chân Dung Nhân Vật
                        </span>
                        <h3 
                          className="font-charm text-3xl md:text-5xl font-bold text-[--color-crimson-accent] mt-2 mb-4"
                          style={["s3", "s4", "s7", "s13", "s15"].includes(slide.id) ? { color: '#ffffff' } : undefined}
                        >
                          {slide.title}
                        </h3>
                        <p 
                          className="font-sans text-sm md:text-base font-semibold italic text-[--color-brown-medium] mb-6"
                          style={["s3", "s4", "s7", "s13", "s15"].includes(slide.id) ? { color: '#ffffff' } : undefined}
                        >
                          {slide.subtitle}
                        </p>

                        <div className="liquid-glass p-5 rounded-xl border border-white/20 space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[--color-brown-medium] scrollbar-track-transparent fade-rise">
                          {slide.content.split('\n\n').map((para, pIdx) => {
                            if (slide.id === 's13') {
                              if (pIdx === 0) {
                                return (
                                  <p key={pIdx} className="font-serif font-bold text-base md:text-[18px] text-[--color-crimson-accent] mb-4 border-b border-[rgba(110,13,37,0.06)] pb-3">
                                    {para}
                                  </p>
                                );
                              }

                              const lines = para.split('\n');
                              if (lines.length > 1) {
                                const firstLine = lines[0].trim();
                                const isNumberedHeader = firstLine.match(/^\d+\./);
                                const otherLines = lines.slice(1);

                                if (isNumberedHeader) {
                                  return (
                                    <div key={pIdx} className="mt-4 pt-3 border-t border-[rgba(110,13,37,0.08)] space-y-2 first:pt-0 first:border-0 pb-1">
                                      <h4 className="text-base md:text-lg font-serif font-bold text-[--color-crimson-accent]">
                                        {firstLine}
                                      </h4>
                                      {otherLines.map((line, lIdx) => {
                                        const cleanLine = line.trim();
                                        if (cleanLine.startsWith('- ')) {
                                          const itemParts = cleanLine.slice(2).split(':');
                                          if (itemParts.length > 1) {
                                            return (
                                              <p key={lIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif pl-3 flex items-start gap-1">
                                                <span className="text-[--color-crimson-accent] font-bold mt-1 pl-1 flex-shrink-0">•</span>
                                                <span>
                                                  <strong className="font-bold text-[--color-crimson-accent]">{itemParts[0]}:</strong>
                                                  {itemParts.slice(1).join(':')}
                                                </span>
                                              </p>
                                            );
                                          }
                                          return (
                                            <p key={lIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif pl-3 flex items-start gap-1">
                                              <span className="text-[--color-crimson-accent] font-bold mt-1 pl-1 flex-shrink-0">•</span>
                                              <span>{cleanLine.slice(2)}</span>
                                            </p>
                                          );
                                        }
                                        return (
                                          <p key={lIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif">
                                            {line}
                                          </p>
                                        );
                                      })}
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div key={pIdx} className="mt-4 pt-3 border-t border-[rgba(110,13,37,0.08)] space-y-2 first:pt-0 first:border-0 pb-1">
                                      <p className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif font-bold text-[--color-crimson-accent]">
                                        {firstLine}
                                      </p>
                                      {otherLines.map((line, lIdx) => {
                                        const cleanLine = line.trim();
                                        if (cleanLine.startsWith('- ')) {
                                          const itemParts = cleanLine.slice(2).split(':');
                                          if (itemParts.length > 1) {
                                            return (
                                              <p key={lIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif pl-3 flex items-start gap-1">
                                                <span className="text-[--color-crimson-accent] font-bold mt-1 pl-1 flex-shrink-0">•</span>
                                                <span>
                                                  <strong className="font-bold text-[--color-crimson-accent]">{itemParts[0]}:</strong>
                                                  {itemParts.slice(1).join(':')}
                                                </span>
                                              </p>
                                            );
                                          }
                                          return (
                                            <p key={lIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif pl-3 flex items-start gap-1">
                                              <span className="text-[--color-crimson-accent] font-bold mt-1 pl-1 flex-shrink-0">•</span>
                                              <span>{cleanLine.slice(2)}</span>
                                            </p>
                                          );
                                        }
                                        return (
                                          <p key={lIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif">
                                            {line}
                                          </p>
                                        );
                                      })}
                                    </div>
                                  );
                                }
                              }

                              const colonIdx = para.indexOf(':');
                              if (colonIdx > 0 && colonIdx < 40) {
                                const head = para.slice(0, colonIdx + 1).trim();
                                const body = para.slice(colonIdx + 1).trim();
                                return (
                                  <div key={pIdx} className="mt-3 first:mt-0">
                                    <p className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif">
                                      <strong className="font-serif font-bold text-[--color-crimson-accent] block mb-1">{head}</strong>
                                      {body}
                                    </p>
                                  </div>
                                );
                              }

                              return (
                                <p key={pIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif">
                                  {para}
                                </p>
                              );
                            }

                            return (
                              <p key={pIdx} className="text-sm md:text-base text-[--color-brown-dark] leading-relaxed font-serif">
                                {para}
                              </p>
                            );
                          })}
                        </div>
                      </div>

                      {/* Display of bullet point key highlights */}
                      <div className="space-y-3 liquid-glass-dark p-5 rounded-2xl border border-white/10 fade-rise">
                        <h5 
                          className="font-sans text-[10px] uppercase tracking-widest text-[--color-gold-accent] font-semibold flex items-center gap-1.5"
                          style={["s3", "s4", "s7"].includes(slide.id) ? { color: '#f2ffa4' } : slide.id === 's13' ? { color: '#fff695' } : slide.id === 's15' ? { color: '#fffe76', fontSize: '12px' } : undefined}
                        >
                          <Activity size={14} /> Điểm Ghi Nhận Nhân Học Cốt Lõi
                        </h5>
                        <ul className="space-y-2">
                          {slide.highlights.map((hlt, hIdx) => (
                            <li key={hIdx} className="flex gap-2 text-xs md:text-sm text-white font-serif leading-relaxed items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-[--color-gold-accent] mt-2 flex-shrink-0" />
                              <span>{hlt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedSlideData(slide)}
                          className="px-5 py-2.5 bg-[--color-crimson-accent] text-white font-sans text-xs font-bold rounded-lg hover:bg-opacity-90 flex items-center gap-2 tracking-wider transition-all"
                          style={slide.id === 's13' ? { color: '#fff695' } : slide.id === 's15' ? { color: '#ffed6e' } : undefined}
                        >
                          <BookOpen size={14} /> XEM ĐẦY ĐỦ BÀI GHI CHÉP
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* -------------------- 9. SPLIT AUDIO PLAYBACK LAYOUT (S16) -------------------- */}
              {isSplitAudio && (
                <div className="max-w-7xl mx-auto w-full z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch lg:flex-row-reverse">
                    
                    {/* Media representation (Audio Player Cover + Tracks) */}
                    <div className="lg:col-span-5 flex flex-col justify-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="fade-rise"
                      >
                        <SongPlayer 
                          slide={slide} 
                          isEditMode={isEditMode} 
                          setEditingPhoto={setEditingPhoto} 
                          setSelectedPhoto={setSelectedPhoto} 
                          onUpdateAudioUrl={(newUrl) => {
                            const updatedSlides = slides.map(s => {
                              if (s.id === slide.id) {
                                return { ...s, audioUrl: newUrl };
                              }
                              return s;
                            });
                            updateSlidesState(updatedSlides);
                          }}
                        />
                      </motion.div>
                    </div>

                    {/* Content Narrative */}
                    <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                      <div>
                        <span 
                          className="text-[--color-crimson-accent] font-sans text-xs uppercase tracking-[0.3em] font-bold"
                          style={{ color: '#ffffff' }}
                        >
                          Âm Nhạc Điền Dã • Kỷ Niệm Nghiên Cứu
                        </span>
                        <h2 
                          className="font-charm text-3xl md:text-5xl font-bold text-[--color-crimson-accent] mt-2 mb-4"
                          style={{ color: '#ffffff' }}
                        >
                          {slide.title}
                        </h2>
                        <p 
                          className="font-sans text-sm md:text-base font-semibold italic text-[--color-brown-medium] mb-6"
                          style={{ color: '#ffffff' }}
                        >
                          {slide.subtitle}
                        </p>

                        <div className="liquid-glass p-6 rounded-xl border border-white/20 space-y-4 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[--color-brown-medium] scrollbar-track-transparent fade-rise">
                          {slide.content.split('\n\n').map((para, pIdx) => {
                            const parts = para.split(/(\*\*".+?"\*\*|\*\*'.+?'\*\*|\*\*.+?\*\*)/g);
                            return (
                              <p key={pIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif">
                                {parts.map((part, idx) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return (
                                      <strong key={idx} className="font-bold text-[--color-crimson-accent] block border-l-2 border-[--color-crimson-accent] pl-3 py-1 my-2 bg-rose-50/15 italic">
                                        {part.slice(2, -2)}
                                      </strong>
                                    );
                                  }
                                  return part;
                                })}
                              </p>
                            );
                          })}
                        </div>
                      </div>

                      {/* Highlights lists */}
                      <div className="space-y-3 liquid-glass-dark p-5 rounded-2xl border border-white/10 fade-rise">
                        <h5 
                          className="font-sans text-[10px] uppercase tracking-widest text-[--color-gold-accent] font-semibold flex items-center gap-1.5"
                          style={{ color: '#fffe76', fontSize: '12px' }}
                        >
                          <Activity size={14} /> Điểm Nhấn Thông Điệp Âm Nhạc
                        </h5>
                        <ul className="space-y-2">
                          {slide.highlights.map((hlt, hIdx) => (
                            <li key={hIdx} className="flex gap-2 text-xs md:text-sm text-white font-serif leading-relaxed items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-[--color-gold-accent] mt-2 flex-shrink-0" />
                              <span>{hlt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedSlideData(slide)}
                          className="px-5 py-2.5 bg-[--color-crimson-accent] text-white font-sans text-xs font-bold rounded-lg hover:bg-opacity-90 flex items-center gap-2 tracking-wider transition-all"
                          style={{ color: '#ffed6e' }}
                        >
                          <BookOpen size={14} /> HIỂN THỊ CHI TIẾT TÁC PHẨM
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* -------------------- 4. HERO COZY TEXT LEFT (S5) -------------------- */}
              {isHeroLeft && (
                <div className="max-w-7xl mx-auto w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 flex flex-col space-y-6">
                    <span className="text-[--color-crimson-accent] font-sans text-xs uppercase tracking-[0.3em] font-bold self-start px-2 py-0.5 rounded bg-white/60">
                      Gia Huấn Trầm Tĩnh
                    </span>
                    <h2 
                      className="font-charm text-4xl md:text-6xl font-bold text-[--color-crimson-accent] tracking-wide"
                      style={slide.id === 's5' ? { color: '#ffffff' } : undefined}
                    >
                      {slide.title}
                    </h2>
                    <p 
                      className="font-sans text-base italic text-[--color-brown-medium]"
                      style={slide.id === 's5' ? { color: '#ffffff' } : undefined}
                    >
                      “{slide.subtitle}”
                    </p>
                    
                    <div className="liquid-glass p-6 md:p-8 rounded-2xl shadow-heritage border border-white/20 fade-rise">
                      {slide.content.split('\n\n').map((para, pIdx) => (
                        <p key={pIdx} className="text-base md:text-lg text-[--color-brown-dark] leading-relaxed font-serif mb-4 last:mb-0">
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-4 justify-center flex">
                    <div className="liquid-glass-dark p-5 rounded-2xl border border-white/10 text-[--color-beige-light] space-y-4 max-w-sm fade-rise">
                      <div className="min-h-[250px] md:h-72 rounded-xl overflow-hidden relative border border-[--color-gold-accent]/40">
                        <img
                          src={slide.images?.[0]?.url}
                          alt={slide.images?.[0]?.description}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                        <span className="absolute bottom-3 left-3 right-3 text-[10px] font-sans text-white font-medium flex flex-col gap-1 leading-normal">
                          {slide.images?.[0]?.title ? (
                            <>
                              <span className="font-bold text-white block">
                                {slide.images[0].title}
                              </span>
                              <span className="text-white/90 whitespace-pre-wrap block">
                                {slide.images[0].description}
                              </span>
                            </>
                          ) : (
                            <span className="text-[--color-gold-accent] font-semibold flex items-center gap-1">
                              <User size={12} /> Chú Trần Văn Thiện
                            </span>
                          )}
                        </span>
                      </div>
                      <h4 
                        className="font-charm text-xl font-bold tracking-wider text-[--color-gold-accent]"
                        style={slide.id === 's5' ? { color: '#f2ffa4' } : undefined}
                      >
                        Đời Cán Bộ Gieo Nhân Lành
                      </h4>
                      <ol className="space-y-3.5 text-xs text-slate-100">
                        {slide.highlights.map((hlt, idx) => (
                          <li key={idx} className="flex gap-2 items-start font-serif">
                            <span className="w-5 h-5 rounded-full bg-[--color-crimson-accent] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{hlt}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------- 5. ADAPTIVE SHOWCASE HORIZONTAL (S6, S11) -------------------- */}
              {(isHorizontalRow || isHorizontalRowShrine) && (
                <div className="max-w-7xl mx-auto w-full z-10 flex flex-col gap-6">
                  <div>
                    {!isHorizontalRowShrine && (
                      <span 
                        className="text-[--color-crimson-accent] font-sans text-xs uppercase tracking-[0.3em] font-bold"
                        style={slide.id === 's6' ? { color: '#ffffff' } : undefined}
                      >
                        Hồ Sơ Ảnh Điền Dã Chuyển Động
                      </span>
                    )}
                    <h2 
                      className="font-charm text-3xl md:text-5xl font-bold text-[--color-crimson-accent] mt-1 mb-2"
                      style={["s6", "s11"].includes(slide.id) ? { color: '#ffffff' } : undefined}
                    >
                      {slide.title}
                    </h2>
                    <p 
                      className="font-sans text-xs md:text-sm text-[--color-brown-medium] tracking-wide max-w-3xl"
                      style={["s6", "s11"].includes(slide.id) ? { color: '#ffffff' } : undefined}
                    >
                      {slide.subtitle}
                    </p>
                  </div>

                  {/* Horizontal Scroll Images Set */}
                  <div className="relative">
                    <div 
                      ref={monumentScrollRef}
                      className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth select-none scrollbar-thin scrollbar-thumb-[--color-brown-medium] scrollbar-track-transparent"
                    >
                      {slide.images?.map((img, iIdx) => (
                        <div
                          key={img.key}
                          onClick={() => setSelectedPhoto(img)}
                          className="flex-shrink-0 w-[240px] md:w-[320px] snap-start liquid-glass p-2.5 rounded-xl border border-white/20 shadow-sm cursor-pointer hover:border-[--color-crimson-accent] transition-all hover:-translate-y-1 block fade-rise"
                        >
                          <div className="aspect-[4/3] rounded-lg overflow-hidden relative bg-slate-100">
                            <img
                              src={img.url}
                              alt={img.description}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover grayscale-[15%] sepia-[5%]"
                            />
                            <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/75 backdrop-blur-sm text-[8px] font-mono text-white tracking-widest uppercase rounded">
                              Ảnh {iIdx + 1}
                            </span>
                          </div>
                          <div className="mt-2.5 text-center px-1">
                            <p className={`text-[10px] font-sans font-bold uppercase tracking-wider ${
                              slide.id === 's6' ? 'text-white' : 'text-[--color-crimson-accent]'
                            }`}>
                              {img.title || img.key.replace('.jpg', '').replace(/_/g, ' ')}
                            </p>
                            <p className={`text-[11px] font-serif italic mt-1 whitespace-pre-wrap ${
                              slide.id === 's6' ? 'text-white/90 font-medium' : 'text-[--color-brown-dark]'
                            }`}>
                              {img.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Visual hints for scrolling */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none bg-gradient-to-l from-[--color-beige-light] to-transparent w-12 h-full hidden md:block" />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none bg-gradient-to-r from-[--color-beige-light] to-transparent w-12 h-full hidden md:block" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
                    <div className="lg:col-span-8 liquid-glass p-5 rounded-2xl border border-white/20 fade-rise">
                      <h4 className="font-charm text-2xl font-bold text-[--color-crimson-accent] mb-3">
                        Ghi chép từ bàn điền dã
                      </h4>
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-[--color-brown-medium] scrollbar-track-transparent">
                        {slide.content.split('\n\n').map((para, pIdx) => {
                          const isHeading = para.endsWith(':') || para.startsWith('Không gian thờ tự') || para.startsWith('Cuộc trò chuyện với người dân địa phương');
                          const isSpecialParagraph = slide.id === 's6' && pIdx === 4;
                          return (
                            <p
                              key={pIdx}
                              className={isHeading 
                                ? 'text-lg font-charm font-bold text-[--color-crimson-accent] mt-6 mb-2 pt-2 border-t border-[rgba(110,13,37,0.06)]' 
                                : isSpecialParagraph
                                  ? 'text-[14px] text-[--color-brown-dark] leading-relaxed font-serif'
                                  : 'text-sm md:text-base text-[--color-brown-dark] leading-relaxed font-serif'
                              }
                              style={
                                isSpecialParagraph 
                                  ? { fontFamily: '"Source Serif 4", serif', fontWeight: 'normal', fontSize: '14px' } 
                                  : (slide.id === 's6' && pIdx === 3)
                                    ? { fontSize: '22px' }
                                    : undefined
                              }
                            >
                              {isHeading ? para.replace(':', '') : para}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                    <div className="lg:col-span-4 liquid-glass-dark text-[--color-beige-light] p-5 rounded-2xl border border-white/10 flex flex-col justify-between fade-rise">
                      <div>
                        <h4 
                          className="font-sans text-[10px] uppercase tracking-wider text-[--color-gold-accent] font-bold mb-3 flex items-center gap-1"
                          style={slide.id === 's6' ? { color: '#f2ffa4' } : slide.id === 's11' ? { color: '#fff695' } : undefined}
                        >
                          <Activity size={14} /> Điểm cốt lõi quan tâm
                        </h4>
                        <ol className="space-y-2">
                          {slide.highlights.map((hlt, hIdx) => (
                            <li key={hIdx} className="text-xs font-serif leading-relaxed text-slate-100 flex gap-1.5">
                              <span className="text-[--color-gold-accent] font-bold">{hIdx + 1}.</span>
                              <span>{hlt}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <button
                        onClick={() => setSelectedSlideData(slide)}
                        className="mt-4 w-full py-2 bg-[--color-crimson-accent] text-[11px] font-sans font-bold uppercase tracking-wider text-white rounded-lg hover:bg-opacity-90"
                        style={slide.id === 's11' ? { color: '#fff695' } : undefined}
                      >
                        ĐỌC CHI TIẾT TƯ LIỆU DẠO
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* -------------------- 6. BENTO HIERARCHY ARCHITECTURAL (S9, S12) -------------------- */}
              {(isBentoHeritage || isBentoArch) && (
                <div className="max-w-7xl mx-auto w-full z-10 flex flex-col gap-6">
                  <div className="text-center md:text-left">
                    <span 
                      className="text-[--color-crimson-accent] font-sans text-xs uppercase tracking-[0.3em] font-bold"
                      style={["s9", "s12"].includes(slide.id) ? { color: '#ffffff' } : undefined}
                    >
                      Bản đồ văn hóa ● Chương III
                    </span>
                    <h2 
                      className="font-charm text-3xl md:text-5xl font-bold text-[--color-crimson-accent] mt-1 mb-2"
                      style={["s9", "s12"].includes(slide.id) ? { color: '#ffffff' } : undefined}
                    >
                      {slide.title}
                    </h2>
                    <p 
                      className="font-sans text-xs md:text-sm text-[--color-brown-medium] tracking-wide"
                      style={["s9", "s12"].includes(slide.id) ? { color: '#ffffff' } : undefined}
                    >
                      {slide.subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Big details text left */}
                    <div className={`${isBentoArch ? 'lg:col-span-12' : 'lg:col-span-5'} liquid-glass p-6 md:p-8 rounded-2xl border border-white/20 shadow-heritage flex flex-col justify-between fade-rise`}>
                      <div className="space-y-4">
                        <div className="flex items-center gap-1.5 text-xs font-sans text-[--color-crimson-accent] font-bold">
                          <Compass size={16} /> {isBentoArch ? 'Ghi nhận đặc trưng tinh thần' : 'Ghi nhận đặc trưng kiến trúc'}
                        </div>
                        <div className="max-h-[500px] overflow-y-auto pr-3 space-y-4 scrollbar-thin scrollbar-thumb-[--color-brown-medium] scrollbar-track-transparent">
                          {slide.content.split('\n\n').map((para, pIdx) => {
                            // Focus-mode target matching
                            if (slide.id === 's12') {
                              if (pIdx === 0) {
                                // CSS 4: font-family: Charm; font-size: 21px; font-weight: bold; to style the main heritage title nicely.
                                return (
                                  <p key={pIdx} className="font-charm text-[21px] font-bold text-[--color-crimson-accent] mb-4">
                                    {para}
                                  </p>
                                );
                              }

                              const parts = para.split('\n');
                              if (parts.length > 1) {
                                const titleLine = parts[0].trim();
                                const bodyLines = parts.slice(1).join('\n').trim();

                                const isSubHeading = 
                                  titleLine === 'Giới thiệu' ||
                                  titleLine.startsWith('Kiến trúc') ||
                                  titleLine.startsWith('Hoạt động') ||
                                  titleLine.startsWith('Đời sống') ||
                                  titleLine.endsWith(':');

                                if (isSubHeading) {
                                  // CSS 1 and CSS 3 target subheading content elements:
                                  // Content should render with standard Source Serif 4 (font-serif), normal weight, size 14px.
                                  return (
                                    <div key={pIdx} className="mt-6 pt-4 border-t border-[rgba(110,13,37,0.06)] space-y-2 first:pt-0 first:border-0">
                                      <h4 className="text-base md:text-lg font-serif font-bold text-[--color-crimson-accent]">
                                        {titleLine.replace(':', '')}
                                      </h4>
                                      <p className="text-[14px] md:text-base font-normal leading-relaxed text-[--color-brown-dark] font-serif">
                                        {bodyLines}
                                      </p>
                                    </div>
                                  );
                                }
                              }
                            }

                            const isHeading = 
                              para.startsWith('Không gian chùa:') || 
                              para.startsWith('Phật từ tâm:') ||
                              para.startsWith('Giới thiệu') ||
                              para.startsWith('Kiến trúc và không gian thờ tự') ||
                              para.startsWith('Hoạt động tín ngưỡng và đời sống văn hóa tinh thần') ||
                              para.startsWith('Đời sống văn hóa tinh thần qua tín ngưỡng thờ') ||
                              para.startsWith('DI TÍCH LỊCH SỬ') ||
                              para.startsWith('Di tích lịch sử') ||
                              para.endsWith(':');
                            const isSerifHeading = isBentoHeritage || para.startsWith('Di tích lịch sử') || para.startsWith('DI TÍCH LỊCH SỬ');
                            return (
                              <p key={pIdx} className={isHeading ? `${isSerifHeading ? 'text-xl font-serif' : 'text-lg font-charm'} font-bold text-[--color-crimson-accent] mt-6 mb-2 pt-2 border-t border-[rgba(110,13,37,0.06)]` : 'text-sm md:text-base leading-relaxed text-[--color-brown-dark] font-serif'}>
                                {isHeading ? para.replace(':', '') : para}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                      <div className="mt-8 pt-4 border-t border-[rgba(110,13,37,0.1)] flex justify-between items-center">
                        <button
                          onClick={() => setSelectedSlideData(slide)}
                          className="px-4 py-2 bg-[--color-crimson-accent] text-white rounded-lg text-xs font-sans font-medium hover:bg-[#851631] transition-all flex items-center gap-1"
                          style={slide.id === 's9' ? { color: '#000000', fontWeight: 'bold' } : slide.id === 's12' ? { color: '#000000', fontWeight: 'bold' } : undefined}
                        >
                          <BookOpen size={13} /> Xem Đầy Đủ Sơ Đồ
                        </button>
                        <span className="text-[10px] uppercase font-sans tracking-widest text-[--color-brown-medium] font-semibold">
                          Bảo Tồn Bản Địa
                        </span>
                      </div>
                    </div>

                    {/* Bento satellite grid for historical photos */}
                    {!isBentoArch && (
                      <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {slide.images?.slice(0, 6).map((img) => (
                          <div
                            key={img.key}
                            onClick={() => setSelectedPhoto(img)}
                            className="relative group cursor-pointer liquid-glass p-1.5 rounded-xl border border-white/10 shadow-sm hover:border-[--color-crimson-accent] transition-all fade-rise"
                          >
                            <div className="aspect-square rounded-lg overflow-hidden relative">
                              <img
                                src={img.url}
                                alt={img.description}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-2 flex flex-col justify-end text-white">
                                <span className="text-[9px] font-sans text-[--color-gold-accent] font-semibold tracking-wider">
                                  {img.title || img.key.replace('.jpg', '').replace(/_/g, ' ')}
                                </span>
                                <span className="text-[10px] font-serif italic truncate mt-0.5 whitespace-normal line-clamp-1">
                                  {img.description}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer list highlighting metrics */}
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                      {slide.highlights.map((hlt, idx) => (
                        <div
                          key={idx}
                          className="liquid-glass-dark text-[--color-beige-light] p-4 rounded-xl border border-white/10 fade-rise"
                        >
                          <span 
                            className="text-[9px] font-sans font-bold text-[--color-gold-accent] tracking-widest uppercase block mb-1"
                            style={slide.id === 's9' ? { color: '#fcffa2' } : slide.id === 's12' ? { color: '#fff695' } : undefined}
                          >
                            Hồ sơ di tích {idx + 1}
                          </span>
                          <p className="text-xs font-serif leading-relaxed text-slate-100">
                            {hlt}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* 5 Horizontal Scrollable Photos with Captions for Slide s9 ("Giữa tiếng chuông chùa và đời sống thường nhật") */}
                    {slide.id === 's9' && slide.images && slide.images.length > 0 && (
                      <div className="lg:col-span-12 mt-8 fade-rise">
                        <div className="flex items-center justify-between mb-4 px-1">
                          <h4 className="text-xs font-sans uppercase tracking-[0.25em] text-[#fcffa2] font-semibold flex items-center gap-2">
                            <Activity size={14} className="text-[#fcffa2]" /> HÌNH ẢNH GHI NHẬN ĐIỀN DÃ ĐẶC TRƯNG
                          </h4>
                          <span className="text-[10px] font-sans text-slate-400 tracking-wider">
                            Cuộn ngang để xem thêm →
                          </span>
                        </div>
                        
                        <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                          {slide.images.slice(0, 5).map((img, idx) => (
                            <div
                              key={img.key}
                              onClick={() => setSelectedPhoto(img)}
                              className="min-w-[280px] sm:min-w-[320px] max-w-[350px] snap-start shrink-0 group cursor-pointer liquid-glass-dark hover:bg-white/15 p-3.5 rounded-2xl border border-white/10 hover:border-[#fcffa2]/40 transition-all duration-300 transform hover:-translate-y-1"
                            >
                              <div className="aspect-[16/10] rounded-xl overflow-hidden relative mb-3 bg-black/40 border border-white/5">
                                <img
                                  src={img.url}
                                  alt={img.description}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm border border-white/10 text-[9px] text-[#fcffa2] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md">
                                  HÌNH {idx + 1}
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-sans font-bold text-[#fcffa2] tracking-wider block uppercase truncate">
                                  {img.title || img.description.split('.')[0] || 'Ảnh Điền Dã'}
                                </span>
                                <p className="text-[11px] font-serif leading-relaxed text-slate-300 line-clamp-3">
                                  {img.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* -------------------- 7. MOSAIC CATHEDRAL (S10) -------------------- */}
              {isMosaic && (
                <div className="max-w-7xl mx-auto w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-5 flex flex-col space-y-4">
                    <span className="text-[--color-crimson-accent] font-sans text-xs uppercase tracking-[0.3em] font-bold px-2 py-0.5 rounded bg-white w-fit">
                      TÒA THÁNH TÂY NINH
                    </span>
                    <h2 
                      className="font-charm text-4xl md:text-5xl font-bold text-[--color-crimson-accent]"
                      style={slide.id === 's10' ? { color: '#ffffff' } : undefined}
                    >
                      {slide.title}
                    </h2>
                    <h3 
                      className="font-sans text-base text-[--color-brown-medium] tracking-wide font-medium leading-relaxed"
                      style={slide.id === 's10' ? { color: '#ffffff' } : undefined}
                    >
                      {slide.subtitle}
                    </h3>

                    <div className="liquid-glass p-5 rounded-2xl border border-white/20 space-y-4 fade-rise max-h-[500px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-[--color-brown-medium] scrollbar-track-transparent">
                      {slide.content.split('\n\n').map((para, pIdx) => {
                        const isHeading = para.endsWith(':') || para.startsWith('Kiến trúc') || para.startsWith('Quan niệm về') || para.startsWith('Nghi lễ trang');
                        return (
                          <p key={pIdx} className={isHeading ? 'text-lg font-charm font-bold text-[--color-crimson-accent] mt-6 mb-2 pt-2 border-t border-[rgba(110,13,37,0.06)]' : 'text-sm md:text-base text-[--color-brown-dark] leading-relaxed font-serif'}>
                            {isHeading ? para.replace(':', '') : para}
                          </p>
                        );
                      })}
                    </div>

                    <div className="liquid-glass-dark p-5 rounded-2xl text-[--color-beige-light] border border-white/10 fade-rise">
                      <h4 
                        className="font-sans text-[10px] uppercase tracking-widest text-[--color-gold-accent] font-bold mb-2"
                        style={slide.id === 's10' ? { color: '#fff296', fontSize: '13px' } : undefined}
                      >
                        Triết lý nhị nguyên
                      </h4>
                      <ol className="space-y-2 text-xs">
                        {slide.highlights.slice(0, 3).map((hlt, idx) => (
                          <li key={idx} className="flex gap-1.5 items-start">
                            <span className="text-[--color-gold-accent] font-bold">•</span>
                            <span style={slide.id === 's10' ? { color: '#ffffff', fontSize: '13px' } : undefined}>{hlt}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <button
                      onClick={() => setSelectedSlideData(slide)}
                      className="px-4 py-2 bg-[--color-crimson-accent] text-white rounded-lg text-xs font-sans font-bold hover:bg-opacity-95"
                    >
                      XEM CHI TIẾT THÁNH  THẤT
                    </button>
                  </div>

                  {/* Gorgeous Zero-gap high impact photo block */}
                  <div 
                    className="lg:col-span-7"
                    style={slide.id === 's10' ? { backgroundColor: '#667761' } : undefined}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 px-1">
                      <span className="text-xs font-sans text-white/80 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                        <Camera size={14} className="text-[#fcffa2]" />
                        Mảnh Ghép Di Sản (Bento Board)
                      </span>
                      <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-sans font-extrabold flex items-center gap-1.5 transition-all uppercase tracking-wider border shadow-md ${
                          isEditMode 
                            ? 'bg-amber-400 text-black border-amber-300 scale-105' 
                            : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/25'
                        }`}
                        title="Bật/Tắt chế độ thay đổi ảnh cho bức tường bento di sản"
                      >
                        <span className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-red-600 animate-ping' : 'bg-green-400 animate-pulse'}`} />
                        {isEditMode ? 'TẮT CHẾ ĐỘ SỬA' : 'CHẾ ĐỘ SỬA ẢNH'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-2 liquid-glass rounded-2xl border border-white/20 shadow-heritage fade-rise">
                      {slide.images?.map((img, idx) => {
                        const canChangeThis = isEditMode || slide.id === 's10'; // s10 always has visual handles or via button click
                        return (
                          <div
                            key={img.key}
                            onClick={() => {
                              if (isEditMode) {
                                setEditingPhoto({ img, slideId: slide.id });
                              } else {
                                setSelectedPhoto(img);
                              }
                            }}
                            className={`relative cursor-pointer group rounded-lg overflow-hidden transition-all duration-300 ${
                              isEditMode 
                                ? 'ring-2 ring-dashed ring-amber-400 ring-offset-2 ring-offset-emerald-900 scale-[0.98]' 
                                : 'hover:scale-[1.01]'
                            } ${
                              idx === 0 ? 'col-span-2 h-64' : 'h-36'
                            }`}
                          >
                            <img
                              src={img.url}
                              alt={img.description}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            
                            {/* Visual pencil overlay in edit mode */}
                            {isEditMode && (
                              <div className="absolute top-2 right-2 bg-amber-400 text-black font-sans font-extrabold text-[9px] uppercase tracking-wider px-2 py-1 rounded-md shadow-lg flex items-center gap-1 z-20">
                                ✎ CHỈNH SỬA
                              </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex flex-col justify-end text-white">
                              <span className="text-[9px] font-sans text-amber-300 uppercase tracking-wider font-bold block mb-1">
                                {img.title || img.key.replace('.jpg', '').replace(/_/g, ' ')}
                              </span>
                              <span className="text-[10px] font-serif italic line-clamp-1 opacity-90 whitespace-pre-wrap">
                                {img.description}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* -------------------- 8. HERO END ANCHOR (S14) -------------------- */}
              {isHeroEnd && (
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
                  <div className="lg:col-span-12 text-center max-w-4xl mx-auto mb-6">
                    <span className="text-[--color-crimson-accent] font-sans text-xs uppercase tracking-[0.3em] font-bold px-3 py-1 rounded bg-white/70 inline-block mb-3">
                      Lời Kết Hành Trình
                    </span>
                    <h2 
                      className="font-charm text-4xl md:text-7xl font-bold text-[--color-crimson-accent] mt-2 mb-4 leading-tight"
                      style={slide.id === 's14' ? { color: '#ffffff' } : undefined}
                    >
                      {slide.title}
                    </h2>
                    <p 
                      className="font-sans text-base md:text-lg italic text-[--color-brown-medium] tracking-wide"
                      style={slide.id === 's14' ? { color: '#ffffff' } : undefined}
                    >
                      {slide.subtitle}
                    </p>
                  </div>

                  <div className="lg:col-span-6 flex flex-col justify-center">
                    <div className="liquid-glass p-6 md:p-8 rounded-2xl border border-white/20 shadow-heritage fade-rise">
                      <div className="max-h-[380px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-[--color-brown-medium] scrollbar-track-transparent space-y-4">
                        {slide.id === 's14' ? (
                          slide.content.split('\n\n').map((para, pIdx) => {
                            if (pIdx === 0) {
                              return (
                                <p key={pIdx} className="font-charm text-[18px] md:text-[21px] font-bold text-[--color-crimson-accent] mb-4 border-b border-[rgba(110,13,37,0.06)] pb-3 text-center">
                                  {para}
                                </p>
                              );
                            }

                            const lines = para.split('\n');
                            if (lines.length > 1) {
                              const headingLine = lines[0].trim();
                              const bodyLines = lines.slice(1);
                              
                              return (
                                <div key={pIdx} className="mt-5 pt-4 border-t border-[rgba(110,13,37,0.08)] space-y-3 first:mt-0 first:pt-0 first:border-0 pb-1">
                                  <h4 className="text-base md:text-lg font-serif font-bold text-[--color-crimson-accent]">
                                    {headingLine}
                                  </h4>
                                  {bodyLines.map((line, lIdx) => (
                                    <p key={lIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif">
                                      {line.trim()}
                                    </p>
                                  ))}
                                </div>
                              );
                            }

                            return (
                              <p key={pIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif">
                                {para}
                              </p>
                            );
                          })
                        ) : (
                          slide.content.split('\n\n').map((para, pIdx) => (
                            <p key={pIdx} className="text-base text-[--color-brown-dark] leading-relaxed font-serif mb-4 last:mb-0">
                              {para}
                            </p>
                          ))
                        )}
                      </div>
                      <div className="mt-8 pt-4 border-t border-[rgba(110,13,37,0.15)] text-center">
                        <button
                          onClick={() => setSelectedSlideData(slide)}
                          className="px-6 py-3 bg-[--color-crimson-accent] text-white font-sans text-xs font-bold rounded-lg tracking-widest hover:bg-[--color-brown-medium] transition-all"
                          style={slide.id === 's14' ? { color: '#000000' } : undefined}
                        >
                          XEM TOÀN BỘ CÔNG TRÌNH TỊNH XÁ
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
                    <div className="liquid-glass-dark text-[--color-beige-light] p-6 rounded-2xl border border-white/10 space-y-4 fade-rise">
                      <h4 
                        className="font-sans text-[11px] uppercase tracking-wider text-[--color-gold-accent] font-bold flex items-center gap-1"
                        style={slide.id === 's14' ? { color: '#f5ee9c' } : undefined}
                      >
                        <Info size={14} className="animate-pulse" /> Sợi dây gắn kết xuyên thế hệ
                      </h4>
                      <ol className="space-y-3 text-xs md:text-sm text-slate-100">
                        {slide.highlights.map((hlt, idx) => (
                          <li key={idx} className="flex gap-2.5 items-start">
                            <span className="w-5 h-5 rounded-full bg-[--color-crimson-accent] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{hlt}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="p-4 liquid-glass rounded-xl border border-white/20 text-center text-xs text-[--color-brown-medium] font-sans font-medium fade-rise">
                      Nhật ký điền dã năm 2026 • Chùa Bửu Minh, Thánh Thất, Miếu Bà, Hưng Lộc Tự, Tịnh xá Quốc lộ 51.
                    </div>
                  </div>

                  {slide.images && slide.images.length > 1 && (
                    <div className="lg:col-span-12 mt-8 pt-8 border-t border-[rgba(110,13,37,0.15)] fade-rise z-10 w-full">

                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {slide.images.slice(1).map((img) => {
                          const hasUrl = !!img.url;
                          return (
                            <div
                              key={img.key}
                              onClick={() => {
                                if (isEditMode) {
                                  setEditingPhoto({ img, slideId: slide.id });
                                } else if (hasUrl) {
                                  setSelectedPhoto(img);
                                } else {
                                  setEditingPhoto({ img, slideId: slide.id });
                                }
                              }}
                              className={`relative cursor-pointer group rounded-xl overflow-hidden border border-white/20 shadow-heritage transition-all duration-300 min-h-[220px] bg-[rgba(255,255,255,0.05)] flex flex-col justify-end p-4 ${
                                isEditMode 
                                  ? 'ring-2 ring-dashed ring-amber-400 ring-offset-2 ring-offset-emerald-950 scale-[0.98]' 
                                  : 'hover:scale-[1.01]'
                              }`}
                            >
                              {hasUrl ? (
                                <>
                                  <img
                                    src={img.url}
                                    alt={img.description}
                                    referrerPolicy="no-referrer"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-0" />
                                </>
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 border-2 border-dashed border-[rgba(255,255,255,0.2)] rounded-xl m-2 bg-black/20">
                                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">
                                    <Camera size={24} className="opacity-75" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="font-sans text-xs font-bold text-white tracking-wide">
                                      CHƯA CÓ HÌNH ẢNH
                                    </p>
                                    <p className="font-serif text-[11px] text-slate-300 leading-relaxed max-w-[240px]">
                                      Bấm vào đây hoặc bật Chế độ sửa ảnh để chèn thông tin hình ảnh thực tế của bạn.
                                    </p>
                                  </div>
                                </div>
                              )}

                              {isEditMode && hasUrl && (
                                <div className="absolute top-3 right-3 bg-amber-400 text-black font-sans font-extrabold text-[9px] uppercase tracking-wider px-2 py-1 rounded-md shadow-lg flex items-center gap-1 z-20">
                                  ✎ CHỈNH SỬA
                                </div>
                              )}

                              {hasUrl && (
                                <div className="relative z-10 text-white">
                                  <span className="text-[10px] font-sans text-amber-300 font-bold tracking-wider uppercase block mb-1">
                                    {img.title || img.key.replace('.jpg', '').replace(/_/g, ' ')}
                                  </span>
                                  <p className="text-[11px] font-serif italic text-slate-100 line-clamp-2 leading-relaxed">
                                    {img.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </section>
          );
        })}

      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-[--color-brown-dark] text-[--color-beige-light] py-16 px-4 md:px-12 border-t border-[--color-gold-accent] relative overflow-hidden z-20">
        <div className="absolute right-0 bottom-0 pointer-events-none select-none opacity-5 font-charm text-[18vw] font-bold text-white leading-none">
          LongThành
        </div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
          <div className="md:col-span-5 space-y-4">
            <h3 
              className="font-charm text-3xl font-bold text-[--color-gold-accent]"
              style={{ color: '#f0ff6a', fontSize: '32px' }}
            >
              Dấu Ấn Tâm Linh Long Thành
            </h3>
            <p className="font-serif text-sm text-slate-300 leading-relaxed max-w-md" style={{ color: '#fdfeff' }}>
              Công trình nghiên cứu nhân học, văn hóa tinh thần điền dã ghi nhận tại thị trấn Long Thành và khu lân cận năm 2026. Một cuốn nhật ký lưu niệm văn tự tôn vinh và thắt chặt tình quê.
            </p>
            <div className="flex gap-3 text-slate-400 font-sans text-xs">
              <span>© 2026 Nhóm Điền Dã Sinh Viên.</span>
              <span>All rights reserved.</span>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="font-sans text-[11px] uppercase tracking-widest text-[--color-gold-accent] font-bold" style={{ color: '#f0ff6a', fontSize: '14px' }}>
              Địa bàn điền dã
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300 font-serif">
              <li className="flex items-center gap-1.5" style={{ color: '#ffffff' }}><MapPin size={12} /> Khu Phố Cầu Xéo, Phường Long Thành.</li>
              <li className="flex items-center gap-1.5" style={{ color: '#ffffff' }}><MapPin size={12} /> Khu Phố Bình Sơn, Hàng Gòn.</li>
              <li className="flex items-center gap-1.5" style={{ color: '#fffdfd' }}><MapPin size={12} /> Khu Tái Định Cư Lộc An - Bình Sơn.</li>
              <li className="flex items-center gap-1.5" style={{ color: '#f9fcff' }}><MapPin size={12} /> Chùa Bửu Minh, Thánh Thất, Miếu Bà.</li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="font-sans text-[11px] uppercase tracking-widest text-[--color-gold-accent] font-bold" style={{ color: '#f0ff6a', fontSize: '14px' }}>
              Lời tri ân nhân học
            </h4>
            <p className="text-xs text-slate-300 font-serif leading-relaxed" style={{ color: '#ffffff' }}>
              Trân trọng cảm ơn các trưởng vị nhân vật: Chú Bùi Hoàng Sang, Chú Đặng Văn Tấn, Chú Trần Văn Thiện, Ông Trần Văn Tân, Cô N, Cô Trần Hoành Hải, Cô Mai Thu Hồng cùng các Trụ trì, Quản sư và Quản lý Đình Miếu đã thắp ngọn lửa chia sớt chân tình cứu giúp thời đại dâu bể.
            </p>
          </div>
        </div>
      </footer>

      {/* ==================== DETAIL TEXT READING MODAL (GLASS hardcover style) ==================== */}
      <AnimatePresence>
        {selectedSlideData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="liquid-glass text-[--color-brown-dark] rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-heritage border border-white/20 flex flex-col"
            >
              <div className="p-6 border-b border-white/10 bg-white/10 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[--color-crimson-accent]">
                    Hồ Sơ Toàn Văn Điền Dã
                  </span>
                  <h3 className="font-charm text-2xl md:text-3xl font-bold text-[--color-crimson-accent] mt-1">
                    {selectedSlideData.title}
                  </h3>
                  <p className="font-sans text-xs text-[--color-brown-medium] italic mt-0.5">
                    {selectedSlideData.subtitle}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSlideData(null)}
                  className="p-1.5 rounded-full bg-[rgba(110,13,37,0.06)] text-[--color-crimson-accent] hover:bg-[--color-crimson-accent] hover:text-white transition-colors"
                >
                  <Minimize2 size={16} />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto space-y-4 max-h-[50vh]">
                <div className="p-4 liquid-glass-dark text-[--color-beige-light] rounded-xl text-xs flex gap-2 border border-white/10">
                  <Info size={18} className="text-[--color-gold-accent] flex-shrink-0" />
                  <p className="font-serif italic leading-relaxed text-slate-100">
                    Bản ghi chép chi tiết từ các nhân vật, phục vụ công tác đối chiếu khảo sự học thuật dân gian và bảo lưu tri thức tinh thần tại miền Đông.
                  </p>
                </div>
                
                {selectedSlideData.id === 's13' ? (
                  selectedSlideData.content.split('\n\n').map((para, pIdx) => {
                    if (pIdx === 0) {
                      return (
                        <p key={pIdx} className="font-serif font-bold text-base md:text-[18px] text-[--color-crimson-accent] mb-4 border-b border-[rgba(110,13,37,0.06)] pb-3">
                          {para}
                        </p>
                      );
                    }

                    const lines = para.split('\n');
                    if (lines.length > 1) {
                      const firstLine = lines[0].trim();
                      const isNumberedHeader = firstLine.match(/^\d+\./);
                      const otherLines = lines.slice(1);

                      if (isNumberedHeader) {
                        return (
                          <div key={pIdx} className="mt-4 pt-3 border-t border-[rgba(110,13,37,0.08)] space-y-2 first:pt-0 first:border-0 pb-1">
                            <h4 className="text-base md:text-lg font-serif font-bold text-[--color-crimson-accent]">
                              {firstLine}
                            </h4>
                            {otherLines.map((line, lIdx) => {
                              const cleanLine = line.trim();
                              if (cleanLine.startsWith('- ')) {
                                const itemParts = cleanLine.slice(2).split(':');
                                if (itemParts.length > 1) {
                                  return (
                                    <p key={lIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif pl-3 flex items-start gap-1">
                                      <span className="text-[--color-crimson-accent] font-bold mt-1 pl-1 flex-shrink-0">•</span>
                                      <span>
                                        <strong className="font-bold text-[--color-crimson-accent]">{itemParts[0]}:</strong>
                                        {itemParts.slice(1).join(':')}
                                      </span>
                                    </p>
                                  );
                                }
                                return (
                                  <p key={lIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif pl-3 flex items-start gap-1">
                                    <span className="text-[--color-crimson-accent] font-bold mt-1 pl-1 flex-shrink-0">•</span>
                                    <span>{cleanLine.slice(2)}</span>
                                  </p>
                                );
                              }
                              return (
                                <p key={lIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif">
                                  {line}
                                </p>
                              );
                            })}
                          </div>
                        );
                      } else {
                        return (
                          <div key={pIdx} className="mt-4 pt-3 border-t border-[rgba(110,13,37,0.08)] space-y-2 first:pt-0 first:border-0 pb-1">
                            <p className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif font-bold text-[--color-crimson-accent]">
                              {firstLine}
                            </p>
                            {otherLines.map((line, lIdx) => {
                              const cleanLine = line.trim();
                              if (cleanLine.startsWith('- ')) {
                                const itemParts = cleanLine.slice(2).split(':');
                                if (itemParts.length > 1) {
                                  return (
                                    <p key={lIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif pl-3 flex items-start gap-1">
                                      <span className="text-[--color-crimson-accent] font-bold mt-1 pl-1 flex-shrink-0">•</span>
                                      <span>
                                        <strong className="font-bold text-[--color-crimson-accent]">{itemParts[0]}:</strong>
                                        {itemParts.slice(1).join(':')}
                                      </span>
                                    </p>
                                  );
                                }
                                return (
                                  <p key={lIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif pl-3 flex items-start gap-1">
                                    <span className="text-[--color-crimson-accent] font-bold mt-1 pl-1 flex-shrink-0">•</span>
                                    <span>{cleanLine.slice(2)}</span>
                                  </p>
                                );
                              }
                              return (
                                <p key={lIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif">
                                  {line}
                                </p>
                              );
                            })}
                          </div>
                        );
                      }
                    }

                    const colonIdx = para.indexOf(':');
                    if (colonIdx > 0 && colonIdx < 40) {
                      const head = para.slice(0, colonIdx + 1).trim();
                      const body = para.slice(colonIdx + 1).trim();
                      return (
                        <div key={pIdx} className="mt-3 first:mt-0">
                          <p className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif">
                            <strong className="font-serif font-bold text-[--color-crimson-accent] block mb-1">{head}</strong>
                            {body}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <p key={pIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif">
                        {para}
                      </p>
                    );
                  })
                ) : selectedSlideData.id === 's12' ? (
                  selectedSlideData.content.split('\n\n').map((para, pIdx) => {
                    if (pIdx === 0) {
                      return (
                        <p key={pIdx} className="font-charm text-[21px] font-bold text-[--color-crimson-accent] mb-4">
                          {para}
                        </p>
                      );
                    }

                    const parts = para.split('\n');
                    if (parts.length > 1) {
                      const titleLine = parts[0].trim();
                      const bodyLines = parts.slice(1).join('\n').trim();

                      const isSubHeading = 
                        titleLine === 'Giới thiệu' ||
                        titleLine.startsWith('Kiến trúc') ||
                        titleLine.startsWith('Hoạt động') ||
                        titleLine.startsWith('Đời sống') ||
                        titleLine.endsWith(':');

                      if (isSubHeading) {
                        return (
                          <div key={pIdx} className="mt-6 pt-4 border-t border-[rgba(110,13,37,0.06)] space-y-2 first:pt-0 first:border-0">
                            <h4 className="text-base md:text-lg font-serif font-bold text-[--color-crimson-accent]">
                              {titleLine.replace(':', '')}
                            </h4>
                            <p className="text-[14px] md:text-base font-normal leading-relaxed text-[--color-brown-dark] font-serif">
                              {bodyLines}
                            </p>
                          </div>
                        );
                      }
                    }

                    const isHeading = 
                      para.startsWith('Không gian chùa:') || 
                      para.startsWith('Phật từ tâm:') ||
                      para.startsWith('Kiến trúc và không gian thờ tự') ||
                      para.startsWith('Hoạt động tín ngưỡng và đời sống văn hóa tinh thần') ||
                      para.startsWith('Đời sống văn hóa tinh thần qua tín ngưỡng thờ') ||
                      para.startsWith('DI TÍCH LỊST SỬ') ||
                      para.startsWith('Di tích lịch sử') ||
                      para.endsWith(':');

                    if (isHeading) {
                      return (
                        <h4 key={pIdx} className="text-base md:text-lg font-serif font-bold text-[--color-crimson-accent] mt-6 mb-2">
                          {para.endsWith(':') ? para.slice(0, -1) : para}
                        </h4>
                      );
                    }

                    return (
                      <p key={pIdx} className="text-[14px] md:text-base font-normal leading-relaxed text-[--color-brown-dark] font-serif">
                        {para}
                      </p>
                    );
                  })
                ) : selectedSlideData.id === 's14' ? (
                  selectedSlideData.content.split('\n\n').map((para, pIdx) => {
                    if (pIdx === 0) {
                      return (
                        <p key={pIdx} className="font-charm text-[18px] md:text-[21px] font-bold text-[--color-crimson-accent] mb-4 border-b border-[rgba(110,13,37,0.06)] pb-3 text-center">
                          {para}
                        </p>
                      );
                    }

                    const lines = para.split('\n');
                    if (lines.length > 1) {
                      const headingLine = lines[0].trim();
                      const bodyLines = lines.slice(1);
                      
                      return (
                        <div key={pIdx} className="mt-5 pt-4 border-t border-[rgba(110,13,37,0.08)] space-y-3 first:mt-0 first:pt-0 first:border-0 pb-1">
                          <h4 className="text-base md:text-lg font-serif font-bold text-[--color-crimson-accent]">
                            {headingLine}
                          </h4>
                          {bodyLines.map((line, lIdx) => (
                            <p key={lIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif">
                              {line.trim()}
                            </p>
                          ))}
                        </div>
                      );
                    }

                    return (
                      <p key={pIdx} className="text-[14px] md:text-base leading-relaxed text-[--color-brown-dark] font-serif">
                        {para}
                      </p>
                    );
                  })
                ) : (
                  selectedSlideData.content.split('\n\n').map((para, idx) => (
                    renderParagraph(para, "text-sm md:text-base leading-relaxed text-[--color-brown-dark] indent-3", idx)
                  ))
                )}

                <div className="pt-6 border-t border-[rgba(110,13,37,0.1)]">
                  <h5 className="font-sans text-[10px] uppercase tracking-wider text-[--color-crimson-accent] font-bold mb-3">
                    Bảng Thống Kê Điểm Ghi Nhận Nhân Thần
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedSlideData.highlights.map((hlt, idx) => (
                      <div key={idx} className="p-3 bg-white/20 backdrop-blur-md rounded-lg border border-white/10 text-xs text-[--color-brown-dark] font-serif leading-relaxed">
                        <span className="font-sans font-bold text-[--color-crimson-accent] block mb-1">Cột mốc {idx + 1}</span>
                        {hlt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[rgba(110,13,37,0.12)] bg-[rgba(255,255,179,0.5)] flex justify-between items-center text-xs">
                <span className="text-[10px] font-mono text-[--color-brown-medium]">ĐỊA BÀN NGHIÊN CỨU: LONG THÀNH</span>
                <button
                  onClick={() => setSelectedSlideData(null)}
                  className="px-4 py-2 bg-[--color-brown-medium] hover:bg-[--color-crimson-accent] text-white font-sans text-xs font-bold rounded-lg transition-colors"
                >
                  Xác Nhận Đã Đọc
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== PHOTO VIEWER MODAL ==================== */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full flex flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors border border-white/20"
                title="Đóng"
              >
                <Minimize2 size={20} />
              </button>

              <div className="w-full h-auto max-h-[70vh] rounded-xl overflow-hidden border-2 border-[--color-gold-accent] shadow-2xl p-1 bg-white">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.description}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain max-h-[69vh]"
                />
              </div>

              <div className="bg-[--color-beige-light] p-5 rounded-xl border border-[--color-gold-accent] text-center max-w-2xl text-[--color-brown-dark] shadow-xl w-full">
                <span className="text-[10px] font-sans tracking-widest text-[--color-crimson-accent] block font-bold uppercase mb-1">
                  {selectedPhoto.title || `Mã Tệp Tin: ${selectedPhoto.key}`}
                </span>
                <p className="text-sm font-serif italic font-medium whitespace-pre-wrap">
                  {selectedPhoto.description}
                </p>
                <div className="h-[1px] bg-[rgba(110,13,37,0.1)] w-24 mx-auto my-2" />
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-mono text-[--color-brown-medium]">
                    Ghi chú điền dã thực tế • 2026
                  </span>
                  
                  {/* Edit button shortcut to edit this image directly */}
                  <button
                    onClick={() => {
                      const foundSlide = slides.find(s => s.images?.some(i => i.key === selectedPhoto.key));
                      if (foundSlide) {
                        setEditingPhoto({ img: selectedPhoto, slideId: foundSlide.id });
                        setSelectedPhoto(null);
                      }
                    }}
                    className="mt-1 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-black font-sans text-[11px] font-extrabold rounded-lg transition-all shadow-md uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>✎ Thay Đổi Hình Ảnh Này</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== PHOTO EDITOR MODAL ==================== */}
      <AnimatePresence>
        {editingPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#1b2b1e] border-2 border-amber-400 text-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10 bg-black/40 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-400 text-black">
                    <Camera size={18} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-sans font-bold text-base text-amber-300">CHỈNH SỬA HÌNH ẢNH DI SẢN</h3>
                    <p className="text-[10px] text-slate-300 font-mono">Bản thiết kế bento • Tệp {editingPhoto.img.key}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingPhoto(null)}
                  className="p-1.5 rounded-full hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Minimize2 size={18} />
                </button>
              </div>

              {/* Body form contents */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin scrollbar-thumb-white/10 text-left">
                {/* 1. Preview */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-sans text-amber-300 font-bold uppercase tracking-wider">Xem trước ảnh thực tế</label>
                  <div className="aspect-[16/10] bg-black/50 border border-white/10 rounded-xl overflow-hidden relative group">
                    <img
                      src={editingPhoto.img.url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none text-xs font-semibold font-sans">
                      Ảnh Đang Biên Tập
                    </div>
                  </div>
                </div>

                {/* 2. Image Source Choices */}
                <div className="space-y-3 p-4 bg-black/30 rounded-xl border border-white/5">
                  <span className="text-[11px] font-sans text-amber-300 font-bold uppercase tracking-wider block">Nguồn ảnh thay thế</span>
                  
                  {/* Choice 1: Local File Uploader */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-300 block font-semibold">Cách 1: Tải ảnh từ máy tính (Khuyên dùng)</label>
                    <div className="border border-dashed border-white/25 rounded-lg p-4 text-center hover:bg-white/5 transition-colors relative cursor-pointer group bg-emerald-950/20">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_WIDTH = 1200;
                                const MAX_HEIGHT = 1200;
                                let width = img.width;
                                let height = img.height;

                                if (width > height) {
                                  if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width;
                                    width = MAX_WIDTH;
                                  }
                                } else {
                                  if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height;
                                    height = MAX_HEIGHT;
                                  }
                                }
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  ctx.drawImage(img, 0, 0, width, height);
                                  const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
                                  setEditingPhoto({
                                    ...editingPhoto,
                                    img: { ...editingPhoto.img, url: compressedDataUrl }
                                  });
                                }
                              };
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center gap-1">
                        <Camera className="text-amber-400 group-hover:scale-110 transition-transform" size={24} />
                        <span className="text-[11px] font-sans font-bold text-white">Chọn tệp hình ảnh để tải lên...</span>
                        <span className="text-[9px] text-slate-400">Chấp nhận JPG, PNG, WEBP (Lưu trực tiếp vào bộ nhớ trình duyệt)</span>
                      </div>
                    </div>
                  </div>

                  {/* Choice 2: Custom URL Web */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-300 block font-semibold">Cách 2: Nhập liên kết ảnh công khai (URL Web)</label>
                    <input
                      type="text"
                      placeholder="Dán liên kết ảnh (http://... hoặc https://...)"
                      value={editingPhoto.img.url.startsWith('data:') ? '' : editingPhoto.img.url}
                      onChange={(e) => {
                        setEditingPhoto({
                          ...editingPhoto,
                          img: { ...editingPhoto.img, url: e.target.value }
                        });
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs font-serif text-slate-200 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                    />
                    {editingPhoto.img.url.startsWith('data:') && (
                      <p className="text-[9px] text-yellow-300/80 font-serif font-semibold">※ Đang sử dụng hình ảnh tải lên từ máy tính của bạn.</p>
                    )}
                  </div>

                  {/* Choice 3: Pre-selected Unsplash Presets! */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] text-slate-300 block font-semibold">Cách 3: Chọn từ một số bối cảnh cổ kính gợi ý</span>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { name: 'Khánh Thờ', url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80' },
                        { name: 'Cửa Điện', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80' },
                        { name: 'Điện Thờ', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80' },
                        { name: 'Chữ Cổ', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80' },
                      ].map((item, pidx) => (
                        <button
                          key={pidx}
                          type="button"
                          onClick={() => {
                            setEditingPhoto({
                              ...editingPhoto,
                              img: { ...editingPhoto.img, url: item.url }
                            });
                          }}
                          className="group relative h-14 rounded-md overflow-hidden border border-white/10 hover:border-amber-400 transition-all focus:outline-none cursor-pointer"
                        >
                          <img src={item.url} className="w-full h-full object-cover brightness-75 group-hover:brightness-100 transition-all" alt="preset" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1 text-center">
                            <span className="text-[9px] font-sans font-bold text-white tracking-tight leading-tight block">{item.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Text Fields */}
                <div className="space-y-3.5">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-sans text-amber-300 font-bold uppercase tracking-wider block">Tiêu Đề Hình Ảnh</label>
                    <input
                      type="text"
                      value={editingPhoto.img.title || ''}
                      onChange={(e) => {
                        setEditingPhoto({
                          ...editingPhoto,
                          img: { ...editingPhoto.img, title: e.target.value }
                        });
                      }}
                      placeholder="Ví dụ: Hình 16: Mặt trước kiến trúc Thánh thất"
                      className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-xs text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-sans"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-sans text-amber-300 font-bold uppercase tracking-wider block">Môi trường ghi chép điền dã</label>
                    <textarea
                      rows={3}
                      value={editingPhoto.img.description || ''}
                      onChange={(e) => {
                        setEditingPhoto({
                          ...editingPhoto,
                          img: { ...editingPhoto.img, description: e.target.value }
                        });
                      }}
                      placeholder="Nhập thông tin người chụp, thời gian, địa điểm, sự kiện chi tiết..."
                      className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-xs text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-serif leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-black/60 border-t border-white/10 flex flex-wrap justify-between items-center gap-3">
                {/* Revert Default */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Bạn có chắc chắn muốn khôi phục bức ảnh này về trạng thái mặc định ban đầu không?")) {
                      handleRestoreDefaultPhoto(editingPhoto.img.key, editingPhoto.slideId);
                    }
                  }}
                  className="px-3.5 py-2 text-slate-300 hover:text-red-400 text-xs font-sans font-bold uppercase tracking-wide hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-red-500/20 cursor-pointer"
                >
                  ↩ KHÔI PHỤC MẶC ĐỊNH
                </button>

                {/* Save and Cancel group */}
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingPhoto(null)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-sans font-bold uppercase tracking-wide transition-all cursor-pointer"
                  >
                    HỦY BỎ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Apply changes to target image in slides state
                      const updatedSlides = slides.map(s => {
                        if (s.id === editingPhoto.slideId && s.images) {
                          return {
                            ...s,
                            images: s.images.map(img => {
                              if (img.key === editingPhoto.img.key) {
                                return { 
                                  ...img, 
                                  url: editingPhoto.img.url, 
                                  title: editingPhoto.img.title, 
                                  description: editingPhoto.img.description 
                                };
                              }
                              return img;
                            })
                          };
                        }
                        return s;
                      });
                      updateSlidesState(updatedSlides);
                      setEditingPhoto(null);
                    }}
                    className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-black rounded-lg text-xs font-sans font-extrabold uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    ✔ LƯU THAY ĐỔI
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
