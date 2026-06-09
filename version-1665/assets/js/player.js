let hlsClassPromise = null;

function loadHlsClass() {
  if (!hlsClassPromise) {
    hlsClassPromise = import('./hls.js')
      .then(function (module) {
        return module.H || module.default || null;
      })
      .catch(function () {
        return null;
      });
  }

  return hlsClassPromise;
}

function canPlayNativeHls(video) {
  return video.canPlayType('application/vnd.apple.mpegurl') ||
    video.canPlayType('application/x-mpegURL');
}

function attachSource(video, src, HlsClass) {
  if (video.dataset.loaded === 'true') {
    return Promise.resolve();
  }

  if (canPlayNativeHls(video)) {
    video.src = src;
    video.dataset.loaded = 'true';
    return Promise.resolve();
  }

  if (HlsClass && HlsClass.isSupported()) {
    var hls = new HlsClass({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(src);
    hls.attachMedia(video);
    video._hlsInstance = hls;
    video.dataset.loaded = 'true';
    return Promise.resolve();
  }

  video.src = src;
  video.dataset.loaded = 'true';
  return Promise.resolve();
}

function setupPlayer(card) {
  var video = card.querySelector('video[data-src]');
  var button = card.querySelector('[data-play-button]');

  if (!video || !button) {
    return;
  }

  async function startPlayback() {
    var src = video.dataset.src;
    if (!src) {
      return;
    }

    button.hidden = true;
    card.classList.add('is-loading');

    var HlsClass = await loadHlsClass();
    await attachSource(video, src, HlsClass);

    try {
      await video.play();
      card.classList.remove('is-loading');
      card.classList.add('is-playing');
    } catch (error) {
      card.classList.remove('is-loading');
      button.hidden = false;
    }
  }

  button.addEventListener('click', startPlayback);

  video.addEventListener('play', function () {
    button.hidden = true;
    card.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      button.hidden = false;
      card.classList.remove('is-playing');
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player-card]').forEach(setupPlayer);
});
