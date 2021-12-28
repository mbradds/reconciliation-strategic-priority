<h1 align="center">Reconciliation Strategic Priority</h1>

<div align="center">
  <!-- contributors welcome -->
  <a>
    <img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat" alt="Contributors" />
  </a>
  <!-- Heroku -->
  <a>
    <img src="https://img.shields.io/website?down_color=red&down_message=down&up_color=green&up_message=up&url=https://reconciliation-priority.herokuapp.com/" alt="heroku" />
  </a>
  <!-- Style -->
  <a>
    <img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square">
  </a>
  <!-- License -->
  <a>
    <img alt="license" src="https://img.shields.io/github/license/mbradds/me.dev">
  </a>
</div>

<div align="center">
  <h3>
    <a href="https://reconciliation-priority.herokuapp.com/">
      Landing Page
    </a>
    <span> | </span>
    <a href="https://reconciliation-priority.herokuapp.com/html/trans_mountain.html">
      TransMountain Community Profiles
    </a>
  </h3>
</div>

<div align="center">
  <sub>Designed, developed, and maintained by Grant Moss
</div>

## Introduction

This project consists of two parts. The TransMountain Community Profiles Prototype, and the Pipeline Profiles Prototype.

### TransMountain Community Profiles Prototype

A joint development effort between the CER and the TMX-IAMC. An interactive web app designed to be used by Indigenous and Non-Indigenous monitors and inspectors in the field. Features such as geo-location and map layers containing community information and activities such as incidents can assist with Indigenous consulation and activities related to the development of the TMX expansion project and the existing mainline.

### Pipeline Profiles Prototype

The CER pipeline profiles pages contain information on each major pipeline. Sections include throughput & capacity, facilities, financial information, and recently safety & environment (see pipeline-profiles repo). The pipeline profiles prototype in this repo aims to include a section featuring Indigenous pipeline information. Right now the prototype features a GIS analysis of pipeline and incident overlaps between First Nations Reserves and Indigenous Traditional Territorries. This prototype will serve as a baseline for future collaboration and co-developemnt with Indigenous peoples and organizations.

## Repository structure

```
pipeline_profiles
│   README.md (you are here!)
│   server.js (express js server configuration for heroku)
|   environment.yml (cross platform conda python 3 environment used in ./src/data_management)
│   webpack.common.js (functionality for creating clean ../dist folder)
|   webpack.dev.js (webpack dev server functionality)
|   webpack.prod.js (npm run build for minimized production files)
|   webpack.analyze.js (npm run analyze-build to evaluate bundle size)
|   .babelrc (babel config with corejs 3 polyfills)
|   .vscode/settings.json (please use vscode for this project!)
|   ...
|
└───src
│   │
│   └───data_management
│   |   │   cer_gis.py (contains the core GIS code for analyzing pipeline overlaps)
│   |   │   digital_territory.py (gets the latest data from native-land.ca and isolates Canada territories)
|   |   |   get_cer_files.py (pulls the latest pipeline incident data)
|   |   |   get_map_files.py (pulls the latest canada, first nations reserve, and treaty map files)
|   |   |   process_communities.py (prepares the latest community data for TransMountain)
|   |   |   util.py (shared python code module)
|   |   |   |
|   |   |   └───raw_data
|   |   |           cer_data/(holds the latest pipeline incident data)
|   |   |           tmx/(holds the tmx centerline and spread geojson)
|   |   |           traditional_territory/(holds the latest community information for TransMountain communities)
|   |
|   └───components (html sections for pipeline profiles and community profiles)
|   |
|   └───css (styles for pipeline profiles and community profiles)
|   |
|   └───entry_points (entry points for all profile webpages)
|   |   |   iamc/(main code entry point for community profiles prototypes)
|   |   |   pipeline-profiles/(main code entry point for pipeline profiles prototypes)
|   |
|   └───company_data (output data folders for each pipeline. Contains prepared data ready for prototypes)
|   |
|   └───modules (main JavaScript code files for prototype functionality)
|
│
└───dist
```

## Quick Start

This project/repo will not function properly without adding the following untracked folder: `src/data_management/raw_data/pipeline`. This folder contains the proprietary shapefile for CER regulated pipelines. Please send me an email to get access to this data prior to contributing.
