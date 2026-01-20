import chrono, { Chrono, Parser, pt as chronoPT } from "chrono-node";
import type { Moment } from "moment";

import { DayOfWeek } from "./settings";
import {
  ORDINAL_NUMBER_PATTERN_PT,
  getLastDayOfMonth,
  getLocaleWeekStart,
  getWeekNumber,
  parseOrdinalNumberPatternPT,
  TIME_UNIT_DICTIONARY_PT,
} from "./utils";

export interface NLDResult {
  formattedString: string;
  date: Date;
  moment: Moment;
}

// Dicionário de dias da semana em português para uso interno
const WEEKDAY_PT_TO_EN: { [key: string]: string } = {
  domingo: "sunday",
  dom: "sunday",
  segunda: "monday",
  "segunda-feira": "monday",
  seg: "monday",
  terça: "tuesday",
  "terça-feira": "tuesday",
  ter: "tuesday",
  quarta: "wednesday",
  "quarta-feira": "wednesday",
  qua: "wednesday",
  quinta: "thursday",
  "quinta-feira": "thursday",
  qui: "thursday",
  sexta: "friday",
  "sexta-feira": "friday",
  sex: "friday",
  sábado: "saturday",
  sabado: "saturday",
  sab: "saturday",
};

function getConfiguredChrono(): Chrono {
  // Usar português como base
  const ptChrono = new Chrono(chronoPT.createCasualConfiguration());

  // Parser para "Natal"
  ptChrono.parsers.push({
    pattern: () => {
      return /\b(?:natal|véspera de natal)\b/i;
    },
    extract: (_context, match) => {
      const isVespera = match[0].toLowerCase().includes("véspera");
      return {
        day: isVespera ? 24 : 25,
        month: 12,
      };
    },
  });

  // Parser para ordinais em português (ex: "primeiro", "décimo quinto")
  ptChrono.parsers.push({
    pattern: () => new RegExp(ORDINAL_NUMBER_PATTERN_PT),
    extract: (_context, match) => {
      return {
        day: parseOrdinalNumberPatternPT(match[0]),
        month: window.moment().month() + 1,
      };
    },
  } as Parser);

  // Parser para datas relativas: "daqui a X dias", "em X semanas", "X dias atrás"
  ptChrono.parsers.push({
    pattern: () => {
      return /(?:daqui\s+a\s+|em\s+)?(\d+)\s+(minutos?|horas?|dias?|semanas?|mês|meses|anos?)\s*(?:atrás)?/i;
    },
    extract: (context, match) => {
      const num = parseInt(match[1]);
      const unitRaw = match[2].toLowerCase();
      const isAgo = match[0].toLowerCase().includes("atrás");

      const unit = TIME_UNIT_DICTIONARY_PT[unitRaw];
      if (!unit) return null;

      const modifier = isAgo ? -num : num;
      const refDate = window.moment(context.refDate);

      let resultDate: Moment;
      switch (unit) {
        case "minute":
          resultDate = refDate.add(modifier, "minutes");
          break;
        case "hour":
          resultDate = refDate.add(modifier, "hours");
          break;
        case "d":
          resultDate = refDate.add(modifier, "days");
          break;
        case "week":
          resultDate = refDate.add(modifier, "weeks");
          break;
        case "month":
          resultDate = refDate.add(modifier, "months");
          break;
        case "year":
          resultDate = refDate.add(modifier, "years");
          break;
        default:
          return null;
      }

      return {
        day: resultDate.date(),
        month: resultDate.month() + 1,
        year: resultDate.year(),
        hour: resultDate.hour(),
        minute: resultDate.minute(),
      };
    },
  } as Parser);

  // Também adicionar parsers do inglês como fallback
  const enChrono = new Chrono(chrono.en.createCasualConfiguration(false));
  enChrono.parsers.forEach((parser) => {
    ptChrono.parsers.push(parser);
  });

  return ptChrono;
}

export default class NLDParser {
  chrono: Chrono;

  constructor() {
    this.chrono = getConfiguredChrono();
  }

  getParsedDate(selectedText: string, weekStartPreference: DayOfWeek): Date {
    const parser = this.chrono;
    const initialParse = parser.parse(selectedText);
    const weekdayIsCertain = initialParse[0]?.start.isCertain("weekday");

    const weekStart =
      weekStartPreference === "locale-default"
        ? getLocaleWeekStart()
        : weekStartPreference;

    const locale = {
      weekStart: getWeekNumber(weekStart),
    };

    // Regex para português E inglês
    const thisDateMatch = selectedText.match(/(?:this|est[ea])\s+([\wêç-]+)/i);
    const nextDateMatch = selectedText.match(/(?:next|pr[óo]xim[oa])\s+([\wêç-]+)/i);
    const lastDayOfMatch = selectedText.match(
      /(?:last day of|end of|[úu]ltimo dia de?|fim de?)\s*([^\n\r]*)/i
    );
    const midOf = selectedText.match(/(?:mid|meado?s?\s+de)\s+([\wêç-]+)/i);

    const referenceDate = weekdayIsCertain
      ? window.moment().weekday(0).toDate()
      : new Date();

    // Normalizar unidade de tempo (PT -> EN para processamento interno)
    const normalizeTimeUnit = (unit: string): string => {
      const lower = unit.toLowerCase();
      // Português para inglês
      if (lower === "semana") return "week";
      if (lower === "mês" || lower === "mes") return "month";
      if (lower === "ano") return "year";
      if (lower === "dia") return "day";
      // Dias da semana
      if (WEEKDAY_PT_TO_EN[lower]) return WEEKDAY_PT_TO_EN[lower];
      return lower;
    };

    // "esta semana" / "this week"
    if (thisDateMatch) {
      const unit = normalizeTimeUnit(thisDateMatch[1]);
      if (unit === "week" || thisDateMatch[1].toLowerCase() === "semana") {
        return parser.parseDate(`this ${weekStart}`, referenceDate);
      }
    }

    // "próxima semana" / "next week"
    if (nextDateMatch) {
      const unit = normalizeTimeUnit(nextDateMatch[1]);

      if (unit === "week" || nextDateMatch[1].toLowerCase() === "semana") {
        return parser.parseDate(`next ${weekStart}`, referenceDate, {
          forwardDate: true,
        });
      }

      if (unit === "month" || nextDateMatch[1].toLowerCase() === "mês" || nextDateMatch[1].toLowerCase() === "mes") {
        const thisMonth = parser.parseDate("this month", new Date(), {
          forwardDate: true,
        });
        return parser.parseDate(selectedText, thisMonth, {
          forwardDate: true,
        });
      }

      if (unit === "year" || nextDateMatch[1].toLowerCase() === "ano") {
        const thisYear = parser.parseDate("this year", new Date(), {
          forwardDate: true,
        });
        return parser.parseDate(selectedText, thisYear, {
          forwardDate: true,
        });
      }
    }

    // "último dia de" / "fim de" / "last day of" / "end of"
    if (lastDayOfMatch) {
      const tempDate = parser.parse(lastDayOfMatch[1]);
      if (tempDate[0]) {
        const year = tempDate[0].start.get("year");
        const month = tempDate[0].start.get("month");
        const lastDay = getLastDayOfMonth(year, month);

        return parser.parseDate(`${year}-${month}-${lastDay}`, new Date(), {
          forwardDate: true,
        });
      }
    }

    // "meados de" / "mid"
    if (midOf) {
      return parser.parseDate(`${midOf[1]} 15`, new Date(), {
        forwardDate: true,
      });
    }

    return parser.parseDate(selectedText, referenceDate, { locale });
  }
}
