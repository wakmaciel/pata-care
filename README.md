# 🐾 PataCare — Caderneta digital do seu pet (v2.0)

Um app web (PWA) para gerenciar a saúde e os cuidados dos seus pets: vacinas (com previsão automática conforme protocolos veterinários brasileiros), medicamentos com horário certo, antipulgas/carrapatos, vermífugos, peso e cio — com fotos, lembretes, relatório para o veterinário e backup. Funciona direto no navegador, pode ser "instalado" na tela de início do iPhone, e **todos os dados ficam salvos apenas no seu dispositivo** (não tem servidor, não tem login obrigatório).

## ✨ Funcionalidades

- **Múltiplos pets**, cada um com nome, foto, espécie, raça, sexo e data de nascimento (com cálculo automático de idade).
- **Vacinas com previsão automática**: escolha o tipo (V8/V10, Antirrábica, Giárdia, Gripe canina, Leishmaniose, V3/V4/V5 felina, FeLV, ou personalizada) e o app já calcula a próxima dose sozinho, seguindo os esquemas de filhote (várias doses iniciais) e depois reforço anual — com uma linha do tempo visual por vacina, que pode ser desabilitada se não fizer sentido para o seu pet.
- **Medicamentos**: registre nome, forma (comprimido, gota, líquido, injeção...), dose, de quantas em quantas horas e por quantos dias — o app monta a lista de doses automaticamente e você vai marcando "✓ aplicada" uma a uma, com contagem de progresso.
- **Antipulgas e carrapatos** e **vermífugos**: produto aplicado, data e próxima aplicação.
- **Consultas veterinárias**: data, veterinário(a), motivo e observações — com data de retorno opcional que entra nos Lembretes.
- **Exames** e **cirurgias**: com CRMV, observações e anexos (imagens e PDF).
- **Medidas para roupas**: pescoço, peito/tórax e comprimento do dorso.
- **Peso**: histórico com gráfico e comparação com a faixa esperada da raça.
- **Cio** (apenas fêmeas): início, fim e intervalo médio entre ciclos.
- **Lembretes e notificações do sistema**.
- **Relatório para o veterinário** (PDF via impressão do navegador).
- **Modo claro / escuro / automático**.
- **Backup local (.json)** e **backup automático no Google Drive**.
- **Instalável no iPhone** (PWA), funciona offline.

> ⚠️ As previsões de vacina seguem protocolos veterinários gerais usados no Brasil, mas **não substituem a avaliação de um médico-veterinário**.

## 🛠️ Stack (v2.0)

- **React 19** + **TypeScript** (strict) + **Vite**
- **Tailwind CSS 4** (design tokens em CSS variables, tema claro/escuro)
- **Zustand** (estado), **React Hook Form + Zod** (formulários), **Framer Motion** (animações)
- **IndexedDB** (dados) + Service Worker (offline) — mesmos formatos da v1, sem migração de dados

## 📂 Estrutura do projeto

```
pata-care/
├── index.html            → entrada do app (meta tags PWA/iOS)
├── public/
│   ├── manifest.json     → configuração do PWA
│   ├── sw.js             → service worker (cache offline + notificações)
│   └── icons/            → ícones do app
├── src/
│   ├── main.tsx          → bootstrap (tema, banco, SW, notificações, Drive)
│   ├── App.tsx           → casca do app (topbar, dock, FAB, rotas)
│   ├── router.ts         → rotas por hash (#/, #/pet/:id/:aba, #/lembretes, #/ajustes)
│   ├── types.ts          → tipos de domínio (Pet, registros, doses...)
│   ├── db/               → IndexedDB (mesmo banco da v1)
│   ├── store/            → Zustand (dados, UI/overlays, tema, tutor)
│   ├── domain/           → regras de negócio (protocolos de vacina, doses, peso por raça)
│   ├── services/         → Google Drive, notificações, backup, calendário, relatório
│   ├── components/ui/    → componentes base (botões, campos, sheets, toasts...)
│   └── features/         → telas e formulários por funcionalidade
└── .github/workflows/deploy.yml → build + deploy no GitHub Pages
```

## 🚀 Desenvolvimento

```bash
npm install
npm run dev       # servidor local
npm run build     # build de produção (dist/)
npm run lint      # ESLint
```

## 📦 Publicação

O deploy é automático: qualquer push na branch `main` roda o build do Vite e publica a pasta `dist/` no GitHub Pages (veja `.github/workflows/deploy.yml`). A versão do cache do service worker é carimbada com o SHA do commit a cada deploy, então o PWA se atualiza sozinho ao reabrir.

## 📱 Como instalar na tela de início do iPhone

1. Abra o link do app no **Safari**.
2. Toque no ícone de **compartilhar** → **Adicionar à Tela de Início**.

## 💾 Sobre os dados e backup

- Os dados ficam no **IndexedDB do navegador** (`patacare-db`) — o mesmo banco da v1: atualizar o app **não apaga nada**.
- Em **Ajustes → Backup dos dados**, exporte um `.json` de vez em quando, ou conecte o **Google Drive** para backup automático.
- Para ajustar protocolos de vacina: `src/domain/vaccines.ts`. Faixas de peso por raça: `src/domain/weight.ts`. Tokens de cor/tema: `src/index.css`.

---

Feito com carinho para cuidar de quem cuida da gente. 🐾
