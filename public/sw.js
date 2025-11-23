self.addEventListener('install', () => {
  console.log('Service worker installing');
});

self.addEventListener('activate', () => {
  console.log('Service worker activating');
});
