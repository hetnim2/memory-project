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

// ===============================
// 이스터에그 10컷 스토리
// ===============================

const easterEggTrigger = document.getElementById("easterEggTrigger");
const easterEggViewer = document.getElementById("easterEggViewer");
const easterEggImage = document.getElementById("easterEggImage");
const easterEggNext = document.getElementById("easterEggNext");

const easterEggImages = [
    "/static/assets/images/easteregg/1.png",
    "/static/assets/images/easteregg/2.png",
    "/static/assets/images/easteregg/3.png",
    "/static/assets/images/easteregg/4.png",
    "/static/assets/images/easteregg/5.png",
    "/static/assets/images/easteregg/6.png",
    "/static/assets/images/easteregg/7.png",
    "/static/assets/images/easteregg/8.png",
    "/static/assets/images/easteregg/9.png",
    "/static/assets/images/easteregg/10.png"
];

let easterEggIndex = 0;
let easterEggTimer = null;

function lockEasterEggNext() {
    clearTimeout(easterEggTimer);

    easterEggNext.disabled = true;
    easterEggNext.classList.remove("is-ready");

    // 10번째 사진에서는 다음 버튼 없음
    if (easterEggIndex === easterEggImages.length - 1) {
        return;
    }

    // 4초 후 화살표 활성화
    easterEggTimer = setTimeout(() => {
        easterEggNext.disabled = false;
        easterEggNext.classList.add("is-ready");
    }, 4000);
}

function showEasterEggImage(index) {
    easterEggIndex = index;

    // 사진 전환만 부드럽게
    easterEggImage.classList.add("is-changing");

    setTimeout(() => {
        easterEggImage.src = easterEggImages[easterEggIndex];

        easterEggImage.onload = () => {
            easterEggImage.classList.remove("is-changing");
        };

        lockEasterEggNext();
    }, 250);
}

// 메인화면 왼쪽 아래 액자 클릭
easterEggTrigger.addEventListener("click", () => {
    easterEggIndex = 0;

    easterEggViewer.classList.add("is-open");
    easterEggViewer.setAttribute("aria-hidden", "false");

    showEasterEggImage(0);
});

// 다음 화살표 클릭
easterEggNext.addEventListener("click", () => {
    if (easterEggNext.disabled) return;

    if (easterEggIndex < easterEggImages.length - 1) {
        showEasterEggImage(easterEggIndex + 1);
    }
});

