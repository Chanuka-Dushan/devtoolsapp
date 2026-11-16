/**
 * Utilities to pass large video files across page navigations without memory limits or serialization issues.
 * Uses client-side IndexedDB to store the Blob/File temporarily until the Studio page mounts.
 */

const DB_NAME = "MagicToolsCaptionDB";
const STORE_NAME = "pending_uploads";
const KEY = "pending_video_file";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported"));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storePendingVideo(file: File): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(file, KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to store pending video:", err);
  }
}

export async function getPendingVideo(): Promise<File | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY);
      req.onsuccess = () => {
        const file = req.result as File | undefined;
        if (file) {
          // Remove after reading so it doesn't linger
          store.delete(KEY);
        }
        resolve(file || null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.error("Failed to retrieve pending video:", err);
    return null;
  }
}
