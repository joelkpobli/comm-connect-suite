import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { LocalMediaPanel } from '@/components/weechat/local-media';
import { DemoProvider } from '@/components/weechat/provider';
const stop = vi.fn(); const ended = vi.fn();
const getUserMedia = vi.fn();
function open() { return render(<DemoProvider><LocalMediaPanel name="Test User" /></DemoProvider>); }
beforeEach(() => {
 vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
 vi.stubGlobal('isSecureContext', true);
 Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia,enumerateDevices:vi.fn().mockResolvedValue([]),addEventListener:vi.fn(),removeEventListener:vi.fn()}});
 getUserMedia.mockReset(); stop.mockReset();
 getUserMedia.mockResolvedValue({getTracks:()=>[{stop,addEventListener:ended}]});
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
describe('Media panel privacy behavior', () => {
 it('gates microphone requests on consent and stops when panel unmounts', async () => {
  const {unmount}=open(); expect(screen.getByRole('button',{name:'Activer microphone'})).toBeDisabled();
  fireEvent.click(screen.getByRole('checkbox',{name:'J’autorise l’utilisation locale de mon microphone.'}));
  fireEvent.click(screen.getByRole('button',{name:'Activer microphone'}));
  await waitFor(()=>expect(getUserMedia).toHaveBeenCalledOnce());
  unmount(); expect(stop).toHaveBeenCalledOnce();
 });
 it('requires authorized-photo consent and revokes the blob on withdrawal', async () => {
  const create=vi.fn().mockReturnValue('blob:local-photo'); const revoke=vi.fn();
  Object.defineProperty(URL,'createObjectURL',{configurable:true,value:create}); Object.defineProperty(URL,'revokeObjectURL',{configurable:true,value:revoke});
  Object.defineProperty(Image.prototype,'decode',{configurable:true,value:vi.fn().mockResolvedValue(undefined)});
  open(); expect(screen.getByRole('button',{name:'Choisir une photo'})).toBeDisabled();
  fireEvent.click(screen.getByRole('checkbox',{name:/Cette photo me représente/}));
  fireEvent.change(screen.getByLabelText('Choisir une photo'),{target:{files:[new File(['image'],'test.png',{type:'image/png'})]}});
  await waitFor(()=>expect(create).toHaveBeenCalledOnce());
  await screen.findByAltText('Votre photo locale autorisée');
  fireEvent.click(screen.getByRole('checkbox',{name:/Cette photo me représente/}));
  expect(revoke).toHaveBeenCalledWith('blob:local-photo'); expect(screen.queryByAltText('Votre photo locale autorisée')).toBeNull(); expect(getUserMedia).not.toHaveBeenCalled();
 });
 it('never saves media or consent to browser storage', async () => {
  open(); const local=vi.spyOn(Storage.prototype,'setItem');
  fireEvent.click(screen.getByRole('checkbox',{name:'J’utilise un avatar statique sans imiter une autre personne.'}));
  fireEvent.click(screen.getByRole('button',{name:/^Avatar statique$/}));
  fireEvent.click(screen.getByRole('button',{name:'Retirer tous les consentements'}));
  expect(local).not.toHaveBeenCalled(); expect(getUserMedia).not.toHaveBeenCalled();
 });
});
