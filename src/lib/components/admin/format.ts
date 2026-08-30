import { getLocale } from '$lib/paraglide/runtime';

/**
 * Dates in the dashboard.
 *
 * Formatted for whichever language the *staff member* is reading the dashboard
 * in, which is not necessarily the language a row was written in. Amharic gets
 * Ge'ez month names through Intl; the Ethiopian calendar itself is a separate
 * question, and not one an admin timestamp needs to answer.
 */
const locale = () => (getLocale() === 'am' ? 'am-ET' : 'en-GB');

export function formatDate(value: Date | string | null | undefined): string {
	if (!value) return '—';
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return '—';
	return new Intl.DateTimeFormat(locale(), {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	}).format(date);
}

export function formatDateTime(value: Date | string | null | undefined): string {
	if (!value) return '—';
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return '—';
	return new Intl.DateTimeFormat(locale(), {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit'
	}).format(date);
}

/** `YYYY-MM-DD`, for an `<input type="date">` value. */
export function toDateInput(value: Date | string | null | undefined): string {
	if (!value) return '';
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	// Local parts, not `toISOString()`: that converts to UTC first, so an
	// evening date in Addis (UTC+3) would show as the previous day.
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${date.getFullYear()}-${month}-${day}`;
}
