import codecs

def patch_index():
    with codecs.open('www/index.html', 'r', 'utf-8') as f:
        html = f.read()

    modal_html = '''
    <!-- Create Playlist Modal -->
    <div class="modal-overlay" id="createPlaylistModal" style="display: none;">
        <div class="modal-card">
            <div class="modal-header">
                <h3><i class="ph ph-plus-circle"></i> Создать плейлист</h3>
                <button class="modal-close-btn" onclick="document.getElementById('createPlaylistModal').style.display='none'">&times;</button>
            </div>
            <div class="modal-body">
                <div class="input-group">
                    <label>Название плейлиста</label>
                    <input type="text" id="inputNewPlaylistName" placeholder="Например: Рок хиты" onkeydown="if(event.key==='Enter') submitCreatePlaylist()">
                </div>
                <div class="modal-actions" style="margin-top: 15px;">
                    <button class="auth-btn btn-login" onclick="submitCreatePlaylist()">Создать</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Add to Playlist Modal -->
    <div class="modal-overlay" id="addToPlaylistModal" style="display: none;">
        <div class="modal-card">
            <div class="modal-header">
                <h3><i class="ph ph-list-plus"></i> Добавить в плейлист</h3>
                <button class="modal-close-btn" onclick="document.getElementById('addToPlaylistModal').style.display='none'">&times;</button>
            </div>
            <div class="modal-body">
                <p class="modal-desc" style="margin-bottom: 10px;">Выберите плейлист для сохранения трека:</p>
                <div id="addToPlaylistList" style="display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto;">
                    <!-- Populated by JS -->
                </div>
            </div>
        </div>
    </div>
    '''
    
    if 'id="createPlaylistModal"' not in html:
        html = html.replace('<!-- Script loading -->', modal_html + '\n    <!-- Script loading -->')
        with codecs.open('www/index.html', 'w', 'utf-8') as f:
            f.write(html)

def patch_app():
    with codecs.open('www/app.js', 'r', 'utf-8') as f:
        js = f.read()

    old_create = '''function createNewPlaylist() {
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
}'''

    new_create = '''function createNewPlaylist() {
    const modal = document.getElementById('createPlaylistModal');
    const input = document.getElementById('inputNewPlaylistName');
    input.value = "";
    modal.style.display = 'flex';
    input.focus();
}

function submitCreatePlaylist() {
    const input = document.getElementById('inputNewPlaylistName');
    const name = input.value.trim();
    if (name) {
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
}'''

    js = js.replace(old_create, new_create)

    old_add = '''function promptAddToCustomPlaylist(trackIdx) {
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
}'''

    new_add = '''function promptAddToCustomPlaylist(trackIdx) {
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

function confirmAddToPlaylist(listName, trackIdx) {
    const track = playlist[trackIdx];
    if (listName && customPlaylists[listName] && track) {
        customPlaylists[listName].push(track);
        saveCustomPlaylists();
        showFeedback(`Трек добавлен в '${listName}'`);
        document.getElementById('addToPlaylistModal').style.display = 'none';
    }
}'''

    js = js.replace(old_add, new_add)

    with codecs.open('www/app.js', 'w', 'utf-8') as f:
        f.write(js)

patch_index()
patch_app()
print('Patched modals!')
