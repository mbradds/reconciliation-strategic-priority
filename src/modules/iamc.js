import "core-js/modules/es.promise.js";
import * as L from "leaflet";
import pointInPolygon from "point-in-polygon";
import {
  leafletBaseMap,
  lengthUnits,
  setTitle,
  setUpHeight,
  addpoly2Length,
  reservePopUp,
  mapLegend,
  resetZoom,
  reserveTooltip,
  resetListener,
  plural,
  featureStyles,
  findUser,
} from "./util.js";
import {
  addTraditionalTerritory,
  addDigitalTerritory,
} from "./territoryPopUp.js";
import { addMetisSettlements } from "./metisSettlements.js";
import "leaflet/dist/leaflet.css";
import "../main.css";

export function landDashboard(
  landFeature,
  landInfo,
  poly2Length,
  incidentFeature,
  meta,
  line = false,
  territory = false
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

  function addResetBtn(map) {
    const info = L.control({ position: "bottomleft" });
    info.onAdd = function () {
      this._div = L.DomUtil.create("div");
      this._div.innerHTML = `<button type="button" id="find-me" class="btn btn-primary btn-block btn-lg">Find Me</button><button type="button" id="reset-map" class="btn btn-primary btn-block btn-lg">Reset Map</button>`;
      return this._div;
    };
    info.addTo(map);
  }

  function onLand(map, polygons) {
    const nearbyStuff = (mapWithUser) => {
      Object.values(polygons._layers).forEach((polygon) => {
        const inside = pointInPolygon(
          [mapWithUser.user.lng, mapWithUser.user.lat],
          polygon.feature.geometry.coordinates[0]
        );
        if (inside) {
          console.log(`You are inside ${polygon.feature.properties.Name}`);
        }
      });
      mapWithUser.panTo(mapWithUser.user);
    };

    document.getElementById("find-me").addEventListener("click", () => {
      if (!map.user) {
        findUser(map)
          .then(() => {
            // check polygons for user
            nearbyStuff(map);
          })
          .catch(() => {
            console.log("location error");
          });
      } else {
        // check polygons for user
        nearbyStuff(map);
      }
    });
  }

  function loadMap(mapHeight, user) {
    const layerControl = { single: {}, multi: {} };
    const map = leafletBaseMap({
      div: "map",
      zoomDelta: 0.25,
      initZoomLevel: 4,
      initZoomTo: [55, -119],
    });

    addResetBtn(map);
    const geoLayer = L.geoJSON(landFeature, {
      style: featureStyles.reserveOverlap,
      landInfo,
      incidentFeature,
    })
      .bindTooltip((layer) =>
        reserveTooltip(layer.feature.properties, landInfo)
      )
      .bindPopup((layer) => reservePopUp(layer))
      .addTo(map);

    layerControl.multi["First Nations Reserves"] = geoLayer;
    if (line) {
      L.geoJSON(line, {
        style: featureStyles.tmx,
      }).addTo(map);
    }

    let popWidth = Math.floor(mapHeight * 0.9);
    const popHeight = Math.floor(popWidth * 0.9);
    if (user[1] < popWidth) {
      popWidth = user[1] - 85;
    }

    let [territoryLayer, metisLayer, digitalMatch, digitalTerritoryLayer] = [
      false,
      false,
      false,
      false,
    ];
    if (meta.company === "Trans Mountain Pipeline ULC") {
      [territoryLayer, digitalMatch] = addTraditionalTerritory(
        map,
        popHeight,
        popWidth
      );
      metisLayer = addMetisSettlements(map);
      layerControl.single["Traditional Territory center point"] =
        territoryLayer;
      layerControl.multi["Metis Settlements"] = metisLayer;
    }

    if (territory) {
      digitalTerritoryLayer = addDigitalTerritory(
        territory,
        digitalMatch,
        popHeight,
        popWidth
      );
      layerControl.single["Digital Traditional Territory"] =
        digitalTerritoryLayer;
    }

    onLand(map, digitalTerritoryLayer);
    mapLegend(map, territoryLayer, metisLayer);
    resetZoom(map, geoLayer, [territoryLayer]);
    resetListener(map, geoLayer, [territoryLayer]);
    L.control
      .layers(layerControl.single, layerControl.multi, { position: "topleft" })
      .addTo(map);
    return map;
  }

  function loadNonMap() {
    setTitle(meta.company);
    addpoly2Length(poly2Length, meta.company);
    dashboardTotals();
    const user = setUpHeight();
    return user;
  }

  function main() {
    async function buildPage() {
      const mapHeight = document.getElementById("map").clientHeight;
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
