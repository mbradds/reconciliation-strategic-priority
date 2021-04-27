import landFeature from "../company_data_min/WestcoastEnergyInc.json";
import poly2Length from "../company_data/WestcoastEnergyInc/poly2.json";
import incidentFeature from "../company_data/WestcoastEnergyInc/events.json";
import { landDashboard } from "../index.js";
landDashboard(landFeature, poly2Length, incidentFeature);
