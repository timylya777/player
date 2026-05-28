import codecs

with codecs.open('www/app.js', 'r', 'utf-8') as f:
    lines = f.readlines()

start_idx = -1
for i, l in enumerate(lines):
    if 'List of Piped API instances' in l:
        start_idx = i
        break

if start_idx != -1:
    new_code = """// YouTube Music Integration via Local Proxy (yt-dlp)
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
    const query = input ? input.value.trim() : "";
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
    if (loadMore) loadMore.style.display = "none"; // Hide as proxy doesn't paginate
    
    try {
        const data = await ytFetchWithProxy(`/api/search?q=${encodeURIComponent(query + " music")}&limit=20`);
        if (loading) loading.style.display = "none";
        
        const items = data.items || [];
        if (items.length === 0) {
            if (error) {
                error.innerText = `Ничего не найдено по запросу «${query}»`;
                error.style.display = "block";
            }
            return;
        }
        
        ytSearchResults = items;
        ytRenderResults(items, false);
    } catch (err) {
        if (loading) loading.style.display = "none";
        if (error) {
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
        
        const card = document.createElement("div");
        card.className = "yt-result-card";
        card.id = `yt-card-${videoId}`;
        
        card.innerHTML = `
            <img class="yt-result-thumb" src="${thumb}" alt="${title}" loading="lazy" onerror="this.src='https://i.ytimg.com/vi/${videoId}/hqdefault.jpg'">
            <div class="yt-result-overlay">
                <button class="yt-play-overlay-btn" onclick="event.stopPropagation(); ytPlayVideo('${videoId}', this)">▶</button>
            </div>
            ${duration ? `<span class="yt-result-duration">${duration}</span>` : ""}
            <div class="yt-result-info">
                <div class="yt-result-title" title="${title}">${title}</div>
                <div class="yt-result-artist">${artist}</div>
            </div>
            <div class="yt-result-actions">
                <button class="yt-action-btn yt-btn-play" onclick="event.stopPropagation(); ytPlayVideo('${videoId}', this)">▶ ИГРАТЬ</button>
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
"""
    lines = lines[:start_idx-1] + [new_code + '\n']
    with codecs.open('www/app.js', 'w', 'utf-8') as f:
        f.writelines(lines)
    print('Replaced Piped logic with local proxy logic successfully!')
else:
    print('Failed to find start index.')
