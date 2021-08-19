import * as L from "leaflet";
import centralityEst from "./approx_centrality.json";
import { cerPalette } from "../util";

export function addTraditionalTerritory(map, mapHeight) {
  function circleTooltip(landInfo) {
    let table = `<h3 class="center-header" style="margin-bottom: 5px"><b>${landInfo.community} - Traditional Territory</b></h3>`;
    table +=
      "Circle represents approximate centrality of the traditional territory";
    table += `<i class="center-footer">Click to view full Traditional Territory map &amp; info</i>`;
    return table;
  }

  function popUpTable(landInfo) {
    let table = `<table class="table"><caption><h3>${landInfo.community} Information</h3></caption>`;
    table += `<tbody>`;
    table += `<tr><td>Leadership</td><td><strong>${landInfo.leadership}</strong></td></tr>`;
    table += `<tr><td>Concerns/Issues</td><td><strong>${landInfo.concerns_issues}</strong></td></tr>`;
    table += `<tr><td>Project Spreads</td><td><strong>${landInfo.projectSpreads}</strong></td></tr>`;
    table += `</tbody></table>`;
    return table;
  }

  function addCircles() {
    const popHeight = Math.floor(mapHeight * 0.7);
    const landCircles = centralityEst.map((land) => {
      const landMarker = L.circleMarker([land.lat, land.long], {
        color: cerPalette["Cool Grey"],
        fillColor: cerPalette["Cool Grey"],
        weight: 75,
        opacity: 0.1,
        fillOpacity: 1,
      });
      landMarker.bindTooltip(circleTooltip(land));
      landMarker.bindPopup(
        `<div class="territory-popup"><img src="../images/${
          land.mapName
        }" height="${popHeight}px" width="${popHeight}px"/>${popUpTable(
          land
        )}</div>`,
        { maxHeight: `${popHeight}`, maxWidth: `${popHeight}` }
      );

      return landMarker;
    });
    return L.featureGroup(landCircles).addTo(map);
  }
  const territoryLayer = addCircles();

  return territoryLayer;
}
