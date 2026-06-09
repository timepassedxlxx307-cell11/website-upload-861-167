(function () {
  const video = document.querySelector("[data-player]");
  const button = document.querySelector("[data-play-button]");
  const wrap = document.querySelector("[data-player-wrap]");

  if (!video) {
    return;
  }

  const source = video.querySelector("source");
  const url = source ? source.getAttribute("src") : video.getAttribute("src");
  let hlsReady = false;
  let hlsInstance = null;

  function prepare() {
    if (!url) {
      return Promise.resolve();
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.getAttribute("src")) {
        video.src = url;
      }
      hlsReady = true;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (hlsReady) {
        return Promise.resolve();
      }

      return new Promise(function (resolve) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          hlsReady = true;
          resolve();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            hlsReady = true;
            resolve();
          }
        });
      });
    }

    if (!video.getAttribute("src")) {
      video.src = url;
    }

    hlsReady = true;
    return Promise.resolve();
  }

  function start() {
    prepare().then(function () {
      if (wrap) {
        wrap.classList.add("is-playing");
      }

      video.play().catch(function () {});
    });
  }

  if (button) {
    button.addEventListener("click", start);
  }

  video.addEventListener("play", function () {
    if (wrap) {
      wrap.classList.add("is-playing");
    }
  });

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance && typeof hlsInstance.destroy === "function") {
      hlsInstance.destroy();
    }
  });
})();
