import codecs
import re

def patch_index():
    with codecs.open('www/index.html', 'r', 'utf-8') as f:
        html = f.read()

    # 1. Inject CDN if not present
    if "unpkg.com/@phosphor-icons/web" not in html:
        html = html.replace('</head>', '    <script src="https://unpkg.com/@phosphor-icons/web"></script>\n</head>')

    # 2. Add Room Sidebar Link
    if 'showSection(\'room\')' not in html:
        html = html.replace(
            '<a href="#" class="nav-item" id="navLyrics" onclick="showSection(\'lyrics\')">💬 Текст песни</a>',
            '<a href="#" class="nav-item" id="navLyrics" onclick="showSection(\'lyrics\')"><i class="ph ph-text-align-left"></i> Текст песни</a>\n                <a href="#" class="nav-item" id="navRoom" onclick="showSection(\'room\')"><i class="ph ph-users"></i> Совместное прослушивание</a>'
        )

    # 3. Replace text emojis in sidebar
    html = html.replace('🏠 Главная', '<i class="ph ph-house"></i> Главная')
    html = html.replace('🎵 YouTube Music', '<i class="ph ph-youtube-logo"></i> YouTube Music')
    html = html.replace('📁 Моя медиатека', '<i class="ph ph-folder"></i> Моя медиатека')
    html = html.replace('📊 Визуализатор', '<i class="ph ph-chart-bar"></i> Визуализатор')
    html = html.replace('<span class="wave-card-icon">🌊</span>', '<span class="wave-card-icon"><i class="ph ph-waves"></i></span>')
    html = html.replace('<span class="brand-logo">✨</span>', '<span class="brand-logo"><i class="ph-fill ph-sparkle"></i></span>')

    # 4. Replace other generic emojis
    html = html.replace('<span>🔍</span>', '<span><i class="ph ph-magnifying-glass"></i></span>')
    html = html.replace('<span class="upload-icon">📥</span>', '<span class="upload-icon"><i class="ph ph-download-simple"></i></span>')

    # 5. Buttons replacement
    html = html.replace('title="Назад">⏮</button>', 'title="Назад"><i class="ph-fill ph-skip-back"></i></button>')
    html = html.replace('title="Воспроизведение">▶️</button>', 'title="Воспроизведение"><i class="ph-fill ph-play-circle"></i></button>')
    html = html.replace('title="Вперед">⏭</button>', 'title="Вперед"><i class="ph-fill ph-skip-forward"></i></button>')
    html = html.replace('title="Перемешать">🔀</button>', 'title="Перемешать"><i class="ph-bold ph-shuffle"></i></button>')
    html = html.replace('title="Повтор">🔁</button>', 'title="Повтор"><i class="ph-bold ph-repeat"></i></button>')
    html = html.replace('onclick="toggleMute()">🔊</button>', 'onclick="toggleMute()"><i class="ph-fill ph-speaker-high"></i></button>')
    html = html.replace('title="Включить FX">🎛️</button>', 'title="Включить FX"><i class="ph-fill ph-sliders"></i></button>')
    
    # 6. Add Room Section HTML
    room_html = '''
            <!-- Room / Co-listening Section -->
            <section class="section-container" id="sectionRoom" style="display: none;">
                <div class="tracks-table-container" style="max-width: 600px; margin: 0 auto;">
                    <h3><i class="ph ph-users"></i> Совместное прослушивание</h3>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">Слушайте музыку синхронно с друзьями! Введите ID комнаты, чтобы подключиться или создать новую.</p>
                    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                        <input type="text" id="roomIdInput" placeholder="Например: my-party-123" style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.5); color: #fff;">
                        <button onclick="joinRoom()" style="padding: 12px 24px; border-radius: 8px; background: var(--primary); color: #fff; border: none; cursor: pointer; font-weight: bold;"><i class="ph-bold ph-sign-in"></i> Подключиться</button>
                    </div>
                    <div id="roomStatus" style="padding: 15px; border-radius: 8px; background: rgba(255,255,255,0.05); text-align: center; color: var(--text-secondary);">
                        Вы не подключены к комнате.
                    </div>
                    <div id="roomControls" style="display: none; margin-top: 20px; text-align: center;">
                        <button onclick="leaveRoom()" style="padding: 10px 20px; border-radius: 8px; background: #ff4757; color: #fff; border: none; cursor: pointer;"><i class="ph-bold ph-sign-out"></i> Покинуть комнату</button>
                    </div>
                </div>
            </section>
    '''
    if 'id="sectionRoom"' not in html:
        html = html.replace('<!-- Main Sections (Only one visible at a time) -->', '<!-- Main Sections (Only one visible at a time) -->' + room_html)

    with codecs.open('www/index.html', 'w', 'utf-8') as f:
        f.write(html)


def patch_app():
    with codecs.open('www/app.js', 'r', 'utf-8') as f:
        js = f.read()

    # 1. Replace Play/Pause innerText with HTML icons
    js = js.replace('btnPlay.innerText = "⏸";', 'btnPlay.innerHTML = \'<i class="ph-fill ph-pause-circle"></i>\';')
    js = js.replace('btnPlay.innerText = "▶️";', 'btnPlay.innerHTML = \'<i class="ph-fill ph-play-circle"></i>\';')
    js = js.replace('document.getElementById("btnPlay").innerText = "⏸";', 'document.getElementById("btnPlay").innerHTML = \'<i class="ph-fill ph-pause-circle"></i>\';')

    # 2. Add Room sync logic
    room_logic = '''
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

audioElement.addEventListener("seeked", () => {
    if (currentRoomId) pushRoomState();
});

'''
    if 'function joinRoom' not in js:
        js += room_logic

    with codecs.open('www/app.js', 'w', 'utf-8') as f:
        f.write(js)

patch_index()
patch_app()
print('Patched icons and room logic!')
