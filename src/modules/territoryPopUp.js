import * as L from "leaflet";
import centralityEst from "../traditional_territory/centrality.json";
import { featureStyles } from "./util.js";

function popUpTable(landInfo, hasImage) {
  let tableHtml = "";
  if (hasImage) {
    if (landInfo[0].srcLnk) {
      tableHtml += `<p>Image source:&nbsp;<a href="${landInfo[0].srcLnk}" target="_blank">${landInfo[0].srcTxt}</a></p>`;
    } else {
      tableHtml += `<p>Image source:&nbsp;not available</p>`;
    }
    tableHtml += `<div id="image-disclaimer" class="alert alert-warning">
    <h2>&nbsp; Traditional Territory Map Disclaimer</h2>
    <p>These maps have been prepared using the Canada Energy Regulator
      internal Indigenous Engagement site information. These maps
      provide general information regarding each Nation including the
      general area of traditional territories. However, these maps do
      not represent the exact dimensions for the traditional territory
      of each Nation.</p></div>`;
  }

  landInfo.forEach((land) => {
    let table = `<table class="table"><tbody>`;
    table += `<h2 class="center-header">${land.community}</h2>`;
    if (land.pronounce) {
      table += `<h3 class="center-header"><i>Pronounced: ${land.pronounce}</i></h3>`;
    }
    [
      ["Leadership", land.leadership],
      ["Contact Person", land.contactPerson],
      ["Contact Information", land.contactInfo],
      ["Protocol", land.protocol],
      ["Project Spreads", land.spread],
      ["About Us", land.about],
    ].forEach((row) => {
      const rowText = row[1] ? row[1] : "Not available";
      table += `<tr><td>${row[0]}</td><td><strong>${rowText}</strong></td></tr>`;
    });
    table += `<tr><td colspan="2"><a href="${land.web}" target="_blank">Community Website</a></td></tr>`;
    table += `</tbody></table>`;
    tableHtml += table;
  });
  return tableHtml;
}

export function addTraditionalTerritory(map, popHeight, popWidth) {
  function circleTooltip(landInfo) {
    const communityNames = landInfo
      .map((land) =>
        !land.pronounce
          ? land.community
          : `${land.community}&nbsp;(<span class="glyphicon glyphicon-volume-up" aria-hidden="true"></span> <i>${land.pronounce}</i>)`
      )
      .join("<br>");
    const plural = landInfo.length > 1 ? "communities" : "community";
    let table = `<h3 class="center-header" style="margin-bottom: 5px"><b>${communityNames}</b></h3>`;
    table += `<p class="center-footer">Circle represents approximate location of the ${plural}</p>`;
    table += `<i class="center-footer">Click to view full community info and traditional territory map</i>`;
    return table;
  }

  function addCircles() {
    const landCircles = Object.keys(centralityEst).map((landName) => {
      const land = centralityEst[landName];
      const params = featureStyles.territory;
      params.spreadNums = land.info.map((l) => l.spreadNumber);
      const landMarker = L.circleMarker([land.loc[0], land.loc[1]], params);
      landMarker.bindTooltip(circleTooltip(land.info));
      const hasImage = !!land.info[0].map;
      const imgHtml = hasImage
        ? `<img src="../images/${landName}.1.png" height="${popHeight}px" width="${popWidth}px" max-width="${popWidth}px"/>`
        : `<div class="well" style="text-align: center;"><span class="h3">Traditional Territory image not available<span></div>`;
      landMarker.bindPopup(
        `<div class="territory-popup iamc-popup">${imgHtml}${popUpTable(
          land.info,
          hasImage
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
      map.warningMsg.removeWarning();
      Object.values(this._layers).forEach((circle) => {
        circle.setStyle({
          fillColor: featureStyles.territory.fillColor,
          color: featureStyles.territory.color,
          opacity: featureStyles.territory.opacity,
        });
      });
    };
    territoryCircleLayer.findSpreads = function (highlight) {
      map.legend.removeItem();
      map.warningMsg.removeWarning();
      const zoomToLayer = [];
      Object.values(this._layers).forEach((circle) => {
        if (circle.options.spreadNums.includes(highlight)) {
          circle.setStyle({
            fillColor: featureStyles.community.fillColor,
            color: featureStyles.community.color,
            opacity: featureStyles.community.opacity,
          });
          zoomToLayer.push(circle);
        }
      });
      if (zoomToLayer.length > 0) {
        map.fitBounds(L.featureGroup(zoomToLayer).getBounds());
        map.legend.addItem("spread", highlight);
      } else {
        map.warningMsg.addWarning(
          `There are no communities identified for Spread ${highlight}`
        );
      }
    };

    territoryCircleLayer.addTo(map);
    return territoryCircleLayer;
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
