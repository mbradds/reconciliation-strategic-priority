import landFeature from "../company_data/TransCanadaPipeLinesLimited/poly1.json";
import poly2Length from "../company_data/TransCanadaPipeLinesLimited/poly2.json";
import incidentFeature from "../company_data/TransCanadaPipeLinesLimited/events.json";
import { landDashboard } from "../index.js";
landDashboard(landFeature, poly2Length, incidentFeature);
