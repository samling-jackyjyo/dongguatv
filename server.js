require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const NodeCache = require('node-cache');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'db.json');
const CACHE_SEARCH_FILE = path.join(__dirname, 'cache_search.json');
const CACHE_DETAIL_FILE = path.join(__dirname, 'cache_detail.json');
const FORCE_UPDATE = true;  // 设为 true 时，启动时会合并 DEFAULT_SITES 中的新站点

// ========== 永久文件缓存系统 ==========
// 加载缓存
const loadCache = (file) => {
    try {
        if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) { console.error("Cache Load Error:", e); }
    return {};
};

// 保存缓存
const saveCache = (file, data) => {
    try {
        fs.writeFileSync(file, JSON.stringify(data), 'utf8');
    } catch (e) { console.error("Cache Save Error:", e); }
};

// 初始化缓存
let searchCache = loadCache(CACHE_SEARCH_FILE);
let detailCache = loadCache(CACHE_DETAIL_FILE);
console.log(`[Cache] 本地持久化缓存已加载 (搜索: ${Object.keys(searchCache).length}, 详情: ${Object.keys(detailCache).length})`);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// 默认接口配置 (保持你的 30+ 个接口不变)
const DEFAULT_SITES = [
    { key: "ffzy", name: "非凡影视", api: "https://api.ffzyapi.com/api.php/provide/vod", active: true },
    { key: "bfzy", name: "暴风资源", api: "https://bfzyapi.com/api.php/provide/vod", active: true },
    { key: "dyttzy", name: "电影天堂", api: "http://caiji.dyttzyapi.com/api.php/provide/vod", active: true },
    { key: "tyyszy", name: "天涯资源", api: "https://tyyszy.com/api.php/provide/vod", active: true },
    { key: "zy360", name: "360资源", api: "https://360zy.com/api.php/provide/vod", active: true },
    { key: "maotaizy", name: "茅台资源", api: "https://caiji.maotaizy.cc/api.php/provide/vod", active: true },
    { key: "wolong", name: "卧龙资源", api: "https://wolongzyw.com/api.php/provide/vod", active: true },
    { key: "jisu", name: "极速资源", api: "https://jszyapi.com/api.php/provide/vod", active: true },
    { key: "dbzy", name: "豆瓣资源", api: "https://dbzy.tv/api.php/provide/vod", active: true },
    { key: "mozhua", name: "魔爪资源", api: "https://mozhuazy.com/api.php/provide/vod", active: true },
    { key: "mdzy", name: "魔都资源", api: "https://www.mdzyapi.com/api.php/provide/vod", active: true },
    { key: "zuid", name: "最大资源", api: "https://api.zuidapi.com/api.php/provide/vod", active: true },
    { key: "yinghua", name: "樱花资源", api: "https://m3u8.apiyhzy.com/api.php/provide/vod", active: true },
    { key: "wujin", name: "无尽资源", api: "https://api.wujinapi.me/api.php/provide/vod", active: true },
    { key: "wwzy", name: "旺旺短剧", api: "https://wwzy.tv/api.php/provide/vod", active: true },
    { key: "ikun", name: "iKun资源", api: "https://ikunzyapi.com/api.php/provide/vod", active: true },
    { key: "lzi", name: "量子资源", api: "https://cj.lziapi.com/api.php/provide/vod", active: true },
    { key: "bdzy", name: "百度资源", api: "https://api.apibdzy.com/api.php/provide/vod", active: true },
    { key: "hongniuzy", name: "红牛资源", api: "https://www.hongniuzy2.com/api.php/provide/vod", active: true },
    { key: "xinlangaa", name: "新浪资源", api: "https://api.xinlangapi.com/xinlangapi.php/provide/vod", active: true },
    { key: "ckzy", name: "CK资源", api: "https://ckzy.me/api.php/provide/vod", active: true },
    { key: "ukuapi", name: "U酷资源", api: "https://api.ukuapi.com/api.php/provide/vod", active: true },
    { key: "1080zyk", name: "1080资源", api: "https://api.1080zyku.com/inc/apijson.php/", active: true },
    { key: "hhzyapi", name: "豪华资源", api: "https://hhzyapi.com/api.php/provide/vod", active: true },
    { key: "subocaiji", name: "速博资源", api: "https://subocaiji.com/api.php/provide/vod", active: true },
    { key: "p2100", name: "飘零资源", api: "https://p2100.net/api.php/provide/vod", active: true },
    { key: "aqyzy", name: "爱奇艺", api: "https://iqiyizyapi.com/api.php/provide/vod", active: true },
    { key: "yzzy", name: "优质资源", api: "https://api.yzzy-api.com/inc/apijson.php", active: true },
    { key: "myzy", name: "猫眼资源", api: "https://api.maoyanapi.top/api.php/provide/vod", active: true },
    { key: "rycj", name: "如意资源", api: "https://cj.rycjapi.com/api.php/provide/vod", active: true },
    { key: "jinyingzy", name: "金鹰点播", api: "https://jinyingzy.com/api.php/provide/vod", active: true },
    { key: "guangsuapi", name: "光速资源", api: "https://api.guangsuapi.com/api.php/provide/vod", active: true }
];

if (!fs.existsSync(DATA_FILE) || FORCE_UPDATE) {
    // 只有在没有文件时，或者强制更新开启时，才重置配置
    // 但为了不覆盖你可能手动添加的，我们这里只在文件不存在时写入，或者你确认要重置
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ sites: DEFAULT_SITES }, null, 2));
    }
}

function getDB() {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE));
        // 简单的合并逻辑：确保代码里的30多个接口都在数据库里
        if (FORCE_UPDATE) {
            const dbSites = data.sites || [];
            DEFAULT_SITES.forEach(defSite => {
                if (!dbSites.find(s => s.key === defSite.key)) {
                    dbSites.push(defSite);
                }
            });
            return { sites: dbSites };
        }
        return data;
    } catch (e) {
        return { sites: DEFAULT_SITES };
    }
}
function saveDB(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

// === ★ 新增：真实测速接口 ★ ===
app.get('/api/check', async (req, res) => {
    const { key } = req.query;
    const sites = getDB().sites;
    const site = sites.find(s => s.key === key);

    if (!site) return res.json({ latency: 9999 });

    const start = Date.now();
    try {
        // 尝试请求该接口的首页（只请求一页，极简模式）
        await axios.get(`${site.api}?ac=list&pg=1`, { timeout: 3000 });
        const latency = Date.now() - start;
        res.json({ latency: latency });
    } catch (e) {
        res.json({ latency: 9999 }); // 超时或错误
    }
});

// === 热门接口 ===
app.get('/api/hot', async (req, res) => {
    const sites = getDB().sites.filter(s => ['ffzy', 'bfzy', 'lzi', 'dbzy'].includes(s.key));
    for (const site of sites) {
        try {
            const response = await axios.get(`${site.api}?ac=list&pg=1&h=24&out=json`, { timeout: 3000 });
            const list = response.data.list || response.data.data;
            if (list && list.length > 0) return res.json({ list: list.slice(0, 12) });
        } catch (e) { continue; }
    }
    res.json({ list: [] });
});

// === 搜索接口 (极速缓存版) ===
app.get('/api/search', async (req, res) => {
    const { wd } = req.query;
    console.log(`[Search] ${wd}`);
    if (!wd) return res.json({ list: [] });

    // 尝试从缓存获取
    const cacheKey = wd.toLowerCase();
    const cachedItem = searchCache[cacheKey];
    if (cachedItem) {
        // 兼容旧格式 (直接是数组) 或 检查有效期
        // 如果是对象且有 ttl，则检查是否过期; ttl=0 为永久
        const isExpired = !Array.isArray(cachedItem) && cachedItem.ttl > 0 && (Date.now() - cachedItem.ts > cachedItem.ttl * 1000);

        if (!isExpired) {
            const list = Array.isArray(cachedItem) ? cachedItem : cachedItem.data;
            console.log(`[Search] 缓存命中: ${wd} (${list.length} 条) ${cachedItem.ttl ? `(TTL: ${(cachedItem.ttl / 3600).toFixed(1)}h)` : '(永久)'}`);
            return res.json({ list: list });
        } else {
            console.log(`[Search] 缓存过期: ${wd}, 重新获取...`);
        }
    }

    const sites = getDB().sites.filter(s => s.active);
    let allResults = [];
    let responded = false;

    // 提前返回的条件：有足够结果(>=15个) 或 超过1.5秒
    const earlyReturnTimer = setTimeout(() => {
        if (!responded && allResults.length > 0) {
            responded = true;
            console.log(`[Search] 提前返回 ${allResults.length} 条结果`);
            res.json({ list: allResults });
        }
    }, 1500);

    // 并发请求所有源
    const promises = sites.map(async (site) => {
        try {
            const response = await axios.get(`${site.api}?ac=list&wd=${encodeURIComponent(wd)}&out=json`, {
                timeout: 2000
            });
            const data = response.data;
            const list = data.list || data.data;
            if (list && Array.isArray(list) && list.length > 0) {
                const results = list.map(item => ({
                    ...item,
                    site_key: site.key,
                    site_name: site.name,
                    latency: 0
                }));
                allResults = allResults.concat(results);

                if (!responded && allResults.length >= 15) {
                    responded = true;
                    clearTimeout(earlyReturnTimer);
                    console.log(`[Search] 快速返回 ${allResults.length} 条结果`);
                    res.json({ list: allResults });
                }
            }
        } catch (e) { }
    });

    await Promise.allSettled(promises);

    // 保存到缓存
    if (allResults.length > 0) {
        // 智能过期策略：
        // 检查结果中是否有今年(或去年)的内容
        const currentYear = new Date().getFullYear();
        const hasNewContent = allResults.some(item => {
            const y = parseInt(item.vod_year);
            // 包含当年或去年的，或者是最近更新的(如果vod_year非数字)
            return !isNaN(y) && y >= currentYear - 1;
        });

        // 如果有新内容，缓存 1 小时 (3600秒)，否则永久缓存 (TTL=0)
        const ttl = hasNewContent ? 3600 : 0;

        searchCache[cacheKey] = {
            data: allResults,
            ts: Date.now(),
            ttl: ttl
        };
        saveCache(CACHE_SEARCH_FILE, searchCache);
        console.log(`[Search] 已缓存: ${wd} (${allResults.length} 条) - 策略: ${ttl > 0 ? '热搜 (1h)' : '经典 (永久)'}`);
    }

    if (!responded) {
        responded = true;
        clearTimeout(earlyReturnTimer);
        console.log(`[Search] 完整返回 ${allResults.length} 条结果`);
        res.json({ list: allResults });
    }
});

// === 详情接口 (带缓存) ===
app.get('/api/detail', async (req, res) => {
    const { site_key, id } = req.query;

    // 检查缓存
    const cacheKey = `${site_key}_${id}`;
    if (detailCache[cacheKey]) {
        return res.json(detailCache[cacheKey]);
    }

    const targetSite = getDB().sites.find(s => s.key === site_key);
    if (!targetSite) return res.status(404).json({ error: "Site not found" });

    try {
        const response = await axios.get(`${targetSite.api}?ac=detail&ids=${id}&out=json`, { timeout: 6000 });
        const data = response.data;

        // 存入缓存
        if (data && (data.list || data.data)) {
            detailCache[cacheKey] = data;
            saveCache(CACHE_DETAIL_FILE, detailCache);
        }
        res.json(data);
    } catch (e) { res.status(500).json({ error: "Source Error" }); }
});

app.get('/api/config', (req, res) => {
    res.json({
        tmdb_api_key: process.env.TMDB_API_KEY || ''
    });
});

app.listen(PORT, () => { console.log(`服务已启动: http://localhost:${PORT}`); });