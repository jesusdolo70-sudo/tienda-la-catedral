import { Resend } from 'resend';

// Inicialización perezosa — evita error en build si la variable aún no está configurada
let _resend = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || 'placeholder');
  return _resend;
}

function formatPrecio(n) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(n);
}

const CATEGORIA_EMOJI = {
  Camisetas: '👕', Pantalones: '👖', Vestidos: '👗',
  Chaquetas: '🧥', Sudaderas: '🧸', Camisas: '👔',
};

function emailTemplate({ pedidoId, clienteNombre, items, total, direccion, trackingUrl }) {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #1a1a1a;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="40" style="vertical-align:top;">
              <div style="width:36px;height:36px;background:#111;border:1px solid #1a1a1a;text-align:center;line-height:36px;font-size:18px;">
                ${CATEGORIA_EMOJI[item.categoria] || '🛍️'}
              </div>
            </td>
            <td style="padding-left:12px;vertical-align:top;">
              <p style="margin:0;font-family:Georgia,serif;font-size:14px;color:#c9a96e;">${item.nombre}</p>
              <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#4a3f2e;letter-spacing:0.05em;">
                ${[item.talla, item.color].filter(Boolean).join(' · ')}${item.cantidad > 1 ? ` · ×${item.cantidad}` : ''}
              </p>
            </td>
            <td style="text-align:right;vertical-align:top;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#6b5f4a;">${formatPrecio(item.precio * item.cantidad)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Pedido confirmado — Imperial</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="text-align:center;padding-bottom:32px;">
              <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:#3a3228;">
                NUEVA COLECCIÓN 2026 · EXCLUSIVIDAD GARANTIZADA
              </p>
              <h1 style="margin:0;font-family:Georgia,serif;font-size:42px;font-weight:300;letter-spacing:0.15em;color:#f0ead6;">
                IMPERIAL
              </h1>
              <div style="width:60px;height:1px;background:#c9a96e;margin:12px auto;"></div>
            </td>
          </tr>

          <!-- Confirmation badge -->
          <tr>
            <td style="text-align:center;padding-bottom:32px;">
              <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background:#0d0a04;border:1px solid #c9a96e40;text-align:center;line-height:64px;font-size:28px;">
                ✓
              </div>
              <h2 style="margin:16px 0 4px;font-family:Georgia,serif;font-size:32px;font-weight:300;color:#f0ead6;">
                Pago confirmado
              </h2>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#4a3f2e;">
                Pedido #${pedidoId}
              </p>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="background:#0a0a04;border-left:3px solid #c9a96e;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;line-height:1.6;color:#c9a96e;">
                Hola ${clienteNombre}, recibimos tu pedido y estamos procesándolo con cuidado.
                Te avisaremos cuando esté en camino.
              </p>
            </td>
          </tr>

          <tr><td style="height:24px;"></td></tr>

          <!-- Items -->
          <tr>
            <td style="background:#0d0d0d;border:1px solid #1a1a1a;padding:24px;">
              <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#4a3f2e;">
                Artículos
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
                <tr>
                  <td style="padding-top:16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#f0ead6;">
                          Total
                        </td>
                        <td style="text-align:right;font-family:Georgia,serif;font-size:22px;color:#c9a96e;">
                          ${formatPrecio(total)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="height:16px;"></td></tr>

          <!-- Shipping -->
          ${direccion ? `
          <tr>
            <td style="background:#0d0d0d;border:1px solid #1a1a1a;padding:20px 24px;">
              <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#4a3f2e;">
                Dirección de entrega
              </p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#6b5f4a;line-height:1.5;">
                ${clienteNombre}<br>${direccion}
              </p>
            </td>
          </tr>
          <tr><td style="height:16px;"></td></tr>
          ` : ''}

          <!-- CTA tracking -->
          <tr>
            <td style="text-align:center;padding:24px 0;">
              <a href="${trackingUrl}"
                style="display:inline-block;background:#c9a96e;color:#080808;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.35em;text-transform:uppercase;text-decoration:none;padding:14px 36px;">
                Rastrear mi pedido →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align:center;padding-top:32px;border-top:1px solid #111;">
              <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:18px;font-weight:300;letter-spacing:0.2em;color:#3a3228;">
                IMPERIAL
              </p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.2em;color:#2a2416;">
                Moda · Exclusividad · Distinción
              </p>
              <p style="margin:16px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#1e1e1e;">
                Este correo fue enviado porque realizaste una compra en Imperial.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function enviarConfirmacionPedido({ pedidoId, clienteNombre, clienteEmail, items, total, direccion }) {
  const trackingUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/pedidos/${pedidoId}`;

  const { data, error } = await getResend().emails.send({
    from: 'Imperial <onboarding@resend.dev>',
    to: clienteEmail,
    subject: `Pedido #${pedidoId} confirmado — Imperial`,
    html: emailTemplate({ pedidoId, clienteNombre, items, total, direccion, trackingUrl }),
  });

  if (error) console.error('[Resend] Error:', error);
  return { data, error };
}
