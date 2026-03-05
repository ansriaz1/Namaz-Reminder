const CACHE_NAME="namaz-tracker-v5";

self.addEventListener("install",e=>{
    self.skipWaiting();
});

self.addEventListener("activate",e=>{
    e.waitUntil(
        caches.keys().then(keys=>{
            return Promise.all(
                keys.map(k=>{
                    if(k!==CACHE_NAME) return caches.delete(k);
                })
            );
        })
    );
});
