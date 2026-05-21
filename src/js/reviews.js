/** Google Places (New) reviews fetch — replaces static testimonials if configured. */
const API_KEY  = import.meta.env.VITE_GOOGLE_API_KEY  || '';
const PLACE_ID = import.meta.env.VITE_GOOGLE_PLACE_ID || '';

const STARS_SVG = `<svg width="72" height="11" viewBox="0 0 72 11" fill="none" aria-hidden="true">
  <path d="M5.5 1l1.2 3.7H10L7.3 6.8l1.2 3.7L5.5 8.6 2.5 10.5l1.2-3.7L1 4.7h3.3L5.5 1z" fill="#d94f3b"/>
  <path d="M20 1l1.2 3.7H25l-2.7 2.1 1.2 3.7L20 8.6 17 10.5l1.2-3.7-2.7-2.1H19L20 1z" fill="#d94f3b"/>
  <path d="M34.5 1l1.2 3.7H39l-2.7 2.1 1.2 3.7-2.9-1.9-3 1.9 1.2-3.7-2.7-2.1h3.3L34.5 1z" fill="#d94f3b"/>
  <path d="M49 1l1.2 3.7H54l-2.7 2.1 1.2 3.7L49 8.6 46 10.5l1.2-3.7-2.7-2.1h3.3L49 1z" fill="#d94f3b"/>
  <path d="M63.5 1l1.2 3.7H68l-2.7 2.1 1.2 3.7-2.9-1.9-3 1.9 1.2-3.7-2.7-2.1h3.3L63.5 1z" fill="#d94f3b"/>
</svg>`;

const escape = (s) => String(s || '').replace(/[&<>"']/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[c]);

const relTime = (iso) => {
  const sec = (Date.now() - Date.parse(iso)) / 1000;
  const days = Math.floor(sec / 86400);
  if (days < 30)  return 'récemment';
  if (days < 365) return `il y a ${Math.max(1, Math.round(days / 30))} mois`;
  return `il y a ${Math.round(days / 365)} an${days >= 730 ? 's' : ''}`;
};

const cardHtml = (r) => {
  const initial = (r.author || '?').trim().charAt(0).toUpperCase();
  return `<div class="testi-card fi is-in">
    <div class="testi-stars" aria-label="5 étoiles">${STARS_SVG}</div>
    <blockquote class="testi-quote">${escape(r.text)}</blockquote>
    <div class="testi-author">
      <div class="testi-av" aria-hidden="true">${escape(initial)}</div>
      <div>
        <div class="testi-name">${escape(r.author)}</div>
        <div class="testi-loc">${escape(r.when || 'Avis Google')}</div>
      </div>
    </div>
  </div>`;
};

export async function initReviews() {
  const grid = document.getElementById('testiGrid');
  if (!grid || !API_KEY || !PLACE_ID) return;

  const cacheKey = 'lrmj_greviews';
  let data;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) data = JSON.parse(cached);
  } catch (_) {}

  if (!data) {
    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${PLACE_ID}`,
        {
          headers: {
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
          },
        }
      );
      if (!res.ok) throw new Error(`Places API ${res.status}`);
      data = await res.json();
      try { sessionStorage.setItem(cacheKey, JSON.stringify(data)); } catch (_) {}
    } catch (err) {
      console.warn('[LRMJ] Google Reviews injoignable — fallback placeholders.', err);
      return;
    }
  }

  const list = (data.reviews || [])
    .filter(r => r.text && (r.text.text || '').trim().length > 0)
    .slice(0, 3)
    .map(r => ({
      text:   r.text.text.trim(),
      author: (r.authorAttribution && r.authorAttribution.displayName) || 'Client Google',
      when:   r.publishTime ? relTime(r.publishTime) : '',
    }));

  if (list.length < 3) return;
  grid.innerHTML = list.map(cardHtml).join('');
}
