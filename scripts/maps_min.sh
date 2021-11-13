#!/bin/bash
simplify_base_pct=100
simplify_prs=0.0001

#ngtl example
#mapshaper -i src/company_data/NOVAGasTransmissionLtd/poly1.json -proj EPSG:4269 -simplify $simplify_base_pct% keep-shapes -o src/company_data_min/NOVAGasTransmissionLtd.json

for pipe in "AlliancePipelineLtd" "EnbridgeNormanWells" "EnbridgePipelinesInc" "FoothillsPipeLinesLtd" "NOVAGasTransmissionLtd" "TransCanadaKeystonePipelineGPLtd" "TransCanadaPipeLinesLimited" "TransMountainPipelineULC" "Trans-NorthernPipelinesInc" "WestcoastEnergyInc" "MontrealPipeLineLimited"
do
    echo "starting: $pipe"
    mapshaper -i src/company_data/$pipe/poly1.json -proj EPSG:4269 -simplify $simplify_base_pct% keep-shapes -o src/company_data/$pipe/poly1_min.json precision=$simplify_prs
    echo "completed: $pipe"
done