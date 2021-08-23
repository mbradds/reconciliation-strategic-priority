import landFeature from "../company_data_min/Trans-NorthernPipelinesInc.json";
import landInfo from "../company_data/Trans-NorthernPipelinesInc/landInfo.json";
import poly2Length from "../company_data/Trans-NorthernPipelinesInc/poly2.json";
import incidentFeature from "../company_data/Trans-NorthernPipelinesInc/events.json";
import meta from "../company_data/Trans-NorthernPipelinesInc/meta.json";
import { landDashboard } from "../index.js";

landDashboard(landFeature, landInfo, poly2Length, incidentFeature, meta);
