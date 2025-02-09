const CACHE_NAME = "natura-link-cache-v21";  // ✅ 캐시 버전 업데이트!
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
    "/favicons/favicon.ico"
];

// ✅ PNG 아이콘이 존재하는 경우에만 추가 (404 방지)
const ICONS = [
    "/assets/icons/android-chrome-192x192.png",
    "/assets/icons/android-chrome-512x512.png"
];

// ✅ 서비스 워커 설치 및 `offline.html` 강제 캐싱
self.addEventListener("install", (event) => {
    console.log("📦 서비스 워커 설치 중...");
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            try {
                const offlineResponse = await fetch(OFFLINE_PAGE, { cache: "reload" });
                if (!offlineResponse.ok) throw new Error(`❌ ${OFFLINE_PAGE} - ${offlineResponse.status} 오류`);
                await cache.put(OFFLINE_PAGE, offlineResponse);
                console.log(`✅ 캐싱 성공: ${OFFLINE_PAGE}`);
            } catch (error) {
                console.warn(`⚠️ 캐싱 실패: ${OFFLINE_PAGE}`, error);
            }

            // ✅ 정적 파일 캐싱
            await Promise.all(STATIC_ASSETS.map(async (url) => {
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`❌ ${url} - ${response.status} 오류`);
                    await cache.put(url, response);
                    console.log(`✅ 캐싱 성공: ${url}`);
                } catch (error) {
                    console.warn(`⚠️ 캐싱 실패: ${url}`, error);
                }
            }));

            // ✅ 아이콘 파일이 존재하는 경우에만 캐싱
            await Promise.all(ICONS.map(async (icon) => {
                try {
                    const response = await fetch(icon);
                    if (response.ok) {
                        await cache.put(icon, response);
                        console.log(`✅ 아이콘 캐싱 성공: ${icon}`);
                    } else {
                        console.warn(`⚠️ 아이콘 없음 (건너뜀): ${icon}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ 아이콘 캐싱 실패 (건너뜀): ${icon}`, error);
                }
            }));

        }).then(() => self.skipWaiting())
    );
});

// ✅ 네트워크 우선, 실패 시 캐시 사용
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    // ✅ API 요청 (예: Netlify 서버리스 함수) → 네트워크 우선
    if (event.request.url.includes("/.netlify/functions/")) {
        return event.respondWith(fetch(event.request));
    }

    // ✅ 정적 파일 요청 (CSS, JS, 이미지) → 캐시 우선
    if (event.request.url.includes("/css/") || 
        event.request.url.includes("/js/") || 
        event.request.url.includes("/assets/") || 
        event.request.url.includes("/favicons/")) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                return cachedResponse || fetch(event.request).then((response) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                });
            })
        );
        return;
    }

    // ✅ 기타 요청 → 네트워크 우선, 실패 시 `offline.html` 반환
    event.respondWith(
        fetch(event.request)
            .then((response) => response)
            .catch(async () => {
                console.warn("🌐 네트워크 오류 발생! offline.html 반환");
                const cache = await caches.open(CACHE_NAME);
                return (await cache.match(OFFLINE_PAGE)) || new Response("<h1>오프라인 상태입니다</h1>", {
                    headers: { "Content-Type": "text/html" }
                });
            })
    );
});

// ✅ 이전 캐시 삭제 및 서비스 워커 강제 업데이트
self.addEventListener("activate", (event) => {
    console.log("🚀 새로운 서비스 워커 활성화!");
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cache) => cache !== CACHE_NAME)
                    .map((cache) => caches.delete(cache))
            );
        }).then(() => self.clients.claim())
    );
});
