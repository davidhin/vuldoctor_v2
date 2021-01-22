import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
  ChartTitle,
  ChartTooltip,
} from "@progress/kendo-react-charts";
import "@progress/kendo-theme-material/dist/all.css";
import React, { useEffect, useState } from "react";
import { calcBoxPlotVals } from "./Calc";

const CVSSBoxPlot = (props) => {
  const [plotData, setPlotData] = useState(null);

  useEffect(() => {
    // Calc Plot Values
    if (props.cveData) {
      let base_score = [];
      let exploit_score = [];
      let impact_score = [];
      props.cveData.forEach((cve) => {
        base_score.push(cve["baseScore"]);
        exploit_score.push(cve["exploitabilityScore"]);
        impact_score.push(cve["impactScore"]);
      });
      let allData = [];
      allData.push(calcBoxPlotVals(base_score, "Base Score"));
      allData.push(calcBoxPlotVals(exploit_score, "Exploit Score"));
      allData.push(calcBoxPlotVals(impact_score, "Impact Score"));
      setPlotData(allData);
    }
  }, [props.scan, props.cveData]);

  const defaultTooltipRender = ({ point }) => (
    <p style={{ lineHeight: "1.25", margin: "0", padding: "5px" }}>
      <b style={{ fontSize: "18px" }}>{point.category}</b>
      <br />
      <b>Lower:</b> {point.value.lower}
      <br />
      <b>Q1:</b> {point.value.q1 + 0.1}
      <br />
      <b>Median:</b> {point.value.median}
      <br />
      <b>Q3:</b> {point.value.q3 - 0.1}
      <br />
      <b>Upper:</b> {point.value.upper}
      <br />
      <b>Mean:</b> {point.value.mean}
      <br />
    </p>
  );

  const ChartContainer = () => (
    <Chart>
      <ChartTitle text="Vulnerability Overview" />
      <ChartTooltip render={defaultTooltipRender} />
      <ChartSeries>
        <ChartSeriesItem
          type="boxPlot"
          lowerField="lower"
          q1Field="q1"
          medianField="median"
          q3Field="q3"
          upperField="upper"
          meanField="mean"
          categoryField="name"
          data={plotData}
        />
      </ChartSeries>
    </Chart>
  );

  return <ChartContainer />;
};

export default CVSSBoxPlot;
