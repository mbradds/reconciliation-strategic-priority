import "core-js/modules/es.promise.js";
import * as L from "leaflet";
import {
  equalizeHeight,
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
  plural,
  featureStyles,
  clickExtraInfo,
} from "./util.js";
import { addTraditionalTerritory } from "./territoryPopUp.js";
import { addMetisSettlements } from "./metisSettlements.js";
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
    )} First Nations ${plural(totalFeatures, "reserve", true)}.`;
    document.getElementById("overlap-meta-point").innerHTML = htmlLiOver;

    const incidentMeta = incidentFeature.meta;
    const htmlLiIncOn = `<div class="${flagClass(
      incidentMeta.on
    )}"><p>There has been ${addStyle(incidentMeta.on)} reported system ${plural(
      incidentMeta.on,
      "incident",
      false
    )} directly on First Nations Reserves.</p></div>`;

    const htmlLiIncOff = `<div class="${flagClass(
      incidentMeta["15km"]
    )}"><p>There has been ${addStyle(
      incidentMeta["15km"]
    )} reported system ${plural(
      incidentMeta["15km"],
      "incident",
      false
    )} within 15 km of First Nations Reserves.</p></div>`;

    document.getElementById("incident-meta-point-on").innerHTML = htmlLiIncOn;
    document.getElementById("incident-meta-point-off").innerHTML = htmlLiIncOff;
  }

  function loadMap(mapHeight, user) {
    const map = leafletBaseMap({
      div: "map",
      zoomDelta: 0.25,
      initZoomLevel: 4,
      initZoomTo: [55, -119],
    });

    const geoLayer = L.geoJSON(landFeature, {
      style: featureStyles.reserveOverlap,
      landInfo,
      incidentFeature,
      onEachFeature,
    })
      .bindTooltip((layer) =>
        reserveTooltip(layer.feature.properties, landInfo)
      )
      .addTo(map);

    if (line) {
      L.geoJSON(line, {
        style: featureStyles.tmx,
      }).addTo(map);
    }

    let [territoryLayer, metisLayer] = [false, false];
    if (meta.company === "Trans Mountain Pipeline ULC") {
      territoryLayer = addTraditionalTerritory(map, mapHeight, user);
      metisLayer = addMetisSettlements(map);
    }

    mapLegend(map, territoryLayer, metisLayer);
    resetZoom(map, geoLayer, [territoryLayer]);
    resetListener(map, geoLayer, [territoryLayer]);
    return map;
  }

  function loadNonMap() {
    clickExtraInfo();
    setTitle(meta.company);
    addpoly2Length(poly2Length, meta.company);
    dashboardTotals();
    const user = setUpHeight();
    if (user[0] !== "xs") {
      equalizeHeight("eq1", "eq2");
    }
    return user;
  }

  function main() {
    async function buildPage() {
      const mapHeight = setLeafletHeight(0.75);
      const user = loadNonMap();
      const map = await loadMap(mapHeight, user);
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
