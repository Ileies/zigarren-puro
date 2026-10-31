/** Customers must be at least this old to buy or register (tobacco and spirits). */
export const MINIMUM_AGE = 18;

/**
 * Whole years between `birthDate` and `now`. A date-only string such as `2008-06-15` counts as
 * that calendar day, whatever the server time zone is.
 */
export function ageOn(birthDate: Date | string | number, now: Date = new Date()): number {
	const dateOnly = typeof birthDate === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
	const birth = dateOnly
		? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
		: new Date(birthDate);
	let age = now.getFullYear() - birth.getFullYear();
	const months = now.getMonth() - birth.getMonth();
	if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) age--;
	return age;
}
