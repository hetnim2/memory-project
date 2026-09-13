/** 회원가입·로그인·로그아웃 화면과 세션 상태를 관리합니다. */

import { authApi } from './api.js';

const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('loginId');
const passwordInput = document.getElementById('loginPassword');
const nicknameInput = document.getElementById('registerNickname');
const submitButton = document.getElementById('loginSubmit');
const modeButton = document.getElementById('authModeButton');
const logoutButton = document.getElementById('logoutButton');
const messageElement = document.getElementById('loginMessage');
const formTitle = document.getElementById('authFormTitle');

let registerMode = false;
let currentUser = null;
let showScreen = () => {};


/** 로그인 화면 아래 안내 문장을 바꿉니다. */
export function showAuthMessage(message) {
    messageElement.textContent = message;
}


/** 로그인 또는 회원가입 입력 모드로 폼을 전환합니다. */
function setRegisterMode(enabled) {
    registerMode = enabled;
    loginForm.classList.toggle('register-mode', registerMode);
    nicknameInput.hidden = !registerMode;
    nicknameInput.required = registerMode;
    passwordInput.autocomplete = registerMode ? 'new-password' : 'current-password';
    submitButton.textContent = registerMode ? '회원가입 →' : '로그인 →';
    modeButton.textContent = registerMode
        ? '이미 회원이신가요? 로그인'
        : '처음이신가요? 회원가입';
    formTitle.textContent = registerMode ? '회원가입' : '로그인';
    showAuthMessage('');
}


/** 로그인 여부에 맞춰 입력 폼과 로그아웃 버튼을 보여 줍니다. */
function renderAuthState() {
    const authenticated = Boolean(currentUser);
    usernameInput.hidden = authenticated;
    passwordInput.hidden = authenticated;
    nicknameInput.hidden = authenticated || !registerMode;
    submitButton.hidden = authenticated;
    modeButton.hidden = authenticated;
    logoutButton.hidden = !authenticated;

    if (authenticated) {
        showAuthMessage(`${currentUser.nickname}님으로 로그인되어 있습니다.`);
    }
}


/** 로그인 또는 회원가입 API를 호출하고 성공하면 메인 화면으로 돌아갑니다. */
async function submitAuthForm(event) {
    event.preventDefault();
    submitButton.disabled = true;
    showAuthMessage(registerMode ? '회원가입 중입니다...' : '로그인 중입니다...');

    try {
        const commonPayload = {
            username: usernameInput.value.trim(),
            password: passwordInput.value.trim()
        };
        const data = registerMode
            ? await authApi.register({
                ...commonPayload,
                nickname: nicknameInput.value.trim()
            })
            : await authApi.login(commonPayload);

        currentUser = data.user;
        loginForm.reset();
        setRegisterMode(false);
        renderAuthState();
        showScreen('main');
    } catch (error) {
        showAuthMessage(error.message);
        passwordInput.value = '';
        passwordInput.focus();
    } finally {
        submitButton.disabled = false;
    }
}


/** 현재 세션을 지우고 로그인 입력 화면으로 돌아갑니다. */
async function logout() {
    logoutButton.disabled = true;
    try {
        await authApi.logout();
        currentUser = null;
        renderAuthState();
        showAuthMessage('로그아웃되었습니다.');
    } catch (error) {
        showAuthMessage(error.message);
    } finally {
        logoutButton.disabled = false;
    }
}


/** 새로고침 시 서버에 남아 있는 로그인 상태를 복원합니다. */
async function restoreSession() {
    try {
        const data = await authApi.currentUser();
        currentUser = data.authenticated ? data.user : null;
    } catch (error) {
        currentUser = null;
        showAuthMessage(error.message);
    }
    renderAuthState();
}


/** 인증 관련 이벤트를 연결하고 세션 상태를 불러옵니다. */
export function initializeAuth(screenController) {
    showScreen = screenController;
    loginForm.addEventListener('submit', submitAuthForm);
    modeButton.addEventListener('click', () => setRegisterMode(!registerMode));
    logoutButton.addEventListener('click', logout);
    restoreSession();
}
