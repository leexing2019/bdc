// Smart Memo Service Worker
// 提供离线缓存支持

const CACHE_NAME = 'smart-memo-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
]

// 安装时缓存静态资源
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// 激活时清理旧缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// 网络优先策略（API 请求）
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// 缓存优先策略（静态资源）
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  const networkResponse = await fetch(request)
  if (networkResponse.ok) {
    const cache = await caches.open(CACHE_NAME)
    cache.put(request, networkResponse.clone())
  }
  return networkResponse
}

// 拦截请求
self.addEventListener('fetch', (e) => {
  const { request } = e
  const url = new URL(request.url)

  // API 请求：网络优先
  if (url.pathname.includes('/rest/v1/')) {
    e.respondWith(networkFirst(request))
    return
  }

  // 静态资源：缓存优先
  if (request.method === 'GET') {
    e.respondWith(cacheFirst(request))
    return
  }

  // 其他请求：直接网络
  e.respondWith(fetch(request))
})
