import React, { useState, useRef, useEffect } from "react";

interface Track {
  id: string;
  name: string;
  artist: string;
  url: string;
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

* { margin:0; padding:0; box-sizing:border-box; }

body {
  background: radial-gradient(ellipse at 20% 30%, #0a0a1f, #03030f);
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}

.app {
  width:100vw; height:100vh;
  display:flex; align-items:center; justify-content:center;
}

.player-container {
  width:100%; max-width:420px; height:100%;
  background: rgba(8,8,20,0.95);
  border-radius:32px;
  display:flex; flex-direction:column;
  overflow:hidden;
  position:relative;
}

.player-container::before {
  content:'';
  position:absolute;
  inset:0;
  border-radius:32px;
  padding:2px;
  background: linear-gradient(135deg,#00f0ff,#8a2eff,#ff00cc,#00f0ff);
  background-size:300% 300%;
  animation:gradientShift 6s ease infinite;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
}

@keyframes gradientShift {
  0%{background-position:0% 50%;}
  50%{background-position:100% 50%;}
  100%{background-position:0% 50%;}
}

.header {
  padding:20px;
  text-align:center;
  color:#00ffff;
}

.viz-area {
  height:80px;
  display:flex;
  gap:3px;
  padding:10px;
}

.viz-bar {
  flex:1;
  background:linear-gradient(180deg,#00ffff,#ff00ff);
  border-radius:3px;
}

.track-info { text-align:center; padding:10px; }
.track-name { color:#fff; font-weight:700; }
.track-artist { color:#888; font-size:12px; }

.progress-bar {
  height:4px;
  background:#222;
  margin:10px;
  cursor:pointer;
}

.progress-fill {
  height:100%;
  background:linear-gradient(90deg,#00ffff,#ff00ff);
}

.controls {
  display:flex;
  justify-content:center;
  gap:15px;
  padding:10px;
}

.ctrl-btn {
  width:50px;height:50px;
  border-radius:50%;
  border:none;
  background:#111;
  color:#00ffff;
  font-size:18px;
}

.play-btn {
  width:65px;height:65px;
  background:linear-gradient(135deg,#00ffff,#ff00ff);
  color:#fff;
}

.library-view {
  flex:1;
  overflow:auto;
  padding:10px;
}

.upload-btn {
  border:2px dashed #00ffff;
  padding:10px;
  text-align:center;
  cursor:pointer;
  color:#00ffff;
}

.track-item {
  padding:10px;
  margin-top:5px;
  background:#111;
  border-radius:10px;
  cursor:pointer;
  color:#fff;
}

.nav-tabs {
  display:flex;
}

.tab {
  flex:1;
  padding:10px;
  text-align:center;
  cursor:pointer;
  color:#888;
}

.tab.active {
  color:#00ffff;
}
`;

export default function CyberPlayer() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("player");
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [visualizer, setVisualizer] = useState(Array(24).fill(5));

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // LOAD SAVED TRACKS
  useEffect(() => {
    const saved = localStorage.getItem("cyber_tracks");
    if (saved) {
      try { setTracks(JSON.parse(saved)); } catch {}
    }
  }, []);

  // SAVE TRACKS
  useEffect(() => {
    localStorage.setItem("cyber_tracks", JSON.stringify(tracks));
  }, [tracks]);

  // INIT AUDIO
  useEffect(() => {
    if (!audioRef.current) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = ctx;

    const source = ctx.createMediaElementSource(audioRef.current);
    const analyser = ctx.createAnalyser();
    const gain = ctx.createGain();

    const bass = ctx.createBiquadFilter();
    bass.type = "lowshelf";
    bass.frequency.value = 200;
    bass.gain.value = 5;

    gain.gain.value = volume;

    source.connect(bass);
    bass.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);

    analyserRef.current = analyser;
    gainRef.current = gain;
  }, []);

  // VOLUME FIX
  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volume;
  }, [volume]);

  // VISUALIZER
  useEffect(() => {
    if (!isPlaying || !analyserRef.current) return;

    const data = new Uint8Array(analyserRef.current.frequencyBinCount);

    const loop = () => {
      analyserRef.current!.getByteFrequencyData(data);
      setVisualizer(Array.from(data.slice(0, 24), v => v / 4));
      requestAnimationFrame(loop);
    };
    loop();
  }, [isPlaying]);

  // TIME UPDATE
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const update = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", update);
    return () => audio.removeEventListener("timeupdate", update);
  }, []);

  const playPause = async () => {
    if (!tracks.length) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      await audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  const addFiles = (files: FileList) => {
    const newTracks: Track[] = [];

    for (let f of Array.from(files)) {
      if (f.type.includes("audio")) {
        newTracks.push({
          id: Date.now() + f.name,
          name: f.name,
          artist: "Local",
          url: URL.createObjectURL(f)
        });
      }
    }

    setTracks(prev => [...prev, ...newTracks]);

    if (!tracks.length && newTracks.length) {
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  };

  const currentTrack = tracks[currentIndex];

  return (
    <div className="app">
      <style>{css}</style>

      <audio ref={audioRef} src={currentTrack?.url} />

      <div className="player-container">
        <div className="header">CYBER PLAYER</div>

        {activeTab === "player" ? (
          <>
            <div className="viz-area">
              {visualizer.map((h, i) => (
                <div key={i} className="viz-bar" style={{ height: h }} />
              ))}
            </div>

            <div className="track-info">
              <div className="track-name">{currentTrack?.name || "No Track"}</div>
              <div className="track-artist">{currentTrack?.artist}</div>
            </div>

            <div className="progress-bar"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                if (audioRef.current) {
                  audioRef.current.currentTime = pct * duration;
                }
              }}>
              <div
                className="progress-fill"
                style={{ width: duration ? (progress / duration) * 100 + "%" : "0%" }}
              />
            </div>

            <div className="controls">
              <button className="ctrl-btn" onClick={playPause}>
                {isPlaying ? "⏸" : "▶"}
              </button>
            </div>

            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
          </>
        ) : (
          <div
            className="library-view"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
          >
            <label className="upload-btn">
              + ADD MUSIC
              <input
                type="file"
                multiple
                hidden
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </label>

            {tracks.map((t, i) => (
              <div key={t.id} className="track-item" onClick={() => {
                setCurrentIndex(i);
                setActiveTab("player");
                setIsPlaying(true);
              }}>
                {t.name}
              </div>
            ))}
          </div>
        )}

        <div className="nav-tabs">
          <div className={`tab ${activeTab==="player"?"active":""}`}
            onClick={()=>setActiveTab("player")}>PLAYER</div>
          <div className={`tab ${activeTab==="library"?"active":""}`}
            onClick={()=>setActiveTab("library")}>LIBRARY</div>
        </div>
      </div>
    </div>
  );
}
