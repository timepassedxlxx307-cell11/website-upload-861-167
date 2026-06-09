(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function attach(box) {
    var video = box.querySelector("video");
    var button = box.querySelector(".player-start");
    var source = box.getAttribute("data-src");
    var attached = false;

    function load() {
      if (!video || !source || attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var stream = new window.Hls({ enableWorker: true });
        stream.loadSource(source);
        stream.attachMedia(video);
        box.hlsInstance = stream;
      } else {
        video.src = source;
      }
    }

    function play() {
      load();
      box.classList.add("is-playing");
      if (video) {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            box.classList.remove("is-playing");
          });
        }
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          box.classList.remove("is-playing");
        }
      });
    }
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(attach);
  });
})();
