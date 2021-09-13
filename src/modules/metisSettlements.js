import * as esri from "esri-leaflet";
import { cerPalette, metisTooltip } from "./util.js";

export function addMetisSettlements(map) {
  const metisStyle = {
    fillColor: cerPalette.Forest,
    color: cerPalette.Flame,
    weight: 10,
    opacity: 0.5,
    fillOpacity: 1,
  };

  const esriLayer = esri
    .featureLayer({
      url: "https://maps.alberta.ca/genesis/rest/services/First_Nations_Land/Latest/MapServer/5",
      style: metisStyle,
      //   onEachFeature(feature, layer) {
      //     layer.on({
      //       click(e) {
      //         console.log(e);
      //       },
      //     });
      //   },
      // simplifyFactor: 0.5,
      // precision: 5,
    })
    .bindTooltip((layer) => metisTooltip(layer))
    .addTo(map);

  esriLayer.once("load", () => {
    const bounds = L.latLngBounds([]);
    esriLayer.eachFeature((layer) => {
      const layerBounds = layer.getBounds();
      bounds.extend(layerBounds);
    });
    // console.log(bounds);
    // map.fitBounds(bounds);
  });

  return esriLayer;
}
