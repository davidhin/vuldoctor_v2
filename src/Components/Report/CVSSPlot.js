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
    "NETWORK:attackVector": "#f44336",
    "ADJACENT_NETWORK:attackVector": "#f44336",
    "LOCAL:attackVector": "#e57373",
    "PHYSICAL:attackVector": "#ffcdd2",

    "LOW:attackComplexity": "#f44336",
    "HIGH:attackComplexity": "#ffcdd2",

    "NONE:privilegeRequired": "#f44336",
    "LOW:privilegeRequired": "#e57373",
    "HIGH:privilegeRequired": "#ffcdd2",

    "NONE:userInteraction": "#f44336",
    "REQUIRED:userInteraction": "#ffcdd2",

    "CHANGED:scope": "#f44336",
    "UNCHANGED:scope": "#f44336",

    "HIGH:availabilityImpact": "#f44336",
    "LOW:availabilityImpact": "#e57373",
    "NONE:availabilityImpact": "#ffcdd2",

    "HIGH:confidentialityImpact": "#f44336",
    "LOW:confidentialityImpact": "#e57373",
    "NONE:confidentialityImpact": "#ffcdd2",

    "HIGH:integrityImpact": "#f44336",
    "LOW:integrityImpact": "#e57373",
    "NONE:integrityImpact": "#ffcdd2",
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
        cvss_vals[cve[cat] + ":" + cat][idx] += 1;
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
