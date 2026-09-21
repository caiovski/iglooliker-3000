# Proposta: CPJ Igloo Likes AFK Booster

## 1. Motivação e Contexto
No Club Penguin Journey (CPJ), os jogadores buscam atingir marcos de curtidas (likes) em seus iglus (como a meta de 1.000 likes). Divulgar o iglu manualmente na sala de maior tráfego (*Welcome Room*) consome tempo e exige que o jogador permaneça preso à janela do jogo, enviando mensagens repetitivas a cada poucos segundos.

Esta proposta define uma ferramenta de automação em segundo plano (background booster) que opera diretamente no navegador, permitindo que o usuário continue utilizando o computador normalmente para outras tarefas, sem interferência de mouse ou teclado.

## 2. Escopo da Solução
- **Detecção da Welcome Room:** O sistema verifica se o pinguim está na Welcome Room antes de disparar as ações.
- **Ação Inicial:** Executa o emote de dança (`D`) uma única vez ao confirmar presença na sala.
- **Divulgação Automática no Chat:**
  - Intervalo de disparo entre 7 e 9 segundos (com jitter anti-spam).
  - Rotação inteligente entre 4 mensagens focadas **exclusivamente em likes** (sem menções a festas).
- **Contador de Likes & Meta Customizável:**
  - Exibição dos likes atuais (iniciando em 734) e meta configurável pelo usuário (ex: 1.000, 1.500).
  - Cálculo de porcentagem com duas casas decimais no formato `00.00%` (ex: `73.40%`).
  - Barra de progresso reativa no estilo Club Penguin.
- **Operação em Segundo Plano:**
  - Injeção direta no contexto do jogo (Userscript / Browser Script), permitindo que o navegador fique minimizado ou em outra aba sem roubar o foco do sistema operacional.
- **Interface Gráfica Temática:**
  - Baseada nos componentes originais do Club Penguin (`design/image.png` e `design/image_2.png`).
  - **Zero emojis**: uso exclusivo de ícones vetoriais/SVG e sprites fiéis à estética do jogo (como o ícone de iglu da HUD e botões chanfrados em relevo 3D).

## 3. Não-Objetivos (Out of Scope)
- O programa **não** irá interagir via macros de teclado/mouse no nível do Windows (PyAutoGUI), pois isso impediria o uso do computador em segundo plano.
- O programa **não** utilizará emojis em botões, títulos ou status.
- O programa **não** promoverá festas ou eventos sociais; o foco das mensagens é estritamente a coleta de likes no iglu.
