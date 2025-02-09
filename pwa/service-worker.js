const CACHE_NAME = "natura-link-cache-v73";
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

// ✅ `offline.html` 복구 (오프라인일 때 실행)
async function restoreOfflinePage() {
    if (!navigator.onLine) { // ✅ 오프라인 상태일 때만 복구
        if (offlinePageBlob) {
            console.log("✅ 메모리에서 `offline.html` 복구!");
            return new Response(offlinePageBlob, { headers: { "Content-Type": "text/html" } });
        }
    }

    // ✅ 만약 메모리에 없으면 Cache Storage에서 다시 로드
    const cache = await caches.open(CACHE_NAME);
    let response = await cache.match(OFFLINE_PAGE);
    if (response) {
        console.log("✅ Cache Storage에서 `offline.html` 복구!");
        return response;
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

            try {
                await cache.addAll([
                    "/index.html",
                    "/js/script.js",
                    "/js/chat.js",
                    "/js/pwa.js",
                    "/pwa/manifest.json",
                    "/pwa/service-worker.js",
                    "/css/base.css",
                    "/css/layout.css",
                    "/css/components.css",
                    "/css/chat.css",
                    "/favicons/favicon-16x16.png",
                    "/favicons/favicon-32x32.png",
                    "/favicons/favicon.ico",
                    "/assets/icon/android-chrome-192x192.png",
                    "/assets/icon/android-chrome-512x512.png"
                ]);
                console.log("✅ 정적 파일 캐싱 완료!");
            } catch (error) {
                console.error("❌ 정적 파일 캐싱 실패:", error);
            }
        })().then(() => self.skipWaiting())
    );
});

// ✅ 네트워크 요청 실패 시 `offline.html` 반환 (강제 복구)
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        (async () => {
            try {
                return await fetch(event.request);
            } catch (error) {
                console.warn(`🚨 네트워크 연결 실패! 요청 URL: ${event.request.url}`);

                if (event.request.url.includes(OFFLINE_PAGE)) {
                    console.log("✅ `offline.html` 직접 반환!");
                    return await restoreOfflinePage();
                }

                const cache = await caches.open(CACHE_NAME);
                let response = await cache.match(event.request);

                if (!response) {
                    console.warn("⚠️ 캐시에서 요청된 리소스를 찾을 수 없음. `offline.html` 제공...");
                    response = await restoreOfflinePage();
                }

                return response;
            }
        })()
    );
});

// ✅ 서비스 워커 활성화 시 `offline.html`을 미리 로드하여 오프라인에서도 즉시 사용 가능하도록 변경
self.addEventListener("activate", (event) => {
    console.log("🚀 서비스 워커 활성화!");
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            let response = await cache.match(OFFLINE_PAGE);

            if (!response) {
                console.warn("⚠️ `offline.html`이 Cache Storage에서 사라짐! 다시 다운로드...");
                try {
                    response = await fetch(OFFLINE_PAGE);
                    if (response.ok) {
                        await cache.put(OFFLINE_PAGE, response.clone());
                        await saveOfflinePageToMemory(response.clone());
                        console.log("✅ `offline.html` 복구 완료!");
                    }
                } catch (error) {
                    console.error("❌ `offline.html` 복구 실패:", error);
                }
            }
        })()
    );
});
