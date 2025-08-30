import db from '$db';
import { logTable } from '$db/schema';
import { LogLevel } from '$lib/types';

/**
 * Logger class for handling and storing log messages with different severity levels.
 * Logs are persisted to the database and printed to the console.
 */
export default class Logger {
	/**
	 * Logs an informational message.
	 * @param message - Describes the event or operation.
	 * @param data - Additional context or details (optional).
	 */
	static info(message: string, data?: unknown) {
		return this.addLog(LogLevel.INFO, message, data);
	}

	/**
	 * Logs a warning message.
	 * @param message - Describes the event or issue.
	 * @param data - Additional context or details (optional).
	 */
	static warn(message: string, data?: unknown) {
		return this.addLog(LogLevel.WARNING, message, data);
	}

	/**
	 * Logs an error message.
	 * @param message - Describes the error or failure.
	 * @param data - Additional context or details (optional).
	 */
	static error(message: string, data?: unknown) {
		return this.addLog(LogLevel.ERROR, message, data);
	}

	/**
	 * Logs a debug message.
	 * @param message - Describes the event, often used during development.
	 * @param data - Additional context or details (optional).
	 */
	static debug(message: string, data?: unknown) {
		return this.addLog(LogLevel.DEBUG, message, data);
	}

	/**
	 * Internal method to handle log creation and persistence.
	 * @param type - The log level (severity) of the message.
	 * @param message - Describes the log entry.
	 * @param data - Optional additional context for the log.
	 */
	private static async addLog(type: LogLevel, message: string, data?: unknown): Promise<void> {
		const logEntry = {
			createdAt: new Date(),
			type,
			message,
			data: data || null // Ensure data is null if undefined
		};

		// Save the log to the database
		await db.insert(logTable).values(logEntry);

		// Format and output the log to the console
		const formattedDate = logEntry.createdAt.toISOString();
		console.log(`[${formattedDate}] [${type.toUpperCase()}]: ${message}`);
	}
}
