"use client";

// SVG 기반 경량 차트 - 외부 라이브러리 없음

interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
  unit?: string;
}

function BarChart({ data, title, unit = "" }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-3)", marginBottom: 14 }}>{title}</p>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 120 }}>
        {data.map((d) => {
          const h = Math.round((d.value / max) * 100);
          return (
            <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-4)", fontWeight: 600 }}>
                {d.value.toLocaleString()}{unit}
              </span>
              <div
                style={{
                  width: "100%",
                  height: `${h}px`,
                  minHeight: 4,
                  background: d.color,
                  borderRadius: "6px 6px 0 0",
                  transition: "height 0.6s ease",
                }}
              />
              <span style={{ fontSize: "0.72rem", color: "var(--text-4)", textAlign: "center" }}>{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DonutProps {
  value: number;
  max: number;
  color: string;
  label: string;
  sublabel: string;
}

function DonutGauge({ value, max, color, label, sublabel }: DonutProps) {
  const pct = Math.min(value / max, 1);
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={r} fill="none" stroke="var(--border)" strokeWidth={10} />
        <circle
          cx={50} cy={50} r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
        <text x={50} y={46} textAnchor="middle" style={{ fontSize: 16, fontWeight: 800, fill: "var(--text-1)" }}>
          {Math.round(pct * 100)}%
        </text>
        <text x={50} y={60} textAnchor="middle" style={{ fontSize: 9, fill: "var(--text-4)" }}>
          {sublabel}
        </text>
      </svg>
      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-2)" }}>{label}</span>
    </div>
  );
}

interface Props {
  tenantSlug: string;
}

// 샘플 데이터 (추후 API 연결)
const MONTHLY_DATA = {
  revenue: [
    { label: "10월", value: 42000000, color: "#0369a1" },
    { label: "11월", value: 38000000, color: "#0369a1" },
    { label: "12월", value: 51000000, color: "#0369a1" },
    { label: "1월", value: 47000000, color: "#0369a1" },
    { label: "2월", value: 44000000, color: "#0369a1" },
    { label: "3월", value: 53000000, color: "var(--brand)" },
  ],
  cost: [
    { label: "10월", value: 18000000, color: "#f59e0b" },
    { label: "11월", value: 16000000, color: "#f59e0b" },
    { label: "12월", value: 22000000, color: "#f59e0b" },
    { label: "1월", value: 19000000, color: "#f59e0b" },
    { label: "2월", value: 17000000, color: "#f59e0b" },
    { label: "3월", value: 21000000, color: "#f59e0b" },
  ],
  labor: [
    { label: "10월", value: 12000000, color: "#7c3aed" },
    { label: "11월", value: 12000000, color: "#7c3aed" },
    { label: "12월", value: 13500000, color: "#7c3aed" },
    { label: "1월", value: 12000000, color: "#7c3aed" },
    { label: "2월", value: 12000000, color: "#7c3aed" },
    { label: "3월", value: 12000000, color: "#7c3aed" },
  ],
};

export function DashboardCharts({ tenantSlug: _tenantSlug }: Props) {
  const latestRevenue = MONTHLY_DATA.revenue.at(-1)!.value;
  const latestCost = MONTHLY_DATA.cost.at(-1)!.value;
  const latestLabor = MONTHLY_DATA.labor.at(-1)!.value;
  const incomeRate = Math.round(((latestRevenue - latestCost - latestLabor) / latestRevenue) * 100);
  const laborRate = Math.round((latestLabor / latestRevenue) * 100);
  const costRate = Math.round((latestCost / latestRevenue) * 100);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* KPI 게이지 */}
      <section className="panel">
        <div className="panel-header">
          <h2>이번 달 핵심 비율</h2>
          <span className="badge ok">2026년 3월 기준</span>
        </div>
        <div className="panel-body">
          <div style={{ display: "flex", gap: 20, justifyContent: "space-around", flexWrap: "wrap", padding: "8px 0" }}>
            <DonutGauge
              value={incomeRate}
              max={100}
              color="#10b981"
              label="소득율"
              sublabel={`${incomeRate}%`}
            />
            <DonutGauge
              value={laborRate}
              max={100}
              color="#7c3aed"
              label="인건비 비율"
              sublabel={`${laborRate}%`}
            />
            <DonutGauge
              value={costRate}
              max={100}
              color="#f59e0b"
              label="원가율"
              sublabel={`${costRate}%`}
            />
            <DonutGauge
              value={latestRevenue}
              max={80000000}
              color="#0369a1"
              label="매출 달성"
              sublabel="목표 대비"
            />
          </div>
        </div>
      </section>

      {/* 월별 추이 차트 */}
      <div className="grid grid-3">
        <section className="panel">
          <div className="panel-header"><h2>매출 추이</h2><span className="badge info">6개월</span></div>
          <div className="panel-body">
            <BarChart data={MONTHLY_DATA.revenue} title="월 매출 (원)" unit="" />
          </div>
        </section>
        <section className="panel">
          <div className="panel-header"><h2>원가/지출 추이</h2><span className="badge warn">6개월</span></div>
          <div className="panel-body">
            <BarChart data={MONTHLY_DATA.cost} title="월 지출 (원)" unit="" />
          </div>
        </section>
        <section className="panel">
          <div className="panel-header"><h2>인건비 추이</h2><span className="badge" style={{ background: "#ede9fe", color: "#7c3aed" }}>6개월</span></div>
          <div className="panel-body">
            <BarChart data={MONTHLY_DATA.labor} title="월 인건비 (원)" unit="" />
          </div>
        </section>
      </div>

      {/* 세무사 코멘트 */}
      <section className="panel">
        <div className="panel-header">
          <h2>세무사 진단 코멘트</h2>
          <span className="badge ok">2026-03 기준</span>
        </div>
        <div className="panel-body">
          <div className="grid grid-2" style={{ gap: 14 }}>
            <div className="card" style={{ padding: "16px 20px", borderLeft: "4px solid var(--green)" }}>
              <strong style={{ fontSize: "0.88rem" }}>소득율 {incomeRate}% — 양호</strong>
              <p style={{ marginTop: 6, fontSize: "0.8rem", color: "var(--text-3)", lineHeight: 1.6 }}>
                업종 평균(의원 기준 18~25%) 대비 적정 수준입니다. 비용 처리 항목을 추가 검토하면 2~3%p 개선 여지가 있습니다.
              </p>
            </div>
            <div className="card" style={{ padding: "16px 20px", borderLeft: "4px solid var(--amber)" }}>
              <strong style={{ fontSize: "0.88rem" }}>인건비 비율 {laborRate}% — 주의</strong>
              <p style={{ marginTop: 6, fontSize: "0.8rem", color: "var(--text-3)", lineHeight: 1.6 }}>
                매출 대비 인건비 비율이 최근 3개월 유사 수준 유지 중입니다. 두루누리 지원 요건 점검을 권장합니다.
              </p>
            </div>
            <div className="card" style={{ padding: "16px 20px", borderLeft: "4px solid var(--blue)" }}>
              <strong style={{ fontSize: "0.88rem" }}>원천세 · 부가세 체크</strong>
              <p style={{ marginTop: 6, fontSize: "0.8rem", color: "var(--text-3)", lineHeight: 1.6 }}>
                4월 원천세(3월분)와 1기 예정 부가세 납부 기한이 각각 4.10, 4.25입니다. 납부서는 세금 자료 탭에서 확인하세요.
              </p>
            </div>
            <div className="card" style={{ padding: "16px 20px", borderLeft: "4px solid var(--brand)" }}>
              <strong style={{ fontSize: "0.88rem" }}>접대비·복리후생비 구분 점검</strong>
              <p style={{ marginTop: 6, fontSize: "0.8rem", color: "var(--text-3)", lineHeight: 1.6 }}>
                법인카드 지출 중 접대비로 분류된 항목의 증빙 요건을 3월 마감 전 검토 권장합니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
