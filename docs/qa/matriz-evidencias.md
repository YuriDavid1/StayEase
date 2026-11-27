# Matriz de evidências de QA — Etapa 3

Registro da execução dos cenários de teste T01–T16 definidos no relatório técnico da Etapa 3
(*StayEase — Análise de Integração e Manutenções*, seção 7), no formato pedido na seção 7.1.

| Item | Valor |
|---|---|
| Responsável QA | João Bagatoli |
| Data da execução | 26/11/2026 |
| Branch | `test/qa-etapa3` |
| Base | `e8612ff` (merge do PR #1 em `main`, sincronizado com `dev`) |
| Ambiente | Windows 11, .NET SDK 10.0.400-preview, Node 22.17.1 |
| Banco nos testes | EF Core InMemory (**não** valida transações nem concorrência do PostgreSQL) |

## 1. Resumo

| Suíte | Total | Aprovados | Falhos | Ignorados (defeito conhecido) |
|---|---|---|---|---|
| Backend `dotnet test` | 280 | 274 | 0 | 6 |
| Frontend `npm test` | 39 | 38 | 0 | 1 |

| Situação | Cenários |
|---|---|
| ✅ Aprovado | T12, T15 |
| 🟡 Aprovado com ressalva | T13, T14 |
| ❌ Falha reproduzida (teste pronto, aguardando correção) | T01, T02, T03, T04, T05, T09 |
| ⏳ Não executado | T06, T07, T08, T10, T11, T16 |

## 2. Achados desta rodada

Além do que o relatório já previa:

1. **As 5 falhas do item M06 já existiam antes do PR #1.** O `origin/dev` anterior ao PR tinha 60 aprovados e 5 falhos nos mesmos testes. A causa era nos dados de teste (reservas sem quarto e hóspede, descartadas pelo `Include`), não na API. Corrigido em `a57ca66`.
2. **Dois testes passavam sem testar nada.** `ReservaCancelada_NaoDeveAparecerNasReservasAtivas` e `ReservaComCheckOut_NaoDeveAparecerNasReservasAtivas` esperavam lista vazia e a lista vinha sempre vazia pelo mesmo motivo. Corrigido em `a57ca66`.
3. **`dev` estava desatualizado em relação ao `main`.** O PR #1 entrou em `main` pelo PR #8 e não voltou para `dev`, quebrando o fluxo feature → dev → main. `origin/dev` foi atualizado por fast-forward até `e8612ff`. Não existe CI que detecte esse tipo de divergência.
4. **R01 e R02 deixam de ser inferidos: foram reproduzidos em execução** (T01–T04).
5. **R06 é mais grave do que o relatório indicava.** Depois de marcar manualmente como Livre um quarto ocupado, um segundo hóspede consegue fazer check-in no mesmo quarto: **dupla ocupação** (T09). Sugestão: subir a severidade de ALTA para CRÍTICA.
6. **Leituras de reservas sem regra de perfil.** Todos os `GET /api/reservations*` exigem apenas usuário autenticado, então Governança também lê reservas e dados de todos os hóspedes. Ver decisões pendentes na seção 4.
7. **`npm audit`: 8 vulnerabilidades (5 altas, 3 moderadas)** em `brace-expansion`, `follow-redirects`, `minimatch`, `source-map-js`, `vite` e `zod`. Todas já existiam antes desta rodada (item P2 do relatório).
8. **ESLint: 10 apontamentos** (7 erros, 3 avisos), os mesmos registrados no PR. Os arquivos de teste novos não têm apontamentos.

## 3. Cenários

Status: ✅ aprovado · 🟡 aprovado com ressalva · ❌ falha reproduzida · ⏳ não executado.

| ID | Cenário | Status | Evidência | Commit | Responsável pela próxima ação |
|---|---|---|---|---|---|
| T01 | Guest lista hóspedes | ❌ | `GuestOwnershipTests.T01_*` | `149086d` | Backend (M07) |
| T02 | Guest lê reservas de terceiros | ❌ | `GuestOwnershipTests.T02_*` | `149086d` | Backend (M07) |
| T03 | Guest cria reserva com GuestId de terceiro | ❌ | `GuestOwnershipTests.T03_*` | `149086d` | Backend (M07) |
| T04 | Guest altera reserva de terceiro | ❌ | `GuestOwnershipTests.T04_*` | `149086d` | Backend (M07) |
| T05 | Dois hóspedes abrem "Minhas reservas" | ❌ | `guestsService.test.js` | `2121d06` | Backend + Frontend (M07) |
| T06 | Token de usuário rebaixado/excluído | ⏳ | — | — | QA, após decisão sobre revogação |
| T07 | 10 criações simultâneas no mesmo quarto | ⏳ | — | — | QA + DevOps (PostgreSQL) |
| T08 | 2 check-ins simultâneos no mesmo quarto | ⏳ | — | — | QA + DevOps (PostgreSQL) |
| T09 | Admin muda status de quarto manualmente | ❌ | `RoomStatusConsistencyTests` | `f45b458` | Backend (R06) |
| T10 | Quarto legado após AddRoomDailyRate | ⏳ | — | — | QA + DevOps (migration) |
| T11 | E-mails legados em caixa diferente/duplicados | ⏳ | — | — | QA + DevOps (PostgreSQL) |
| T12 | Transições inválidas de reserva | ✅ | `ReservationTransitionHttpTests` | `bdee998` | — |
| T13 | Matriz de rotas por perfil | 🟡 | `AuthorizationMatrixTests` | `9b4abdb` | PO/Requisitos (células indefinidas) |
| T14 | Sessão: F5, expiração, 401, logout | 🟡 | `authSession.test.js`, `api.test.js` | `2121d06` | QA (E2E no navegador) |
| T15 | Corrigir os 5 testes falhos (M06) | ✅ | `ReservationsControllerTests` | `a57ca66` | — |
| T16 | Migrations em cópia de dados reais | ⏳ | — | — | DevOps + QA |

### T01 — Guest lista hóspedes

- **Pré-condições:** hóspede de terceiro cadastrado (documento `DOC-TERCEIRO-777`) com reservas.
- **Perfil:** Guest, sem vínculo com o cadastro de terceiro.
- **Entrada:** `GET /api/guests`.
- **Esperado:** 403/404, ou 200 sem dados de terceiros.
- **Obtido:** 200 com o cadastro do terceiro.
- **Controle:** a Recepção vê o mesmo cadastro (`Controle_RecepcaoEnxergaOsDadosSemeados`), o que prova que os dados existem.

### T02 — Guest lê reservas de terceiros

- **Pré-condições:** as mesmas de T01.
- **Perfil:** Guest.
- **Entrada:** `GET /api/reservations`, `/all`, `/{id}`, `/guest/{guestId}` e `/room/{roomId}`.
- **Esperado:** 403/404, ou 200 sem dados de terceiros.
- **Obtido:** as 5 rotas retornam 200 com a reserva e o documento do terceiro.

### T03 — Guest cria reserva em nome de terceiro

- **Perfil:** Guest.
- **Entrada:** `POST /api/reservations` com o `GuestId` do terceiro, em quarto livre.
- **Esperado:** 403/400, sem criar reserva.
- **Obtido:** 200; a reserva é criada em nome do terceiro.

### T04 — Guest altera reserva de terceiro

- **Pré-condições:** reserva confirmada e reserva hospedada do terceiro.
- **Perfil:** Guest.
- **Entrada:** `PATCH /api/reservations/{id}/check-in`, `/check-out` e `/cancel`.
- **Esperado:** 403/404, sem alterar reserva nem quarto.
- **Obtido:** 204 nas três ações; a reserva e o quarto mudam de estado.
- **Controle:** a Recepção executa as mesmas ações com 204 (`Controle_RecepcaoConsegueExecutarAsMesmasAcoes`).

### T05 — Dois hóspedes abrem "Minhas reservas"

- **Nível executado:** unidade, no serviço do frontend. O E2E com navegador e API reais fica para depois de M07.
- **Entrada:** `fetchCurrentGuest()` com a sessão de dois usuários diferentes; a API devolve 2 hóspedes.
- **Esperado:** cada usuário recebe o próprio hóspede.
- **Obtido:** os dois recebem o hóspede de id 1 (`guests[0]`), que é o R03.
- **Afeta as telas:** `myBookin.jsx`, `bookinForm.jsx` e `userPage.jsx`.

### T09 — Alteração manual de status do quarto

- **Perfil:** Administrator.
- **Entrada:** `PUT /api/rooms/{id}` mudando apenas `Status`.
- **Esperado:** 409, com o status inalterado.
- **Obtido:** 204 em todos os casos:

  | De | Para | Resultado |
  |---|---|---|
  | Ocupado (com hóspede) | Livre | 204 |
  | Ocupado (com hóspede) | Limpeza Pendente | 204 |
  | Limpeza Pendente | Livre | 204, contorna o finish-cleaning da Governança |
  | Livre | Ocupado | 204, sem check-in |

- **Consequência:** depois de Ocupado → Livre, a Recepção faz check-in de **outra** reserva no mesmo quarto e recebe 204. Dois hóspedes ficam no mesmo quarto.
- **Controle:** editar número, tipo, capacidade e diária sem mudar o status continua funcionando.
- **Fora do escopo:** Livre → Limpeza Pendente via PUT é usado em `RoomsControllerTests.UpdateRoom_DeveAlterarTodosOsCampos`. Depende de decisão do PO.

### T12 — Transições de estado da reserva via HTTP

- **Perfil:** Receptionist.
- **Entrada:** as 3 ações aplicadas a cada um dos 4 estados da reserva (12 casos), mais as 3 ações em reserva inexistente.
- **Esperado e obtido:** iguais. Transição válida retorna 204 com o estado novo da reserva e do quarto. Transição inválida retorna 409 com `application/problem+json`, sem alterar nada. Reserva inexistente retorna 404.
- **Verificação por mutação:** ao permitir, de propósito, cancelar uma reserva hospedada, e ao fazer o check-out liberar o quarto sem limpeza, os testes correspondentes falharam.
- **Observação:** cancelar uma reserva já cancelada retorna 204, porque a API trata como idempotente. Ver seção 4.

### T13 — Matriz de rotas por perfil

- **Entrada:** 23 rotas × perfis Administrator, Receptionist, Housekeeping e Guest, mais requisição sem token (105 casos).
- **Esperado e obtido:** perfil permitido passa pela autorização, perfil não permitido recebe 403 e sem token recebe 401.
- **Proteção contra rota nova:** `Matriz_DeveCobrirTodasAsRotasDaApi` falha se uma rota nova for criada sem regra na matriz.
- **Ressalva:** 11 combinações de rota e perfil ficaram sem regra definida e fora da matriz (seção 4).

### T14 — Sessão no frontend

- **Nível executado:** unidade, em `authSession.js` e `api.js`.
- **Aprovado:**
  - sessão restaurada no F5;
  - sessão expirada, incompleta ou corrompida é descartada;
  - logout limpa a sessão;
  - token é enviado no cabeçalho;
  - 401 encerra a sessão e dispara o logout;
  - 401 no login não encerra a sessão;
  - mensagens de 403, 404, 409, 429 e 500.
- **Ressalva:** "login após troca de senha" e a navegação real (redirecionamento pelo `ProtectedRoute`) dependem de E2E. Fazer no checklist manual (seção 5) até existir Playwright.

### T15 — Testes falhos do item M06

- **Esperado:** `dotnet test` sem falhas.
- **Obtido:** antes, 142 aprovados e 5 falhos; depois de `a57ca66`, 147 aprovados e 0 falhos. Hoje a suíte tem 274 aprovados, 0 falhos e 6 ignorados.

### Não executados

| ID | Motivo | Próximo passo |
|---|---|---|
| T06 | Sem definição de como revogar tokens (lista de bloqueio, versão do usuário no token ou expiração curta). | Backend define a estratégia; QA escreve o teste HTTP. |
| T07, T08, T11 | Exigem PostgreSQL real; o InMemory não reproduz transação `Serializable` nem concorrência. | Projeto de testes com Testcontainers (exige Docker), combinado com o DevOps. |
| T10, T16 | Exigem cópia de dados reais, backup e rollback. | DevOps prepara o ambiente; QA valida as diárias e a contagem de registros antes e depois. |

## 4. Decisões pendentes (PO / Requisitos)

| # | Pergunta | Impacto |
|---|---|---|
| D1 | Governança pode ler reservas (`GET /api/reservations*`)? Se puder, quais campos do hóspede? | Hoje lê tudo, inclusive documento e contato. Define 5 células da matriz T13. |
| D2 | Hóspede pode listar hóspedes (`GET /api/guests`) ou só ver o próprio cadastro? | Define a regra de T01 após M07. |
| D3 | Cancelar reserva já cancelada deve retornar 204 (idempotente) ou 409? | Hoje retorna 204; T12 registra esse comportamento. |
| D4 | Admin pode marcar quarto Livre como Limpeza Pendente manualmente? | Define a correção do R06 e o destino de `UpdateRoom_DeveAlterarTodosOsCampos`. |
| D5 | Qual a estratégia de revogação de token ao rebaixar ou excluir usuário? | Desbloqueia T06 (R04). |

## 5. Checklist de regressão manual (smoke)

Executar em ambiente com PostgreSQL antes de cada merge em `main`. Registrar resultado, data e responsável.

| # | Perfil | Passo | Esperado | Resultado | Data | Resp. |
|---|---|---|---|---|---|---|
| S01 | — | Abrir o sistema sem sessão e acessar `/homeAdm` | Redireciona para o login | | | |
| S02 | Cada perfil | Login com credenciais válidas | Vai para a área do perfil (`/homeAdm` ou `/user`) | | | |
| S03 | — | Login com senha errada 11 vezes em 1 minuto | Mensagem de erro e depois "Muitas tentativas" | | | |
| S04 | Qualquer | Recarregar a página (F5) | Continua logado na mesma tela | | | |
| S05 | Qualquer | Logout | Volta ao login; F5 não restaura a sessão | | | |
| S06 | Qualquer | Esperar a expiração do token (ou apagá-lo) e navegar | Mensagem "Sua sessão expirou" e volta ao login | | | |
| S07 | Admin | Trocar a senha de um usuário e fazer login com a senha antiga e a nova | A antiga falha e a nova funciona | | | |
| S08 | Admin | Cadastrar, editar e excluir quarto, conferindo a diária | Diária persistida após F5 | | | |
| S09 | Admin | Excluir quarto ou hóspede com reserva | Bloqueado com mensagem | | | |
| S10 | Recepção | Cadastrar, editar e buscar hóspede | Dados corretos na lista | | | |
| S11 | Recepção | Criar reserva válida | Aparece em agendamentos | | | |
| S12 | Recepção | Criar reserva sobreposta no mesmo quarto | Bloqueada com mensagem | | | |
| S13 | Recepção | Check-in | Reserva Hospedada; quarto Ocupado | | | |
| S14 | Recepção | Check-out | Reserva Finalizada; quarto Limpeza Pendente | | | |
| S15 | Governança | Concluir limpeza (dashboard e tela de quartos) | Quarto Livre nas duas telas | | | |
| S16 | Recepção | Cancelar reserva confirmada e depois tentar check-in | Cancelamento ok; check-in bloqueado | | | |
| S17 | Governança / Recepção / Hóspede | Acessar tela de usuários pela URL | Redireciona; a API retorna 403 | | | |
| S18 | Hóspede | Abrir "Minhas reservas" com dois hóspedes diferentes | Cada um vê só as suas (**falha conhecida: R03**) | | | |
| S19 | Qualquer | Abrir o console do navegador em "Minhas reservas" | Nenhum log com dados de reservas (`DEBUG MYBOOKIN`) | | | |

## 6. Critérios mínimos para produção (seção 8.1 do relatório)

| Critério | Situação em 26/11/2026 |
|---|---|
| Nenhum acesso indevido entre hóspedes; operações sensíveis autorizadas no servidor | ❌ R01, R02, R03 reproduzidos |
| Suíte automatizada 100% aprovada e smoke test completo | 🟡 0 falhas, mas 7 testes ignorados por defeito conhecido; smoke não executado |
| Migrations validadas com dados legados, backup e rollback | ⏳ T10, T11, T16 |
| Credenciais e chaves fora do repositório; usuários antigos preparados | ⏳ Não verificado nesta rodada |
| Fluxos validados em PostgreSQL real | ⏳ T07, T08 |
| PR revisado, aprovado e integrado conforme o fluxo | 🟡 `dev` e `main` sincronizados; falta CI obrigatório |

**Parecer de QA:** mantém-se a recomendação do relatório de **não liberar para produção**.

## 7. Como reproduzir

```bash
# Backend
dotnet test

# Frontend
cd stayease.app
npm install
npm test
```

Para ver um defeito conhecido falhar, remova o `Skip` do teste correspondente (ou troque `it.skip` por `it`) e rode a suíte:

| Defeito | Arquivo |
|---|---|
| R01 / R02 | `StayEase.Tests/Integration/GuestOwnershipTests.cs` |
| R06 | `StayEase.Tests/Integration/RoomStatusConsistencyTests.cs` |
| R03 | `stayease.app/src/services/guestsService.test.js` |

Os testes bloqueados também podem ser filtrados pelo trait: `dotnet test --filter "Bloqueio=M07"` ou `--filter "Bloqueio=R06"`.
