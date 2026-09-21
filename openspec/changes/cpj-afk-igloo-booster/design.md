# Design Técnico: CPJ Igloo Likes AFK Booster

## 1. Arquitetura do Sistema

Para permitir que o jogador continue utilizando o computador sem travamentos ou perda de foco do mouse/teclado, a solução é projetada como uma injeção de script de cliente (**Userscript / Extensão Web**) no ambiente de execução do Club Penguin Journey (`play.cpjourney.net`).

```
┌────────────────────────────────────────────────────────────────────────┐
│                          NAVEGADOR (CPJ TAB)                           │
│                                                                        │
│   ┌───────────────────────────┐      ┌──────────────────────────────┐  │
│   │     Motor do Jogo CPJ     │      │   Igloo Booster Controller   │  │
│   │  (Engine / Canvas / WS)   │      │   (Userscript em Background) │  │
│   └─────────────┬─────────────┘      └──────────────┬───────────────┘  │
│                 │                                   │                  │
│                 │◀─────── Disparo de Tecla 'D' ─────┤ (Apenas 1x)      │
│                 │◀─────── Envio de Chat (7-9s) ─────┤ (4 Frases Likes) │
│                 │                                   │                  │
│                 ├─────── Estado da Sala ───────────▶│ (Welcome Room)   │
│                 └─────── Evento de Like (WS) ──────▶│ (Atualiza contador)│
│                                                     │                  │
│                                                     ▼                  │
│                                      ┌──────────────────────────────┐  │
│                                      │    Interface Club Penguin    │  │
│                                      │ (Modal Blue CP, Zero Emojis) │  │
│                                      └──────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Componentes e Decisões Técnicas

### 2.1 Execução Real em Segundo Plano (Sem Perda de Foco)
- **Problema de Throttling do Navegador:** Abas em segundo plano costumam ter timers (`setInterval`) desacelerados pelo navegador.
- **Solução:** Utilização de **Web Worker Timer** (ou `AudioContext` keepalive), garantindo que os disparos a cada 7-9 segundos ocorram com precisão mesmo com a aba minimizada ou em segundo plano.
- **Emissão de Eventos:** O script despacha eventos de teclado sintéticos (`KeyboardEvent`) diretamente no canvas/documento do jogo e utiliza o manipulador nativo de chat do cliente CPJ, sem mover o cursor do mouse do Windows.

### 2.2 Detecção da Welcome Room & Ação Única de Dança
- O script identifica a presença na Welcome Room por meio do identificador de sala do cliente (`world.room` / `room.id` ou verificação do cenário ativo).
- Ao confirmar a entrada na Welcome Room, o script envia um único evento de tecla `'D'` (keyCode 68) para ativar a dança perpétua.
- Se o pinguim sair da sala por qualquer motivo, o bot pausa a divulgação e aguarda o retorno.

### 2.3 Rotação de Mensagens (Foco Exclusivo em Likes)
As 4 frases configuradas por padrão têm foco 100% em likes (sem menção a festas):
1. `"Igloo liking! Help me reach one k! Thanks for your support"`
2. `"Drop a like at my igloo if you have a second! Much appreciated!"`
3. `"Working on my igloo likes goal! Any like helps a lot!"`
4. `"Please visit my igloo and leave a like! Thank you so much!"`

- **Intervalo:** 7000ms a 9000ms com variação aleatória (*jitter*) para evitar detecção de flood.
- **Rotatividade:** Sequencial ou aleatória sem repetição imediata.

### 2.4 Contador de Likes e Meta Dinâmica
- **Likes Iniciais:** 734 (editável na interface).
- **Meta Padrão:** 1.000 likes (editável na interface para qualquer valor, ex: 1.500).
- **Cálculo da Porcentagem:**
  $$\text{Porcentagem} = \left(\frac{\text{Likes Atuais}}{\text{Meta}}\right) \times 100$$
  Formatado com 2 casas decimais e leading zeros: `00.00%` (ex: `73.40%` ou `08.50%`).
- **Barra de Progresso:** Atualização suave de largura (`transition: width 0.3s ease-out`).
- **Persistência:** Dados salvos em `localStorage` para manter o progresso ao recarregar a página.

---

## 3. Especificação Visual (Estilo Club Penguin Nativo)

Conforme os arquivos de referência (`design/image.png` e `design/image_2.png`):

### Diretriz Estrita: ZERO Emojis
Nenhum emoji unicode será utilizado na interface. Toda a iconografia será renderizada via **vetores SVG customizados** extraídos diretamente do estilo do jogo:
- **Ícone do Iglu:** Casa de gelo com telhado clássico amarelo e porta arqueada (baseado na HUD do CP).
- **Botão Fechar:** Círculo azul com borda ciano e "X" branco chanfrado (`design/image.png`).
- **Botão Maximizar/Minimizar:** Ícone quadrado estilizado com cantos chanfrados.
- **Checkmarks:** Caixas amarelas com marca de seleção preta grossa, idênticas ao menu de *Settings*.

### Paleta de Cores e Estilo
- **Fundo da Janela:** Gradiente linear azul `#0096e6` para `#0077be`.
- **Bordas:** `3px solid #00ffff` / `#50d0ff` com raio de `14px`.
- **Botões de Ação:** Chanfro 3D (`box-shadow: inset 0 2px 0 #50d0ff, 0 4px 0 #004477`), efeito de clique (`active`).
- **Tipografia:** Família inspirada na Burbank Small / CCAction (font-weight bold, contorno escuro e drop shadow no título principal).
- **Barra de Progresso:** Pílula azul escuro profunda com preenchimento em ciano brilhante (`#00e1ff`).
