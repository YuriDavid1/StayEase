# StayEase
Sistema de gerenciamento de hospedagem para pequenos hotéis e pousadas, desenvolvido para automatizar o processo de reservas, check-in, check-out e controle do estado dos quartos.

## Nome dos integrantes

Gabriel Vitório, Guilherme Halter, João Bagatoli, Lucas Oliveira, Wedley Schmoeller, Yuri Arins.

---

# Sobre o Projeto

O **StayEase** foi desenvolvido com o objetivo de facilitar a gestão de pequenos hotéis e pousadas, centralizando as principais operações do estabelecimento em um único sistema.

Além do gerenciamento de hóspedes e reservas, o sistema auxilia a comunicação entre recepção e governança, garantindo que os quartos sejam liberados corretamente para limpeza antes de receberem novos hóspedes.

## Problema

Em muitas pousadas, quando um hóspede realiza o check-out, a equipe de limpeza nem sempre é comunicada imediatamente. Isso faz com que quartos permaneçam indisponíveis por mais tempo do que o necessário, impactando diretamente a ocupação do estabelecimento.

## Solução

O StayEase automatiza esse processo permitindo:

- Cadastro de quartos;
- Cadastro de hóspedes;
- Gerenciamento de reservas;
- Check-in;
- Check-out;
- Controle do status dos quartos;
- Comunicação entre recepção e governança.

---

# Tecnologias Utilizadas

## Backend

- .NET
- C#
- ASP.NET MVC

## Frontend

- React
- JavaScript

## Testes

- XUnit

## Qualidade de Código

- ESLint
- SonarQube

---

# Arquitetura

O projeto segue o padrão arquitetural **MVC (Model-View-Controller)**.

```
src
├── Backend
│   ├── Controllers
│   ├── Models
│   ├── Services
│   └── Tests
│
└── Frontend
    ├── Components
    ├── Pages
    ├── Services
    └── Assets
```

---

# Funcionalidades

- Cadastro de quartos
- Cadastro de hóspedes
- Reserva de estadias
- Cancelamento de reservas
- Check-in
- Check-out
- Controle do status dos quartos
- Gerenciamento de limpeza
- Histórico de reservas

---

# Como Executar o Projeto

## Pré-requisitos

- .NET SDK
- Node.js
- npm

## Clonando o repositório

```bash
git clone <https://github.com/YuriDavid1/StayEase.git>
```

Entre na pasta do projeto:

```bash
cd StayEase
```

## Backend

```bash
cd src/Backend

dotnet restore

dotnet run
```

## Frontend

```bash
cd src/Frontend

npm install

npm start
```

---

# Guia de Estilo

## Convenções de Nomenclatura

### Variáveis

Utilizar **camelCase**.

---

### Funções

Utilizar **camelCase**.

---

### Classes

Utilizar **PascalCase**.

---

### Métodos (.NET)

Utilizar **PascalCase**.

---

### Arquivos

| Tipo | Convenção |
|------|-----------|
| `.tsx` | PascalCase |
| `.cs` | PascalCase |
| `.js` | camelCase |

---

## Idioma

Todos os nomes de classes, métodos, variáveis deverão ser escritos em **inglês**.

---

# Fluxo de Versionamento

O projeto utiliza uma estratégia baseada em **Git Flow**, garantindo organização e rastreabilidade durante o desenvolvimento.

## Branches Principais

### `main`

A branch **main** representa o ambiente de **produção**.

Somente versões estáveis, testadas e aprovadas poderão ser mescladas nesta branch.

**Nunca devem ser realizados commits diretamente na `main`.**

---

### `dev`

A branch **dev** representa o ambiente de desenvolvimento.

Todo Pull Request deverá ser direcionado para esta branch.

Ao final de cada entrega (Sprint), a branch `dev` será mesclada na `main`, disponibilizando uma nova versão estável da aplicação.

---

## Branches de Funcionalidade

Cada tarefa criada no **Jira** deverá originar uma nova branch.

Padrão:

```text
feature/nome-da-funcionalidade
```
---

## Branches de Correção

```text
fix/descricao-do-bug
```


---

# Fluxo de Desenvolvimento

Todo desenvolvimento seguirá o seguinte fluxo:

```
main
 │
 ▼
develop
 │
 ├── feature/create-room
 ├── feature/create-reservation
 ├── feature/check-in
 ├── feature/check-out
 └── fix/checkin-validation
```

### Processo

1. Criar uma tarefa no **Jira**.
2. Criar uma nova branch a partir da `dev`.
3. Desenvolver a funcionalidade.
4. Realizar os commits seguindo o padrão Conventional Commits.
5. Abrir um Pull Request para a branch `dev`.
6. Solicitar revisão do código.
7. Obter aprovação de **dois integrantes da equipe**.
8. Garantir que todas as verificações automáticas tenham sido aprovadas.
9. Realizar o merge na `dev`.
10. Excluir a branch utilizada após o merge.
11. Ao final da Sprint, realizar o merge da `dev` para a `main`.

---

# Padrão de Commits

O projeto utiliza o padrão **Conventional Commits**.

## Prefixos

| Prefixo | Descrição |
|----------|-----------|
| feat | Nova funcionalidade |
| fix | Correção de bugs |
| refactor | Refatoração |
| docs | Documentação |
| test | Testes |
| chore | Configurações e manutenção |

### Regras

- Utilizar descrições curtas;
- Escrever sempre em inglês;
- Informar claramente a alteração realizada.

---

# Revisão de Código

Todas as Pull Requests deverão obedecer às seguintes regras:

- Estar vinculadas a uma tarefa do Jira;
- Ter como destino a branch `dev`;
- Receber aprovação de **dois membros da equipe**;
- Passar em todas as verificações automáticas;
- Corrigir todos os comentários da revisão antes do merge.

Após o merge, a branch da funcionalidade deverá ser excluída.

---

# Pipeline de CI/CD

O projeto utiliza integração contínua para garantir a qualidade do código.

## Verificações Automáticas

A cada Pull Request serão executadas automaticamente as seguintes etapas:

- Build do projeto;
- Execução dos testes unitários;
- Verificação do ESLint;
- Análise estática utilizando SonarQube.

---

## Política de Aprovação

Nenhum Pull Request poderá ser aprovado caso:

- O Build falhe;
- Algum teste falhe;
- O ESLint apresente erros críticos;
- O SonarQube reprovar a análise de qualidade.

---

# Testes

Os testes unitários são desenvolvidos utilizando **XUnit**.

Para executá-los:

```bash
dotnet test
```

---

# Gerenciamento de Projetos

O gerenciamento das atividades será realizado através do **Jira**.

Cada tarefa deverá seguir o fluxo:

```
Backlog
    ↓
A Fazer
    ↓
Em Desenvolvimento
    ↓
Code Review
    ↓
Testes
    ↓
Concluído
```

## Regras

- Cada tarefa do Jira deverá possuir sua própria branch;
- Uma branch deve conter apenas uma funcionalidade ou correção;
- Toda Pull Request deverá estar vinculada à sua respectiva tarefa;
- São obrigatórias **duas aprovações** antes do merge;
- Após o merge na `dev`, a branch deverá ser excluída.

---

# Licença

Projeto desenvolvido para fins acadêmicos.
