import React, { useState, useRef, useEffect } from "react";

// ── TYPES ────────────────────────────────────────────────────────────────────
interface Track {
  id: string;
  name: string;
  artist: string;
  file?: File;
  url: string;
  size?: number;
}

interface ToastState {
  msg: string;
  show: boolean;
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root {
  --netlify: #00c853;
  --netlify-bright: #00e676;
  --netlify-glow: #69ff9b;
  --bg: #020c05;
  --surface: #07180b;
  --surface2: #0a2211;
  --border: rgba(0,200,83,0.18);
  --text: #d4f5dc;
  --muted: #3d9e5a;
}

html,body,#root{height:100%;width:100%;overflow:hidden;background:var(--bg);}
body{font-family:'Rajdhani',sans-serif;color:var(--text);-webkit-tap-highlight-color:transparent;}

.app{
  max-width:420px;
  margin:0 auto;
  height:100vh;
  height:100dvh;
  display:flex;
  flex-direction:column;
  background: radial-gradient(ellipse at 50% 0%, #092e14 0%, var(--bg) 70%);
  position:relative;
}

/* FIX: Fixed height for visualizer to prevent "Shaking" */
.viz-container {
  height: 80px;
  margin-bottom: 10px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  padding: 0 20px;
  overflow: hidden; /* Keeps bars from pushing layout */
}

.viz-bar {
  flex: 1;
  background: linear-gradient(to top, var(--netlify), var(--netlify-bright));
  border-radius: 2px 2px 0 0;
  transition: height 0.1s ease;
}

.art-section{display:flex;justify-content:center;margin-bottom:20px;}
.art-disk{
  width:180px;height:180px;border-radius:50%;
  border:4px solid var(--border);
  display:flex;align-items:center;justify-content:center;
  background:var(--surface);
  position:relative;
}
.art-disk.playing{animation:spin 5s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}

.track-info{text-align:center;padding:0 20px;margin-bottom:20px;}
.track-name{font-family:'Orbitron';font-size:18px;color:var(--netlify-bright);margin-bottom:5px;}

.controls{display:flex;align-items:center;justify-content:center;gap:20px;margin-bottom:30px;}
.play-btn{
  width:70px;height:70px;border-radius:50%;
  background:var(--netlify);border:none;color:black;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 0 20px var(--netlify);
}

.bottom-tabs{display:flex;background:var(--surface2);border-top:1px solid var(--border);}
.btab{flex:1;padding:15px;text-align:center;background:none;border:none;color:var(--muted);font-family:'Orbitron';font-size:10px;}
.btab.active{color:var(--netlify-bright);}

.panel{flex:1;overflow-y:auto;padding:20px;}
.upload-zone{border:2px dashed var(--netlify);padding:30px;text-align:center;border-radius:15px;margin-bottom:20px;}
.track-row{padding:12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;}

.toast{position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:var(--surface2);padding:10px 20px;border-radius:20px;border:1px solid var(--netlify);font-size:12px;opacity:0;transition:0.3s;}
.toast.show{opacity:1;}
`;

// ── COMPONENTS ────────────────────────────────────────────────────────────────
const Icon = {
  Play: () => <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  Pause: () => <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>,
};

export default function B2Player() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState<"player" | "library">("player");
  const [toast, setToast] = useState({ msg: "", show: false });
  const [vizHeights, setVizHeights] = useState<number[]>(Array(30).fill(5));

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Visualizer Logic
  useEffect(() => {
    if (!playing) {
      setVizHeights(Array(30).fill(5));
      return;
    }
    const interval = setInterval(() => {
      setVizHeights(prev => prev.map(() => Math.random() * 60 + 5));
    }, 100);
    return () => clearInterval(interval);
  }, [playing]);

  const showToast = (msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast({ msg: "", show: false }), 2000);
  };

  const togglePlay = () => {
    if (tracks.length === 0) {
      showToast("No songs in library!");
      return;
    }
    
    const audio = audioRef.current;
    if (audio) {
      if (playing) {
        audio.pause();
      } else {
        // Fix for Mobile: Re-triggering play on user click
        audio.play().catch(err => {
          console.error("Playback failed:", err);
          showToast("Error playing audio");
        });
      }
      setPlaying(!playing);
    }
  };

  const loadFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newTracks: Track[] = files.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      name: f.name.replace(/\.[^/.]+$/, ""),
      artist: "Local File",
      url: URL.createObjectURL(f)
    }));
    setTracks([...tracks, ...newTracks]);
    showToast(`${newTracks.length} songs added!`);
  };

  const playTrack = (idx: number) => {
    setCurrentIdx(idx);
    setPlaying(true);
    setTab("player");
    // Small timeout to ensure URL is set before playing
    setTimeout(() => {
      audioRef.current?.play().catch(() => {});
    }, 100);
  };

  const track = tracks[currentIdx];

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <audio ref={audioRef} src={track?.url} onEnded={() => setPlaying(false)} />

        {tab === "player" ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div className="viz-container">
              {vizHeights.map((h, i) => (
                <div key={i} className="viz-bar" style={{ height: `${h}px` }} />
              ))}
            </div>

            <div className="art-section">
              <div className={`art-disk ${playing ? "playing" : ""}`}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#020c05", border: "2px solid #00c853" }} />
              </div>
            </div>

            <div className="track-info">
              <div className="track-name">{track ? track.name : "Select a Song"}</div>
              <div style={{ color: "#3d9e5a" }}>{track ? track.artist : "Library is empty"}</div>
            </div>

            <div className="controls">
              <button className="play-btn" onClick={togglePlay}>
                {playing ? <Icon.Pause /> : <Icon.Play />}
              </button>
            </div>
          </div>
        ) : (
          <div className="panel">
            <h2 style={{ fontFamily: "Orbitron", fontSize: "14px", marginBottom: "20px" }}>LIBRARY</h2>
            <label className="upload-zone">
              <input type="file" multiple accept="audio/*" onChange={loadFiles} style={{ display: "none" }} />
              <div style={{ color: "#00c853", fontWeight: "bold" }}>+ ADD MUSIC</div>
              <div style={{ fontSize: "10px", marginTop: "5px" }}>Tap to browse your files</div>
            </label>

            {tracks.map((t, i) => (
              <div key={t.id} className="track-row" onClick={() => playTrack(i)}>
                <span>{t.name}</span>
                <span style={{ color: "#00c853" }}>{i === currentIdx && playing ? "PLAYING" : "▶"}</span>
              </div>
            ))}
          </div>
        )}

        <div className="bottom-tabs">
          <button className={`btab ${tab === "player" ? "active" : ""}`} onClick={() => setTab("player")}>PLAYER</button>
          <button className={`btab ${tab === "library" ? "active" : ""}`} onClick={() => setTab("library")}>LIBRARY</button>
        </div>

        <div className={`toast ${toast.show ? "show" : ""}`}>{toast.msg}</div>
      </div>
    </>
  );
}
