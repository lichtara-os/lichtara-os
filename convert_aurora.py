import subprocess
from pathlib import Path

# Paths
repo_root = Path(__file__).resolve().parent
gif_path = repo_root / "lichtara_site" / "public" / "media" / "aurora_preview.gif"
mp4_path = gif_path.with_suffix(".mp4")
webm_path = gif_path.with_suffix(".webm")

if not gif_path.exists():
    raise SystemExit(f"GIF não encontrado: {gif_path}")

# MP4 (H.264)
subprocess.run([
    "ffmpeg", "-y", "-i", str(gif_path),
    "-movflags", "faststart",
    "-pix_fmt", "yuv420p",
    "-vf", "scale=1280:-1:flags=lanczos,setsar=1",
    str(mp4_path)
], check=False)

# WebM (VP9)
subprocess.run([
    "ffmpeg", "-y", "-i", str(gif_path),
    "-c:v", "libvpx-vp9",
    "-b:v", "1M",
    "-vf", "scale=1280:-1:flags=lanczos,setsar=1",
    str(webm_path)
], check=False)

print(f"Conversão concluída!\nMP4: {mp4_path}\nWebM: {webm_path}\n")
print("Dica: renomeie para aurora.mp4 e aurora.webm dentro de public/media para ativar o vídeo no portal.")
