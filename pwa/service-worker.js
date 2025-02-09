const CACHE_NAME = "natura-link-cache-v68";
const OFFLINE_PAGE = "/pwa/offline.html";

// ✅ `offline.html`을 메모리에 저장하기 위한 변수
let offlinePageBlob = null;

// ✅ Persistent Storage 요청 (자동 삭제 방지)
async function requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
        const isPersistent = await navigator.storage.persist();
        console.log(`📌 Persistent Storage 적용됨: ${isPersistent ? "✅ 성공" : "❌ 실패"}`);
    }
}

// ✅ `offline.html`을 메모리에 저장 (Cache Storage 삭제 방지)
async function saveOfflinePageToMemory(response) {
    offlinePageBlob = await response.blob();
    console.log("✅ `offline.html`을 메모리에 저장 완료!");
}

// ✅ `offline.html` 복구 (Cache Storage & IndexedDB가 삭제된 경우)
async function restoreOfflinePage() {
    if (offlinePageBlob) {
        console.log("✅ 메모리에서 `offline.html` 복구!");
        return new Response(offlinePageBlob, { headers: { "Content-Type": "text/html" } });
    }

    return new Response("<h1>오프라인 상태입니다</h1>", {
        headers: { "Content-Type": "text/html" }
    });
}

// ✅ 서비스 워커 설치 및 정적 파일 캐싱
self.addEventListener("install", (event) => {
    console.log("📦 서비스 워커 설치 중...");

    event.waitUntil(
        (async () => {
            await requestPersistentStorage(); // ✅ Persistent Storage 설정

            const cache = await caches.open(CACHE_NAME);
            try {
                const response = await fetch(OFFLINE_PAGE, { cache: "reload" });
                if (!response.ok) throw new Error(`❌ ${OFFLINE_PAGE} - ${response.status} 오류`);

                await cache.put(OFFLINE_PAGE, response.clone());
                await saveOfflinePageToMemory(response.clone()); // ✅ 메모리에 저장
                console.log("✅ `offline.html` 강제 캐싱 및 메모리 저장 완료!");
            } catch (error) {
                console.error("❌ `offline.html` 캐싱 실패:", error);
            }
        })().then(() => self.skipWaiting())
    );
});

// ✅ 네트워크 요청 실패 시 `offline.html` 반환 (자동 복구 기능 추가)
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        (async () => {
            try {
                return await fetch(event.request);
            } catch (error) {
                console.warn(`🚨 네트워크 연결 실패! 요청 URL: ${event.request.url}`);

                const cache = await caches.open(CACHE_NAME);
                let response = await cache.match(OFFLINE_PAGE);

                if (!response) {
                    console.warn("⚠️ `offline.html`이 Cache Storage에서 사라짐! 메모리 복구 시도...");
                    response = await restoreOfflinePage();
                }

                return response;
            }
        })()
    );
});

// ✅ 기존 캐시 유지 + `offline.html` 복구
self.addEventListener("activate", (event) => {
    console.log("🚀 서비스 워커 활성화!");
    event.waitUntil(restoreOfflinePage());
});
