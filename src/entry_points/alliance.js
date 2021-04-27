import landFeature from "../company_data_min/AlliancePipelineLtd.json";
import poly2Length from "../company_data/AlliancePipelineLtd/poly2.json";
import incidentFeature from "../company_data/AlliancePipelineLtd/events.json";
import { landDashboard } from "../index.js";
landDashboard(landFeature, poly2Length, incidentFeature);
