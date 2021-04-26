#!/bin/bash
simplify_base_pct=20
simplify_prs=0.2

#ngtl
mapshaper -i src/company_data/NOVAGasTransmissionLtd/reserve.json -proj EPSG:4269 -simplify $simplify_base_pct% keep-shapes -o src/company_data_min/NOVAGasTransmissionLtd.json