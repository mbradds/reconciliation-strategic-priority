import "core-js/modules/es.promise.js";
import * as L from "leaflet";
import {
  equalizeHeight,
  cerPalette,
  leafletBaseMap,
  setLeafletHeight,
  lengthUnits,
  setTitle,
  setUpHeight,
  addpoly2Length,
  onEachFeature,
  mapLegend,
  resetZoom,
  reserveTooltip,
  resetListener,
} from "./util.js";
import { addTraditionalTerritory } from "./territoryPopUp.js";
import "leaflet/dist/leaflet.css";
import "../main.css";

export function landDashboard(
  landFeature,
  landInfo,
  poly2Length,
  incidentFeature,
  meta,
  line = false
) {
  function dashboardTotals() {
    const addStyle = (val) => `<strong>${val}</strong>`;
    const flagClass = (val) =>
      val > 0 ? "alert alert-danger" : "alert alert-success";

    let totalFeatures = 0;
    landFeature.features.forEach(() => {
      totalFeatures += 1;
    });
    const lengthInfo = lengthUnits(meta.totalLength);
    const htmlLiOver = `Approximately ${addStyle(lengthInfo[0])} ${
      lengthInfo[1]
    } of regulated pipeline passes directly through ${addStyle(
      totalFeatures
    )} First Nations Reserves.`;
    document.getElementById("overlap-meta-point").innerHTML = htmlLiOver;

    const incidentMeta = incidentFeature.meta;
    const htmlLiIncOn = `<div class="${flagClass(
      incidentMeta.on
    )}"><p>There have been ${addStyle(
      incidentMeta.on
    )} reported system incidents directly on First Nations Reserves.</p></div>`;

    const htmlLiIncOff = `<div class="${flagClass(
      incidentMeta["15km"]
    )}"><p>There have been ${addStyle(
      incidentMeta["15km"]
    )} reported system incidents within 15 km of First Nations Reserves.</p></div>`;

    document.getElementById("incident-meta-point-on").innerHTML = htmlLiIncOn;
    document.getElementById("incident-meta-point-off").innerHTML = htmlLiIncOff;
  }

  function loadMap(mapHeight) {
    const map = leafletBaseMap({
      div: "map",
      zoomDelta: 0.25,
      initZoomLevel: 4,
      initZoomTo: [55, -119],
    });

    const reserveStyle = {
      fillColor: cerPalette["Night Sky"],
      color: cerPalette.Sun,
      weight: 20,
      opacity: 0.5,
      fillOpacity: 1,
    };

    const geoLayer = L.geoJSON(landFeature, {
      style: reserveStyle,
      landInfo: landInfo,
      incidentFeature: incidentFeature,
      onEachFeature,
    })
      .bindTooltip((layer) =>
        reserveTooltip(layer.feature.properties, landInfo)
      )
      .addTo(map);

    if (line) {
      L.geoJSON(line, {
        style: {
          fillColor: cerPalette.Aubergine,
          color: cerPalette.Aubergine,
          className: "no-hover",
          fillOpacity: 1,
        },
      }).addTo(map);
    }

    let territoryLayer = false;
    if (meta.company === "Trans Mountain Pipeline ULC") {
      territoryLayer = addTraditionalTerritory(map, mapHeight);
    }

    mapLegend(map, territoryLayer);
    resetZoom(map, geoLayer, territoryLayer);
    resetListener(map, geoLayer, territoryLayer);
    return map;
  }

  function loadNonMap() {
    setTitle(meta.company);
    addpoly2Length(poly2Length);
    equalizeHeight("eq1", "eq2");
    dashboardTotals();
    setUpHeight();
  }

  function main() {
    async function buildPage() {
      const mapHeight = setLeafletHeight(0.75);
      loadNonMap();
      const map = await loadMap(mapHeight);
      return map;
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