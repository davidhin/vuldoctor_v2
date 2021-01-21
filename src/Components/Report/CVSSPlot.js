import {
  Chart,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartLegend,
  ChartSeries,
  ChartSeriesItem,
  ChartTitle,
  ChartTooltip,
} from "@progress/kendo-react-charts";
import "@progress/kendo-theme-material/dist/all.css";
import React, { useEffect, useState } from "react";

const CVSSPlot = (props) => {
  const [cveData, setCveData] = useState(props.cveData);
  const [plotData, setPlotData] = useState(null);

  const categories = [
    "attackVector",
    "attackComplexity",
    "privilegeRequired",
    "userInteraction",
    "scope",
    "confidentialityImpact",
    "availabilityImpact",
    "integrityImpact",
  ];

  const colours = {
    "NETWORK:attackVector": "#ff1744",
    "ADJACENT_NETWORK:attackVector": "#ff9100",
    "LOCAL:attackVector": "#ffea00",
    "PHYSICAL:attackVector": "#b0bec5",

    "LOW:attackComplexity": "#ff1744",
    "HIGH:attackComplexity": "#ff9100",

    "NONE:privilegeRequired": "#ff1744",
    "LOW:privilegeRequired": "#ffea00",
    "HIGH:privilegeRequired": "#b0bec5",

    "NONE:userInteraction": "#ff1744",
    "REQUIRED:userInteraction": "#ff9100",

    "CHANGED:scope": "#ff9100",
    "UNCHANGED:scope": "#ff9100",

    "HIGH:availabilityImpact": "#ff1744",
    "LOW:availabilityImpact": "#ffea00",
    "NONE:availabilityImpact": "#b0bec5",

    "HIGH:confidentialityImpact": "#ff1744",
    "LOW:confidentialityImpact": "#ffea00",
    "NONE:confidentialityImpact": "#b0bec5",

    "HIGH:integrityImpact": "#ff1744",
    "LOW:integrityImpact": "#ffea00",
    "NONE:integrityImpact": "#b0bec5",
  };

  const scores = {
    "NETWORK:attackVector": 3,
    "ADJACENT_NETWORK:attackVector": 2.5,
    "LOCAL:attackVector": 2,
    "PHYSICAL:attackVector": 1,

    "LOW:attackComplexity": 3,
    "HIGH:attackComplexity": 1,

    "NONE:privilegeRequired": 3,
    "LOW:privilegeRequired": 2,
    "HIGH:privilegeRequired": 1,

    "NONE:userInteraction": 3,
    "REQUIRED:userInteraction": 1,

    "CHANGED:scope": 2,
    "UNCHANGED:scope": 2,

    "HIGH:availabilityImpact": 3,
    "LOW:availabilityImpact": 2,
    "NONE:availabilityImpact": 1,

    "HIGH:confidentialityImpact": 3,
    "LOW:confidentialityImpact": 2,
    "NONE:confidentialityImpact": 1,

    "HIGH:integrityImpact": 3,
    "LOW:integrityImpact": 2,
    "NONE:integrityImpact": 1,
  };

  const defaultTooltipRender = ({ point }) => (
    <p style={{ lineHeight: "1.25", margin: "0", padding: "5px" }}>
      <b style={{ fontSize: "18px" }}>{point.category}</b>
      <br />
      <i style={{ fontSize: "15px" }}>{point.series.name.split(":")[0]}</i>
      <br />
      Score: {point.value}
    </p>
  );

  useEffect(() => {
    setCveData(props.cveData);
    // Calculate CVE values
    let cvss_vals = {};
    cveData.forEach((cve) => {
      categories.forEach((cat) => {
        cvss_vals[cve[cat] + ":" + cat] = new Array(8).fill(0);
      });
    });
    categories.forEach((cat, idx) => {
      cveData.forEach((cve) => {
        cvss_vals[cve[cat] + ":" + cat][idx] += scores[cve[cat] + ":" + cat];
      });
    });
    setPlotData(cvss_vals);
  }, [props.scan, props.cveData]);

  const ChartContainer = () => (
    <div>
      {plotData ? (
        <Chart>
          <ChartTitle text="CVSS Breakdown" />
          <ChartLegend visible={false} />
          <ChartTooltip render={defaultTooltipRender} />
          <ChartCategoryAxis>
            <ChartCategoryAxisItem
              labels={{ rotation: "auto" }}
              categories={categories}
            />
          </ChartCategoryAxis>

          <ChartSeries>
            {Object.entries(plotData).map((e) => (
              <ChartSeriesItem
                name={e[0]}
                type="column"
                stack={true}
                data={e[1]}
                color={colours[e[0]]}
              />
            ))}
          </ChartSeries>
        </Chart>
      ) : (
        <div>Loading</div>
      )}
    </div>
  );

  return <ChartContainer />;
};

export default CVSSPlot;
