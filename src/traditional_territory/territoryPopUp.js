import * as L from "leaflet";
import centralityEst from "./centrality.json";
import { cerPalette } from "../util";

export function addTraditionalTerritory(map, mapHeight) {
  const imageExtension = ".1.png";
  function circleTooltip(landInfo) {
    let table = `<h3 class="center-header" style="margin-bottom: 5px"><b>${landInfo.Community} - Traditional Territory</b></h3>`;
    table +=
      "Circle represents approximate centrality of the traditional territory";
    table += `<i class="center-footer">Click to view full Traditional Territory map &amp; info</i>`;
    return table;
  }

  function popUpTable(landInfo) {
    let table = `<table class="table"><caption><h3>${landInfo.Community} Information</h3></caption>`;
    table += `<tbody>`;
    table += `<tr><td>Leadership</td><td><strong>${landInfo.Leadership}</strong></td></tr>`;
    table += `<tr><td>Contact person</td><td><strong>${landInfo["Contact person"]}</strong></td></tr>`;
    table += `<tr><td>Contact Information</td><td><strong>${landInfo["Contact Information"]}</strong></td></tr>`;
    table += `<tr><td>Protocol</td><td><strong>${landInfo.Protocol}</strong></td></tr>`;
    table += `<tr><td>About Us</td><td><strong>${landInfo["About Us"]}</strong></td></tr>`;
    table += `<tr><td colspan="2"><a href="${landInfo["Community Website"]}" target="_blank">Community Website</a></td></tr>`;
    table += `</tbody></table>`;
    return table;
  }

  function addCircles() {
    const popHeight = Math.floor(mapHeight * 0.7);
    const landCircles = centralityEst.map((land) => {
      const landMarker = L.circleMarker([land.Lat, land.Long], {
        color: cerPalette["Cool Grey"],
        fillColor: cerPalette["Cool Grey"],
        weight: 75,
        opacity: 0.1,
        fillOpacity: 1,
      });
      landMarker.bindTooltip(circleTooltip(land));
      landMarker.bindPopup(
        `<div class="territory-popup"><img src="../images/${
          land.mapFile
        }${imageExtension}" height="${popHeight}px" width="${popHeight}px"/>${popUpTable(
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
