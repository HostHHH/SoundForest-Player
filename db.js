const DB_NAME = 'MusicPlayerDB';
const DB_VERSION = 2;
const STORE_TRACKS = 'tracks';
const STORE_PLAYLISTS = 'playlists';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_TRACKS)) {
        db.createObjectStore(STORE_TRACKS, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_PLAYLISTS)) {
        db.createObjectStore(STORE_PLAYLISTS, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function saveTrack(file, metadata = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_TRACKS], 'readwrite');
      const store = transaction.objectStore(STORE_TRACKS);

      const trackRecord = {
        name: (file && file.name) || metadata.title || 'Unknown Track',
        title: metadata.title || ((file && file.name) ? file.name.replace(/\.[^/.]+$/, '') : 'Unknown Title'),
        artist: metadata.artist || 'Unknown Artist',
        duration: isFinite(metadata.duration) && metadata.duration > 0 ? Number(metadata.duration) : 0,
        size: (file && file.size) ? file.size : 0,
        type: (file && file.type) ? file.type : 'audio/mpeg',
        blob: file,
        coverUrl: metadata.coverUrl || '',
        dateAdded: Date.now()
      };

      const request = store.add(trackRecord);

      request.onsuccess = (event) => {
        resolve({ id: event.target.result, ...trackRecord });
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (err) {
      reject(err);
    }
  });
}

function getAllTracks() {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_TRACKS], 'readonly');
      const store = transaction.objectStore(STORE_TRACKS);
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result || []);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (err) {
      reject(err);
    }
  });
}

function getTrack(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_TRACKS], 'readonly');
      const store = transaction.objectStore(STORE_TRACKS);
      const request = store.get(Number(id));

      request.onsuccess = (event) => {
        resolve(event.target.result || null);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (err) {
      reject(err);
    }
  });
}

function deleteTrack(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_TRACKS, STORE_PLAYLISTS], 'readwrite');
      const tracksStore = transaction.objectStore(STORE_TRACKS);
      const playlistsStore = transaction.objectStore(STORE_PLAYLISTS);

      const targetId = Number(id);
      tracksStore.delete(targetId);

      const allPlaylistsReq = playlistsStore.getAll();
      allPlaylistsReq.onsuccess = (e) => {
        const playlists = e.target.result || [];
        playlists.forEach((p) => {
          if (p.trackIds && p.trackIds.includes(targetId)) {
            p.trackIds = p.trackIds.filter((tId) => tId !== targetId);
            playlistsStore.put(p);
          }
        });
      };

      transaction.oncomplete = () => {
        resolve(true);
      };

      transaction.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (err) {
      reject(err);
    }
  });
}

function clearAllTracks() {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_TRACKS], 'readwrite');
      const store = transaction.objectStore(STORE_TRACKS);
      const request = store.clear();

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (err) {
      reject(err);
    }
  });
}

function savePlaylist(playlistData) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_PLAYLISTS], 'readwrite');
      const store = transaction.objectStore(STORE_PLAYLISTS);

      const record = {
        name: playlistData.name || 'New Playlist',
        trackIds: Array.isArray(playlistData.trackIds) ? playlistData.trackIds : [],
        dateCreated: Date.now()
      };

      const request = store.add(record);

      request.onsuccess = (event) => {
        resolve({ id: event.target.result, ...record });
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (err) {
      reject(err);
    }
  });
}

function getAllPlaylists() {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_PLAYLISTS], 'readonly');
      const store = transaction.objectStore(STORE_PLAYLISTS);
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result || []);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (err) {
      reject(err);
    }
  });
}

function getPlaylist(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_PLAYLISTS], 'readonly');
      const store = transaction.objectStore(STORE_PLAYLISTS);
      const request = store.get(Number(id));

      request.onsuccess = (event) => {
        resolve(event.target.result || null);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (err) {
      reject(err);
    }
  });
}

function updatePlaylist(id, updates) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_PLAYLISTS], 'readwrite');
      const store = transaction.objectStore(STORE_PLAYLISTS);
      const getReq = store.get(Number(id));

      getReq.onsuccess = (event) => {
        const item = event.target.result;
        if (!item) {
          reject(new Error('Playlist not found'));
          return;
        }

        const updatedRecord = { ...item, ...updates, id: Number(id) };
        const putReq = store.put(updatedRecord);

        putReq.onsuccess = () => {
          resolve(updatedRecord);
        };

        putReq.onerror = (e) => {
          reject(e.target.error);
        };
      };

      getReq.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (err) {
      reject(err);
    }
  });
}

function deletePlaylist(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_PLAYLISTS], 'readwrite');
      const store = transaction.objectStore(STORE_PLAYLISTS);
      const request = store.delete(Number(id));

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (err) {
      reject(err);
    }
  });
}

function addTrackToPlaylist(playlistId, trackId) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_PLAYLISTS], 'readwrite');
      const store = transaction.objectStore(STORE_PLAYLISTS);
      const getReq = store.get(Number(playlistId));

      getReq.onsuccess = (event) => {
        const item = event.target.result;
        if (!item) {
          reject(new Error('Playlist not found'));
          return;
        }

        const targetTrackId = Number(trackId);
        if (!item.trackIds) item.trackIds = [];
        if (!item.trackIds.includes(targetTrackId)) {
          item.trackIds.push(targetTrackId);
        }

        const putReq = store.put(item);
        putReq.onsuccess = () => resolve(item);
        putReq.onerror = (e) => reject(e.target.error);
      };

      getReq.onerror = (event) => reject(event.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

function removeTrackFromPlaylist(playlistId, trackId) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_PLAYLISTS], 'readwrite');
      const store = transaction.objectStore(STORE_PLAYLISTS);
      const getReq = store.get(Number(playlistId));

      getReq.onsuccess = (event) => {
        const item = event.target.result;
        if (!item) {
          reject(new Error('Playlist not found'));
          return;
        }

        const targetTrackId = Number(trackId);
        if (item.trackIds) {
          item.trackIds = item.trackIds.filter((id) => id !== targetTrackId);
        }

        const putReq = store.put(item);
        putReq.onsuccess = () => resolve(item);
        putReq.onerror = (e) => reject(e.target.error);
      };

      getReq.onerror = (event) => reject(event.target.error);
    } catch (err) {
      reject(err);
    }
  });
}
