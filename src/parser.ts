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
    // "última X" = a mais recente (pode ser essa semana)
    const lastDateMatch = selectedText.match(/(?:last|[úu]ltim[oa])\s+([\wêç-]+)/i);
    // "X passada/passado" = da semana passada (sempre anterior à semana atual)
    const passadoDateMatch = selectedText.match(/([\wêç-]+)\s+passad[oa]/i);
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

    // "próxima semana" / "next week" / "próxima segunda" / etc.
    if (nextDateMatch) {
      const unit = normalizeTimeUnit(nextDateMatch[1]);

      if (unit === "week" || nextDateMatch[1].toLowerCase() === "semana") {
        return parser.parseDate(`next ${weekStart}`, referenceDate, {
          forwardDate: true,
        });
      }

      if (unit === "month" || nextDateMatch[1].toLowerCase() === "mês" || nextDateMatch[1].toLowerCase() === "mes") {
        // Próximo mês = primeiro dia do mês seguinte
        return window.moment().add(1, "month").startOf("month").toDate();
      }

      if (unit === "year" || nextDateMatch[1].toLowerCase() === "ano") {
        // Próximo ano = primeiro dia do ano seguinte
        return window.moment().add(1, "year").startOf("year").toDate();
      }

      // "próxima segunda", "próximo domingo", etc. - dias da semana
      if (WEEKDAY_PT_TO_EN[nextDateMatch[1].toLowerCase()]) {
        const weekdayEN = WEEKDAY_PT_TO_EN[nextDateMatch[1].toLowerCase()];
        return parser.parseDate(`next ${weekdayEN}`, new Date(), {
          forwardDate: true,
        });
      }
    }

    // "segunda passada", "sexta passada" = da semana passada (sempre na semana anterior)
    if (passadoDateMatch) {
      const matchedWord = passadoDateMatch[1].toLowerCase();

      // Dias da semana - ir para a semana passada e pegar o dia correspondente
      if (WEEKDAY_PT_TO_EN[matchedWord]) {
        // Mapeamento do dia da semana para número (0=domingo, 1=segunda, etc.)
        const weekdayMap: { [key: string]: number } = {
          domingo: 0, dom: 0,
          segunda: 1, "segunda-feira": 1, seg: 1,
          terça: 2, "terça-feira": 2, ter: 2,
          quarta: 3, "quarta-feira": 3, qua: 3,
          quinta: 4, "quinta-feira": 4, qui: 4,
          sexta: 5, "sexta-feira": 5, sex: 5,
          sábado: 6, sabado: 6, sab: 6,
        };
        const targetWeekday = weekdayMap[matchedWord];
        // Voltar para a semana passada e ir ao dia da semana desejado
        const lastWeek = window.moment().subtract(1, "week");
        const result = lastWeek.day(targetWeekday);
        return result.toDate();
      }

      // "semana passada"
      if (matchedWord === "semana") {
        return window.moment().subtract(1, "week").startOf("week").toDate();
      }
    }

    // "última segunda", "último domingo" = a ocorrência mais recente (pode ser essa semana)
    if (lastDateMatch) {
      const matchedWord = lastDateMatch[1].toLowerCase();

      // Dias da semana - a mais recente (pode ser essa semana, se já passou)
      if (WEEKDAY_PT_TO_EN[matchedWord]) {
        const weekdayMap: { [key: string]: number } = {
          domingo: 0, dom: 0,
          segunda: 1, "segunda-feira": 1, seg: 1,
          terça: 2, "terça-feira": 2, ter: 2,
          quarta: 3, "quarta-feira": 3, qua: 3,
          quinta: 4, "quinta-feira": 4, qui: 4,
          sexta: 5, "sexta-feira": 5, sex: 5,
          sábado: 6, sabado: 6, sab: 6,
        };
        const targetWeekday = weekdayMap[matchedWord];
        const today = window.moment();
        const todayWeekday = today.day();

        // Se o dia já passou essa semana, retorna esse dia dessa semana
        // Se ainda não passou, retorna o da semana passada
        if (targetWeekday < todayWeekday) {
          // Já passou essa semana - retorna dessa semana
          return today.day(targetWeekday).toDate();
        } else {
          // Ainda não passou ou é hoje - retorna da semana passada
          return today.subtract(1, "week").day(targetWeekday).toDate();
        }
      }

      // "última semana", "último mês", "último ano"
      if (matchedWord === "semana") {
        return window.moment().subtract(1, "week").startOf("week").toDate();
      }
      if (matchedWord === "mês" || matchedWord === "mes") {
        return window.moment().subtract(1, "month").startOf("month").toDate();
      }
      if (matchedWord === "ano") {
        return window.moment().subtract(1, "year").startOf("year").toDate();
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

    // Dia da semana sem quantificador (ex: "segunda", "sexta") = dia dessa semana
    const bareWeekdayMatch = selectedText.match(/^(domingo|dom|segunda|segunda-feira|seg|terça|terça-feira|ter|quarta|quarta-feira|qua|quinta|quinta-feira|qui|sexta|sexta-feira|sex|sábado|sabado|sab)$/i);
    if (bareWeekdayMatch) {
      const weekdayMap: { [key: string]: number } = {
        domingo: 0, dom: 0,
        segunda: 1, "segunda-feira": 1, seg: 1,
        terça: 2, "terça-feira": 2, ter: 2,
        quarta: 3, "quarta-feira": 3, qua: 3,
        quinta: 4, "quinta-feira": 4, qui: 4,
        sexta: 5, "sexta-feira": 5, sex: 5,
        sábado: 6, sabado: 6, sab: 6,
      };
      const targetWeekday = weekdayMap[bareWeekdayMatch[1].toLowerCase()];
      // Retorna o dia dessa semana, mesmo que já tenha passado
      return window.moment().day(targetWeekday).toDate();
    }

    return parser.parseDate(selectedText, referenceDate, { locale });
  }
}
