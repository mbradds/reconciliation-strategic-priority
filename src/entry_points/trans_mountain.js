import landFeature from "../company_data_min/TransMountainPipelineULC.json";
import poly2Length from "../company_data/TransMountainPipelineULC/poly2.json";
import incidentFeature from "../company_data/TransMountainPipelineULC/events.json";
import { landDashboard } from "../index.js";
landDashboard(landFeature, poly2Length, incidentFeature);
