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
| `@próxima segunda` | Próxima segunda-feira |
| `@próximo mês` | Primeiro dia do mês seguinte |
| `@próximo ano` | Primeiro dia do ano seguinte |
| `@última sexta` | Sexta-feira mais recente (pode ser essa semana) |
| `@sexta passada` | Sexta-feira da semana passada |
| `@último mês` | Primeiro dia do mês anterior |
| `@em 5 dias` | 5 dias no futuro |
| `@daqui a 2 semanas` | 2 semanas no futuro |
| `@3 dias atrás` | 3 dias no passado |
| `@fim de janeiro` | Último dia de janeiro |
| `@meados de março` | 15 de março |
| `@natal` | 25 de dezembro |
| `@véspera de natal` | 24 de dezembro |

### Distinção entre "última" e "passada"

- **"última X"** → a ocorrência mais recente desse dia (pode ser essa semana, se já passou)
- **"X passada"** → sempre da semana anterior

Exemplo (considerando hoje como terça-feira, 21/01):
- `@última segunda` → 20/01 (ontem)
- `@segunda passada` → 13/01 (semana passada)

### Fallback para inglês

Todas as expressões em inglês do plugin original continuam funcionando:
- `@today`, `@tomorrow`, `@yesterday`
- `@next week`, `@last friday`
- `@in 5 days`, `@2 weeks ago`

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
