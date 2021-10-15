import { featureStyles } from "./util.js";
import spreadToKp from "../company_data/TransMountainPipelineULC/spreads.json";
import spreads from "../company_data/TransMountainPipelineULC/kilometerPosts.json";

function getSpreadNumber(kpNumber) {
  const foundSpreads = [];
  spreadToKp.forEach((sprd) => {
    if (sprd.Start <= kpNumber && sprd.Stop >= kpNumber) {
      foundSpreads.push({ spreadNum: sprd.Number, spreadSub: sprd.Sub });
    }
  });
  return foundSpreads;
}

export function spread(map) {
  const kpCircles = spreads.map((s) => {
    const params = featureStyles.spread;
    params.name = s.n;
    const landMarker = L.circleMarker([s.l[0], s.l[1]], params);
    landMarker.bindTooltip(`<strong>KP ${s.n}</strong>`);
    return landMarker;
  });

  const spreadLayer = L.featureGroup(kpCircles);
  spreadLayer.on("click", (e) => {
    const spreadNumber = getSpreadNumber(e.sourceTarget.options.name);
    console.log(spreadNumber);
  });
  spreadLayer.addTo(map);
  return spreadLayer;
}
