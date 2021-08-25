import "core-js/modules/es.promise.js";
import * as L from "leaflet";
import { equalizeHeight, cerPalette } from "./util.js";
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
    document.getElementById(
      "leaflet-map-title"
    ).innerText = `Map - ${meta.company} & First Nations Reserves`;
  }

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

        let dbHeight = document.getElementById("map-panel").clientHeight;
        if (!dbHeight || dbHeight === 0) {
          // set dashboard to 700 pixels if I cant access client screen size
          dbHeight = 700;
        }
        const otherHeight =
          15 + document.getElementById("reset-map").clientHeight;
        const clickDivHeight = `${(dbHeight - otherHeight).toFixed(0)}`;
        document
          .getElementById("click-fn-info")
          .setAttribute("style", `height:${clickDivHeight}px`);
      },
      false
    );
  }

  function addpoly2Length(treaties) {
    const treatyDiv = document.getElementById("treaty-length");
    let treatyHtml = '<table class="table">';
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

  function removeIncidents(map) {
    map.legend.removeItem();
    map.eachLayer((layer) => {
      if (Object.prototype.hasOwnProperty.call(layer.options, "type")) {
        layer.remove();
      }
    });
  }

  function getSum(total, num) {
    return total + num.length;
  }

  function eventTooltip(event) {
    let toolText = `<table class="map-tooltip">`;
    toolText += `<caption><b>${event.id}</b></caption>`;
    toolText += `<tr><td>Status:&nbsp</td><td><b>${event.status}</td></tr>`;
    toolText += `<tr><td>Incident Type:&nbsp</td><td><b>${event.type}</td></tr>`;
    toolText += `<tr><td>Substance:&nbsp</td><td><b>${event.sub}</td></tr>`;
    toolText += `<tr><td>What Happened:&nbsp</td><td><b>${event.what}</td></tr>`;
    toolText += `<tr><td>Why It Happened:&nbsp</td><td><b>${event.why}</td></tr>`;
    toolText += `<tr><td>Approximate volume released:&nbsp</td><td><b>${
      event.vol === null ? "Not provided" : `${event.vol} (m3)`
    }</td></tr>`;
    if (event.distance > 0) {
      const lengthInfo = lengthUnits(event.distance);
      toolText += `<tr><td>Approximate distance from ${event.landId}:&nbsp</td><td><b>${lengthInfo[0]}&nbsp${lengthInfo[1]}</td></tr>`;
    }
    return toolText;
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
      }).bindTooltip(eventTooltip(eventInfo));

    const proximityCount = { on: 0, close: 0 };
    if (incidents) {
      map.legend.addItem();
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
        let popHtml = `<div class="col-md-12"><h3 class="center-header">${feature.properties.NAME1}</h3>`;

        // first table: pipeline overlaps
        popHtml += `<table class="table" style="margin-bottom:0px">`;
        popHtml += `<caption>Pipeline Overlaps</caption><tbody>`;
        layerInfo.overlaps.forEach((overlap) => {
          const l = lengthUnits(overlap.length);
          popHtml += `<tr><td>${overlap.plname} (${overlap.status})</td><td><b>${l[0]}${l[1]}<b></td></tr>`;
        });
        if (layerInfo.overlaps.length > 1) {
          popHtml += `<tr><td>Total: </td><td><b>${total[0]}${total[1]}<b></td></tr>`;
        }
        popHtml += `</tbody></table>`;

        // second table: incident overlaps
        popHtml += `<table class="table" style="margin-bottom:0px">`;
        popHtml += `<caption>Incident Overlaps</caption></table>`;

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

    let table = `<table class="map-tooltip">`;
    table += `<caption><b>${layer.NAME1}</b></caption>`;
    table += `<tr><td>Land Type:&nbsp</td> <td><b>${layerInfo.meta.altype}</td></tr>`;
    table += `<tr><td>Total overlap:&nbsp</td> <td><b>${length[0]} ${length[1]}</td></tr>`;
    table += `</table><i class="center-footer">Click to view details</i>`;
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

  function mapLegend(map, territoryLayer) {
    let legend = `<h4><span class="region-click-text" style="height: 10px;">&nbsp;&nbsp;&nbsp;</span>&nbsp;&nbsp;First Nation Reserve</h4>`;
    if (territoryLayer) {
      legend += `<h4 style='color:${cerPalette.Aubergine};'>&#9473;&#9473; TMX</h4>`;
      legend += `<h4 style='color:${cerPalette["Cool Grey"]};'>&#11044; Traditional Territory</h4>`;
    }
    const info = L.control();
    info.onAdd = function () {
      this._div = L.DomUtil.create("div", "legend");
      this._div.innerHTML = legend;
      map.legend = this;
      return this._div;
    };
    info.addItem = function () {
      this._div.innerHTML += `<h4 class="legend-temp" style='color:${cerPalette.hcRed};'>&#11044; Incident</h4>`;
    };
    info.removeItem = function () {
      this._div.getElementsByClassName("legend-temp").forEach((toHide) => {
        toHide.remove();
      });
    };
    info.addTo(map);
    return info;
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
    if (meta.company === "Trans Mountain Pipeline ULC") {
      territoryLayer = addTraditionalTerritory(map, mapHeight);
    }

    mapLegend(map, territoryLayer);
    resetZoom(map, geoLayer, territoryLayer);

    document.getElementById("reset-map").addEventListener("click", () => {
      resetZoom(map, geoLayer, territoryLayer, true);
      removeIncidents(map);
      map.closePopup();
      document.getElementById("intersection-details").innerHTML =
        '<div class="alert alert-info"><p>Click on a <span class="region-click-text">region</span> to view extra info</p></div>';
    });

    return map;
  }

  function loadNonMap() {
    setTitle();
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
  main();
}
