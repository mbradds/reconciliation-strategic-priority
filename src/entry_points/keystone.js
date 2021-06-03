import landFeature from "../company_data_min/TransCanadaKeystonePipelineGPLtd.json";
import landInfo from "../company_data/TransCanadaKeystonePipelineGPLtd/landInfo.json";
import poly2Length from "../company_data/TransCanadaKeystonePipelineGPLtd/poly2.json";
import incidentFeature from "../company_data/TransCanadaKeystonePipelineGPLtd/events.json";
import meta from "../company_data/TransCanadaKeystonePipelineGPLtd/meta.json";
import { landDashboard } from "../index";

landDashboard(landFeature, landInfo, poly2Length, incidentFeature, meta);
