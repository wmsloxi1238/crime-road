import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, CartesianGrid,
} from "recharts";

/*
 * AI 위험 골목길 분석 — 대시보드 랜딩페이지
 * 데이터: 경찰청 서울특별시경찰청_5대범죄 발생 장소별 현황 (2024)
 * 출처: 공공데이터포털 data.go.kr/data/15054737
 */

const CRIMES = ["폭력", "절도", "강간·강제추행", "강도", "살인"];
const CRIME_COLORS = {
  폭력: "#f97316",
  절도: "#3b82f6",
  "강간·강제추행": "#a855f7",
  강도: "#eab308",
  살인: "#ef4444",
};

// ----- 원본 집계 데이터 (62개 장소) -----
const MATRIX = {
  "단독주택": { "강간·강제추행": 154, "강도": 1, "살인": 12, "절도": 734, "폭력": 1588 },
  "아파트": { "강간·강제추행": 226, "강도": 6, "살인": 21, "절도": 1937, "폭력": 4367 },
  "다세대/연립": { "강간·강제추행": 362, "강도": 3, "살인": 35, "절도": 1778, "폭력": 3458 },
  "오피스텔(원룸)": { "강간·강제추행": 267, "강도": 3, "살인": 7, "절도": 450, "폭력": 922 },
  "기타거주시설(기숙사 등)": { "강간·강제추행": 41, "강도": 0, "살인": 4, "절도": 190, "폭력": 416 },
  "고속도로": { "강간·강제추행": 3, "강도": 0, "살인": 0, "절도": 4, "폭력": 29 },
  "자동차전용도로": { "강간·강제추행": 1, "강도": 0, "살인": 0, "절도": 4, "폭력": 141 },
  "일반도로": { "강간·강제추행": 69, "강도": 3, "살인": 7, "절도": 822, "폭력": 2946 },
  "통행로(보도/골목길)": { "강간·강제추행": 368, "강도": 10, "살인": 9, "절도": 4816, "폭력": 6517 },
  "백화점": { "강간·강제추행": 14, "강도": 0, "살인": 0, "절도": 1120, "폭력": 71 },
  "대형할인점": { "강간·강제추행": 12, "강도": 1, "살인": 0, "절도": 1580, "폭력": 91 },
  "슈퍼마켓, 소매점": { "강간·강제추행": 12, "강도": 0, "살인": 2, "절도": 1346, "폭력": 97 },
  "편의점": { "강간·강제추행": 48, "강도": 9, "살인": 0, "절도": 1498, "폭력": 347 },
  "시장/노점": { "강간·강제추행": 20, "강도": 0, "살인": 1, "절도": 500, "폭력": 293 },
  "창고(매장창고한정)": { "강간·강제추행": 3, "강도": 0, "살인": 0, "절도": 74, "폭력": 29 },
  "무인상점": { "강간·강제추행": 3, "강도": 0, "살인": 0, "절도": 2406, "폭력": 98 },
  "기타상점": { "강간·강제추행": 104, "강도": 4, "살인": 1, "절도": 3339, "폭력": 817 },
  "숙박업소(호텔/모텔/여관)": { "강간·강제추행": 544, "강도": 3, "살인": 3, "절도": 199, "폭력": 417 },
  "목욕탕/찜질방/사우나": { "강간·강제추행": 109, "강도": 0, "살인": 0, "절도": 347, "폭력": 61 },
  "이발소/미용실": { "강간·강제추행": 10, "강도": 0, "살인": 0, "절도": 45, "폭력": 37 },
  "마사지업소": { "강간·강제추행": 31, "강도": 0, "살인": 0, "절도": 22, "폭력": 40 },
  "공중위생업소/기타": { "강간·강제추행": 14, "강도": 0, "살인": 0, "절도": 24, "폭력": 43 },
  "음식점": { "강간·강제추행": 232, "강도": 1, "살인": 4, "절도": 925, "폭력": 1438 },
  "카페": { "강간·강제추행": 57, "강도": 0, "살인": 0, "절도": 387, "폭력": 182 },
  "주점": { "강간·강제추행": 381, "강도": 1, "살인": 3, "절도": 604, "폭력": 1640 },
  "단란/유흥/나이트(클럽)/ 카바레": { "강간·강제추행": 454, "강도": 2, "살인": 1, "절도": 255, "폭력": 1163 },
  "버스터미널/정류소": { "강간·강제추행": 20, "강도": 0, "살인": 0, "절도": 72, "폭력": 76 },
  "지하철역/전철역": { "강간·강제추행": 202, "강도": 0, "살인": 0, "절도": 406, "폭력": 579 },
  "버스": { "강간·강제추행": 125, "강도": 0, "살인": 0, "절도": 77, "폭력": 181 },
  "택시": { "강간·강제추행": 54, "강도": 1, "살인": 0, "절도": 210, "폭력": 535 },
  "자가용자동차": { "강간·강제추행": 81, "강도": 5, "살인": 2, "절도": 246, "폭력": 132 },
  "지하철/전철": { "강간·강제추행": 441, "강도": 0, "살인": 0, "절도": 201, "폭력": 338 },
  "공연장/극장": { "강간·강제추행": 11, "강도": 0, "살인": 0, "절도": 49, "폭력": 25 },
  "체육시설": { "강간·강제추행": 43, "강도": 0, "살인": 0, "절도": 386, "폭력": 200 },
  "공원/놀이시설": { "강간·강제추행": 37, "강도": 2, "살인": 1, "절도": 293, "폭력": 309 },
  "게임장/pc방": { "강간·강제추행": 13, "강도": 0, "살인": 1, "절도": 366, "폭력": 141 },
  "기타(DVD방, 유원지)": { "강간·강제추행": 35, "강도": 1, "살인": 1, "절도": 92, "폭력": 114 },
  "학교": { "강간·강제추행": 79, "강도": 0, "살인": 0, "절도": 291, "폭력": 282 },
  "금융보험기관": { "강간·강제추행": 4, "강도": 2, "살인": 0, "절도": 428, "폭력": 50 },
  "의료기관": { "강간·강제추행": 75, "강도": 1, "살인": 5, "절도": 259, "폭력": 311 },
  "종교시설": { "강간·강제추행": 15, "강도": 0, "살인": 0, "절도": 77, "폭력": 157 },
  "관공서": { "강간·강제추행": 15, "강도": 0, "살인": 1, "절도": 81, "폭력": 157 },
  "기차역": { "강간·강제추행": 3, "강도": 0, "살인": 0, "절도": 7, "폭력": 17 },
  "여객선터미널": { "강간·강제추행": 0, "강도": 0, "살인": 0, "절도": 1, "폭력": 0 },
  "공항": { "강간·강제추행": 1, "강도": 0, "살인": 0, "절도": 14, "폭력": 11 },
  "기차": { "강간·강제추행": 0, "강도": 0, "살인": 0, "절도": 2, "폭력": 4 },
  "선박": { "강간·강제추행": 0, "강도": 0, "살인": 0, "절도": 0, "폭력": 0 },
  "비행기": { "강간·강제추행": 2, "강도": 0, "살인": 0, "절도": 2, "폭력": 1 },
  "교통수단내/기타": { "강간·강제추행": 3, "강도": 0, "살인": 0, "절도": 34, "폭력": 32 },
  "어린이집/유치원": { "강간·강제추행": 1, "강도": 0, "살인": 0, "절도": 10, "폭력": 12 },
  "도서관": { "강간·강제추행": 4, "강도": 0, "살인": 0, "절도": 51, "폭력": 19 },
  "학원": { "강간·강제추행": 30, "강도": 0, "살인": 0, "절도": 21, "폭력": 23 },
  "기타 교육시설": { "강간·강제추행": 13, "강도": 0, "살인": 0, "절도": 31, "폭력": 34 },
  "야외/산야": { "강간·강제추행": 36, "강도": 0, "살인": 2, "절도": 529, "폭력": 424 },
  "해안": { "강간·강제추행": 0, "강도": 0, "살인": 0, "절도": 0, "폭력": 1 },
  "폐가/공터": { "강간·강제추행": 1, "강도": 1, "살인": 0, "절도": 35, "폭력": 39 },
  "공중화장실": { "강간·강제추행": 14, "강도": 0, "살인": 0, "절도": 86, "폭력": 52 },
  "군사기지/군사시설": { "강간·강제추행": 0, "강도": 0, "살인": 0, "절도": 0, "폭력": 7 },
  "구금장소": { "강간·강제추행": 10, "강도": 0, "살인": 0, "절도": 2, "폭력": 44 },
  "사회복지시설": { "강간·강제추행": 9, "강도": 0, "살인": 0, "절도": 20, "폭력": 52 },
  "미상": { "강간·강제추행": 14, "강도": 0, "살인": 2, "절도": 144, "폭력": 377 },
  "기타": { "강간·강제추행": 593, "강도": 27, "살인": 24, "절도": 5577, "폭력": 7570 },
};

const GROUP_OF = {
  "단독주택": "주거", "아파트": "주거", "다세대/연립": "주거", "오피스텔(원룸)": "주거", "기타거주시설(기숙사 등)": "주거",
  "고속도로": "노상/길거리", "자동차전용도로": "노상/길거리", "일반도로": "노상/길거리", "통행로(보도/골목길)": "노상/길거리",
  "백화점": "상점/유통", "대형할인점": "상점/유통", "슈퍼마켓, 소매점": "상점/유통", "편의점": "상점/유통", "시장/노점": "상점/유통", "창고(매장창고한정)": "상점/유통", "무인상점": "상점/유통", "기타상점": "상점/유통",
  "숙박업소(호텔/모텔/여관)": "숙박/위생", "목욕탕/찜질방/사우나": "숙박/위생", "이발소/미용실": "숙박/위생", "마사지업소": "숙박/위생", "공중위생업소/기타": "숙박/위생",
  "음식점": "유흥/음식", "카페": "유흥/음식", "주점": "유흥/음식", "단란/유흥/나이트(클럽)/ 카바레": "유흥/음식",
  "버스터미널/정류소": "교통", "지하철역/전철역": "교통", "버스": "교통", "택시": "교통", "자가용자동차": "교통", "지하철/전철": "교통",
  "기차역": "교통", "여객선터미널": "교통", "공항": "교통", "기차": "교통", "선박": "교통", "비행기": "교통", "교통수단내/기타": "교통",
  "공연장/극장": "여가/오락", "체육시설": "여가/오락", "공원/놀이시설": "여가/오락", "게임장/pc방": "여가/오락", "기타(DVD방, 유원지)": "여가/오락",
  "학교": "교육", "어린이집/유치원": "교육", "도서관": "교육", "학원": "교육", "기타 교육시설": "교육",
  "금융보험기관": "업무/공공", "의료기관": "업무/공공", "종교시설": "업무/공공", "관공서": "업무/공공",
  "야외/산야": "기타", "공중화장실": "기타", "해안": "기타", "폐가/공터": "기타", "군사기지/군사시설": "기타", "구금장소": "기타", "사회복지시설": "기타", "미상": "기타", "기타": "기타",
};

const STREET_PLACES = ["통행로(보도/골목길)", "일반도로", "자동차전용도로", "고속도로"];

const fmt = (n) => n.toLocaleString("ko-KR");
const rowTotal = (p) => CRIMES.reduce((s, c) => s + (MATRIX[p][c] || 0), 0);
const GRAND = Object.keys(MATRIX).reduce((s, p) => s + rowTotal(p), 0);
const CRIME_TOTAL = CRIMES.reduce((o, c) => {
  o[c] = Object.keys(MATRIX).reduce((s, p) => s + (MATRIX[p][c] || 0), 0);
  return o;
}, {});
const STREET_TOTAL = STREET_PLACES.reduce((s, p) => s + rowTotal(p), 0);
const ALLEY_TOTAL = rowTotal("통행로(보도/골목길)");

function KPI({ label, value, sub, accent }) {
  return (
    <div className="rounded-2xl bg-slate-800/70 border border-slate-700 p-5 flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <span className={`text-3xl font-bold ${accent || "text-white"}`}>{value}</span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </div>
  );
}

function Section({ title, desc, children }) {
  return (
    <section className="rounded-2xl bg-slate-800/40 border border-slate-700 p-5 md:p-6">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {desc && <p className="text-sm text-slate-400 mt-1 mb-4">{desc}</p>}
      {children}
    </section>
  );
}

export default function SafeStreetDashboard() {
  const [crime, setCrime] = useState("전체");
  const valueOf = (p) => (crime === "전체" ? rowTotal(p) : MATRIX[p][crime] || 0);

  const ranking = useMemo(() => {
    return Object.keys(MATRIX)
      .filter((p) => p !== "기타")
      .map((p) => ({ name: p, value: valueOf(p), group: GROUP_OF[p] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }, [crime]);

  const groupData = useMemo(() => {
    const g = {};
    Object.keys(MATRIX).forEach((p) => {
      const grp = GROUP_OF[p] || "기타";
      g[grp] = g[grp] || { group: grp, 폭력: 0, 절도: 0, "강간·강제추행": 0, 강도: 0, 살인: 0, total: 0 };
      CRIMES.forEach((c) => { g[grp][c] += MATRIX[p][c] || 0; g[grp].total += MATRIX[p][c] || 0; });
    });
    return Object.values(g).filter((x) => x.group !== "기타").sort((a, b) => b.total - a.total);
  }, []);

  const pieData = CRIMES.map((c) => ({ name: c, value: CRIME_TOTAL[c] }));

  const streetData = STREET_PLACES.map((p) => {
    const o = { name: p.replace("(보도/골목길)", ""), total: rowTotal(p) };
    CRIMES.forEach((c) => (o[c] = MATRIX[p][c] || 0));
    return o;
  });

  const heatPlaces = useMemo(() => {
    return Object.keys(MATRIX)
      .filter((p) => p !== "기타")
      .map((p) => ({ p, v: rowTotal(p) }))
      .sort((a, b) => b.v - a.v)
      .slice(0, 14)
      .map((x) => x.p);
  }, []);
  const heatMax = Math.max(...heatPlaces.flatMap((p) => CRIMES.map((c) => MATRIX[p][c] || 0)));

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        <header className="rounded-3xl bg-gradient-to-br from-orange-600/20 via-slate-800 to-slate-900 border border-slate-700 p-6 md:p-9">
          <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold tracking-wide">
            <span className="inline-block h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
            AI 위험 골목길 분석 서비스
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-3 leading-tight">
            서울, 어디가 위험한가?
          </h1>
          <p className="text-slate-300 mt-2 max-w-2xl text-sm md:text-base">
            2024년 서울시 5대범죄 <b className="text-white">{fmt(GRAND)}건</b>을 장소별로 분석했습니다.
            절반에 가까운 범죄가 거리와 골목에서 일어났습니다.
          </p>
          <div className="mt-5 inline-flex items-baseline gap-3 rounded-2xl bg-slate-900/60 border border-orange-500/30 px-5 py-3">
            <span className="text-sm text-slate-400">보도·골목길에서만</span>
            <span className="text-3xl font-extrabold text-orange-400">{fmt(ALLEY_TOTAL)}건</span>
            <span className="text-sm text-slate-400">전체의 {((ALLEY_TOTAL / GRAND) * 100).toFixed(1)}%</span>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 mr-1">범죄 유형 필터</span>
          {["전체", ...CRIMES].map((c) => (
            <button
              key={c}
              onClick={() => setCrime(c)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                crime === c
                  ? "bg-white text-slate-900 border-white"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPI label="총 발생건수 (5대범죄)" value={fmt(GRAND)} sub="서울 · 2024년" />
          <KPI label="노상/길거리 발생" value={fmt(STREET_TOTAL)} sub={`전체의 ${((STREET_TOTAL / GRAND) * 100).toFixed(1)}%`} accent="text-orange-400" />
          <KPI label="최다 범죄 유형" value="폭력" sub={`${fmt(CRIME_TOTAL["폭력"])}건 · ${((CRIME_TOTAL["폭력"] / GRAND) * 100).toFixed(0)}%`} accent="text-orange-300" />
          <KPI label="최다 발생 장소" value="골목길" sub={`통행로 ${fmt(ALLEY_TOTAL)}건 (1위)`} accent="text-rose-400" />
        </div>

        <Section
          title="🚸 노상 · 골목길 집중 분석"
          desc="거리 유형별 발생 구성. 보도·골목길은 절도와 폭력이 압도적이며, 차도로 갈수록 폭력 비중이 높아집니다."
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={streetData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#cbd5e1" fontSize={12} width={90} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12 }} formatter={(v) => fmt(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {CRIMES.map((c) => (
                <Bar key={c} dataKey={c} stackId="s" fill={CRIME_COLORS[c]} radius={c === "살인" ? [0, 4, 4, 0] : 0} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <div className="grid lg:grid-cols-2 gap-6">
          <Section
            title="🏆 위험 장소 Top 12"
            desc={`${crime === "전체" ? "전체 5대범죄" : crime} 기준 발생건수 (‘기타’ 제외)`}
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={ranking} layout="vertical" margin={{ left: 10, right: 24 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#cbd5e1" fontSize={11} width={120} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12 }} formatter={(v) => fmt(v)} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {ranking.map((d, i) => (
                    <Cell key={i} fill={d.name.includes("골목") ? "#f97316" : "#475569"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Section>

          <Section title="🍩 범죄 유형 구성비" desc="서울 5대범죄 전체에서 차지하는 비율">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={2}>
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={CRIME_COLORS[d.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12 }} formatter={(v) => fmt(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Section>
        </div>

        <Section
          title="🏙️ 장소 유형별 × 범죄 구성"
          desc="장소를 그룹으로 묶어 비교. 상점은 절도, 주거·노상·유흥은 폭력이 두드러집니다."
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={groupData} margin={{ left: 0, right: 10, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="group" stroke="#cbd5e1" fontSize={11} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12 }} formatter={(v) => fmt(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {CRIMES.map((c) => (
                <Bar key={c} dataKey={c} stackId="g" fill={CRIME_COLORS[c]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <Section
          title="🔥 장소 × 범죄 히트맵"
          desc="발생 상위 14개 장소. 색이 진할수록 해당 장소·범죄 조합의 발생이 많습니다."
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="text-left p-2 text-slate-400 font-medium sticky left-0 bg-slate-800/40">장소</th>
                  {CRIMES.map((c) => (
                    <th key={c} className="p-2 text-slate-300 font-medium whitespace-nowrap">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatPlaces.map((p) => (
                  <tr key={p} className="border-t border-slate-700/50">
                    <td className="p-2 text-slate-200 whitespace-nowrap sticky left-0 bg-slate-800/40">{p}</td>
                    {CRIMES.map((c) => {
                      const v = MATRIX[p][c] || 0;
                      const intensity = Math.pow(v / heatMax, 0.45);
                      return (
                        <td key={c} className="p-1 text-center">
                          <div
                            className="rounded-md py-1.5 font-medium"
                            style={{
                              background: `rgba(249,115,22,${0.08 + intensity * 0.85})`,
                              color: intensity > 0.5 ? "#0f172a" : "#e2e8f0",
                            }}
                          >
                            {v ? fmt(v) : "·"}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <footer className="text-xs text-slate-500 pb-6 leading-relaxed">
          데이터 출처: 공공데이터포털 · 경찰청 서울특별시경찰청 「5대범죄 발생 장소별 현황」(2024) ·
          data.go.kr/data/15054737 · 공간범위: 서울특별시 · 단위: 건<br />
          ※ 본 데이터에는 자치구·위경도 정보가 없어 지도 매핑은 제외되었습니다. 구 단위 지도는 ‘경찰서별 5대범죄 발생·검거 현황’(15054738) 추가 시 확장 가능합니다.
        </footer>
      </div>
    </div>
  );
}
