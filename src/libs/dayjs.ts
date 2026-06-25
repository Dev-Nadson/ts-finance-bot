import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.locale('pt-br');
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

const COMPETENCE_FORMAT = 'YYYY-MM';

export function current_competence(): string {
    return dayjs().format(COMPETENCE_FORMAT);
}

export function competence_of(month: number, year: number): string {
    return dayjs(`${year}-${String(month).padStart(2, '0')}`, COMPETENCE_FORMAT).format(COMPETENCE_FORMAT);
}

export function parse_competence(competence: string): { month: number; year: number } {
    const date = dayjs(competence, COMPETENCE_FORMAT, true);
    return { month: date.month() + 1, year: date.year() };
}

export function shift_competence(competence: string, months: number): string {
    return dayjs(competence, COMPETENCE_FORMAT).add(months, 'month').format(COMPETENCE_FORMAT);
}

export function format_competence(competence: string): string {
    const label = dayjs(competence, COMPETENCE_FORMAT).format('MMMM/YYYY');
    return label.charAt(0).toUpperCase() + label.slice(1);
}

export function recent_competences(count: number): string[] {
    const current = current_competence();
    return Array.from({ length: count }, (_, index) => shift_competence(current, -index));
}

export function format_date(date?: dayjs.ConfigType): string {
    return dayjs(date).format('DD/MM/YYYY');
}

export function format_datetime(date?: dayjs.ConfigType): string {
    return dayjs(date).format('DD/MM/YYYY HH:mm');
}

export { dayjs };
