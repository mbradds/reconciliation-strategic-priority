import landFeature from "../company_data_min/EnbridgePipelinesInc.json";
import poly2Length from "../company_data/EnbridgePipelinesInc/poly2.json";
import incidentFeature from "../company_data/EnbridgePipelinesInc/events.json";
import { landDashboard } from "../index.js";
landDashboard(landFeature, poly2Length, incidentFeature);
