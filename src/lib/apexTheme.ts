import type { ApexOptions } from "apexcharts";

// Brand palette aligned with EnviaMas (orange primary) + complementary tokens
export const apexPalette = {
  primary: "#F97316", // orange-500 (primary)
  primaryLight: "#FB923C", // orange-400
  success: "#10B981", // emerald-500
  info: "#3B82F6", // blue-500
  warning: "#F59E0B", // amber-500
  destructive: "#EF4444", // red-500
  muted: "#94A3B8", // slate-400
  grid: "#E2E8F0", // slate-200
  text: "#64748B", // slate-500
  textStrong: "#0F172A", // slate-900
};

export const apexFontFamily =
  '"Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const baseChartOptions: ApexOptions = {
  chart: {
    fontFamily: apexFontFamily,
    foreColor: apexPalette.text,
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: {
      enabled: true,
      easing: "easeinout",
      speed: 600,
      animateGradually: { enabled: true, delay: 100 },
      dynamicAnimation: { enabled: true, speed: 350 },
    },
  },
  grid: {
    borderColor: apexPalette.grid,
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { left: 8, right: 8, top: 0, bottom: 0 },
  },
  tooltip: {
    theme: "light",
    style: { fontFamily: apexFontFamily, fontSize: "12px" },
  },
  legend: {
    fontFamily: apexFontFamily,
    fontSize: "12px",
    fontWeight: 500,
    labels: { colors: apexPalette.text },
    markers: {
      size: 6,
      strokeWidth: 0,
    },
    itemMargin: { horizontal: 10, vertical: 4 },
  },
  dataLabels: { enabled: false },
  xaxis: {
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: { fontSize: "11px", fontFamily: apexFontFamily, colors: apexPalette.text },
    },
  },
  yaxis: {
    labels: {
      style: { fontSize: "11px", fontFamily: apexFontFamily, colors: apexPalette.text },
    },
  },
};
