import React, { useState, useRef, useEffect, useCallback } from "react";

interface Track {
  id: string;
  name: string;
  artist: string;
  url: string;
  duration?: number;
  coverArt?: string;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');
  
  :root { 
    --neon-primary: #00ff88;
    --neon-secondary: #00ccff;
    --neon-purple: #b000ff;
    --neon-dim: rgba(0, 255, 136, 0.3);
    --bg-dark: #020a05;
    --bg-darker: #000502;
    --glass: rgba(10, 25, 15, 0.75);
    --glass-light: rgba(0, 255, 136, 0.1);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }
  
  body {
    background: linear-gradient(135deg, #020a05 0%, #000200 100%);
    color: var(--neon-primary);
    font-family: 'Share Tech Mono', monospace;
    overflow: hidden;
  }

  .app {
    max-width: 500px;
    margin: 0 auto;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, #0a1f0a 0%, #010a01 100%);
    position: relative;
    border: 1px solid var(--neon-dim);
    box-shadow: 0 0 60px rgba(0, 255, 136, 0.15), inset 0 0 30px rgba(0, 255, 136, 0.05);
    overflow: hidden;
  }

  /* Advanced Scanline + Glitch Effect */
  .app::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 255, 136, 0.03) 0px,
      rgba(0, 255, 136, 0.03) 2px,
      transparent 2px,
      transparent 6px
    );
    pointer-events: none;
    z-index: 10;
  }

  .app::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.4) 100%);
    pointer-events: none;
    z-index: 9;
  }

  /* Animated Background Grid */
  @keyframes gridMove {
    0% { transform: translate(0, 0); }
    100% { transform: translate(50px, 50px); }
  }

  .app > * {
    position: relative;
    z-index: 2;
  }

  /* 3D Visualizer */
  .viz-container {
    height: 140px;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 3px;
    padding: 20px 20px 0;
    position: relative;
    background: linear-gradient(180deg, rgba(0,255,136,0.05) 0%, transparent 100%);
  }
  
  .v-bar {
    flex: 1;
    max-width: 8px;
    min-width: 3px;
    background: linear-gradient(180deg, var(--neon-primary), var(--neon-secondary));
    box-shadow: 0 0 15px var(--neon-primary);
    border-radius: 2px 2px 0 0;
    transition: height 0.05s cubic-bezier(0.2, 2, 0.4, 1);
    position: relative;
  }

  .v-bar::after {
    content: "";
    position: absolute;
    top: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: white;
    filter: blur(1px);
    opacity: 0.8;
  }

  /* Main Display */
  .main-display {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 20px;
  }

  /* Holographic Disc */
  .cyber-disk {
    width: 220px;
    height: 220px;
    border-radius: 50%;
    position: relative;
    cursor: pointer;
    transition: transform 0.3s ease;
  }

  .cyber-disk:hover {
    transform: scale(1.02);
  }

  .disk-outer {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #0a2a0a, #000a00);
    border: 2px solid var(--neon-primary);
    box-shadow: 0 0 30px var(--neon-dim), inset 0 0 40px rgba(0,255,136,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    animation: pulseBorder 2s ease-in-out infinite;
  }

  @keyframes pulseBorder {
    0%, 100% { border-color: var(--neon-primary); box-shadow: 0 0 30px var(--neon-dim); }
    50% { border-color: var(--neon-secondary); box-shadow: 0 0 50px rgba(0,204,255,0.4); }
  }

  .disk-inner {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: conic-gradient(from 0deg, var(--neon-primary), var(--neon-secondary), var(--neon-purple), var(--neon-primary));
    animation: spin 8s linear infinite;
    animation-play-state: paused;
    opacity: 0.15;
  }

  .playing .disk-inner {
    animation-play-state: running;
  }

  .disk-center {
    position: absolute;
    width: 40px;
    height: 40px;
    background: radial-gradient(circle, var(--neon-primary), var(--neon-secondary));
    border-radius: 50%;
    box-shadow: 0 0 20px var(--neon-primary);
    animation: centerPulse 1s ease-in-out infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes centerPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }

  /* Track Info */
  .track-meta {
    text-align: center;
    font-family: 'Orbitron', sans-serif;
  }

  .track-title {
    font-size: 1.4rem;
    font-weight: 900;
    letter-spacing: 3px;
    text-transform: uppercase;
    background: linear-gradient(135deg, #fff, var(--neon-primary), var(--neon-secondary));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 0 30px rgba(0,255,136,0.5);
    margin-bottom: 8px;
  }

  .track-artist {
    font-size: 0.8rem;
    color: var(--neon-secondary);
    letter-spacing: 2px;
    opacity: 0.8;
  }

  .track-stats {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 8px;
    font-size: 0.7rem;
    color: var(--neon-dim);
  }

  /* Scrubber */
  .scrub-container {
    width: 85%;
    margin: 10px 0;
  }

  input[type=range] {
    -webkit-appearance: none;
    width: 100%;
    background: transparent;
    cursor: pointer;
  }

  input[type=range]::-webkit-slider-runnable-track {
    height: 3px;
    background: linear-gradient(90deg, var(--neon-dim), var(--neon-primary), var(--neon-dim));
    border-radius: 3px;
  }

  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 16px;
    width: 16px;
    background: var(--neon-primary);
    box-shadow: 0 0 15px var(--neon-primary);
    border-radius: 50%;
    margin-top: -6px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  input[type=range]::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .time-display {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    margin-top: 8px;
    color: var(--neon-dim);
    font-family: 'Share Tech Mono';
  }

  /* Modern Controls */
  .controls-modern {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin: 20px 0;
  }

  .ctrl-btn {
    background: var(--glass);
    border: 1px solid var(--neon-primary);
    color: var(--neon-primary);
    padding: 12px 18px;
    cursor: pointer;
    backdrop-filter: blur(10px);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: 'Orbitron';
    font-weight: bold;
    font-size: 0.8rem;
    position: relative;
    overflow: hidden;
  }

  .ctrl-btn::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(0,255,136,0.3);
    transition: all 0.3s;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .ctrl-btn:active::before {
    width: 100%;
    height: 100%;
  }

  .ctrl-btn:active {
    background: var(--neon-primary);
    color: #000;
    transform: scale(0.95);
  }

  .play-btn {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    font-size: 1.5rem;
    background: linear-gradient(135deg, var(--neon-primary), var(--neon-secondary));
    color: #000;
    border: none;
    box-shadow: 0 0 20px var(--neon-primary);
  }

  .play-btn:active {
    transform: scale(0.9);
  }

  /* EQ Visualizer */
  .eq-badge {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 10px;
  }

  .eq-band {
    font-size: 0.65rem;
    padding: 4px 8px;
    background: var(--glass-light);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .eq-band.active {
    background: var(--neon-primary);
    color: #000;
    box-shadow: 0 0 10px var(--neon-primary);
  }

  /* Library */
  .library-list {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .library-list::-webkit-scrollbar {
    width: 4px;
  }

  .library-list::-webkit-scrollbar-track {
    background: var(--glass-light);
  }

  .library-list::-webkit-scrollbar-thumb {
    background: var(--neon-primary);
  }

  .upload-btn {
    display: block;
    width: 100%;
    padding: 15px;
    border: 2px dashed var(--neon-primary);
    text-align: center;
    margin-bottom: 20px;
    cursor: pointer;
    background: var(--glass-light);
    transition: all 0.3s;
    font-family: 'Orbitron';
    font-size: 0.8rem;
  }

  .upload-btn:hover {
    background: var(--neon-dim);
    border-style: solid;
  }

  .track-card {
    background: rgba(0, 255, 136, 0.05);
    border-left: 3px solid var(--neon-dim);
    padding: 15px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .track-card:hover {
    background: rgba(0, 255, 136, 0.1);
    transform: translateX(5px);
  }

  .track-card.active {
    border-left-color: var(--neon-primary);
    background: rgba(0, 255, 136, 0.15);
    box-shadow: 0 0 15px rgba(0,255,136,0.2);
  }

  .track-info h4 {
    font-size: 1rem;
    margin-bottom: 4px;
  }

  .track-info p {
    font-size: 0.7rem;
    color: var(--neon-dim);
  }

  .playing-indicator {
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* Navigation */
  .nav-bar {
    display: flex;
    border-top: 1px solid var(--neon-dim);
    background: var(--glass);
    backdrop-filter: blur(20px);
    position: relative;
    z-index: 20;
  }

  .nav-item {
    flex: 1;
    padding: 18px;
    text-align: center;
    font-family: 'Orbitron';
    font-size: 0.75rem;
    letter-spacing: 2px;
    color: var(--neon-dim);
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
  }

  .nav-item.active {
    color: var(--neon-primary);
    text-shadow: 0 0 10px var(--neon-primary);
  }

  .nav-item.active::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 2px;
    background: var(--neon-primary);
    box-shadow: 0 0 10px var(--neon-primary);
  }

  /* Toast Notification */
  @keyframes slideIn {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .toast {
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--glass);
    backdrop-filter: blur(20px);
    border: 1px solid var(--neon-primary);
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 0.8rem;
    animation: slideIn 0.3s ease;
    z-index: 1000;
    white-space: nowrap;
  }
`;

export default function CyberPlayer() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("PLAYER");
  const [visualizerHeights, setVisualizerHeights] = useState<number[]>(Array(32).fill(10));
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [repeatMode, setRepeatMode] = useState<"none" | "one" | "all">("none");
  const [shuffleMode, setShuffleMode] = useState(false);
  const [eqPreset, setEqPreset] = useState<string>("flat");
  const [toast, setToast] = useState<string>("");
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animationIdRef = useRef<number>();
  
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);

  // Initialize Web Audio API for real visualizer
  useEffect(() => {
    if (!audioRef.current) return;
    
    const initAudioContext = async () => {
      if (audioContextRef.current) return;
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
      
      const audio = audioRef.current;
      const source = audioContextRef.current.createMediaElementSource(audio);
      const analyser = audioContextRef.current.createAnalyser();
      const gainNode = audioContextRef.current.createGain();
      
      analyser.fftSize = 128;
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(analyser);
      analyser.connect(audioContextRef.current.destination);
      
      sourceRef.current = source;
      analyserRef.current = analyser;
      gainNodeRef.current = gainNode;
    };
    
    initAudioContext();
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Update gain on volume change
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  // Visualizer animation
  useEffect(() => {
    if (!isPlaying || !analyserRef.current) {
      if (!isPlaying) {
        setVisualizerHeights(Array(32).fill(10));
      }
      return;
    }
    
    const updateVisualizer = () => {
      if (!analyserRef.current || !isPlaying) return;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const heights = Array.from({ length: 32 }, (_, i) => {
        const index = Math.floor((i / 32) * dataArray.length);
        const value = dataArray[index] || 0;
        return Math.max(5, value * 0.8);
      });
      
      setVisualizerHeights(heights);
      animationIdRef.current = requestAnimationFrame(updateVisualizer);
    };
    
    updateVisualizer();
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isPlaying]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };
    
    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
      } else if (repeatMode === "all" || shuffleMode) {
        nextTrack();
      } else if (currentTrack < tracks.length - 1) {
        nextTrack();
      } else {
        setIsPlaying(false);
        showToast("Playback ended");
      }
    };
    
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [tracks, currentTrack, repeatMode, shuffleMode]);

  // Shuffle logic
  useEffect(() => {
    if (shuffleMode && tracks.length > 0) {
      const indices = Array.from({ length: tracks.length }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setShuffledIndices(indices);
    }
  }, [shuffleMode, tracks.length]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2000);
  };

  const playPause = async () => {
    if (!tracks.length) {
      showToast("No tracks loaded");
      return;
    }
    
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      showToast("Paused");
    } else {
      try {
        if (audioContextRef.current?.state === "suspended") {
          await audioContextRef.current.resume();
        }
        await audioRef.current.play();
        setIsPlaying(true);
        showToast("Playing");
      } catch (error) {
        console.error("Playback failed:", error);
        showToast("Playback error");
      }
    }
  };

  const nextTrack = () => {
    if (!tracks.length) return;
    
    let nextIndex;
    if (shuffleMode && shuffledIndices.length) {
      const currentPos = shuffledIndices.indexOf(currentTrack);
      nextIndex = shuffledIndices[(currentPos + 1) % shuffledIndices.length];
    } else {
      nextIndex = (currentTrack + 1) % tracks.length;
    }
    
    setCurrentTrack(nextIndex);
    setIsPlaying(true);
    showToast(`Next: ${tracks[nextIndex].name}`);
  };

  const prevTrack = () => {
    if (!tracks.length) return;
    
    let prevIndex;
    if (shuffleMode && shuffledIndices.length) {
      const currentPos = shuffledIndices.indexOf(currentTrack);
      prevIndex = shuffledIndices[(currentPos - 1 + shuffledIndices.length) % shuffledIndices.length];
    } else {
      prevIndex = (currentTrack - 1 + tracks.length) % tracks.length;
    }
    
    setCurrentTrack(prevIndex);
    setIsPlaying(true);
    showToast(`Previous: ${tracks[prevIndex].name}`);
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newTracks = Array.from(e.target.files).map((file, idx) => ({
      id: `${Date.now()}_${idx}_${Math.random()}`,
      name: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Local File",
      url: URL.createObjectURL(file)
    }));
    
    setTracks(prev => [...prev, ...newTracks]);
    showToast(`Added ${newTracks.length} track(s)`);
    
    if (tracks.length === 0 && newTracks.length) {
      setCurrentTrack(0);
    }
  };

  const selectTrack = (index: number) => {
    setCurrentTrack(index);
    setActiveTab("PLAYER");
    setIsPlaying(true);
    showToast(`Loading: ${tracks[index].name}`);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleRepeat = () => {
    const modes: Array<"none" | "one" | "all"> = ["none", "one", "all"];
    const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
    showToast(`Repeat: ${modes[nextIndex] === "none" ? "Off" : modes[nextIndex] === "one" ? "One" : "All"}`);
  };

  const toggleShuffle = () => {
    setShuffleMode(!shuffleMode);
    showToast(shuffleMode ? "Shuffle: Off" : "Shuffle: On");
  };

  const currentTrackData = tracks[currentTrack];

  // Apply EQ preset (visual effect)
  const applyEQ = (preset: string) => {
    setEqPreset(preset);
    showToast(`EQ: ${preset.toUpperCase()}`);
  };

  return (
    <div className="app">
      <style>{css}</style>
      
      <audio
        ref={audioRef}
        src={currentTrackData?.url}
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {toast && <div className="toast">{toast}</div>}
      
      {activeTab === "PLAYER" ? (
        <>
          <div className="viz-container">
            {visualizerHeights.map((height, i) => (
              <div
                key={i}
                className="v-bar"
                style={{
                  height: `${Math.min(80, height)}px`,
                  background: `linear-gradient(180deg, 
                    hsl(${120 + i * 3}, 100%, 50%), 
                    hsl(${180 + i * 2}, 100%, 50%))`
                }}
              />
            ))}
          </div>
          
          <div className={`main-display ${isPlaying ? "playing" : ""}`}>
            <div className="cyber-disk" onClick={playPause}>
              <div className="disk-outer">
                <div className="disk-inner" />
                <div className="disk-center" />
              </div>
            </div>
            
            <div className="track-meta">
              <div className="track-title">
                {currentTrackData?.name || "NO TRACK"}
              </div>
              <div className="track-artist">
                {currentTrackData?.artist || "━━━ LOAD ━━━"}
              </div>
              <div className="track-stats">
                <span>🎵 {tracks.length} tracks</span>
                <span>🔊 {(volume * 100).toFixed(0)}%</span>
              </div>
            </div>
            
            <div className="scrub-container">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={handleSeek}
              />
              <div className="time-display">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Volume Control */}
            <div style={{ width: "80%", margin: "10px 0" }}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
            
            {/* EQ Presets */}
            <div className="eq-badge">
              {["flat", "bass", "treble", "vocal"].map(preset => (
                <div
                  key={preset}
                  className={`eq-band ${eqPreset === preset ? "active" : ""}`}
                  onClick={() => applyEQ(preset)}
                >
                  {preset.toUpperCase()}
                </div>
              ))}
            </div>
            
            <div className="controls-modern">
              <button className="ctrl-btn" onClick={prevTrack}>⏮ PREV</button>
              <button className="ctrl-btn play-btn" onClick={playPause}>
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button className="ctrl-btn" onClick={nextTrack}>NEXT ⏭</button>
            </div>
            
            <div className="controls-modern" style={{ gap: "15px", marginTop: "0" }}>
              <button className="ctrl-btn" onClick={toggleRepeat} style={{ fontSize: "0.7rem" }}>
                🔁 {repeatMode === "none" ? "OFF" : repeatMode === "one" ? "1" : "ALL"}
              </button>
              <button className="ctrl-btn" onClick={toggleShuffle} style={{ fontSize: "0.7rem" }}>
                🎲 {shuffleMode ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="library-list">
          <label className="upload-btn">
            <input
              type="file"
              multiple
              accept="audio/*"
              style={{ display: "none" }}
              onChange={addFiles}
            />
            📁 UPLOAD MUSIC FILES
          </label>
          
          {tracks.map((track, idx) => (
            <div
              key={track.id}
              className={`track-card ${idx === currentTrack ? "active" : ""}`}
              onClick={() => selectTrack(idx)}
            >
              <div className="track-info">
                <h4>{track.name}</h4>
                <p>{track.artist} • {track.id.slice(-6)}</p>
              </div>
              <div className={idx === currentTrack && isPlaying ? "playing-indicator" : ""}>
                {idx === currentTrack && isPlaying ? "🔊" : "▶"}
              </div>
            </div>
          ))}
          
          {tracks.length === 0 && (
            <div style={{ textAlign: "center", marginTop: 50, opacity: 0.5 }}>
              <p>🎧 No tracks loaded</p>
              <p style={{ fontSize: "0.8rem", marginTop: 10 }}>
                Click above to upload your music
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="nav-bar">
        <div
          className={`nav-item ${activeTab === "PLAYER" ? "active" : ""}`}
          onClick={() => setActiveTab("PLAYER")}
        >
          🎵 PLAYER
        </div>
        <div
          className={`nav-item ${activeTab === "LIB" ? "active" : ""}`}
          onClick={() => setActiveTab("LIB")}
        >
          📚 LIBRARY
        </div>
      </div>
    </div>
  );
}
