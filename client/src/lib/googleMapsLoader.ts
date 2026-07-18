let loadPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (loadPromise) return loadPromise;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not set'));

  loadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&callback=__initGoogleMaps`;
    script.async = true;
    (window as unknown as Record<string, () => void>).__initGoogleMaps = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });

  return loadPromise;
}
