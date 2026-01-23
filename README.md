# Datas em Linguagem Natural para Obsidian

Insira datas e crie links para suas notas diárias usando linguagem natural em **português brasileiro**.

> **Aviso:** Este é um fork pessoal do plugin [Natural Language Dates](https://github.com/argenos/nldates-obsidian), criado por [Argentina Ortega Sainz](https://argentinaos.com/). Agradeço imensamente à autora pelo excelente trabalho original que tornou este fork possível.
>
> **Este fork não tem suporte oficial.** Foi criado para uso pessoal e não pretendo mantê-lo como uma extensão pública. Use por sua conta e risco.

## Por que este fork?

O plugin original funciona muito bem em inglês, mas não oferece suporte nativo para português. Como uso o Obsidian principalmente em português, criei este fork para:

- Interpretar datas em linguagem natural em **português brasileiro**
- Manter o inglês como fallback para compatibilidade
- Adicionar expressões idiomáticas brasileiras para datas

## Funcionalidades

### Expressões suportadas em português

| Entrada | Resultado |
|---------|-----------|
| `@hoje` | Data de hoje |
| `@amanhã` | Data de amanhã |
| `@ontem` | Data de ontem |
| `@agora` | Data e hora atual |
| `@segunda` | Próxima segunda-feira (dias sem qualificador sempre apontam para o futuro) |
| `@próxima segunda` | Próxima segunda-feira |
| `@próximo mês` | Primeiro dia do mês seguinte |
| `@próximo ano` | Primeiro dia do ano seguinte |
| `@última sexta` | Sexta-feira mais recente (pode ser essa semana) |
| `@sexta passada` | Sexta-feira da semana passada |
| `@próx segunda` | Próxima segunda-feira (shorthand) |
| `@próx sem` | Próxima semana (shorthand) |
| `@ult sexta` | Sexta-feira mais recente (shorthand) |
| `@pas domingo` | Domingo da semana passada (shorthand) |
| `@último mês` | Primeiro dia do mês anterior |
| `@em 5 dias` | 5 dias no futuro |
| `@daqui a 2 semanas` | 2 semanas no futuro |
| `@3 dias atrás` | 3 dias no passado |
| `@7d` | 7 dias no futuro (aritmética simples) |
| `@-3w` | 3 semanas no passado (aritmética simples) |
| `@+1m` | 1 mês no futuro (aritmética simples) |
| `@+2y` | 2 anos no futuro (aritmética simples) |
| `@fim de janeiro` | Último dia de janeiro |
| `@meados de março` | 15 de março |
| `@natal` | 25 de dezembro |
| `@véspera de natal` | 24 de dezembro |
| `@dia 13` | Dia 13 do mês/ano atuais |
| `@primeira segunda do mês` | Primeira segunda-feira do mês (se já passou, vai para o próximo mês) |
| `@última segunda do mês` | Última segunda-feira do mês (se já passou, vai para o próximo mês) |
| `@primeira terça de novembro` | Primeira terça-feira de novembro (se já passou, vai para o próximo ano) |
| `@última sexta de setembro` | Última sexta-feira de setembro (se já passou, vai para o próximo ano) |

### Dias da semana sem qualificador

Ao digitar apenas o nome do dia (ex: `@segunda`, `@sexta`), o plugin sempre retorna a **próxima ocorrência** desse dia:

- Se o dia ainda não passou essa semana, retorna essa semana
- Se o dia já passou ou é hoje, retorna a próxima semana

### Distinção entre "última" e "passada"

- **"última X"** → a ocorrência mais recente desse dia (pode ser essa semana, se já passou)
- **"X passada"** → sempre da semana anterior

Exemplo (considerando hoje como quinta-feira, 23/01):
- `@segunda` → 27/01 (próxima segunda)
- `@última segunda` → 20/01 (segunda dessa semana, que já passou)
- `@segunda passada` → 13/01 (semana passada)

### Shorthands para PT-BR

| Shorthand | Equivale a |
|-----------|------------|
| `próx` ou `prox` | `próxima/próximo` |
| `ult` | `última/último` |
| `pas` | `passada/passado` |
| `sem` | `semana` |
| `seg` | `segunda` |
| `ter` | `terça` |
| `qua` | `quarta` |
| `qui` | `quinta` |
| `sex` | `sexta` |
| `sab` ou `sáb` | `sábado` |
| `dom` | `domingo` |

Exemplos:
- `@próx seg` → próxima segunda-feira
- `@próx sem` → próxima semana
- `@ult sexta` → sexta-feira mais recente
- `@pas domingo` → domingo da semana passada

### Aritmética simples

Você pode somar ou subtrair períodos com:
- `@7d` (equivale a `@+7d`)
- `@-3w`
- `@+1m`
- `@+2y`

O modal de sugestão exibe uma pré-visualização da data calculada para esses formatos.

### Ordinais em português (limitado)

Por padrão, só aceitamos ordinais para o primeiro dia do mês:
- `@primeiro` / `@primeira`
- `@1º` / `@1ª` / `@1o`

### Fallback para inglês

Todas as expressões em inglês do plugin original continuam funcionando:
- `@today`, `@tomorrow`, `@yesterday`
- `@next week`, `@last friday`
- `@in 5 days`, `@2 weeks ago`

## Comandos

O plugin oferece os seguintes comandos (acessíveis via `Cmd/Ctrl + P`):

| Comando | Descrição |
|---------|-----------|
| **Ir para nota diária** | Abre um modal para navegar para uma nota diária usando linguagem natural. Use `Cmd/Ctrl + Enter` para abrir em nova aba. |
| **Interpretar data em linguagem natural** | Converte texto selecionado em wikilink de data |
| **Interpretar data (como link)** | Converte texto selecionado em link markdown |
| **Interpretar data (como texto)** | Converte texto selecionado em texto simples |
| **Seletor de datas** | Abre modal para inserir data com opções de formatação |
| **Inserir data atual** | Insere a data de hoje |
| **Inserir hora atual** | Insere a hora atual |
| **Inserir data e hora atuais** | Insere data e hora atuais |

### Ir para nota diária

O comando "Ir para nota diária" permite navegar rapidamente para qualquer nota diária usando linguagem natural:

1. Abra a paleta de comandos (`Cmd/Ctrl + P`)
2. Digite "Ir para nota diária"
3. No modal, digite a data em linguagem natural (ex: "ontem", "próxima segunda", "15/01")
4. Pressione Enter para confirmar

**Atalhos de abertura:**
- `Enter` → abre na aba atual
- `Cmd/Ctrl + Enter` → abre em nova aba
- `Cmd/Ctrl + Alt + Enter` → abre em grupo à direita (split view)

A nota diária será criada automaticamente se não existir, usando o template e pasta configurados no plugin "Daily Notes" do Obsidian.

## Instalação

### Manual

1. Baixe os arquivos `main.js` e `manifest.json`
2. Crie a pasta `datas-em-linguagem-natural` em `<seu-vault>/.obsidian/plugins/`
3. Copie os arquivos para essa pasta
4. Reinicie o Obsidian
5. Ative o plugin em Configurações → Plugins da comunidade

## Configuração

| Configuração | Descrição | Padrão |
|--------------|-----------|--------|
| Formato da data | Formato de saída para datas | `YYYY-MM-DD` |
| Formato da hora | Formato de saída para horas | `HH:mm` |
| Frase gatilho | Caractere(s) para abrir o autosuggest | `@` |
| Inserir como link? | Datas inseridas como wikilinks | Sim |

## Créditos

- **Plugin original:** [Natural Language Dates](https://github.com/argenos/nldates-obsidian) por [Argentina Ortega Sainz](https://argentinaos.com/)
- **Biblioteca de parsing:** [chrono-node](https://github.com/wanasit/chrono) por Wanasit Tanakitrungruang
- **Fork do chrono:** [liamcain/chrono](https://github.com/liamcain/chrono) com suporte a português

## Licença

MIT (mesma licença do plugin original)
