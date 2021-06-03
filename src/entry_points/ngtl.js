import landFeature from "../company_data_min/NOVAGasTransmissionLtd.json";
import landInfo from "../company_data/NOVAGasTransmissionLtd/landInfo.json";
import poly2Length from "../company_data/NOVAGasTransmissionLtd/poly2.json";
import incidentFeature from "../company_data/NOVAGasTransmissionLtd/events.json";
import meta from "../company_data/NOVAGasTransmissionLtd/meta.json";
import { landDashboard } from "../index";

landDashboard(landFeature, landInfo, poly2Length, incidentFeature, meta);