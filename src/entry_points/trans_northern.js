import landFeature from "../company_data/Trans-NorthernPipelinesInc/poly1.json";
import poly2Length from "../company_data/Trans-NorthernPipelinesInc/poly2.json";
import incidentFeature from "../company_data/Trans-NorthernPipelinesInc/events.json";
import { landDashboard } from "../index.js";
landDashboard(landFeature, poly2Length, incidentFeature);
