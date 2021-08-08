import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { equalizeHeight, cerPalette, justWhy } from "./util";
import { addTraditionalTerritory } from "./traditional_territory/territoryPopUp";

require("./main.css");

export function landDashboard(
  landFeature,
  landInfo,
  poly2Length,
  incidentFeature,
  meta,
  line = false
) {
  function setLeafletHeight(scale = 0.7) {
    const clientSize = Math.floor(window.innerHeight * scale);
    const leafletDiv = document.getElementById("map");
    leafletDiv.setAttribute("style", `height:${clientSize}px`);
    leafletDiv.style.height = `${clientSize}px`;
    return clientSize;
  }

  const lengthUnits = (val) => {
    if (val >= 1000) {
      return [(val / 1000).toFixed(1), "km"];
    }
    return [val.toFixed(1), "m"];
  };

  function setTitle() {
    const mapTitle = document.getElementById("leaflet-map-title");
    mapTitle.innerText = `Map - ${meta.company} & First Nations Reserves`;
  }

  setTitle();

  function setupHeight() {
    // dynamically size leaflet container
    const addStyle = (val) => `<strong>${val}</strong>`;
    const flagClass = (val) =>
      val > 0 ? "alert alert-danger" : "alert alert-success";
    document.addEventListener(
      "DOMContentLoaded",
      () => {
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

        document.getElementById("incident-meta-point-on").innerHTML =
          htmlLiIncOn;
        document.getElementById("incident-meta-point-off").innerHTML =
          htmlLiIncOff;

        const div = document.getElementById("click-fn-info");
        const dbHeight = document.getElementById("map-panel").clientHeight;
        const resetBtnHeight =
          document.getElementById("reset-map").clientHeight;
        const otherHeight = 15 + resetBtnHeight;
        const clickDivHeight = `${(dbHeight - otherHeight).toFixed(0)}`;
        div.setAttribute("style", `height:${clickDivHeight}px`);
      },
      false
    );
  }

  function addpoly2Length(treaties) {
    const treatyDiv = document.getElementById("treaty-length");
    let treatyHtml = '<table class="table">';
    // treatyHtml += ` <caption>CER pipeline within Pre 1975 Historic Treaty land</caption>`;
    treatyHtml += `<thead><tr><th scope="col" class="col-sm-6">Treaty Name</th><th scope="col" class="col-sm-6">Operating Km</th></tr></thead>`;
    treatyHtml += `<tbody>`;
    treaties.forEach((land) => {
      treatyHtml += `<tr><td>${land.ENAME}:</td><td> ${(
        land.length_gpd / 1000
      ).toFixed(0)} km</td></tr>`;
    });
    treatyHtml += "</tbody></table>";
    treatyDiv.innerHTML = treatyHtml;
  }

  function leafletBaseMap(config) {
    const map = new L.map(config.div, {
      zoomDelta: config.zoomDelta,
      minZoom: 5,
      maxZoom: 16,
      zoomSnap: 0.25,
      // padding: [200, 200],
    }).setView(config.initZoomTo, config.initZoomLevel);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
      foo: "bar",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    // map.setMinZoom(config.minZoom);
    return map;
  }

  function removeIncidents(map) {
    map.eachLayer((layer) => {
      if (Object.prototype.hasOwnProperty.call(layer.options, "type")) {
        layer.remove();
      }
    });
  }

  function getSum(total, num) {
    return total + num.length;
  }

  function addIncidents(map, name) {
    removeIncidents(map);
    const incidents = incidentFeature[name];
    const addCircle = (x, y, color, fillColor, fillOpacity, r, eventInfo) =>
      L.circle([x, y], {
        color,
        fillColor,
        fillOpacity,
        radius: r,
        weight: 1,
        type: "incident",
      }).bindTooltip(`<strong>${eventInfo.incidentId}</strong>`);

    const proximityCount = { on: 0, close: 0 };
    if (incidents) {
      const points = incidents.map((p) => {
        if (p.distance === 0) {
          proximityCount.on += 1;
        } else {
          proximityCount.close += 1;
        }
        return addCircle(
          p.loc[0],
          p.loc[1],
          cerPalette["Cool Grey"], // border
          cerPalette.hcRed, // fill
          1,
          1000,
          p
        );
      });
      L.featureGroup(points).addTo(map);
    }
    return proximityCount;
  }

  function onEachFeature(feature, layer) {
    const alertClass = (val, type) => {
      if (type === "on" && val > 0) {
        return "alert alert-danger";
      }
      if (type === "close" && val > 0) {
        return "alert alert-warning";
      }
      return "alert alert-success";
    };

    layer.on({
      click(e) {
        const layerInfo = landInfo[feature.properties.NAME1];
        const totalLength = layerInfo.overlaps.reduce(getSum, 0);

        this._map.fitBounds(e.target.getBounds(), {
          padding: [200, 200],
        });

        const proximityCount = addIncidents(
          this._map,
          feature.properties.NAME1
        );
        const total = lengthUnits(totalLength);
        let popHtml = '<div class="col-md-12">';

        popHtml += `<h3 class="center-header">${feature.properties.NAME1}</h3>`;

        // first table: pipeline overlaps
        popHtml += `<table class="table" style="margin-bottom:0px">`;
        popHtml += `<caption>Pipeline Overlaps</caption>`;
        popHtml += `<tbody>`;
        layerInfo.overlaps.forEach((overlap) => {
          const l = lengthUnits(overlap.length);
          popHtml += `<tr><td>${overlap.plname} (${overlap.status})</td><td><b>${l[0]}${l[1]}<b></td></tr>`;
        });
        if (layerInfo.overlaps.length > 1) {
          popHtml += `<tr><td>Total: </td><td><b>${total[0]}${total[1]}<b></td></tr>`;
        }
        popHtml += `</tbody>`;
        popHtml += "</table>";

        // second table: incident overlaps
        popHtml += `<table class="table" style="margin-bottom:0px">`;
        popHtml += `<caption>Incident Overlaps</caption>`;
        popHtml += "</table>";

        popHtml += `<div style="margin-bottom: 15px" class="${alertClass(
          proximityCount.on,
          "on"
        )} col-md-12"><p>${
          proximityCount.on
        } incidents directly within</p></div>`;
        popHtml += `<div class="${alertClass(
          proximityCount.close,
          "close"
        )} col-md-12"><p>${
          proximityCount.close
        } incidents within 15km</p></div>`;
        popHtml += "</div>";
        document.getElementById("intersection-details").innerHTML = popHtml;
      },
    });
  }

  function toolText(layer) {
    const layerInfo = landInfo[layer.NAME1];
    const totalLength = layerInfo.overlaps.reduce(getSum, 0);
    const length = lengthUnits(totalLength);

    let table = `<table id="fn-tooltip">`;
    table += `<caption><b>${layer.NAME1}</b></caption>`;
    table += `<tr><td>Land Type:&nbsp</td> <td><b>${layerInfo.meta.altype}</td></tr>`;
    table += `<tr><td>Total overlap:&nbsp</td> <td><b>${length[0]} ${length[1]}</td></tr>`;
    table += "</table>";
    table += `<i class="center-footer">Click to view details</i>`;
    return table;
  }

  function resetZoom(map, geoLayer, territoryLayer, fly = false) {
    let padd = [25, 25];
    let fullBounds = geoLayer.getBounds();
    if (territoryLayer) {
      fullBounds = fullBounds.extend(territoryLayer.getBounds());
    }
    if (Object.keys(geoLayer._layers).length === 1) {
      padd = [270, 270];
    }
    if (fly) {
      map.flyToBounds(fullBounds, {
        duration: 0.25,
        easeLinearity: 1,
        padding: padd,
      });
    } else {
      map.fitBounds(fullBounds, {
        padding: padd,
      });
    }
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
      onEachFeature,
    })
      .bindTooltip((layer) => toolText(layer.feature.properties))
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
    let legend = `<h4><span id="region-click-text" style="height: 10px;">&nbsp;&nbsp;&nbsp;</span>&nbsp;&nbsp;First Nation Reserve</h4>`;
    if (meta.company === "Trans Mountain Pipeline ULC") {
      territoryLayer = addTraditionalTerritory(map, mapHeight);
      legend += `<h4 style='color:${cerPalette.Aubergine};'>&#9473;&#9473; TMX</h4>`;
      legend += `<h4 style='color:${cerPalette["Cool Grey"]};'>&#11044; Traditional Territory</h4>`;
    }
    const info = L.control();
    info.onAdd = function () {
      this._div = L.DomUtil.create("div", "info");
      this._div.innerHTML = legend;
      return this._div;
    };
    info.addTo(map);

    resetZoom(map, geoLayer, territoryLayer);

    document.getElementById("reset-map").addEventListener("click", () => {
      resetZoom(map, geoLayer, territoryLayer, true);
      removeIncidents(map);
      map.closePopup();
      document.getElementById("intersection-details").innerHTML =
        '<div class="alert alert-info"><p>Click on a <span id="region-click-text">region</span> to view extra info</p></div>';
    });

    return map;
  }

  function loadNonMap() {
    addpoly2Length(poly2Length);
    equalizeHeight("eq1", "eq2");
    setupHeight();
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

  if (!justWhy()) {
    main();
  } else {
    document.getElementsByClassName("container-fluid").forEach((div) => {
      const ieDiv = div;
      ieDiv.innerHTML = `<section class="alert alert-danger mrgn-tp-lg"><h2>Outdated Browser</h2><p>This web app does not support internet explorer. Please paste the link into <strong>Microsoft Edge</strong> or <strong>Google Chrome</strong>.</p></section>`;
    });
  }
}
