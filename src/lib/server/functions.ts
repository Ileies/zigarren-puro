import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } from '$env/static/private';
import { PUBLIC_APP_NAME, PUBLIC_ORIGIN } from '$env/static/public';
import * as Mail from 'nodemailer/lib/mailer';
import Logger from '$lib/server/Logger';

export async function sendMail(mailOptions: Mail.Options): Promise<string | null> {
	mailOptions.from ??= `"${PUBLIC_APP_NAME}" <info@${PUBLIC_ORIGIN}>`;
	mailOptions.headers ??= {};
	(mailOptions.headers as Record<string, string>)['List-Unsubscribe'] = `<https://${Bun.env.PUBLIC_ORIGIN}/unsubscribe>`; // TODO: Implement unsubscribe link

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
