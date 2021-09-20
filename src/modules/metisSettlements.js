import * as esri from "esri-leaflet";
import { metisTooltip, featureStyles } from "./util.js";

export function addMetisSettlements(map) {
  let esriLayer = false;
  try {
    esriLayer = esri
      .featureLayer({
        url: "https://maps.alberta.ca/genesis/rest/services/First_Nations_Land/Latest/MapServer/5",
        style: featureStyles.metis,
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
    });
  } catch (err) {
    esriLayer = false;
  }
  return esriLayer;
}
