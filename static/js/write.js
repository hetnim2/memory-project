/** 익명 추억 작성 폼의 글자 수와 저장 API 호출을 관리합니다. */

import { memoriesApi } from './api.js';

const memoryForm = document.getElementById('memoryForm');
const targetNameInput = document.getElementById('targetName');
const memoryContentInput = document.getElementById('memoryContent');
const characterCount = document.getElementById('characterCount');
const submitButton = document.getElementById('submitButton');
const formMessage = document.getElementById('formMessage');
const findMemoryButton = document.getElementById('findMemoryButton');

// 모바일 write 화면 전용
const isMobileWrite = window.matchMedia('(max-width: 767px)').matches;
const pcVideo = document.querySelector('.pc-only');
const mobileVideoElement = document.querySelector('.mobile-only');
const memoryMaxLength = isMobileWrite ? 80 : 100;
memoryContentInput.maxLength = memoryMaxLength;
document.getElementById('characterMax').textContent = memoryMaxLength;
if (isMobileWrite) {
    if (mobileVideoElement) {
        mobileVideoElement.src = mobileVideoElement.dataset.src;
        mobileVideoElement.load();
    }
} else {
    if (pcVideo) {
        pcVideo.src = pcVideo.dataset.src;
        pcVideo.load();
    }
}
if (isMobileWrite) {
    const writeStage = document.querySelector('.write-stage');
    const mobileVideo = document.querySelector('.mobile-only');

    // 키보드 떠도 처음 화면 높이를 유지
    const initialHeight = window.innerHeight;

    if (writeStage) {
        writeStage.style.height = `${initialHeight}px`;
        writeStage.style.minHeight = `${initialHeight}px`;
        writeStage.style.maxHeight = `${initialHeight}px`;
    }

    // 모바일 영상 준비 전 재생 아이콘이 보이지 않도록 처리
    if (mobileVideo) {
        mobileVideo.style.opacity = '0';

        const showMobileVideo = () => {
            mobileVideo.style.opacity = '1';
        };

        if (mobileVideo.readyState >= 2) {
            showMobileVideo();
        } else {
            mobileVideo.addEventListener('loadeddata', showMobileVideo, { once: true });
        }

        mobileVideo.play().catch(() => {});
    }
}
/** 추억 입력 글자 수를 화면에 바로 표시합니다. */
memoryContentInput.addEventListener('input', () => {
    characterCount.textContent = memoryContentInput.value.length;
});


/* 작성 내용을 FastAPI에 저장합니다. */
memoryForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
        target_name: targetNameInput.value.trim(),
        memory_content: memoryContentInput.value.trim()
    };

    if (!payload.target_name || !payload.memory_content) {
        formMessage.className = 'form-message error';
        formMessage.textContent = '대상 이름과 추억 내용을 모두 입력해 주세요.';
        return;
    }

    submitButton.disabled = true;
    formMessage.textContent = '저장 중입니다...';

    try {
        await memoriesApi.create(payload);
        formMessage.className = 'form-message';
formMessage.textContent = '저장완료';

setTimeout(() => {
    if (formMessage.textContent === '저장완료') {
        formMessage.textContent = '';
    }
}, 4000);
        
    } catch (error) {
        formMessage.className = 'form-message error';
        formMessage.textContent = error.message;
    } finally {
        submitButton.disabled = false;
    }
});


/** 영상 속 추억 찾기 영역을 누르면 메인 화면으로 돌아갑니다. */
findMemoryButton.addEventListener('click', () => {
    window.location.href = '/search';
});
