import * as L from "leaflet";
import centralityEst from "../traditional_territory/centrality.json";
import { cerPalette } from "./util.js";

export function addTraditionalTerritory(map, mapHeight) {
  const imageExtension = ".1.png";
  function circleTooltip(landInfo) {
    const communityNames = landInfo.map((land) => land.community).join("<br>");
    const plural = landInfo.length > 1 ? "territories" : "territory";
    let table = `<h3 class="center-header" style="margin-bottom: 5px"><b>${communityNames}</b></h3>`;
    table += `<p class="center-footer">Circle represents approximate centrality of the traditional ${plural}</p>`;
    table += `<i class="center-footer">Click to view full Traditional Territory map &amp; info</i>`;
    return table;
  }

  function popUpTable(landInfo) {
    let tableHtml = `<p>Image source:&nbsp;<a href="${landInfo[0].srcLnk}" target="_blank">${landInfo[0].srcTxt}</a></p>`;
    tableHtml += `<div id="image-disclaimer" class="alert alert-warning">
    <h3>&nbsp; Traditional Territory Map Disclaimer</h3>
    <p>These maps have been prepared using the Canada Energy Regulator
      internal Indigenous Engagement site information. These maps
      provide general information regarding each Nation including the
      general area of traditional territories. However, these maps do
      not represent the exact dimensions for the traditional territory
      of each Nation.</p></div>`;
    landInfo.forEach((land) => {
      let table = `<table class="table"><caption><h3>${land.community} Information</h3></caption><tbody>`;
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
    const popHeight = Math.floor(mapHeight * 0.7);
    const landCircles = Object.keys(centralityEst).map((landName) => {
      const land = centralityEst[landName];
      const landMarker = L.circleMarker([land.loc[0], land.loc[1]], {
        color: cerPalette["Cool Grey"],
        fillColor: cerPalette["Cool Grey"],
        weight: 75,
        opacity: 0.1,
        fillOpacity: 1,
      });
      landMarker.bindTooltip(circleTooltip(land.info));
      landMarker.bindPopup(
        `<div class="territory-popup"><img src="../images/${landName}${imageExtension}" height="${popHeight}px" width="${popHeight}px"/>${popUpTable(
          land.info
        )}</div>`,
        { maxHeight: `${popHeight}`, maxWidth: `${popHeight}` }
      );
      return landMarker;
    });
    return L.featureGroup(landCircles).addTo(map);
  }
  return addCircles();
}
