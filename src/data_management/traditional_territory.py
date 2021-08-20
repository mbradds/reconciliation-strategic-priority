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
    df["Community Website"] = df["Community Website"].fillna("")
    for col in df:
        if "Unnamed" in col:
            del df[col]
    df = df.to_dict(orient="records")
    with open('../traditional_territory/centrality.json', 'w') as fp:
        json.dump(df, fp)
    return df


if __name__ == "__main__":
    df = processTerritoryInfo()
