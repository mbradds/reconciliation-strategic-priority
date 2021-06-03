import landFeature from "../company_data_min/TransCanadaPipeLinesLimited.json";
import landInfo from "../company_data/TransCanadaPipeLinesLimited/landInfo.json";
import poly2Length from "../company_data/TransCanadaPipeLinesLimited/poly2.json";
import incidentFeature from "../company_data/TransCanadaPipeLinesLimited/events.json";
import meta from "../company_data/TransCanadaPipeLinesLimited/meta.json";
import { landDashboard } from "../index";

landDashboard(landFeature, landInfo, poly2Length, incidentFeature, meta);
