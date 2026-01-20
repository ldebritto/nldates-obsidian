# CLAUDE.md - Contexto do Projeto

## Visão Geral

Este é um fork do plugin [Natural Language Dates](https://github.com/argenos/nldates-obsidian) para Obsidian, modificado para suportar **português brasileiro (PT-BR)** como idioma principal, mantendo inglês como fallback.

## Arquivos Principais Modificados

### `src/parser.ts`
- Importa e usa `chrono.pt` (locale português) como parser base
- Adiciona parsers customizados para:
  - **"Natal"** e **"véspera de natal"**
  - **Ordinais em português** (apenas primeiro/primeira e 1º/1ª/1o)
  - **Datas relativas PT-BR**: "em 5 dias", "daqui a 3 semanas", "2 dias atrás"
  - **Aritmética simples**: "7d", "+1m", "-3w", "+2y"
  - **Datas por dia do mês**: "dia 13"
  - **Ocorrências mensais**: "primeira segunda do mês", "última terça de novembro"
- Lógica especial para distinguir:
  - **"última X"** → ocorrência mais recente (pode ser essa semana)
  - **"X passada/passado"** → sempre da semana anterior
- Suporte bilíngue nos regex: "próxima/next", "esta/this", "último dia de/last day of", etc.
- Suporte a shorthands: "prox", "ult", "pas"
- Parsers do inglês adicionados como fallback
- Datas numéricas interpretadas como **dia/mês** (D/M) quando não há ano

### `src/utils.ts`
- `ORDINAL_WORD_DICTIONARY_PT`: apenas ordinais para o dia 1
- `ORDINAL_NUMBER_PATTERN_PT`: regex para "1º", "1ª", "1o"
- `parseOrdinalNumberPatternPT()`: converte ordinais PT em números
- `TIME_UNIT_DICTIONARY_PT`: mapeia unidades de tempo PT → EN

### `src/suggest/date-suggest.ts`
- Sugestões padrão em português: "hoje", "ontem", "amanhã", "agora"
- Suporte para dias da semana sem prefixo (ex: "se" → "segunda")
- Suporte para "próxima/última/esta" + dias da semana em PT
- Suporte para shorthands: "prox", "ult", "pas"
- Datas relativas: "em X dias", "X dias atrás"
- Aritmética simples: "7d", "+1m", "-3w", "+2y"
- "hora:" como alternativa a "time:"
- Pré-visualização da data no formato DD/MM/YYYY ao lado da sugestão
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
| `@prox segunda` | Próxima segunda-feira (shorthand) |
| `@ult sexta` | Sexta mais recente (shorthand) |
| `@pas domingo` | Domingo da semana passada (shorthand) |
| `@em 5 dias` | 5 dias no futuro |
| `@3 semanas atrás` | 3 semanas no passado |
| `@7d` | 7 dias no futuro (aritmética simples) |
| `@-3w` | 3 semanas no passado (aritmética simples) |
| `@+1m` | 1 mês no futuro (aritmética simples) |
| `@+2y` | 2 anos no futuro (aritmética simples) |
| `@próximo mês` | Primeiro dia do mês seguinte |
| `@último mês` | Primeiro dia do mês anterior |
| `@dia 13` | Dia 13 do mês/ano atuais |
| `@primeira segunda do mês` | Primeira segunda-feira do mês (se já passou, vai para o próximo mês) |
| `@última terça do mês` | Última terça-feira do mês (se já passou, vai para o próximo mês) |
| `@primeira terça de novembro` | Primeira terça-feira de novembro (se já passou, vai para o próximo ano) |
| `@última sexta de setembro` | Última sexta-feira de setembro (se já passou, vai para o próximo ano) |
| `@fim de janeiro` | Último dia de janeiro |
| `@meados de março` | 15 de março |
| `@natal` | 25 de dezembro |
| `@1º` | Primeiro dia do mês (ordinal PT limitado) |

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
