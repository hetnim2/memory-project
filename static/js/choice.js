/** 시작 화면에서 검색·기록 배경을 미리 보여 주고 선택한 주소로 이동합니다. */

const page = document.getElementById('choicePage');
const searchPreview = document.getElementById('searchPreview');
const writePreview = document.getElementById('writePreview');
const cards = [...document.querySelectorAll('[data-choice]')];
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const destinations = {
    search: '/search',
    write: '/write'
};

let lockedChoice = '';
let activeChoice = '';


/** 뒤로가기로 돌아왔을 때 이전 선택 잠금을 없애 첫 화면으로 복원합니다. */
function resetChoicePage() {
    lockedChoice = '';
    activeChoice = '';
    delete page.dataset.active;
    delete page.dataset.locked;
    searchPreview.pause();
    writePreview.pause();
}


/** 선택한 쪽 영상 하나만 재생합니다. */
function activatePreview(choice) {
    if (!choice || choice === activeChoice || (lockedChoice && lockedChoice !== choice)) {
        return;
    }

    activeChoice = choice;
    page.dataset.active = choice;

    const activeVideo = choice === 'search' ? searchPreview : writePreview;
    const inactiveVideo = choice === 'search' ? writePreview : searchPreview;
    inactiveVideo.pause();

    if (!reducedMotion.matches) {
        activeVideo.play().catch(() => {});
    }
}


/** 클릭·터치 후에는 마우스 위치보다 선택 결과를 우선합니다. */
function choose(choice) {
    if (lockedChoice) {
        return;
    }

    lockedChoice = choice;
    activeChoice = '';
    activatePreview(choice);
    page.dataset.active = choice;
    page.dataset.locked = choice;

    const selectedVideo = choice === 'search' ? searchPreview : writePreview;
    const unselectedVideo = choice === 'search' ? writePreview : searchPreview;
    unselectedVideo.pause();
    if (!reducedMotion.matches) {
        selectedVideo.play().catch(() => {});
    }

    window.setTimeout(() => {
        window.location.assign(destinations[choice]);
    }, reducedMotion.matches ? 0 : 520);
}


/** PC에서는 화면의 왼쪽·오른쪽 위치에 따라 미리보기를 바꿉니다. */
page.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || lockedChoice) {
        return;
    }

    const stage = page.querySelector('.choice-stage').getBoundingClientRect();
    activatePreview(event.clientX < stage.left + stage.width / 2 ? 'search' : 'write');
});

cards.forEach((card) => {
    const choice = card.dataset.choice;
    card.addEventListener('focus', () => activatePreview(choice));
    card.addEventListener('click', () => choose(choice));
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        searchPreview.pause();
        writePreview.pause();
    }
});

window.addEventListener('pageshow', resetChoicePage);
