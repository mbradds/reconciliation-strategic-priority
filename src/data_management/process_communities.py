import os
import json
import pandas as pd
import numpy as np
import geopandas as gpd
from cer_gis import crs_geo
from util import set_cwd_to_script
set_cwd_to_script()


def processTerritoryInfo():
    df = pd.read_excel(os.path.join(os.getcwd(),
                                    "raw_data",
                                    "traditional_territory",
                                    "TMX_IAMC_Indigenous_Community_Profiles.xlsx"),
                       sheet_name="BC First Nations",
                       skiprows=1,
                       engine="openpyxl")

    sources = pd.read_excel(os.path.join(os.getcwd(),
                                         "raw_data",
                                         "traditional_territory",
                                         "TMX_IAMC_Indigenous_Community_Profiles.xlsx"),
                            sheet_name="image sources",
                            skiprows=0,
                            engine="openpyxl")

    spreads = pd.read_excel(os.path.join(os.getcwd(),
                                         "raw_data",
                                         "traditional_territory",
                                         "TMX_IAMC_Indigenous_Community_Profiles.xlsx"),
                            sheet_name="Spreads",
                            skiprows=0,
                            engine="openpyxl")

    spreads = spreads.where(spreads.notnull(), None)
    with open('../company_data/TransMountainPipelineULC/spreads.json', 'w') as fp:
        json.dump(spreads.to_dict(orient="records"), fp)

    df = df[~df['Lat'].isnull()].reset_index(drop=True)
    df = df[df["Show"] != "No"].reset_index(drop=True)
    for textCol in ["mapFile",
                    "Community",
                    "Leadership",
                    "Contact person",
                    "Address",
                    "Contact Information",
                    "Protocol",
                    "Project Spreads",
                    "History",
                    "Community Website"]:

        newText = []
        for t in df[textCol]:
            if isinstance(t, str):
                newText.append(t.strip())
            else:
                newText.append(t)

        df[textCol] = newText

    df["mapFile"] = df["mapFile"].replace({"nan": None})
    df = pd.merge(df, sources, how="left", left_on="Community", right_on="Community")
    df = df.where(df.notnull(), None)
    # df = df.fillna("")

    for col in df:
        if "Unnamed" in col:
            del df[col]

    # get spread number for each community
    spread_numbers = []
    df["Project Spreads"] = [str(x) for x in df["Project Spreads"]]
    for project_spread in df["Project Spreads"]:
        project_spread = project_spread.lower()
        if "lower mainland" in project_spread:
            lm = True
        else:
            lm = False
        if "thompson okanagan" in project_spread:
            to = True
        else:
            to = False
        if "spread" in project_spread:
            ps = project_spread.split("spread")[-1].strip()[0]
            try:
                spread_numbers.append(int(ps))
            except:
                if ps == "i" and lm:
                    spread_numbers.append(7)
                elif ps == "f" and to:
                    spread_numbers.append(4)
                else:
                    raise
        else:
            spread_numbers.append(None)
    df["spreadNumber"] = spread_numbers
    df = df.where(df.notnull(), None)
    df = df.replace({np.nan: None})
    df["Project Spreads"] = df["Project Spreads"].replace({"None": None})

    land = {}

    def addInfo(row):
        return {"community": row["Community"].strip(),
                "leadership": row["Leadership"],
                "contactPerson": row["Contact person"],
                "address": row["Address"],
                "contactInfo": row["Contact Information"],
                "protocol": row["Protocol"],
                "about": row["History"],
                "spread": row["Project Spreads"],
                "web": row["Community Website"],
                "map": row["mapFile"],
                "srcTxt": row["Source"],
                "srcLnk": row["Link"],
                "pronounce": row["Pronounciation"],
                "spreadNumber": row["spreadNumber"]}

    for i, row in df.iterrows():
        if not row["mapFile"]:
            landKey = row["Community"]
        else:
            landKey = row["mapFile"]

        if landKey in land and land[landKey]["loc"][0] == row["Lat"] and land[landKey]["loc"][1] == row["Long"]:
            land[landKey]["info"].append(addInfo(row))
        else:
            land[landKey] = {"loc": [row["Lat"], row["Long"]],
                             "info": [addInfo(row)]}

    with open('../company_data/community_profiles/community_info.json', 'w') as fp:
        json.dump(land, fp)
    return df


def spreads():
    df = gpd.read_file("./raw_data/tmx/PUBLIC_Kilometer_Posts_1km.geojson")
    df = df.to_crs(crs_geo)
    df.crs = crs_geo
    spread_list = []
    df["Name"] = [x.split(" ")[-1] for x in df["Name"]]
    df["Name"] = [int(float(x)) for x in df["Name"]]

    for name, geo in zip(df["Name"], df["geometry"]):
        spread_list.append({
            "n": name,
            "l": [round(geo.y, 3), round(geo.x, 3)]})
    with open('../company_data/TransMountainPipelineULC/kilometerPosts.json', 'w') as fp:
        json.dump(spread_list, fp)
    return spread_list


if __name__ == "__main__":
    print("updating tranditional territory metadata...")
    df_community = processTerritoryInfo()
    df_spreads = spreads()
    print("done!")
