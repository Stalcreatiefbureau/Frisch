function initVimeoBGVideo() {
  // SDK-check
  if (typeof Vimeo === 'undefined') {
    console.warn('Vimeo SDK niet geladen — controleer of player.js vóór dit script staat.');
    return;
  }

  const vimeoPlayers = document.querySelectorAll('[data-vimeo-bg-init]');

  vimeoPlayers.forEach(function(vimeoElement, index) {
    // Skip elementen die al geïnitialiseerd zijn (voorkomt dubbele init na Barba)
    if (vimeoElement.dataset.vimeoInitialized === 'true') return;
    vimeoElement.dataset.vimeoInitialized = 'true';

    const vimeoVideoID = vimeoElement.getAttribute('data-vimeo-video-id');
    if (!vimeoVideoID) return;

    const iframe = vimeoElement.querySelector('iframe');
    if (!iframe) {
      console.warn('Geen iframe gevonden in', vimeoElement);
      return;
    }

    const vimeoVideoURL = `https://player.vimeo.com/video/${vimeoVideoID}?api=1&background=1&autoplay=1&loop=1&muted=1`;
    iframe.setAttribute('src', vimeoVideoURL);

    // Unieke ID per element (gebruik bestaande ID indien aanwezig)
    if (!vimeoElement.id) {
      vimeoElement.setAttribute('id', 'vimeo-bg-basic-index-' + index);
    }

    const player = new Vimeo.Player(vimeoElement.id);
    player.setVolume(0);

    player.on('bufferend', function() {
      vimeoElement.setAttribute('data-vimeo-activated', 'true');
      vimeoElement.setAttribute('data-vimeo-loaded', 'true');
    });

    let videoAspectRatio;

    function adjustVideoSizing() {
      const containerAspectRatio = (vimeoElement.offsetHeight / vimeoElement.offsetWidth) * 100;
      const iframeWrapper = vimeoElement.querySelector('.vimeo-bg__iframe-wrapper');
      if (iframeWrapper && videoAspectRatio) {
        if (containerAspectRatio > videoAspectRatio * 100) {
          iframeWrapper.style.width = `${(containerAspectRatio / (videoAspectRatio * 100)) * 100}%`;
        } else {
          iframeWrapper.style.width = '';
        }
      }
    }

    if (vimeoElement.getAttribute('data-vimeo-update-size') === 'true') {
      Promise.all([player.getVideoWidth(), player.getVideoHeight()]).then(function([width, height]) {
        videoAspectRatio = height / width;
        const beforeEl = vimeoElement.querySelector('.vimeo-bg__before');
        if (beforeEl) beforeEl.style.paddingTop = videoAspectRatio * 100 + '%';
        adjustVideoSizing();
      });
    } else {
      adjustVideoSizing();
    }

    window.addEventListener('resize', adjustVideoSizing);
  });
}

// Eerste load — werkt ook als DOMContentLoaded al gevuurd is
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVimeoBGVideo);
} else {
  initVimeoBGVideo();
}
