import * as L from "leaflet";
import centralityEst from "../traditional_territory/centrality.json";
import { cerPalette, featureStyles } from "./util.js";

function popUpTable(landInfo) {
  let tableHtml = `<p>Image source:&nbsp;<a href="${landInfo[0].srcLnk}" target="_blank">${landInfo[0].srcTxt}</a></p>`;
  tableHtml += `<div id="image-disclaimer" class="alert alert-warning">
  <h2>&nbsp; Traditional Territory Map Disclaimer</h2>
  <p>These maps have been prepared using the Canada Energy Regulator
    internal Indigenous Engagement site information. These maps
    provide general information regarding each Nation including the
    general area of traditional territories. However, these maps do
    not represent the exact dimensions for the traditional territory
    of each Nation.</p></div>`;
  landInfo.forEach((land) => {
    let table = `<table class="table"><tbody>`;
    table += `<h2 class="center-header">${land.community}</h2>`;
    if (land.pronounce !== "") {
      table += `<h3 class="center-header"><i>Pronounced: ${land.pronounce}</i></h3>`;
    }
    table += `<tr><td>Leadership</td><td><strong>${land.leadership}</strong></td></tr>`;
    table += `<tr><td>Contact person</td><td><strong>${land.contactPerson}</strong></td></tr>`;
    table += `<tr><td>Contact Information</td><td><strong>${land.contactInfo}</strong></td></tr>`;
    table += `<tr><td>Protocol</td><td><strong>${land.protocol}</strong></td></tr>`;
    table += `<tr><td>Project Spreads</td><td><strong>${land.spread}</strong></td></tr>`;
    table += `<tr><td>About Us</td><td><strong>${land.about}</strong></td></tr>`;
    table += `<tr><td colspan="2"><a href="${land.web}" target="_blank">Community Website</a></td></tr>`;
    table += `</tbody></table>`;
    tableHtml += table;
  });
  return tableHtml;
}

export function addTraditionalTerritory(map, popHeight, popWidth) {
  function circleTooltip(landInfo, digitalInfo) {
    const digitalList = [];
    const foundDigital = digitalInfo;
    const communityNames = landInfo
      .map((land) => {
        if (land.dId !== "") {
          digitalList.push(land);
        }
        return land.pronounce === ""
          ? land.community
          : `${land.community}&nbsp;(<span class="glyphicon glyphicon-volume-up" aria-hidden="true"></span> <i>${land.pronounce}</i>)`;
      })
      .join("<br>");
    const plural = landInfo.length > 1 ? "territories" : "territory";
    let table = `<h3 class="center-header" style="margin-bottom: 5px"><b>${communityNames}</b></h3>`;
    table += `<p class="center-footer">Circle represents approximate centrality of the traditional ${plural}</p>`;
    table += `<i class="center-footer">Click to view full Traditional Territory map &amp; info</i>`;
    if (digitalList.length > 0) {
      foundDigital[landInfo[0].dId] = digitalList;
    }
    return table;
  }

  function addCircles() {
    const digitalMatch = {};
    const landCircles = Object.keys(centralityEst).map((landName) => {
      const land = centralityEst[landName];
      const params = featureStyles.territory;
      params.spreadNums = land.info.map((l) => l.spreadNumber);
      const landMarker = L.circleMarker([land.loc[0], land.loc[1]], params);
      landMarker.bindTooltip(circleTooltip(land.info, digitalMatch));
      landMarker.bindPopup(
        `<div class="territory-popup iamc-popup"><img src="../images/${landName}.1.png" height="${popHeight}px" width="${popWidth}px" max-width="${popWidth}px"/>${popUpTable(
          land.info
        )}</div>`,
        {
          maxHeight: `${popHeight}`,
          maxWidth: `${popWidth}`,
        }
      );
      return landMarker;
    });

    const territoryCircleLayer = L.featureGroup(landCircles);

    territoryCircleLayer.resetSpreads = function () {
      Object.values(this._layers).forEach((circle) => {
        circle.setStyle({ fillColor: featureStyles.territory.fillColor });
      });
    };
    territoryCircleLayer.findSpreads = function (highlight) {
      map.legend.removeItem();
      const zoomToLayer = [];
      Object.values(this._layers).forEach((circle) => {
        if (circle.options.spreadNums.includes(highlight)) {
          circle.setStyle({
            fillColor: cerPalette.Flame,
          });
          zoomToLayer.push(circle);
        }
      });
      if (zoomToLayer.length > 0) {
        map.fitBounds(L.featureGroup(zoomToLayer).getBounds());
        map.legend.addItem("spread", highlight);
      }
    };

    territoryCircleLayer.addTo(map);
    return [territoryCircleLayer, digitalMatch];
  }
  return addCircles();
}

export function addDigitalTerritory(
  territory,
  digitalMatch,
  popHeight,
  popWidth
) {
  const digitalTerritoryLayer = L.geoJSON(territory, {
    style(feature) {
      return { color: feature.properties.color };
    },
  })
    .bindTooltip(
      (layer) => {
        let table = `<table class="map-tooltip">`;
        table += `<caption><b>${layer.feature.properties.Name}</b></caption>`;
        table += `<tr><td>Land Type:&nbsp</td> <td><b>Traditional Territory</td></tr>`;
        table += `</table><i class="center-footer">Click to view details</i>`;
        return table;
      },
      { sticky: true }
    )
    .bindPopup(
      (layer) => {
        const cerInfo = digitalMatch[layer.feature.properties.Slug];
        return `<div class="territory-popup iamc-popup"><img src="../images/${
          cerInfo[0].map
        }.1.png" height="${popHeight}px" width="${popWidth}px" max-width="${popWidth}px"/>${popUpTable(
          cerInfo
        )}</div>`;
      },
      { maxHeight: `${popHeight}`, maxWidth: `${popWidth}` }
    );
  digitalTerritoryLayer.on("add", () => {
    digitalTerritoryLayer.bringToBack();
  });
  return digitalTerritoryLayer;
}
