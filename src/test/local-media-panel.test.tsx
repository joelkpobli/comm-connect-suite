import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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
 it('resumes a suspended audio graph and preserves gain through mute/unmute', async () => {
  const gain = {gain:{value:1},connect:vi.fn(),disconnect:vi.fn()};
  const node = () => ({connect:vi.fn(),disconnect:vi.fn()}); const close = vi.fn().mockResolvedValue(undefined);
  const context = {state:'suspended',createMediaStreamSource:node,createGain:()=>gain,createAnalyser:()=>({...node(),fftSize:256,getByteTimeDomainData:vi.fn()}),createMediaStreamDestination:()=>({...node(),stream:{getTracks:()=>[{stop:vi.fn()}]}}),addEventListener:vi.fn(),removeEventListener:vi.fn(),close,resume:vi.fn()};
  context.resume.mockRejectedValueOnce(new Error('blocked')).mockImplementation(async()=>{context.state='running';});
  vi.stubGlobal('AudioContext',class {constructor(){return context;}});
  const {unmount}=open(); fireEvent.click(screen.getByRole('checkbox',{name:'J’autorise l’utilisation locale de mon microphone.'})); fireEvent.click(screen.getByRole('button',{name:'Activer microphone'}));
  const resume = await screen.findByRole('button',{name:'Reprendre l’audio local'});
  await waitFor(()=>expect(context.resume).toHaveBeenCalledOnce()); fireEvent.click(resume);
  await waitFor(()=>expect(context.state).toBe('running'));
  fireEvent.change(screen.getByRole('slider'),{target:{value:'1.6'}}); expect(gain.gain.value).toBe(1.6);
  fireEvent.click(screen.getByRole('checkbox',{name:'Couper le son local'})); expect(gain.gain.value).toBe(0);
  fireEvent.click(screen.getByRole('checkbox',{name:'Couper le son local'})); expect(gain.gain.value).toBe(1.6);
  unmount(); expect(close).toHaveBeenCalledOnce();
 });
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
  await act(async () => {});
  fireEvent.click(screen.getByRole('checkbox',{name:'J’utilise un avatar statique sans imiter une autre personne.'}));
  fireEvent.click(screen.getByRole('button',{name:/^Avatar statique$/}));
  fireEvent.click(screen.getByRole('button',{name:'Retirer tous les consentements'}));
  expect(local).not.toHaveBeenCalled(); expect(getUserMedia).not.toHaveBeenCalled();
 });
});
