# Pokémon Arena

Jogo de estratégia por turnos com equipes de **3 Pokémon contra 3 Pokémon**, inspirado nas mecânicas de combate tático do Soul Arena. O projeto é uma experiência independente de fã, com interface em português e foco em decisões de equipe, administração de energia e efeitos de status.

> **Status:** protótipo em desenvolvimento (Alpha). O motor de batalha possui testes automatizados de custos, IA, status e missões. Modos online, persistência por conta e testes visuais de navegador ainda não estão concluídos.

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
| Energia física (F) | Recurso para habilidades físicas |
| Energia especial (E) | Recurso para habilidades especiais |
| Energia técnica (T) | Recurso para habilidades técnicas |
| Energia vital (V) | Recurso adicional para custos coringa |
| Custo coringa (A, preto) | Pode ser pago com qualquer energia disponível; não constitui uma reserva separada |

**Efeitos implementados:** sono e atordoamento (perda de ação), veneno e queimadura (-5 HP por turno), enfraquecimento (próximo dano reduzido à metade), escudo absorvível, Esquiva universal (invulnerabilidade durante a rodada inteira), remoção de energia adversária sem transferência (Mordida de Ekans), Sobrecarga (+1 energia coringa na próxima ação, aplicada por Choque do Trovão de Pikachu) e remoção de efeitos negativos por Casco Duro.

A IA recebe um orçamento independente de três energias por rodada, utiliza o mesmo cálculo de custos do jogador, respeita sono, atordoamento e Sobrecarga, e pode optar por defesa. Ataques em área respeitam invulnerabilidade. Casco Duro acumula no máximo 50 pontos de escudo.

**Ainda não implementados:** condição Molhado, escudo indestrutível e regras avançadas de prioridade/recarga. Esses efeitos não devem ser anunciados como funcionais na interface.

### Balanceamento dos iniciais (valores implementados)

**Regra global:** habilidades ofensivas usam exclusivamente valores de dano em múltiplos de 5 (5, 10, 15, 20, 25 etc.). Reduções por enfraquecimento também são arredondadas para múltiplos de 5. A Mordida de Ekans remove uma energia adversária sem acrescentá-la ao atacante.

| Pokémon | Habilidade | Dano | Custo / efeito |
| --- | --- | --- | --- |
| Bulbasaur | Investida | 25 | Ataque físico |
| Bulbasaur | Raio Solar | 60 | 2 energias técnicas |
| Bulbasaur | Pó de Sono | 15 em todos os inimigos | Aplica sono após um turno, durante um turno |
| Bulbasaur | Chicote de Vinha | 35 | 1 física + 1 aleatória |
| Squirtle | Investida | 25 | Ataque físico |
| Squirtle | Casco Duro | — | 25 de escudo absorvível, máximo 50; remove status negativos |
| Squirtle | Jato d’Água | 25 | 1 energia especial |
| Squirtle | Hidro Bomba | 35 | 2 energias especiais |
| Charmander | Investida | 25 | Ataque físico |

Charmander utiliza Lança-Chamas (25 de dano, 1 energia especial) e pode aplicar queimadura. A habilidade Investida dos três iniciais causa 25 de dano.

**Evoluções desbloqueáveis:** Charmeleon (Lança-Chamas 30), Wartortle (Hidro Bomba 40) e Ivysaur (Raio Solar 65). Os golpes ofensivos equivalentes recebem um ganho de aproximadamente 5 pontos de dano sem reduzir o custo de energia.

**Esquiva:** Pokémon com três golpes próprios possuem Esquiva como quarta habilidade. Pokémon com quatro golpes próprios têm a mesma ação defensiva disponível separadamente durante a batalha, preservando os quatro golpes exibidos.

## Estrutura do projeto

```text
.
├── index.html       # Entrada do jogo e interface de batalha
├── home.css         # Estilos da tela inicial
├── home.js          # Seleção de Pokémon e detalhes de habilidades
├── missions.html    # Página de missões e resgate
├── progression.js   # Vitórias, derrotas e desbloqueios locais
├── tests/           # Testes automatizados com Node.js
├── .github/workflows/validate-skills.yml # CI de habilidades
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

## Testes automatizados

Com Node.js 22 ou superior:

```bash
node --test tests/*.test.mjs
```

A suíte cobre regras dos iniciais, ganhos das evoluções, custos coringa, Sobrecarga, remoção de energia, invulnerabilidade, escudos, efeitos em área, IA com orçamento próprio e a sequência de três vitórias para resgatar Pokémon. O workflow `Validate Pokemon Skills` executa esses testes em alterações relevantes.

## Missões e desbloqueios

Cada uma das três missões exige três vitórias consecutivas. O resgate desbloqueia um Pokémon e consome a sequência, exigindo novas três vitórias para o próximo. O progresso é salvo no `localStorage` do navegador e **não** sincroniza entre contas ou dispositivos.

## Próximas etapas

- Testar visualmente desktop/mobile e partidas completas em navegador real.
- Sincronizar progresso e desbloqueios com contas de usuário.
- Implementar modos online e a condição Molhado, se aprovada para o balanceamento.
- Expandir cenários de IA e medir taxa de vitórias para ajustar personagens.

## Referências e créditos

O [Soul Arena — Character Guide](https://soularenableach.fandom.com/wiki/Character_Guide) é uma referência de design de combate, **não o nome deste projeto**.

Pokémon e suas marcas pertencem aos respectivos titulares. Este é um projeto de fã, não oficial, sem afiliação com Nintendo, Game Freak ou The Pokémon Company.

**Repositório:** https://github.com/lenixeduardo/narutoarena
