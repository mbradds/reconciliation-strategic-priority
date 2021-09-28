import os
import json
import pandas as pd
script_dir = os.path.dirname(__file__)


def processTerritoryInfo():
    df = pd.read_excel(os.path.join(script_dir,
                                    "raw_data",
                                    "traditional_territory",
                                    "TMX_IAMC_Indigenous_Community_Profiles.xlsx"),
                       sheet_name="BC First Nations",
                       skiprows=1,
                       engine="openpyxl")

    sources = pd.read_excel(os.path.join(script_dir,
                                         "raw_data",
                                         "traditional_territory",
                                         "TMX_IAMC_Indigenous_Community_Profiles.xlsx"),
                            sheet_name="image sources",
                            skiprows=0,
                            engine="openpyxl")

    df = df[~df['Lat'].isnull()].reset_index(drop=True)
    df = df[df["Show"] != "No"].reset_index(drop=True)
    df["mapFile"] = [str(x).strip() for x in df["mapFile"]]
    df = pd.merge(df, sources, how="left", left_on="Community", right_on="Community")
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
                "about": row["History"],
                "spread": row["Project Spreads"],
                "web": row["Community Website"],
                "map": row["mapFile"],
                "srcTxt": row["Source"],
                "srcLnk": row["Link"],
                "pronounce": row["Pronounciation"],
                "dId": row["Digital id"]}

    for i, row in df.iterrows():
        if row["mapFile"] in land:
            land[row["mapFile"]]["info"].append(addInfo(row))
        else:
            land[row["mapFile"]] = {"loc": [row["Lat"], row["Long"]],
                                    "info": [addInfo(row)]}

    with open('../traditional_territory/centrality.json', 'w') as fp:
        json.dump(land, fp)
    return df


if __name__ == "__main__":
    print("updating tranditional territory metadata...")
    df = processTerritoryInfo()
    print("done!")
