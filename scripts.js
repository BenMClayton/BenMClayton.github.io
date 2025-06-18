// we arent using these channel ids for now but i have them here incase we need them later
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
  "UUdgfdgtW1XupCf92PaDPh4w", // Cloudsy
  "UUcnP3pdYW8gCkNdzUqaDpqQ", // Duckie
  "UC9q1UkRbthG1LmDShU0At7Q", // Hidngem
  "UUBN-EYO6WLEhGDcBWv_xiRQ", // Ikeberg
  "UUxiRz8eG7dCigGDxd7xKmbg", // Lagging_daze
  "UUWzw72V4E33UcbtHBZAc8QQ", // Lucid
  "UUkDX3RwSZOsBo_Rd5t9dtqg", // MrCakeness
  "UUOiyKbbkvwoGnFMc5LbeNEw", // PizzaBuff
  "UUwaK1gmmTE2v9mz8Ky1Nyog", // Pokemaniac_101
  "UUa4xOOstTqBHDtO_kWjYCEA", // SanityAstray
  "UU2_iuMr1_yrwoMorVHoFRcQ", // SimplyKnight
  "UUf6_jrpW2tSr7ZkRvRYBIMA", // Swearo
  "UUiK3ImEtWKV5tGOxoCvA-_A", // Tramonik
  "UUluDOpUzFrV5wzMAlKABxGg", // TreeMuffins
  "UUoic94ZyEsx6OnfRWK5j6-g", // VeryUnWill
  "UU3KLF5S1mSSFiOFNKIhQh2A", // Weasel
  "UUEhAxizKRZMffNpoxLNs-1Q", // z
];

// Replace with EC6 playlist IDs when available
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

toggle.addEventListener("change", () => {
  loadAllVideos(toggle.checked);
});

// Cache object to store fetched data
const cache = {
  playlists: {},
  uploadPlaylist: {},
};

// Helper function to check if cached data is still valid
function isCacheValid(cacheKey, type) {
  const cached = cache[type][cacheKey];
  if (!cached) return false;

  const now = Date.now();
  const oneHour = 60 * 60 * 1000; // 60 minutes in milliseconds
  return now - cached.timestamp < oneHour;
}

async function fetchPlaylistVideos(playlistId) {
  const res = await fetch(`/api/youtube?type=playlist&id=${playlistId}`);
  const data = await res.json();
  if (!data.items) return [];

  return data.items
    .filter(
      (item) =>
        item.snippet && // skip if snippet is missing (private/deleted/unlisted)
        item.snippet.title !== "Private video" &&
        item.snippet.title !== "Deleted video" &&
        item.snippet.title !== "Unlisted video" &&
        item.snippet.thumbnails // ensure thumbnails exist
    )
    .map((item) => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
    }));
}

// async function fetchChannelVideos(channelId) {
//   // Check if data is cached and valid
//   if (isCacheValid(channelId, "channels")) {
//     return cache.channels[channelId].data;
//   }

//   const res = await fetch(
//     `https://www.googleapis.com/youtube/v3/channels?key=${API_KEY}&id=${channelId}&part=snippet&type=video&order=date&maxResults=10`
//   );
//   const data = await res.json();
//   if (!data.items) return [];

//   const videos = data.items.map((item) => ({
//     videoId: item.id.videoId,
//     title: item.snippet.title,
//     thumbnail: item.snippet.thumbnails.medium.url,
//     publishedAt: item.snippet.publishedAt,
//     channelTitle: item.snippet.channelTitle,
//   }));

//   // Cache the fetched data with a timestamp
//   cache.channels[channelId] = {
//     data: videos,
//     timestamp: Date.now(),
//   };

//   return videos;
// }

async function fetchMostRecentVideo(uploadPlaylistId) {
  const res = await fetch(`/api/youtube?type=playlist&id=${uploadPlaylistId}`);
  const data = await res.json();
  if (!data.items) return [];

  return data.items.map((item) => ({
    videoId: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
    publishedAt: item.snippet.publishedAt,
    channelTitle: item.snippet.channelTitle,
  }));
}

async function fetchAllVideosFromUploadPlaylist(uploadPlaylistId) {
  // Check if data is cached and valid
  if (isCacheValid(uploadPlaylistId, "uploadPlaylist")) {
    return cache.uploadPlaylist[uploadPlaylistId].data;
  }

  const res = await fetch(`/api/youtube?type=playlist&id=${uploadPlaylistId}`);
  const data = await res.json();
  if (!data.items) return [];

  // No filtering, just map whatever is returned
  const videos = data.items.map((item) => ({
    videoId: item.snippet?.resourceId?.videoId || "",
    title: item.snippet?.title || "Unavailable",
    thumbnail: item.snippet?.thumbnails?.medium?.url || "",
    publishedAt: item.snippet?.publishedAt || "",
    channelTitle: item.snippet?.channelTitle || "",
  }));

  // Cache the fetched data with a timestamp
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
    // Only show videos from the echocraft playlists
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
    // Show all videos from all upload playlists ids
    for (const uploadPlaylistId of UPLOAD_PLAYLIST_IDS) {
      try {
        const videos = await fetchAllVideosFromUploadPlaylist(uploadPlaylistId);
        feed.push(...videos);
      } catch (e) {
        console.error("Error loading videos", e);
      }
    }
  }

  // Sort all collected videos by most recent
  feed.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  // Limit to top 20 most recent
  renderFeed(feed.slice(0, 20));
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
      <a href="https://www.youtube.com/watch?v=${
        video.videoId
      }" target="_blank">
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

async function fetchVideos(type, id) {
  try {
    const response = await fetch(`/api/youtube?type=${type}&id=${id}`);
    const data = await response.json();

    if (data.error) {
      console.error(data.error);
      videoFeed.innerHTML = `<p>Error: ${data.error}</p>`;
      return [];
    }

    return data.items
      .filter(
        (item) =>
          item.snippet &&
          item.snippet.resourceId &&
          item.snippet.thumbnails &&
          item.snippet.title !== "Private video" &&
          item.snippet.title !== "Deleted video" &&
          item.snippet.title !== "Unlisted video"
      )
      .map((item) => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
      }));
  } catch (error) {
    console.error("Error fetching videos:", error);
    videoFeed.innerHTML = `<p>Error fetching videos</p>`;
    return [];
  }
}

// Render videos in the DOM
function renderVideos(videos) {
  videoFeed.innerHTML = "";

  if (videos.length === 0) {
    videoFeed.innerHTML = "<p>fetching videos...</p>";
    return;
  }

  videos.forEach((video) => {
    const videoCard = document.createElement("div");
    videoCard.className = "video-card";
    videoCard.innerHTML = `
      <a href="https://www.youtube.com/watch?v=${
        video.videoId
      }" target="_blank">
        <img src="${video.thumbnail}" alt="${video.title}" />
        <div class="info">
          <h4>${video.title}</h4>
          <p>${video.channelTitle}</p>
          <small>${timeSince(new Date(video.publishedAt))} ago</small>
        </div>
      </a>
    `;
    videoFeed.appendChild(videoCard);
  });
}

// Initial load
loadAllVideos(true);

document.addEventListener("DOMContentLoaded", () => {
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const sidebar = document.getElementById("sidebar");

  hamburgerMenu.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
});
// Function to format time since a date

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

// document.addEventListener("DOMContentLoaded", async () => {
//   const videos = await fetchVideos(
//     "playlist",
//     "PLMBiVR38EZoa_uVI755fXdPD8KF2FZjny"
//   ); // Replace with a valid playlist ID
//   renderVideos(videos);
// });

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

// Optional: close sidebar when clicking outside of it
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
