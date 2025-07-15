# Configuração do Firebase

## Passos para configurar o Firebase:

### 1. Criar projeto no Firebase Console
1. Acesse https://console.firebase.google.com/
2. Clique em "Adicionar projeto" ou "Create a project"
3. Digite o nome do projeto (ex: "controle-estudos")
4. Aceite os termos e continue
5. Desabilite o Google Analytics (opcional para este projeto)
6. Clique em "Criar projeto"

### 2. Configurar Authentication
1. No painel lateral, clique em "Authentication"
2. Clique em "Começar" ou "Get started"
3. Vá para a aba "Sign-in method"
4. Habilite "Email/password"
5. Clique em "Salvar"

### 3. Configurar Firestore Database
1. No painel lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Começar no modo de teste" (para desenvolvimento)
4. Escolha a localização (recomendado: southamerica-east1 para Brasil)
5. Clique em "Concluído"

### 4. Obter a configuração do seu aplicativo web

1. No painel principal do seu projeto Firebase, procure a seção "Seus apps".
2. Se você já adicionou um aplicativo web, clique no ícone de "Configurações" (engrenagem) ao lado do seu aplicativo web e role para baixo até "Sua configuração".
3. Se você ainda não adicionou um aplicativo web, clique no ícone "</>" (Web) para adicionar um novo aplicativo web. Siga as instruções e, ao final, **copie a configuração** que aparece (objeto `firebaseConfig`).

### 5. Configurar o projeto local
1. Abra o arquivo `src/lib/firebase.js`
2. Substitua os valores em `firebaseConfig` pelos valores copiados do Firebase Console
3. Salve o arquivo



### Credenciais de acesso:
- Usuário: DANIEL
- Senha: DevidaW

Essas credenciais serão criadas automaticamente no primeiro login.

