import landFeature from "../company_data_min/EnbridgePipelinesInc.json";
import landInfo from "../company_data/EnbridgePipelinesInc/landInfo.json";
import poly2Length from "../company_data/EnbridgePipelinesInc/poly2.json";
import incidentFeature from "../company_data/EnbridgePipelinesInc/events.json";
import meta from "../company_data/EnbridgePipelinesInc/meta.json";
import { landDashboard } from "../index";

landDashboard(landFeature, landInfo, poly2Length, incidentFeature, meta);
