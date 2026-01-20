import { App, PluginSettingTab, Setting } from "obsidian";
import NaturalLanguageDates from "./main";
import { getLocaleWeekStart } from "./utils";

export type DayOfWeek =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "locale-default";

export interface NLDSettings {
  autosuggestToggleLink: boolean;
  autocompleteTriggerPhrase: string;
  isAutosuggestEnabled: boolean;

  format: string;
  timeFormat: string;
  separator: string;
  weekStart: DayOfWeek;

  modalToggleTime: boolean;
  modalToggleLink: boolean;
  modalMomentFormat: string;
}

export const DEFAULT_SETTINGS: NLDSettings = {
  autosuggestToggleLink: true,
  autocompleteTriggerPhrase: "@",
  isAutosuggestEnabled: true,

  format: "YYYY-MM-DD",
  timeFormat: "HH:mm",
  separator: " ",
  weekStart: "locale-default",

  modalToggleTime: false,
  modalToggleLink: false,
  modalMomentFormat: "YYYY-MM-DD HH:mm",
};

const weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// Nomes dos dias em português para exibição
const weekdaysPT: { [key: string]: string } = {
  sunday: "Domingo",
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
};

export class NLDSettingsTab extends PluginSettingTab {
  plugin: NaturalLanguageDates;

  constructor(app: App, plugin: NaturalLanguageDates) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const localeWeekStart = getLocaleWeekStart();
    const localeWeekStartPT = weekdaysPT[localeWeekStart] || localeWeekStart;

    containerEl.empty();

    containerEl.createEl("h2", {
      text: "Datas em Linguagem Natural",
    });

    containerEl.createEl("h3", {
      text: "Configurações do Parser",
    });

    new Setting(containerEl)
      .setName("Formato da data")
      .setDesc("Formato de saída para datas interpretadas")
      .addMomentFormat((text) =>
        text
          .setDefaultFormat("YYYY-MM-DD")
          .setValue(this.plugin.settings.format)
          .onChange(async (value) => {
            this.plugin.settings.format = value || "YYYY-MM-DD";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Início da semana")
      .setDesc("Qual dia considerar como início da semana")
      .addDropdown((dropdown) => {
        dropdown.addOption("locale-default", `Padrão do sistema (${localeWeekStartPT})`);
        weekdays.forEach((day) => {
          dropdown.addOption(day, weekdaysPT[day]);
        });
        dropdown.setValue(this.plugin.settings.weekStart.toLowerCase());
        dropdown.onChange(async (value: DayOfWeek) => {
          this.plugin.settings.weekStart = value;
          await this.plugin.saveSettings();
        });
      });

    containerEl.createEl("h3", {
      text: "Configurações de Atalhos",
    });

    new Setting(containerEl)
      .setName("Formato da hora")
      .setDesc("Formato para atalhos que incluem a hora atual")
      .addMomentFormat((text) =>
        text
          .setDefaultFormat("HH:mm")
          .setValue(this.plugin.settings.timeFormat)
          .onChange(async (value) => {
            this.plugin.settings.timeFormat = value || "HH:mm";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Separador")
      .setDesc("Separador entre data e hora para entradas que incluem ambos")
      .addText((text) =>
        text
          .setPlaceholder("Separador vazio")
          .setValue(this.plugin.settings.separator)
          .onChange(async (value) => {
            this.plugin.settings.separator = value;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h3", {
      text: "Autosugestão de Datas",
    });

    new Setting(containerEl)
      .setName("Ativar autosugestão")
      .setDesc(
        `Digite datas em linguagem natural. Abra o menu de sugestões com ${this.plugin.settings.autocompleteTriggerPhrase}`
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.isAutosuggestEnabled)
          .onChange(async (value) => {
            this.plugin.settings.isAutosuggestEnabled = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Inserir como link?")
      .setDesc(
        "Se ativado, datas criadas via autosugestão serão inseridas como [[wikilinks]]"
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autosuggestToggleLink)
          .onChange(async (value) => {
            this.plugin.settings.autosuggestToggleLink = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Caractere gatilho")
      .setDesc("Caractere(s) que abrirão o menu de autosugestão de datas")
      .addMomentFormat((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.autocompleteTriggerPhrase)
          .setValue(this.plugin.settings.autocompleteTriggerPhrase || "@")
          .onChange(async (value) => {
            this.plugin.settings.autocompleteTriggerPhrase = value.trim();
            await this.plugin.saveSettings();
          })
      );
  }
}
