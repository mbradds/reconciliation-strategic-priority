// trans mountain
// import landFeature from "./company_data/TransMountainPipelineULC/reserve.json";
// import poly2Length from "./company_data/TransMountainPipelineULC/oldTreaty.json";
// import incidentFeature from "./company_data/TransMountainPipelineULC/events.json";

export function landDashboard(landFeature, poly2Length, incidentFeature) {
  const cerPalette = {
    "Night Sky": "#054169",
    Sun: "#FFBE4B",
    Ocean: "#5FBEE6",
    Forest: "#559B37",
    Flame: "#FF821E",
    Aubergine: "#871455",
    "Dim Grey": "#8c8c96",
    "Cool Grey": "#42464B",
    hcBlue: "#7cb5ec",
    hcGreen: "#90ed7d",
    hcPink: "#f15c80",
    hcRed: "#f45b5b",
    hcAqua: "#2b908f",
    hcPurple: "#8085e9",
    hcLightBlue: "#91e8e1",
  };

  const lengthUnits = (val) => {
    if (val >= 1000) {
      return [(val / 1000).toFixed(1), "kilometers"];
    } else {
      return [val.toFixed(1), "metres"];
    }
  };

  function setupHeight() {
    const addStyle = (val) => {
      return `<i class="bg-primary text-val">&nbsp${val}&nbsp</i>`;
    };
    document.addEventListener(
      "DOMContentLoaded",
      function () {
        var [totalLength, totalFeatures] = [0, 0];
        landFeature.features.map((poly) => {
          totalLength += poly.properties.length_gpd;
          totalFeatures += 1;
        });
        var lengthInfo = lengthUnits(totalLength);

        var htmlLiOver = `Approximately ${addStyle(lengthInfo[0])} ${
          lengthInfo[1]
        } of regulated pipeline passes directly through ${addStyle(
          totalFeatures
        )} First Nations Reserves.`;
        document.getElementById("overlap-meta-point").innerHTML = htmlLiOver;

        var incidentMeta = incidentFeature.meta;
        var htmlLiInc = `There have been ${addStyle(
          incidentMeta.on
        )} reported system incidents on First Nations Reserves and, ${addStyle(
          incidentMeta["15km"]
        )} incidents within 15 km of First Nations Reserves.`;

        document.getElementById("incident-meta-point").innerHTML = htmlLiInc;

        var div = document.getElementById("click-fn-info");
        var dbHeight = document.getElementById("map-panel").clientHeight;
        var resetBtnHeight = document.getElementById("reset-map").clientHeight;
        var otherHeight = 15 + resetBtnHeight;
        var clickDivHeight = `${(dbHeight - otherHeight).toFixed(0)}`;
        div.setAttribute("style", "height:" + clickDivHeight + "px");
      },
      false
    );
  }

  function addpoly2Length(treaties) {
    var treatyDiv = document.getElementById("treaty-length");
    var treatyHtml = '<table class="table">';
    treatyHtml += ` <caption>CER pipeline within Pre 1975 Historic Treaty land</caption>`;
    treatyHtml += `<thead><tr><th scope="col" class="col-sm-6">Treaty Name</th><th scope="col" class="col-sm-6">Operating Km</th></tr></thead>`;
    treatyHtml += `<tbody>`;
    treaties.map((land) => {
      treatyHtml += `<tr><td>${land.ENAME}:</td><td> ${(
        land.length_gpd / 1000
      ).toFixed(0)} km</td></tr>`;
    });
    treatyHtml += "</tbody></table>";
    treatyDiv.innerHTML = treatyHtml;
  }

  function leafletBaseMap(config) {
    var map = new L.map(config.div, {
      zoomDelta: config.zoomDelta,
      minZoom: 5,
      zoomSnap: 0.25,
      // padding: [200, 200],
    }).setView(config.initZoomTo, config.initZoomLevel);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
      foo: "bar",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    //map.setMinZoom(config.minZoom);
    return map;
  }

  function removeIncidents(map) {
    map.eachLayer(function (layer) {
      if (layer.options.hasOwnProperty("type")) {
        layer.remove();
      }
    });
  }

  function addIncidents(map, name) {
    removeIncidents(map);
    const addCircle = (x, y, color, fillColor, fillOpacity, r, name) => {
      return L.circle([x, y], {
        color: color,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        radius: r,
        weight: 1,
        name: name,
        type: "incident",
      }).bindTooltip(`<strong>${name}</strong>`);
    };

    var incidents = incidentFeature[name];
    var proximityCount = { on: 0, close: 0 };
    if (incidents) {
      var points = incidents.map((p) => {
        if (p.distance == 0) {
          proximityCount.on += 1;
        } else {
          proximityCount.close += 1;
        }
        return addCircle(
          p.loc[0],
          p.loc[1],
          cerPalette["Cool Grey"], //border
          cerPalette["hcRed"], //fill
          1,
          1000,
          p.incidentId
        );
      });
      L.featureGroup(points).addTo(map);
    }
    return proximityCount;
  }

  const formatCommaList = (text) => {
    if (text.includes("/")) {
      let itemList = text.split("/");
      let brokenText = `<ul style="margin-bottom: 0px">`;
      itemList.map((i) => {
        brokenText += `<li>${i.split("-")[0].trim()}</li>`;
      });
      brokenText += `</ul>`;
      return brokenText;
    } else {
      return `${text}`;
    }
  };

  function onEachFeature(feature, layer) {
    const alertClass = (val, type) => {
      if (type == "on" && val > 0) {
        return "alert alert-danger";
      } else if (type == "close" && val > 0) {
        return "alert alert-warning";
      } else {
        return "alert alert-success";
      }
    };

    layer.on({
      click: function (e) {
        this._map.fitBounds(e.target.getBounds(), {
          padding: [200, 200],
        });

        // console.log(feature.properties);
        var proximityCount = addIncidents(this._map, feature.properties.NAME1);
        var length = lengthUnits(feature.properties.length_gpd);
        var popHtml =
          '<div class="col-md-12"> <table class="table" style="margin-bottom:0px">';
        popHtml += `<caption>${feature.properties.NAME1}</caption>`;
        popHtml += `<tbody>`;
        popHtml += `<tr><td>Land Type:</td><td><b>${feature.properties.ALTYPE}<b></td></tr>`;
        popHtml += `<tr><td>Pipeline Length:</td><td><b>${length[0]} ${length[1]}<b></td></tr>`;
        popHtml += `<tr><td>Pipeline Status:</td><td><b>${formatCommaList(
          feature.properties.STATUS
        )}</b></td></tr>`;
        popHtml += `<tr><td>Pipeline Sections:</td><td><b>${formatCommaList(
          feature.properties.PLNAME
        )}</b></td></tr>`;
        popHtml += `</tbody>`;
        popHtml += "</table></div>";
        popHtml += `<div style="margin-bottom: 15px" class="${alertClass(
          proximityCount.on,
          "on"
        )} col-md-12"><p>${proximityCount.on} incidents within ${
          feature.properties.NAME1
        }</p></div>`;
        popHtml += `<div class="${alertClass(
          proximityCount.close,
          "close"
        )} col-md-12"><p>${proximityCount.close} incidents within 15km of ${
          feature.properties.NAME1
        }</p></div>`;
        document.getElementById("intersection-details").innerHTML = popHtml;
      },
    });
  }

  function toolText(layer) {
    var length = lengthUnits(layer.length_gpd);
    var table = `<table id="fn-tooltip">`;
    table += `<caption><b>${layer.NAME1}</b></caption>`;
    table += `<tr><td>Pipeline Name: </td> <td><b>${layer.OPERATOR}</td></tr>`;
    table += `<tr><td>Land Type: </td> <td><b>${layer.ALTYPE}</td></tr>`;
    table += `<tr><td>Pipeline length: </td> <td><b>${length[0]} ${length[1]}</td></tr>`;
    table += "</table>";
    return table;
  }

  function resetZoom(map, geoLayer, fly = false) {
    let padd = [25, 25];
    if (Object.keys(geoLayer._layers).length === 1) {
      padd = [270, 270];
    }
    if (fly) {
      map.flyToBounds(geoLayer.getBounds(), {
        duration: 0.25,
        easeLinearity: 1,
        padding: padd,
      });
    } else {
      map.fitBounds(geoLayer.getBounds(), { padding: padd });
    }
  }

  function buildDashboard() {
    addpoly2Length(poly2Length);
    setupHeight();

    var map = leafletBaseMap({
      div: "map",
      zoomDelta: 0.25,
      initZoomLevel: 4,
      initZoomTo: [55, -119],
    });

    var reserveStyle = {
      fillColor: cerPalette["Night Sky"],
      color: cerPalette["Sun"],
      weight: 20,
      opacity: 0.5,
      fillOpacity: 1,
    };

    var geoLayer = L.geoJSON(landFeature, {
      style: reserveStyle,
      onEachFeature: onEachFeature,
    })
      .bindTooltip(function (layer) {
        return toolText(layer.feature.properties);
      })
      .addTo(map);

    resetZoom(map, geoLayer);

    document.getElementById("reset-map").addEventListener("click", (event) => {
      resetZoom(map, geoLayer, true);
      removeIncidents(map);
      document.getElementById("intersection-details").innerHTML =
        '<div class="alert alert-info"><p>Click on a region to view extra info</p></div>';
    });
  }

  buildDashboard();
}
