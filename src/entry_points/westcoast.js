import landFeature from "../company_data_min/WestcoastEnergyInc.json";
import landInfo from "../company_data/WestcoastEnergyInc/landInfo.json";
import poly2Length from "../company_data/WestcoastEnergyInc/poly2.json";
import incidentFeature from "../company_data/WestcoastEnergyInc/events.json";
import meta from "../company_data/WestcoastEnergyInc/meta.json";
import { landDashboard } from "../index";

landDashboard(landFeature, landInfo, poly2Length, incidentFeature, meta);
