//import type { customerTable } from '$db/schema';

export type Seo = {
	pageTitle: string;
	pageDescription: string;
	ogUrl: string;
	ogImage: string;
};

//export type Customer = customerTable.$inferSelect;

export interface User {
	role: string;
	verified: boolean;
}

export enum LogLevel {
	INFO = 'info',
	WARNING = 'warning',
	ERROR = 'error',
	DEBUG = 'debug'
}
export enum TokenType {
	SESSION = 'session',
	PASSWORD_RESET = 'password_reset',
	EMAIL_VERIFICATION = 'email_verification',
	EMAIL_CHANGE = 'email_change',
	REMEMBER_ME = 'remember_me',
	API_KEY = 'api_key',
	REFRESH_TOKEN = 'refresh_token',
	NEWSLETTER_UNSUBSCRIBE = 'newsletter_unsubscribe'
}
export enum ProductType {
	CIGAR = 'cigar',
	CIGARILLO = 'cigarillo',
	BEVERAGE = 'beverage',
	TOOL = 'tool'
}
export enum CigarStrength {
	MILD = 'mild',
	MEDIUM = 'medium',
	FULL = 'full'
}
export enum BeverageType {
	WINE = 'wine',
	WHISKEY = 'whiskey',
	RUM = 'rum',
	COGNAC = 'cognac',
	VODKA = 'vodka'
}
export enum FilterType {
	NONE = 'none',
	REGULAR = 'regular',
	CHARCOAL = 'charcoal'
}
export enum Gender {
	MALE = 'male',
	FEMALE = 'female',
	OTHER = 'other',
	PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}
export enum OrderStatus {
	PENDING = 'pending',
	CONFIRMED = 'confirmed',
	PROCESSING = 'processing',
	SHIPPED = 'shipped',
	DELIVERED = 'delivered',
	CANCELLED = 'cancelled',
	REFUNDED = 'refunded'
}
export enum PaymentStatus {
	PENDING = 'pending',
	AUTHORIZED = 'authorized',
	PAID = 'paid',
	FAILED = 'failed',
	REFUNDED = 'refunded'
}
export enum PaymentMethod {
	CREDIT_CARD = 'credit_card',
	PAYPAL = 'paypal',
	BANK_TRANSFER = 'bank_transfer',
	CRYPTO = 'crypto'
}
export enum ShippingMethod {
	STANDARD = 'standard',
	EXPRESS = 'express',
	NEXT_DAY = 'next_day',
	PICKUP = 'pickup'
}
