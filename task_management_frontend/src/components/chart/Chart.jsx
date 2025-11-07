import React from "react";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./Chart.css";

const TaskKPIsChart = () => {
  const { userStats, loading } = useSelector(({ users }) => ({
    userStats: users.userStats || {},
    loading: users.userStatsLoading,
  }));

  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const currentYear = new Date().getFullYear();

  const monthlyMap = {};
  userStats?.monthlyTasks?.forEach(item => {
    monthlyMap[item.month] = item;
  });

  const monthlyData = monthLabels.map((label, idx) => {
    const monthKey = `${currentYear}-${String(idx + 1).padStart(2, "0")}`;
    const item = monthlyMap[monthKey] || {};
    return {
      month: label,
      total: Number(item?.total) || 0,
    };
  });

  return (
    <div className="chart">
      <h2 className="chart-heading">Total Tasks ({currentYear})</h2>
      {!loading ? (
        <>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ className: "axis-tick" }}
                  axisLine={false}
                  tickLine={false}
                />
                {/* <YAxis
                tick={{ className: "axis-tick" }}
                axisLine={false}
                tickLine={false}
              /> */}
                <Tooltip
                  cursor={{ fill: "rgba(3, 207, 200, 0)" }}
                  contentStyle={{ borderRadius: "10px" }}
                  wrapperClassName="chart-tooltip"
                />
                <Bar dataKey="total" fill="var(--them-primary)" radius={[0, 0, 0, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>

      ) : <div className="chart-skeleton">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="skeleton-bar" />
        ))}
      </div>}
    </div>
  );
};

export default TaskKPIsChart;
