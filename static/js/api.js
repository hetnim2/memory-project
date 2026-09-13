/** FastAPI와 JSON을 주고받는 공통 통신 함수입니다. */

export class ApiError extends Error {
    /** HTTP 상태 코드까지 보관해 401 로그인 오류 등을 구분합니다. */
    constructor(message, status) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}


/** fetch의 반복 코드를 모으고 서버 오류 문장을 일관되게 처리합니다. */
async function requestJson(url, options = {}) {
    const requestOptions = {
        credentials: 'same-origin',
        ...options
    };

    if (requestOptions.body && typeof requestOptions.body !== 'string') {
        requestOptions.headers = {
            'Content-Type': 'application/json',
            ...requestOptions.headers
        };
        requestOptions.body = JSON.stringify(requestOptions.body);
    }

    const response = await fetch(url, requestOptions);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new ApiError(data.error || '서버 요청을 처리하지 못했습니다.', response.status);
    }

    return data;
}


export const authApi = {
    register(payload) {
        return requestJson('/api/auth/register', { method: 'POST', body: payload });
    },

    login(payload) {
        return requestJson('/api/auth/login', { method: 'POST', body: payload });
    },

    logout() {
        return requestJson('/api/auth/logout', { method: 'POST' });
    },

    currentUser() {
        return requestJson('/api/auth/me');
    }
};


export const memoriesApi = {
    findByName(targetName) {
        const query = new URLSearchParams({ name: targetName });
        return requestJson(`/api/memories?${query.toString()}`);
    },

    create(payload) {
        return requestJson('/api/memories', { method: 'POST', body: payload });
    }
};
