const API_KEY = 'bc380f1e1f63773ba93930ab82ebca8e';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;

async function fetchTrending(type) {
  const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results;
}

async function fetchTrendingAnime() {
  let allResults = [];
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
    const data = await res.json();
    const filtered = data.results.filter(item =>
      item.original_language === 'ja' && item.genre_ids.includes(16)
    );
    allResults = allResults.concat(filtered);
  }
  return allResults;
}

function displayBanner(item) {
  document.getElementById('banner').style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
  document.getElementById('banner-title').textContent = item.title || item.name;
}

function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

function showDetails(item) {
  currentItem = item;
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-overview').textContent = item.overview || 'No overview available.';
  document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));
  document.getElementById('modal').style.display = 'flex';
  document.getElementById('server').value = 'vidsrc.cc'; // default
  changeServer();
}

function changeServer() {
  const server = document.getElementById('server').value;
  const type = currentItem.media_type === "movie" ? "movie" : "tv";
  let embedURL = "";

  if (server === "vidsrc.cc") {
    embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  } else if (server === "vidsrc.me") {
    embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  } else if (server === "player.videasy.net") {
    embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
  }

  const videoFrame = document.getElementById('modal-video');
  videoFrame.src = embedURL;
  videoFrame.style.display = "block";
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  const videoFrame = document.getElementById('modal-video');
  videoFrame.src = '';
}

// ✅ NEW: Make search results open like regular items
function openModal(item) {
  // Ensure media_type is defined (fallback to "movie")
  if (!item.media_type) {
    item.media_type = item.title ? "movie" : "tv";
  }
  showDetails(item); // Reuse the existing modal logic
}

async function searchTMDB() {
  const query = document.getElementById("search-input").value.trim();
  const resultsContainer = document.getElementById("search-results");
  const searchSection = document.getElementById("search-section");

  if (query === "") {
    resultsContainer.innerHTML = "";
    searchSection.style.display = "none";
    return;
  }

  const url = `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    resultsContainer.innerHTML = "";

    if (data.results.length > 0) {
      searchSection.style.display = "block";

      data.results.forEach(item => {
        if (item.poster_path) {
          // Ensure media_type is present
          if (!item.media_type) {
            item.media_type = item.title ? "movie" : "tv";
          }

          const img = document.createElement("img");
          img.src = `https://image.tmdb.org/t/p/w300${item.poster_path}`;
          img.alt = item.title || item.name;
          img.onclick = () => openModal(item);
          resultsContainer.appendChild(img);
        }
      });
    } else {
      searchSection.style.display = "none";
    }

  } catch (error) {
    console.error("Search error:", error);
    searchSection.style.display = "none";
  }
}

async function init() {
  const movies = await fetchTrending('movie');
  const tvShows = await fetchTrending('tv');
  const anime = await fetchTrendingAnime();

  displayBanner(movies[Math.floor(Math.random() * movies.length)]);
  displayList(movies, 'movies-list');
  displayList(tvShows, 'tvshows-list');
  displayList(anime, 'anime-list');
}

init();

document.getElementById('search-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    openSearchModal();
  }
});
