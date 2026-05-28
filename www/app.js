// ==========================================================================
// Nebula Player — Core Audio Engine & UI Interactions
// ==========================================================================

// Prepopulated Synthwave / Electronic Playlist (Hosted Locally)
const DEFAULT_PLAYLIST = [
    {
        title: "Synthwave Horizon",
        artist: "SoundHelix Project",
        url: "music/song1.mp3",
        cover: "🌅",
        lrc: `[00:00.00]🪐 Инициализация систем Nebula Player...
[00:03.00]✨ Запуск двигателей на полную мощность.
[00:06.00]🚀 Мы взлетаем над неоновым горизонтом!
[00:10.00]🌌 Вокруг мерцают далекие скопления звезд...
[00:15.00]🎵 Synthwave Horizon уносит нас в бесконечность.
[00:20.00]🔮 Частота баса синхронизируется с пульсом вселенной.
[00:25.00]⚡ Энергия переполняет наши генераторы!
[00:30.00]🌠 Визуализация звука: частотные бары активны.
[00:35.00]🛸 Обнаружен пространственный ревербератор — глубина 100%.
[00:40.00]🎆 Неоновые вспышки освещают бесконечный космос.
[00:46.00]🌌 Мы летим сквозь гиперпространство...
[00:52.00]✨ Звездная пыль ложится на обшивку корабля.
[00:58.00]💫 Музыка — это наш универсальный язык общения.
[01:04.00]🛰️ Сигнал стабилен. Запись телеметрии завершена.
[01:10.00]🚀 Подготовка к следующему прыжку...`
    },
    {
        title: "Digital Neon Dream",
        artist: "SoundHelix Project",
        url: "music/song2.mp3",
        cover: "🌃",
        lrc: `[00:00.00]🌃 Добро пожаловать в Цифровой Неоновый Сон.
[00:04.00]🌌 Сигналы пробивают тишину виртуальной реальности.
[00:08.00]👾 Матрица кода формирует новые миры вокруг нас.
[00:13.00]💡 Яркие синие и розовые огни отражаются в глазах.
[00:18.00]🌈 Сеть пульсирует в ритме 120 ударов в минуту.
[00:23.00]🌐 Каждый пакет данных несет чистую гармонию звука.
[00:28.00]🔊 Басс-бочка сотрясает основы этого виртуального мира.
[00:34.00]🧪 Настройка высоких частот: яркость повышена.
[00:40.00]🛸 Мы растворяемся в бесконечном потоке байтов.
[00:46.00]💾 Сохранение текущего состояния сознания... Done.
[00:52.00]✨ Светящиеся дорожки ведут к выходу из системы.`
    },
    {
        title: "Nebula Voyager",
        artist: "SoundHelix Project",
        url: "music/song3.mp3",
        cover: "🌌",
        lrc: `[00:00.00]🌌 Космический странник Nebula Voyager отправляется в путь.
[00:04.00]🪐 Курс проложен сквозь Туманность Андромеды.
[00:09.00]🌠 Гравитационный маневр около белого карлика.
[00:14.00]🌟 Звездные паруса ловят солнечный ветер.
[00:19.00]🛰️ Мы ловим загадочные радиосигналы из центра галактики.
[00:24.00]🛸 Внеземные цивилизации транслируют свой плейлист!
[00:29.00]💥 Переход в режим круговой визуализации волны.
[00:35.00]🌀 Время замедляется под действием гравитации.
[00:40.00]✨ Мы — исследователи неведомых глубин космоса.
[00:47.00]🚀 Приближение к сингулярности... Все системы в норме.`
    },
    {
        title: "Cyberpunk Overdrive",
        artist: "SoundHelix Project",
        url: "music/song4.mp3",
        cover: "🏎️",
        lrc: `[00:00.00]🏎️ Режим овердрайва активирован! Скорость максимальная.
[00:04.00]🌆 Дождливые улицы кибер-мегаполиса проносятся мимо.
[00:08.00]🔥 Двигатель ревет в такт дисторшн-синтезаторам.
[00:12.00]🕶️ Будущее уже здесь, и оно звучит невероятно громко!
[00:17.00]⚡ Вспышки молний подсвечивают темные небоскребы.
[00:22.00]🚨 Внимание! Превышение допустимого уровня баса!
[00:27.00]🦾 Импланты улавливают малейшие звуковые колебания.
[00:32.00]🛸 Летающие авто пролетают прямо над головой.
[00:38.00]🌌 Трасса уходит в бесконечное темное небо.
[00:44.00]🏁 Финишная черта близко, но музыка никогда не остановится!`
    }
];

// App State
let playlist = [...DEFAULT_PLAYLIST];
let currentTrackIdx = 0;
let isPlaying = false;
let isMuted = false;
let repeatMode = localStorage.getItem("nebula_repeat_mode") || "none"; // 'none', 'playlist', 'track'
let isShuffle = localStorage.getItem("nebula_shuffle") === "true";
let volumeBeforeMute = parseFloat(localStorage.getItem("nebula_volume") || "0.7");
let currentLyrics = [];
let sleepTimerId = null;
let sleepTimerTimeRemaining = 0;
let isPulseBg = true;
let currentPlaylistName = 'library';
let searchFilter = 'all';
let homeRecommendations = [];
let customPlaylists = JSON.parse(localStorage.getItem('nebula_custom_playlists') || '{"Мои любимые":[]}');
let activePreset = 'normal';
let playbackSpeed = 1.0;
let preservePitch = true;
let isMyWave = false;
let lofiCatalog = [];
let userAccounts = JSON.parse(localStorage.getItem("nebula_accounts") || "{}");
let loggedInUser = localStorage.getItem("nebula_logged_in_user") || null;
const AVATARS = ["👽", "🪐", "🚀", "🛸", "👾", "🤖", "⭐", "👩‍🚀", "👨‍🚀"];
let currentAvatarIdx = 0;
let lastSaveTime = 0;

// Web Audio API Nodes
let audioCtx = null;
let audioElement = null;
let audioSource = null;
let bassFilter = null;
let trebleFilter = null;
let reverbConvolver = null;
let dryGain = null;
let wetGain = null;
let volumeGain = null;
let analyserNode = null;
let isAudioInitialized = false;

// Visualizer Settings
let vizMode = "bars"; // 'bars', 'wave', 'retro'
let sensitivity = 1.0;
let canvas = null;
let canvasCtx = null;
let barPeaks = []; // Stores falling peaks for frequency bar visualizer
const MAX_BARS = 64;

// Stars/particles for background canvas rendering
let stars = [];

// Initialize Web Page
document.addEventListener("DOMContentLoaded", () => {
    initUI();
    initCanvas();
    
    // Restore playback state if available
    const restoredTime = restorePlaybackState();
    
    renderPlaylist();
    renderCustomPlaylistsNav();
    loadTrack(currentTrackIdx, restoredTime);
    createStarfield();
    setupElectronFrame();
    updateProfileUI();
    
    // Sync with SQLite database
    syncUserDataFromServer();
    
    // Load pop recommendations on startup
    loadHomeRecommendations('pop');
});

// Setup custom frameless window actions for Windows/Desktop app
function setupElectronFrame() {
    const isElectron = navigator.userAgent.toLowerCase().includes('electron');
    if (isElectron) {
        document.body.classList.add('is-electron');
        
        document.getElementById('titleMinimize').addEventListener('click', () => {
            if (window.electronAPI) window.electronAPI.minimize();
        });
        document.getElementById('titleMaximize').addEventListener('click', () => {
            if (window.electronAPI) window.electronAPI.maximize();
        });
        document.getElementById('titleClose').addEventListener('click', () => {
            if (window.electronAPI) window.electronAPI.close();
        });
    }
}

// Setup UI elements and Event Listeners
function initUI() {
    // Audio element setup
    audioElement = document.getElementById("videoPlayer") || new Audio();
    audioElement.crossOrigin = "anonymous";
    audioElement.addEventListener("ended", handleTrackEnded);
    audioElement.addEventListener("timeupdate", updateTimeline);
    audioElement.addEventListener("seeked", () => {
        if (currentRoomId) pushRoomState();
    });

    // Track status event listeners
    audioElement.addEventListener("loadstart", () => {
        const track = playlist[currentTrackIdx];
        if (track) {
            if (track.isYoutube) {
                updateTrackStatus("Подключение к YT Music...", "loading");
            } else {
                updateTrackStatus("Загрузка файла...", "loading");
            }
        }
    });

    audioElement.addEventListener("waiting", () => {
        updateTrackStatus("Буферизация...", "loading");
    });

    audioElement.addEventListener("stalled", () => {
        updateTrackStatus("Медленная загрузка...", "loading");
    });

    audioElement.addEventListener("playing", () => {
        const track = playlist[currentTrackIdx];
        if (track && track.isYoutube) {
            updateTrackStatus("В эфире (YouTube)", "playing");
        } else {
            updateTrackStatus("В эфире", "playing");
        }
    });

    audioElement.addEventListener("pause", () => {
        updateTrackStatus("На паузе", "paused");
    });

    audioElement.addEventListener("error", (e) => {
        console.error("Audio element error:", e);
        updateTrackStatus("Ошибка загрузки аудио", "error");
    });

    // Volume Control
    const volSlider = document.getElementById("volumeSlider");
    if (volSlider) {
        volSlider.value = volumeBeforeMute;
        // Apply volume and update text/mute button icons on startup
        changeVolume(volumeBeforeMute);
    }

    // Timeline Clicking / Scrubbing
    const progressWrapper = document.getElementById("progressBarWrapper");
    progressWrapper.addEventListener("click", seekAudio);

    // File Input / Drag & Drop Setup
    const dropzone = document.getElementById("uploadDropzone");
    const fileInput = document.getElementById("fileInput");

    dropzone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", handleFileSelect);

    // Drag-over highlights
    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("drag-active");
    });
    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("drag-active");
    });
    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("drag-active");
        if (e.dataTransfer.files.length > 0) {
            addFilesToPlaylist(e.dataTransfer.files);
        }
    });

    // Update loop and shuffle button states from localStorage
    updateLoopButtonUI();
    const btnShuffle = document.getElementById("btnShuffle");
    if (btnShuffle) {
        if (isShuffle) btnShuffle.classList.add("active");
        else btnShuffle.classList.remove("active");
    }
}

// Setup Canvas for visualizer
function initCanvas() {
    canvas = document.getElementById("visualizerCanvas");
    canvasCtx = canvas.getContext("2d");
    
    // Resize handler
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initializing falling peaks array
    for (let i = 0; i < MAX_BARS; i++) {
        barPeaks.push({ value: 0, hold: 0 });
    }

    // Start Visualizer Loop
    requestAnimationFrame(renderVisualizerLoop);
}

function resizeCanvas() {
    if (canvas) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
}

// --------------------------------------------------------------------------
// Web Audio Graph Assembly
// --------------------------------------------------------------------------
function initAudioEngine() {
    if (isAudioInitialized) return;

    // Create context
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();

    // Create node source from element
    audioSource = audioCtx.createMediaElementSource(audioElement);

    // Equalizer: BiquadFilters
    // Bass (Lowshelf) at 80Hz
    bassFilter = audioCtx.createBiquadFilter();
    bassFilter.type = "lowshelf";
    bassFilter.frequency.value = 80;
    bassFilter.gain.value = 0;

    // Treble (Highshelf) at 10kHz
    trebleFilter = audioCtx.createBiquadFilter();
    trebleFilter.type = "highshelf";
    trebleFilter.frequency.value = 10000;
    trebleFilter.gain.value = 0;

    // Spatial Reverb path
    reverbConvolver = audioCtx.createConvolver();
    reverbConvolver.buffer = generateReverbImpulse(audioCtx, 2.5, 4.0); // Generate 2.5s spatial room impulse

    // Parallel Dry/Wet gains
    dryGain = audioCtx.createGain();
    wetGain = audioCtx.createGain();
    dryGain.gain.value = 1.0;
    wetGain.gain.value = 0.0; // Start at 0% wet reverb

    // Volume Gain
    volumeGain = audioCtx.createGain();
    volumeGain.gain.value = volumeBeforeMute;

    // Analyser Node
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 256; // 128 frequencies bands

    // Chain connections
    // Source -> Bass -> Treble
    audioSource.connect(bassFilter);
    bassFilter.connect(trebleFilter);

    // Split paths after filters:
    // Treble -> Dry Gain -> Volume Gain
    trebleFilter.connect(dryGain);
    dryGain.connect(volumeGain);

    // Treble -> Reverb Convolver -> Wet Gain -> Volume Gain
    trebleFilter.connect(reverbConvolver);
    reverbConvolver.connect(wetGain);
    wetGain.connect(volumeGain);

    // Final chain: Volume -> Analyser -> Output
    volumeGain.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);

    isAudioInitialized = true;
    console.log("Nebula Audio Engine initialized successfully.");
}

// Generate Synthetic White Noise Reverb Impulse Response
function generateReverbImpulse(context, duration, decay) {
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const impulseBuffer = context.createBuffer(2, length, sampleRate);
    const leftChannel = impulseBuffer.getChannelData(0);
    const rightChannel = impulseBuffer.getChannelData(1);

    for (let i = 0; i < length; i++) {
        const percent = i / length;
        const decayValue = Math.exp(-percent * decay);
        // Stereo noise decaying exponentially
        leftChannel[i] = (Math.random() * 2 - 1) * decayValue;
        rightChannel[i] = (Math.random() * 2 - 1) * decayValue;
    }
    return impulseBuffer;
}

// --------------------------------------------------------------------------
// Playback Logic
// --------------------------------------------------------------------------

function loadTrack(idx, seekToTime = null) {
    if (idx < 0 || idx >= playlist.length) return;
    currentTrackIdx = idx;

    // Save current track and playlist state
    localStorage.setItem("nebula_last_track_index", currentTrackIdx);
    localStorage.setItem("nebula_last_playlist_name", currentPlaylistName);
    localStorage.setItem("nebula_last_playlist_tracks", JSON.stringify(playlist));
    
    if (seekToTime === null) {
        localStorage.setItem("nebula_last_track_time", 0);
    }

    const track = playlist[currentTrackIdx];
    
    // Update track status badge
    if (track.isYoutube) {
        updateTrackStatus("Подключение к YT Music...", "loading");
    } else {
        updateTrackStatus("Загрузка файла...", "loading");
    }
    
    // Reset scrubber timeline
    document.getElementById("progressBarFill").style.width = "0%";
    document.getElementById("timeCurrent").innerText = "0:00";
    
    // Handle duration loading metadata
    audioElement.onloadedmetadata = () => {
        document.getElementById("timeTotal").innerText = formatTime(audioElement.duration);
        
        // Apply speed and pitch preservation
        applySpeedAndPitch();
        
        // Re-generate or update lyrics if duration changes (helps with procedural generation for local files)
        if (!track.lrc) {
            loadLyricsForTrack(track);
        }
    };

    if (seekToTime !== null && seekToTime > 0) {
        const onCanPlay = () => {
            audioElement.currentTime = seekToTime;
            updateTimeline();
            audioElement.removeEventListener("canplay", onCanPlay);
        };
        audioElement.addEventListener("canplay", onCanPlay);
    }

    // Use strict CORS check for everything, local proxy handles it!
    audioElement.crossOrigin = "anonymous";
    audioElement.src = track.url;
    audioElement.load();

    // UI Updates
    document.getElementById("trackTitle").innerText = track.title;
    document.getElementById("trackArtist").innerText = track.artist;
    
    const albumCover = document.getElementById("albumCover");
    if (albumCover) albumCover.innerText = track.cover || '<i class="ph-fill ph-music-notes"></i>';
    
    const barCover = document.getElementById("barCover");
    if (barCover) barCover.innerText = track.cover || '<i class="ph-fill ph-music-notes"></i>';

    const videoPlayer = document.getElementById("videoPlayer");
    const vinylDisc = document.getElementById("vinylDisc");
    if (track.isYoutube && videoPlayer && vinylDisc) {
        videoPlayer.style.display = "block";
        vinylDisc.style.display = "none";
    } else if (videoPlayer && vinylDisc) {
        videoPlayer.style.display = "none";
        vinylDisc.style.display = "flex";
    }

    // Update active playlist items in all containers (Home and Library)
    const trackItems = document.querySelectorAll(".track-item");
    trackItems.forEach((item) => {
        const itemIdx = parseInt(item.getAttribute("data-index"));
        if (itemIdx === currentTrackIdx) {
            item.classList.add("active");
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove("active");
        }
    });

    // Load lyrics
    loadLyricsForTrack(track);
}

function togglePlay() {
    initAudioEngine();
    
    // Resume context if suspended (browser security autoplay policies)
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    const btnPlay = document.getElementById("btnPlay");
    const vinyl = document.getElementById("vinylDisc");

    if (isPlaying) {
        audioElement.pause();
        isPlaying = false;
        btnPlay.innerHTML = '<i class="ph-fill ph-play-circle"></i>';
        vinyl.classList.remove("playing");
    } else {
        audioElement.play().then(() => {
            isPlaying = true;
            btnPlay.innerHTML = '<i class="ph-fill ph-pause-circle"></i>';
            vinyl.classList.add("playing");
        }).catch(err => {
            console.error("Playback failed:", err);
        });
    }
}

function playNext() {
    if (isMyWave) {
        playNextMyWaveTrack();
        return;
    }
    if (isShuffle) {
        let rand = currentTrackIdx;
        while (rand === currentTrackIdx && playlist.length > 1) {
            rand = Math.floor(Math.random() * playlist.length);
        }
        loadTrack(rand);
    } else {
        let target = currentTrackIdx + 1;
        if (target >= playlist.length) target = 0;
        loadTrack(target);
    }
    
    if (isPlaying) {
        audioElement.play();
    }
}

function playPrevious() {
    let target = currentTrackIdx - 1;
    if (target < 0) target = playlist.length - 1;
    loadTrack(target);

    if (isPlaying) {
        audioElement.play();
    }
}

function toggleLoop() {
    if (repeatMode === "none") {
        repeatMode = "playlist";
        showFeedback("Повтор плейлиста");
    } else if (repeatMode === "playlist") {
        repeatMode = "track";
        showFeedback("Повтор трека");
    } else {
        repeatMode = "none";
        showFeedback("Без повтора");
    }
    localStorage.setItem("nebula_repeat_mode", repeatMode);
    updateLoopButtonUI();
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    localStorage.setItem("nebula_shuffle", isShuffle);
    
    const btn = document.getElementById("btnShuffle");
    if (isShuffle) {
        btn.classList.add("active");
    } else {
        btn.classList.remove("active");
    }
}

function handleTrackEnded() {
    if (repeatMode === "track") {
        audioElement.currentTime = 0;
        audioElement.play();
    } else if (repeatMode === "playlist") {
        playNext();
    } else {
        // repeatMode === "none"
        let target = currentTrackIdx + 1;
        if (target >= playlist.length) {
            isPlaying = false;
            audioElement.pause();
            audioElement.currentTime = 0;
            document.getElementById("btnPlay").innerHTML = '<i class="ph-fill ph-play-circle"></i>';
            const vinyl = document.getElementById("vinylDisc");
            if (vinyl) vinyl.classList.remove("playing");
            showFeedback("Конец плейлиста");
        } else {
            playNext();
        }
    }
}

// --------------------------------------------------------------------------
// Audio Adjustments & Controls
// --------------------------------------------------------------------------

function changeVolume(val) {
    const value = parseFloat(val);
    volumeBeforeMute = value;
    localStorage.setItem("nebula_volume", value);
    
    if (volumeGain) {
        volumeGain.gain.setValueAtTime(value, audioCtx.currentTime);
    }
    if (audioElement) {
        audioElement.volume = isMuted ? 0 : 1; // Native element stays 1, dry node filters it
    }
    
    // UI Updates
    document.getElementById("volumeVal").innerText = `${Math.round(value * 100)}%`;
    const btnMute = document.getElementById("btnMute");
    if (value === 0) {
        btnMute.innerHTML = '<i class="ph-fill ph-speaker-x"></i>';
    } else if (value < 0.4) {
        btnMute.innerHTML = '<i class="ph-fill ph-speaker-low"></i>';
    } else {
        btnMute.innerHTML = '<i class="ph-fill ph-speaker-high"></i>';
    }
}

function toggleMute() {
    isMuted = !isMuted;
    const btnMute = document.getElementById("btnMute");
    const volSlider = document.getElementById("volumeSlider");

    if (isMuted) {
        btnMute.innerHTML = '<i class="ph-fill ph-speaker-x"></i>';
        if (volumeGain) volumeGain.gain.setValueAtTime(0, audioCtx.currentTime);
        volSlider.value = 0;
        document.getElementById("volumeVal").innerText = "0%";
    } else {
        btnMute.innerHTML = '<i class="ph-fill ph-speaker-high"></i>';
        if (volumeGain) volumeGain.gain.setValueAtTime(volumeBeforeMute, audioCtx.currentTime);
        volSlider.value = volumeBeforeMute;
        document.getElementById("volumeVal").innerText = `${Math.round(volumeBeforeMute * 100)}%`;
    }
}

// Update Timeline
function updateTimeline() {
    const cur = audioElement.currentTime;
    const duration = audioElement.duration || 0;
    if (duration === 0) return;

    const percent = (cur / duration) * 100;
    document.getElementById("progressBarFill").style.width = `${percent}%`;
    document.getElementById("timeCurrent").innerText = formatTime(cur);

    // Throttled auto-save of current playback position (once every 1 second)
    if (Math.abs(cur - lastSaveTime) > 1) {
        lastSaveTime = cur;
        localStorage.setItem("nebula_last_track_time", cur);
    }

    // Sync lyrics highlight
    updateLyricsDisplay();
}

// Click to Seek
function seekAudio(e) {
    const progressWrapper = document.getElementById("progressBarWrapper");
    const rect = progressWrapper.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    const clickPercent = clickX / width;
    const duration = audioElement.duration || 0;
    
    if (duration > 0) {
        audioElement.currentTime = clickPercent * duration;
        updateTimeline();
    }
}

// --------------------------------------------------------------------------
// Equalizer Controls
// --------------------------------------------------------------------------

function updateBass(val) {
    const gainDb = parseInt(val);
    if (bassFilter) {
        bassFilter.gain.setValueAtTime(gainDb, audioCtx.currentTime);
    }
    document.getElementById("valBass").innerText = `${gainDb > 0 ? "+" : ""}${gainDb} dB`;
}

function updateTreble(val) {
    const gainDb = parseInt(val);
    if (trebleFilter) {
        trebleFilter.gain.setValueAtTime(gainDb, audioCtx.currentTime);
    }
    document.getElementById("valTreble").innerText = `${gainDb > 0 ? "+" : ""}${gainDb} dB`;
}

function updateReverb(val) {
    const percent = parseInt(val);
    const fraction = percent / 100;
    
    if (dryGain && wetGain) {
        // Parallel Dry/Wet crossfade
        // Dry goes from 1.0 down to 0.4
        // Wet goes from 0.0 up to 0.8
        dryGain.gain.setValueAtTime(1.0 - (fraction * 0.6), audioCtx.currentTime);
        wetGain.gain.setValueAtTime(fraction * 0.8, audioCtx.currentTime);
    }
    document.getElementById("valReverb").innerText = `${percent}%`;
}

function changeSensitivity(val) {
    sensitivity = parseFloat(val);
    document.getElementById("valSensitivity").innerText = `x${sensitivity.toFixed(1)}`;
}

// --------------------------------------------------------------------------
// Playlist & Local Imports
// --------------------------------------------------------------------------

function renderPlaylist() {
    const container = document.getElementById("libraryTracksList");
    if (container) {
        container.innerHTML = "";
        playlist.forEach((track, index) => {
            const item = document.createElement("div");
            item.className = `track-item ${index === currentTrackIdx ? "active" : ""}`;
            item.setAttribute("data-index", index);
            item.onclick = () => {
                initAudioEngine();
                loadTrack(index);
                if (isPlaying) {
                    audioElement.play();
                } else {
                    togglePlay();
                }
            };

            let originBadge = '';
            if (track.isYoutube) {
                originBadge = `<span class="track-origin-badge yt-music"><i class="ph-fill ph-youtube-logo"></i> YT Music</span>`;
            } else if (track.url && track.url.startsWith("blob:")) {
                originBadge = `<span class="track-origin-badge local"><i class="ph-fill ph-hard-drive"></i> Локальный</span>`;
            } else {
                originBadge = `<span class="track-origin-badge nebula"><i class="ph-fill ph-sparkle"></i> Nebula</span>`;
            }

            item.innerHTML = `
                <div class="track-item-art">${track.cover || '<i class="ph-fill ph-disc"></i>'}</div>
                <div class="track-item-info">
                    <div class="track-item-name">${track.title}</div>
                    <div class="track-item-meta">
                        <span class="track-item-artist">${track.artist}</span>
                        ${originBadge}
                    </div>
                </div>
                <div class="track-item-actions" style="margin-left: auto; display: flex; gap: 10px; align-items: center;">
                    <button class="action-btn" onclick="event.stopPropagation(); promptAddToCustomPlaylist(${index})" title="Добавить в плейлист" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:16px;"><i class="ph-bold ph-plus"></i></button>
                    ${(currentPlaylistName !== 'library' && currentPlaylistName !== 'favorites') ? `<button class="action-btn" onclick="event.stopPropagation(); removeFromCustomPlaylist(${index})" title="Удалить из плейлиста" style="background:none;border:none;color:var(--primary);cursor:pointer;font-size:16px;"><i class="ph-bold ph-x"></i></button>` : ''}
                </div>
            `;
            container.appendChild(item);
        });
    }

    const counter = document.getElementById("playlistCounter");
    if (counter) counter.innerText = `${playlist.length} треков`;
}

// Handle Drag and Drop / File Select File Imports
function handleFileSelect(e) {
    if (e.target.files.length > 0) {
        addFilesToPlaylist(e.target.files);
    }
}

function addFilesToPlaylist(files) {
    let addedCount = 0;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("audio/")) {
            const objectUrl = URL.createObjectURL(file);
            const cleanTitle = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            
            playlist.push({
                title: cleanTitle,
                artist: "Локальный файл",
                url: objectUrl,
                cover: '<i class="ph-fill ph-folder"></i>'
            });
            addedCount++;
        }
    }

    if (addedCount > 0) {
        renderPlaylist();
        showFeedback(`Успешно добавлено ${addedCount} треков в плейлист!`);
        
        // Auto play the first imported track
        const startIdx = playlist.length - addedCount;
        loadTrack(startIdx);
        if (!isPlaying) togglePlay();
    }
}

// --------------------------------------------------------------------------
// Custom Visualizer Canvas Loop Rendering
// --------------------------------------------------------------------------

function setVizMode(mode) {
    vizMode = mode;
    document.querySelectorAll(".viz-tab").forEach(tab => tab.classList.remove("active"));
    
    const tabIdMap = {
        'bars': 'tabBars',
        'wave': 'tabWave',
        'retro': 'tabRetro',
        'lyrics': 'tabLyrics'
    };
    const activeTab = document.getElementById(tabIdMap[mode]);
    if (activeTab) activeTab.classList.add("active");

    const canvas = document.getElementById("visualizerCanvas");
    const albumArt = document.getElementById("albumArtWrapper");
    const lyricsWrapper = document.getElementById("lyricsContainerWrapper");

    if (mode === "lyrics") {
        if (canvas) canvas.style.display = "none";
        if (albumArt) albumArt.style.display = "none";
        if (lyricsWrapper) lyricsWrapper.style.display = "flex";
        setTimeout(scrollLyricsToActive, 100);
    } else {
        if (canvas) canvas.style.display = "block";
        if (albumArt) albumArt.style.display = "flex";
        if (lyricsWrapper) lyricsWrapper.style.display = "none";
    }
}

function renderVisualizerLoop() {
    requestAnimationFrame(renderVisualizerLoop);

    if (!canvas || !canvasCtx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear Canvas with transparency to enable trails
    canvasCtx.fillStyle = "rgba(11, 6, 21, 0.12)";
    canvasCtx.fillRect(0, 0, width, height);

    // Fetch theme accent colors dynamically from document body variables
    const bodyStyles = getComputedStyle(document.body);
    const colorPrimary = bodyStyles.getPropertyValue('--accent-primary').trim() || "#ff007f";
    const colorSecondary = bodyStyles.getPropertyValue('--accent-secondary').trim() || "#00f0ff";

    let dataArray = new Uint8Array(128);
    let bassAverage = 0;

    // Gather audio data if active
    if (isAudioInitialized && analyserNode && isPlaying) {
        dataArray = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(dataArray);

        // Calculate average bass frequency (indices 0 to 8) to pulse the vinyl
        let bassSum = 0;
        for (let i = 0; i < 8; i++) {
            bassSum += dataArray[i];
        }
        bassAverage = bassSum / 8;
        
        // Dynamic vinyl beat pulsing
        const vinyl = document.getElementById("vinylDisc");
        if (vinyl) {
            const scale = 1 + (bassAverage / 255) * 0.12 * sensitivity;
            vinyl.style.transform = `scale(${scale})`;
        }

        // Dynamic ambient background pulsation
        if (isPulseBg) {
            const bassRatio = bassAverage / 255;
            const orb1 = document.getElementById("orbPrimary");
            const orb2 = document.getElementById("orbSecondary");
            
            if (orb1) {
                const scale = 1 + bassRatio * 0.18 * sensitivity;
                const opacity = 0.12 + bassRatio * 0.18 * sensitivity;
                orb1.style.transform = `scale(${scale})`;
                orb1.style.opacity = `${opacity}`;
            }
            if (orb2) {
                const scale = 1 + bassRatio * 0.15 * sensitivity;
                const opacity = 0.12 + bassRatio * 0.15 * sensitivity;
                orb2.style.transform = `scale(${scale})`;
                orb2.style.opacity = `${opacity}`;
            }

            // Pulse body inset shadows
            const shadowIntensity = bassRatio * 35 * sensitivity;
            document.body.style.boxShadow = `inset 0 0 ${shadowIntensity}px rgba(${colorPrimary === "#ffffff" ? "255,255,255" : hexToRgb(colorPrimary)}, 0.12)`;
        }
    } else {
        // Flatline vinyl and restore orbs if paused
        const vinyl = document.getElementById("vinylDisc");
        if (vinyl) vinyl.style.transform = "scale(1)";
        
        if (isPulseBg) {
            const orb1 = document.getElementById("orbPrimary");
            const orb2 = document.getElementById("orbSecondary");
            if (orb1) {
                orb1.style.transform = "scale(1)";
                orb1.style.opacity = "0.15";
            }
            if (orb2) {
                orb2.style.transform = "scale(1)";
                orb2.style.opacity = "0.15";
            }
            document.body.style.boxShadow = "";
        }
    }

    // Starfield Background drawing
    drawStarfield(canvasCtx, width, height, bassAverage);

    // Mode-specific renderers
    if (vizMode === "bars") {
        renderBarsViz(canvasCtx, width, height, dataArray, colorPrimary, colorSecondary);
    } else if (vizMode === "wave") {
        renderRadialWaveViz(canvasCtx, width, height, dataArray, colorPrimary, colorSecondary);
    } else if (vizMode === "retro") {
        renderRetroViz(canvasCtx, width, height, dataArray, colorPrimary, colorSecondary);
    }
}

// Mode 1: Frequency Bars Visualization
function renderBarsViz(ctx, width, height, dataArray, colorPrimary, colorSecondary) {
    const totalBars = Math.min(MAX_BARS, dataArray.length);
    const barWidth = (width / totalBars) - 2;

    for (let i = 0; i < totalBars; i++) {
        let value = dataArray[i] * sensitivity;
        if (value > height - 60) value = height - 60; // Peak safety caps

        const barHeight = isPlaying ? value : 5 + Math.sin(Date.now() * 0.003 + i) * 3;
        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Custom Gradient
        const grad = ctx.createLinearGradient(x, height, x, y);
        grad.addColorStop(0, colorPrimary);
        grad.addColorStop(0.5, "#7b2cbf");
        grad.addColorStop(1, colorSecondary);

        // Draw bar
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Draw falling peak dot
        const peak = barPeaks[i];
        if (barHeight > peak.value) {
            peak.value = barHeight;
            peak.hold = 30; // Frame holds before falling
        } else {
            if (peak.hold > 0) {
                peak.hold--;
            } else {
                peak.value -= 1.8; // Gravity speed
                if (peak.value < 0) peak.value = 0;
            }
        }

        ctx.fillStyle = colorSecondary;
        ctx.shadowColor = colorSecondary;
        ctx.shadowBlur = 10;
        ctx.fillRect(x, height - peak.value - 4, barWidth, 3);
        ctx.shadowBlur = 0; // Reset glows
    }
}

// Mode 2: Radial Pulsating Circle Visualizer
function renderRadialWaveViz(ctx, width, height, dataArray, colorPrimary, colorSecondary) {
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.22;
    const pointsCount = 72;

    ctx.shadowBlur = 20;
    ctx.shadowColor = colorPrimary;

    // Draw secondary outer faint ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius + 20, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw main deformed radial sound ring
    ctx.beginPath();
    for (let i = 0; i < pointsCount; i++) {
        const angle = (i / pointsCount) * 2 * Math.PI;
        
        // Map frequency arrays onto points
        const freqIdx = Math.floor((i < pointsCount / 2 ? i : pointsCount - i) * (dataArray.length / pointsCount));
        const freqValue = dataArray[freqIdx] || 0;
        
        const offset = (freqValue / 255) * 60 * sensitivity;
        const radius = baseRadius + (isPlaying ? offset : 2 + Math.sin(Date.now() * 0.005 + i * 0.5) * 4);
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();

    const grad = ctx.createRadialGradient(centerX, centerY, baseRadius - 10, centerX, centerY, baseRadius + 60);
    grad.addColorStop(0, colorPrimary);
    grad.addColorStop(1, colorSecondary);

    ctx.strokeStyle = grad;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw interior audio core particles
    const coreCount = 8;
    for (let i = 0; i < coreCount; i++) {
        const angle = (i / coreCount) * 2 * Math.PI + (Date.now() * 0.0005);
        const radius = baseRadius - 15;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        ctx.fillStyle = colorSecondary;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
    }

    ctx.shadowBlur = 0;
}

// Mode 3: Retro Grid Tunnel Perspective visualizer
function renderRetroViz(ctx, width, height, dataArray, colorPrimary, colorSecondary) {
    const horizonY = height * 0.5;
    
    // Draw horizon line
    ctx.strokeStyle = colorPrimary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(width, horizonY);
    ctx.stroke();

    // Perspective lines
    const lineCount = 18;
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= lineCount; i++) {
        const xTop = (i / lineCount) * width;
        const xBottom = ((i - lineCount/2) * 2.8 / lineCount + 0.5) * width;
        
        // Grab frequency value to bend lines
        const freqIdx = Math.floor(Math.abs(i - lineCount/2) * (dataArray.length / (lineCount/2)));
        const freqValue = dataArray[freqIdx] || 0;
        const bend = (freqValue / 255) * 15 * sensitivity * (isPlaying ? 1 : 0);

        ctx.beginPath();
        ctx.moveTo(xTop, horizonY);
        // Quad curve for organic warping
        ctx.quadraticCurveTo(
            (xTop + xBottom) / 2 + (i % 2 === 0 ? bend : -bend), 
            (horizonY + height) / 2, 
            xBottom, 
            height
        );
        
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.1 + (freqValue / 255) * 0.4})`;
        ctx.stroke();
    }

    // Retro Neon Sun behind horizon
    const sunRadius = 60;
    const sunX = width / 2;
    const sunY = horizonY - 10;
    
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, Math.PI, 2 * Math.PI);
    
    const sunGrad = ctx.createLinearGradient(sunX, sunY - sunRadius, sunX, sunY);
    sunGrad.addColorStop(0, "#fefe22"); // Neon yellow
    sunGrad.addColorStop(0.6, colorPrimary);
    sunGrad.addColorStop(1, "transparent");

    ctx.fillStyle = sunGrad;
    ctx.fill();
}

// --------------------------------------------------------------------------
// Ambient Particles Background Engine
// --------------------------------------------------------------------------

function createStarfield() {
    stars = [];
    const starCount = 60;
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random(),
            y: Math.random(),
            speed: 0.1 + Math.random() * 0.4,
            size: 0.5 + Math.random() * 2.0
        });
    }
}

function drawStarfield(ctx, width, height, bass) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    stars.forEach(star => {
        // Move stars down slowly
        // Speed multipliers scale with bass intensity!
        const speed = star.speed * (1 + (bass / 255) * 2.0);
        star.y += speed * 0.001;
        if (star.y > 1) {
            star.y = 0;
            star.x = Math.random();
        }

        const size = star.size * (1 + (bass / 255) * 0.5);
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, size, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// --------------------------------------------------------------------------
// Helpers and Utilities
// --------------------------------------------------------------------------

function formatTime(secs) {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${minutes}:${returnedSeconds}`;
}

function setTheme(themeName) {
    document.body.className = `theme-${themeName}`;
    
    // Toggle active selector buttons
    document.querySelectorAll(".theme-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`.btn-${themeName}`);
    if (activeBtn) activeBtn.classList.add("active");

    showFeedback(`Тема переключена на: ${themeName.toUpperCase()}`);
}

// Popup toast messages
function showFeedback(msg) {
    let container = document.querySelector(".toast-feedback-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-feedback-container";
        container.style.position = "fixed";
        container.style.bottom = "24px";
        container.style.left = "50%";
        container.style.transform = "translateX(-50%)";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "8px";
        container.style.zIndex = "1000";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.style.background = "var(--panel-bg)";
    toast.style.backdropFilter = "blur(10px)";
    toast.style.border = "1px solid var(--border-color)";
    toast.style.borderRadius = "6px";
    toast.style.padding = "10px 20px";
    toast.style.color = "var(--text-main)";
    toast.style.fontSize = "0.85rem";
    toast.style.fontWeight = "600";
    toast.style.boxShadow = "0 8px 16px rgba(0,0,0,0.3)";
    toast.style.animation = "fadeInUp 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards";
    toast.innerText = msg;

    container.appendChild(toast);

    // Style animation dynamically
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --------------------------------------------------------------------------
// Synced Lyrics, Equalizer Presets, Sleep Timer & Ambient Pulse Logic
// --------------------------------------------------------------------------

function parseLRC(lrcText) {
    if (!lrcText) return [];
    const lines = lrcText.split('\n');
    const result = [];
    const timeRegex = /\[(\d{2}):(\d{2})[.:](\d{2,3})\]/g;
    
    for (let line of lines) {
        const timestamps = [];
        let match;
        const lineClean = line.replace(/\[\d{2}:\d{2}[.:]\d{2,3}\]/g, '').trim();
        
        timeRegex.lastIndex = 0;
        while ((match = timeRegex.exec(line)) !== null) {
            const min = parseInt(match[1], 10);
            const sec = parseInt(match[2], 10);
            const msStr = match[3];
            const ms = parseInt(msStr, 10);
            const msDivisor = msStr.length === 3 ? 1000 : 100;
            const time = min * 60 + sec + (ms / msDivisor);
            timestamps.push(time);
        }
        
        for (const t of timestamps) {
            result.push({ time: t, text: lineClean });
        }
    }
    
    result.sort((a, b) => a.time - b.time);
    return result;
}

function loadLyricsForTrack(track) {
    if (track.lrc) {
        currentLyrics = parseLRC(track.lrc);
    } else {
        currentLyrics = generateProceduralLyrics(track);
    }

    renderLyricsMarkup();
}

function renderLyricsMarkup() {
    const containers = [document.getElementById("lyricsContainer"), document.getElementById("sectionLyricsContainer")];
    containers.forEach(container => {
        if (!container) return;
        
        if (currentLyrics.length === 0) {
            container.innerHTML = `<p class="lyric-line-fallback">Текст песни отсутствует</p>`;
            return;
        }

        container.innerHTML = currentLyrics.map((line, index) => {
            return `<p class="lyric-line" data-time="${line.time}" onclick="seekToLyricTime(${line.time})">${line.text}</p>`;
        }).join("");
    });
}

function generateProceduralLyrics(track) {
    const lines = [
        "🛸 Настройка телеметрической связи с Nebula Player...",
        "🪐 Сканирование звукового пространства вокруг корабля...",
        "✨ Захват звуковой дорожки завершен успешно.",
        "🛰️ Установлена частота вещания: 44.1 кГц.",
        "🚀 Ускорение сквозь космическую пыль...",
        "🌌 Пролетаем скопление Плеяды. Визуализация частот активна.",
        "💫 Глубокий бас сотрясает обшивку нашего корабля.",
        "⚡ Эффекты реверберации создают эхо далеких планет.",
        "🌠 Звездный дождь за окном мерцает в такт мелодии.",
        "🪐 Мы входим в кольца Сатурна. Громкость 100%.",
        "🔮 Музыкальное ядро работает на максимальной мощности.",
        "🛰️ Синхронизация систем завершена. Полет продолжается.",
        "🎆 Вспышка сверхновой освещает наш путь!",
        "🚀 Подготовка к переходу в гиперпространство...",
        "🛸 Миссия выполнена. Космос слушает Nebula Player."
    ];

    const duration = audioElement.duration || 180;
    const step = duration / (lines.length + 1);
    
    return lines.map((text, idx) => {
        return {
            time: (idx + 1) * step,
            text: text
        };
    });
}

function seekToLyricTime(time) {
    if (audioElement) {
        audioElement.currentTime = time;
        updateTimeline();
        updateLyricsDisplay();
    }
}

function updateLyricsDisplay() {
    if (currentLyrics.length === 0) return;
    
    const curTime = audioElement.currentTime;
    let activeIdx = -1;

    for (let i = 0; i < currentLyrics.length; i++) {
        if (curTime >= currentLyrics[i].time) {
            activeIdx = i;
        } else {
            break;
        }
    }

    const containers = [document.getElementById("lyricsContainer"), document.getElementById("sectionLyricsContainer")];
    containers.forEach(container => {
        if (!container) return;
        const lines = container.querySelectorAll(".lyric-line");
        lines.forEach((line, idx) => {
            if (idx === activeIdx) {
                if (!line.classList.contains("active")) {
                    line.classList.add("active");
                    scrollLyricsToActive(container);
                }
            } else {
                line.classList.remove("active");
            }
        });
    });
}

function scrollLyricsToActive(container) {
    if (!container) return;
    
    const activeLine = container.querySelector(".lyric-line.active");
    if (activeLine) {
        const containerHeight = container.clientHeight;
        const lineTop = activeLine.offsetTop;
        const lineHeight = activeLine.clientHeight;
        
        container.scrollTo({
            top: lineTop - (containerHeight / 2) + (lineHeight / 2),
            behavior: "smooth"
        });
    }
}

function handleLrcUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const parsed = parseLRC(text);
        if (parsed.length > 0) {
            currentLyrics = parsed;
            playlist[currentTrackIdx].lrc = text;
            renderLyricsMarkup();
            showFeedback("Текст LRC успешно загружен!");
        } else {
            showFeedback("Ошибка: Не удалось найти временные метки в LRC файле.");
        }
        event.target.value = "";
    };
    reader.readAsText(file);
}

function setEQPreset(type) {
    activePreset = type;
    initAudioEngine();
    if (!isAudioInitialized) return;

    document.querySelectorAll(".eq-btn").forEach(btn => btn.classList.remove("active"));
    const presetBtnMap = {
        'normal': 'eqPresetNormal',
        'bass': 'eqPresetBass',
        'voice': 'eqPresetVoice',
        'lofi': 'eqPresetLofi'
    };
    const activeBtn = document.getElementById(presetBtnMap[type]);
    if (activeBtn) activeBtn.classList.add("active");

    let targetBass = 0;
    let targetTreble = 0;
    let targetReverb = 0;

    switch (type) {
        case 'normal':
            targetBass = 0;
            targetTreble = 0;
            targetReverb = 0;
            break;
        case 'bass':
            targetBass = 15;
            targetTreble = 2;
            targetReverb = 15;
            break;
        case 'voice':
            targetBass = -4;
            targetTreble = 12;
            targetReverb = 10;
            break;
        case 'lofi':
            targetBass = 8;
            targetTreble = -8;
            targetReverb = 45;
            break;
    }

    const sliderBass = document.getElementById("sliderBass");
    const sliderTreble = document.getElementById("sliderTreble");
    const sliderReverb = document.getElementById("sliderReverb");

    if (sliderBass) sliderBass.value = targetBass;
    if (sliderTreble) sliderTreble.value = targetTreble;
    if (sliderReverb) sliderReverb.value = targetReverb;

    updateBass(targetBass);
    updateTreble(targetTreble);
    updateReverb(targetReverb);

    showFeedback(`Эквалайзер переключен на: ${type.toUpperCase()}`);
}

function setSleepTimer(minutes) {
    if (sleepTimerId) {
        clearInterval(sleepTimerId);
        sleepTimerId = null;
    }

    document.querySelectorAll(".timer-btn").forEach(btn => btn.classList.remove("active"));
    const timerBtnMap = {
        0: 'btnTimerOff',
        5: 'btnTimer5',
        15: 'btnTimer15',
        30: 'btnTimer30',
        60: 'btnTimer60'
    };
    const activeBtn = document.getElementById(timerBtnMap[minutes]);
    if (activeBtn) activeBtn.classList.add("active");

    const valDisplay = document.getElementById("valSleepTimer");

    if (minutes === 0) {
        sleepTimerTimeRemaining = 0;
        if (valDisplay) valDisplay.innerText = "Выкл";
        showFeedback("Таймер сна отключен");
        return;
    }

    sleepTimerTimeRemaining = minutes * 60;
    if (valDisplay) valDisplay.innerText = formatTime(sleepTimerTimeRemaining);
    showFeedback(`Таймер сна установлен на ${minutes} минут`);

    sleepTimerId = setInterval(() => {
        sleepTimerTimeRemaining--;
        
        if (sleepTimerTimeRemaining <= 0) {
            clearInterval(sleepTimerId);
            sleepTimerId = null;
            if (valDisplay) valDisplay.innerText = "Выкл";
            
            document.querySelectorAll(".timer-btn").forEach(btn => btn.classList.remove("active"));
            const btnOff = document.getElementById("btnTimerOff");
            if (btnOff) btnOff.classList.add("active");

            if (isPlaying) {
                togglePlay();
            }
            showFeedback("Время сна вышло! Проигрывание остановлено.");
        } else {
            if (valDisplay) valDisplay.innerText = formatTime(sleepTimerTimeRemaining);
        }
    }, 1000);
}

function togglePulseBg(checked) {
    isPulseBg = checked;
    if (!isPulseBg) {
        document.body.style.boxShadow = "";
        const orb1 = document.getElementById("orbPrimary");
        const orb2 = document.getElementById("orbSecondary");
        if (orb1) {
            orb1.style.transform = "";
            orb1.style.opacity = "";
        }
        if (orb2) {
            orb2.style.transform = "";
            orb2.style.opacity = "";
        }
    }
}

function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "255, 0, 127";
}

function applySpeedAndPitch() {
    if (!audioElement) return;
    audioElement.playbackRate = playbackSpeed;
    if ('preservesPitch' in audioElement) {
        audioElement.preservesPitch = preservePitch;
    } else if ('webkitPreservesPitch' in audioElement) {
        audioElement.webkitPreservesPitch = preservePitch;
    }
}

function changeSpeed(val) {
    playbackSpeed = parseFloat(val);
    applySpeedAndPitch();
    
    const label = document.getElementById("valSpeed");
    if (label) label.innerText = `x${playbackSpeed.toFixed(2)}`;
}

function togglePreservePitch(checked) {
    preservePitch = checked;
    applySpeedAndPitch();
    showFeedback(preservePitch ? "Сохранение высоты тона включено" : "Высота звука изменяется со скоростью");
}

function setSpeedPreset(type) {
    document.querySelectorAll("[id^='speedPreset']").forEach(btn => btn.classList.remove("active"));
    
    const presetBtnMap = {
        'normal': 'speedPresetNormal',
        'slowed': 'speedPresetSlowed',
        'nightcore': 'speedPresetNightcore'
    };
    
    const activeBtn = document.getElementById(presetBtnMap[type]);
    if (activeBtn) activeBtn.classList.add("active");

    const sliderSpeed = document.getElementById("sliderSpeed");
    const chkPreservePitch = document.getElementById("chkPreservePitch");

    if (type === 'normal') {
        playbackSpeed = 1.0;
        preservePitch = true;
        if (sliderSpeed) sliderSpeed.value = 1.0;
        if (chkPreservePitch) chkPreservePitch.checked = true;
        
        applySpeedAndPitch();
        changeSpeed(1.0);
        showFeedback("Воспроизведение: Обычный режим");
    } 
    else if (type === 'slowed') {
        playbackSpeed = 0.75;
        preservePitch = false;
        if (sliderSpeed) sliderSpeed.value = 0.75;
        if (chkPreservePitch) chkPreservePitch.checked = false;
        
        applySpeedAndPitch();
        changeSpeed(0.75);
        setEQPreset('lofi');
        showFeedback("Режим: Slowed + Reverb");
    } 
    else if (type === 'nightcore') {
        playbackSpeed = 1.30;
        preservePitch = false;
        if (sliderSpeed) sliderSpeed.value = 1.30;
        if (chkPreservePitch) chkPreservePitch.checked = false;
        
        applySpeedAndPitch();
        changeSpeed(1.30);
        setEQPreset('voice');
        showFeedback("Режим: Nightcore");
    }
}

// --------------------------------------------------------------------------
// User Account Modal Controls
// --------------------------------------------------------------------------

function openAccountModal() {
    const modal = document.getElementById("accountModal");
    if (modal) {
        modal.classList.add("active");
        updateProfileUI();
    }
}

function closeAccountModal() {
    const modal = document.getElementById("accountModal");
    if (modal) modal.classList.remove("active");
}

async function handleAuth(type) {
    const userInp = document.getElementById("inputUsername");
    const passInp = document.getElementById("inputPassword");
    if (!userInp || !passInp) return;

    const username = userInp.value.trim();
    const password = passInp.value.trim();

    if (!username || !password) {
        showFeedback("Заполните имя и пароль!");
        return;
    }

    try {
        const endpoint = type === 'register' ? '/api/auth/register' : '/api/auth/login';
        const res = await fetch(`http://localhost:9001${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            showFeedback(data.error || "Ошибка авторизации!");
            return;
        }

        showFeedback(type === 'register' ? "Аккаунт создан! Авторизация..." : `Рады видеть вас, ${username}!`);
        
        loggedInUser = username;
        localStorage.setItem("nebula_logged_in_user", username);
        
        // Cache user info locally
        userAccounts[username] = {
            favorites: [],
            avatar: data.avatar || "👽",
            tracksCount: 0,
            lastSynced: Date.now()
        };
        
        // Sync local likes to server in background
        await syncLocalLikesToAccount();
        
        // Load user data from server
        await syncUserDataFromServer();
        
        closeAccountModal();
    } catch (e) {
        console.error("Auth error:", e);
        showFeedback("Не удалось связаться с сервером БД!");
    }
    
    userInp.value = "";
    passInp.value = "";
}

async function syncLocalLikesToAccount() {
    if (!loggedInUser) return;
    const localLikes = JSON.parse(localStorage.getItem("nebula_likes") || "[]");
    if (localLikes.length === 0) return;
    
    showFeedback("Синхронизация локальных лайков с БД...");
    
    const localMetadata = JSON.parse(localStorage.getItem("nebula_likes_metadata") || "{}");
    
    for (const trackUrl of localLikes) {
        let trackObj = localMetadata[trackUrl] ||
                       playlist.find(t => t.url === trackUrl) || 
                       DEFAULT_PLAYLIST.find(t => t.url === trackUrl) ||
                       { url: trackUrl, title: "Неизвестный трек", artist: "Избранное", cover: '<i class="ph-fill ph-heart"></i>' };
                        
        try {
            await fetch('http://localhost:9001/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: loggedInUser,
                    track: trackObj
                })
            });
        } catch (e) {
            console.error("Error syncing favorite track:", trackUrl, e);
        }
    }
    
    localStorage.removeItem("nebula_likes");
    localStorage.removeItem("nebula_likes_metadata");
}

function handleLogout() {
    loggedInUser = null;
    localStorage.removeItem("nebula_logged_in_user");
    showFeedback("Вы вышли из профиля");
    updateProfileUI();
}

async function cycleAvatar() {
    if (!loggedInUser) return;
    currentAvatarIdx = (currentAvatarIdx + 1) % AVATARS.length;
    const newAvatar = AVATARS[currentAvatarIdx];
    
    try {
        const res = await fetch('http://localhost:9001/api/auth/avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: loggedInUser,
                avatar: newAvatar
            })
        });
        if (res.ok) {
            userAccounts[loggedInUser].avatar = newAvatar;
            updateProfileUI();
        }
    } catch (e) {
        console.error("Error cycleAvatar:", e);
    }
}

// Sync user data with SQLite DB
async function syncUserDataFromServer() {
    const userToFetch = loggedInUser || getOrCreateGuestId();
    try {
        // Fetch favorites
        const favRes = await fetch(`http://localhost:9001/api/favorites?username=${encodeURIComponent(userToFetch)}`);
        if (favRes.ok) {
            const data = await favRes.json();
            if (loggedInUser) {
                userAccounts[loggedInUser] = userAccounts[loggedInUser] || { favorites: [], avatar: '<i class="ph-fill ph-alien"></i>' };
                userAccounts[loggedInUser].favorites = data.favorites.map(t => t.url);
            } else {
                localStorage.setItem("nebula_likes", JSON.stringify(data.favorites.map(t => t.url)));
                const metadata = {};
                data.favorites.forEach(t => {
                    metadata[t.url] = t;
                });
                localStorage.setItem("nebula_likes_metadata", JSON.stringify(metadata));
            }
            
            if (currentPlaylistName === 'favorites') {
                playlist = data.favorites;
                renderPlaylist();
            }
        }
        
        // Fetch playlists
        if (loggedInUser) {
            const plRes = await fetch(`http://localhost:9001/api/playlists?username=${encodeURIComponent(loggedInUser)}`);
            if (plRes.ok) {
                const data = await plRes.json();
                customPlaylists = data.playlists;
                
                if (currentPlaylistName !== 'library' && currentPlaylistName !== 'favorites') {
                    if (customPlaylists[currentPlaylistName]) {
                        playlist = customPlaylists[currentPlaylistName];
                        renderPlaylist();
                    }
                }
                renderCustomPlaylistsNav();
                // Also refresh dashboard grid if we're on the library view
                if (currentPlaylistName === 'library') {
                    renderDashboardPlaylists();
                }
            }
        }
        
        // Update favorites count on dashboard if visible
        if (currentPlaylistName === 'library') {
            const hubCount = document.getElementById('hubFavoritesCount');
            if (hubCount) {
                const favRes2 = await fetch(`http://localhost:9001/api/favorites?username=${encodeURIComponent(userToFetch)}`);
                if (favRes2.ok) {
                    const favData2 = await favRes2.json();
                    hubCount.innerText = `${favData2.favorites.length} треков`;
                }
            }
        }
        
        updateProfileUI();
    } catch (e) {
        console.error("Error syncing user data from server SQLite DB:", e);
    }
}

function updateProfileUI() {
    const avatarHeader = document.getElementById("userAvatar");
    const nicknameHeader = document.getElementById("userNickname");
    const statusHeader = document.getElementById("syncStatus");
    
    const authView = document.getElementById("authView");
    const profileView = document.getElementById("profileView");
    
    const profileUsername = document.getElementById("profileUsername");
    const profileSyncDate = document.getElementById("profileSyncDate");
    const profileAvatarBig = document.getElementById("profileAvatarBig");
    const statFavorites = document.getElementById("statFavorites");
    const statTracks = document.getElementById("statTracks");

    if (loggedInUser && userAccounts[loggedInUser]) {
        const user = userAccounts[loggedInUser];
        
        if (avatarHeader) avatarHeader.innerText = user.avatar;
        if (nicknameHeader) nicknameHeader.innerText = loggedInUser;
        if (statusHeader) statusHeader.innerText = "Облако активно";
        
        if (authView) authView.style.display = "none";
        if (profileView) profileView.style.display = "block";
        
        if (profileUsername) profileUsername.innerText = loggedInUser;
        if (profileAvatarBig) profileAvatarBig.innerText = user.avatar;
        
        const dateStr = user.lastSynced ? new Date(user.lastSynced).toLocaleTimeString() : "никогда";
        if (profileSyncDate) profileSyncDate.innerText = `Синхронизировано: ${dateStr}`;
        
        if (statFavorites) statFavorites.innerText = `${user.favorites.length} треков`;
        
        const localCount = playlist.filter(t => t.url.startsWith("blob:")).length;
        if (statTracks) statTracks.innerText = `${localCount} треков`;
        
        currentAvatarIdx = AVATARS.indexOf(user.avatar);
    } else {
        if (avatarHeader) avatarHeader.innerHTML = '<i class="ph-fill ph-alien"></i>';
        if (nicknameHeader) nicknameHeader.innerText = "Гость";
        if (statusHeader) statusHeader.innerText = "Нажмите для входа";
        
        if (authView) authView.style.display = "block";
        if (profileView) profileView.style.display = "none";
        
        const guestLikes = JSON.parse(localStorage.getItem("nebula_likes") || "[]");
        if (statFavorites) statFavorites.innerText = `${guestLikes.length} треков`;
        
        const localCount = playlist.filter(t => t.url.startsWith("blob:")).length;
        if (statTracks) statTracks.innerText = `${localCount} треков`;
    }
    
    updateLikeButtonIcon();
}

function syncWithCloud() {
    if (!loggedInUser) return;
    const btn = document.getElementById("btnSyncCloud");
    if (btn) {
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Синхронизация...';
        btn.disabled = true;
    }
    
    setTimeout(() => {
        const user = userAccounts[loggedInUser];
        user.lastSynced = Date.now();
        localStorage.setItem("nebula_accounts", JSON.stringify(userAccounts));
        
        if (btn) {
            btn.innerHTML = '<i class="ph-bold ph-cloud-arrow-up"></i> Синхронизировать сейчас';
            btn.disabled = false;
        }
        
        updateProfileUI();
        showFeedback("Все плейлисты и избранное сохранены в облаке Nebula!");
    }, 1500);
}

// --------------------------------------------------------------------------
// Likes & Track Ratings
// --------------------------------------------------------------------------

function getOrCreateGuestId() {
    let guestId = localStorage.getItem("nebula_guest_id");
    if (!guestId) {
        guestId = "guest_" + Math.random().toString(36).substring(2, 11);
        localStorage.setItem("nebula_guest_id", guestId);
    }
    return guestId;
}

function showFavorites() {
    // Highlight active nav in sidebar
    document.querySelectorAll(".sidebar-nav .nav-item").forEach(n => n.classList.remove("active"));
    const favNav = document.getElementById("navFavorites");
    if (favNav) favNav.classList.add("active");

    showSection('playlist');
    
    // Hide dashboard, show tracklist + back button
    const dashboard = document.getElementById('libraryDashboard');
    const tracksList = document.getElementById('libraryTracksList');
    const backBtn = document.getElementById('btnBackToLibrary');
    const headerTitle = document.getElementById('playlistHeaderTitle');
    if (dashboard) dashboard.style.display = 'none';
    if (tracksList) tracksList.style.display = 'block';
    if (backBtn) backBtn.style.display = 'inline-flex';
    if (headerTitle) headerTitle.innerText = 'Любимые треки';
    
    currentPlaylistName = 'favorites';
    
    const userToFetch = loggedInUser || getOrCreateGuestId();
    
    // Load favorites from memory/storage/server
    fetch(`http://localhost:9001/api/favorites?username=${encodeURIComponent(userToFetch)}`)
        .then(res => res.json())
        .then(data => {
            playlist = data.favorites;
            currentTrackIdx = 0;
            renderPlaylist();
        })
        .catch(e => {
            console.error("Error loading favorites from server:", e);
            // Fallback to local
            const likes = JSON.parse(localStorage.getItem("nebula_likes") || "[]");
            const metadata = JSON.parse(localStorage.getItem("nebula_likes_metadata") || "{}");
            const favTracks = [];
            
            likes.forEach(url => {
                if (metadata[url]) {
                    favTracks.push(metadata[url]);
                } else {
                    const found = DEFAULT_PLAYLIST.find(t => t.url === url);
                    if (found) {
                        favTracks.push(found);
                    } else {
                        favTracks.push({
                            title: "Неизвестный трек",
                            artist: "Избранное",
                            url: url,
                            cover: "\u2764\uFE0F",
                            isYoutube: url.includes("/watch?v=") || url.startsWith("/api/play"),
                            youtubeId: url.includes("?id=") ? url.split("?id=")[1].split("&")[0] : ""
                        });
                    }
                }
            });
            
            playlist = favTracks;
            currentTrackIdx = 0;
            renderPlaylist();
        });
}

async function toggleLikeCurrentTrack() {
    const track = playlist[currentTrackIdx];
    if (!track) return;
    
    const userToUse = loggedInUser || getOrCreateGuestId();
    
    try {
        const res = await fetch('http://localhost:9001/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: userToUse,
                track: track
            })
        });
        const data = await res.json();
        if (res.ok) {
            if (data.status === 'added') {
                showFeedback("Добавлено в Избранное");
            } else {
                showFeedback("Удалено из Избранного");
            }
            await syncUserDataFromServer();
        } else {
            showFeedback("Ошибка добавления в избранное");
        }
    } catch (e) {
        console.error("Like error:", e);
        // Fallback for offline mode
        let likes = JSON.parse(localStorage.getItem("nebula_likes") || "[]");
        let metadata = JSON.parse(localStorage.getItem("nebula_likes_metadata") || "{}");
        const index = likes.indexOf(track.url);
        if (index === -1) {
            likes.push(track.url);
            metadata[track.url] = track;
            showFeedback("Добавлено в Избранное (локально)");
        } else {
            likes.splice(index, 1);
            delete metadata[track.url];
            showFeedback("Удалено из Избранного");
        }
        localStorage.setItem("nebula_likes", JSON.stringify(likes));
        localStorage.setItem("nebula_likes_metadata", JSON.stringify(metadata));
        updateLikeButtonIcon();
    }
}

function updateLikeButtonIcon() {
    const btn = document.getElementById("btnLikeTrack");
    if (!btn) return;
    
    const track = playlist[currentTrackIdx];
    if (!track) {
        btn.innerHTML = '<i class="ph-bold ph-heart"></i>';
        btn.classList.remove("liked");
        return;
    }
    
    const trackId = track.url;
    let likes = [];
    
    if (loggedInUser) {
        likes = userAccounts[loggedInUser]?.favorites || [];
    } else {
        likes = JSON.parse(localStorage.getItem("nebula_likes") || "[]");
    }
    
    if (likes.includes(trackId)) {
        btn.innerHTML = '<i class="ph-fill ph-heart"></i>';
        btn.classList.add("liked");
    } else {
        btn.innerHTML = '<i class="ph-bold ph-heart"></i>';
        btn.classList.remove("liked");
    }
}

function dislikeCurrentTrack() {
    showFeedback("Трек пропущен и больше не появится");
    if (isMyWave) {
        playNextMyWaveTrack();
    } else {
        playNext();
    }
}

// --------------------------------------------------------------------------
// Endless "My Wave" (Моя волна) System
// --------------------------------------------------------------------------

function toggleMyWave() {
    const btn = document.getElementById("btnMyWave");
    if (!btn) return;
    
    isMyWave = !isMyWave;
    
    if (isMyWave) {
        btn.classList.add("active");
        btn.querySelector(".wave-text").innerText = "МОЯ ВОЛНА АКТИВНА";
        showFeedback("Эндлес-поток «Моя волна» запущен!");
        playNextMyWaveTrack();
    } else {
        btn.classList.remove("active");
        btn.querySelector(".wave-text").innerText = "ЗАПУСТИТЬ МОЮ ВОЛНУ";
        showFeedback("«Моя волна» остановлена");
        loadTrack(0);
    }
}

const WAVE_TRACKS = [
    { title: "Synthwave Horizon", artist: "Моя волна • Энергия", url: "music/song1.mp3", cover: "🌅" },
    { title: "Digital Neon Dream", artist: "Моя волна • Киберпанк", url: "music/song2.mp3", cover: "🌃" },
    { title: "Nebula Voyager", artist: "Моя волна • Космос", url: "music/song3.mp3", cover: "🌌" },
    { title: "Cyberpunk Overdrive", artist: "Моя волна • Драйв", url: "music/song4.mp3", cover: "🏎️" },
    { title: "Retro Cosmic Lounge", artist: "Моя волна • Релакс", url: "music/song5.mp3", cover: "💫" },
    { title: "Neon Grid Runner", artist: "Моя волна • Синтвейв", url: "music/song6.mp3", cover: "🏃‍♂️" },
    { title: "Midnight Subway", artist: "Моя волна • Атмосфера", url: "music/song7.mp3", cover: "🚇" },
    { title: "Autumn Sidewalk Rain", artist: "Моя волна • Уют", url: "music/song8.mp3", cover: "🍂" }
];

function playNextMyWaveTrack() {
    initAudioEngine();
    
    // Pick random song from local WAVE_TRACKS
    const song = WAVE_TRACKS[Math.floor(Math.random() * WAVE_TRACKS.length)];
    
    const waveTrack = {
        title: song.title,
        artist: song.artist,
        url: song.url,
        cover: song.cover,
        lrc: null
    };
    
    // Replace slot with dynamic wave track
    playlist[currentTrackIdx] = waveTrack;
    
    audioElement.src = waveTrack.url;
    audioElement.load();

    document.getElementById("trackTitle").innerText = waveTrack.title;
    document.getElementById("trackArtist").innerText = waveTrack.artist;
    
    const albumCover = document.getElementById("albumCover");
    if (albumCover) albumCover.innerText = waveTrack.cover;
    
    const barCover = document.getElementById("barCover");
    if (barCover) barCover.innerText = waveTrack.cover;

    document.getElementById("progressBarFill").style.width = "0%";
    document.getElementById("timeCurrent").innerText = "0:00";
    
    audioElement.onloadedmetadata = () => {
        document.getElementById("timeTotal").innerText = formatTime(audioElement.duration);
        applySpeedAndPitch();
        loadLyricsForTrack(waveTrack);
    };
    
    loadLyricsForTrack(waveTrack);
    
    audioElement.play().then(() => {
        isPlaying = true;
        document.getElementById("btnPlay").innerHTML = '<i class="ph-fill ph-pause-circle"></i>';
        document.getElementById("vinylDisc").classList.add("playing");
    }).catch(err => {
        console.error("Wave autoplay blocked by browser policies:", err);
    });
    
    document.querySelectorAll(".track-item").forEach(item => item.classList.remove("active"));
    updateLikeButtonIcon();
}

// Register PWA Service Worker for Offline Availability
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Nebula Service Worker registered successfully:', reg.scope))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}

// ==========================================================================
// Spotify/Yandex Music Layout Routing & Interactions
// ==========================================================================

// Section Navigation Routing
function showSection(sectionId) {
    const sections = ['home', 'youtube', 'playlist', 'visualizer', 'lyrics'];
    sections.forEach(s => {
        const element = document.getElementById(`section${s.charAt(0).toUpperCase() + s.slice(1)}`);
        if (element) {
            element.style.display = (s === sectionId) ? 'block' : 'none';
        }
    });

    // Update active nav items
    document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => {
        item.classList.remove("active");
    });
    
    // Find the current nav item
    const navIdMap = {
        'home': 'navHome',
        'youtube': 'navYoutube',
        'playlist': 'navPlaylist',
        'visualizer': 'navVisualizer',
        'lyrics': 'navLyrics'
    };
    let targetNavId = navIdMap[sectionId];
    if (sectionId === 'playlist') {
        if (currentPlaylistName === 'favorites') {
            targetNavId = 'navFavorites';
        } else if (currentPlaylistName !== 'library') {
            targetNavId = `navPlaylist_${currentPlaylistName}`;
        }
    }
    const activeNav = document.getElementById(targetNavId);
    if (activeNav) {
        activeNav.classList.add("active");
    }

    // Force canvas resize on Visualizer layout change
    if (sectionId === 'visualizer') {
        setTimeout(resizeCanvas, 50);
        setTimeout(resizeCanvas, 200);
    }
    
    // Auto-scroll lyrics if entering lyrics tab
    if (sectionId === 'lyrics') {
        const secContainer = document.getElementById("sectionLyricsContainer");
        if (secContainer) {
            setTimeout(() => scrollLyricsToActive(secContainer), 100);
        }
    }
    
    // Focus YouTube search input
    if (sectionId === 'youtube') {
        setTimeout(() => {
            const inp = document.getElementById("ytSearchInput");
            if (inp) inp.focus();
        }, 100);
    }
}

// Slide-out right panel logic for Equalizer
function toggleEffectsPanel() {
    const sidebar = document.getElementById("effectsSidebar");
    const toggleBtn = document.getElementById("btnToggleEQ");
    if (sidebar) {
        sidebar.classList.toggle("active");
        if (sidebar.classList.contains("active")) {
            if (toggleBtn) toggleBtn.classList.add("active");
        } else {
            if (toggleBtn) toggleBtn.classList.remove("active");
        }
    }
}

// Local Tracks Search Filter
function handleSearch(query) {
    const lower = query.toLowerCase();
    
    // Filter tracks list on Home page
    const homeItems = document.querySelectorAll("#tracksList .track-item");
    playlist.forEach((track, index) => {
        const match = track.title.toLowerCase().includes(lower) || track.artist.toLowerCase().includes(lower);
        if (homeItems[index]) {
            homeItems[index].style.display = match ? "grid" : "none";
        }
    });

    // Filter tracks list on Media Library page
    const libItems = document.querySelectorAll("#libraryTracksList .track-item");
    playlist.forEach((track, index) => {
        const match = track.title.toLowerCase().includes(lower) || track.artist.toLowerCase().includes(lower);
        if (libItems[index]) {
            libItems[index].style.display = match ? "grid" : "none";
        }
    });
}

// ==========================================================================
// YouTube Music Integration via Piped API
// ==========================================================================
// YouTube Music Integration via Local Proxy (yt-dlp)
const YT_PROXY_URL = "http://localhost:9001";

let ytNextPage = null; // Pagination not supported by proxy yet
let ytLastQuery = "";
let ytSearchResults = [];

// Fetch from local proxy
async function ytFetchWithProxy(path) {
    const url = `${YT_PROXY_URL}${path}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data;
    } catch (err) {
        throw new Error(`Прокси недоступен: ${err.message}. Убедитесь, что python yt_proxy.py запущен.`);
    }
}

// Search YouTube via Local Proxy
async function ytSearch() {
    const input = document.getElementById("ytSearchInput");
    const query = input ? input.value.trim().toLowerCase() : "";
    if (!query) {
        showFeedback("Введите поисковый запрос!");
        return;
    }
    
    ytLastQuery = query;
    ytNextPage = null;
    ytSearchResults = [];
    
    const grid = document.getElementById("ytResultsGrid");
    const loading = document.getElementById("ytLoading");
    const error = document.getElementById("ytError");
    const loadMore = document.getElementById("ytLoadMore");
    
    if (grid) grid.innerHTML = "";
    if (error) error.style.display = "none";
    if (loading) loading.style.display = "flex";
    if (loadMore) loadMore.style.display = "none";
    
    const matchingLocal = playlist.filter(t => 
        t.url.startsWith("blob:") && 
        (t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query))
    ).map(t => ({
        id: t.url,
        title: t.title,
        artist: t.artist,
        thumbnail: t.thumbnail || 'music/default.jpg',
        duration: 0,
        isLocal: true,
        isYoutube: false
    }));

    const matchingNebula = DEFAULT_PLAYLIST.filter(t => 
        (t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query))
    ).map(t => ({
        id: t.url,
        title: t.title,
        artist: t.artist,
        thumbnail: t.cover ? '' : 'music/default.jpg',
        duration: 0,
        isNebula: true,
        isYoutube: false
    }));

    if (searchFilter === 'local') {
        if (loading) loading.style.display = "none";
        if (matchingLocal.length === 0) {
            if (error) {
                error.innerText = `Локальных треков не найдено по запросу «${query}»`;
                error.style.display = "block";
            }
            return;
        }
        ytSearchResults = matchingLocal;
        ytRenderResults(matchingLocal, false);
        return;
    }

    if (searchFilter === 'nebula') {
        if (loading) loading.style.display = "none";
        if (matchingNebula.length === 0) {
            if (error) {
                error.innerText = `Треков Nebula Cloud не найдено по запросу «${query}»`;
                error.style.display = "block";
            }
            return;
        }
        ytSearchResults = matchingNebula;
        ytRenderResults(matchingNebula, false);
        return;
    }

    try {
        const data = await ytFetchWithProxy(`/api/search?q=${encodeURIComponent(query + " music")}&limit=20`);
        if (loading) loading.style.display = "none";
        
        let ytItems = data.items || [];
        
        let finalResults = [];
        if (searchFilter === 'all') {
            finalResults = [...matchingLocal, ...matchingNebula, ...ytItems];
        } else {
            finalResults = ytItems;
        }
        
        if (finalResults.length === 0) {
            if (error) {
                error.innerText = `Ничего не найдено по запросу «${query}»`;
                error.style.display = "block";
            }
            return;
        }
        
        ytSearchResults = finalResults;
        ytRenderResults(finalResults, false);
    } catch (err) {
        if (loading) loading.style.display = "none";
        
        if (searchFilter === 'all' && (matchingLocal.length > 0 || matchingNebula.length > 0)) {
            const fallback = [...matchingLocal, ...matchingNebula];
            ytSearchResults = fallback;
            ytRenderResults(fallback, false);
            showFeedback("YouTube оффлайн, показаны локальные результаты");
        } else if (error) {
            error.innerText = `Ошибка поиска: ${err.message}`;
            error.style.display = "block";
        }
    }
}

// Proxy doesn't support next page yet
async function ytLoadNextPage() {
    // Stub
}

// Render YouTube search result cards
function ytRenderResults(items, append) {
    const grid = document.getElementById("ytResultsGrid");
    if (!grid) return;
    
    if (!append) grid.innerHTML = "";
    
    items.forEach((item) => {
        const videoId = item.id;
        if (!videoId) return;
        
        const title = item.title || "Без названия";
        const artist = item.artist || "Неизвестный";
        const thumb = item.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        const duration = item.duration ? ytFormatDuration(item.duration) : "";
        
        let originBadge = '';
        if (item.isLocal || videoId.startsWith("blob:")) {
            originBadge = `<span class="track-origin-badge local"><i class="ph-fill ph-hard-drive"></i> Локальный</span>`;
        } else if (item.isNebula || videoId.startsWith("music/")) {
            originBadge = `<span class="track-origin-badge nebula"><i class="ph-fill ph-sparkle"></i> Nebula</span>`;
        } else {
            originBadge = `<span class="track-origin-badge yt-music"><i class="ph-fill ph-youtube-logo"></i> YT Music</span>`;
        }

        const card = document.createElement("div");
        card.className = "yt-result-card";
        card.id = `yt-card-${videoId}`;
        
        card.innerHTML = `
            <img class="yt-result-thumb" src="${thumb}" alt="${title}" loading="lazy" onerror="this.src='https://i.ytimg.com/vi/${videoId}/hqdefault.jpg'">
            <div class="yt-result-overlay">
                <button class="yt-play-overlay-btn" onclick="event.stopPropagation(); ytPlayVideo('${videoId}', this)"><i class="ph-fill ph-play-circle"></i></button>
            </div>
            ${duration ? `<span class="yt-result-duration">${duration}</span>` : ""}
            <div class="yt-result-info">
                <div class="yt-result-title" title="${title}">${title}</div>
                <div class="yt-result-artist" style="display:flex;align-items:center;justify-content:space-between;width:100%;">${artist} ${originBadge}</div>
            </div>
            <div class="yt-result-actions">
                <button class="yt-action-btn yt-btn-play" onclick="event.stopPropagation(); ytPlayVideo('${videoId}', this)"><i class="ph-fill ph-play-circle"></i> ИГРАТЬ</button>
                <button class="yt-action-btn yt-btn-add" onclick="event.stopPropagation(); ytAddToPlaylist('${videoId}')">+ В ПЛЕЙЛИСТ</button>
            </div>
        `;
        
        card.onclick = () => ytPlayVideo(videoId);
        grid.appendChild(card);
    });
}

// Extract video ID from URL (keep for compatibility if needed, though proxy returns pure ID)
function ytExtractVideoId(url) {
    if (!url) return null;
    const match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];
    const parts = url.split("/");
    const last = parts[parts.length - 1];
    if (last && last.length === 11) return last;
    return null;
}

// Format seconds to mm:ss
function ytFormatDuration(seconds) {
    if (!seconds || seconds <= 0) return "";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
}

// Play a YouTube video by fetching its audio stream URL via Proxy
async function ytPlayVideo(videoId, btnElement) {
    if (videoId.startsWith("blob:") || videoId.startsWith("music/")) {
        const found = playlist.find(t => t.url === videoId) || 
                      DEFAULT_PLAYLIST.find(t => t.url === videoId);
        if (found) {
            const idx = playlist.findIndex(t => t.url === videoId);
            if (idx >= 0) {
                initAudioEngine();
                loadTrack(idx);
            } else {
                playlist.push(found);
                renderPlaylist();
                initAudioEngine();
                loadTrack(playlist.length - 1);
            }
            if (!isPlaying) togglePlay();
            else audioElement.play();
            showFeedback(`Сейчас играет: ${found.title}`);
            return;
        }
    }

    const card = document.getElementById(`yt-card-${videoId}`);
    if (card) card.classList.add("loading");
    
    try {
        showFeedback("Загрузка аудио-потока...");
        const data = await ytFetchWithProxy(`/api/stream?id=${encodeURIComponent(videoId)}`);
        
        if (!data.audioUrl) throw new Error("Не удалось получить URL аудио-потока.");
        
        const track = {
            title: data.title || "YouTube Track",
            artist: data.artist || "YouTube",
            url: data.audioUrl,
            cover: "🎵",
            isYoutube: true,
            youtubeId: videoId,
            thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        };
        
        playlist.push(track);
        renderPlaylist();
        initAudioEngine();
        loadTrack(playlist.length - 1);
        
        if (!isPlaying) togglePlay();
        else audioElement.play();
        
        showFeedback(`Сейчас играет: ${track.title}`);
    } catch (err) {
        console.error("YouTube playback error:", err);
        showFeedback(`Ошибка: ${err.message}`);
    } finally {
        if (card) card.classList.remove("loading");
    }
}

// Add a YouTube track to playlist without playing
async function ytAddToPlaylist(videoId) {
    if (videoId.startsWith("blob:") || videoId.startsWith("music/")) {
        const found = playlist.find(t => t.url === videoId) || 
                      DEFAULT_PLAYLIST.find(t => t.url === videoId);
        if (found) {
            playlist.push(found);
            renderPlaylist();
            showFeedback(`Добавлено в плейлист: ${found.title}`);
        }
        return;
    }

    const card = document.getElementById(`yt-card-${videoId}`);
    if (card) card.classList.add("loading");
    
    try {
        const data = await ytFetchWithProxy(`/api/stream?id=${encodeURIComponent(videoId)}`);
        if (!data.audioUrl) throw new Error("Не удалось получить URL аудио-потока.");
        
        const track = {
            title: data.title || "YouTube Track",
            artist: data.artist || "YouTube",
            url: data.audioUrl,
            cover: "🎵",
            isYoutube: true,
            youtubeId: videoId,
            thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        };
        
        playlist.push(track);
        renderPlaylist();
        showFeedback(`Добавлено в плейлист: ${track.title}`);
    } catch (err) {
        showFeedback(`Ошибка: ${err.message}`);
    } finally {
        if (card) card.classList.remove("loading");
    }
}



// ==========================================================================
// Custom Playlists Logic
// ==========================================================================

function renderCustomPlaylistsNav() {
    const nav = document.getElementById("customPlaylistsNav");
    if (!nav) return;
    nav.innerHTML = "";
    Object.keys(customPlaylists).forEach(name => {
        const a = document.createElement("a");
        a.href = "#";
        a.className = "nav-item";
        a.id = `navPlaylist_${name}`;
        a.innerText = '<i class="ph-bold ph-music-notes"></i> ' + name;
        a.onclick = (e) => {
            e.preventDefault();
            // Highlight active nav
            document.querySelectorAll(".sidebar-nav .nav-item").forEach(n => n.classList.remove("active"));
            a.classList.add("active");
            showCustomPlaylist(name);
        };
        nav.appendChild(a);
    });
}

function createNewPlaylist() {
    const modal = document.getElementById('createPlaylistModal');
    const input = document.getElementById('inputNewPlaylistName');
    input.value = "";
    modal.style.display = 'flex';
    input.focus();
}

async function submitCreatePlaylist() {
    const input = document.getElementById('inputNewPlaylistName');
    const name = input.value.trim();
    if (!name) return;
    
    if (loggedInUser) {
        try {
            const res = await fetch('http://localhost:9001/api/playlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: loggedInUser, name })
            });
            const data = await res.json();
            if (res.ok) {
                showFeedback(`Плейлист '${name}' создан!`);
                document.getElementById('createPlaylistModal').style.display = 'none';
                await syncUserDataFromServer();
            } else {
                showFeedback(data.error || "Ошибка создания плейлиста");
            }
        } catch (e) {
            console.error(e);
            showFeedback("Ошибка связи с сервером БД");
        }
    } else {
        if (!customPlaylists[name]) {
            customPlaylists[name] = [];
            saveCustomPlaylists();
            renderCustomPlaylistsNav();
            showFeedback(`Плейлист '${name}' создан!`);
            document.getElementById('createPlaylistModal').style.display = 'none';
        } else {
            showFeedback(`Плейлист '${name}' уже существует.`);
        }
    }
}

function saveCustomPlaylists() {
    localStorage.setItem('nebula_custom_playlists', JSON.stringify(customPlaylists));
}

function showCustomPlaylist(name) {
    showSection('playlist');
    
    // Hide dashboard, show tracklist + back button
    const dashboard = document.getElementById('libraryDashboard');
    const tracksList = document.getElementById('libraryTracksList');
    const backBtn = document.getElementById('btnBackToLibrary');
    const headerTitle = document.getElementById('playlistHeaderTitle');
    if (dashboard) dashboard.style.display = 'none';
    if (tracksList) tracksList.style.display = 'block';
    if (backBtn) backBtn.style.display = 'inline-flex';
    if (headerTitle) headerTitle.innerText = name;
    
    currentPlaylistName = name;
    playlist = customPlaylists[name] || [];
    currentTrackIdx = 0;
    renderPlaylist();
}

// ========================================================================
// Library Dashboard Engine
// ========================================================================

function showLibraryDashboard() {
    showSection('playlist');
    
    // Highlight correct nav
    document.querySelectorAll(".sidebar-nav .nav-item").forEach(n => n.classList.remove("active"));
    const navPlaylist = document.getElementById('navPlaylist');
    if (navPlaylist) navPlaylist.classList.add('active');
    
    currentPlaylistName = 'library';
    
    const dashboard = document.getElementById('libraryDashboard');
    const tracksList = document.getElementById('libraryTracksList');
    const backBtn = document.getElementById('btnBackToLibrary');
    const headerTitle = document.getElementById('playlistHeaderTitle');
    
    // Show dashboard, hide tracklist and back button
    if (dashboard) dashboard.style.display = 'block';
    if (tracksList) tracksList.style.display = 'none';
    if (backBtn) backBtn.style.display = 'none';
    if (headerTitle) headerTitle.innerText = 'Моя Медиатека';
    
    // Update favorites count
    const userToFetch = loggedInUser || getOrCreateGuestId();
    fetch(`http://localhost:9001/api/favorites?username=${encodeURIComponent(userToFetch)}`)
        .then(res => res.json())
        .then(data => {
            const hubCount = document.getElementById('hubFavoritesCount');
            if (hubCount) hubCount.innerText = `${data.favorites.length} треков`;
        })
        .catch(() => {
            const likes = JSON.parse(localStorage.getItem("nebula_likes") || "[]");
            const hubCount = document.getElementById('hubFavoritesCount');
            if (hubCount) hubCount.innerText = `${likes.length} треков`;
        });
    
    // Render playlists grid
    renderDashboardPlaylists();
    
    // Load local library tracks into the main playlist for playback
    playlist = [...DEFAULT_PLAYLIST];
    renderPlaylist();
}

function renderDashboardPlaylists() {
    const grid = document.getElementById('dashboardPlaylistsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const names = Object.keys(customPlaylists);
    
    if (names.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 10px 0;">Плейлистов пока нет. Создайте первый!</p>';
        return;
    }
    
    // Color palette for playlist cards
    const colors = [
        { from: 'rgba(255, 51, 102, 0.15)', to: 'rgba(189, 0, 255, 0.15)', icon: '#ff3366' },
        { from: 'rgba(0, 242, 254, 0.15)', to: 'rgba(79, 172, 254, 0.15)', icon: '#00f2fe' },
        { from: 'rgba(134, 239, 172, 0.15)', to: 'rgba(59, 130, 246, 0.15)', icon: '#86efac' },
        { from: 'rgba(251, 191, 36, 0.15)', to: 'rgba(245, 101, 101, 0.15)', icon: '#fbbf24' },
        { from: 'rgba(167, 139, 250, 0.15)', to: 'rgba(236, 72, 153, 0.15)', icon: '#a78bfa' },
        { from: 'rgba(52, 211, 153, 0.15)', to: 'rgba(96, 165, 250, 0.15)', icon: '#34d399' },
    ];
    
    const icons = ['ph-music-notes', 'ph-headphones', 'ph-vinyl-record', 'ph-radio', 'ph-waveform', 'ph-speaker-high'];
    
    names.forEach((name, idx) => {
        const color = colors[idx % colors.length];
        const icon = icons[idx % icons.length];
        const tracks = customPlaylists[name] || [];
        
        const card = document.createElement('div');
        card.className = 'dashboard-playlist-card';
        card.onclick = () => showCustomPlaylist(name);
        card.innerHTML = `
            <div class="playlist-card-art" style="background: linear-gradient(135deg, ${color.from} 0%, ${color.to} 100%);">
                <i class="ph ${icon}" style="color: ${color.icon};"></i>
            </div>
            <div class="playlist-card-title" title="${name}">${name}</div>
            <div class="playlist-card-count">${tracks.length} треков</div>
        `;
        grid.appendChild(card);
    });
}

// Override showSection partially to handle 'library' return
const originalShowSection = showSection;
window.showSection = function(sectionId) {
    originalShowSection(sectionId);
    if (sectionId === 'playlist') {
        // If clicked from sidebar 'Моя медиатека' - always show dashboard
        if (event && event.target) {
            const target = event.target.closest ? event.target.closest('#navPlaylist') : null;
            if (target || event.target.id === 'navPlaylist') {
                showLibraryDashboard();
            }
        }
    }
}

function promptAddToCustomPlaylist(trackIdx) {
    const lists = Object.keys(customPlaylists);
    if (lists.length === 0) {
        showFeedback("Сначала создайте плейлист!");
        return;
    }
    
    const container = document.getElementById('addToPlaylistList');
    container.innerHTML = "";
    lists.forEach(listName => {
        const btn = document.createElement('button');
        btn.className = 'auth-btn btn-login';
        btn.style.width = '100%';
        btn.style.textAlign = 'left';
        btn.style.padding = '10px 15px';
        btn.style.background = 'rgba(255,255,255,0.05)';
        btn.style.color = '#fff';
        btn.style.border = '1px solid var(--border-color)';
        btn.style.cursor = 'pointer';
        btn.innerHTML = `<i class="ph ph-folder" style="margin-right: 8px;"></i> ${listName}`;
        btn.onclick = () => confirmAddToPlaylist(listName, trackIdx);
        container.appendChild(btn);
    });
    
    document.getElementById('addToPlaylistModal').style.display = 'flex';
}

async function confirmAddToPlaylist(listName, trackIdx) {
    const track = playlist[trackIdx];
    if (!track) return;
    
    if (loggedInUser) {
        try {
            const res = await fetch('http://localhost:9001/api/playlists/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: loggedInUser, name: listName, track })
            });
            if (res.ok) {
                showFeedback(`Трек добавлен в '${listName}'`);
                document.getElementById('addToPlaylistModal').style.display = 'none';
                await syncUserDataFromServer();
            } else {
                showFeedback("Ошибка добавления в плейлист");
            }
        } catch (e) {
            console.error(e);
            showFeedback("Ошибка связи с сервером БД");
        }
    } else {
        if (listName && customPlaylists[listName]) {
            customPlaylists[listName].push(track);
            saveCustomPlaylists();
            showFeedback(`Трек добавлен в '${listName}'`);
            document.getElementById('addToPlaylistModal').style.display = 'none';
        }
    }
}

async function removeFromCustomPlaylist(trackIdx) {
    if (currentPlaylistName === 'library') return;
    
    if (loggedInUser) {
        try {
            const res = await fetch('http://localhost:9001/api/playlists/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: loggedInUser, name: currentPlaylistName, track_index: trackIdx })
            });
            if (res.ok) {
                showFeedback("Трек удалён из плейлиста");
                await syncUserDataFromServer();
            } else {
                showFeedback("Ошибка удаления из плейлиста");
            }
        } catch (e) {
            console.error(e);
            showFeedback("Ошибка связи с сервером БД");
        }
    } else {
        if (customPlaylists[currentPlaylistName]) {
            customPlaylists[currentPlaylistName].splice(trackIdx, 1);
            saveCustomPlaylists();
            renderPlaylist();
            showFeedback("Трек удалён из плейлиста");
        }
    }
}

// ==========================================================================
// Room Sync / Co-Listening Logic
// ==========================================================================
let currentRoomId = null;
let roomSyncInterval = null;
let isSyncing = false;

function joinRoom() {
    const input = document.getElementById("roomIdInput");
    const roomId = input.value.trim();
    if (!roomId) return;
    
    currentRoomId = roomId;
    document.getElementById("roomStatus").innerHTML = `Подключено к комнате: <strong>${roomId}</strong>. Синхронизация активна <i class="ph ph-spinner ph-spin"></i>`;
    document.getElementById("roomStatus").style.color = "var(--primary)";
    document.getElementById("roomControls").style.display = "block";
    showFeedback(`Вы вошли в комнату ${roomId}`);
    
    // Initial Push if we are playing something
    if (isPlaying && playlist.length > 0) {
        pushRoomState();
    }
    
    // Start polling
    if (roomSyncInterval) clearInterval(roomSyncInterval);
    roomSyncInterval = setInterval(pollRoomState, 1500);
}

function leaveRoom() {
    if (roomSyncInterval) clearInterval(roomSyncInterval);
    currentRoomId = null;
    document.getElementById("roomStatus").innerHTML = "Вы не подключены к комнате.";
    document.getElementById("roomStatus").style.color = "var(--text-secondary)";
    document.getElementById("roomControls").style.display = "none";
    showFeedback("Вы вышли из комнаты");
}

async function pollRoomState() {
    if (!currentRoomId) return;
    try {
        const res = await fetch(`http://localhost:9001/api/room?id=${encodeURIComponent(currentRoomId)}`);
        if (!res.ok) return;
        const state = await res.json();
        
        if (!state || !state.track) return;
        
        // Check if we need to sync
        const currentTrack = playlist[currentTrackIdx] || {};
        
        isSyncing = true; // Prevent pushing while syncing
        
        if (state.track.url !== currentTrack.url) {
            // Need to load the new track
            // Let's add it to playlist if not exists, or just play it temporarily
            const trackExistsIdx = playlist.findIndex(t => t.url === state.track.url);
            if (trackExistsIdx >= 0) {
                loadTrack(trackExistsIdx);
            } else {
                playlist.push(state.track);
                loadTrack(playlist.length - 1);
            }
        }
        
        // Sync Time (allow 2 seconds diff to avoid micro-stutters)
        if (Math.abs(audioElement.currentTime - state.time) > 2) {
            audioElement.currentTime = state.time;
        }
        
        // Sync Play State
        if (state.playing && !isPlaying) {
            togglePlay();
        } else if (!state.playing && isPlaying) {
            togglePlay();
        }
        
        setTimeout(() => isSyncing = false, 500);
    } catch (err) {
        console.error("Room sync error:", err);
    }
}

async function pushRoomState() {
    if (!currentRoomId || isSyncing) return;
    const track = playlist[currentTrackIdx];
    if (!track) return;
    
    const state = {
        track: track,
        time: audioElement.currentTime,
        playing: isPlaying
    };
    
    try {
        await fetch(`http://localhost:9001/api/room?id=${encodeURIComponent(currentRoomId)}`, {
            method: 'POST',
            body: JSON.stringify(state)
        });
    } catch (err) {
        console.error("Room push error:", err);
    }
}

// Hook into existing events to push state
const oldTogglePlay = togglePlay;
window.togglePlay = function() {
    oldTogglePlay();
    if (currentRoomId) pushRoomState();
}

const oldPlayNext = playNext;
window.playNext = function() {
    oldPlayNext();
    if (currentRoomId) setTimeout(pushRoomState, 500);
}

const oldPlayPrev = playPrevious;
window.playPrevious = function() {
    oldPlayPrev();
    if (currentRoomId) setTimeout(pushRoomState, 500);
}

// Hook into seeked events if needed (moved to initAudioEngine)


// ==========================================================================
// Playback State Persistence (Auto-Save and Restore)
// ==========================================================================

function restorePlaybackState() {
    const savedName = localStorage.getItem("nebula_last_playlist_name");
    const savedTracks = localStorage.getItem("nebula_last_playlist_tracks");
    const savedIdx = localStorage.getItem("nebula_last_track_index");
    const savedTime = localStorage.getItem("nebula_last_track_time");
    
    if (savedName && savedTracks && savedIdx !== null) {
        try {
            currentPlaylistName = savedName;
            playlist = JSON.parse(savedTracks);
            const idx = parseInt(savedIdx, 10);
            
            if (idx >= 0 && idx < playlist.length) {
                currentTrackIdx = idx;
                
                // Exclude invalid blob URLs (e.g. from previous session local files)
                const track = playlist[currentTrackIdx];
                if (track && track.url && track.url.startsWith("blob:")) {
                    console.warn("Restored track has a blob URL (local file) which is expired. Resetting to first track.");
                    currentTrackIdx = 0;
                    return null;
                }
                
                if (savedTime) {
                    const targetTime = parseFloat(savedTime);
                    if (!isNaN(targetTime) && targetTime > 0) {
                        return targetTime;
                    }
                }
            }
        } catch (e) {
            console.error("Failed to restore playback state:", e);
        }
    }
    return null;
}

// Guarantee saving of final state when window closes or reloads
window.addEventListener("beforeunload", () => {
    if (audioElement) {
        localStorage.setItem("nebula_last_track_time", audioElement.currentTime);
        localStorage.setItem("nebula_last_track_index", currentTrackIdx);
        localStorage.setItem("nebula_last_playlist_name", currentPlaylistName);
        localStorage.setItem("nebula_last_playlist_tracks", JSON.stringify(playlist));
    }
});

// Sleek Track Status Indicator
function updateTrackStatus(text, type = 'loading') {
    const statusEl = document.getElementById("trackStatus");
    if (!statusEl) return;
    
    if (!text) {
        statusEl.style.display = "none";
        statusEl.innerHTML = "";
        return;
    }
    
    statusEl.style.display = "flex";
    statusEl.className = `bar-track-status ${type}`;
    statusEl.innerHTML = `<span class="status-dot"></span><span>${text}</span>`;
}

// Update loop/repeat button UI states programmatically
function updateLoopButtonUI() {
    const btn = document.getElementById("btnLoop");
    if (!btn) return;
    
    if (repeatMode === "none") {
        btn.innerHTML = '<i class="ph-bold ph-repeat"></i>';
        btn.classList.remove("active");
    } else if (repeatMode === "playlist") {
        btn.innerHTML = '<i class="ph-bold ph-repeat"></i>';
        btn.classList.add("active");
    } else if (repeatMode === "track") {
        btn.innerHTML = '<i class="ph-bold ph-repeat-once"></i>';
        btn.classList.add("active");
    }
    
    if (audioElement) {
        audioElement.loop = (repeatMode === "track");
    }
}



// ==========================================================================
// YT Music Recommendations & Global Search Filter Logic
// ==========================================================================

function renderHomeRecommendations() {
    const container = document.getElementById("tracksList");
    if (!container) return;
    container.innerHTML = "";

    homeRecommendations.forEach((track, index) => {
        const item = document.createElement("div");
        item.className = "track-item";
        item.onclick = () => {
            playRecommendedTrack(index);
        };

        let originBadge = `<span class="track-origin-badge yt-music"><i class="ph-fill ph-youtube-logo"></i> YT Music</span>`;

        item.innerHTML = `
            <div class="track-item-art">${track.cover || '<i class="ph-fill ph-disc"></i>'}</div>
            <div class="track-item-info">
                <div class="track-item-name">${track.title}</div>
                <div class="track-item-meta">
                    <span class="track-item-artist">${track.artist}</span>
                    ${originBadge}
                </div>
            </div>
            <div class="track-item-actions" style="margin-left: auto; display: flex; gap: 10px; align-items: center;">
                <button class="action-btn" onclick="event.stopPropagation(); ytAddToPlaylist('${track.youtubeId}')" title="Добавить в плейлист" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:16px;"><i class="ph-bold ph-plus"></i></button>
            </div>
        `;
        container.appendChild(item);
    });
}

async function playRecommendedTrack(idx) {
    const track = homeRecommendations[idx];
    if (!track) return;
    
    showFeedback("Загрузка рекомендации...");
    
    const existingIdx = playlist.findIndex(t => t.youtubeId === track.youtubeId);
    if (existingIdx >= 0) {
        initAudioEngine();
        loadTrack(existingIdx);
        if (!isPlaying) togglePlay();
        else audioElement.play();
    } else {
        playlist.push(track);
        renderPlaylist();
        initAudioEngine();
        loadTrack(playlist.length - 1);
        if (!isPlaying) togglePlay();
        else audioElement.play();
    }
}

function playAllRecommendations() {
    if (homeRecommendations.length === 0) return;
    playlist = [...homeRecommendations];
    currentPlaylistName = 'library';
    renderPlaylist();
    initAudioEngine();
    loadTrack(0);
    if (!isPlaying) togglePlay();
    else audioElement.play();
    showFeedback("Воспроизведение всех рекомендаций YouTube Music");
}

async function loadHomeRecommendations(category, btnElement) {
    document.querySelectorAll(".recommendations-categories-grid .rec-cat-card").forEach(card => {
        card.classList.remove("active");
    });
    if (btnElement) {
        btnElement.classList.add("active");
    } else {
        const card = document.getElementById(`rec-cat-${category}`);
        if (card) card.classList.add("active");
    }

    const loader = document.getElementById("recLoading");
    const tracksContainer = document.getElementById("tracksList");
    
    if (loader) loader.style.display = "flex";
    if (tracksContainer) tracksContainer.style.opacity = "0.3";
    
    try {
        const res = await fetch(`http://localhost:9001/api/recommendations?category=${encodeURIComponent(category)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        
        homeRecommendations = (data.items || []).map(item => ({
            title: item.title,
            artist: item.artist,
            url: `http://localhost:9001/api/play?id=${item.id}`,
            cover: "🎵",
            isYoutube: true,
            youtubeId: item.id,
            thumbnail: item.thumbnail
        }));
        
        renderHomeRecommendations();
    } catch (e) {
        console.error("Error loading home recommendations:", e);
        showFeedback("Не удалось загрузить рекомендации YouTube Music");
    } finally {
        if (loader) loader.style.display = "none";
        if (tracksContainer) tracksContainer.style.opacity = "1";
    }
}

function setSearchFilter(filter, btn) {
    searchFilter = filter;
    document.querySelectorAll(".search-filters-bar .filter-pill").forEach(p => p.classList.remove("active"));
    if (btn) btn.classList.add("active");
    
    const input = document.getElementById("ytSearchInput");
    if (input && input.value.trim()) {
        ytSearch();
    }
}
