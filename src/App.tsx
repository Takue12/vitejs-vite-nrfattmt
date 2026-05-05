<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>CYBERWAVE NEXUS • Hi-Fi Audio Matrix</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      background: radial-gradient(circle at 20% 30%, #010501, #000200);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Orbitron', 'Share Tech Mono', monospace;
      overflow: hidden;
    }

    /* 3D floating glass container */
    .player-universe {
      width: 100%;
      max-width: 500px;
      margin: 0 auto;
      height: 100dvh;
      perspective: 1200px;
    }

    .holo-card {
      width: 100%;
      height: 100%;
      background: rgba(0, 5, 2, 0.65);
      backdrop-filter: blur(18px) saturate(180%);
      border-left: 1px solid rgba(0, 255, 170, 0.4);
      border-right: 1px solid rgba(0, 255, 170, 0.2);
      box-shadow: 0 0 40px rgba(0, 255, 170, 0.2), inset 0 0 30px rgba(0, 255, 170, 0.05);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    /* animated neon grid */
    .grid-overlay {
      position: absolute;
      width: 200%;
      height: 200%;
      background-image: 
        linear-gradient(rgba(0, 255, 170, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 255, 170, 0.08) 1px, transparent 1px);
      background-size: 25px 25px;
      top: -50%;
      left: -50%;
      animation: gridShift 20s linear infinite;
      pointer-events: none;
      z-index: 0;
    }

    @keyframes gridShift {
      0% { transform: translate(0,0) rotate(0deg); }
      100% { transform: translate(50px,50px) rotate(2deg); }
    }

    /* scanlines + glitch */
    .holo-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: repeating-linear-gradient(0deg, rgba(0, 255, 170, 0.02) 0px, rgba(0, 255, 170, 0.02) 2px, transparent 2px, transparent 6px);
      pointer-events: none;
      z-index: 5;
    }

    /* beat-reactive visualizer container */
    .viz-nexus {
      height: 130px;
      width: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 5px;
      padding: 15px 20px 0px 20px;
      position: relative;
      z-index: 2;
    }

    .bar-3d {
      width: 7px;
      background: linear-gradient(180deg, #0f0, #0fa0, #0f0);
      box-shadow: 0 0 12px #0f0, 0 0 4px #0f0 inset;
      border-radius: 4px 4px 0px 0px;
      transition: height 0.05s cubic-bezier(0.2, 1.8, 0.4, 1);
    }

    /* central holo-disc */
    .core-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 3;
    }

    .holo-disc {
      width: 210px;
      height: 210px;
      border-radius: 50%;
      background: radial-gradient(circle, #0a1f0a, #010a01);
      border: 2px solid rgba(0, 255, 170, 0.7);
      box-shadow: 0 0 35px rgba(0, 255, 170, 0.5), inset 0 0 20px rgba(0, 255, 170, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.2s;
    }

    .spin-layer {
      width: 185px;
      height: 185px;
      border-radius: 50%;
      border: 1.5px dashed #0fa;
      border-top: 2px solid #0f0;
      animation: vortexRotate 8s linear infinite;
      animation-play-state: paused;
    }

    .playing .spin-layer {
      animation-play-state: running;
    }

    @keyframes vortexRotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .center-gem {
      position: absolute;
      width: 28px;
      height: 28px;
      background: #0f0;
      border-radius: 50%;
      box-shadow: 0 0 20px #0f0;
      animation: pulseGlow 1.2s infinite alternate;
    }

    @keyframes pulseGlow {
      0% { opacity: 0.5; transform: scale(0.8); background: #0f0; box-shadow: 0 0 5px #0f0; }
      100% { opacity: 1; transform: scale(1.2); background: #9f0; box-shadow: 0 0 25px #9f0; }
    }

    /* metadata */
    .track-id {
      text-align: center;
      margin-top: 24px;
    }

    .song-title {
      font-family: 'Orbitron', monospace;
      font-weight: 800;
      font-size: 1.35rem;
      letter-spacing: 3px;
      text-transform: uppercase;
      background: linear-gradient(135deg, #d0ffd0, #0f0);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      text-shadow: 0 0 8px #0f0;
    }

    .artist-name {
      font-size: 0.75rem;
      color: #9fff9f;
      opacity: 0.8;
      letter-spacing: 2px;
      margin-top: 5px;
    }

    /* waveform seeker */
    .seeker-pod {
      width: 85%;
      margin: 12px 0 10px;
    }

    .time-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.7rem;
      font-family: 'Share Tech Mono';
      color: #8f8;
      letter-spacing: 1px;
    }

    input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      background: transparent;
    }

    input[type=range]::-webkit-slider-runnable-track {
      height: 3px;
      background: rgba(0, 255, 170, 0.3);
      border-radius: 5px;
    }

    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 14px;
      width: 14px;
      border-radius: 0%;
      background: #0f0;
      box-shadow: 0 0 12px #0f0;
      margin-top: -5px;
      cursor: pointer;
      clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
    }

    /* hex control pad */
    .control-matrix {
      display: flex;
      gap: 30px;
      margin: 15px 0 20px;
      align-items: center;
    }

    .hex-button {
      background: rgba(0, 20, 5, 0.8);
      border: 1.5px solid #0f0;
      color: #0f0;
      padding: 12px 18px;
      font-family: 'Orbitron';
      font-weight: bold;
      font-size: 0.8rem;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: 0.15s linear;
      clip-path: polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%);
      text-transform: uppercase;
    }

    .hex-button:active {
      background: #0f0;
      color: #000;
      box-shadow: 0 0 18px #0f0;
    }

    .play-btn {
      width: 70px;
      height: 70px;
      font-size: 1.4rem;
      background: rgba(0, 255, 170, 0.2);
      border-width: 2px;
    }

    /* bottom navigation */
    .nav-bar-hologram {
      display: flex;
      border-top: 1px solid rgba(0, 255, 170, 0.4);
      background: rgba(0, 10, 2, 0.8);
      backdrop-filter: blur(16px);
      z-index: 20;
    }

    .nav-option {
      flex: 1;
      padding: 18px 0;
      text-align: center;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #0f07;
      cursor: pointer;
      transition: 0.2s;
    }

    .nav-option.active {
      color: #0f0;
      text-shadow: 0 0 6px #0f0;
      border-bottom: 2px solid #0f0;
      background: linear-gradient(0deg, rgba(0,255,170,0.1), transparent);
    }

    /* Library futuristic scroll */
    .data-bank {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      z-index: 2;
    }

    .cyber-card {
      background: rgba(0, 30, 10, 0.4);
      border-left: 4px solid #0f0;
      margin-bottom: 14px;
      padding: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: 0.2s;
    }

    .cyber-card.active-track {
      background: rgba(0, 255, 170, 0.2);
      border-left: 6px solid #ffd966;
      box-shadow: 0 0 12px rgba(0,255,170,0.3);
    }

    .track-info {
      font-family: 'Share Tech Mono';
    }

    .track-name {
      font-weight: bold;
      font-size: 1rem;
      letter-spacing: 1px;
    }

    .upload-zone {
      border: 1.5px dashed #0f0;
      border-radius: 4px;
      padding: 16px;
      text-align: center;
      margin-bottom: 30px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: 0.2s;
    }

    /* volume & bass boost EQ panel (extra) */
    .fx-panel {
      display: flex;
      justify-content: space-between;
      width: 80%;
      gap: 16px;
      margin-top: 5px;
      margin-bottom: 5px;
    }

    .fx-unit {
      flex: 1;
      font-size: 8px;
      text-align: center;
      color: #aff;
    }

    input[type=range].fx-slider {
      width: 100%;
    }

    .small-label {
      font-size: 9px;
      opacity: 0.7;
    }

    /* scroll custom */
    .data-bank::-webkit-scrollbar {
      width: 3px;
    }
    .data-bank::-webkit-scrollbar-track {
      background: #020;
    }
    .data-bank::-webkit-scrollbar-thumb {
      background: #0f0;
    }
  </style>
</head>
<body>
<div id="root"></div>

<script src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.development.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.development.js"></script>

<script>
  // Full featured futuristic high‑definition audio player with bass boost, volume + advanced controls
  const { useState, useRef, useEffect } = React;

  // PRELOADED DEMO TRACKS (high quality ambient loops)
  const DEMO_TRACKS = [
    { id: "tr1", name: "NEON ASCENSION", artist: "CYBER_DRIVE", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: "tr2", name: "DIGITAL TWILIGHT", artist: "PHANTOM", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: "tr3", name: "QUANTUM DREAMS", artist: "NOVA_9", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
  ];

  const CyberPlayer = () => {
    const [tracks, setTracks] = useState(DEMO_TRACKS);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeTab, setActiveTab] = useState("PLAYER");
    const [visualHeights, setVisualHeights] = useState(Array(28).fill(8));
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.85);   // default 85%
    const [bassBoost, setBassBoost] = useState(0.5); // 0..1 -> gain extra low-end simulation
    const [repeatMode, setRepeatMode] = useState(false);
    const [shuffleMode, setShuffleMode] = useState(false);
    
    const audioRef = useRef(null);
    const audioCtxRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const gainNodeRef = useRef(null);
    const bassGainRef = useRef(null);
    const analyserRef = useRef(null);
    const animationId = useRef(null);
    
    // initialize Web Audio API for high quality + visualizer + bass/volume
    useEffect(() => {
      if (!audioRef.current) return;
      const audio = audioRef.current;
      
      const initAudioContext = () => {
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;
        
        const source = ctx.createMediaElementSource(audio);
        sourceNodeRef.current = source;
        
        const gainNode = ctx.createGain();
        gainNode.gain.value = volume;
        gainNodeRef.current = gainNode;
        
        // bass boost shelf filter (low-shelf)
        const bassFilter = ctx.createBiquadFilter();
        bassFilter.type = "lowshelf";
        bassFilter.frequency.value = 100;
        bassFilter.gain.value = (bassBoost * 12) - 2; // range ~ -2dB to +10dB
        bassGainRef.current = bassFilter;
        
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyserRef.current = analyser;
        
        // routing: source -> bassFilter -> gainNode -> analyser -> destination
        source.connect(bassFilter);
        bassFilter.connect(gainNode);
        gainNode.connect(analyser);
        analyser.connect(ctx.destination);
        
        // start visualizer loop
        const updateVisualizer = () => {
          if (!analyserRef.current || !isPlaying) {
            if (!isPlaying) setVisualHeights(Array(28).fill(8));
            requestAnimationFrame(updateVisualizer);
            return;
          }
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const barCount = 28;
          const heights = Array.from({ length: barCount }, (_, i) => {
            const idx = Math.floor((i / barCount) * dataArray.length);
            const val = dataArray[idx] || 0;
            return Math.max(6, val * 0.9 + 8);
          });
          setVisualHeights(heights);
          requestAnimationFrame(updateVisualizer);
        };
        if (animationId.current) cancelAnimationFrame(animationId.current);
        animationId.current = requestAnimationFrame(updateVisualizer);
      };
      
      const handleUserInteraction = () => {
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
      };
      
      window.addEventListener('click', handleUserInteraction);
      audio.addEventListener('play', () => {
        if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
        if (!audioCtxRef.current) initAudioContext();
        else if (audioCtxRef.current.state === 'closed') initAudioContext();
      });
      
      initAudioContext();
      return () => {
        window.removeEventListener('click', handleUserInteraction);
        if (animationId.current) cancelAnimationFrame(animationId.current);
        if (audioCtxRef.current) audioCtxRef.current.close();
      };
    }, []);
    
    // update gain node when volume changes
    useEffect(() => {
      if (gainNodeRef.current) gainNodeRef.current.gain.value = volume;
    }, [volume]);
    
    // update bass boost
    useEffect(() => {
      if (bassGainRef.current) {
        const gainVal = (bassBoost * 14) - 2;
        bassGainRef.current.gain.value = Math.min(14, Math.max(-2, gainVal));
      }
    }, [bassBoost]);
    
    // sync track src
    useEffect(() => {
      if (audioRef.current && tracks[currentIndex]) {
        const wasPlaying = isPlaying;
        if (wasPlaying) audioRef.current.pause();
        audioRef.current.src = tracks[currentIndex].url;
        audioRef.current.load();
        if (wasPlaying) {
          audioRef.current.play().catch(e => console.log);
          setIsPlaying(true);
        }
        setProgress(0);
      }
    }, [currentIndex, tracks]);
    
    // time update event
    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
      const handleTime = () => {
        setProgress(audio.currentTime);
        setDuration(audio.duration || 0);
      };
      audio.addEventListener('timeupdate', handleTime);
      audio.addEventListener('ended', handleTrackEnd);
      return () => {
        audio.removeEventListener('timeupdate', handleTime);
        audio.removeEventListener('ended', handleTrackEnd);
      };
    }, [currentIndex, repeatMode, shuffleMode, tracks]);
    
    const handleTrackEnd = () => {
      if (repeatMode) {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => {});
          setIsPlaying(true);
        }
      } else if (shuffleMode && tracks.length > 1) {
        let newIdx = currentIndex;
        while (newIdx === currentIndex) newIdx = Math.floor(Math.random() * tracks.length);
        setCurrentIndex(newIdx);
        setIsPlaying(true);
        setTimeout(() => audioRef.current?.play(), 50);
      } else {
        if (currentIndex < tracks.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
      }
    };
    
    const playPause = async () => {
      if (!tracks.length) return;
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (audioCtxRef.current?.state === 'suspended') await audioCtxRef.current.resume();
        await audioRef.current.play().catch(e => console.warn);
        setIsPlaying(true);
      }
    };
    
    const prevTrack = () => {
      if (tracks.length === 0) return;
      let newIndex = currentIndex - 1;
      if (newIndex < 0) newIndex = tracks.length - 1;
      setCurrentIndex(newIndex);
      setIsPlaying(true);
      setTimeout(() => audioRef.current?.play().catch(e=>{}), 60);
    };
    
    const nextTrack = () => {
      if (tracks.length === 0) return;
      let newIndex = currentIndex + 1;
      if (newIndex >= tracks.length) newIndex = 0;
      setCurrentIndex(newIndex);
      setIsPlaying(true);
      setTimeout(() => audioRef.current?.play().catch(e=>{}), 60);
    };
    
    const addFiles = (e) => {
      if (!e.target.files) return;
      const newFiles = Array.from(e.target.files).map(f => ({
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36),
        name: f.name.replace(/\.[^/.]+$/, "").substring(0, 28),
        artist: "UPLOAD",
        url: URL.createObjectURL(f)
      }));
      setTracks(prev => [...prev, ...newFiles]);
      if (tracks.length === 0 && newFiles.length) setCurrentIndex(0);
    };
    
    const selectTrack = (idx) => {
      setCurrentIndex(idx);
      setActiveTab("PLAYER");
      setIsPlaying(true);
      setTimeout(() => audioRef.current?.play().catch(e=>console.log), 80);
    };
    
    const handleSeek = (e) => {
      if (audioRef.current && duration) {
        const val = parseFloat(e.target.value);
        audioRef.current.currentTime = val;
        setProgress(val);
      }
    };
    
    const currentTrack = tracks[currentIndex];
    
    return (
      <div className="player-universe">
        <div className="holo-card">
          <div className="grid-overlay"></div>
          
          {activeTab === "PLAYER" ? (
            <>
              <div className="viz-nexus">
                {visualHeights.map((h, i) => (
                  <div key={i} className="bar-3d" style={{ height: `${Math.min(90, h)}px` }}></div>
                ))}
              </div>
              
              <div className={`core-section ${isPlaying ? 'playing' : ''}`}>
                <div className="holo-disc">
                  <div className="spin-layer"></div>
                  <div className="center-gem"></div>
                </div>
                
                <div className="track-id">
                  <div className="song-title">{currentTrack?.name || "VOID SIGNAL"}</div>
                  <div className="artist-name">{currentTrack?.artist || "---"} {isPlaying ? "⨯ LIVE" : "⨯ STANDBY"}</div>
                </div>
                
                <div className="seeker-pod">
                  <input type="range" min={0} max={duration || 0} value={progress} onChange={handleSeek} step={0.01} />
                  <div className="time-row">
                    <span>{Math.floor(progress / 60)}:{Math.floor(progress % 60).toString().padStart(2, '0')}</span>
                    <span>{duration ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}` : "--:--"}</span>
                  </div>
                </div>
                
                {/* FX panel: Volume + Bass Boost + Repeat/Shuffle */}
                <div className="fx-panel">
                  <div className="fx-unit">VOL<span className="small-label"> 🔊</span>
                    <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e)=>setVolume(parseFloat(e.target.value))} className="fx-slider" />
                  </div>
                  <div className="fx-unit">BASS<span className="small-label"> ⚡</span>
                    <input type="range" min={0} max={1} step={0.01} value={bassBoost} onChange={(e)=>setBassBoost(parseFloat(e.target.value))} className="fx-slider" />
                  </div>
                  <div className="fx-unit" onClick={()=>setRepeatMode(!repeatMode)} style={{cursor:"pointer", borderBottom: repeatMode ? "2px solid #0f0" : "none"}}>⟳ REP</div>
                  <div className="fx-unit" onClick={()=>setShuffleMode(!shuffleMode)} style={{cursor:"pointer", borderBottom: shuffleMode ? "2px solid #0f0" : "none"}}>🎲 SHUF</div>
                </div>
                
                <div className="control-matrix">
                  <div className="hex-button" onClick={prevTrack}>&#9664; PREV</div>
                  <div className="hex-button play-btn" onClick={playPause}>{isPlaying ? "⏸" : "▶"}</div>
                  <div className="hex-button" onClick={nextTrack}>NEXT &#9654;</div>
                </div>
              </div>
            </>
          ) : (
            <div className="data-bank">
              <label className="upload-zone">
                <input type="file" multiple accept="audio/*" style={{display:'none'}} onChange={addFiles} />
                📀 UPLOAD AUDIO | WAV, MP3, FLAC ready
              </label>
              {tracks.map((tk, idx) => (
                <div key={tk.id} className={`cyber-card ${idx === currentIndex ? 'active-track' : ''}`} onClick={() => selectTrack(idx)}>
                  <div className="track-info">
                    <div className="track-name">{tk.name}</div>
                    <div style={{fontSize:'9px', opacity:0.7}}>{tk.artist} • {tk.id.slice(-4)}</div>
                  </div>
                  <div>{idx === currentIndex && isPlaying ? "🔊" : "⏺"}</div>
                </div>
              ))}
              {tracks.length === 0 && <div style={{textAlign:'center', marginTop:40}}>[ NO FILES ] UPLOAD MUSIC TO START THE MATRIX</div>}
            </div>
          )}
          
          <div className="nav-bar-hologram">
            <div className={`nav-option ${activeTab === "PLAYER" ? "active" : ""}`} onClick={() => setActiveTab("PLAYER")}>⚡ NEXUS</div>
            <div className={`nav-option ${activeTab === "LIB" ? "active" : ""}`} onClick={() => setActiveTab("LIB")}>📀 VAULT</div>
          </div>
          
          <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />
        </div>
      </div>
    );
  };
  
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(CyberPlayer, null));
</script>
</body>
</html>
