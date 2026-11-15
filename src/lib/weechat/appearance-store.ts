// Personal imports stay on this device (IndexedDB), originals kept untouched; never uploaded.
export interface StoredImage { id: string; kind: 'avatar' | 'background'; name: string; blob: Blob; created: number }
const DB = 'weechat-appearance'; const STORE = 'images';
function open(): Promise<IDBDatabase> {
  return new Promise((ok, ko) => { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id' }); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
}
async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((ok, ko) => { const req = fn(db.transaction(STORE, mode).objectStore(STORE)); req.onsuccess = () => ok(req.result); req.onerror = () => ko(req.error); });
}
export const listImages = () => tx<StoredImage[]>('readonly', s => s.getAll() as IDBRequest<StoredImage[]>);
export const saveImage = (img: StoredImage) => tx('readwrite', s => s.put(img));
export const deleteImage = (id: string) => tx('readwrite', s => s.delete(id));
