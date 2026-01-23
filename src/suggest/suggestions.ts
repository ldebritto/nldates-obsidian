import type NaturalLanguageDates from "../main";

export interface IDateCompletion {
  label: string;
  preview?: string;
}

const weekdaysPt = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
];

const weekdaysEn = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Mapeamento de abreviações para dias completos
const weekdayAbbrevPt: { [key: string]: string } = {
  dom: "domingo",
  seg: "segunda",
  ter: "terça",
  qua: "quarta",
  qui: "quinta",
  sex: "sexta",
  sab: "sábado",
  sáb: "sábado",
};

export function getDateSuggestions(
  query: string,
  plugin: NaturalLanguageDates
): IDateCompletion[] {
  const queryLower = query.toLowerCase();

  // Query vazia - mostrar sugestões padrão
  if (!query.trim()) {
    return [
      { label: "hoje" },
      { label: "ontem" },
      { label: "amanhã" },
      { label: "próxima semana" },
      { label: "última semana" },
    ].map((item) => ({
      ...item,
      preview: getPreviewForSuggestion(item.label, plugin),
    }));
  }

  // Sugestões de horário (PT-BR + EN)
  if (query.match(/^(?:hora|time)/i)) {
    return ["agora", "+15 minutos", "+1 hora", "-15 minutos", "-1 hora"]
      .map((val) => ({ label: `hora:${val}` }))
      .filter((item) => item.label.toLowerCase().startsWith(queryLower));
  }

  // Sugestões para "próximo/próxima/último/última/este/esta" + shorthands (PT-BR)
  if (query.match(/^(pr[óo]xim[oa]|[úu]ltim[oa]|est[ea]|pr[óo]x|ult|pas)/i)) {
    const reference = query.match(
      /^(pr[óo]xim[oa]|[úu]ltim[oa]|est[ea]|pr[óo]x|ult|pas)/i
    )[1];
    const referenceLower = reference.toLowerCase();
    const baseUnits =
      referenceLower === "pas"
        ? ["semana", ...weekdaysPt]
        : ["semana", "mês", "ano", ...weekdaysPt];

    // Expandir "sem" para "semana" na query
    const expandedQuery = queryLower.replace(/\bsem\b/, "semana");

    return baseUnits
      .map((val) => ({ label: `${reference} ${val}` }))
      .filter((item) => item.label.toLowerCase().startsWith(expandedQuery))
      .map((item) => ({
        ...item,
        preview: getPreviewForSuggestion(item.label, plugin),
      }));
  }

  // Fallback para inglês: "next/last/this"
  if (query.match(/^(next|last|this)/i)) {
    const reference = query.match(/^(next|last|this)/i)[1];
    return ["week", "month", "year", ...weekdaysEn]
      .map((val) => ({ label: `${reference} ${val}` }))
      .filter((item) => item.label.toLowerCase().startsWith(queryLower))
      .map((item) => ({
        ...item,
        preview: getPreviewForSuggestion(item.label, plugin),
      }));
  }

  // Dias da semana sem prefixo (PT-BR) - com variações
  // Primeiro verificar se é uma abreviação
  const expandedWeekday = weekdayAbbrevPt[queryLower];
  const weekdayMatchesPt = expandedWeekday
    ? [expandedWeekday]
    : weekdaysPt.filter((day) => day.startsWith(queryLower));

  if (weekdayMatchesPt.length) {
    // Se encontrou exatamente um dia, mostrar variações
    if (weekdayMatchesPt.length === 1) {
      const day = weekdayMatchesPt[0];
      const variations = [
        day,
        `próxima ${day}`,
        `última ${day}`,
        `primeira ${day} do mês`,
        `última ${day} do mês`,
      ];
      return variations.map((val) => ({
        label: val,
        preview: getPreviewForSuggestion(val, plugin),
      }));
    }
    // Se encontrou múltiplos dias, mostrar lista simples
    return weekdayMatchesPt.map((val) => ({
      label: val,
      preview: getPreviewForSuggestion(val, plugin),
    }));
  }

  // Dias da semana sem prefixo (EN) - com variações
  const weekdayMatchesEn = weekdaysEn.filter((day) =>
    day.toLowerCase().startsWith(queryLower)
  );
  if (weekdayMatchesEn.length) {
    if (weekdayMatchesEn.length === 1) {
      const day = weekdayMatchesEn[0];
      const variations = [
        day,
        `next ${day}`,
        `last ${day}`,
      ];
      return variations.map((val) => ({
        label: val,
        preview: getPreviewForSuggestion(val, plugin),
      }));
    }
    return weekdayMatchesEn.map((val) => ({
      label: val,
      preview: getPreviewForSuggestion(val, plugin),
    }));
  }

  // Aritmética simples: 7d -3w +1m +2y
  if (query.match(/^[+-]?\d+\s*[dwmy](?:\s+[+-]?\d+\s*[dwmy])*\s*$/i)) {
    return [
      {
        label: query,
        preview: getPreviewForSuggestion(query, plugin),
      },
    ];
  }

  // Datas relativas em português: "em X dias", "daqui a X", "X dias atrás"
  const relativeDatePT =
    query.match(/^(?:em|daqui\s*a?)\s*([+-]?\d+)/i) ||
    query.match(
      /^([+-]?\d+)\s*(?:dias?|semanas?|mês|meses|anos?|horas?|minutos?)/i
    );
  if (relativeDatePT) {
    const timeDelta = relativeDatePT[1];
    return [
      { label: `em ${timeDelta} dias` },
      { label: `em ${timeDelta} semanas` },
      { label: `em ${timeDelta} meses` },
      { label: `${timeDelta} dias atrás` },
      { label: `${timeDelta} semanas atrás` },
      { label: `${timeDelta} meses atrás` },
    ]
      .filter((item) => item.label.toLowerCase().startsWith(queryLower))
      .map((item) => ({
        ...item,
        preview: getPreviewForSuggestion(item.label, plugin),
      }));
  }

  // Datas relativas em inglês: "in X days", "X days ago"
  const relativeDateEN =
    query.match(/^in\s+([+-]?\d+)/i) ||
    query.match(/^([+-]?\d+)\s*(?:days?|weeks?|months?|hours?|minutes?)/i);
  if (relativeDateEN) {
    const timeDelta = relativeDateEN[1];
    return [
      { label: `in ${timeDelta} days` },
      { label: `in ${timeDelta} weeks` },
      { label: `in ${timeDelta} months` },
      { label: `${timeDelta} days ago` },
      { label: `${timeDelta} weeks ago` },
      { label: `${timeDelta} months ago` },
    ]
      .filter((item) => item.label.toLowerCase().startsWith(queryLower))
      .map((item) => ({
        ...item,
        preview: getPreviewForSuggestion(item.label, plugin),
      }));
  }

  // Sugestões padrão filtradas
  const defaults = [
    { label: "hoje" },
    { label: "ontem" },
    { label: "amanhã" },
    { label: "agora" },
    { label: "today" },
    { label: "yesterday" },
    { label: "tomorrow" },
  ].filter((item) => item.label.toLowerCase().startsWith(queryLower));

  if (defaults.length) {
    return defaults.map((item) => ({
      ...item,
      preview: getPreviewForSuggestion(item.label, plugin),
    }));
  }

  // Se nenhuma sugestão, retornar a query como está (para tentar parsear)
  return [
    {
      label: query,
      preview: getPreviewForSuggestion(query, plugin),
    },
  ];
}

export function getPreviewForSuggestion(
  value: string,
  plugin: NaturalLanguageDates
): string | null {
  const normalized =
    value.startsWith("time:") || value.startsWith("hora:")
      ? value.substring(5)
      : value;
  const parsed = plugin.parseDate(normalized);
  if (!parsed.moment.isValid()) {
    return null;
  }
  return parsed.moment.format("DD/MM/YYYY");
}
