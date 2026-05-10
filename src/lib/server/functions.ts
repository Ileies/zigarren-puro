import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } from '$env/static/private';
import { PUBLIC_APP_NAME, PUBLIC_ORIGIN } from '$env/static/public';
import * as Mail from 'nodemailer/lib/mailer';
import Logger from '$lib/server/Logger';
import { encodeBase64url } from '@oslojs/encoding';
import db from '$lib/server/db';
import { tokenTable } from '$lib/server/db/schema';
import { TokenType } from '$lib/types';

async function generateUnsubscribeLink(customerId: string): Promise<string> {
	const bytes = crypto.getRandomValues(new Uint8Array(24));
	const token = encodeBase64url(bytes);
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);
	await db.insert(tokenTable).values({ token, customerId, type: TokenType.NEWSLETTER_UNSUBSCRIBE, expiresAt });
	return `https://${PUBLIC_ORIGIN}/unsubscribe?token=${token}`;
}

export async function sendMail(mailOptions: Mail.Options, customerId?: string): Promise<string | null> {
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
		auth: {
			user: SMTP_USER,
			pass: SMTP_PASSWORD
		}
	});

	const sentMessageInfo = await transporter.sendMail(mailOptions);

	if (!sentMessageInfo.accepted.length || sentMessageInfo.rejected.length) {
		await Logger.error('Error sending email:', sentMessageInfo);
		return null;
	}
	return sentMessageInfo.messageId;
}
