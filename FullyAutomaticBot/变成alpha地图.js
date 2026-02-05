// ==UserScript==
// @name Screeps Force Alpha Map (Universal, No onViewChange) A56
// @match https://screeps.com/a/*
// @grant none
// @run-at document-idle
// ==/UserScript==

function wait(get, cb) {
    let i = setInterval(() => {
        let v;
        try { v = get(); } catch { }
        if (v) {
            clearInterval(i);
            cb(v);
        }
    }, 200);
}

// ① Hook goToMap —— 无论从哪进入房间，点地图就跳 alpha
wait(() => angular.element(document.body).injector().get("Room"), (Room) => {
    const proto = Room.prototype;
    if (proto.__patched) return;
    proto.__patched = true;

    const old = proto.goToMap;
    proto.goToMap = function () {
        try {
            const $r = angular.element(document.body).injector().get("$routeSegment");
            const $l = angular.element(document.body).injector().get("$location");
            let room = $r.$routeParams.room;
            if (room) {
                let xy = angular.element(document.body).injector().get("MapUtils").roomNameToXY(room);
                $l.url($r.getSegmentUrl("top.map2shard") + `?pos=${xy[0] + 0.5},${xy[1] + 0.5}`);
                console.log("[AlphaMap] forced from goToMap →", room);
                return;
            }
        } catch (e) { }
        return old.apply(this, arguments);
    };
});


// ② 拦截 URL hash，只要用户进入旧地图 /map/shardX → 强制跳 AlphaMap
wait(() => angular.element(document.body).injector().get("$location"), ($l) => {
    let last = null;
    setInterval(() => {
        let url = $l.url();
        if (url !== last) {
            last = url;
            if (url.includes("/map/") && !url.includes("map2shard")) {
                const $r = angular.element(document.body).injector().get("$routeSegment");
                let room = $r.$routeParams.room;
                if (room) {
                    let xy = angular.element(document.body).injector().get("MapUtils").roomNameToXY(room);
                    $l.url($r.getSegmentUrl("top.map2shard") + `?pos=${xy[0] + 0.5},${xy[1] + 0.5}`);
                    console.log("[AlphaMap] redirect:", room);
                }
            }
        }
    }, 300);
});

console.log("%c[Screeps AlphaMap → 强制启用，全 shard 生效]", "color:#00ff91;font-size:14px");
