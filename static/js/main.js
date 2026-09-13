/** 세 화면을 연결하고 이름 검색 흐름을 시작하는 프런트엔드 시작 파일입니다. */

import { memoriesApi } from './api.js';
import { initializeAuth } from './auth.js';
import {
    initializeMemoryBoard,
    renderMemoryPage,
    setMemories
} from './memory-board.js';

const mainScreen = document.getElementById('mainScreen');
const loginView = document.getElementById('loginView');
const memoryView = document.getElementById('memoryView');
const memoryVideo = document.getElementById('memoryVideo');
const nameInput = document.getElementById('nameInput');
const searchButton = document.getElementById('searchButton');
const searchMessage = document.getElementById('searchMessage');


/** 해시 주소와 hidden 속성을 함께 바꿔 메인·로그인·추억 화면을 전환합니다. */
function showScreen(screenName, pushHistory = true) {
    mainScreen.hidden = screenName !== 'main';
    loginView.hidden = screenName !== 'login';
    memoryView.hidden = screenName !== 'memory';

    if (screenName === 'memory') {
        renderMemoryPage();
        memoryVideo.play().catch(() => {});
    } else {
        memoryVideo.pause();
    }

    if (pushHistory) {
        const hash = screenName === 'main' ? '#' : `#${screenName}`;
        history.pushState({ screen: screenName }, '', hash);
    }
}


/** 입력한 이름으로 서버 API를 호출하고 추억 화면을 엽니다. */
async function loadMemoriesByName() {
    const targetName = nameInput.value.trim();
    if (!targetName) {
        searchMessage.textContent = '이름을 입력해 주세요.';
        return;
    }

    nameInput.disabled = true;
    searchMessage.textContent = '추억을 불러오는 중입니다...';

    try {
        const data = await memoriesApi.findByName(targetName);
        setMemories(data.memories || [], targetName);
        searchMessage.textContent = '';
        showScreen('memory');
    } catch (error) {
        searchMessage.textContent = error.message;
    } finally {
        nameInput.disabled = false;
    }
}


/** 버튼, 키보드와 브라우저 뒤로가기 동작을 연결합니다. */
function initializeNavigation() {
    document.getElementById('loginButton').addEventListener('click', () => {
        showScreen('login');
    });
    document.getElementById('loginBack').addEventListener('click', () => {
        showScreen('main');
    });
    nameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            loadMemoriesByName();
        }
    });
    searchButton.addEventListener('click', loadMemoriesByName);

    window.addEventListener('popstate', () => {
        const screen = location.hash === '#login'
            ? 'login'
            : location.hash === '#memory'
                ? 'memory'
                : 'main';
        showScreen(screen, false);
    });
}


initializeNavigation();
initializeMemoryBoard();
initializeAuth(showScreen);

const initialScreen = location.hash === '#login'
    ? 'login'
    : location.hash === '#memory'
        ? 'memory'
        : 'main';
showScreen(initialScreen, false);
