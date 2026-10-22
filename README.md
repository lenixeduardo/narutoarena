# Pokémon Arena

Jogo de estratégia por turnos com equipes de **3 Pokémon contra 3 Pokémon**, inspirado nas mecânicas de combate tático do Soul Arena. O projeto é uma experiência independente de fã, com interface em português e foco em decisões de equipe, administração de energia e efeitos de status.

> **Status:** protótipo em desenvolvimento (Alpha). Algumas mecânicas descritas abaixo fazem parte do planejamento de balanceamento e ainda precisam ser validadas no motor de batalha.

## Visão geral

- Formação de equipes com três Pokémon e seleção por toque ou arrastar e soltar.
- Combate contra o computador, com habilidades ofensivas, defensivas e de suporte.
- Visualização das quatro habilidades de cada Pokémon, com descrições e custos.
- Modos de jogo apresentados na interface: Survival, Ladder, Quick Game e Private Game. A presença de um botão não garante que o modo esteja completo.
- Página de missões dedicada (`missions.html`).
- Interface responsiva com foco em desktop e mobile.
- Pokémon adicionais podem aparecer bloqueados enquanto não estão disponíveis para seleção.

## Sistema de combate

Cada Pokémon possui quatro habilidades. As habilidades podem causar dano, conceder defesa, aplicar condições de status ou modificar a economia de energia.

| Recurso | Significado |
| --- | --- |
| Energia física | Recurso para habilidades físicas |
| Energia técnica | Recurso para habilidades técnicas |
| Custo aleatório (preto) | Pode ser pago com qualquer uma das energias disponíveis; não é uma terceira reserva |

**Efeitos previstos para o motor de combate:** atordoamento, sono, roubo de energia, aumento de custo, invulnerabilidade, defesa destrutível/indestrutível, dano contínuo, queimadura, envenenamento e Molhado. A ordem de resolução deve validar impedimentos e custos, aplicar defesas antes do dano à vida e atualizar os efeitos no fim do turno.

### Balanceamento dos iniciais (especificação)

| Pokémon | Habilidade | Dano | Custo / efeito |
| --- | --- | --- | --- |
| Bulbasaur | Investida | 25 | Ataque físico |
| Bulbasaur | Raio Solar | 60 | 2 energias técnicas |
| Bulbasaur | Pó de Sono | 15 em todos os inimigos | Aplica sono após um turno, durante um turno |
| Bulbasaur | Chicote de Vinha | 35 | 1 física + 1 aleatória |
| Squirtle | Investida | 25 | Ataque físico |
| Squirtle | Casco Duro | — | Concede 25 de defesa indestrutível, absorvida antes da vida |
| Squirtle | Jato de Água | 20 | Aplica Molhado |
| Squirtle | Hidro Bomba | 40 | Ataque técnico |
| Charmander | Investida | 25 | Ataque físico |

Enquanto Molhado estiver ativo, habilidades ofensivas do Squirtle causam **+5 de dano**. Custos ainda não aprovados e outras habilidades de Charmander devem ser confirmados antes de se tornarem regras definitivas.

## Estrutura do projeto

```text
.
├── index.html       # Entrada do jogo e interface de batalha
├── home.css         # Estilos da tela inicial
├── home.js          # Seleção de Pokémon e detalhes de habilidades
├── missions.html    # Página de missões
├── assets/          # Recursos visuais
└── README.md
```

## Executar localmente

O protótipo utiliza HTML, CSS e JavaScript e não exige backend para abrir a interface.

1. Clone o repositório: `git clone https://github.com/lenixeduardo/narutoarena.git`.
2. Entre na pasta: `cd narutoarena`.
3. Sirva os arquivos com um servidor estático, por exemplo: `python -m http.server 8000`.
4. Abra `http://localhost:8000`.

Para testar em dispositivos móveis, publique em um endereço HTTPS. A execução direta pelo visualizador de arquivos do celular pode restringir recursos do navegador.

## Próximas etapas

- Integrar e testar o balanceamento dos Pokémon iniciais.
- Centralizar o catálogo de efeitos e a resolução de turnos.
- Validar custos, duração, recargas e imunidades.
- Exibir energias e descrições completas nos tooltips.
- Testar fluxos desktop/mobile e os modos de jogo.

## Referências e créditos

O [Soul Arena — Character Guide](https://soularenableach.fandom.com/wiki/Character_Guide) é uma referência de design de combate, **não o nome deste projeto**.

Pokémon e suas marcas pertencem aos respectivos titulares. Este é um projeto de fã, não oficial, sem afiliação com Nintendo, Game Freak ou The Pokémon Company.

**Repositório:** https://github.com/lenixeduardo/narutoarena
