# LocaçãoMotos — GitHub + Nuvem

Esta versão mantém o sistema atual e acrescenta:

- Login por e-mail e senha.
- Dados salvos no Firestore.
- Mesmo cadastro disponível em computador, notebook e celular.
- Sincronização automática.
- Mantém o backup `.json` existente.
- Compatível com GitHub Pages.
- Os dados de cada conta ficam separados por usuário.

## IMPORTANTE

O GitHub Pages hospeda os arquivos, mas não é banco de dados.
Por isso esta versão usa Firebase Authentication + Cloud Firestore.

O arquivo `firebase-config.js` está com valores de exemplo.
Você precisa colocar a configuração do seu próprio projeto Firebase.

## 1. Criar o Firebase

No Firebase Console:

1. Crie um projeto.
2. Adicione um aplicativo Web (`</>`).
3. Copie o objeto `firebaseConfig`.
4. Abra `firebase-config.js`.
5. Substitua os valores de exemplo pelos valores do seu projeto.

NÃO coloque neste arquivo uma service account ou chave privada.

## 2. Ativar login

No Firebase Authentication:

1. Abra Authentication.
2. Ative o provedor "E-mail/senha".
3. O usuário poderá criar a própria conta pela tela do sistema.

## 3. Criar o banco

No Firestore Database:

1. Crie o banco.
2. Escolha uma região.
3. Publique as regras do arquivo `firestore.rules`.

As regras deixam cada usuário acessar somente o próprio documento.

## 4. Publicar no GitHub

Envie todos os arquivos desta pasta para um repositório:

- index.html
- style.css
- script.js
- firebase-config.js
- cloud-sync.js
- firestore.rules

Depois ative GitHub Pages usando a branch principal e a pasta `/root`.

## 5. Autorizar o endereço do GitHub Pages

No Firebase Authentication, adicione o domínio do seu GitHub Pages aos domínios autorizados.

Exemplo de endereço:
https://SEU-USUARIO.github.io/SEU-REPOSITORIO/

## 6. Primeira migração

Se você já possui dados no sistema antigo:

1. Abra primeiro a nova versão no computador que contém os dados.
2. Crie uma conta ou entre na conta desejada.
3. Se essa conta ainda não possuir dados na nuvem, os dados locais serão enviados para o Firestore.
4. Depois, abra o mesmo endereço em outro computador/celular.
5. Entre com o mesmo e-mail e senha.

A partir daí os dados passam a ser compartilhados pela nuvem.

## ATENÇÃO SOBRE DADOS ANTIGOS

Não abra a nova versão em outro aparelho e crie uma conta diferente esperando encontrar os dados.
Para acessar os mesmos dados, use a MESMA conta de e-mail e senha.

## Backup

O sistema original já possui exportação/importação de backup JSON.
Essa função continua disponível. O backup é especialmente útil antes de qualquer alteração importante.

## Estrutura

- `index.html` — interface
- `style.css` — visual/responsividade
- `script.js` — funcionalidades existentes
- `firebase-config.js` — configuração do projeto Firebase
- `cloud-sync.js` — login e sincronização
- `firestore.rules` — regras de segurança do banco

Desenvolvido para o projeto LocaçãoMotos / Ita-Tecnologias.
