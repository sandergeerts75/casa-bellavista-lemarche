// admin/preview-templates.js
(function () {
  // React helper
  const React = (window.CMS && CMS.React) || window.React;
  const h = React.createElement;

  // Jullie site heeft inline CSS in index.html; geen extern bestand.
  // Daarom: raw = true (we geven hieronder ook wat nette fallback-styles mee).
  CMS.registerPreviewStyle('', { raw: true });

  // Fallback styles voor prettige preview (lichtgewicht, non-intrusive)
  CMS.registerPreviewStyle(`
    .preview-wrap{max-width:1100px;margin:20px auto;padding:12px}
    .hero{display:grid;grid-template-columns:1.25fr .75fr;gap:20px;align-items:center}
    .hero h1{margin:.1rem 0 .35rem;font-size:2rem}
    .hero p{opacity:.85;line-height:1.5}
    .badge{display:inline-block;background:#f6d399;color:#6b3d00;padding:.25rem .6rem;border-radius:.5rem;font-weight:600;margin-bottom:.35rem}
    .hero img{width:100%;height:auto;border-radius:14px;box-shadow:0 10px 26px rgba(0,0,0,.08)}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
    .card{border-radius:12px;overflow:hidden;box-shadow:0 8px 22px rgba(0,0,0,.06);background:#fff}
    .card img{display:block;width:100%;height:auto}
    .muted{color:#666}
    table{width:100%;border-collapse:collapse;margin:.5rem 0}
    th,td{border-bottom:1px solid #eee;padding:.5rem;text-align:left}
    .section{margin:18px 0}
  `, { raw: true });

  // Helpers
  const getData = (entry) => {
    try { return entry.get('data') && entry.get('data').toJS ? entry.get('data').toJS() : {}; }
    catch(e){ return {}; }
  };
  const list = (arr=[]) => h('ul', null, (arr || []).map((x,i) => h('li', { key: i }, (x && (x.item || x.text || x)))));

  // === PREVIEW COMPONENTS ===

  // 1) Site-instellingen (collection slug: site)
  const SitePreview = ({ entry }) => {
    const d = getData(entry);
    return h('div', { className: 'preview-wrap' },
      h('h2', null, 'Site-instellingen'),
      h('p', null, `Merknaam: ${d.brand || '—'}`),
      h('p', null, `Primair domein: ${d.primaryDomain || '—'}`),
      h('p', null, `Contact e-mail: ${d.contactEmail || '—'}`),
      h('p', null, `Doorsturen naar (forwardTo): ${d.forwardTo || '—'}`),
      h('p', { className: 'muted' }, 'Deze instellingen worden gebruikt in header/footer, formulieren en meta-informatie.')
    );
  };

  // 2) Hero (collection slug: hero)
  const HeroPreview = ({ entry }) => {
    const d = getData(entry);
    return h('div', { className: 'preview-wrap' },
      h('section', { className: 'hero' },
        h('div', null,
          d.badge ? h('div', { className: 'badge' }, d.badge) : null,
          h('h1', null, d.title || d.titel || 'Hero titel'),
          h('p', null, d.subtitle || d.intro || 'Korte intro/subtitel voor de hero.'),
          d.ctaText && d.ctaLink
            ? h('p', null, h('a', { href: d.ctaLink }, d.ctaText))
            : null
        ),
        h('div', null,
          d.image ? h('img', { src: d.image, alt: 'Hero afbeelding' }) : h('div', { className: 'muted' }, 'Nog geen hero-afbeelding')
        )
      )
    );
  };

  // 3) Foto’s (collection slug: gallery)
  // Onder “Foto’s” verwachten we ofwel { items:[{src,caption},…] } of een array met {src}
  const GalleryPreview = ({ entry }) => {
    const raw = getData(entry);
    const items = Array.isArray(raw) ? raw : (raw.items || raw.fotos || []);
    return h('div', { className: 'preview-wrap' },
      h('h2', null, 'Foto’s'),
      h('div', { className: 'grid' },
        (items || []).map((it, i) => h('div', { key: i, className: 'card' },
          (it && (it.src || it.image))
            ? h('img', { src: it.src || it.image, alt: it.caption || `Foto ${i+1}` })
            : h('div', { className: 'muted' }, 'Geen afbeelding')
        ))
      )
    );
  };

  // 4) Het huis (collection slug: house)
  const HousePreview = ({ entry }) => {
    const d = getData(entry);
    return h('div', { className: 'preview-wrap' },
      h('h2', null, 'Het huis'),
      d.lead ? h('p', null, d.lead) : null,
      h('div', { className: 'section' },
        h('strong', null, 'Kern: '),
        h('span', null, `Slaapkamers: ${d.bedrooms || '—'} • Gasten: ${d.maxGuests || '—'}`)
      ),
      d.beachDistance ? h('p', null, `Strand: ${d.beachDistance}`) : null,
      h('div', { className: 'section' }, h('h3', null, 'Slapen'), list(d.sleeping)),
      h('div', { className: 'section' }, h('h3', null, 'Buiten'), list(d.outdoor)),
      h('div', { className: 'section' }, h('h3', null, 'Praktisch'), list(d.practical))
    );
  };

  // 5) Omgeving (collection slug: omgeving)
  const OmgevingPreview = ({ entry }) => {
    const d = getData(entry);
    const hs = d.highlights || d.cards || [];
    return h('div', { className: 'preview-wrap' },
      h('h2', null, 'Omgeving'),
      d.intro ? h('p', null, d.intro) : null,
      h('div', { className: 'grid' },
        hs.map((x,i) => h('div', { key: i, className: 'card' },
          (x && x.image) ? h('img', { src: x.image, alt: x.title || 'Omgeving' }) : null,
          h('div', { style: { padding: '8px 10px' } },
            h('strong', null, x.title || 'Titel'),
            h('p', null, x.text || x.body || '')
          )
        ))
      )
    );
  };

  // 6) Prijzen (collection slug: prices)
  // Verwacht data zoals: { periods: [{label,start,end,weekly|minNights|nightly}, ...], notes }
  const PricesPreview = ({ entry }) => {
    const d = getData(entry);
    const rows = (d.periods || d.tarieven || []).map((p,i) =>
      h('tr', { key: i },
        h('td', null, p.label || p.naam || '—'),
        h('td', null, p.start ? String(p.start).slice(0,10) : '—'),
        h('td', null, p.end ? String(p.end).slice(0,10) : '—'),
        h('td', null, p.weekly ? `€ ${p.weekly}` : (p.nightly ? `€ ${p.nightly}/nacht` : '—')),
        h('td', null, p.minNights || p.min || '—')
      )
    );
    return h('div', { className: 'preview-wrap' },
      h('h2', null, 'Prijzen'),
      h('table', null,
        h('thead', null,
          h('tr', null,
            h('th', null, 'Periode'),
            h('th', null, 'Start'),
            h('th', null, 'Eind'),
            h('th', null, 'Prijs'),
            h('th', null, 'Min. nachten')
          )
        ),
        h('tbody', null, rows)
      ),
      d.notes ? h('p', { className: 'muted' }, d.notes) : null
    );
  };

  // 7) Contact (collection slug: contact)
  const ContactPreview = ({ entry }) => {
    const d = getData(entry);
    return h('div', { className: 'preview-wrap' },
      h('h2', null, 'Contact'),
      d.intro ? h('p', null, d.intro) : null,
      h('p', null, `E-mail: ${d.emailTo || d.email || '—'}`),
      d.phone ? h('p', null, `Telefoon: ${d.phone}`) : null,
      d.whatsapp ? h('p', null, `WhatsApp: ${d.whatsapp}`) : null,
      d.address ? h('p', null, `Adres: ${d.address}`) : null,
      d.mapEmbed ? h('div', { className: 'card', style: { padding: 0 } },
        h('iframe', { src: d.mapEmbed, style: { width: '100%', height: '260px', border: 0 }, loading: 'lazy', referrerPolicy: 'no-referrer-when-downgrade', allowFullScreen: true })
      ) : null
    );
  };

  // 8) SEO / Social (collection slug: seo)
  const SeoPreview = ({ entry }) => {
    const d = getData(entry);
    return h('div', { className: 'preview-wrap' },
      h('h2', null, 'SEO / Social'),
      h('p', null, `Titel: ${d.siteTitle || d.title || '—'}`),
      h('p', null, `Omschrijving: ${d.siteDescription || d.description || '—'}`),
      d.socialImage ? h('div', { className: 'card' }, h('img', { src: d.socialImage, alt: 'Social preview' })) : null
    );
  };

  // === Slugs koppelen aan templates ===
  // Slugs komen overeen met je admin-zijbalk: Site-instellingen, Hero, Foto’s, Het huis, Omgeving, Prijzen, Contact, SEO / Social
  CMS.registerPreviewTemplate('site', SitePreview);
  CMS.registerPreviewTemplate('hero', HeroPreview);
  CMS.registerPreviewTemplate('gallery', GalleryPreview);
  CMS.registerPreviewTemplate('house', HousePreview);
  CMS.registerPreviewTemplate('omgeving', OmgevingPreview);
  CMS.registerPreviewTemplate('prices', PricesPreview);
  CMS.registerPreviewTemplate('contact', ContactPreview);
  CMS.registerPreviewTemplate('seo', SeoPreview);
})();
