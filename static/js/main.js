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
const mobileMemoryView = document.getElementById('mobileMemoryView');
const mobileMemoryVideo = document.getElementById('mobileMemoryVideo');
const nameInput = document.getElementById('nameInput');
const searchButton = document.getElementById('searchButton');
const searchMessage = document.getElementById('searchMessage');
const mobileNameInput = document.getElementById('mobileNameInput');
const mobileSearchButton = document.getElementById('mobileSearchButton');
const memoryBgm = new Audio('/static/audio/Moonlight.mp3');
memoryBgm.volume = 0.5;
memoryBgm.loop = true;
mobileSearchButton.addEventListener('pointerdown', () => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return;

    memoryBgm.currentTime = 0;
    memoryBgm.volume = 0;

    memoryBgm.play().catch((err) => {
        console.log('BGM 활성화 실패:', err);
    });
});


/** 해시 주소와 hidden 속성을 함께 바꿔 메인·로그인·추억 화면을 전환합니다. */
function showScreen(screenName, pushHistory = true) {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
if (screenName === 'memory' ) {
    memoryBgm.currentTime = 0;
    memoryBgm.volume = 0.5;

    if (memoryBgm.paused) {
        memoryBgm.play().catch((err) => {
            console.log('BGM 재생 실패:', err);
        });
    }
} else {
    memoryBgm.pause();
    memoryBgm.currentTime = 0;
}
    mainScreen.hidden = screenName !== 'main';
    loginView.hidden = screenName !== 'login';

    if (screenName === 'memory' && isMobile) {
    // 모바일 메모리 화면
    memoryView.hidden = true;

    mobileMemoryView.classList.add('active');
    mobileMemoryView.setAttribute('aria-hidden', 'false');

    renderMemoryPage();

    memoryVideo.pause();
    mobileMemoryVideo.currentTime = 0;
    mobileMemoryVideo.play().catch(() => {});
    } else if (screenName === 'memory') {
        // PC 메모리 화면
        memoryView.hidden = false;

        mobileMemoryView.classList.remove('active');
        mobileMemoryView.setAttribute('aria-hidden', 'true');

        mobileMemoryVideo.pause();

        renderMemoryPage();
        memoryVideo.play().catch(() => {});
    } else {
        // 메모리 화면이 아닐 때
        memoryView.hidden = true;

        mobileMemoryView.classList.remove('active');
        mobileMemoryView.setAttribute('aria-hidden', 'true');

        memoryVideo.pause();
        mobileMemoryVideo.pause();
    }

    if (pushHistory) {
        const hash = screenName === 'main' ? '#' : `#${screenName}`;
        history.pushState({ screen: screenName }, '', hash);
    }
}


/** 입력한 이름으로 서버 API를 호출하고 추억 화면을 엽니다. */
async function loadMemoriesByName(inputElement = nameInput) {
    const targetName = inputElement.value.trim();

    if (!targetName) {
        if (inputElement === nameInput) {
            searchMessage.textContent = '이름을 입력해 주세요.';
        } else {
            alert('이름을 입력해 주세요.');
        }
        return;
    }

    inputElement.disabled = true;

    if (inputElement === nameInput) {
        searchMessage.textContent = '추억을 불러오는 중입니다...';
    }

    try {
        const data = await memoriesApi.findByName(targetName);
        setMemories(data.memories || [], targetName);

        if (inputElement === nameInput) {
            searchMessage.textContent = '';
        }

        showScreen('memory');
    } catch (error) {
        if (inputElement === nameInput) {
            searchMessage.textContent = error.message;
        } else {
            alert(error.message);
        }
    } finally {
        inputElement.disabled = false;
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

        memoryBgm.currentTime = 0;
        memoryBgm.volume = 0.25;
        memoryBgm.play().catch((err) => {
            console.log('PC BGM 재생 실패:', err);
        });

        loadMemoriesByName();
    }
});

searchButton.addEventListener('click', () => {
    memoryBgm.currentTime = 0;
    memoryBgm.volume = 0.25;
    memoryBgm.play().catch((err) => {
        console.log('PC BGM 재생 실패:', err);
    });

    loadMemoriesByName();
});
    mobileNameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        loadMemoriesByName(mobileNameInput);
    }
});

mobileSearchButton.addEventListener('click', () => {
    loadMemoriesByName(mobileNameInput);
});
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
const easterEggMusic = document.getElementById("easterEggMusic");

function startEasterEggMusic() {
    if (!easterEggMusic) return;

    easterEggMusic.pause();
    easterEggMusic.currentTime = 0;
    easterEggMusic.volume = 0.7;

    easterEggMusic.play().catch(() => {
        console.log("이스터에그 음악 재생이 차단되었습니다.");
    });
}

function stopEasterEggMusic() {
    if (!easterEggMusic) return;

    easterEggMusic.pause();
    easterEggMusic.currentTime = 0;
}
const easterEggImages = [
    "/static/assets/images/easteregg/1.png",
    "/static/assets/images/easteregg/2.png",
    "/static/assets/images/easteregg/3.png",
    "/static/assets/images/easteregg/4.png",
    "/static/assets/images/easteregg/5.png",
    "/static/assets/images/easteregg/6.png",
    "/static/assets/images/easteregg/7.png",
    "/static/assets/images/easteregg/8.png",
    "/static/assets/images/easteregg/9.png"
  
];

let easterEggIndex = 0;
let easterEggTimer = null;


function lockEasterEggNext() {
    clearTimeout(easterEggTimer);

    easterEggNext.disabled = true;
    easterEggNext.classList.remove("is-ready", "is-last");

   if (easterEggIndex === easterEggImages.length - 1) {
    easterEggNext.innerHTML =
        `<span class="go-home-text">처음으로</span><span class="go-home-arrow">↗</span>`;
    easterEggNext.setAttribute("aria-label", "처음 화면으로");

    easterEggTimer = setTimeout(() => {
        easterEggNext.classList.add("is-last", "is-ready");
        easterEggNext.disabled = false;
    }, 4500);

    return;
}
    

    // 나머지 사진: 화살표는 4초 후 표시
    easterEggNext.innerHTML =
        '<span class="go-home-arrow">→</span>';

    easterEggNext.setAttribute("aria-label", "다음");

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
startEasterEggMusic();
    easterEggViewer.classList.add("is-open");
    easterEggViewer.setAttribute("aria-hidden", "false");

    showEasterEggImage(0);
});

// 다음 화살표 클릭
easterEggNext.addEventListener("click", () => {
    if (easterEggNext.disabled) return;

    if (easterEggIndex < easterEggImages.length - 1) {
        showEasterEggImage(easterEggIndex + 1);
  } else {
    stopEasterEggMusic();
    window.location.href = '/';
}
});
// ==============================
// 모바일 이스터에그
// ==============================

const mobileEasterEggTrigger =
    document.getElementById("mobileEasterEggTrigger");

const mobileEasterEggViewer =
    document.getElementById("mobileEasterEggViewer");

const mobileEasterEggImage =
    document.getElementById("mobileEasterEggImage");

const mobileEasterEggNext =
    document.getElementById("mobileEasterEggNext");

const mobileEasterEggImages = [
    "/static/assets/images/easteregg/1.png",
    "/static/assets/images/easteregg/2.png",
    "/static/assets/images/easteregg/3.png",
    "/static/assets/images/easteregg/4.png",
    "/static/assets/images/easteregg/5.png",
    "/static/assets/images/easteregg/6.png",
    "/static/assets/images/easteregg/7.png",
    "/static/assets/images/easteregg/8.png",
    "/static/assets/images/easteregg/9.png"
];

let mobileEasterEggIndex = 0;
let mobileEasterEggTimer = null;

function lockMobileEasterEggNext() {
    clearTimeout(mobileEasterEggTimer);

    mobileEasterEggNext.disabled = true;

    mobileEasterEggTimer = setTimeout(() => {
        mobileEasterEggNext.disabled = false;
    }, 4000);
}

function showMobileEasterEggImage(index) {
    mobileEasterEggIndex = index;

    mobileEasterEggImage.classList.add("is-changing");

    setTimeout(() => {
        mobileEasterEggImage.src =
            mobileEasterEggImages[mobileEasterEggIndex];

        mobileEasterEggImage.onload = () => {
            mobileEasterEggImage.classList.remove("is-changing");
        };

        if (mobileEasterEggIndex === mobileEasterEggImages.length - 1) {
            mobileEasterEggNext.innerHTML =
                '<span class="go-home-text">처음으로</span><span class="go-home-arrow">→</span>';
            mobileEasterEggNext.setAttribute("aria-label", "처음 화면으로");
        } else {
            mobileEasterEggNext.innerHTML =
                '<span class="go-home-arrow">→</span>';
            mobileEasterEggNext.setAttribute("aria-label", "다음");
        }

        lockMobileEasterEggNext();
    }, 250);
}

mobileEasterEggTrigger.addEventListener("click", () => {
    mobileEasterEggIndex = 0;
    startEasterEggMusic();
    mobileEasterEggViewer.classList.add("active");
    mobileEasterEggViewer.setAttribute("aria-hidden", "false");

    showMobileEasterEggImage(0);
});

mobileEasterEggNext.addEventListener("click", () => {
    if (mobileEasterEggNext.disabled) return;

    if (
        mobileEasterEggIndex <
        mobileEasterEggImages.length - 1
    ) {
        showMobileEasterEggImage(
            mobileEasterEggIndex + 1
        );
    } else {
        stopEasterEggMusic();
        history.back();
    }
});
