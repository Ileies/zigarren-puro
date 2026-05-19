import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } from '$env/static/private';
import { PUBLIC_APP_NAME, PUBLIC_ORIGIN } from '$env/static/public';
import type { Options } from 'nodemailer/lib/mailer';
import Logger from '$lib/server/Logger';
import db from '$lib/server/db';
import { tokenTable, authCredentialsTable } from '$lib/server/db/schema';
import { TokenType } from '$lib/types';
import { bankAccount, companyName } from '$lib/config';
import { and, eq, isNull } from 'drizzle-orm';

function generateToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(24));
	return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function generateUnsubscribeLink(customerId: string): Promise<string> {
	const token = generateToken();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);
	await db
		.insert(tokenTable)
		.values({ token, customerId, type: TokenType.NEWSLETTER_UNSUBSCRIBE, expiresAt });
	return `https://${PUBLIC_ORIGIN}/unsubscribe?token=${token}`;
}

export async function generateVerificationToken(customerId: string): Promise<string> {
	const token = generateToken();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
	await db
		.insert(tokenTable)
		.values({ token, customerId, type: TokenType.EMAIL_VERIFICATION, expiresAt });
	return token;
}

export async function generatePasswordResetToken(customerId: string): Promise<string> {
	await db
		.update(tokenTable)
		.set({ revokedAt: new Date() })
		.where(
			and(
				eq(tokenTable.customerId, customerId),
				eq(tokenTable.type, TokenType.PASSWORD_RESET),
				isNull(tokenTable.revokedAt),
				isNull(tokenTable.usedAt)
			)
		);
	const token = generateToken();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
	await db
		.insert(tokenTable)
		.values({ token, customerId, type: TokenType.PASSWORD_RESET, expiresAt });
	return token;
}

// ─── Email templates ─────────────────────────────────────────────────────────

function baseLayout(content: string, footer: string): string {
	return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:Georgia,'Times New Roman',serif">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f4f0;padding:40px 16px">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff">

          <!-- Header -->
          <tr>
            <td style="background:#000000;padding:40px 48px;text-align:center">
              <p style="margin:0 0 10px;color:#d4af37;font-size:10px;letter-spacing:4px;text-transform:uppercase">Willkommen bei</p>
              <h1 style="margin:0;color:#ffffff;font-size:30px;font-weight:normal;letter-spacing:4px;text-transform:uppercase">Zigarren Puro</h1>
              <div style="width:48px;height:1px;background:#d4af37;margin:16px auto 0"></div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:48px 48px 40px">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#111111;padding:24px 48px;text-align:center">
              <p style="margin:0 0 6px;color:#666;font-size:11px;letter-spacing:1px;text-transform:uppercase">
                ${companyName} &nbsp;·&nbsp; Weidengasse 25 &nbsp;·&nbsp; 50668 Köln
              </p>
              ${footer}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function verificationEmailHtml(firstName: string, verifyUrl: string, unsubscribeUrl: string): string {
	const content = `
      <h2 style="margin:0 0 24px;color:#1a1a1a;font-size:20px;font-weight:normal;letter-spacing:0.5px">
        E-Mail-Adresse bestätigen
      </h2>
      <p style="margin:0 0 12px;color:#444;font-size:15px;line-height:1.8">Guten Tag ${firstName},</p>
      <p style="margin:0 0 32px;color:#444;font-size:15px;line-height:1.8">
        vielen Dank für Ihre Registrierung bei Zigarren Puro. Bitte bestätigen Sie Ihre
        E-Mail-Adresse, um Ihr Konto zu aktivieren und unsere Produkte bestellen zu können.
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:#d4af37;border-radius:2px">
            <a href="${verifyUrl}"
               style="display:inline-block;padding:15px 40px;color:#1a1a1a;font-size:13px;font-weight:bold;text-decoration:none;letter-spacing:2px;text-transform:uppercase">
              E-Mail bestätigen
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:32px 0 0;color:#888;font-size:13px;line-height:1.7">
        Dieser Link ist <strong>24 Stunden</strong> gültig. Falls Sie sich nicht bei Zigarren Puro
        registriert haben, können Sie diese E-Mail ignorieren.
      </p>

      <div style="margin:32px 0 28px;border-top:1px solid #eeeeee"></div>

      <p style="margin:0;color:#aaa;font-size:12px;line-height:1.7">
        Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br />
        <a href="${verifyUrl}" style="color:#b8834a;word-break:break-all">${verifyUrl}</a>
      </p>`;

	const footer = `<p style="margin:0;font-size:11px">
        <a href="${unsubscribeUrl}" style="color:#666;text-decoration:none">E-Mails abbestellen</a>
      </p>`;

	return baseLayout(content, footer);
}

function passwordResetEmailHtml(firstName: string, resetUrl: string): string {
	const content = `
      <h2 style="margin:0 0 24px;color:#1a1a1a;font-size:20px;font-weight:normal;letter-spacing:0.5px">
        Passwort zurücksetzen
      </h2>
      <p style="margin:0 0 12px;color:#444;font-size:15px;line-height:1.8">Guten Tag ${firstName},</p>
      <p style="margin:0 0 32px;color:#444;font-size:15px;line-height:1.8">
        Sie haben angefordert, Ihr Passwort zurückzusetzen. Klicken Sie auf den folgenden
        Button, um ein neues Passwort zu vergeben.
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:#d4af37;border-radius:2px">
            <a href="${resetUrl}"
               style="display:inline-block;padding:15px 40px;color:#1a1a1a;font-size:13px;font-weight:bold;text-decoration:none;letter-spacing:2px;text-transform:uppercase">
              Passwort zurücksetzen
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:32px 0 0;color:#888;font-size:13px;line-height:1.7">
        Dieser Link ist <strong>1 Stunde</strong> gültig. Falls Sie diese Anfrage nicht
        gestellt haben, können Sie diese E-Mail ignorieren – Ihr Konto bleibt unverändert.
      </p>

      <div style="margin:32px 0 28px;border-top:1px solid #eeeeee"></div>

      <p style="margin:0;color:#aaa;font-size:12px;line-height:1.7">
        Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br />
        <a href="${resetUrl}" style="color:#b8834a;word-break:break-all">${resetUrl}</a>
      </p>`;

	const footer = `<p style="margin:0;color:#666;font-size:11px">
        Diese E-Mail wurde automatisch versandt – bitte antworten Sie nicht darauf.
      </p>`;

	return baseLayout(content, footer);
}

// ─── Email templates ─────────────────────────────────────────────────────────

function orderConfirmationEmailHtml(
	firstName: string,
	orderId: string,
	orderShort: string,
	items: { name: string; qty: number; unitPrice: number }[],
	subtotal: number,
	shippingCost: number,
	total: number,
	unsubscribeUrl: string
): string {
	const fmt = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
	const itemRows = items
		.map(
			(i) => `
      <tr>
        <td style="padding:8px 0;color:#444;font-size:14px;border-bottom:1px solid #f0f0f0">
          ${i.name} <span style="color:#888">×${i.qty}</span>
        </td>
        <td style="padding:8px 0;color:#444;font-size:14px;border-bottom:1px solid #f0f0f0;text-align:right;white-space:nowrap">
          ${fmt(i.unitPrice * i.qty)}
        </td>
      </tr>`
		)
		.join('');

	const content = `
      <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:20px;font-weight:normal;letter-spacing:0.5px">
        Vielen Dank für Ihre Bestellung!
      </h2>
      <p style="margin:0 0 28px;color:#444;font-size:15px;line-height:1.8">
        Guten Tag ${firstName},<br/>
        wir haben Ihre Bestellung erhalten und freuen uns, sie für Sie vorzubereiten.
      </p>

      <div style="background:#f9f7f4;border-radius:4px;padding:16px 20px;margin-bottom:28px">
        <p style="margin:0 4px 0 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px">Bestellnummer</p>
        <p style="margin:4px 0 0;color:#1a1a1a;font-size:18px;font-weight:bold;font-family:monospace">#${orderShort}</p>
      </div>

      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px">
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td style="padding:10px 0 4px;color:#888;font-size:13px">Zwischensumme</td>
            <td style="padding:10px 0 4px;color:#888;font-size:13px;text-align:right">${fmt(subtotal)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#888;font-size:13px">Versand</td>
            <td style="padding:4px 0;color:#888;font-size:13px;text-align:right">${shippingCost === 0 ? 'Kostenlos' : fmt(shippingCost)}</td>
          </tr>
          <tr>
            <td style="padding:12px 0 0;color:#1a1a1a;font-size:16px;font-weight:bold;border-top:2px solid #e0e0e0">Gesamt</td>
            <td style="padding:12px 0 0;color:#1a1a1a;font-size:16px;font-weight:bold;text-align:right;border-top:2px solid #e0e0e0">${fmt(total)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background:#fffbf0;border:1px solid #d4af37;border-radius:4px;padding:20px;margin-bottom:28px">
        <p style="margin:0 0 12px;color:#1a1a1a;font-size:14px;font-weight:bold">Bankverbindung für die Überweisung</p>
        <p style="margin:0 0 6px;color:#444;font-size:13px;line-height:1.8">
          Bitte überweisen Sie <strong>${fmt(total)}</strong> innerhalb von 7 Tagen an:
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:13px;color:#444;line-height:2">
          <tr><td style="padding-right:16px;color:#888">Kontoinhaber</td><td><strong>${bankAccount.accountHolder}</strong></td></tr>
          <tr><td style="padding-right:16px;color:#888">IBAN</td><td><strong>${bankAccount.iban}</strong></td></tr>
          <tr><td style="padding-right:16px;color:#888">BIC</td><td><strong>${bankAccount.bic}</strong></td></tr>
          <tr><td style="padding-right:16px;color:#888">Verwendungszweck</td><td><strong>#${orderShort}</strong></td></tr>
        </table>
      </div>

      <p style="margin:0;color:#888;font-size:13px;line-height:1.7">
        Nach Zahlungseingang wird Ihre Bestellung umgehend bearbeitet und versendet.
        Bei Fragen erreichen Sie uns unter
        <a href="https://${PUBLIC_ORIGIN}/contact" style="color:#b8834a">diesem Link</a>.
      </p>`;

	const footer = `<p style="margin:0;font-size:11px">
        <a href="${unsubscribeUrl}" style="color:#666;text-decoration:none">E-Mails abbestellen</a>
      </p>`;

	return baseLayout(content, footer);
}

// ─── Public functions ─────────────────────────────────────────────────────────

export async function sendOrderConfirmationEmail(
	customerId: string,
	email: string,
	firstName: string,
	orderId: string,
	items: { name: string; qty: number; unitPrice: number }[],
	subtotal: number,
	shippingCost: number,
	total: number
): Promise<void> {
	const orderShort = orderId.slice(0, 8).toUpperCase();
	const unsubscribeUrl = await generateUnsubscribeLink(customerId);

	await sendMail(
		{
			to: email,
			subject: `Ihre Bestellung #${orderShort} bei Zigarren Puro`,
			html: orderConfirmationEmailHtml(
				firstName,
				orderId,
				orderShort,
				items,
				subtotal,
				shippingCost,
				total,
				unsubscribeUrl
			),
			text: `Guten Tag ${firstName},\n\nvielen Dank für Ihre Bestellung #${orderShort} bei Zigarren Puro.\n\nGesamtbetrag: ${total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}\n\nBitte überweisen Sie den Betrag mit dem Verwendungszweck #${orderShort}.\n\nZigarren Puro`
		},
		customerId
	);
}

export async function sendPasswordResetEmail(
	customerId: string,
	email: string,
	firstName: string
): Promise<void> {
	const token = await generatePasswordResetToken(customerId);
	const resetUrl = `https://${PUBLIC_ORIGIN}/reset-password?token=${token}`;

	await sendMail({
		to: email,
		subject: 'Passwort zurücksetzen – Zigarren Puro',
		html: passwordResetEmailHtml(firstName, resetUrl),
		text: `Guten Tag ${firstName},\n\nSie haben angefordert, Ihr Passwort zurückzusetzen.\n\nBitte öffnen Sie folgenden Link:\n${resetUrl}\n\nDieser Link ist 1 Stunde gültig.\n\nZigarren Puro`
	});
}

export async function sendVerificationEmail(
	customerId: string,
	email: string,
	firstName: string
): Promise<void> {
	const token = await generateVerificationToken(customerId);
	const verifyUrl = `https://${PUBLIC_ORIGIN}/verify-email?token=${token}`;
	const unsubscribeUrl = await generateUnsubscribeLink(customerId);

	await sendMail({
		to: email,
		subject: 'Bitte bestätigen Sie Ihre E-Mail-Adresse',
		html: verificationEmailHtml(firstName, verifyUrl, unsubscribeUrl),
		text: `Guten Tag ${firstName},\n\nBitte bestätigen Sie Ihre E-Mail-Adresse unter folgendem Link:\n${verifyUrl}\n\nDieser Link ist 24 Stunden gültig.\n\nZigarren Puro`
	});
}

export async function sendMail(mailOptions: Options, customerId?: string): Promise<string | null> {
	mailOptions.from ??= `"${PUBLIC_APP_NAME}" <info@${PUBLIC_ORIGIN}>`;
	mailOptions.headers ??= {};
	const headers = mailOptions.headers as Record<string, string>;
	if (customerId) {
		const unsubscribeUrl = await generateUnsubscribeLink(customerId);
		headers['List-Unsubscribe'] = `<${unsubscribeUrl}>`;
		headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
	} else {
		headers['List-Unsubscribe'] = `<https://${PUBLIC_ORIGIN}/unsubscribe>`;
	}

	const transporter = nodemailer.createTransport({
		host: SMTP_HOST,
		port: 465,
		secure: true,
		auth: { user: SMTP_USER, pass: SMTP_PASSWORD }
	});

	const info = await transporter.sendMail(mailOptions);

	if (!info.accepted.length || info.rejected.length) {
		await Logger.error('Error sending email:', info);
		return null;
	}
	return info.messageId;
}
