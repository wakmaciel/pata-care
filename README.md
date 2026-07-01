# 🐾 PataCare — Caderneta digital do seu pet

Um app web (PWA) para gerenciar a saúde e os cuidados dos seus pets: vacinas (com previsão automática conforme protocolos veterinários brasileiros), medicamentos com horário certo, antipulgas/carrapatos, vermífugos, peso e cio — com fotos, lembretes, relatório para o veterinário e backup. Funciona direto no navegador, pode ser "instalado" na tela de início do iPhone, e **todos os dados ficam salvos apenas no seu dispositivo** (não tem servidor, não tem login, não tem nuvem).

## ✨ Funcionalidades

- **Múltiplos pets**, cada um com nome, foto, espécie, raça, sexo e data de nascimento (com cálculo automático de idade).
- **Vacinas com previsão automática**: escolha o tipo (V8/V10, Antirrábica, Giárdia, Gripe canina, Leishmaniose, V3/V4/V5 felina, FeLV, ou personalizada) e o app já calcula a próxima dose sozinho, seguindo os esquemas de filhote (várias doses iniciais) e depois reforço anual — com uma linha do tempo visual por vacina, que pode ser desabilitada se não fizer sentido para o seu pet.
- **Medicamentos**: registre nome, forma (comprimido, gota, líquido, injeção...), dose, de quantas em quantas horas e por quantos dias — o app monta a lista de doses automaticamente e você vai marcando "✓ aplicada" uma a uma, com contagem de progresso.
- **Antipulgas e carrapatos** e **vermífugos**: produto aplicado, data e próxima aplicação.
- **Consultas veterinárias**: registre data, veterinário(a)/Dr(a), motivo e observações/diagnóstico — com opção de habilitar uma data de retorno, que entra automaticamente nos Lembretes.
- **Exames**: registre exames (raio-X, ultrassom, hemograma, etc.) com data, veterinário(a)/clínica, CRMV e observações, anexando os resultados em imagem e/ou PDF.
- **Cirurgias**: registre cirurgias (castração, remoção de nódulo, ortopédica, etc.) com data, veterinário(a)/clínica, CRMV, observações de pós-operatório e fotos/PDFs anexados — com opção de marcar o pet como castrado(a) automaticamente.
- **Peso**: histórico com gráfico de evolução e variação em relação ao registro anterior.
- **Cio** (apenas para pets fêmeas): início, fim e intervalo médio entre os ciclos.
- **Lembretes**: uma tela só com tudo que está atrasado ou vencendo (vacinas, antipulgas, vermífugos e doses de medicamento) de todos os pets — pode marcar a dose do remédio direto por ali.
- **Relatório para o veterinário**: gera um PDF (via impressão do navegador) com o resumo completo de um pet ou de todos, pronto para mostrar ou enviar na consulta.
- **Modo claro / escuro / automático** (segue o sistema do iOS).
- **Backup**: exporta tudo em um arquivo `.json` para guardar ou transferir para outro aparelho, e importa quando quiser restaurar.
- **Instalável no iPhone** (PWA): adiciona à tela de início e funciona offline depois do primeiro carregamento.

> ⚠️ As previsões de vacina seguem protocolos veterinários gerais usados no Brasil (baseados em referências como Zoetis, Petz, Pedigree, Cobasi, Covet) mas **não substituem a avaliação de um médico-veterinário**, que pode ajustar o esquema conforme raça, risco e histórico do pet.

## 📂 Estrutura do projeto

```
patacare-app/
├── index.html      → toda a interface (HTML + CSS) do app
├── app.js          → toda a lógica (telas, banco de dados local, formulários, protocolos de vacina)
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

## 🩺 Como gerar o relatório para o veterinário

1. Vá em **Ajustes → Exportar para o veterinário**.
2. Escolha um pet específico ou "Todos os pets".
3. Toque em **Gerar relatório** — ele abre em uma nova aba.
4. Toque em **Imprimir / Salvar PDF** no topo da página e, no iPhone, escolha "Salvar em Arquivos" ou compartilhe direto pelo menu de impressão (toque na prévia com dois dedos para abrir as opções de compartilhar como PDF).

## 💾 Sobre os dados e backup

- Os dados ficam guardados no **IndexedDB do navegador**, ou seja, dentro do próprio iPhone/navegador onde você usa o app.
- Isso quer dizer: **se você apagar o app/dados do Safari, ou trocar de aparelho, os dados não acompanham automaticamente.**
- Por isso, em **Ajustes → Backup dos dados**, exporte um arquivo `.json` de vez em quando (ele inclui pets, registros e fotos) e guarde no iCloud Drive, Google Drive, e-mail, etc.
- Para restaurar (em outro aparelho ou depois de reinstalar), use **Importar backup** e selecione esse arquivo.

## 🛠️ Para continuar evoluindo o app

O código é organizado para ser fácil de ajustar:

- **Cores e visual**: tudo está nas variáveis CSS no topo do `index.html` (`:root` para modo claro, `html[data-theme="dark"]` para o escuro).
- **Protocolos de vacina**: estão no objeto `VACCINE_PROTOCOLS` no `app.js` — para ajustar intervalos ou adicionar um novo tipo de vacina, basta editar esse objeto.
- **Campos dos formulários** (antipulgas, vermífugo, peso, cio): estão no objeto `RECORD_FORMS` dentro do `app.js`.
- **Ícones**: são todos SVGs simples, no objeto `ICONS` no topo do `app.js`.

Ideias para próximas versões (é só pedir e a gente constrói junto):
- Notificações push reais (hoje a tela de Lembretes já avisa, mas só quando você abre o app).
- Gráfico de peso comparando várias fases (filhote/adulto).
- Suporte a mais de um cuidador (ex: backup automático na nuvem).

---

Feito com carinho para cuidar de quem cuida da gente. 🐾

