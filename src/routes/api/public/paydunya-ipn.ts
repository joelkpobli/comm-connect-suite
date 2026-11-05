import { createFileRoute } from '@tanstack/react-router';
import { fulfillInvoice } from '@/lib/weechat/paydunya.server';

// PayDunya IPN: form data with data[hash] = SHA-512(master key). After the hash
// matches, the invoice is re-confirmed directly with PayDunya before crediting.
async function sha512Hex(value: string) {
  const buf = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const Route = createFileRoute('/api/public/paydunya-ipn')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const masterKey = process.env['PAYDUNYA_MASTER_KEY'];
        if (!masterKey) return new Response('Not configured', { status: 503 });
        let hash = '', token = '';
        try {
          const form = await request.formData();
          hash = String(form.get('data[hash]') ?? '');
          token = String(form.get('data[invoice][token]') ?? '');
        } catch {
          return new Response('Bad request', { status: 400 });
        }
        if (!/^[a-f0-9]{128}$/i.test(hash) || hash.toLowerCase() !== (await sha512Hex(masterKey))) {
          return new Response('Invalid signature', { status: 401 });
        }
        if (!token) return new Response('ok');
        try { await fulfillInvoice(token); } catch { return new Response('Retry', { status: 500 }); }
        return new Response('ok');
      },
    },
  },
});
