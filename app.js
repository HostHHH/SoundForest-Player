const THEMES = [
  { id: 'cyber-moss', name: 'Cyber Moss', bgMain: '#0D1F17', bgPanel: '#1E3A2B', accent: '#2EC4B6' },
  { id: 'midnight-forest', name: 'Midnight Forest', bgMain: '#0A150F', bgPanel: '#14281D', accent: '#4E8752' },
  { id: 'emerald-obsidian', name: 'Emerald Obsidian', bgMain: '#091210', bgPanel: '#11221C', accent: '#10B981' },
  { id: 'sage-dusk', name: 'Sage Dusk', bgMain: '#121815', bgPanel: '#1F2923', accent: '#87A994' },
  { id: 'nordic-aurora', name: 'Nordic Aurora', bgMain: '#0B1919', bgPanel: '#132E2D', accent: '#52D6A4' },
  { id: 'toxic-swamp', name: 'Toxic Swamp', bgMain: '#11140E', bgPanel: '#1C2217', accent: '#A3E635' },
  { id: 'deep-eucalyptus', name: 'Deep Eucalyptus', bgMain: '#0E1A17', bgPanel: '#1A2C27', accent: '#569D87' },
  { id: 'retro-synth-olive', name: 'Retro Synth Olive', bgMain: '#141711', bgPanel: '#22281D', accent: '#D4E157' },
  { id: 'abyssal-pine', name: 'Abyssal Pine', bgMain: '#060D08', bgPanel: '#0E1B12', accent: '#163824' },
  { id: 'jade-matrix', name: 'Jade Matrix', bgMain: '#081C15', bgPanel: '#1B4332', accent: '#40C057' }
];

const audio = new Audio();
let allTracks = [];
let allPlaylists = [];
let currentQueue = [];
let currentIndex = -1;
let isPlaying = false;
let isShuffle = false;
let repeatMode = 'off';
let currentBlobUrl = null;
let lastVolume = 0.8;
let activePlaylistId = null;
let trackToAddId = null;
let playlistToRenameId = null;
let onlinePreviewAudio = null;
let onlinePreviewBtn = null;
let currentTheme = 'cyber-moss';

const fileInput = document.getElementById('fileInput');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const currentTimeEl = document.getElementById('currentTime');
const totalDurationEl = document.getElementById('totalDuration');
const progressBar = document.getElementById('progressBar');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const repeatBadge = document.getElementById('repeatBadge');
const volumeBtn = document.getElementById('volumeBtn');
const volumeHighIcon = document.getElementById('volumeHighIcon');
const volumeMuteIcon = document.getElementById('volumeMuteIcon');
const volumeBar = document.getElementById('volumeBar');
const artworkDisc = document.getElementById('artworkDisc');
const artworkGlow = document.getElementById('artworkGlow');
const artworkCoverImg = document.getElementById('artworkCoverImg');
const toastEl = document.getElementById('toast');

const btnThemes = document.getElementById('btnThemes');
const themeModal = document.getElementById('themeModal');
const themeGrid = document.getElementById('themeGrid');
const btnCancelThemeModal = document.getElementById('btnCancelThemeModal');

const tabBtnTracks = document.getElementById('tabBtnTracks');
const tabBtnPlaylists = document.getElementById('tabBtnPlaylists');
const tabBtnOnline = document.getElementById('tabBtnOnline');
const viewTracks = document.getElementById('viewTracks');
const viewPlaylists = document.getElementById('viewPlaylists');
const viewOnline = document.getElementById('viewOnline');

const trackList = document.getElementById('trackList');
const trackCountBadge = document.getElementById('trackCountBadge');
const searchInput = document.getElementById('searchInput');
const emptyState = document.getElementById('emptyState');

const playlistsListView = document.getElementById('playlistsListView');
const playlistDetailView = document.getElementById('playlistDetailView');
const playlistsContainer = document.getElementById('playlistsContainer');
const playlistsEmptyState = document.getElementById('playlistsEmptyState');
const playlistCountBadge = document.getElementById('playlistCountBadge');
const btnNewPlaylist = document.getElementById('btnNewPlaylist');
const btnBackToPlaylists = document.getElementById('btnBackToPlaylists');
const currentPlaylistTitle = document.getElementById('currentPlaylistTitle');
const currentPlaylistCount = document.getElementById('currentPlaylistCount');
const btnPlayCurrentPlaylist = document.getElementById('btnPlayCurrentPlaylist');
const btnRenameCurrentPlaylist = document.getElementById('btnRenameCurrentPlaylist');
const btnDeleteCurrentPlaylist = document.getElementById('btnDeleteCurrentPlaylist');
const playlistTracksContainer = document.getElementById('playlistTracksContainer');

const offlineBanner = document.getElementById('offlineBanner');
const onlineSearchInput = document.getElementById('onlineSearchInput');
const btnSearchOnline = document.getElementById('btnSearchOnline');
const onlineResultsContainer = document.getElementById('onlineResultsContainer');
const onlineEmptyState = document.getElementById('onlineEmptyState');

const createPlaylistModal = document.getElementById('createPlaylistModal');
const newPlaylistNameInput = document.getElementById('newPlaylistNameInput');
const btnCancelCreatePlaylist = document.getElementById('btnCancelCreatePlaylist');
const btnConfirmCreatePlaylist = document.getElementById('btnConfirmCreatePlaylist');

const addToPlaylistModal = document.getElementById('addToPlaylistModal');
const modalPlaylistsList = document.getElementById('modalPlaylistsList');
const btnCancelAddToPlaylist = document.getElementById('btnCancelAddToPlaylist');

const renamePlaylistModal = document.getElementById('renamePlaylistModal');
const renamePlaylistInput = document.getElementById('renamePlaylistInput');
const btnCancelRenamePlaylist = document.getElementById('btnCancelRenamePlaylist');
const btnConfirmRenamePlaylist = document.getElementById('btnConfirmRenamePlaylist');

window.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  audio.volume = parseFloat(volumeBar.value);
  updateSliderFill(volumeBar);
  updateNetworkStatus();
  await loadSavedTracks();
  await loadSavedPlaylists();
  registerServiceWorker();
  setupMediaSessionHandlers();
});

function initTheme() {
  const savedTheme = localStorage.getItem('soundpulse_theme') || 'cyber-moss';
  applyTheme(savedTheme, false);
  renderThemeGrid();
}

function applyTheme(themeId, showNotification = true) {
  const themeObj = THEMES.find((t) => t.id === themeId) || THEMES[0];
  currentTheme = themeObj.id;
  document.body.setAttribute('data-theme', themeObj.id);
  localStorage.setItem('soundpulse_theme', themeObj.id);

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', themeObj.bgMain);
  }

  updateActiveThemeCard();

  if (showNotification) {
    showToast(`Theme: ${themeObj.name}`);
  }
}

function renderThemeGrid() {
  if (!themeGrid) return;
  themeGrid.innerHTML = '';

  THEMES.forEach((t) => {
    const card = document.createElement('div');
    card.className = `theme-card-option ${t.id === currentTheme ? 'active' : ''}`;
    card.dataset.themeId = t.id;

    card.innerHTML = `
      <div class="theme-swatch-row">
        <div class="theme-swatch-circle" style="background: ${t.bgMain};"></div>
        <div class="theme-swatch-circle" style="background: ${t.bgPanel};"></div>
        <div class="theme-swatch-circle" style="background: ${t.accent};"></div>
      </div>
      <div class="theme-name-label">${t.name}</div>
    `;

    card.addEventListener('click', () => {
      applyTheme(t.id, true);
    });

    themeGrid.appendChild(card);
  });
}

function updateActiveThemeCard() {
  if (!themeGrid) return;
  const cards = themeGrid.querySelectorAll('.theme-card-option');
  cards.forEach((c) => {
    c.classList.toggle('active', c.dataset.themeId === currentTheme);
  });
}

btnThemes.addEventListener('click', () => {
  updateActiveThemeCard();
  themeModal.classList.add('open');
});

btnCancelThemeModal.addEventListener('click', () => {
  themeModal.classList.remove('open');
});

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

function updateNetworkStatus() {
  const isOnline = navigator.onLine;
  if (offlineBanner) {
    if (!isOnline) {
      offlineBanner.classList.add('visible');
    } else {
      offlineBanner.classList.remove('visible');
    }
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.error('Service Worker registration error:', err);
    });
  }
}

async function loadSavedTracks() {
  try {
    const tracks = await getAllTracks();
    allTracks = tracks || [];
    currentQueue = [...allTracks];
    renderTracksList();
    updateTrackCount();
    if (currentQueue.length > 0 && currentIndex === -1) {
      prepareTrack(0, false);
    }
  } catch (err) {
    showToast('Failed to load saved tracks');
  }
}

async function loadSavedPlaylists() {
  try {
    const playlists = await getAllPlaylists();
    allPlaylists = playlists || [];
    renderPlaylistsGrid();
  } catch (err) {
    showToast('Failed to load playlists');
  }
}

function switchTab(targetTab) {
  [tabBtnTracks, tabBtnPlaylists, tabBtnOnline].forEach((b) => b.classList.remove('active'));
  [viewTracks, viewPlaylists, viewOnline].forEach((v) => v.classList.remove('active'));

  if (targetTab === 'tracks') {
    tabBtnTracks.classList.add('active');
    viewTracks.classList.add('active');
  } else if (targetTab === 'playlists') {
    tabBtnPlaylists.classList.add('active');
    viewPlaylists.classList.add('active');
    renderPlaylistsGrid();
  } else if (targetTab === 'online') {
    tabBtnOnline.classList.add('active');
    viewOnline.classList.add('active');
    updateNetworkStatus();
  }
}

tabBtnTracks.addEventListener('click', () => switchTab('tracks'));
tabBtnPlaylists.addEventListener('click', () => switchTab('playlists'));
tabBtnOnline.addEventListener('click', () => switchTab('online'));

fileInput.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  if (!files || files.length === 0) return;

  let addedCount = 0;
  for (const file of files) {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|flac|aac|m4a|weba|opus)$/i)) {
      continue;
    }

    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    let artist = 'Unknown Artist';
    let title = cleanName;

    if (cleanName.includes(' - ')) {
      const parts = cleanName.split(' - ');
      artist = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
    }

    const duration = await getAudioDuration(file);

    try {
      const saved = await saveTrack(file, { title, artist, duration });
      allTracks.push(saved);
      addedCount++;
    } catch (err) {
      console.error('Failed to save file:', file.name, err);
    }
  }

  fileInput.value = '';

  if (addedCount > 0) {
    currentQueue = [...allTracks];
    renderTracksList();
    updateTrackCount();
    showToast(`Added ${addedCount} track${addedCount > 1 ? 's' : ''}`);

    if (currentIndex === -1 && currentQueue.length > 0) {
      prepareTrack(0, false);
    }
  }
});

function getAudioDuration(fileOrBlob) {
  return new Promise((resolve) => {
    const tempAudio = new Audio();
    const tempUrl = URL.createObjectURL(fileOrBlob);
    let resolved = false;

    const cleanup = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      tempAudio.removeEventListener('loadedmetadata', onLoaded);
      tempAudio.removeEventListener('durationchange', onDurationChange);
      tempAudio.removeEventListener('error', onError);
      tempAudio.src = '';
      URL.revokeObjectURL(tempUrl);
    };

    const timer = setTimeout(() => {
      const dur = (tempAudio.duration && isFinite(tempAudio.duration) && tempAudio.duration > 0) ? tempAudio.duration : 0;
      cleanup();
      resolve(dur);
    }, 6000);

    const onLoaded = () => {
      const dur = (tempAudio.duration && isFinite(tempAudio.duration) && tempAudio.duration > 0) ? tempAudio.duration : 0;
      if (dur > 0 && dur !== Infinity) {
        cleanup();
        resolve(dur);
      }
    };

    const onDurationChange = () => {
      const dur = (tempAudio.duration && isFinite(tempAudio.duration) && tempAudio.duration > 0) ? tempAudio.duration : 0;
      if (dur > 0 && dur !== Infinity) {
        cleanup();
        resolve(dur);
      }
    };

    const onError = () => {
      cleanup();
      resolve(0);
    };

    tempAudio.preload = 'metadata';
    tempAudio.addEventListener('loadedmetadata', onLoaded);
    tempAudio.addEventListener('durationchange', onDurationChange);
    tempAudio.addEventListener('error', onError);
    tempAudio.src = tempUrl;
  });
}

function formatTime(seconds) {
  if (seconds === null || seconds === undefined || isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
    return '00:00';
  }
  const totalSecs = Math.floor(seconds);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const hrs = Math.floor(mins / 60);

  if (hrs > 0) {
    const remMins = mins % 60;
    return `${hrs}:${remMins < 10 ? '0' : ''}${remMins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateSliderFill(slider) {
  const min = parseFloat(slider.min) || 0;
  const max = parseFloat(slider.max) || 100;
  const val = parseFloat(slider.value) || 0;
  const percentage = max > min ? ((val - min) / (max - min)) * 100 : 0;
  slider.style.backgroundSize = `${Math.min(Math.max(percentage, 0), 100)}% 100%`;
}

function prepareTrack(index, autoPlay = true) {
  if (index < 0 || index >= currentQueue.length) return;

  if (onlinePreviewAudio) {
    onlinePreviewAudio.pause();
    onlinePreviewAudio.src = '';
    onlinePreviewAudio = null;
    if (onlinePreviewBtn) {
      onlinePreviewBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
      onlinePreviewBtn = null;
    }
  }

  currentIndex = index;
  const track = currentQueue[currentIndex];

  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }

  if (track && track.blob) {
    currentBlobUrl = URL.createObjectURL(track.blob);
    audio.src = currentBlobUrl;
  } else if (track && track.audioUrl) {
    audio.src = track.audioUrl;
  }

  trackTitle.textContent = (track && track.title) ? track.title : 'Unknown Title';
  trackArtist.textContent = (track && track.artist) ? track.artist : 'Unknown Artist';
  currentTimeEl.textContent = '00:00';
  totalDurationEl.textContent = formatTime((track && track.duration) ? track.duration : 0);
  progressBar.value = 0;
  updateSliderFill(progressBar);

  if (track && track.coverUrl) {
    artworkCoverImg.src = track.coverUrl;
    artworkCoverImg.style.display = 'block';
  } else {
    artworkCoverImg.src = '';
    artworkCoverImg.style.display = 'none';
  }

  updateMediaSession(track);
  updateActivePlaylistItem();

  if (autoPlay) {
    playTrack();
  } else {
    pauseTrackUI();
  }
}

function playTrack() {
  if (currentIndex === -1) {
    if (currentQueue.length > 0) {
      prepareTrack(0, true);
    }
    return;
  }

  audio.play().then(() => {
    isPlaying = true;
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    playPauseBtn.setAttribute('aria-label', 'Pause');
    artworkDisc.classList.add('spinning');
    artworkDisc.classList.remove('paused');
    artworkGlow.classList.add('playing');
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }
    updateActivePlaylistItem();
  }).catch((err) => {
    console.error('Audio playback error:', err);
    pauseTrackUI();
  });
}

function pauseTrack() {
  audio.pause();
  pauseTrackUI();
}

function pauseTrackUI() {
  isPlaying = false;
  playIcon.style.display = 'block';
  pauseIcon.style.display = 'none';
  playPauseBtn.setAttribute('aria-label', 'Play');
  artworkDisc.classList.add('paused');
  artworkGlow.classList.remove('playing');
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = 'paused';
  }
  updateActivePlaylistItem();
}

function togglePlayPause() {
  if (currentQueue.length === 0) return;
  if (audio.paused || !isPlaying) {
    playTrack();
  } else {
    pauseTrack();
  }
}

function nextTrack() {
  if (currentQueue.length === 0) return;

  if (isShuffle) {
    const nextIdx = getRandomIndex(currentIndex);
    prepareTrack(nextIdx, true);
    return;
  }

  let nextIdx = currentIndex + 1;
  if (nextIdx >= currentQueue.length) {
    if (repeatMode === 'all') {
      nextIdx = 0;
    } else {
      pauseTrack();
      audio.currentTime = 0;
      progressBar.value = 0;
      updateSliderFill(progressBar);
      currentTimeEl.textContent = '00:00';
      return;
    }
  }

  prepareTrack(nextIdx, true);
}

function prevTrack() {
  if (currentQueue.length === 0) return;

  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  if (isShuffle) {
    const prevIdx = getRandomIndex(currentIndex);
    prepareTrack(prevIdx, true);
    return;
  }

  let prevIdx = currentIndex - 1;
  if (prevIdx < 0) {
    prevIdx = currentQueue.length - 1;
  }

  prepareTrack(prevIdx, true);
}

function getRandomIndex(excludeIndex) {
  if (currentQueue.length <= 1) return 0;
  let newIdx;
  do {
    newIdx = Math.floor(Math.random() * currentQueue.length);
  } while (newIdx === excludeIndex);
  return newIdx;
}

playPauseBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle('active', isShuffle);
  showToast(isShuffle ? 'Shuffle is ON' : 'Shuffle is OFF');
});

repeatBtn.addEventListener('click', () => {
  if (repeatMode === 'off') {
    repeatMode = 'all';
    repeatBtn.classList.add('active');
    repeatBtn.classList.remove('repeat-one');
    showToast('Repeat All tracks');
  } else if (repeatMode === 'all') {
    repeatMode = 'one';
    repeatBtn.classList.add('active', 'repeat-one');
    showToast('Repeat Current track');
  } else {
    repeatMode = 'off';
    repeatBtn.classList.remove('active', 'repeat-one');
    showToast('Repeat is OFF');
  }
});

audio.addEventListener('timeupdate', () => {
  if (!audio.duration || isNaN(audio.duration) || !isFinite(audio.duration) || audio.duration <= 0) return;
  const progressPercent = (audio.currentTime / audio.duration) * 100;
  progressBar.value = progressPercent;
  updateSliderFill(progressBar);
  currentTimeEl.textContent = formatTime(audio.currentTime);
  updatePositionState();
});

audio.addEventListener('loadedmetadata', () => {
  if (audio.duration && isFinite(audio.duration)) {
    totalDurationEl.textContent = formatTime(audio.duration);
    if (currentQueue[currentIndex] && !currentQueue[currentIndex].duration) {
      currentQueue[currentIndex].duration = audio.duration;
    }
  }
  updatePositionState();
});

audio.addEventListener('ended', () => {
  if (repeatMode === 'one') {
    audio.currentTime = 0;
    playTrack();
  } else {
    nextTrack();
  }
});

audio.addEventListener('error', (e) => {
  console.error('Audio playback error event:', e);
  pauseTrackUI();
  showToast('Playback error: Unable to load audio');
});

progressBar.addEventListener('input', () => {
  if (!audio.duration || isNaN(audio.duration) || !isFinite(audio.duration)) return;
  const seekTime = (progressBar.value / 100) * audio.duration;
  currentTimeEl.textContent = formatTime(seekTime);
  updateSliderFill(progressBar);
});

progressBar.addEventListener('change', () => {
  if (!audio.duration || isNaN(audio.duration) || !isFinite(audio.duration)) return;
  audio.currentTime = (progressBar.value / 100) * audio.duration;
  updatePositionState();
});

volumeBar.addEventListener('input', () => {
  audio.volume = parseFloat(volumeBar.value);
  updateSliderFill(volumeBar);
  updateVolumeIcon();
  if (audio.volume > 0) {
    lastVolume = audio.volume;
  }
});

volumeBtn.addEventListener('click', () => {
  if (audio.volume > 0) {
    lastVolume = audio.volume;
    audio.volume = 0;
    volumeBar.value = 0;
  } else {
    audio.volume = lastVolume || 0.8;
    volumeBar.value = audio.volume;
  }
  updateSliderFill(volumeBar);
  updateVolumeIcon();
});

function updateVolumeIcon() {
  if (audio.volume === 0) {
    volumeHighIcon.style.display = 'none';
    volumeMuteIcon.style.display = 'block';
  } else {
    volumeHighIcon.style.display = 'block';
    volumeMuteIcon.style.display = 'none';
  }
}

function updateTrackCount() {
  const count = allTracks.length;
  trackCountBadge.textContent = `${count} track${count === 1 ? '' : 's'}`;
  if (count === 0) {
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
  }
}

function renderTracksList() {
  const query = (searchInput.value || '').toLowerCase().trim();
  trackList.innerHTML = '';

  if (allTracks.length === 0) {
    trackList.appendChild(emptyState);
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';

  allTracks.forEach((track, index) => {
    const matches = track.title.toLowerCase().includes(query) || track.artist.toLowerCase().includes(query);
    if (!matches) return;

    const isCurrent = currentQueue[currentIndex] && currentQueue[currentIndex].id === track.id;
    const item = document.createElement('div');
    item.className = `track-item ${isCurrent ? 'active' : ''} ${isCurrent && isPlaying ? 'playing' : ''}`;
    item.dataset.id = track.id;

    item.innerHTML = `
      <div class="track-num-or-eq">
        <span class="track-num-text">${index + 1}</span>
        <div class="equalizer-anim">
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
        </div>
      </div>
      <div class="track-details">
        <div class="track-item-title">${escapeHtml(track.title)}</div>
        <div class="track-item-artist">${escapeHtml(track.artist)}</div>
      </div>
      <div class="track-item-meta">
        <span class="track-item-duration">${formatTime(track.duration)}</span>
        <button class="icon-action-btn btn-add-to-pl" data-id="${track.id}" title="Add to Playlist">
          <svg viewBox="0 0 24 24">
            <path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"/>
          </svg>
        </button>
        <button class="icon-action-btn btn-delete-track" data-id="${track.id}" title="Delete track">
          <svg viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    `;

    item.addEventListener('click', (e) => {
      if (e.target.closest('.icon-action-btn')) return;
      currentQueue = [...allTracks];
      const targetQueueIdx = currentQueue.findIndex((t) => t.id === track.id);
      if (currentIndex === targetQueueIdx && isCurrent) {
        togglePlayPause();
      } else {
        prepareTrack(targetQueueIdx, true);
      }
    });

    const addPlBtn = item.querySelector('.btn-add-to-pl');
    addPlBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openAddToPlaylistModal(track.id);
    });

    const deleteBtn = item.querySelector('.btn-delete-track');
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await removeTrackPermanently(track.id);
    });

    trackList.appendChild(item);
  });
}

function updateActivePlaylistItem() {
  const currentTrackId = currentQueue[currentIndex] ? currentQueue[currentIndex].id : null;
  const items = document.querySelectorAll('.track-item');
  items.forEach((item) => {
    const id = parseInt(item.dataset.id, 10);
    if (id === currentTrackId) {
      item.classList.add('active');
      item.classList.toggle('playing', isPlaying);
    } else {
      item.classList.remove('active', 'playing');
    }
  });
}

async function removeTrackPermanently(id) {
  try {
    const isCurrentPlaying = currentQueue[currentIndex] && currentQueue[currentIndex].id === id;
    await deleteTrack(id);

    allTracks = allTracks.filter((t) => t.id !== id);
    currentQueue = currentQueue.filter((t) => t.id !== id);
    allPlaylists = await getAllPlaylists();

    if (currentQueue.length === 0) {
      audio.pause();
      audio.src = '';
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
        currentBlobUrl = null;
      }
      currentIndex = -1;
      isPlaying = false;
      trackTitle.textContent = 'No Track Selected';
      trackArtist.textContent = 'Add songs to start listening';
      currentTimeEl.textContent = '00:00';
      totalDurationEl.textContent = '00:00';
      progressBar.value = 0;
      updateSliderFill(progressBar);
      artworkCoverImg.src = '';
      artworkCoverImg.style.display = 'none';
      pauseTrackUI();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }
    } else if (isCurrentPlaying) {
      const nextIdx = currentIndex >= currentQueue.length ? 0 : currentIndex;
      prepareTrack(nextIdx, isPlaying);
    }

    renderTracksList();
    updateTrackCount();
    if (activePlaylistId) {
      renderPlaylistDetail(activePlaylistId);
    }
    showToast('Track deleted from storage');
  } catch (err) {
    showToast('Failed to delete track');
  }
}

searchInput.addEventListener('input', () => {
  renderTracksList();
});

btnNewPlaylist.addEventListener('click', () => {
  newPlaylistNameInput.value = '';
  createPlaylistModal.classList.add('open');
  newPlaylistNameInput.focus();
});

btnCancelCreatePlaylist.addEventListener('click', () => {
  createPlaylistModal.classList.remove('open');
});

btnConfirmCreatePlaylist.addEventListener('click', async () => {
  const name = newPlaylistNameInput.value.trim();
  if (!name) {
    showToast('Please enter a playlist name');
    return;
  }

  try {
    const saved = await savePlaylist({ name, trackIds: [] });
    allPlaylists.push(saved);
    createPlaylistModal.classList.remove('open');
    renderPlaylistsGrid();
    showToast(`Created playlist "${name}"`);
  } catch (err) {
    showToast('Failed to create playlist');
  }
});

function renderPlaylistsGrid() {
  playlistsContainer.innerHTML = '';
  const count = allPlaylists.length;
  playlistCountBadge.textContent = `${count} playlist${count === 1 ? '' : 's'}`;

  if (count === 0) {
    playlistsContainer.appendChild(playlistsEmptyState);
    playlistsEmptyState.style.display = 'flex';
    return;
  }

  playlistsEmptyState.style.display = 'none';

  allPlaylists.forEach((pl) => {
    const card = document.createElement('div');
    card.className = 'playlist-card-item';
    card.dataset.id = pl.id;

    const trackCount = pl.trackIds ? pl.trackIds.length : 0;

    card.innerHTML = `
      <div class="playlist-card-info">
        <div class="playlist-icon-wrap">
          <svg viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div>
          <div class="playlist-name-text">${escapeHtml(pl.name)}</div>
          <div class="playlist-count-text">${trackCount} track${trackCount === 1 ? '' : 's'}</div>
        </div>
      </div>
      <div class="playlist-card-actions">
        <button class="icon-action-btn btn-play-pl" title="Play Playlist">
          <svg viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-play-pl')) {
        e.stopPropagation();
        playPlaylistDirectly(pl.id);
      } else {
        openPlaylistDetail(pl.id);
      }
    });

    playlistsContainer.appendChild(card);
  });
}

function openPlaylistDetail(playlistId) {
  activePlaylistId = playlistId;
  playlistsListView.style.display = 'none';
  playlistDetailView.style.display = 'block';
  renderPlaylistDetail(playlistId);
}

btnBackToPlaylists.addEventListener('click', () => {
  activePlaylistId = null;
  playlistDetailView.style.display = 'none';
  playlistsListView.style.display = 'block';
  renderPlaylistsGrid();
});

function renderPlaylistDetail(playlistId) {
  const pl = allPlaylists.find((p) => p.id === Number(playlistId));
  if (!pl) return;

  currentPlaylistTitle.textContent = pl.name;
  const trackIds = pl.trackIds || [];
  const tracksInPl = allTracks.filter((t) => trackIds.includes(t.id));
  currentPlaylistCount.textContent = `${tracksInPl.length} track${tracksInPl.length === 1 ? '' : 's'}`;

  playlistTracksContainer.innerHTML = '';

  if (tracksInPl.length === 0) {
    playlistTracksContainer.innerHTML = `
      <div class="empty-state">
        <h4 class="empty-state-title" style="font-size: 0.95rem;">Playlist is empty</h4>
        <p class="empty-state-desc" style="font-size: 0.8rem;">Add tracks to this playlist from the "Tracks" tab.</p>
      </div>
    `;
    return;
  }

  tracksInPl.forEach((track, index) => {
    const isCurrent = currentQueue[currentIndex] && currentQueue[currentIndex].id === track.id;
    const item = document.createElement('div');
    item.className = `track-item ${isCurrent ? 'active' : ''} ${isCurrent && isPlaying ? 'playing' : ''}`;
    item.dataset.id = track.id;

    item.innerHTML = `
      <div class="track-num-or-eq">
        <span class="track-num-text">${index + 1}</span>
        <div class="equalizer-anim">
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
        </div>
      </div>
      <div class="track-details">
        <div class="track-item-title">${escapeHtml(track.title)}</div>
        <div class="track-item-artist">${escapeHtml(track.artist)}</div>
      </div>
      <div class="track-item-meta">
        <span class="track-item-duration">${formatTime(track.duration)}</span>
        <button class="icon-action-btn btn-remove-from-pl" data-id="${track.id}" title="Remove from playlist">
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    `;

    item.addEventListener('click', (e) => {
      if (e.target.closest('.btn-remove-from-pl')) return;
      currentQueue = [...tracksInPl];
      prepareTrack(index, true);
    });

    const removeBtn = item.querySelector('.btn-remove-from-pl');
    removeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await removeTrackFromPlaylist(pl.id, track.id);
      allPlaylists = await getAllPlaylists();
      renderPlaylistDetail(pl.id);
      showToast(`Removed from "${pl.name}"`);
    });

    playlistTracksContainer.appendChild(item);
  });
}

function playPlaylistDirectly(playlistId) {
  const pl = allPlaylists.find((p) => p.id === Number(playlistId));
  if (!pl || !pl.trackIds || pl.trackIds.length === 0) {
    showToast('This playlist is empty');
    return;
  }

  const tracksInPl = allTracks.filter((t) => pl.trackIds.includes(t.id));
  if (tracksInPl.length === 0) {
    showToast('No saved tracks found for this playlist');
    return;
  }

  currentQueue = [...tracksInPl];
  prepareTrack(0, true);
  showToast(`Playing playlist "${pl.name}"`);
}

btnPlayCurrentPlaylist.addEventListener('click', () => {
  if (activePlaylistId) {
    playPlaylistDirectly(activePlaylistId);
  }
});

btnRenameCurrentPlaylist.addEventListener('click', () => {
  if (!activePlaylistId) return;
  const pl = allPlaylists.find((p) => p.id === Number(activePlaylistId));
  if (!pl) return;

  playlistToRenameId = pl.id;
  renamePlaylistInput.value = pl.name;
  renamePlaylistModal.classList.add('open');
  renamePlaylistInput.focus();
});

btnCancelRenamePlaylist.addEventListener('click', () => {
  renamePlaylistModal.classList.remove('open');
});

btnConfirmRenamePlaylist.addEventListener('click', async () => {
  const newName = renamePlaylistInput.value.trim();
  if (!newName) {
    showToast('Please enter a valid name');
    return;
  }

  try {
    await updatePlaylist(playlistToRenameId, { name: newName });
    allPlaylists = await getAllPlaylists();
    renamePlaylistModal.classList.remove('open');
    if (activePlaylistId === playlistToRenameId) {
      renderPlaylistDetail(activePlaylistId);
    }
    showToast(`Renamed playlist to "${newName}"`);
  } catch (err) {
    showToast('Failed to rename playlist');
  }
});

btnDeleteCurrentPlaylist.addEventListener('click', async () => {
  if (!activePlaylistId) return;
  const pl = allPlaylists.find((p) => p.id === Number(activePlaylistId));
  if (!pl) return;

  try {
    await deletePlaylist(pl.id);
    allPlaylists = allPlaylists.filter((p) => p.id !== pl.id);
    activePlaylistId = null;
    playlistDetailView.style.display = 'none';
    playlistsListView.style.display = 'block';
    renderPlaylistsGrid();
    showToast(`Deleted playlist "${pl.name}"`);
  } catch (err) {
    showToast('Failed to delete playlist');
  }
});

function openAddToPlaylistModal(trackId) {
  trackToAddId = trackId;
  modalPlaylistsList.innerHTML = '';

  if (allPlaylists.length === 0) {
    modalPlaylistsList.innerHTML = `
      <div style="text-align: center; padding: 16px; color: var(--text-muted); font-size: 0.85rem;">
        No playlists found. Create one first in the "Playlists" tab.
      </div>
    `;
  } else {
    allPlaylists.forEach((pl) => {
      const isAlreadyIn = pl.trackIds && pl.trackIds.includes(Number(trackId));
      const opt = document.createElement('div');
      opt.className = 'modal-playlist-option';
      opt.innerHTML = `
        <span style="font-weight: 600; font-size: 0.9rem;">${escapeHtml(pl.name)}</span>
        <button class="btn-secondary" style="padding: 4px 12px; font-size: 0.75rem;">
          ${isAlreadyIn ? 'Added ✓' : 'Add +'}
        </button>
      `;

      const btn = opt.querySelector('button');
      btn.addEventListener('click', async () => {
        if (isAlreadyIn) {
          showToast('Track is already in this playlist');
          return;
        }

        try {
          await addTrackToPlaylist(pl.id, trackId);
          allPlaylists = await getAllPlaylists();
          addToPlaylistModal.classList.remove('open');
          showToast(`Added to "${pl.name}"`);
        } catch (err) {
          showToast('Failed to add track to playlist');
        }
      });

      modalPlaylistsList.appendChild(opt);
    });
  }

  addToPlaylistModal.classList.add('open');
}

btnCancelAddToPlaylist.addEventListener('click', () => {
  addToPlaylistModal.classList.remove('open');
});

btnSearchOnline.addEventListener('click', performOnlineSearch);
onlineSearchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') performOnlineSearch();
});

async function performOnlineSearch() {
  const query = (onlineSearchInput.value || '').trim();
  if (!query) {
    showToast('Please enter a search query');
    return;
  }

  if (!navigator.onLine) {
    showToast('Online search unavailable in offline mode');
    return;
  }

  onlineResultsContainer.innerHTML = `
    <div class="search-skeleton-wrap">
      <div class="search-skeleton-item"></div>
      <div class="search-skeleton-item"></div>
      <div class="search-skeleton-item"></div>
      <div class="search-skeleton-item"></div>
    </div>
  `;

  try {
    let tracks = await searchJamendo(query);
    if (!tracks || tracks.length === 0) {
      tracks = await searchArchive(query);
    }

    if (tracks && tracks.length > 0) {
      renderOnlineResults(tracks);
    } else {
      renderOnlineEmpty();
    }
  } catch (err) {
    try {
      const fallbackTracks = await searchArchive(query);
      if (fallbackTracks && fallbackTracks.length > 0) {
        renderOnlineResults(fallbackTracks);
      } else {
        renderOnlineEmpty();
      }
    } catch (e) {
      renderOnlineEmpty();
    }
  }
}

async function searchJamendo(query) {
  const primaryUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=85bfb204&format=json&limit=20&search=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(primaryUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && data.headers && data.headers.status === 'success' && Array.isArray(data.results) && data.results.length > 0) {
        const valid = parseJamendoResults(data.results);
        if (valid.length > 0) return valid;
      }
    }
  } catch (e) {}

  const fallbackCid = '3dce8b55';
  const urls = [
    `https://api.jamendo.com/v3.0/tracks/?client_id=${fallbackCid}&format=json&limit=20&search=${encodeURIComponent(query)}`,
    `https://api.jamendo.com/v3.0/tracks/?client_id=${fallbackCid}&format=json&limit=20&namesearch=${encodeURIComponent(query)}`,
    `https://api.jamendo.com/v3.0/tracks/?client_id=${fallbackCid}&format=json&limit=20&tags=${encodeURIComponent(query)}`
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.headers && data.headers.status === 'success' && Array.isArray(data.results) && data.results.length > 0) {
        const valid = parseJamendoResults(data.results);
        if (valid.length > 0) return valid;
      }
    } catch (e) {}
  }

  return [];
}

function parseJamendoResults(results) {
  if (!Array.isArray(results)) return [];
  return results
    .filter((t) => (t.audio && t.audio.trim() !== '') || (t.audiodownload && t.audiodownload.trim() !== ''))
    .map((t) => ({
      id: t.id,
      name: t.name || 'Untitled Track',
      artist_name: t.artist_name || 'Jamendo Artist',
      duration: isFinite(t.duration) && t.duration > 0 ? Number(t.duration) : 0,
      album_image: t.image || t.album_image || 'icon-192.png',
      audio: t.audio || t.audiodownload || '',
      isSnippet: false
    }));
}

async function searchArchive(query) {
  const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}+AND+mediatype:audio&sort[]=downloads+desc&output=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const docs = (data && data.response && data.response.docs) ? data.response.docs.slice(0, 15) : [];
  if (docs.length === 0) return [];

  const metaPromises = docs.map(async (doc) => {
    try {
      const metaRes = await fetch(`https://archive.org/metadata/${doc.identifier}`);
      if (!metaRes.ok) return null;
      const metaData = await metaRes.json();
      const files = (metaData.files || []).filter((f) => 
        f.name && 
        f.private !== 'true' && 
        f.private !== true &&
        (f.name.toLowerCase().endsWith('.mp3') || f.name.toLowerCase().endsWith('.ogg') || f.name.toLowerCase().endsWith('.m4a') || f.name.toLowerCase().endsWith('.flac') || f.format === 'VBR MP3' || f.format === 'MP3')
      );
      if (files.length === 0) return null;
      const file = files[0];
      let dur = 0;
      if (file.length) {
        if (typeof file.length === 'string' && file.length.includes(':')) {
          const parts = file.length.split(':').map(Number);
          if (parts.length === 2) dur = parts[0] * 60 + parts[1];
          else if (parts.length === 3) dur = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else {
          dur = parseFloat(file.length) || 0;
        }
      }
      const title = file.title || doc.title || file.name.replace(/\.[^/.]+$/, '');
      const artist = file.artist || file.creator || doc.creator || 'Internet Archive';
      const cleanTitle = Array.isArray(title) ? title[0] : title;
      const cleanArtist = Array.isArray(artist) ? artist.join(', ') : artist;
      const audioUrl = `https://archive.org/download/${doc.identifier}/${encodeURIComponent(file.name)}`;
      const imgUrl = `https://archive.org/services/img/${doc.identifier}`;

      return {
        id: doc.identifier,
        name: cleanTitle || 'Archive Audio',
        artist_name: cleanArtist || 'Internet Archive',
        duration: Math.round(dur),
        album_image: imgUrl,
        audio: audioUrl,
        isSnippet: false
      };
    } catch (e) {
      return null;
    }
  });

  const parsed = await Promise.all(metaPromises);
  return parsed.filter((t) => t && t.audio && t.audio.trim() !== '');
}

function renderOnlineEmpty() {
  onlineResultsContainer.innerHTML = `
    <div class="empty-state">
      <h3 class="empty-state-title">No results found</h3>
      <p class="empty-state-desc">Try searching for other artists, songs, or genres.</p>
    </div>
  `;
}

function renderOnlineResults(tracks) {
  onlineResultsContainer.innerHTML = '';

  tracks.forEach((track) => {
    const isSaved = allTracks.some((t) => t.title === track.name && t.artist === track.artist_name);
    const item = document.createElement('div');
    item.className = 'online-track-item';

    const thumbSrc = track.album_image || track.image || 'icon-192.png';
    const audioUrl = track.audio || track.audiodownload || '';

    item.innerHTML = `
      <div class="online-track-left">
        <img class="online-thumb" src="${thumbSrc}" alt="${escapeHtml(track.name)}" loading="lazy" onerror="this.onerror=null;this.src='icon-192.png'">
        <div class="online-track-info">
          <div class="online-track-title">${escapeHtml(track.name)}</div>
          <div class="online-track-subtitle">
            <span class="online-track-artist">${escapeHtml(track.artist_name || 'Unknown Artist')}</span>
            <span class="track-badge-full">Full Track</span>
            <span class="online-track-duration">${formatTime(track.duration)}</span>
          </div>
        </div>
      </div>
      <div class="online-track-actions">
        ${audioUrl ? `
          <button class="icon-action-btn btn-preview-online" title="Preview audio">
            <svg viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        ` : ''}
        <button class="btn-download-save ${isSaved ? 'saved' : ''}" ${isSaved ? 'disabled' : ''}>
          ${isSaved ? `
            <svg viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <span>Saved</span>
          ` : `
            <svg viewBox="0 0 24 24">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/>
            </svg>
            <span>Save Offline</span>
          `}
        </button>
      </div>
    `;

    const previewBtn = item.querySelector('.btn-preview-online');
    if (previewBtn && audioUrl) {
      previewBtn.addEventListener('click', () => {
        toggleOnlinePreview(audioUrl, previewBtn);
      });
    }

    const downloadBtn = item.querySelector('.btn-download-save');
    if (downloadBtn && !isSaved && audioUrl) {
      downloadBtn.addEventListener('click', async () => {
        await downloadAndSaveOnlineTrack(track, audioUrl, thumbSrc, downloadBtn);
      });
    }

    onlineResultsContainer.appendChild(item);
  });
}

function toggleOnlinePreview(url, btn) {
  if (onlinePreviewAudio && onlinePreviewAudio.src === url && !onlinePreviewAudio.paused) {
    onlinePreviewAudio.pause();
    onlinePreviewAudio.src = '';
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    onlinePreviewAudio = null;
    onlinePreviewBtn = null;
    return;
  }

  if (onlinePreviewAudio) {
    onlinePreviewAudio.pause();
    onlinePreviewAudio.src = '';
    if (onlinePreviewBtn) {
      onlinePreviewBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    }
  }

  pauseTrack();

  onlinePreviewAudio = new Audio(url);
  onlinePreviewBtn = btn;
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

  onlinePreviewAudio.play().catch(() => {
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    onlinePreviewAudio = null;
    onlinePreviewBtn = null;
    showToast('Failed to play preview stream');
  });

  onlinePreviewAudio.addEventListener('ended', () => {
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    onlinePreviewAudio = null;
    onlinePreviewBtn = null;
  });

  onlinePreviewAudio.addEventListener('error', () => {
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    onlinePreviewAudio = null;
    onlinePreviewBtn = null;
    showToast('Preview stream unavailable');
  });
}

async function downloadAndSaveOnlineTrack(track, audioUrl, coverUrl, buttonEl) {
  buttonEl.classList.add('loading');
  buttonEl.disabled = true;
  buttonEl.innerHTML = `
    <span class="btn-spinner"></span>
    <span>Saving...</span>
  `;

  try {
    const res = await fetch(audioUrl);
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();

    let computedDuration = await getAudioDuration(blob);
    if (!computedDuration || !isFinite(computedDuration) || computedDuration <= 0) {
      computedDuration = isFinite(track.duration) && track.duration > 0 ? Number(track.duration) : 0;
    }

    const saved = await saveTrack(blob, {
      title: track.name || 'Online Track',
      artist: track.artist_name || 'Jamendo Artist',
      duration: computedDuration,
      coverUrl: coverUrl || ''
    });

    allTracks.push(saved);
    currentQueue = [...allTracks];
    renderTracksList();
    updateTrackCount();

    buttonEl.classList.remove('loading');
    buttonEl.classList.add('saved');
    buttonEl.disabled = true;
    buttonEl.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      <span>Saved</span>
    `;

    showToast(`Saved "${track.name}" for offline listening!`);

    if (currentIndex === -1) {
      prepareTrack(allTracks.length - 1, false);
    }
  } catch (err) {
    buttonEl.classList.remove('loading');
    buttonEl.disabled = false;
    buttonEl.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
      </svg>
      <span>Retry</span>
    `;
    showToast('Download failed. Please check connection and try again.');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

let toastTimer = null;
function showToast(message) {
  if (toastTimer) clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2400);
}

function setupMediaSessionHandlers() {
  if (!('mediaSession' in navigator)) return;

  navigator.mediaSession.setActionHandler('play', () => playTrack());
  navigator.mediaSession.setActionHandler('pause', () => pauseTrack());
  navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
  navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());

  try {
    navigator.mediaSession.setActionHandler('stop', () => pauseTrack());
  } catch (e) {}

  try {
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined && audio.duration && isFinite(audio.duration)) {
        audio.currentTime = details.seekTime;
        updatePositionState();
      }
    });
  } catch (e) {}

  try {
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const skip = details.seekOffset || 10;
      audio.currentTime = Math.max(audio.currentTime - skip, 0);
      updatePositionState();
    });
  } catch (e) {}

  try {
    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const skip = details.seekOffset || 10;
      if (audio.duration && isFinite(audio.duration)) {
        audio.currentTime = Math.min(audio.currentTime + skip, audio.duration);
      }
      updatePositionState();
    });
  } catch (e) {}
}

function updateMediaSession(track) {
  if (!('mediaSession' in navigator)) return;

  const artworks = [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icon.svg', sizes: '512x512', type: 'image/svg+xml' }
  ];

  if (track && track.coverUrl) {
    artworks.unshift({ src: track.coverUrl, sizes: '300x300', type: 'image/jpeg' });
  }

  navigator.mediaSession.metadata = new MediaMetadata({
    title: (track && track.title) ? track.title : 'SoundPulse Track',
    artist: (track && track.artist) ? track.artist : 'SoundPulse Offline Library',
    album: 'SoundPulse Offline Collection',
    artwork: artworks
  });
}

function updatePositionState() {
  if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) return;
  if (!audio.duration || isNaN(audio.duration) || !isFinite(audio.duration) || audio.duration <= 0) return;

  try {
    navigator.mediaSession.setPositionState({
      duration: audio.duration,
      playbackRate: audio.playbackRate || 1,
      position: isFinite(audio.currentTime) ? audio.currentTime : 0
    });
  } catch (e) {}
}
