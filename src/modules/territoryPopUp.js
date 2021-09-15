import * as L from "leaflet";
import centralityEst from "../traditional_territory/centrality.json";
import { featureStyles } from "./util.js";

export function addTraditionalTerritory(map, mapHeight, user) {
  function circleTooltip(landInfo) {
    const communityNames = landInfo
      .map((land) =>
        land.pronounce === ""
          ? land.community
          : `${land.community}&nbsp;(<span class="glyphicon glyphicon-volume-up" aria-hidden="true"></span> <i>${land.pronounce}</i>)`
      )
      .join("<br>");
    const plural = landInfo.length > 1 ? "territories" : "territory";
    let table = `<h3 class="center-header" style="margin-bottom: 5px"><b>${communityNames}</b></h3>`;
    table += `<p class="center-footer">Circle represents approximate centrality of the traditional ${plural}</p>`;
    table += `<i class="center-footer">Click to view full Traditional Territory map &amp; info</i>`;
    return table;
  }

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

  function addCircles() {
    let popWidth = Math.floor(mapHeight * 0.8);
    const popHeight = Math.floor(popWidth * 0.9);
    if (user[1] < popWidth) {
      popWidth = user[1] - 85;
    }

    const landCircles = Object.keys(centralityEst).map((landName) => {
      const land = centralityEst[landName];
      const landMarker = L.circleMarker(
        [land.loc[0], land.loc[1]],
        featureStyles.territory
      );
      landMarker.bindTooltip(circleTooltip(land.info));
      landMarker.bindPopup(
        `<div class="territory-popup"><img src="../images/${landName}.1.png" height="${popHeight}px" width="${popWidth}px" max-width="${popWidth}px"/>${popUpTable(
          land.info
        )}</div>`,
        {
          maxHeight: `${popHeight}`,
          maxWidth: `${popWidth}`,
        }
      );
      return landMarker;
    });
    return L.featureGroup(landCircles).addTo(map);
  }
  return addCircles();
}
