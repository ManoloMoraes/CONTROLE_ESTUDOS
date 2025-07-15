# Controle de Estudos - Sistema de Revisão Espaçada

Um sistema web moderno para controle de estudos com foco em revisão espaçada, desenvolvido com React e Firebase.

## 🚀 Funcionalidades

- **Autenticação de usuário** com Firebase Auth
- **Gerenciamento de disciplinas** - Crie e organize suas matérias de estudo
- **Registro de estudos** - Documente o que você estudou com data e links opcionais
- **Revisão espaçada automática** - Sistema programa revisões em 7, 15, 30, 60, 90 e 120 dias
- **Calendário visual** - Visualize estudos (verde), revisões pendentes (amarelo) e concluídas (azul)
- **Dashboard dinâmico** - Estatísticas em tempo real do seu progresso
- **Interface responsiva** - Funciona perfeitamente em desktop e mobile

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, Vite, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Firebase (Authentication + Firestore)
- **Icons**: Lucide React
- **Deploy**: GitHub Pages (frontend)

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Firebase
- Git instalado

## ⚙️ Configuração do Firebase

### 1. Criar projeto no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Digite o nome do projeto (ex: "controle-estudos")
4. Desabilite o Google Analytics (opcional)
5. Clique em "Criar projeto"

### 2. Configurar Authentication

1. No painel lateral, clique em "Authentication"
2. Clique em "Começar"
3. Vá para a aba "Sign-in method"
4. Habilite "Email/password"
5. Clique em "Salvar"

### 3. Configurar Firestore Database

1. No painel lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Começar no modo de teste"
4. Escolha a localização (recomendado: southamerica-east1 para Brasil)
5. Clique em "Concluído"

### 4. Adicionar app web ao projeto

1. No painel principal, clique no ícone "</>" (Web)
2. Digite o nome do app (ex: "controle-estudos-web")
3. NÃO marque "Firebase Hosting"
4. Clique em "Registrar app"
5. **Copie a configuração** que aparece (objeto firebaseConfig)



### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd controle-estudos
```

### 2. Instale as dependências

```bash
npm install
# ou
pnpm install
```

### 3. Configure o Firebase

1. Abra o arquivo `src/lib/firebase.js`
2. Substitua a configuração temporária pelos valores copiados do Firebase Console:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key-aqui",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "seu-sender-id",
  appId: "seu-app-id"
};
```

### 4. Execute o projeto

```bash
npm run dev
# ou
pnpm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 👤 Credenciais de Acesso

- **Usuário**: daniel@estudos.com
- **Senha**: DevidaW

*Essas credenciais serão criadas automaticamente no primeiro login.*

## 📱 Como Usar

### 1. Primeiro Acesso
1. Acesse a aplicação
2. Clique em "Acesso Rápido (Daniel)" para preencher as credenciais
3. Clique em "Entrar" para fazer login

### 2. Criando Disciplinas
1. Vá para "Disciplinas" no menu lateral
2. Clique em "Nova Disciplina"
3. Digite o nome da disciplina (ex: Matemática, História, Programação)
4. Clique em "Criar Disciplina"

### 3. Registrando Estudos
1. Vá para "Estudos" no menu lateral
2. Clique em "Novo Estudo"
3. Selecione a disciplina
4. Digite o assunto estudado
5. Defina a data do estudo
6. Adicione um link opcional para o material
7. Marque as revisões desejadas (7, 15, 30, 60, 90, 120 dias)
8. Clique em "Salvar Estudo"

### 4. Usando o Calendário
1. Vá para "Calendário" no menu lateral
2. Navegue pelos meses usando as setas
3. Clique em qualquer data com eventos para ver detalhes
4. Marque revisões como concluídas clicando no botão correspondente

### 5. Interpretando as Cores
- **Verde (📚)**: Estudos realizados
- **Amarelo (⏰)**: Revisões pendentes
- **Azul (✅)**: Revisões concluídas

## 🌐 Deploy no GitHub Pages

### 1. Preparar o projeto para deploy

```bash
npm run build
# ou
pnpm run build
```

### 2. Configurar GitHub Pages

1. Faça push do código para um repositório GitHub
2. Vá para Settings > Pages no repositório
3. Selecione "Deploy from a branch"
4. Escolha "gh-pages" como branch
5. Clique em "Save"

### 3. Deploy automático

O projeto já está configurado para deploy automático. A cada push na branch main, o GitHub Actions irá:
1. Fazer build da aplicação
2. Fazer deploy para GitHub Pages
3. Disponibilizar em `https://seu-usuario.github.io/nome-do-repositorio`

## 📊 Estrutura de Dados

### Disciplinas
```javascript
{
  id: "auto-generated",
  name: "Nome da Disciplina",
  createdAt: "timestamp",
  userId: "user-id"
}
```

### Estudos
```javascript
{
  id: "auto-generated",
  disciplineId: "discipline-id",
  subject: "Assunto estudado",
  studyDate: "timestamp",
  link: "url-opcional",
  reviews: [
    {
      date: "timestamp",
      completed: false,
      days: 7
    }
  ],
  createdAt: "timestamp",
  userId: "user-id"
}
```

## 🔧 Desenvolvimento

### Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes de UI (shadcn/ui)
│   ├── Login.jsx       # Tela de login
│   ├── Dashboard.jsx   # Dashboard principal
│   ├── DisciplinesManager.jsx
│   ├── StudiesManager.jsx
│   ├── StudyCalendar.jsx
│   └── DynamicDashboard.jsx
├── contexts/           # Contextos React
│   └── AuthContext.jsx # Contexto de autenticação
├── lib/               # Utilitários
│   └── firebase.js    # Configuração do Firebase
├── App.jsx           # Componente principal
└── main.jsx         # Ponto de entrada
```

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter

## 🐛 Solução de Problemas

### Erro de autenticação Firebase
- Verifique se a configuração do Firebase está correta
- Confirme se o Authentication está habilitado no console
- Verifique se o domínio está autorizado nas configurações

### Erro de permissão no Firestore
- Verifique se as regras de segurança estão configuradas corretamente
- Confirme se o usuário está autenticado

### Problemas de deploy
- Verifique se o build foi gerado corretamente
- Confirme se o GitHub Pages está configurado
- Verifique os logs do GitHub Actions

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

Desenvolvido com ❤️ para otimizar seus estudos através da revisão espaçada.

