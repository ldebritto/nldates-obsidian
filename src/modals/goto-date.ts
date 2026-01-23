import { App, Modal, Setting } from "obsidian";
import { getOrCreateDailyNote } from "../utils";
import { getDateSuggestions, IDateCompletion } from "../suggest/suggestions";
import type NaturalLanguageDates from "../main";

type OpenMode = "current" | "newTab" | "split";

export default class GoToDateModal extends Modal {
  plugin: NaturalLanguageDates;
  private selectedIndex = 0;
  private suggestions: IDateCompletion[] = [];
  private suggestionsEl: HTMLElement;
  private inputEl: HTMLInputElement;

  constructor(app: App, plugin: NaturalLanguageDates) {
    super(app);
    this.plugin = plugin;
  }

  onOpen(): void {
    let dateInput = "";

    this.contentEl.addClass("nldates-goto-modal");

    // Input container
    const inputContainer = this.contentEl.createDiv({ cls: "nldates-input-container" });

    const inputSetting = new Setting(inputContainer)
      .setName("Data")
      .addText((textEl) => {
        this.inputEl = textEl.inputEl;
        textEl.setPlaceholder("hoje, amanhã, próxima segunda...");

        textEl.onChange((value) => {
          dateInput = value;
          this.updateSuggestions(value);
        });

        textEl.inputEl.addEventListener("keydown", (e: KeyboardEvent) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            this.selectNext();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            this.selectPrevious();
          } else if (e.key === "Tab") {
            e.preventDefault();
            this.applySuggestion();
          } else if (e.key === "Enter") {
            e.preventDefault();
            const hasModifier = e.metaKey || e.ctrlKey;
            const mode: OpenMode = hasModifier && e.altKey
              ? "split"
              : hasModifier
                ? "newTab"
                : "current";
            // Se a sugestão selecionada for diferente do input, aplicar primeiro
            if (this.suggestions[this.selectedIndex]?.label !== dateInput) {
              dateInput = this.suggestions[this.selectedIndex]?.label || dateInput;
            }
            this.navigateToDate(dateInput, mode);
          } else if (e.key === "Escape") {
            this.close();
          }
        });

        window.setTimeout(() => textEl.inputEl.focus(), 10);
      });

    // Remover a descrição padrão do Setting
    inputSetting.descEl.remove();

    // Suggestions container
    this.suggestionsEl = this.contentEl.createDiv({ cls: "nldates-suggestions" });
    this.suggestionsEl.style.cssText = `
      max-height: 200px;
      overflow-y: auto;
      margin-bottom: 1em;
      border: 1px solid var(--background-modifier-border);
      border-radius: 4px;
    `;

    // Hints
    const hintEl = this.contentEl.createDiv({ cls: "setting-item-description" });
    hintEl.style.marginBottom = "1em";
    hintEl.style.fontSize = "var(--font-smallest)";
    hintEl.innerHTML = `
      <div style="display:flex;gap:1em;flex-wrap:wrap;">
        <span>↑↓ navegar</span>
        <span>Tab aplicar</span>
        <span>Enter abrir</span>
        <span>⌘↵ nova aba</span>
        <span>⌘⌥↵ à direita</span>
      </div>
    `.trim();

    // Buttons
    const buttonContainer = this.contentEl.createDiv("modal-button-container");
    buttonContainer
      .createEl("button", { text: "Cancelar" })
      .addEventListener("click", () => this.close());
    const submitBtn = buttonContainer.createEl("button", {
      cls: "mod-cta",
      text: "Ir para nota",
    });
    submitBtn.addEventListener("click", () => {
      const finalInput = this.suggestions[this.selectedIndex]?.label || dateInput;
      this.navigateToDate(finalInput, "current");
    });

    // Inicializar sugestões
    this.updateSuggestions("");
  }

  private updateSuggestions(query: string): void {
    this.suggestions = getDateSuggestions(query, this.plugin);
    this.selectedIndex = 0;
    this.renderSuggestions();
  }

  private renderSuggestions(): void {
    this.suggestionsEl.empty();

    this.suggestions.forEach((suggestion, index) => {
      const itemEl = this.suggestionsEl.createDiv({
        cls: `nldates-suggestion-item${index === this.selectedIndex ? " is-selected" : ""}`,
      });
      itemEl.style.cssText = `
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        gap: 8px;
        ${index === this.selectedIndex ? "background: var(--background-modifier-hover);" : ""}
      `;

      itemEl.createSpan({ text: suggestion.label });
      if (suggestion.preview) {
        const previewSpan = itemEl.createSpan({ text: suggestion.preview });
        previewSpan.style.color = "var(--text-muted)";
      }

      itemEl.addEventListener("click", () => {
        this.selectedIndex = index;
        this.applySuggestion();
        this.inputEl.focus();
      });

      itemEl.addEventListener("mouseenter", () => {
        this.selectedIndex = index;
        this.renderSuggestions();
      });
    });

    // Scroll para o item selecionado
    const selectedEl = this.suggestionsEl.querySelector(".is-selected");
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: "nearest" });
    }
  }

  private selectNext(): void {
    this.selectedIndex = (this.selectedIndex + 1) % this.suggestions.length;
    this.renderSuggestions();
  }

  private selectPrevious(): void {
    this.selectedIndex =
      (this.selectedIndex - 1 + this.suggestions.length) % this.suggestions.length;
    this.renderSuggestions();
  }

  private applySuggestion(): void {
    const suggestion = this.suggestions[this.selectedIndex];
    if (suggestion) {
      this.inputEl.value = suggestion.label;
      this.inputEl.dispatchEvent(new Event("input"));
      this.updateSuggestions(suggestion.label);
    }
  }

  private async navigateToDate(dateInput: string, mode: OpenMode): Promise<void> {
    const parsedDate = this.plugin.parseDate(dateInput || "hoje");

    if (!parsedDate.moment.isValid()) {
      return;
    }

    this.close();
    const dailyNote = await getOrCreateDailyNote(parsedDate.moment);

    let leaf;
    switch (mode) {
      case "newTab":
        leaf = this.app.workspace.getLeaf("tab");
        break;
      case "split":
        leaf = this.app.workspace.getLeaf("split");
        break;
      default:
        leaf = this.app.workspace.getLeaf(false);
    }

    leaf.openFile(dailyNote);
  }
}
