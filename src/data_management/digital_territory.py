import os
import geopandas as gpd
from cer_gis import crs_geo
script_dir = os.path.dirname(__file__)


def getCanadaTerritories():
    print("importing files...")
    canada = gpd.read_file("./raw_data/lpr_000b16a_e/lpr_000b16a_e.shp")
    canada = canada.to_crs(crs_geo)
    canada.crs = crs_geo

    df = gpd.read_file("./raw_data/traditional_territory/indigenousTerritories.json")
    df = df.to_crs(crs_geo)
    df.crs = crs_geo

    for delete in ["PRNAME", "PRENAME", "PRFNAME", "PREABBR", "PRFABBR"]:
        del canada[delete]

    print("dissolving canada...")
    canada = canada.dissolve(by="PRUID")
    print("calculating intersection...")
    within = gpd.sjoin(df, canada, how="inner", op="intersects")
    within = within.drop_duplicates(subset=["id"])
    for delete in ["id", "FrenchName", "FrenchDescription", "index_right"]:
        del within[delete]
    within = within.reset_index(drop=True)
    print("saving data...")
    matched = ["secwepemc-secwepemcul-ewc",
               "semiahmoo",
               "heiltsuk",
               "ditidaht",
               "pacheedaht",
               "tsawwassen",
               "qayqayt",
               "katzie",
               "kwikwetlem",
               "tsleil-waututh-səl̓ilwətaɂɬ",
               "kwantlen"]
    onMap = within[within["Slug"].isin(matched)].copy().reset_index(drop=True)
    onMap = onMap.drop_duplicates(subset=["Slug"])
    within = within[~within["Slug"].isin(matched)].copy().reset_index(drop=True)
    within.to_file("../traditional_territory/indigenousTerritoriesCa.json", driver="GeoJSON")
    onMap.to_file("../company_data/TransMountainPipelineULC/territory.json", driver="GeoJSON")
    return within


if __name__ == "__main__":
    df = getCanadaTerritories()
