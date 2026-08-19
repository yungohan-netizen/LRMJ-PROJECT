/**
 * Cloudflare Pages Function — envoi du formulaire de contact via Resend.
 * La clé reste server-side (pas de préfixe VITE_) : jamais exposée dans le bundle.
 *
 * Required env vars (CF Pages → Settings → Environment variables, Production + Preview) :
 *   RESEND_API_KEY   clé API Resend
 * Optionnelles (valeurs par défaut ci-dessous) :
 *   CONTACT_TO       destinataire      (défaut contact@lrmj-project.be)
 *   CONTACT_FROM     expéditeur, doit être sur un domaine vérifié chez Resend
 */

const DEFAULT_TO   = 'contact@lrmj-project.be';
const DEFAULT_FROM = 'Site LRMJ Project <formulaire@lrmj-project.be>';

/** Libellés lisibles pour le <select> du formulaire. */
const SERVICES = {
  portail:    'Portail / Clôture',
  gardecorps: 'Garde-corps / Rampe',
  serre:      'Serre / Baie vitrée',
  marquise:   'Marquise / Auvent',
  autre:      'Autre projet',
};

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const json = (body, status) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

/** Trim + borne la longueur : évite qu'un bot gonfle le mail. */
const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function row(label, value) {
  return `
      <tr>
        <td style="padding:0 0 18px;">
          <div style="font:600 11px/1.4 Helvetica,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#8a8578;padding-bottom:6px;">${label}</div>
          <div style="font:400 15px/1.6 Helvetica,Arial,sans-serif;color:#0d1f3c;background:#ffffff;border:1px solid #e4e0d6;border-radius:6px;padding:11px 13px;">${value}</div>
        </td>
      </tr>`;
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch (_) {
    return json({ error: 'Requête invalide.' }, 400);
  }

  // Honeypot : on répond 200 pour ne pas renseigner le bot, sans rien envoyer.
  if (data.botcheck) return json({ success: true }, 200);

  const prenom  = clean(data.prenom, 100);
  const nom     = clean(data.nom, 100);
  const tel     = clean(data.tel, 40);
  const email   = clean(data.email, 200);
  const service = clean(data.service, 40);
  const message = clean(data.message, 5000);

  // Mêmes champs requis que le formulaire (l'email y est facultatif).
  if (!prenom || !nom || !tel) {
    return json({ error: 'Merci de remplir les champs obligatoires.' }, 400);
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "L'adresse e-mail n'est pas valide." }, 422);
  }

  if (!env.RESEND_API_KEY) {
    console.error('[contact] RESEND_API_KEY absente');
    return json({ error: 'Configuration email manquante.' }, 500);
  }

  const serviceLabel = SERVICES[service] || 'Non précisé';
  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#f5f3ee;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#faf9f5;border:1px solid #e4e0d6;border-radius:10px;">
    <tr>
      <td style="padding:26px 28px 20px;border-bottom:2px solid #c4432f;">
        <div style="font:600 11px/1.4 Helvetica,Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#c4432f;">Nouvelle demande de devis</div>
        <div style="font:400 21px/1.3 Helvetica,Arial,sans-serif;color:#0d1f3c;padding-top:7px;">${escHtml(prenom)} ${escHtml(nom)}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 28px 6px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          ${row('Téléphone', `<a href="tel:${escHtml(tel.replace(/\s/g, ''))}" style="color:#c4432f;text-decoration:none;">${escHtml(tel)}</a>`)}
          ${row('Email', email
            ? `<a href="mailto:${escHtml(email)}" style="color:#c4432f;text-decoration:none;">${escHtml(email)}</a>`
            : 'Non renseigné')}
          ${row('Type de projet', escHtml(serviceLabel))}
          ${row('Message', message ? escHtml(message).replace(/\n/g, '<br>') : 'Aucun message')}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:14px 28px 22px;border-top:1px solid #e4e0d6;font:400 12px/1.5 Helvetica,Arial,sans-serif;color:#8a8578;">
        Envoyé automatiquement depuis lrmj-project.be
      </td>
    </tr>
  </table>
</body>
</html>`;

  const payload = {
    from: env.CONTACT_FROM || DEFAULT_FROM,
    to: [env.CONTACT_TO || DEFAULT_TO],
    subject: `Devis — ${prenom} ${nom} (${serviceLabel})`,
    html,
  };
  // Répondre au mail tombe directement sur le client, quand il a laissé son email.
  if (email) payload.reply_to = email;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('[contact] Resend error:', res.status, await res.text());
      return json({ error: "L'envoi a échoué." }, 502);
    }
    return json({ success: true }, 200);
  } catch (err) {
    console.error('[contact] fetch failed:', String(err));
    return json({ error: "L'envoi a échoué." }, 502);
  }
}
