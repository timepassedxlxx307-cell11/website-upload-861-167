(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var video = document.querySelector("[data-player]");
    var button = document.querySelector("[data-play-button]");

    if (!video) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    var hlsInstance = null;

    function attachStream() {
      if (!stream || video.getAttribute("data-ready") === "true") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.setAttribute("data-ready", "true");
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        video.setAttribute("data-ready", "true");
        return;
      }

      video.src = stream;
      video.setAttribute("data-ready", "true");
    }

    function beginPlayback() {
      attachStream();

      if (button) {
        button.classList.add("is-hidden");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    attachStream();

    if (button) {
      button.addEventListener("click", beginPlayback);
    }

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        beginPlayback();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  });
})();
