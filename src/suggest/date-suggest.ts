import {
  App,
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  TFile,
} from "obsidian";
import type NaturalLanguageDates from "src/main";
import { generateMarkdownLink } from "src/utils";

interface IDateCompletion {
  label: string;
  preview?: string;
}

export default class DateSuggest extends EditorSuggest<IDateCompletion> {
  app: App;
  private plugin: NaturalLanguageDates;

  constructor(app: App, plugin: NaturalLanguageDates) {
    super(app);
    this.app = app;
    this.plugin = plugin;

    // @ts-ignore
    this.scope.register(["Shift"], "Enter", (evt: KeyboardEvent) => {
      // @ts-ignore
      this.suggestions.useSelectedItem(evt);
      return false;
    });

    if (this.plugin.settings.autosuggestToggleLink) {
      this.setInstructions([{ command: "Shift", purpose: "Manter texto como alias" }]);
    }
  }

  getSuggestions(context: EditorSuggestContext): IDateCompletion[] {
    const suggestions = this.getDateSuggestions(context);
    if (suggestions.length) {
      return suggestions;
    }

    // catch-all if there are no matches
    return [{ label: context.query }];
  }

  getDateSuggestions(context: EditorSuggestContext): IDateCompletion[] {
    const queryLower = context.query.toLowerCase();
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

    // Sugestões de horário (PT-BR + EN)
    if (context.query.match(/^(?:hora|time)/i)) {
      return [
        "agora",
        "+15 minutos",
        "+1 hora",
        "-15 minutos",
        "-1 hora",
      ]
        .map((val) => ({ label: `hora:${val}` }))
        .filter((item) => item.label.toLowerCase().startsWith(context.query));
    }

    // Sugestões para "próximo/próxima/último/última/este/esta" + shorthands (PT-BR)
    if (context.query.match(/^(pr[óo]xim[oa]|[úu]ltim[oa]|est[ea]|pr[óo]x|ult|pas)/i)) {
      const reference = context.query.match(
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
        .filter((items) => items.label.toLowerCase().startsWith(expandedQuery));
    }

    // Fallback para inglês: "next/last/this"
    if (context.query.match(/^(next|last|this)/i)) {
      const reference = context.query.match(/^(next|last|this)/i)[1];
      return ["week", "month", "year", ...weekdaysEn]
        .map((val) => ({ label: `${reference} ${val}` }))
        .filter((items) => items.label.toLowerCase().startsWith(context.query));
    }

    // Dias da semana sem prefixo (PT-BR) - com variações
    if (queryLower) {
      // Primeiro verificar se é uma abreviação
      const expandedWeekday = weekdayAbbrevPt[queryLower];
      const weekdayMatches = expandedWeekday
        ? [expandedWeekday]
        : weekdaysPt.filter((day) => day.startsWith(queryLower));

      if (weekdayMatches.length) {
        // Se encontrou exatamente um dia, mostrar variações
        if (weekdayMatches.length === 1) {
          const day = weekdayMatches[0];
          return [
            { label: day },
            { label: `próxima ${day}` },
            { label: `última ${day}` },
            { label: `primeira ${day} do mês` },
            { label: `última ${day} do mês` },
          ];
        }
        // Se encontrou múltiplos dias, mostrar lista simples
        return weekdayMatches.map((val) => ({ label: val }));
      }
    }

    // Dias da semana sem prefixo (EN) - com variações
    if (queryLower) {
      const weekdayMatches = weekdaysEn.filter((day) =>
        day.toLowerCase().startsWith(queryLower)
      );
      if (weekdayMatches.length) {
        if (weekdayMatches.length === 1) {
          const day = weekdayMatches[0];
          return [
            { label: day },
            { label: `next ${day}` },
            { label: `last ${day}` },
          ];
        }
        return weekdayMatches.map((val) => ({ label: val }));
      }
    }

    // Aritmética simples: 7d -3w +1m +2y (com pré-visualização)
    if (context.query.match(/^[+-]?\d+\s*[dwmy](?:\s+[+-]?\d+\s*[dwmy])*\s*$/i)) {
      const preview = this.getPreviewForSuggestion(context.query);
      return [{ label: context.query, preview: preview || undefined }];
    }

    // Datas relativas em português: "em X dias", "daqui a X", "X dias atrás"
    const relativeDatePT =
      context.query.match(/^(?:em|daqui\s*a?)\s*([+-]?\d+)/i) ||
      context.query.match(/^([+-]?\d+)\s*(?:dias?|semanas?|mês|meses|anos?|horas?|minutos?)/i);
    if (relativeDatePT) {
      const timeDelta = relativeDatePT[1];
      return [
        { label: `em ${timeDelta} minutos` },
        { label: `em ${timeDelta} horas` },
        { label: `em ${timeDelta} dias` },
        { label: `em ${timeDelta} semanas` },
        { label: `em ${timeDelta} meses` },
        { label: `${timeDelta} dias atrás` },
        { label: `${timeDelta} semanas atrás` },
        { label: `${timeDelta} meses atrás` },
      ].filter((items) => items.label.toLowerCase().startsWith(context.query));
    }

    // Datas relativas em inglês: "in X days", "X days ago"
    const relativeDateEN =
      context.query.match(/^in\s+([+-]?\d+)/i) || context.query.match(/^([+-]?\d+)\s*(?:days?|weeks?|months?|hours?|minutes?)/i);
    if (relativeDateEN) {
      const timeDelta = relativeDateEN[1];
      return [
        { label: `in ${timeDelta} minutes` },
        { label: `in ${timeDelta} hours` },
        { label: `in ${timeDelta} days` },
        { label: `in ${timeDelta} weeks` },
        { label: `in ${timeDelta} months` },
        { label: `${timeDelta} days ago` },
        { label: `${timeDelta} weeks ago` },
        { label: `${timeDelta} months ago` },
      ].filter((items) => items.label.toLowerCase().startsWith(context.query));
    }

    // Sugestões padrão: português primeiro, depois inglês
    return [
      // Português
      { label: "hoje" },
      { label: "ontem" },
      { label: "amanhã" },
      { label: "agora" },
      // Inglês (fallback)
      { label: "today" },
      { label: "yesterday" },
      { label: "tomorrow" },
    ].filter((items) => items.label.toLowerCase().startsWith(context.query));
  }

  renderSuggestion(suggestion: IDateCompletion, el: HTMLElement): void {
    el.empty();
    const rowEl = el.createEl("div", {
      attr: {
        style: "display:flex;justify-content:space-between;gap:8px;width:100%;",
      },
    });
    rowEl.createEl("span", {
      text: suggestion.label,
      attr: { style: "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" },
    });
    const preview =
      suggestion.preview || this.getPreviewForSuggestion(suggestion.label);
    if (preview) {
      rowEl.createEl("span", {
        text: preview,
        attr: {
          style:
            "color:var(--text-muted);text-align:right;white-space:nowrap;",
        },
      });
    }
  }

  selectSuggestion(suggestion: IDateCompletion, event: KeyboardEvent | MouseEvent): void {
    const { editor } = this.context;

    const includeAlias = event.shiftKey;
    let dateStr = "";
    let makeIntoLink = this.plugin.settings.autosuggestToggleLink;

    // Suporte para "hora:" (PT-BR) além de "time:" (EN)
    if (suggestion.label.startsWith("time:") || suggestion.label.startsWith("hora:")) {
      const timePart = suggestion.label.startsWith("time:")
        ? suggestion.label.substring(5)
        : suggestion.label.substring(5);
      dateStr = this.plugin.parseTime(timePart).formattedString;
      makeIntoLink = false;
    } else {
      dateStr = this.plugin.parseDate(suggestion.label).formattedString;
    }

    if (makeIntoLink) {
      dateStr = generateMarkdownLink(
        this.app,
        dateStr,
        includeAlias ? suggestion.label : undefined
      );
    }

    editor.replaceRange(dateStr, this.context.start, this.context.end);
  }

  private getPreviewForSuggestion(value: string): string | null {
    const normalized =
      value.startsWith("time:") || value.startsWith("hora:")
        ? value.substring(5)
        : value;
    const parsed = this.plugin.parseDate(normalized);
    if (!parsed.moment.isValid()) {
      return null;
    }
    return parsed.moment.format("DD/MM/YYYY");
  }

  onTrigger(
    cursor: EditorPosition,
    editor: Editor,
    file: TFile
  ): EditorSuggestTriggerInfo {
    if (!this.plugin.settings.isAutosuggestEnabled) {
      return null;
    }

    const triggerPhrase = this.plugin.settings.autocompleteTriggerPhrase;
    const startPos = this.context?.start || {
      line: cursor.line,
      ch: cursor.ch - triggerPhrase.length,
    };

    if (!editor.getRange(startPos, cursor).startsWith(triggerPhrase)) {
      return null;
    }

    const precedingChar = editor.getRange(
      {
        line: startPos.line,
        ch: startPos.ch - 1,
      },
      startPos
    );

    // Short-circuit if `@` as a part of a word (e.g. part of an email address)
    // Inclui caracteres acentuados comuns em português
    if (precedingChar && /[`a-zA-ZÀ-ÿ0-9]/.test(precedingChar)) {
      return null;
    }

    return {
      start: startPos,
      end: cursor,
      query: editor.getRange(startPos, cursor).substring(triggerPhrase.length),
    };
  }
}
