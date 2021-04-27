import landFeature from "../company_data/EnbridgeNormanWells/poly1.json";
import poly2Length from "../company_data/EnbridgeNormanWells/poly2.json";
import incidentFeature from "../company_data/EnbridgeNormanWells/events.json";
import { landDashboard } from "../index.js";
landDashboard(landFeature, poly2Length, incidentFeature);
