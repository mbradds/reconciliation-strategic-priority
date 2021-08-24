import pandas as pd
import os
import json
script_dir = os.path.dirname(__file__)


def processTerritoryInfo():
    df = pd.read_excel(os.path.join(script_dir,
                                    "raw_data",
                                    "traditional_territory",
                                    "TMX_IAMC_Indigenous_Community_Profiles.xlsx"),
                       sheet_name="BC First Nations",
                       skiprows=1,
                       engine="openpyxl")

    df = df[~df['Lat'].isnull()].reset_index(drop=True)
    df["mapFile"] = [x.strip() for x in df["mapFile"]]
    df = df.fillna("")
    for col in df:
        if "Unnamed" in col:
            del df[col]

    land = {}

    def addInfo(row):
        return {"community": row["Community"],
                "leadership": row["Leadership"],
                "contactPerson": row["Contact person"],
                "contactInfo": row["Contact Information"],
                "protocol": row["Protocol"],
                "about": row["About Us"],
                "spread": row["Project Spreads"],
                "web": row["Community Website"]}

    for i, row in df.iterrows():
        if row["mapFile"] in land:
            land[row["mapFile"]]["info"].append(addInfo(row))
        else:
            land[row["mapFile"]] = {"loc": [row["Lat"], row["Long"]],
                                    "info": [addInfo(row)]}
    # df = df.to_dict(orient="records")
    with open('../traditional_territory/centrality.json', 'w') as fp:
        json.dump(land, fp)
    return land


if __name__ == "__main__":
    print("updating tranditional territory metadata...")
    df = processTerritoryInfo()
    print("done!")
