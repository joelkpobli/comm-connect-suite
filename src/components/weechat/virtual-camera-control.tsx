import { useEffect, useRef, useState, type RefObject } from 'react';
import { Radio, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isCompanion, vcam, pushCanvasFrame } from '@/lib/weechat/virtual-camera-bridge';

export function VcamControl({ canvas, active, fr }: { canvas: RefObject<HTMLCanvasElement | null>; active: boolean; fr: boolean }) {
  const [companion, setCompanion] = useState(false);
  const [on, setOn] = useState(false);
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState('');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const generation = useRef(0);
  const busy = useRef(false);
  const live = useRef(active); live.current = active;
  const mounted = useRef(false);
  const halt = async (text?: string) => {
    ++generation.current;
    if (timer.current !== null) clearInterval(timer.current);
    timer.current = null;
    if (mounted.current) { setOn(false); setPending(false); if (text !== undefined) setMsg(text); }
    try { await vcam('stop'); } catch (error) {
      if (mounted.current) setMsg(error instanceof Error ? error.message : String(error));
    }
  };
  const begin = async () => {
    if (pending || !live.current) return;
    const token = ++generation.current;
    setPending(true); setMsg('');
    try {
      const status = await vcam('start');
      if (!mounted.current || token !== generation.current || !live.current) { await vcam('stop'); return; }
      if (!status.installed || !status.streaming) {
        setMsg(status.message || (fr ? 'Caméra virtuelle indisponible.' : 'Virtual camera unavailable.')); return;
      }
      const scratch = document.createElement('canvas');
      timer.current = setInterval(async () => {
        if (busy.current || !live.current || !canvas.current) return;
        busy.current = true;
        try { await pushCanvasFrame(canvas.current, scratch); }
        catch (error) { void halt((fr ? 'Diffusion interrompue : ' : 'Streaming stopped: ') + (error instanceof Error ? error.message : String(error))); }
        finally { busy.current = false; }
      }, 1000 / 15);
      setOn(true);
      setMsg(fr ? 'Diffusion vers Weechat Virtual Camera.' : 'Streaming to Weechat Virtual Camera.');
    } catch (error) {
      if (mounted.current && token === generation.current) setMsg(error instanceof Error ? error.message : String(error));
    } finally { if (mounted.current && token === generation.current) setPending(false); }
  };
  useEffect(() => {
    mounted.current = true; setCompanion(isCompanion());
    return () => { mounted.current = false; ++generation.current; if (timer.current !== null) { clearInterval(timer.current); void vcam('stop').catch(() => {}); } };
  }, []);
  useEffect(() => { if (!active && (timer.current !== null || pending)) void halt(fr ? 'Diffusion arrêtée : caméra coupée.' : 'Streaming stopped: camera off.'); }, [active]);
  return <div className="grid gap-2 border-t border-border pt-4">
    <Button variant="outline" className="w-fit max-w-full whitespace-normal" disabled={!companion || !active || pending} onClick={() => on ? void halt(fr ? 'Diffusion arrêtée.' : 'Streaming stopped.') : void begin()}>
      {on ? <Square /> : <Radio />}{pending ? (fr ? 'Connexion…' : 'Connecting…') : on ? (fr ? 'Arrêter la diffusion' : 'Stop streaming') : (fr ? 'Diffuser vers la caméra Weechat' : 'Stream to Weechat camera')}
    </Button>
    <p role="status" className="text-sm text-muted-foreground">{msg || (!companion ? (fr ? 'Caméra virtuelle : application Windows requise. Compatibilité des appels encore à tester.' : 'Virtual camera: Windows app required. Call compatibility still needs testing.') : !active ? (fr ? 'Activez la caméra pour diffuser.' : 'Turn the camera on to stream.') : '')}</p>
  </div>;
}