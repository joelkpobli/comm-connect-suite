// Pont entre le canvas Swap Live et le pilote « Weechat Virtual Camera » de l'application Windows.
// Dans un navigateur normal, `isCompanion()` est faux : rien n'est envoyé nulle part.

type Invoke = (cmd: string, args?: unknown, opts?: unknown) => Promise<unknown>;

export const VCAM_WIDTH = 1280;
export const VCAM_HEIGHT = 720;

function invoker(): Invoke | null {
  if (typeof window === "undefined") return null;
  const t = (window as unknown as { __TAURI_INTERNALS__?: { invoke?: Invoke } }).__TAURI_INTERNALS__;
  return t?.invoke ?? null;
}

export function isCompanion(): boolean {
  return invoker() !== null;
}

export type VcamStatus = { installed: boolean; streaming: boolean; dllFound: boolean; backend: string; message: string };

export async function vcam(cmd: "status" | "install" | "uninstall" | "start" | "stop"): Promise<VcamStatus> {
  const inv = invoker();
  if (!inv) throw new Error("Disponible uniquement dans l'application Windows Weechat.");
  return (await inv(`virtual_camera_${cmd}`)) as VcamStatus;
}

/** Convertit RGBA (canvas) en RGB compact attendu par le pilote. */
export function rgbaToRgb(rgba: Uint8ClampedArray): Uint8Array {
  const out = new Uint8Array((rgba.length / 4) * 3);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    out[j] = rgba[i]!;
    out[j + 1] = rgba[i + 1]!;
    out[j + 2] = rgba[i + 2]!;
  }
  return out;
}

/** Envoie une image du canvas (redimensionnée en 1280x720) vers la caméra virtuelle. */
export async function pushCanvasFrame(source: HTMLCanvasElement, scratch: HTMLCanvasElement): Promise<void> {
  const inv = invoker();
  if (!inv) return;
  scratch.width = VCAM_WIDTH;
  scratch.height = VCAM_HEIGHT;
  const ctx = scratch.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  ctx.drawImage(source, 0, 0, VCAM_WIDTH, VCAM_HEIGHT);
  const rgb = rgbaToRgb(ctx.getImageData(0, 0, VCAM_WIDTH, VCAM_HEIGHT).data);
  await inv("virtual_camera_push", rgb);
}
