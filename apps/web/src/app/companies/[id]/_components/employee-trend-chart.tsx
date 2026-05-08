"use client";

import type { EmployeeTrendPoint } from "@cpa/shared";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "../company-detail.module.css";

const LABELS: Record<string, string> = {
  total: "총 인원",
  joined: "입사",
  left: "퇴사",
};

export function EmployeeTrendChart({ data }: { data: EmployeeTrendPoint[] }) {
  if (!data.length) {
    return (
      <p className={styles.emptyChart}>직원수 추이 데이터가 아직 없습니다.</p>
    );
  }

  const maxBar = Math.max(1, ...data.map((d) => Math.max(d.joined, d.left)));

  return (
    <div className={styles.chartWrap}>
      <div className={styles.chartAxisLabels}>
        <span>입사·퇴사 (명)</span>
        <span>총 인원 (명)</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--app-line)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "var(--app-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          {/* 두 축 모두 width=40 고정 → 레이블 div와 픽셀 단위 대칭 */}
          <YAxis
            yAxisId="bar"
            width={40}
            domain={[0, maxBar * 4]}
            tick={{ fontSize: 11, fill: "var(--app-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="line"
            width={40}
            orientation="right"
            tick={{ fontSize: 11, fill: "var(--app-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid var(--app-line)",
              fontSize: "0.8125rem",
            }}
            formatter={(value, name) => [
              `${value}명`,
              LABELS[String(name)] ?? String(name),
            ]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => LABELS[value] ?? value}
            wrapperStyle={{ fontSize: "0.75rem", paddingTop: "0.75rem" }}
          />
          <Bar
            yAxisId="bar"
            dataKey="joined"
            fill="var(--proto-brand)"
            opacity={0.8}
            radius={[3, 3, 0, 0]}
            barSize={14}
          />
          <Bar
            yAxisId="bar"
            dataKey="left"
            fill="var(--app-muted)"
            opacity={0.4}
            radius={[3, 3, 0, 0]}
            barSize={14}
          />
          <Line
            yAxisId="line"
            type="monotone"
            dataKey="total"
            stroke="var(--proto-brand)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "var(--proto-brand)", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
