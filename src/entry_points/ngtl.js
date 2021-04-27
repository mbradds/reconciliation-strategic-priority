import landFeature from "../company_data_min/NOVAGasTransmissionLtd.json";
import poly2Length from "../company_data/NOVAGasTransmissionLtd/poly2.json";
import incidentFeature from "../company_data/NOVAGasTransmissionLtd/events.json";
import { landDashboard } from "../index.js";
landDashboard(landFeature, poly2Length, incidentFeature);
