import { useEffect, useState } from "react";
import "./App.css";

const fmt = (n) => n.toLocaleString("ko-KR");

function PriceChart({ data }) {
  const W = 800;
  const H = 260;
  const P = 40;
  const closes = data.map((d) => d.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const x = (i) => P + (i * (W - P * 2)) / Math.max(data.length - 1, 1);
  const y = (v) => H - P - ((v - min) / range) * (H - P * 2);
  const points = data.map((d, i) => `${x(i)},${y(d.close)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart">
      <text x={P} y={P - 12} className="axis">{fmt(max)}</text>
      <text x={P} y={H - P + 24} className="axis">{fmt(min)}</text>
      <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="2.5" />
      {data.map((d, i) => (
        <circle key={d.date} cx={x(i)} cy={y(d.close)} r="3.5" fill="#2563eb">
          <title>{`${d.date} 종가 ${fmt(d.close)}원`}</title>
        </circle>
      ))}
    </svg>
  );
}

function App() {
  const [stock, setStock] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStock = () =>
    fetch("/samsung")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setStock(json);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  const load = () => {
    setLoading(true);
    fetchStock();
  };

  useEffect(() => {
    fetchStock();
  }, []);

  if (loading) return <p className="status">불러오는 중...</p>;
  if (error)
    return (
      <div className="status">
        <p>데이터를 불러오지 못했습니다: {error}</p>
        <button onClick={load}>다시 시도</button>
      </div>
    );

  const { name, ticker, count, data } = stock;
  const first = data[0]?.close ?? 0;
  const last = data[data.length - 1]?.close ?? 0;
  const diff = last - first;
  const rate = first ? (diff / first) * 100 : 0;

  return (
    <div className="container">
      <header>
        <h1>
          {name} <span className="ticker">{ticker}</span>
        </h1>
        <button onClick={load}>새로고침</button>
      </header>

      <div className="summary">
        <div>
          <span>최근 종가</span>
          <strong>{fmt(last)}원</strong>
        </div>
        <div>
          <span>기간 등락</span>
          <strong className={diff >= 0 ? "up" : "down"}>
            {diff >= 0 ? "▲" : "▼"} {fmt(Math.abs(diff))} ({rate.toFixed(2)}%)
          </strong>
        </div>
        <div>
          <span>거래일 수</span>
          <strong>{count}일</strong>
        </div>
      </div>

      <PriceChart data={data} />

      <table>
        <thead>
          <tr>
            <th>날짜</th>
            <th>시가</th>
            <th>고가</th>
            <th>저가</th>
            <th>종가</th>
            <th>거래량</th>
          </tr>
        </thead>
        <tbody>
          {[...data].reverse().map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{fmt(d.open)}</td>
              <td className="up">{fmt(d.high)}</td>
              <td className="down">{fmt(d.low)}</td>
              <td><b>{fmt(d.close)}</b></td>
              <td>{fmt(d.volume)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
