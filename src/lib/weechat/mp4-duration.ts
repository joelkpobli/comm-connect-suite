// Reads an MP4/MOV duration from its mvhd box, so the server bills the real length (never a browser-claimed value).
export function mp4DurationSeconds(b: Uint8Array): number | null {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  for (let i = 4; i + 32 < b.length; i++) {
    if (b[i] === 0x6d && b[i + 1] === 0x76 && b[i + 2] === 0x68 && b[i + 3] === 0x64) {
      const ver = b[i + 4];
      if (ver === 1) { const ts = v.getUint32(i + 24); const d = Number(v.getBigUint64(i + 28)); return ts ? d / ts : null; }
      const ts = v.getUint32(i + 16); const d = v.getUint32(i + 20); return ts ? d / ts : null;
    }
  }
  return null;
}
