# Como preencher a planilha de painéis

Use o arquivo `painels-template.csv` para cadastrar novos painéis no Hub.

## Como abrir

1. Abra o arquivo `painels-template.csv` no Excel ou no Google Planilhas.
2. Preencha as linhas em branco ou edite as existentes.
3. Salve novamente como `.csv` (CSV UTF-8, delimitado por vírgula).

## Colunas

| Coluna | O que colocar | Exemplo |
|---|---|---|
| `id` | Identificador único. Use letras minúsculas, números e hífen. Sem espaços e sem acentos. | `painel-ft` |
| `title` | Nome do painel que vai aparecer no card. | `[GCAP] Painel FT` |
| `category` | Categoria do painel. Pode ser uma nova ou uma já existente. | `Gerencial` |
| `description` | Descrição curta do painel. | `Visão gerencial do painel FT.` |
| `icon` | Nome do ícone do card. Opções disponíveis abaixo. | `chart-bar` |
| `originalUrl` | Link original do Power BI (o mesmo link que você usa para abrir o BI). | `https://app.powerbi.com/groups/...` |

## Ícones disponíveis

- `chart-bar`
- `chart-pie`
- `chart-line`
- `chart-area`
- `briefcase`
- `truck`
- `users`
- `folder`

## Categorias que já existem no site

- Gerencial
- Esporte
- Ciclos
- Planejamento
- Equipe
- Categoria 1
- Categoria 2
- Categoria 3
- Categoria 4

Você pode criar novas categorias bastando escrever o nome novo na coluna `category`.

## Importante

- Não apague a primeira linha com os nomes das colunas (`id,title,category,description,icon,originalUrl`).
- Não deixe linhas em branco entre painéis preenchidos.
- O `originalUrl` é obrigatório. O site extrai automaticamente o `reportId` e o `ctid` dele.
- Se quiser remover um painel, basta apagar a linha toda.

## Depois de preencher

Depois que a planilha estiver pronta, envie para quem atualiza o site. O arquivo `panels.json` será gerado a partir dessa planilha.

## Dica

Para pegar o link original do Power BI:

1. Abra o painel no Power BI.
2. Copie a URL do navegador.
3. Cole na coluna `originalUrl`.

Não precisa do link de embed (iframe). O site gera o embed automaticamente a partir do link original.
