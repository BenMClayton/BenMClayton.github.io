const CHANNEL_IDS = [
  "UCdgfdgtW1XupCf92PaDPh4w", // Cloudsy
  "UCcnP3pdYW8gCkNdzUqaDpqQ", // Duckie
  "UCBN-EYO6WLEhGDcBWv_xiRQ", // Ikeberg
  "UCxiRz8eG7dCigGDxd7xKmbg", // Lagging_daze
  "UCWzw72V4E33UcbtHBZAc8QQ", // Lucid
  "UCkDX3RwSZOsBo_Rd5t9dtqg", // MrCakeness
  "UCOiyKbbkvwoGnFMc5LbeNEw", // PizzaBuff
  "UCwaK1gmmTE2v9mz8Ky1Nyog", // Pokemaniac_101
  "UCa4xOOstTqBHDtO_kWjYCEA", // SanityAstray
  "UC2_iuMr1_yrwoMorVHoFRcQ", // SimplyKnight
  "UCf6_jrpW2tSr7ZkRvRYBIMA", // Swearo
  "UCiK3ImEtWKV5tGOxoCvA-_A", // Tramonik
  "UCluDOpUzFrV5wzMAlKABxGg", // TreeMuffins
  "UCoic94ZyEsx6OnfRWK5j6-g", // VeryUnWill
  "UC3KLF5S1mSSFiOFNKIhQh2A", // Weasel
  "UCEhAxizKRZMffNpoxLNs-1Q", // z
];

const UPLOAD_PLAYLIST_IDS = [
  "UUdgfdgtW1XupCf92PaDPh4w", "UUcnP3pdYW8gCkNdzUqaDpqQ", "UC9q1UkRbthG1LmDShU0At7Q", "UUBN-EYO6WLEhGDcBWv_xiRQ",
  "UUxiRz8eG7dCigGDxd7xKmbg", "UUWzw72V4E33UcbtHBZAc8QQ", "UUkDX3RwSZOsBo_Rd5t9dtqg", "UUOiyKbbkvwoGnFMc5LbeNEw",
  "UUwaK1gmmTE2v9mz8Ky1Nyog", "UUa4xOOstTqBHDtO_kWjYCEA", "UU2_iuMr1_yrwoMorVHoFRcQ", "UUf6_jrpW2tSr7ZkRvRYBIMA",
  "UUiK3ImEtWKV5tGOxoCvA-_A", "UUluDOpUzFrV5wzMAlKABxGg", "UUoic94ZyEsx6OnfRWK5j6-g", "UU3KLF5S1mSSFiOFNKIhQh2A",
  "UUEhAxizKRZMffNpoxLNs-1Q",
];

const PLAYLIST_IDS = {
  Cloudsy: "PLVURi-7eDwLiBuKxX0i7HFj8tYNn2iyN5",
  Duckie: "PLyIZAoTBNHO4XWCW-4AIKukmEKU2ex1HK",
  Hidngem: "PLtSW8E-aUWL32KNmsz7LOcuTCMe7-zENo",
  Ike: "PLMBiVR38EZoa_uVI755fXdPD8KF2FZjny",
  Lagging: "PL0FQDUXpbVbD6_BZTexyvD3jNGYepzYU1",
  Lucid: "PLxxx",
  MrCakeness: "PLqEljTX5h_2cvmooVkdmOYncDpXuBxvKd",
  PizzaBuff: "PLZbUfsDwM4Jhx2Q5ELhk50A8ystcEF18R",
  PizzaBuff_2: "PLZbUfsDwM4Jg3Bs9AnvpgBkCIsBjvaOZl",
  Pokemaniac_101: "PL_OPlumBV1WTcsjRVdfnCHHDbkpuTJXTN",
  Sanity_Astray: "PLxswNNHL4lAai2Txuo0utsm5R-qOdBGiT",
  SimplyKnight: "PLWwCd0qH6UJp4sj_Pdbh-28gqIP3SbkQv",
  Swearo: "PL1NCjdN5y2kEkWf_y19dsOB-5ymO5w1j6",
  Tramonik: "PLxxx",
  TreeMuffins: "PLdFXa0Ps3cZdnCAUD5I8hJg3CnMWZjEZm",
  VeryUnWill: "PL3ddcgpBeT35-0cgv0Td81PpUzkJKOnmZ",
  WeaselStorm: "PLdXa7NQo0ttJ_3KAHqZgu_Rsn9zlrsWX6",
  zskv: "PLS0hjn3JKZLE9pu0Kc3NJr9h2l3g1p5pB",
};

const toggle = document.getElementById("toggleEchoCraftOnly");
const videoFeed = document.getElementById("video-feed");
const filterShortsToggle = document.getElementById("filter-shorts");
const filterLivestreamsToggle = document.getElementById("filter-livestreams");

const cache = {
  playlists: {},
  uploadPlaylist: {},
};

function isCacheValid(cacheKey, type) {
  const cached = cache[type][cacheKey];
  if (!cached) return false;
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  return now - cached.timestamp < oneHour;
}

async function fetchPlaylistVideos(playlistId) {
  const res = await fetch(`https://www.youtube.com/api/youtube?type=playlist&id=${playlistId}`);
  const data = await res.json();
  if (!data.items) return [];

  return data.items
    .filter(
      (item) =>
        item.snippet &&
        item.snippet.title !== "Private video" &&
        item.snippet.title !== "Deleted video" &&
        item.snippet.title !== "Unlisted video" &&
        item.snippet.thumbnails
    )
    .map((item) => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      liveBroadcastContent: item.snippet.liveBroadcastContent || "none",
    }));
}

async function fetchAllVideosFromUploadPlaylist(uploadPlaylistId) {
  if (isCacheValid(uploadPlaylistId, "uploadPlaylist")) {
    return cache.uploadPlaylist[uploadPlaylistId].data;
  }

  const res = await fetch(`/api/youtube?type=playlist&id=${uploadPlaylistId}`);
  const data = await res.json();
  if (!data.items) return [];

  const videos = data.items.map((item) => ({
    videoId: item.snippet?.resourceId?.videoId || "",
    title: item.snippet?.title || "Unavailable",
    thumbnail: item.snippet?.thumbnails?.medium?.url || "",
    publishedAt: item.snippet?.publishedAt || "",
    channelTitle: item.snippet?.channelTitle || "",
    liveBroadcastContent: item.snippet?.liveBroadcastContent || "none",
  }));

  cache.uploadPlaylist[uploadPlaylistId] = {
    data: videos,
    timestamp: Date.now(),
  };

  return videos;
}

async function loadAllVideos(echoCraftOnly) {
  videoFeed.innerHTML = "<p>Loading...</p>";
  const feed = [];

  if (echoCraftOnly) {
    for (const key of Object.keys(PLAYLIST_IDS)) {
      const id = PLAYLIST_IDS[key];
      if (id.startsWith("PLxxx")) continue;
      try {
        const videos = await fetchPlaylistVideos(id);
        feed.push(...videos);
      } catch (e) {
        console.error("Error loading videos", e);
      }
    }
  } else {
    for (const uploadPlaylistId of UPLOAD_PLAYLIST_IDS) {
      try {
        const videos = await fetchAllVideosFromUploadPlaylist(uploadPlaylistId);
        feed.push(...videos);
      } catch (e) {
        console.error("Error loading videos", e);
      }
    }
  }

  let filteredFeed = feed;

  if (filterShortsToggle.checked) {
    filteredFeed = filteredFeed.filter(
      (v) => !v.title.toLowerCase().includes("shorts")
    );
  }

  if (filterLivestreamsToggle.checked) {
    filteredFeed = filteredFeed.filter(
      (v) => !(v.liveBroadcastContent === "live" || v.liveBroadcastContent === "upcoming")
    );
  }

  filteredFeed.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  renderFeed(filteredFeed.slice(0, 20));
}

function renderFeed(videos) {
  videoFeed.innerHTML = "";

  if (videos.length === 0) {
    videoFeed.innerHTML = "<p>No Videos Found.</p>";
    return;
  }

  videos.forEach((video) => {
    const el = document.createElement("div");
    el.className = "video-card";
    el.innerHTML = `
      <a href="https://www.youtube.com/watch?v=${video.videoId}" target="_blank">
        <img src="${video.thumbnail}" alt="${video.title}" />
        <div class="info">
          <h4>${video.title}</h4>
          <p>${video.channelTitle}</p>
          <small>${timeSince(new Date(video.publishedAt))} ago</small>
        </div>
      </a>
    `;
    videoFeed.appendChild(el);
  });
}

function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""}`;
    }
  }
  return "just now";
}

// Event listeners
toggle.addEventListener("change", () => loadAllVideos(toggle.checked));
filterShortsToggle.addEventListener("change", () => loadAllVideos(toggle.checked));
filterLivestreamsToggle.addEventListener("change", () => loadAllVideos(toggle.checked));

// Sidebar menu toggle logic
const hamburger = document.getElementById("hamburger-menu");
const sidebar = document.getElementById("sidebar");
const closeMenu = document.getElementById("close-menu");

hamburger.addEventListener("click", () => {
  sidebar.classList.add("active");
  document.body.classList.add("menu-open");
});

closeMenu.addEventListener("click", () => {
  sidebar.classList.remove("active");
  document.body.classList.remove("menu-open");
});

document.addEventListener("click", (e) => {
  if (
    sidebar.classList.contains("active") &&
    !sidebar.contains(e.target) &&
    e.target !== hamburger
  ) {
    sidebar.classList.remove("active");
    document.body.classList.remove("menu-open");
  }
});

// Initial load
loadAllVideos(true);
