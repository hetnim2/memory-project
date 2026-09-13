/** 추억 8개씩 10페이지 표시하고 글자 크기를 맞추는 화면 로직입니다. */

const NOTES_PER_PAGE = 8;
const MAX_PAGES = 10;
const WIKIMEDIA_BASE = 'https://upload.wikimedia.org/wikipedia/commons/';

const SIGNATURES = [
    [`${WIKIMEDIA_BASE}c/cd/Vincent_van_Gogh_signature_%28Vincent%29.svg`, 0.90],
    [`${WIKIMEDIA_BASE}7/70/Edvard_Munch%2C_signature.svg`, 0.95],
    [`${WIKIMEDIA_BASE}0/01/A._Einstein%27s_Signature.png`, 0.95],
    [`${WIKIMEDIA_BASE}5/57/Signature_Marie_Curie.svg`, 0.90],
    [`${WIKIMEDIA_BASE}b/b1/TeslaSignature.svg`, 0.90],
    [`${WIKIMEDIA_BASE}e/eb/Picasso_signature.svg`, 0.95],
    [`${WIKIMEDIA_BASE}a/a3/Sign_of_Taejong_of_Joseon.svg`, 1.05],
    [`${WIKIMEDIA_BASE}d/df/King_Sejo_of_Joseon_Sugyeol_%28Kao%29.svg`, 1.00],
    [`${WIKIMEDIA_BASE}4/45/Sign_of_Jeongjo_of_Joseon.svg`, 1.05],
    [`${WIKIMEDIA_BASE}2/25/SunjoSignature.png`, 0.95]
].map(([src, scale]) => ({ src, scale }));

const shuffledSignatures = [...SIGNATURES].sort(() => Math.random() - 0.5);
const memoryView = document.getElementById('memoryView');
const noteBodies = [...document.querySelectorAll('.memory-body')];
const pageIndicator = document.getElementById('pageIndicator');
const previousButton = document.getElementById('prevPage');
const nextButton = document.getElementById('nextPage');

let pages = createPages([]);
let currentPageIndex = 0;


/** 서버의 1차원 추억 목록을 8개씩 10페이지 배열로 바꿉니다. */
function createPages(memories) {
    const result = Array.from(
        { length: MAX_PAGES },
        () => Array(NOTES_PER_PAGE).fill('')
    );

    memories.slice(0, NOTES_PER_PAGE * MAX_PAGES).forEach((memory, index) => {
        const pageIndex = Math.floor(index / NOTES_PER_PAGE);
        const noteIndex = index % NOTES_PER_PAGE;
        result[pageIndex][noteIndex] = memory;
    });

    return result;
}


/** 긴 글이 메모지 밖으로 넘치지 않도록 글자 크기를 조금씩 줄입니다. */
function fitTextToNote(textElement) {
    const note = textElement.parentElement;
    const stageWidth = memoryView.getBoundingClientRect().width;

    // 기본 글자 크기: 너무 크거나 작아지지 않게 제한
    let fontSize = Math.max(16, Math.min(20, stageWidth * 0.012));

    // 아무리 긴 글이라도 13px보다 작아지지 않음
    const minimumSize = 13;

    textElement.style.fontSize = `${fontSize}px`;

    while (
        (textElement.scrollHeight > note.clientHeight ||
         textElement.scrollWidth > note.clientWidth) &&
        fontSize > minimumSize
    ) {
        fontSize -= 0.5;

        if (fontSize < minimumSize) {
            fontSize = minimumSize;
        }

        textElement.style.fontSize = `${fontSize}px`;
    }
}


/** 짧은 메모의 오른쪽 아래에 장식용 서명을 추가합니다. */
function addSignature(noteBody, text, noteIndex) {
    const note = noteBody.closest('.memory-text');
    note.querySelectorAll('.memory-signature').forEach((image) => image.remove());

    if (!text || text.length > 50) {
        return;
    }

    const signatureIndex = currentPageIndex * NOTES_PER_PAGE + noteIndex;
    const signature = shuffledSignatures[signatureIndex % shuffledSignatures.length];
    const image = document.createElement('img');
    image.className = 'memory-signature';
    image.src = signature.src;
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');
    image.style.transform = `scale(${signature.scale})`;
    note.appendChild(image);
}


/** 현재 페이지의 8개 메모와 페이지 번호를 다시 그립니다. */
export function renderMemoryPage() {
    const currentPage = pages[currentPageIndex];

    noteBodies.forEach((noteBody, index) => {
        const text = currentPage[index] ?? '';
        noteBody.textContent = text;
        addSignature(noteBody, text, index);
    });

    pageIndicator.textContent = `${currentPageIndex + 1} / ${pages.length}`;
    previousButton.disabled = currentPageIndex === 0;
    nextButton.disabled = currentPageIndex === pages.length - 1;
    requestAnimationFrame(() => noteBodies.forEach(fitTextToNote));
}


/** 새 검색 결과를 넣고 항상 1페이지부터 표시합니다. */
export function setMemories(memories, targetName) {
    const memoryTexts = memories.map((memory) => memory.memory_content);
    pages = createPages(memoryTexts);
    currentPageIndex = 0;

    if (memoryTexts.length === 0) {
        pages[0][0] = `${targetName}님에게 아직 남겨진 추억이 없습니다.`;
    }
}


/** 페이지 버튼, 방향키와 창 크기 변경 동작을 한 번 연결합니다. */
export function initializeMemoryBoard() {
    previousButton.addEventListener('click', () => {
        if (currentPageIndex > 0) {
            currentPageIndex -= 1;
            renderMemoryPage();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentPageIndex < pages.length - 1) {
            currentPageIndex += 1;
            renderMemoryPage();
        }
    });

    window.addEventListener('keydown', (event) => {
        if (memoryView.hidden) {
            return;
        }
        if (event.key === 'ArrowLeft') {
            previousButton.click();
        }
        if (event.key === 'ArrowRight') {
            nextButton.click();
        }
    });

    window.addEventListener('resize', () => {
        if (!memoryView.hidden) {
            requestAnimationFrame(() => noteBodies.forEach(fitTextToNote));
        }
    });
}
