const CACHE_NAME = "natura-link-cache-v58";  // ✅ 최신 캐시 버전
const OFFLINE_PAGE = "/pwa/offline.html";  // ✅ 오프라인 페이지 경로

const STATIC_ASSETS = [
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
];

// ✅ Persistent Storage 요청 (IndexedDB가 삭제되지 않도록 설정)
async function requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
        const isPersistent = await navigator.storage.persist();
        console.log(`📌 Persistent Storage 적용됨: ${isPersistent ? "✅ 성공" : "❌ 실패"}`);
    }
}

// ✅ IndexedDB에 데이터 저장 (자동 백업)
async function saveToIndexedDB(key, response) {
    try {
        const blob = await response.blob();
        const dbRequest = indexedDB.open("OfflineCache", 1);

        dbRequest.onupgradeneeded = () => {
            const db = dbRequest.result;
            db.createObjectStore("files");
        };

        dbRequest.onsuccess = () => {
            const db = dbRequest.result;
            const transaction = db.transaction("files", "readwrite");
            const store = transaction.objectStore("files");
            store.put(blob, key);
            console.log(`✅ IndexedDB에 저장 완료: ${key}`);
        };

        dbRequest.onerror = (event) => {
            console.error("❌ IndexedDB 오류:", event.target.error);
        };

        // ✅ IndexedDB에 저장 후 Cache Storage에도 백업
        await backupOfflinePageToCache(response);
    } catch (error) {
        console.error("❌ IndexedDB 저장 실패:", error);
    }
}

// ✅ IndexedDB에서 데이터 가져오기
async function getFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open("OfflineCache", 1);

        dbRequest.onsuccess = () => {
            const db = dbRequest.result;
            const transaction = db.transaction("files", "readonly");
            const store = transaction.objectStore("files");
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result ? new Response(request.result) : null);
            };

            request.onerror = () => reject(request.error);
        };

        dbRequest.onerror = () => reject(dbRequest.error);
    });
}

// ✅ Cache Storage에 `offline.html` 백업
async function backupOfflinePageToCache(response) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(OFFLINE_PAGE, response);
    console.log("✅ `offline.html`을 Cache Storage에 백업 완료!");
}

// ✅ IndexedDB 삭제 시 `offline.html`을 Cache Storage에서 복구
async function restoreOfflinePageFromCache() {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(OFFLINE_PAGE);
    if (cachedResponse) {
        console.log("✅ Cache Storage에서 `offline.html` 복구!");
        await saveToIndexedDB(OFFLINE_PAGE, cachedResponse);
    }
}

// ✅ 서비스 워커 설치 및 `offline.html` 강제 캐싱
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
                await saveToIndexedDB(OFFLINE_PAGE, response);
                console.log("✅ `offline.html` 강제 캐싱 및 IndexedDB 저장 완료!");
            } catch (error) {
                console.error("❌ `offline.html` 캐싱 실패:", error);
            }

            try {
                await cache.addAll(STATIC_ASSETS);
                console.log("✅ 정적 파일 캐싱 완료!");
            } catch (error) {
                console.error("❌ 정적 파일 캐싱 실패:", error);
            }
        })().then(() => self.skipWaiting())
    );
});

// ✅ 네트워크 요청 실패 시 `offline.html` 반환 (IndexedDB 백업 활용)
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        (async () => {
            try {
                return await fetch(event.request);
            } catch (error) {
                console.warn(`🌐 네트워크 오류 발생! 요청 URL: ${event.request.url}`);
                const cache = await caches.open(CACHE_NAME);

                if (event.request.mode === "navigate") {
                    console.warn("🛑 `navigate` 요청 감지 - offline.html 반환 시도");
                    let response = await cache.match(OFFLINE_PAGE);
                    
                    if (!response) {
                        try {
                            response = await getFromIndexedDB(OFFLINE_PAGE);
                            console.log("✅ IndexedDB에서 `offline.html` 반환!");
                        } catch (err) {
                            console.error(err);
                        }
                    }

                    return response || new Response("<h1>오프라인 상태입니다</h1>", {
                        headers: { "Content-Type": "text/html" }
                    });
                }

                return await cache.match(event.request) || new Response("<h1>오프라인 상태입니다</h1>", {
                    headers: { "Content-Type": "text/html" }
                });
            }
        })()
    );
});

// ✅ 기존 캐시 삭제하되, IndexedDB가 삭제되었을 경우 복구하도록 설정
self.addEventListener("activate", (event) => {
    console.log("🚀 새로운 서비스 워커 활성화!");
    event.waitUntil(restoreOfflinePageFromCache());
});
