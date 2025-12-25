import { format, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDateForStorage = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatDateForDisplay = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch (e) {
    return dateStr;
  }
};

export const getMonthYear = (date: Date): string => {
  return format(date, 'MMMM yyyy', { locale: ptBR });
};