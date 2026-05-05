import React, { useState, useRef, useEffect, useCallback } from "react";

interface Track {
  id: string;
  name: string;
  artist: string;
  url: string;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    background: radial-gradient(ellipse at 20% 30%, #0a0a1f, #03030f);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
  }

  /* Main App Container - Perfectly Sized */
  .app {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  /* Glassmorphic Card - Perfect Proportions */
  .player-container {
    width: 100%;
    max-width: 420px;
    height: 100%;
    max-height: 800px;
    background: rgba(8, 8, 20, 0.85);
    backdrop-filter: blur(20px);
    border-radius: 32px;
    box-shadow: 0 25px 45px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 255, 255, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  /* Animated Gradient Border */
  .player-container::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 32px;
    padding: 2px;
    background: linear-gradient(135deg, #00ffff, #ff00ff, #00ffff);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0.6;
    animation: borderPulse 3s ease-in-out infinite;
  }

  @keyframes borderPulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.8; }
  }

  /* Header */
  .header {
    padding: 24px 24px 16px;
    text-align: center;
    border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  }

  .logo {
    font-size: 18px;
    font-weight: 800;
    background: linear-gradient(135deg, #00ffff, #ff00ff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    letter-spacing: 2px;
  }

  .logo span {
    font-size: 12px;
    opacity: 0.7;
  }

  /* Visualizer - Fixed Height */
  .viz-area {
    height: 100px;
    padding: 20px 24px 10px;
    display: flex;
    align-items: flex-end;
    gap: 4px;
  }

  .viz-bar {
    flex: 1;
    background: linear-gradient(180deg, #00ffff, #ff00ff);
    border-radius: 4px;
    transition: height 0.05s ease;
    box-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
  }

  /* Cover Art Area */
  .cover-area {
    flex-shrink: 0;
    padding: 20px;
    display: flex;
    justify-content: center;
  }

  .cover {
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, #1a1a3a, #0a0a2a);
    border-radius: 24px;
    box-shadow: 0 20px 35px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(0, 255, 255, 0.3), inset 0 0 30px rgba(0, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .cover::after {
    content: '';
    position: absolute;
    width: 150%;
    height: 150%;
    background: linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.1), transparent);
    animation: shine 3s infinite;
  }

  @keyframes shine {
    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
  }

  .play-icon-large {
    font-size: 48px;
    color: rgba(0, 255, 255, 0.8);
    text-shadow: 0 0 20px #00ffff;
  }

  /* Track Info */
  .track-info {
    text-align: center;
    padding: 16px 24px;
    flex-shrink: 0;
  }

  .track-name {
    font-size: 22px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }

  .track-artist {
    font-size: 14px;
    color: #8888ff;
    font-weight: 500;
  }

  /* Progress Bar */
  .progress-area {
    padding: 16px 24px;
    flex-shrink: 0;
  }

  .progress-bar {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    margin-bottom: 8px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00ffff, #ff00ff);
    border-radius: 4px;
    position: relative;
    transition: width 0.1s linear;
  }

  .progress-fill::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 10px #00ffff;
  }

  .time-info {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #8888ff;
    font-weight: 500;
  }

  /* Controls */
  .controls {
    padding: 8px 24px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    flex-shrink: 0;
  }

  .ctrl-btn {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid rgba(0, 255, 255, 0.3);
    color: #00ffff;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
  }

  .ctrl-btn:active {
    transform: scale(0.92);
    background: rgba(0, 255, 255, 0.3);
  }

  .play-btn {
    width: 72px;
    height: 72px;
    background: linear-gradient(135deg, #00ffff, #ff00ff);
    border: none;
    color: #fff;
    font-size: 28px;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  }

  /* Mode Controls */
  .mode-controls {
    padding: 0 24px 16px;
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-shrink: 0;
  }

  .mode-btn {
    background: transparent;
    border: none;
    color: #6666aa;
    font-size: 14px;
    padding: 6px 12px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
  }

  .mode-btn.active {
    color: #00ffff;
    text-shadow: 0 0 8px #00ffff;
  }

  /* Volume Control */
  .volume-control {
    padding: 8px 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .volume-icon {
    color: #8888ff;
    font-size: 16px;
  }

  .volume-slider {
    flex: 1;
    height: 3px;
    -webkit-appearance: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: #00ffff;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 8px #00ffff;
  }

  /* Navigation Tabs */
  .nav-tabs {
    display: flex;
    margin-top: auto;
    border-top: 1px solid rgba(0, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.3);
    flex-shrink: 0;
  }

  .tab {
    flex: 1;
    padding: 14px;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: #6666aa;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 1px;
  }

  .tab.active {
    color: #00ffff;
    background: rgba(0, 255, 255, 0.1);
    border-top: 2px solid #00ffff;
  }

  /* Library View */
  .library-view {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .library-view::-webkit-scrollbar {
    width: 4px;
  }

  .library-view::-webkit-scrollbar-track {
    background: rgba(0, 255, 255, 0.1);
  }

  .library-view::-webkit-scrollbar-thumb {
    background: #00ffff;
    border-radius: 4px;
  }

  .upload-btn {
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2));
    border: 2px dashed #00ffff;
    border-radius: 16px;
    padding: 16px;
    text-align: center;
    cursor: pointer;
    color: #00ffff;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s;
  }

  .upload-btn:active {
    transform: scale(0.98);
    background: rgba(0, 255, 255, 0.3);
  }

  .track-item {
    background: rgba(0, 255, 255, 0.05);
    border-radius: 12px;
    padding: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid rgba(0, 255, 255, 0.1);
  }

  .track-item.active {
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2));
    border-color: #00ffff;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
  }

  .track-item:active {
    transform: scale(0.98);
  }

  .track-item-left {
    flex: 1;
  }

  .track-item-name {
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 4px;
  }

  .track-item-artist {
    font-size: 11px;
    color: #8888ff;
  }

  .track-item-playing {
    color: #00ffff;
    font-size: 18px;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.1); }
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #6666aa;
  }

  .empty-state-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  /* Toast */
  .toast {
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid #00ffff;
    border-radius: 100px;
    padding: 8px 20px;
    color: #00ffff;
    font-size: 12px;
    font-weight: 600;
    z-index: 1000;
    animation: slideUp 0.3s ease;
    white-space: nowrap;
  }

  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
`;

export default function CyberPlayer() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("player");
  const [visualizer, setVisualizer] = useState<number[]>(Array(24).fill(5));
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [toast, setToast] = useState("");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number>();

  // Initialize Web Audio
  useEffect(() => {
    if (!audioRef.current) return;
    
    const initAudio = async () => {
      if (audioContextRef.current) return;
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
      
      const source = audioContextRef.current.createMediaElementSource(audioRef.current);
      const analyser = audioContextRef.current.createAnalyser();
      const gain = audioContextRef.current.createGain();
      
      analyser.fftSize = 128;
      gain.gain.value = volume;
      
      source.connect(gain);
      gain.connect(analyser);
      analyser.connect(audioContextRef.current.destination);
      
      sourceRef.current = source;
      analyserRef.current = analyser;
    };
    
    initAudio();
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (sourceRef.current && audioContextRef.current) {
      const gain = audioContextRef.current?.createGain();
      if (gain) gain.gain.value = volume;
    }
  }, [volume]);

  // Visualizer loop
  useEffect(() => {
    if (!isPlaying || !analyserRef.current) {
      setVisualizer(Array(24).fill(5));
      return;
    }
    
    const updateViz = () => {
      if (!analyserRef.current || !isPlaying) return;
      
      const data = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(data);
      
      const heights = Array.from({ length: 24 }, (_, i) => {
        const idx = Math.floor((i / 24) * data.length);
        return Math.max(3, (data[idx] || 0) / 3);
      });
      
      setVisualizer(heights);
      animationRef.current = requestAnimationFrame(updateViz);
    };
    
    updateViz();
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateTime = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };
    
    const handleEnd = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else if (shuffle && tracks.length > 1) {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * tracks.length);
        } while (newIndex === currentIndex);
        setCurrentIndex(newIndex);
        setTimeout(() => audio.play(), 100);
      } else if (currentIndex < tracks.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setTimeout(() => audio.play(), 100);
      } else {
        setIsPlaying(false);
      }
    };
    
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnd);
    
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnd);
    };
  }, [tracks, currentIndex, repeat, shuffle]);

  // Auto-play when track changes
  useEffect(() => {
    if (audioRef.current && tracks[currentIndex] && isPlaying) {
      audioRef.current.play().catch(console.log);
    }
  }, [currentIndex, tracks]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const playPause = async () => {
    if (!tracks.length) {
      showToast("⚠️ Add music files first");
      return;
    }
    
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        if (audioContextRef.current?.state === "suspended") {
          await audioContextRef.current.resume();
        }
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        showToast("❌ Playback error");
      }
    }
  };

  const nextTrack = () => {
    if (!tracks.length) return;
    const next = (currentIndex + 1) % tracks.length;
    setCurrentIndex(next);
    if (isPlaying) setIsPlaying(true);
    showToast(`⏭ ${tracks[next].name}`);
  };

  const prevTrack = () => {
    if (!tracks.length) return;
    const prev = currentIndex - 1 < 0 ? tracks.length - 1 : currentIndex - 1;
    setCurrentIndex(prev);
    if (isPlaying) setIsPlaying(true);
    showToast(`⏮ ${tracks[prev].name}`);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newTracks = Array.from(e.target.files).map(file => ({
      id: Math.random().toString(36),
      name: file.name.replace(/\.[^/.]+$/, "").slice(0, 30),
      artist: "Local File",
      url: URL.createObjectURL(file)
    }));
    
    setTracks(prev => [...prev, ...newTracks]);
    showToast(`✅ Added ${newTracks.length} track(s)`);
    
    if (tracks.length === 0 && newTracks.length) {
      setCurrentIndex(0);
    }
    
    e.target.value = "";
  };

  const selectTrack = (index: number) => {
    setCurrentIndex(index);
    setActiveTab("player");
    setIsPlaying(true);
    showToast(`🎵 ${tracks[index].name}`);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const mins = Math.floor(secs / 60);
    const secsLeft = Math.floor(secs % 60);
    return `${mins}:${secsLeft.toString().padStart(2, "0")}`;
  };

  const currentTrack = tracks[currentIndex];

  return (
    <div className="app">
      <style>{css}</style>
      
      <audio ref={audioRef} src={currentTrack?.url} preload="auto" />
      {toast && <div className="toast">{toast}</div>}
      
      <div className="player-container">
        <div className="header">
          <div className="logo">
            CYBERWAVE • <span>NEXUS</span>
          </div>
        </div>
        
        {activeTab === "player" ? (
          <>
            {/* Visualizer */}
            <div className="viz-area">
              {visualizer.map((h, i) => (
                <div
                  key={i}
                  className="viz-bar"
                  style={{ height: `${Math.min(60, h)}px` }}
                />
              ))}
            </div>
            
            {/* Cover Art */}
            <div className="cover-area">
              <div className="cover">
                {isPlaying ? (
                  <div className="play-icon-large">🎵</div>
                ) : (
                  <div className="play-icon-large">🎧</div>
                )}
              </div>
            </div>
            
            {/* Track Info */}
            <div className="track-info">
              <div className="track-name">
                {currentTrack?.name || "NO TRACK"}
              </div>
              <div className="track-artist">
                {currentTrack?.artist || "━━━ READY ━━━"}
              </div>
            </div>
            
            {/* Progress */}
            <div className="progress-area">
              <div className="progress-bar" onClick={handleSeek}>
                <div
                  className="progress-fill"
                  style={{ width: `${(progress / duration) * 100 || 0}%` }}
                />
              </div>
              <div className="time-info">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Main Controls */}
            <div className="controls">
              <button className="ctrl-btn" onClick={prevTrack}>⏮</button>
              <button className="ctrl-btn play-btn" onClick={playPause}>
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button className="ctrl-btn" onClick={nextTrack}>⏭</button>
            </div>
            
            {/* Mode Controls */}
            <div className="mode-controls">
              <button
                className={`mode-btn ${repeat ? "active" : ""}`}
                onClick={() => { setRepeat(!repeat); showToast(repeat ? "Repeat Off" : "Repeat On"); }}
              >
                🔁 REPEAT
              </button>
              <button
                className={`mode-btn ${shuffle ? "active" : ""}`}
                onClick={() => { setShuffle(!shuffle); showToast(shuffle ? "Shuffle Off" : "Shuffle On"); }}
              >
                🎲 SHUFFLE
              </button>
            </div>
            
            {/* Volume */}
            <div className="volume-control">
              <span className="volume-icon">🔊</span>
              <input
                type="range"
                className="volume-slider"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
              />
              <span className="volume-icon">{Math.floor(volume * 100)}%</span>
            </div>
          </>
        ) : (
          <div className="library-view">
            <label className="upload-btn">
              <input
                type="file"
                multiple
                accept="audio/*"
                style={{ display: "none" }}
                onChange={addFiles}
              />
              📁 + ADD MUSIC FILES
            </label>
            
            {tracks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎵</div>
                <div>No tracks loaded</div>
                <div style={{ fontSize: "12px", marginTop: "8px" }}>
                  Tap above to add your music
                </div>
              </div>
            ) : (
              tracks.map((track, idx) => (
                <div
                  key={track.id}
                  className={`track-item ${idx === currentIndex ? "active" : ""}`}
                  onClick={() => selectTrack(idx)}
                >
                  <div className="track-item-left">
                    <div className="track-item-name">{track.name}</div>
                    <div className="track-item-artist">{track.artist}</div>
                  </div>
                  {idx === currentIndex && isPlaying && (
                    <div className="track-item-playing">▶</div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        
        <div className="nav-tabs">
          <div
            className={`tab ${activeTab === "player" ? "active" : ""}`}
            onClick={() => setActiveTab("player")}
          >
            🎧 PLAYER
          </div>
          <div
            className={`tab ${activeTab === "library" ? "active" : ""}`}
            onClick={() => setActiveTab("library")}
          >
            📚 LIBRARY
          </div>
        </div>
      </div>
    </div>
  );
}
