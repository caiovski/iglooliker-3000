# Tarefas de Implementação: CPJ Igloo Likes AFK Booster

## 1. Estrutura e Fundação
- [x] 1.1 Criar a estrutura base do projeto na pasta `afk/cpj/` (scripts, estilos e manifest/userscript header).
- [x] 1.2 Configurar o sistema de persistência local (`localStorage`) para salvar meta e lista de frases.

## 2. Motor de Automação em Segundo Plano
- [x] 2.1 Implementar timer em Web Worker (ou mecanismo keepalive) para garantir execução pontual a cada 7-9 segundos com a aba em segundo plano.
- [x] 2.2 Implementar detector de sala para verificar se o pinguim está na Welcome Room.
- [x] 2.3 Implementar trigger da dança (`D`) acionado exatamente uma vez após confirmar presença na Welcome Room.
- [x] 2.4 Implementar sistema de envio de mensagens com rotação das 4 frases exclusivas de likes (sem menção a festas) e variação aleatória de intervalo.

## 3. Lógica do Contador de Likes e Meta Dinâmica
- [x] 3.1 Implementar exibição dinâmica de likes detectados da conta e campo editável para `Meta`.
- [x] 3.2 Implementar cálculo da porcentagem com formatação estrita de duas casas decimais (`00.00%`).
- [x] 3.3 Implementar barra de progresso reativa com animação suave e ajuste automático ao alterar a meta.

## 4. Interface Club Penguin (Zero Emojis)
- [x] 4.1 Construir a janela modal azul com bordas ciano arredondadas inspirada em `design/image.png`.
- [x] 4.2 Criar componentes visuais fiéis: botões chanfrados 3D, caixas de seleção amarelas com checkmark e cabeçalho com sombra.
- [x] 4.3 Desenhar e incorporar os ícones vetoriais SVG oficiais do CP (ícone de iglu da HUD `image_2.png`, botão de fechar circular `X`, botão de expandir), garantindo **zero emojis**.
- [x] 4.4 Implementar controles de ativação: botões `Ligar Bot`, `Pausar Bot` e indicador de status.

## 5. Empacotamento e Validação
- [x] 5.1 Empacotar o script completo como Userscript pronto para instalação via Tampermonkey / Violentmonkey.
- [x] 5.2 Testar a execução em segundo plano (minimizando ou trocando de aba no navegador).
- [x] 5.3 Validar a não interferência no mouse e teclado do sistema operacional.

## 6. Refatoração e Ajustes de Arquitetura (opsx-build)
- [x] 6.1 Detecção dinâmica dos likes do pinguim em tempo real (sem hardcode de número inicial).
- [x] 6.2 Campo de meta em texto limpo sem setinhas/spinners e validação com aviso de meta já batida.
- [x] 6.3 Interface iniciando oculta (apenas launcher redondo do iglu visível até o usuário clicar ou apertar F9).
- [x] 6.4 Arraste livre em 2D (X e Y) em qualquer canto da tela.
- [x] 6.5 Modularização e refatoração estrita de todos os arquivos para menos de 250 linhas (opsx-build).
- [x] 6.6 Envio nativo de chat pelo cliente Yukon / Phaser (sem WebSocket cru, zero risco de desconexão).

## 7. Refinamento de Operação e Identidade (IglooLiker 3000)
- [x] 7.1 Renomear o bot para `IglooLiker 3000` no cabeçalho e substituir "Welcome Room" na status bar pela nova identidade.
- [x] 7.2 Restaurar botão único em largura total (100%) alternando entre `▶ LIGAR BOT` (azul) e `■ PAUSAR BOT` (vermelho) conforme print 3.
- [x] 7.3 Tornar o bot universal em todas as salas do CPJ (remover restrição exclusiva da Welcome Room).
- [x] 7.4 Implementar colagem de texto via `execCommand('insertText')` e `InputEvent` (estilo Ctrl+V) + tecla Enter no input do chat, garantindo zero risco de desconexão.
- [x] 7.5 Implementar disparo multi-alvo de Enter com delay (120ms), keyCode 13 fixado e aumentar intervalo anti-spam para 9-11 segundos.
- [x] 7.6 Corrigir fluxo rigoroso de envio de mensagens: cópia para clipboard (Ctrl+C), seleção precisa do chat do CPJ (`input[autocomplete="new-password"]`), colagem (Ctrl+V) e disparo imediato/sincronizado de Enter e botão de envio.
- [x] 7.7 Atualizar as 4 frases de likes para mencionar explicitamente a meta de 1k por extenso ("one k") sem usar dígitos numéricos (bypassa filtros de spam do CPJ).

