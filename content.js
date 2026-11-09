(function () {
  const STORAGE_KEY = "jn_podcast_progress";
  const SAVE_INTERVAL_MS = 5 * 60 * 1000;

  let saveInterval = null;
  let currentEpisodeUrl = null;
  let hasResumed = false;
  let audioInitialized = false;

  function getSavedProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveProgress(episodeUrl, currentTime, title) {
    if (!episodeUrl || episodeUrl === "#") return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        episodeUrl,
        currentTime: Math.floor(currentTime),
        title: title || "",
        updatedAt: Date.now(),
      })
    );
  }

  function clearProgress() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function normalizeEpisodeUrl(url) {
    if (!url || url === "#") return null;

    try {
      return new URL(url, window.location.origin).pathname;
    } catch {
      return url.startsWith("/") ? url : null;
    }
  }

  function getEpisodeUrlFromPage() {
    const path = window.location.pathname;
    if (/^\/podcasts\/[^/]+\/[^/]+\/?$/.test(path)) {
      return path.replace(/\/$/, "");
    }
    return null;
  }

  function getEpisodeUrl() {
    const link = document.querySelector("#link");
    const href = link?.getAttribute("href");
    const fromPlayer = normalizeEpisodeUrl(href);

    if (fromPlayer) return fromPlayer;

    return getEpisodeUrlFromPage();
  }

  function getEpisodeTitle() {
    const title = document.querySelector("#title");
    return title?.textContent?.trim() || document.title || "";
  }

  function getAudio() {
    return document.querySelector("#audio");
  }

  function stopSaveInterval() {
    if (!saveInterval) return;
    clearInterval(saveInterval);
    saveInterval = null;
  }

  function startSaveInterval() {
    stopSaveInterval();

    saveInterval = setInterval(() => {
      const audio = getAudio();
      const episodeUrl = getEpisodeUrl();

      if (!audio || audio.paused || !episodeUrl) return;

      saveProgress(episodeUrl, audio.currentTime, getEpisodeTitle());
    }, SAVE_INTERVAL_MS);
  }

  function syncSaveInterval() {
    const audio = getAudio();
    if (audio && !audio.paused) {
      startSaveInterval();
      return;
    }
    stopSaveInterval();
  }

  function tryResume() {
    if (hasResumed) return;

    const audio = getAudio();
    const episodeUrl = getEpisodeUrl();
    if (!audio || !episodeUrl) return;

    const saved = getSavedProgress();
    if (!saved || saved.episodeUrl !== episodeUrl || saved.currentTime <= 0) return;

    const applyResume = () => {
      if (!audio.duration || saved.currentTime >= audio.duration - 10) {
        hasResumed = true;
        return;
      }

      audio.currentTime = saved.currentTime;
      hasResumed = true;
    };

    if (audio.readyState >= 1) {
      applyResume();
      return;
    }

    audio.addEventListener("loadedmetadata", applyResume, { once: true });
  }

  function handleEpisodeChange(episodeUrl) {
    if (!episodeUrl || episodeUrl === currentEpisodeUrl) return;

    const saved = getSavedProgress();
    if (saved && saved.episodeUrl !== episodeUrl) {
      clearProgress();
    }

    currentEpisodeUrl = episodeUrl;
    hasResumed = false;
    tryResume();
  }

  function onAudioPlay() {
    const episodeUrl = getEpisodeUrl();
    if (episodeUrl) {
      handleEpisodeChange(episodeUrl);
    }
    startSaveInterval();
  }

  function onAudioPause() {
    stopSaveInterval();

    const audio = getAudio();
    const episodeUrl = getEpisodeUrl();

    if (!audio || !episodeUrl || audio.currentTime <= 0) return;

    saveProgress(episodeUrl, audio.currentTime, getEpisodeTitle());
  }

  function setupAudioListeners(audio) {
    if (!audio || audioInitialized) return;
    audioInitialized = true;

    audio.addEventListener("play", onAudioPlay);
    audio.addEventListener("playing", syncSaveInterval);
    audio.addEventListener("pause", onAudioPause);
    audio.addEventListener("ended", onAudioPause);

    audio.addEventListener("loadedmetadata", () => {
      const episodeUrl = getEpisodeUrl();
      if (episodeUrl) {
        handleEpisodeChange(episodeUrl);
      }
      tryResume();
    });

    syncSaveInterval();
  }

  function observePlayer() {
    const observer = new MutationObserver(() => {
      const audio = getAudio();
      if (audio) {
        setupAudioListeners(audio);
      }

      const episodeUrl = getEpisodeUrl();
      if (episodeUrl) {
        handleEpisodeChange(episodeUrl);
      }
    });

    const startObserving = (target) => {
      observer.observe(target, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["href", "src", "data-open"],
      });
    };

    if (document.body) {
      startObserving(document.body);
    }

    const audio = getAudio();
    if (audio) {
      setupAudioListeners(audio);
    }

    const episodeUrl = getEpisodeUrl();
    if (episodeUrl) {
      currentEpisodeUrl = episodeUrl;
      tryResume();
    }
  }

  function onRouteChange() {
    const episodeUrl = getEpisodeUrl();
    if (episodeUrl) {
      handleEpisodeChange(episodeUrl);
      return;
    }
    tryResume();
  }

  function patchHistory() {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      onRouteChange();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      onRouteChange();
    };

    window.addEventListener("popstate", onRouteChange);
  }

  function init() {
    patchHistory();

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", observePlayer);
      return;
    }

    observePlayer();
  }

  init();
})();
