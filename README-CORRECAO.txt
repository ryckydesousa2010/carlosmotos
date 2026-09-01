CORREÇÃO - ERRO "auth is not defined"

Esta versão corrige o erro que acontecia ao clicar em "Criar conta".
O problema era o escopo das variáveis auth e db dentro do cloud-sync.js.

Arquivos já configurados:
- firebase-config.js
- cloud-sync.js

IMPORTANTE NO FIREBASE:
1. Abra Authentication > Sign-in method.
2. Ative "Email/Password".
3. Em Firestore Database > Rules, publique as regras incluídas neste ZIP.
4. No GitHub Pages, publique TODOS os arquivos deste ZIP na mesma pasta.
5. Depois de publicar, faça Ctrl+F5 no navegador.

Não é necessário alterar o código para corrigir o erro "auth is not defined".
