/** 익명 추억 작성 폼의 글자 수와 저장 API 호출을 관리합니다. */

import { memoriesApi } from './api.js';

const memoryForm = document.getElementById('memoryForm');
const targetNameInput = document.getElementById('targetName');
const memoryContentInput = document.getElementById('memoryContent');
const characterCount = document.getElementById('characterCount');
const submitButton = document.getElementById('submitButton');
const formMessage = document.getElementById('formMessage');
const findMemoryButton = document.getElementById('findMemoryButton');


/** 추억 입력 글자 수를 화면에 바로 표시합니다. */
memoryContentInput.addEventListener('input', () => {
    characterCount.textContent = memoryContentInput.value.length;
});


/** 작성 내용을 FastAPI에 저장하고 성공하면 검색 화면으로 이동합니다. */
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
        window.location.href = '/search';
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
