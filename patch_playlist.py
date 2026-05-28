import codecs

with codecs.open('www/app.js', 'r', 'utf-8') as f:
    code = f.read()

# 1. Add state variables at the top
if "let customPlaylists =" not in code:
    code = code.replace('let isPulseBg = true;', 'let isPulseBg = true;\nlet currentPlaylistName = \'library\';\nlet customPlaylists = JSON.parse(localStorage.getItem(\'nebula_custom_playlists\') || \'{"Мои любимые":[]}\');')

# 2. Add to DOMContentLoaded
if "renderCustomPlaylistsNav();" not in code:
    code = code.replace('renderPlaylist();\n    loadTrack', 'renderPlaylist();\n    renderCustomPlaylistsNav();\n    loadTrack')

# 3. Update renderPlaylist template
old_template = '''                <div class="track-item-info">
                    <div class="track-item-name">${track.title}</div>
                    <div class="track-item-meta">
                        <span class="track-item-artist">${track.artist}</span>
                    </div>
                </div>
            `;'''

new_template = '''                <div class="track-item-info">
                    <div class="track-item-name">${track.title}</div>
                    <div class="track-item-meta">
                        <span class="track-item-artist">${track.artist}</span>
                    </div>
                </div>
                <div class="track-item-actions" style="margin-left: auto; display: flex; gap: 10px;">
                    <button class="action-btn" onclick="event.stopPropagation(); promptAddToCustomPlaylist(${index})" title="Добавить в плейлист" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:16px;">➕</button>
                    ${currentPlaylistName !== 'library' ? `<button class="action-btn" onclick="event.stopPropagation(); removeFromCustomPlaylist(${index})" title="Удалить из плейлиста" style="background:none;border:none;color:var(--primary);cursor:pointer;font-size:16px;">❌</button>` : ''}
                </div>
            `;'''
if 'promptAddToCustomPlaylist' not in code:
    code = code.replace(old_template, new_template)

# 4. Append Custom Playlist logic
custom_logic = '''

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
        a.innerText = "🎵 " + name;
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
    const name = prompt("Введите название нового плейлиста:");
    if (name && name.trim()) {
        const trimName = name.trim();
        if (!customPlaylists[trimName]) {
            customPlaylists[trimName] = [];
            saveCustomPlaylists();
            renderCustomPlaylistsNav();
            showFeedback(`Плейлист '${trimName}' создан!`);
        } else {
            showFeedback(`Плейлист '${trimName}' уже существует.`);
        }
    }
}

function saveCustomPlaylists() {
    localStorage.setItem('nebula_custom_playlists', JSON.stringify(customPlaylists));
}

function showCustomPlaylist(name) {
    showSection('playlist');
    const header = document.querySelector('#sectionPlaylist h3');
    if (header) header.innerText = name;
    
    currentPlaylistName = name;
    playlist = customPlaylists[name];
    currentTrackIdx = 0;
    renderPlaylist();
}

// Override showSection partially to handle 'library' return
const originalShowSection = showSection;
window.showSection = function(sectionId) {
    originalShowSection(sectionId);
    if (sectionId === 'playlist' && currentPlaylistName !== 'library') {
        // If clicked from sidebar 'Моя медиатека'
        if (event && event.target && event.target.id === 'navPlaylist') {
            currentPlaylistName = 'library';
            playlist = [...DEFAULT_PLAYLIST]; // Or recover the library state
            const header = document.querySelector('#sectionPlaylist h3');
            if (header) header.innerText = 'Моя Медиатека';
            renderPlaylist();
        }
    }
}

function promptAddToCustomPlaylist(trackIdx) {
    const track = playlist[trackIdx];
    const lists = Object.keys(customPlaylists);
    if (lists.length === 0) {
        showFeedback("Сначала создайте плейлист!");
        return;
    }
    const name = prompt("В какой плейлист добавить?\\nДоступные: " + lists.join(", "), lists[0]);
    if (name && customPlaylists[name]) {
        customPlaylists[name].push(track);
        saveCustomPlaylists();
        showFeedback(`Добавлено в '${name}'`);
    } else if (name) {
        showFeedback("Такого плейлиста нет!");
    }
}

function removeFromCustomPlaylist(trackIdx) {
    if (currentPlaylistName !== 'library' && customPlaylists[currentPlaylistName]) {
        customPlaylists[currentPlaylistName].splice(trackIdx, 1);
        saveCustomPlaylists();
        renderPlaylist();
        showFeedback("Трек удалён из плейлиста");
    }
}
'''

if "function renderCustomPlaylistsNav" not in code:
    code += custom_logic

with codecs.open('www/app.js', 'w', 'utf-8') as f:
    f.write(code)
print('Patched app.js successfully!')
