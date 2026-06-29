# 🐾 PataCare — Caderneta digital do seu pet

Um app web (PWA) para gerenciar a saúde e os cuidados dos seus pets: vacinas, antipulgas/carrapatos, vermífugos, peso e cio — com fotos, lembretes e backup. Funciona direto no navegador, pode ser "instalado" na tela de início do iPhone, e **todos os dados ficam salvos apenas no seu dispositivo** (não tem servidor, não tem login, não tem nuvem).

## ✨ Funcionalidades da v1.0

- **Múltiplos pets**, cada um com nome, foto, espécie, raça, sexo e data de nascimento (com cálculo automático de idade).
- **Vacinas**: nome, data, horário, foto da etiqueta e data da próxima dose, com aviso visual de atrasado/próximo.
- **Antipulgas e carrapatos**: produto aplicado, data e próxima aplicação.
- **Vermífugos**: produto aplicado, data e próxima aplicação.
- **Peso**: histórico com gráfico de evolução e variação em relação ao registro anterior.
- **Cio** (apenas para pets fêmeas): início, fim e intervalo médio entre os ciclos.
- **Lembretes**: uma tela só com tudo que está atrasado ou vencendo nos próximos dias, de todos os pets.
- **Modo claro / escuro / automático** (segue o sistema do iOS).
- **Backup**: exporta tudo em um arquivo `.json` para guardar ou transferir para outro aparelho, e importa quando quiser restaurar.
- **Instalável no iPhone** (PWA): adiciona à tela de início e funciona offline depois do primeiro carregamento.

## 📂 Estrutura do projeto

```
patacare-app/
├── index.html      → toda a interface (HTML + CSS) do app
├── app.js          → toda a lógica (telas, banco de dados local, formulários)
├── manifest.json    → configuração do PWA (nome, ícone, cores)
├── sw.js            → service worker (cache offline)
├── icons/           → ícones do app para a tela de início
└── README.md
```

Não tem build, não tem `npm install`, não tem dependências para instalar. É só HTML, CSS e JavaScript puro — qualquer navegador moderno já executa.

## 🚀 Como publicar no GitHub Pages (passo a passo)

1. Crie um repositório novo no GitHub (pode ser público), por exemplo `patacare-app`.
2. Suba todos os arquivos desta pasta para a raiz do repositório (pelo site do GitHub mesmo, em **Add file → Upload files**, ou via `git push` se preferir linha de comando).
3. No repositório, vá em **Settings → Pages**.
4. Em **Source**, selecione **Deploy from a branch**, escolha a branch `main` e a pasta `/ (root)`. Salve.
5. Em alguns minutos, o GitHub mostra o link do site, algo como:
   `https://seu-usuario.github.io/patacare-app/`
6. Abra esse link no Safari do iPhone.

## 📱 Como instalar na tela de início do iPhone

1. Abra o link do app no **Safari** (precisa ser o Safari, não funciona pelo Chrome no iOS).
2. Toque no ícone de **compartilhar** (o quadrado com a seta para cima).
3. Toque em **Adicionar à Tela de Início**.
4. Pronto — o PataCare aparece como um app normal, com ícone próprio, sem a barra de endereço do navegador.

## 💾 Sobre os dados e backup

- Os dados ficam guardados no **IndexedDB do navegador**, ou seja, dentro do próprio iPhone/navegador onde você usa o app.
- Isso quer dizer: **se você apagar o app/dados do Safari, ou trocar de aparelho, os dados não acompanham automaticamente.**
- Por isso, em **Ajustes → Backup dos dados**, exporte um arquivo `.json` de vez em quando (ele inclui pets, registros e fotos) e guarde no iCloud Drive, Google Drive, e-mail, etc.
- Para restaurar (em outro aparelho ou depois de reinstalar), use **Importar backup** e selecione esse arquivo.

## 🛠️ Para continuar evoluindo o app

O código é organizado para ser fácil de ajustar:

- **Cores e visual**: tudo está nas variáveis CSS no topo do `index.html` (`:root` para modo claro, `html[data-theme="dark"]` para o escuro).
- **Campos dos formulários** (vacina, antipulgas, vermífugo, peso, cio): estão no objeto `RECORD_FORMS` dentro do `app.js` — para adicionar um campo novo, basta acrescentar um item na lista de `fields`.
- **Ícones**: são todos SVGs simples, no objeto `ICONS` no topo do `app.js`.

Ideias para próximas versões (é só pedir e a gente constrói junto):
- Notificações push reais (hoje a tela de Lembretes já avisa, mas só quando você abre o app).
- Gráfico de peso comparando várias fases (filhote/adulto).
- Compartilhar a carteirinha de vacinação em PDF.
- Suporte a mais de um cuidador (ex: backup automático na nuvem).

---

Feito com carinho para cuidar de quem cuida da gente. 🐾
