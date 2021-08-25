import "core-js/modules/es.promise.js";
import * as L from "leaflet";
import { addpoly2Length } from "./util.js";
import "leaflet/dist/leaflet.css";
import "../main.css";
import "../cer.css";

export function profile(
  landFeature,
  landInfo,
  poly2Length,
  incidentFeature,
  meta
) {
  function iamc() {
    const flag = (info) => {
      return `<section class="alert alert-info">
      <h3>${info.project} Indigenous Advisory and Monitoring Committee (IAMC)</h3>
      <p>The ${info.project} project has a dedicated IAMC. The IAMC operates independently to increase Indigenous involvement in the federal monitoring and oversight in the ${info.project} project.</p>
      <p>For more information, visit their website (external links English only):</p>
      <ul>
      <li>${info.linkText}<a href="${info.link}">&nbsp;${info.link}</a></li>
      </ul>
      </section>`;
    };

    let info = {};
    if (meta.company === "Trans Mountain Pipeline ULC") {
      info.project = "TMX";
      info.linkText = "TMX Indigenous Advisory and Monitoring Committee";
      info.link = "https://iamc-tmx.com/";
      document.getElementById("iamc-flag").innerHTML = flag(info);
    } else if (meta.company === "Enbridge Pipelines Inc.") {
      info.project = "Line 3";
      info.linkText = "Line 3 Indigenous Advisory and Monitoring Committee";
      info.link = "http://iamc-line3.com/";
      document.getElementById("iamc-flag").innerHTML = flag(info);
    } else {
      return false;
    }
  }

  function dynamicText(meta) {
    console.log(meta);
    const text = `<p>Dynamic content here</p>`;
    document.getElementById("indigenous-dynamic-text").innerHTML = text;
  }

  function loadNonMap() {
    // setTitle(meta.company);
    addpoly2Length(poly2Length);
    iamc();
    dynamicText(meta);
    // dashboardTotals();
    // setUpHeight();
  }

  function main() {
    async function buildPage() {
      // const mapHeight = setLeafletHeight(0.75);
      loadNonMap();
      // const map = await loadMap(mapHeight);
      // return map;
    }

    buildPage().then(() => {
      document.getElementsByClassName("loader").forEach((div) => {
        const divToHide = div;
        divToHide.style.display = "none";
      });
    });
  }
  main();
}
