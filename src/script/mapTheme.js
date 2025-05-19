// src/script/mapTheme.js
(function() {
  const LIGHT_STYLE = 'mapbox://styles/mapbox/streets-v11';
  const DARK_STYLE  = 'mapbox://styles/mapbox/dark-v10';

  // Monkey-patch addImage so duplicate icons never throw
  function patchAddImage(map) {
    const orig = map.addImage.bind(map);
    map.addImage = (id, ...args) => {
      if (map.hasImage(id)) {
        try { map.removeImage(id); } catch(_) {}
      }
      return orig(id, ...args);
    };
  }

  // Decide which style to use, including true "system" support
  function styleFor(theme) {
    if (theme === 'dark')  return DARK_STYLE;
    if (theme === 'light') return LIGHT_STYLE;
    // system: mirror real OS setting
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? DARK_STYLE
      : LIGHT_STYLE;
  }

  function applyMapTheme(theme) {
    const map = window.pathpalMap;
    if (!map) return;

    // switch map style
    map.setStyle(styleFor(theme));

    // once the style JSON and sources are loaded
    map.once('style.load', () => {
      // wait until all tiles and sources are idle
      map.once('idle', () => {
        const isDark = theme === 'dark';
        [
        { id: 'custom-restroom', light: '/icons/restroom.png',      dark: '/icons/restroom-gray.png' },
        { id: 'bench-15',       light: '/icons/bench.png',         dark: '/icons/bench-gray.png'    },
        { id: 'ramp-15',        light: '/icons/ramp.png',          dark: '/icons/ramp-gray.png'     },
      ].forEach(({ id, light, dark }) => {
        const url = isDark ? dark : light;
        map.loadImage(url, (err, img) => {
          if (err) return console.error(`Failed loading ${url}`, err);
          if (map.hasImage(id)) map.removeImage(id);
          map.addImage(id, img);
        });
      });

        // 2) redraw boundary safely now that style is fully ready
        fetch('/data/metro-vancouver-boundaries.geojson')
          .then(r => r.json())
          .then(geo => {
            const fc   = turf.featureCollection(geo.features);
            const hull = turf.convex(fc);
            if (!hull) throw new Error('Convex hull failed');
            if (map.getSource('boundary')) {
              map.getSource('boundary').setData(hull);
            } else {
              map.addSource('boundary', { type: 'geojson', data: hull });
              map.addLayer({
                id:    'boundary-line',
                type:  'line',
                source:'boundary',
                layout:{ 'line-join':'round','line-cap':'round' },
                paint: { 'line-color':'#FF0000','line-width':2 }
              });
            }
          })
          .catch(err => console.error('Boundary reload error:', err));

        // 3) re-trigger POI reload from map.js
        map.fire('moveend');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const map = window.pathpalMap;
    if (map) patchAddImage(map);

    // initial theme
    const initial = document.documentElement.getAttribute('data-theme') || 'light';
    applyMapTheme(initial);

    // respond to app theme toggles
    new MutationObserver(records => {
      for (const rec of records) {
        if (rec.attributeName === 'data-theme') {
          applyMapTheme(document.documentElement.getAttribute('data-theme'));
        }
      }
    }).observe(document.documentElement, { attributes: true });

    // respond to real OS setting changes when in system mode
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', () => {
      if (document.documentElement.getAttribute('data-theme') === 'system') {
        applyMapTheme('system');
      }
    });
  });
})();
