"use client";

import { useEffect, useMemo, useState } from "react";

const objects = [
  { name: "FORMOSAT-8A", id: "NORAD 66666", type: "光學遙測", orbit: "SSO · 565 km", status: "正常", risk: "低" },
  { name: "STARLINK-1184", id: "NORAD 44713", type: "通訊衛星", orbit: "LEO · 540 km", status: "機動中", risk: "中" },
  { name: "ONEWEB-0050", id: "NORAD 44058", type: "通訊衛星", orbit: "LEO · 1,200 km", status: "正常", risk: "低" },
  { name: "CZ-4B R/B", id: "NORAD 66310", type: "火箭殘體", orbit: "LEO · 579 km", status: "追蹤中", risk: "高" },
];

const events = [
  { time: "08/01 18:42 UTC", pair: "FORMOSAT-8A × CZ-4B R/B", distance: "4.8 km", level: "需關注", tone: "warn" },
  { time: "08/02 03:17 UTC", pair: "FORMOSAT-8A × STARLINK-1184", distance: "9.6 km", level: "監測中", tone: "safe" },
  { time: "08/02 11:05 UTC", pair: "ONEWEB-0050 × COSMOS DEB", distance: "1.7 km", level: "高風險", tone: "danger" },
];

type LiveFormosat = {
  epoch: string;
  inclinationDeg: number;
  meanMotionRevPerDay: number;
  periodMinutes: number;
  refreshedAt: string;
  source: string;
  sourceUrl: string;
};

const liveDataUrl =
  "https://raw.githubusercontent.com/kevinchang0531/orbitalradar/main/public/data/formosat-8a.json";

export default function Home() {
  const [activeTab, setActiveTab] = useState("總覽");
  const [watching, setWatching] = useState(false);
  const [notice, setNotice] = useState("尚未啟用");
  const [query, setQuery] = useState("");
  const [orbit, setOrbit] = useState("全部軌道");
  const [liveFormosat, setLiveFormosat] = useState<LiveFormosat | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const cacheKey = Math.floor(Date.now() / 300000);
    fetch(`${liveDataUrl}?v=${cacheKey}`, { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((data: LiveFormosat) => setLiveFormosat(data))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() =>
    objects.filter((item) =>
      (orbit === "全部軌道" || item.orbit.includes(orbit)) &&
      `${item.name} ${item.id}`.toLowerCase().includes(query.toLowerCase())
    ), [query, orbit]);

  const selectNotice = () => {
    setWatching(true);
    setNotice("近接警示已啟用");
  };

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="軌道雷達首頁">
          <span className="brand-mark">◌</span>
          <span>軌道雷達 <small>ORBITAL RADAR</small></span>
        </a>
        <nav aria-label="主要導覽">
          {["總覽", "衛星目錄", "近接事件", "發射中心", "太空天氣"].map((tab) => (
            <button className={activeTab === tab ? "nav-active" : ""} key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </nav>
        <button className="account" onClick={() => setActiveTab("帳號中心")}>許宜庭 <span>● 線上</span></button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><i /> 即時軌道情報系統</p>
          <h1>掌握地球軌道<br /><em>每一次靠近</em></h1>
          <p className="hero-text">即時追蹤衛星、碎片與發射任務，將碰撞風險轉化為清楚、可執行的監控資訊。</p>
          <div className="hero-actions">
            <button className="primary" onClick={() => document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" })}>開始追蹤 <span>→</span></button>
            <button className="secondary" onClick={() => setActiveTab("近接事件")}>查看近接事件</button>
          </div>
        </div>
        <div className="orbital-visual" aria-label="地球與軌道示意圖">
          <div className="orbit o1" /><div className="orbit o2" /><div className="orbit o3" />
          <div className="satellite s1">✦</div><div className="satellite s2">✦</div><div className="satellite s3">✦</div>
          <div className="earth"><span>地球</span></div>
          <div className="live-chip">● LIVE<br /><b>29,027</b> 個物體正在追蹤</div>
        </div>
      </section>

      <section className="metrics" aria-label="即時摘要">
        <article><span>追蹤中物體</span><strong>29,027</strong><small>涵蓋衛星、碎片與火箭殘體</small></article>
        <article><span>24 小時偵測機動</span><strong>842</strong><small className="accent">↑ 18% 較昨日</small></article>
        <article><span>高優先近接事件</span><strong>3</strong><small className="danger-text">需要進一步評估</small></article>
        <article><span>太空天氣</span><strong>G0</strong><small>平靜 · Kp 0</small></article>
      </section>

      <section className="workspace" id="catalogue">
        <div className="section-heading"><div><p className="eyebrow"><i /> 監控工作台</p><h2>衛星與軌道物體</h2></div><button className="text-button" onClick={() => setQuery("")}>重設篩選 ↻</button></div>
        <div className="filters">
          <label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋衛星名稱或 NORAD 編號" /></label>
          <select value={orbit} onChange={(event) => setOrbit(event.target.value)} aria-label="選擇軌道類型">
            <option>全部軌道</option><option>LEO</option><option>SSO</option>
          </select>
          <button className={watching ? "watching" : "watch"} onClick={() => setWatching(!watching)}>{watching ? "★ 我的 Watchlist" : "☆ 加入監控清單"}</button>
        </div>
        <div className="object-grid">
          {filtered.map((item) => <article className="object-card" key={item.id}>
            <div className="object-top"><span className="object-symbol">◉</span><span className={`status ${item.status === "機動中" ? "amber" : ""}`}>{item.status}</span></div>
            <h3>{item.name}</h3><p>{item.id}</p>
            {item.id === "NORAD 66666" && liveFormosat && <p className="data-stamp">GP 資料：{new Date(liveFormosat.refreshedAt).toLocaleString("zh-TW", { hour12: false })}</p>}
            <dl><div><dt>任務類型</dt><dd>{item.type}</dd></div><div><dt>軌道</dt><dd>{item.id === "NORAD 66666" && liveFormosat ? `傾角 ${liveFormosat.inclinationDeg.toFixed(2)}°` : item.orbit}</dd></div></dl>
            {item.id === "NORAD 66666" && liveFormosat && <div className="live-orbit">週期 {liveFormosat.periodMinutes.toFixed(2)} 分 · {liveFormosat.meanMotionRevPerDay.toFixed(4)} rev/day<br /><a href={liveFormosat.sourceUrl} target="_blank" rel="noreferrer">來源：{liveFormosat.source}</a></div>}
            <button className="card-link" onClick={() => item.id === "NORAD 66666" && setWatching(true)}>開啟詳細資料 <span>→</span></button>
          </article>)}
        </div>
      </section>

      <section className="alerts-section">
        <div className="section-heading"><div><p className="eyebrow"><i /> CONJUNCTION MONITOR</p><h2>近接事件監控</h2></div><span className="refresh">資料每 5 分鐘更新</span></div>
        <div className="alerts-layout">
          <div className="event-list">{events.map((event) => <button className="event" key={event.pair} onClick={selectNotice}>
            <span className={`event-dot ${event.tone}`} /><span><b>{event.pair}</b><small>{event.time} · 最近距離 {event.distance}</small></span><em className={event.tone}>{event.level}</em><span className="arrow">→</span>
          </button>)}</div>
          <aside className="notice-card"><span className="bell">♧</span><p className="eyebrow">FORMOSAT-8A · NORAD 66666</p><h3>接收近接警示</h3><p>當衛星與其他物體預測接近時，立即透過推播或 Email 收到通知。</p><button className="primary full" onClick={selectNotice}>{notice}</button><small>{watching ? "已加入 Watchlist · 警示套用中" : "先加入 Watchlist 後即可啟用"}</small></aside>
        </div>
      </section>

      <section className="launch-strip"><div><p className="eyebrow"><i /> 下一次發射</p><h2>Falcon 9 · Starlink Group 17-52</h2><p>發射場：甘迺迪太空中心 LC-39A</p></div><div className="countdown"><span>預計起飛</span><strong>06 : 42 : 18</strong><small>UTC · 發射任務狀態：GO</small></div><button className="secondary light" onClick={() => setActiveTab("發射中心")}>前往發射中心 →</button></section>

      <footer><span>© 2026 軌道雷達 · 繁體中文版概念介面</span><span>資料展示用途 · 軌道預測應以官方 SSA 資料為準</span></footer>
    </main>
  );
}
