import { lazy, Suspense } from "react";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = lazy(() => import("react-apexcharts"));

type Props = {
  options: ApexOptions;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  type:
    | "line"
    | "area"
    | "bar"
    | "pie"
    | "donut"
    | "radialBar"
    | "scatter"
    | "bubble"
    | "heatmap"
    | "candlestick"
    | "boxPlot"
    | "radar"
    | "polarArea"
    | "rangeBar"
    | "rangeArea"
    | "treemap";
  height?: number | string;
  width?: number | string;
};

export default function ApexChart({ options, series, type, height = 320, width = "100%" }: Props) {
  return (
    <Suspense
      fallback={
        <div
          className="w-full flex items-center justify-center text-xs text-muted-foreground"
          style={{ height }}
        >
          Cargando gráfico…
        </div>
      }
    >
      <ReactApexChart
        options={options}
        series={series as ApexAxisChartSeries}
        type={type}
        height={height}
        width={width}
      />
    </Suspense>
  );
}
