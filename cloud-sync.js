/*
 * ITA-TECNOLOGIAS / LocaçãoMotos
 * Sincronização em nuvem com Firebase Authentication + Firestore.
 *
 * O sistema original usa localStorage. Este arquivo mantém essa estrutura
 * para não quebrar as funções existentes e sincroniza o conteúdo do
 * localStorage com a conta autenticada.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const config = window.FIREBASE_CONFIG || {};
const authScreen = document.getElementById("authScreen");
const appRoot = document.getElementById("appRoot");
const appFooter = document.getElementById("appFooter");

let cloudReady = false;
let applyingRemote = false;
let saveTimer = null;
let unsubscribeSnapshot = null;
let appScriptLoaded = false;
let lastServerMillis = 0;
let auth = null;
let db = null;
const clientId = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random());

function showAuth(message = "") {
    if (!authScreen) return;

    authScreen.innerHTML = `
        <div class="auth-card">
            <div class="auth-logo">
                <div class="auth-icon"><i class="fa fa-motorcycle"></i></div>
                <h1>LocaçãoMotos</h1>
                <p>Dados sincronizados na nuvem</p>
            </div>

            <div class="auth-tabs">
                <button id="authTabLogin" class="auth-tab active">Entrar</button>
                <button id="authTabRegister" class="auth-tab">Criar conta</button>
            </div>

            <form id="cloudAuthForm">
                <div class="auth-field">
                    <label>E-mail</label>
                    <input id="cloudEmail" type="email" autocomplete="email" required placeholder="seuemail@exemplo.com">
                </div>

                <div class="auth-field">
                    <label>Senha</label>
                    <input id="cloudPassword" type="password" autocomplete="current-password" minlength="6" required placeholder="Mínimo de 6 caracteres">
                </div>

                <button id="cloudAuthSubmit" class="auth-submit" type="submit">
                    <i class="fa fa-sign-in"></i> Entrar
                </button>

                <button id="cloudForgot" class="auth-link" type="button">
                    Para redefinir a senha, use o painel do Firebase.
                </button>

                <div id="cloudAuthMessage" class="auth-message">${message}</div>
            </form>

            <div class="auth-help">
                <strong>Acesso em qualquer dispositivo</strong>
                <span>Use o mesmo e-mail e senha no computador ou celular.</span>
            </div>
        </div>
    `;

    let mode = "login";
    const tabLogin = document.getElementById("authTabLogin");
    const tabRegister = document.getElementById("authTabRegister");
    const submit = document.getElementById("cloudAuthSubmit");
    const form = document.getElementById("cloudAuthForm");
    const msg = document.getElementById("cloudAuthMessage");

    function setMode(next) {
        mode = next;
        tabLogin.classList.toggle("active", mode === "login");
        tabRegister.classList.toggle("active", mode === "register");
        submit.innerHTML = mode === "login"
            ? '<i class="fa fa-sign-in"></i> Entrar'
            : '<i class="fa fa-user-plus"></i> Criar conta';
        msg.textContent = "";
    }

    tabLogin.onclick = () => setMode("login");
    tabRegister.onclick = () => setMode("register");

    form.onsubmit = async (event) => {
        event.preventDefault();
        const email = document.getElementById("cloudEmail").value.trim();
        const password = document.getElementById("cloudPassword").value;
        submit.disabled = true;
        msg.textContent = mode === "login" ? "Entrando..." : "Criando conta...";

        try {
            if (mode === "login") {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (error) {
            console.error(error);
            const codes = {
                "auth/invalid-credential": "E-mail ou senha incorretos.",
                "auth/invalid-email": "Digite um e-mail válido.",
                "auth/email-already-in-use": "Este e-mail já possui uma conta.",
                "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
                "auth/network-request-failed": "Falha de conexão. Verifique a internet."
            };
            msg.textContent = codes[error.code] || ("Não foi possível concluir: " + error.message);
            submit.disabled = false;
        }
    };
}

function showConfigError() {
    showAuth("O Firebase ainda não foi configurado. Preencha o arquivo firebase-config.js e publique novamente.");
}

function localStorageObject() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) data[key] = localStorage.getItem(key);
    }
    return data;
}

function replaceLocalStorage(data) {
    applyingRemote = true;
    try {
        localStorage.clear();
        Object.entries(data || {}).forEach(([key, value]) => {
            localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
        });
    } finally {
        applyingRemote = false;
    }
}

async function saveCloudNow() {
    if (!cloudReady || applyingRemote || !auth.currentUser) return;

    try {
        const ref = doc(db, "users", auth.currentUser.uid);
        await setDoc(ref, {
            app: "LocacaoMotos",
            version: 2,
            clientId,
            updatedAt: serverTimestamp(),
            data: localStorageObject()
        }, { merge: true });
    } catch (error) {
        console.error("Erro ao salvar na nuvem:", error);
        showCloudStatus("offline", "Não foi possível sincronizar agora.");
    }
}

function scheduleCloudSave() {
    if (!cloudReady || applyingRemote) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveCloudNow, 700);
}

function showCloudStatus(type, text) {
    let badge = document.getElementById("cloudStatusBadge");
    if (!badge) {
        badge = document.createElement("div");
        badge.id = "cloudStatusBadge";
        document.body.appendChild(badge);
    }
    badge.className = "cloud-status " + type;
    badge.innerHTML = text;
    clearTimeout(badge._timer);
    badge._timer = setTimeout(() => badge.remove(), 4500);
}

function loadMainScript() {
    if (appScriptLoaded) return;
    appScriptLoaded = true;

    const script = document.createElement("script");
    script.src = "script.js";
    script.onload = () => {
        showCloudStatus("online", '<i class="fa fa-cloud"></i> Dados sincronizados');
        setTimeout(() => {
            if (typeof window.atualizarSistema === "function") window.atualizarSistema();
        }, 300);
    };
    document.body.appendChild(script);
}

function showApp() {
    if (authScreen) authScreen.style.display = "none";
    if (appRoot) appRoot.style.display = "flex";
    if (appFooter) appFooter.style.display = "block";
}

function hideApp() {
    if (authScreen) authScreen.style.display = "flex";
    if (appRoot) appRoot.style.display = "none";
    if (appFooter) appFooter.style.display = "none";
}

if (!config.apiKey || config.apiKey.startsWith("COLE_AQUI") ||
    !config.projectId || config.projectId.startsWith("SEU-PROJETO")) {
    showConfigError();
} else {
    const firebaseApp = initializeApp(config);
auth = getAuth(firebaseApp);
db = getFirestore(firebaseApp);

    // Intercepta as gravações do sistema original.
    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;
    const originalClear = Storage.prototype.clear;

    Storage.prototype.setItem = function(key, value) {
        originalSetItem.call(this, key, value);
        if (this === window.localStorage) scheduleCloudSave();
    };

    Storage.prototype.removeItem = function(key) {
        originalRemoveItem.call(this, key);
        if (this === window.localStorage) scheduleCloudSave();
    };

    Storage.prototype.clear = function() {
        originalClear.call(this);
        if (this === window.localStorage) scheduleCloudSave();
    };

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            cloudReady = false;
            if (unsubscribeSnapshot) {
                unsubscribeSnapshot();
                unsubscribeSnapshot = null;
            }
            hideApp();
            showAuth();
            return;
        }

        try {
            showCloudStatus("loading", '<i class="fa fa-refresh fa-spin"></i> Carregando dados da nuvem...');
            const ref = doc(db, "users", user.uid);
            const snap = await getDoc(ref);

            if (snap.exists() && snap.data().data) {
                replaceLocalStorage(snap.data().data);
                lastServerMillis = Date.now();
            } else {
                // Primeira utilização: envia os dados locais existentes para a nuvem.
                await setDoc(ref, {
                    app: "LocacaoMotos",
                    version: 2,
                    clientId,
                    updatedAt: serverTimestamp(),
                    data: localStorageObject()
                }, { merge: true });
            }

            cloudReady = true;
            showApp();
            loadMainScript();

            if (unsubscribeSnapshot) unsubscribeSnapshot();
            unsubscribeSnapshot = onSnapshot(ref, (remote) => {
                const payload = remote.data();
                if (!payload || !payload.data || payload.clientId === clientId) return;

                // Evita sobrescrever a tela durante uma gravação local recém feita.
                const now = Date.now();
                if (now - lastServerMillis < 1200) return;

                lastServerMillis = now;
                replaceLocalStorage(payload.data);
                showCloudStatus("online", '<i class="fa fa-cloud-download"></i> Dados atualizados pela nuvem');

                if (typeof window.atualizarSistema === "function") {
                    window.atualizarSistema();
                } else {
                    location.reload();
                }
            });

            // Atualiza a nuvem com qualquer alteração feita pelo sistema original.
            window.addEventListener("beforeunload", () => {
                clearTimeout(saveTimer);
                saveCloudNow();
            });

        } catch (error) {
            console.error(error);
            hideApp();
            showAuth("Não foi possível carregar seus dados. Verifique as regras do Firestore e a conexão.");
        }
    });

    window.logoutNuvem = () => signOut(auth);
}
