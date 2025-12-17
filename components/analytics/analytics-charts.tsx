"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface EventsOverTimeChartProps {
  data: ChartData[];
}

export function EventsOverTimeChart({ data }: EventsOverTimeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="name"
          stroke="#9CA3AF"
          style={{ fontSize: "12px" }}
        />
        <YAxis stroke="#9CA3AF" style={{ fontSize: "12px" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F2937",
            border: "1px solid #374151",
            borderRadius: "6px",
            color: "#F3F4F6",
          }}
        />
        <Legend wrapperStyle={{ color: "#9CA3AF" }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#4F46E5"
          strokeWidth={2}
          name="Events"
          dot={{ fill: "#4F46E5", r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface EventDistributionChartProps {
  data: ChartData[];
}

const COLORS = [
  "#4F46E5",
  "#7C3AED",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#EF4444",
  "#8B5CF6",
];

export function EventDistributionChart({ data }: EventDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F2937",
            border: "1px solid #374151",
            borderRadius: "6px",
            color: "#F3F4F6",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface TopPagesChartProps {
  data: ChartData[];
}

export function TopPagesChart({ data }: TopPagesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="name"
          stroke="#9CA3AF"
          style={{ fontSize: "12px" }}
          angle={-45}
          textAnchor="end"
          height={100}
        />
        <YAxis stroke="#9CA3AF" style={{ fontSize: "12px" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F2937",
            border: "1px solid #374151",
            borderRadius: "6px",
            color: "#F3F4F6",
          }}
        />
        <Bar dataKey="value" fill="#4F46E5" name="Events" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface TrackingMethodChartProps {
  data: ChartData[];
}

export function TrackingMethodChart({ data }: TrackingMethodChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="name"
          stroke="#9CA3AF"
          style={{ fontSize: "12px" }}
        />
        <YAxis stroke="#9CA3AF" style={{ fontSize: "12px" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F2937",
            border: "1px solid #374151",
            borderRadius: "6px",
            color: "#F3F4F6",
          }}
        />
        <Legend wrapperStyle={{ color: "#9CA3AF" }} />
        <Bar dataKey="firebaseAnalytics" stackId="a" fill="#4F46E5" name="Firebase Analytics" />
        <Bar dataKey="gtag" stackId="a" fill="#7C3AED" name="Google Analytics (gtag)" />
        <Bar dataKey="firestore" stackId="a" fill="#10B981" name="Firestore" />
      </BarChart>
    </ResponsiveContainer>
  );
}

