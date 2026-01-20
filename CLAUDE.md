# CLAUDE.md - Contexto do Projeto

## TODO
- [ ] Percebo que o autocompletar não funciona para dias da semana. Quando eu digito se não aparece segunda ou sexta como opções. Quero que apareça.
- [ ] Vamos permitir também um shorthand para prox = próxima, ult = última e pas = passada
- [ ] permitir também aritmética simples para dias +7d -3w +1m +2y e previsualizar a data calculada no modal de sugestão


## Visão Geral

Este é um fork do plugin [Natural Language Dates](https://github.com/argenos/nldates-obsidian) para Obsidian, modificado para suportar **português brasileiro (PT-BR)** como idioma principal, mantendo inglês como fallback.

## Arquivos Principais Modificados

### `src/parser.ts`
- Importa e usa `chrono.pt` (locale português) como parser base
- Adiciona parsers customizados para:
  - **"Natal"** e **"véspera de natal"**
  - **Ordinais em português** (primeiro, décimo quinto, etc.)
  - **Datas relativas PT-BR**: "em 5 dias", "daqui a 3 semanas", "2 dias atrás"
- Lógica especial para distinguir:
  - **"última X"** → ocorrência mais recente (pode ser essa semana)
  - **"X passada/passado"** → sempre da semana anterior
- Suporte bilíngue nos regex: "próxima/next", "esta/this", "último dia de/last day of", etc.
- Parsers do inglês adicionados como fallback

### `src/utils.ts`
- `ORDINAL_WORD_DICTIONARY_PT`: ordinais de 1º a 31º em português
- `ORDINAL_NUMBER_PATTERN_PT`: regex para "1º", "2ª", etc.
- `parseOrdinalNumberPatternPT()`: converte ordinais PT em números
- `TIME_UNIT_DICTIONARY_PT`: mapeia unidades de tempo PT → EN

### `src/suggest/date-suggest.ts`
- Sugestões padrão em português: "hoje", "ontem", "amanhã", "agora"
- Suporte para "próxima/última/esta" + dias da semana em PT
- Datas relativas: "em X dias", "X dias atrás"
- "hora:" como alternativa a "time:"
- Inglês mantido como fallback

### `manifest.json` e `package.json`
- ID: `datas-em-linguagem-natural`
- Nome: "Datas em Linguagem Natural"
- Versão: 0.7.0

## Funcionalidades Suportadas

| Entrada | Resultado |
|---------|-----------|
| `@hoje` | Data de hoje |
| `@amanhã` | Data de amanhã |
| `@ontem` | Data de ontem |
| `@próxima segunda` | Próxima segunda-feira |
| `@última sexta` | Sexta mais recente (pode ser essa semana) |
| `@sexta passada` | Sexta da semana passada |
| `@em 5 dias` | 5 dias no futuro |
| `@3 semanas atrás` | 3 semanas no passado |
| `@próximo mês` | Primeiro dia do mês seguinte |
| `@último mês` | Primeiro dia do mês anterior |
| `@fim de janeiro` | Último dia de janeiro |
| `@meados de março` | 15 de março |
| `@natal` | 25 de dezembro |

## Instalação

Copiar `main.js` e `manifest.json` para:
```
<vault>/.obsidian/plugins/datas-em-linguagem-natural/
```

## Build

```bash
npm install
npm run build
```

## Dependências Importantes

- `chrono-node`: fork em github:liamcain/chrono (inclui locale PT)
- `moment`: formatação e manipulação de datas
- `obsidian-daily-notes-interface`: integração com notas diárias
