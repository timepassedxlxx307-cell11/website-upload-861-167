import { H as Hls } from "./hls-dru42stk.js";

export function initMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var button = document.getElementById(options.buttonId);
  var source = options.source;
  var started = false;
  var hls = null;

  if (!video || !button || !source) {
    return;
  }

  function attach() {
    if (started) {
      return;
    }
    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    button.classList.add("is-hidden");
    video.controls = true;
    var playTask = video.play();
    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {
        button.classList.remove("is-hidden");
        started = false;
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    }
  }

  button.addEventListener("click", attach);
  video.addEventListener("click", function () {
    if (!started) {
      attach();
    }
  });
}
