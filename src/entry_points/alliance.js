import landFeature from "../company_data_min/AlliancePipelineLtd.json";
import landInfo from "../company_data/AlliancePipelineLtd/landInfo.json";
import poly2Length from "../company_data/AlliancePipelineLtd/poly2.json";
import incidentFeature from "../company_data/AlliancePipelineLtd/events.json";
import meta from "../company_data/AlliancePipelineLtd/meta.json";
import { landDashboard } from "../index";

landDashboard(landFeature, landInfo, poly2Length, incidentFeature, meta);
