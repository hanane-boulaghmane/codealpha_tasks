/* ============================
   PLAYLIST DATA
   Using free, public-domain audio samples from the web.
   Replace src URLs with your own audio files as needed.
   ============================ */
const songs = [
  {
    title:    'Chill Lofi Beat',
    artist:   'Free Music Archive',
    duration: '2:30',
    icon:     '🎵',
    color:    'linear-gradient(135deg, #1e1b4b, #312e81)',
    src:      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    title:    'Acoustic Dreams',
    artist:   'SoundHelix',
    duration: '3:15',
    icon:     '🎸',
    color:    'linear-gradient(135deg, #1a2e1a, #166534)',
    src:      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    title:    'Electronic Pulse',
    artist:   'SoundHelix',
    duration: '2:55',
    icon:     '🎹',
    color:    'linear-gradient(135deg, #1e1a30, #7c3aed)',
    src:      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    title:    'Jazz Vibes',
    artist:   'SoundHelix',
    duration: '3:40',
    icon:     '🎺',
    color:    'linear-gradient(135deg, #2d1b0e, #92400e)',
    src:      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    title:    'Ambient Space',
    artist:   'SoundHelix',
    duration: '4:10',
    icon:     '🌌',
    color:    'linear-gradient(135deg, #0c1a2e, #1d4ed8)',
    src:      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  }
];


/* ============================
   STATE
   ============================ */
let currentIndex = 0;
let isPlaying    = false;
let isShuffle    = false;
let isRepeat     = false;
let isDragging   = false;


/* ============================
   DOM REFERENCES
   ============================ */
const audioEl       = document.getElementById('audioEl');
const btnPlay       = document.getElementById('btnPlay');
const btnPrev       = document.getElementById('btnPrev');
const btnNext       = document.getElementById('btnNext');
const btnShuffle    = document.getElementById('btnShuffle');
const btnRepeat     = document.getElementById('btnRepeat');
const songTitle     = document.getElementById('songTitle');
const songArtist    = document.getElementById('songArtist');
const albumArt      = document.getElementById('albumArt');
const artIcon       = document.getElementById('artIcon');
const progressFill  = document.getElementById('progressFill');
const progressThumb = document.getElementById('progressThumb');
const progressTrack = document.getElementById('progressTrack');
const currentTimeEl = document.getElementById('currentTime');
const durationEl    = document.getElementById('duration');
const volumeSlider  = document.getElementById('volumeSlider');
const volLabel      = document.getElementById('volLabel');
const volIcon       = document.getElementById('volIcon');
const playlistList  = document.getElementById('playlistList');


/* ============================
   HELPERS
   ============================ */

/**
 * Format seconds into m:ss string.
 * @param {number} secs
 * @returns {string}
 */
function formatTime(secs) {
  if (isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return m + ':' + String(s).padStart(2, '0');
}

/**
 * Get a random index different from current.
 * @returns {number}
 */
function randomIndex() {
  let idx;
  do { idx = Math.floor(Math.random() * songs.length); }
  while (idx === currentIndex && songs.length > 1);
  return idx;
}


/* ============================
   LOAD A SONG
   ============================ */

/**
 * Load and optionally autoplay a song by index.
 * @param {number}  index     - index in songs array
 * @param {boolean} autoplay  - whether to play immediately
 */
function loadSong(index, autoplay = false) {
  const song = songs[index];
  currentIndex = index;

  // Update display
  songTitle.textContent  = song.title;
  songArtist.textContent = song.artist;
  artIcon.textContent    = song.icon;
  albumArt.style.background = song.color;

  // Reset progress
  progressFill.style.width  = '0%';
  progressThumb.style.left  = '0%';
  currentTimeEl.textContent = '0:00';
  durationEl.textContent    = song.duration;

  // Load audio
  audioEl.src = song.src;
  audioEl.load();

  // Update playlist highlight
  updatePlaylistHighlight();

  if (autoplay) {
    playAudio();
  } else {
    pauseAudio();
  }
}


/* ============================
   PLAY / PAUSE
   ============================ */

function playAudio() {
  audioEl.play().catch(() => {
    // Autoplay blocked — show play button
    pauseAudio();
  });
  isPlaying = true;
  btnPlay.textContent = '⏸';
  albumArt.classList.add('spinning');
  albumArt.classList.remove('paused');
}

function pauseAudio() {
  audioEl.pause();
  isPlaying = false;
  btnPlay.textContent = '▶';
  albumArt.classList.add('paused');
}

function togglePlay() {
  if (isPlaying) {
    pauseAudio();
  } else {
    // If no src loaded yet, load the first song
    if (!audioEl.src || audioEl.src === window.location.href) {
      loadSong(currentIndex, true);
    } else {
      playAudio();
    }
  }
}


/* ============================
   NEXT / PREVIOUS
   ============================ */

function nextSong() {
  let next;
  if (isShuffle) {
    next = randomIndex();
  } else {
    next = (currentIndex + 1) % songs.length;
  }
  loadSong(next, isPlaying);
}

function prevSong() {
  // If more than 3 seconds in, restart the current song
  if (audioEl.currentTime > 3) {
    audioEl.currentTime = 0;
    return;
  }
  const prev = (currentIndex - 1 + songs.length) % songs.length;
  loadSong(prev, isPlaying);
}


/* ============================
   PROGRESS BAR
   ============================ */

/**
 * Update the progress bar fill and thumb position.
 * @param {number} percent  - 0 to 100
 */
function setProgressUI(percent) {
  progressFill.style.width = percent + '%';
  progressThumb.style.left = percent + '%';
}

/**
 * Seek audio to a position clicked on the progress bar.
 * @param {MouseEvent} e
 */
function seekTo(e) {
  if (!audioEl.duration) return;
  const rect    = progressTrack.getBoundingClientRect();
  const clickX  = e.clientX - rect.left;
  const percent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
  audioEl.currentTime = (percent / 100) * audioEl.duration;
  setProgressUI(percent);
}


/* ============================
   VOLUME
   ============================ */

/**
 * Update audio volume and the icon/label.
 * @param {number} val  - 0 to 100
 */
function setVolume(val) {
  const v = parseInt(val);
  audioEl.volume = v / 100;
  volLabel.textContent = v + '%';

  if (v === 0)       volIcon.textContent = '🔇';
  else if (v < 40)   volIcon.textContent = '🔈';
  else if (v < 75)   volIcon.textContent = '🔉';
  else               volIcon.textContent = '🔊';
}

/**
 * Toggle mute on/off when clicking the volume icon.
 */
function toggleMute() {
  if (audioEl.volume > 0) {
    volumeSlider.dataset.prev = volumeSlider.value;
    volumeSlider.value = 0;
    setVolume(0);
  } else {
    const prev = volumeSlider.dataset.prev || 80;
    volumeSlider.value = prev;
    setVolume(prev);
  }
}


/* ============================
   PLAYLIST RENDER
   ============================ */

function buildPlaylist() {
  playlistList.innerHTML = '';
  songs.forEach((song, i) => {
    const li = document.createElement('li');
    li.className = 'playlist-item' + (i === currentIndex ? ' active' : '');
    li.dataset.index = i;
    li.innerHTML = `
      <div class="playlist-item-title">${song.title}</div>
      <div class="playlist-item-artist">${song.artist}</div>
      <div class="playlist-item-duration">${song.duration}</div>
    `;
    li.addEventListener('click', () => loadSong(i, true));
    playlistList.appendChild(li);
  });
}

function updatePlaylistHighlight() {
  document.querySelectorAll('.playlist-item').forEach((el, i) => {
    el.classList.toggle('active', i === currentIndex);
  });
}


/* ============================
   AUDIO EVENT LISTENERS
   ============================ */

// Update progress bar as song plays
audioEl.addEventListener('timeupdate', () => {
  if (!audioEl.duration || isDragging) return;
  const percent = (audioEl.currentTime / audioEl.duration) * 100;
  setProgressUI(percent);
  currentTimeEl.textContent = formatTime(audioEl.currentTime);
  durationEl.textContent    = formatTime(audioEl.duration);
});

// When song ends
audioEl.addEventListener('ended', () => {
  if (isRepeat) {
    audioEl.currentTime = 0;
    playAudio();
  } else {
    nextSong();
  }
});

// When metadata loaded, update duration
audioEl.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audioEl.duration);
});


/* ============================
   BUTTON EVENT LISTENERS
   ============================ */
btnPlay.addEventListener('click',    togglePlay);
btnNext.addEventListener('click',    nextSong);
btnPrev.addEventListener('click',    prevSong);

btnShuffle.addEventListener('click', () => {
  isShuffle = !isShuffle;
  btnShuffle.classList.toggle('on', isShuffle);
});

btnRepeat.addEventListener('click', () => {
  isRepeat = !isRepeat;
  btnRepeat.classList.toggle('on', isRepeat);
});


/* ============================
   PROGRESS BAR INTERACTIONS
   ============================ */
progressTrack.addEventListener('click', seekTo);

// Drag support
progressTrack.addEventListener('mousedown', (e) => {
  isDragging = true;
  seekTo(e);
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) seekTo(e);
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});


/* ============================
   VOLUME INTERACTIONS
   ============================ */
volumeSlider.addEventListener('input', (e) => setVolume(e.target.value));
volIcon.addEventListener('click', toggleMute);


/* ============================
   KEYBOARD SHORTCUTS
   ============================ */
document.addEventListener('keydown', (e) => {
  // Ignore if typing in an input
  if (e.target.tagName === 'INPUT') return;

  switch (e.key) {
    case ' ':
      e.preventDefault();
      togglePlay();
      break;
    case 'ArrowRight':
      nextSong();
      break;
    case 'ArrowLeft':
      prevSong();
      break;
    case 'ArrowUp':
      e.preventDefault();
      volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 5);
      setVolume(volumeSlider.value);
      break;
    case 'ArrowDown':
      e.preventDefault();
      volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 5);
      setVolume(volumeSlider.value);
      break;
    case 'm':
    case 'M':
      toggleMute();
      break;
    case 's':
    case 'S':
      btnShuffle.click();
      break;
    case 'r':
    case 'R':
      btnRepeat.click();
      break;
  }
});


/* ============================
   INIT
   ============================ */
(function init() {
  buildPlaylist();
  loadSong(0, false);   // Load first song without autoplay
  setVolume(80);         // Set default volume
})();