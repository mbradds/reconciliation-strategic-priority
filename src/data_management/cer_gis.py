import geopandas as gpd
from geopandas.tools import sjoin
import os
import pandas as pd
import json
import time
import multiprocessing as mp
script_dir = os.path.dirname(__file__)
# crs_proj = 'EPSG:3857'
# crs_geo = 'EPSG:3857'
crs_proj = 'EPSG:2960'
crs_geo = 'EPSG:4269'


companies = {"ALLIANCE PIPELINE LTD. (A159)": "Alliance Pipeline Ltd.",
             "ENBRIDGE PIPELINES (NW) INC. (E102)": "Enbridge Norman Wells",
             "ENBRIDGE PIPELINES INC. (E101)": "Enbridge Pipelines Inc.",
             "FOOTHILLS PIPE LINES LTD. (F115)": "Foothills Pipe Lines Ltd.",
             "KINDER MORGAN COCHIN ULC (K077)": "PKM Cochin ULC",
             "MARITIMES & NORTHEAST PIPELINE MANAGEMENT LTD. (M124)": "Maritimes & Northeast Pipeline Management Ltd.",
             "NOVA GAS TRANSMISSION LTD. (N081)": "NOVA Gas Transmission Ltd.",
             "TRANS MOUNTAIN PIPELINE ULC (T260)": "Trans Mountain Pipeline ULC",
             "TRANS QUÉBEC AND MARITIMES PIPELINE INC. (T201)": "Trans Quebec and Maritimes Pipeline Inc.",
             "TRANS-NORTHERN PIPELINES INC. (T217)": "Trans-Northern Pipelines Inc.",
             "TRANSCANADA KEYSTONE PIPELINE GP LTD. (T241)": "TransCanada Keystone Pipeline GP Ltd.",
             "TRANSCANADA PIPELINES LIMITED (T211)": "TransCanada PipeLines Limited",
             "WESTCOAST ENERGY INC., CARRYING ON BUSINESS AS SPECTRA ENERGY TRANSMISSION (W102)": "Westcoast Energy Inc."}


def import_geodata(path, d_type, crs_target):

    if d_type != "incidents":
        data = gpd.read_file(path)
        data = data.set_geometry('geometry')
        data = data.to_crs(crs_target)
        data.crs = crs_target
    else:
        data = pd.read_csv(path, encoding="UTF-16", skiprows=(1))

    if d_type == 'poly1':
        data = data.dissolve(by="NAME1").reset_index()
        poly1_remove = ['ACQTECH',
                        'METACOVER',
                        'PROVIDER',
                        'DATASETNAM',
                        'SPECVERS',
                        'LANGUAGE1',
                        'LANGUAGE2',
                        'LANGUAGE4',
                        'NAME4',
                        'NAME3',
                        'LANGUAGE3',
                        'LANGUAGE5',
                        'NAME5',
                        'CREDATE',
                        'REVDATE',
                        'NID',
                        'ALCODE',
                        'JUR1',
                        'JUR2',
                        'JUR3',
                        'JUR4',
                        'WEBREF',
                        'ACCURACY']

        for remove in poly1_remove:
            del data[remove]

    elif d_type == 'pipe':
        pipe_remove = ['MAT_TYPE',
                       'MAT_GRADE',
                       'STRESS',
                       'LABEL',
                       'H2S',
                       'FROM_SVY',
                       'TO_SVY',
                       'RBLC_TYPE',
                       'LIC',
                       'LINE',
                       'SEGMENT',
                       'SUBB',
                       'SUBA',
                       'TYPE',
                       'SUBC',
                       'OD',
                       'PROVINCE',
                       'WT',
                       'MATERIAL',
                       'JOINT',
                       'PROTECT',
                       'EXCOAT',
                       'ORDER_NO',
                       'FROM_FACIL',
                       'TO_FACIL',
                       'NEBGROUP',
                       'PROV',
                       'SOURCE',
                       'COMMENT',
                       'LENGTH',
                       'LTO_YEAR',
                       'MOP',
                       'UPDATED',
                       'UPI',
                       'LENGTH_CAL']
        data = data[data['NEBGROUP'] == "Group 1"].copy().reset_index(drop=True)
        # company_names = sorted(list(set(data['OPERATOR'])))
        # print(company_names)
        # TOOD: add a method that looks at all company names and flags a warning if a company name isnt in "replace" keys
        # TODO: add a method that looks at "replace" keys and flags a warning if one isnt in the dataset
        for remove in pipe_remove:
            del data[remove]
        data['OPERATOR'] = [x.strip() for x in data['OPERATOR']]
        data['OPERATOR'] = data['OPERATOR'].replace(companies)

    elif d_type == "incidents":
        remove = ['Reported Date',
                  'Nearest Populated Centre',
                  'Province',
                  'Release Type',
                  'Significant']

        for r in remove:
            del data[r]
        data['Company'] = data['Company'].replace({"Westcoast Energy Inc., carrying on business as Spectra Energy Transmission": "Westcoast Energy Inc."})
        data = gpd.GeoDataFrame(data, geometry=gpd.points_from_xy(data.Longitude,
                                                                  data.Latitude))
        data = data.rename(columns={'Approximate Volume Released (m³)': 'Approximate Volume Released'})
        data.crs = crs_geo
        data.to_file("./incidents_geo/incidents.shp")
        data = data.to_crs(crs_proj)
        data.crs = crs_proj

    print('Imported '+d_type+' file with CRS: '+str(data.crs))
    return data


def import_files(crs_target):
    data_paths = {'poly1': './AL_TA_CA_SHP_eng/AL_TA_CA_2_129_eng.shp',
                  'pipe': './pipeline/pipeline.shp',
                  'poly2': './Traite_Pre_1975_Treaty_SHP/Traite_Pre_1975_Treaty_SHP.shp',
                  'incidents': './incident-data.csv'}
    # pool = mp.Pool(processes=len(data_paths))
    # results = [pool.apply_async(import_geodata, args=(path, d_type, crs_target, )) for d_type, path in data_paths.items()]
    # out = [p.get() for p in results]
    # return out[0], out[1], out[2], out[3]
    out = {}
    for d_type, path in data_paths.items():
        out[d_type] = import_geodata(path, d_type, crs_target)
    return out['poly1'], out['pipe'], out['poly2'], out['incidents']


def line_clip(pipe,
              land,
              crs_proj,
              crs_geo,
              polygon_id,
              forceclip=True,
              clip_location='',
              poly1_on_pipe_location='',
              save=False):

    if save:
        for savePath in [clip_location, poly1_on_pipe_location]:
            folder = savePath.split("/")[1:-1][0]
            if not os.path.isdir(os.path.join(script_dir, folder)):
                os.mkdir(os.path.join(script_dir, folder))

    if pipe.crs != land.crs:
        print('Warning: Different CRS: '+str(pipe.crs)+' '+str(land.crs))

    pipe_on_land = sjoin(pipe, land, how='inner', op='intersects').reset_index(drop=True)
    land_on_pipe = sjoin(land, pipe, how='inner', op='intersects').reset_index(drop=True)
    land_on_pipe = land_on_pipe.drop_duplicates(subset=polygon_id)
    # check for invalid polygons
    # https://stackoverflow.com/questions/13062334/polygon-intersection-error-in-shapely-shapely-geos-topologicalerror-the-opera

    for shp in [pipe_on_land, land_on_pipe]:
        shp['valid'] = [x.is_valid for x in shp['geometry']]
        del shp['index_right']
        # shp['geometry'] = [shape.buffer(0) if valid == False else shape for shape, valid in zip(shp['geometry'], shp['valid'])]

    # print('completed spatial join')

    if os.path.isfile(script_dir+'/'+clip_location) and not forceclip:
        pipe_on_land = gpd.read_file(script_dir+'/'+clip_location)
        print('clip already complete with crs: '+str(pipe_on_land.crs))

    else:
        # print('starting clip')
        pipe_on_land = gpd.clip(pipe_on_land, land_on_pipe)
        pipe_on_land = to_metres(pipe_on_land, crs_target=crs_proj)
        # print('finished clip with CRS: '+str(pipe_on_land.crs))
        pipe_on_land = pipe_on_land.to_crs(crs_geo)
        pipe_on_land.crs = crs_geo
        if save:
            pipe_on_land.to_file(os.getcwd()+'/'+clip_location)
            print('saved pipe_on_land (clip) with crs: '+str(pipe_on_land.crs))

    # convert back to geographic CRS after length/distance measures are calculated.
    land_on_pipe = land_on_pipe.to_crs(crs_geo)
    land_on_pipe.crs = crs_geo

    if save:
        land_on_pipe.to_file(os.getcwd()+'/'+poly1_on_pipe_location)
        print('saved land_on_pipe with crs: '+str(land_on_pipe.crs))

    return pipe_on_land, land_on_pipe


def to_metres(gdf, crs_target, length=True):

    gdf = gdf.set_geometry('geometry')
    if gdf.crs != crs_target:
        gdf['geometry'] = gdf['geometry'].to_crs(crs_target)
    if length:
        gdf['length_gpd'] = gdf['geometry'].length
    return gdf


def output_poly1(pipe, overlap, company):
    folder_name = company.replace(' ', '').replace('.', '')
    if not os.path.exists("../company_data/"+folder_name):
        os.mkdir("../company_data/"+folder_name)

    del pipe['geometry']
    del pipe['valid']
    overlap = overlap[['NAME1', 'geometry']].copy()
    overlap = overlap.drop_duplicates(subset='NAME1')

    # This breaks out all the status's
    # pipe = pipeGroup.groupby(['NAME1', 'NAME2', 'OPERATOR', 'STATUS', 'ALTYPE']).agg({'PLNAME': ' - '.join,
    #                                                                                   'length_gpd': sum}).reset_index()
    # pipe = pd.pivot_table(pipe, values=['length_gpd'], index=['NAME1', 'NAME2', 'OPERATOR', 'ALTYPE', 'PLNAME'], columns=['STATUS'])
    # pipe = pipe.reset_index()
    pipe = pipe.groupby(['NAME1',
                         'NAME2',
                         'OPERATOR',
                         'ALTYPE']).agg({'PLNAME': list,
                                         'STATUS': list,
                                         'length_gpd': sum})

    # TODO: add STATUS to groupby and split output into geojson and json metadata
    pipe = pipe.reset_index()
    for listCol in ['PLNAME', 'STATUS']:
        pipe[listCol] = ['/'.join(list(set(x))) for x in pipe[listCol]]
    pipe['length_gpd'] = pipe['length_gpd'].round(1)

    if not overlap.empty:
        overlap = overlap.merge(pipe, how='inner', on='NAME1')
        overlap = overlap.to_crs(crs_geo)
        overlap.crs = crs_geo
        overlap.to_file("../company_data/"+folder_name+"/poly1.json", driver='GeoJSON')

    else:
        overlap = {'company': company, "overlaps": 0}
        with open('../company_data/'+folder_name+'/poly1.json', 'w') as f:
            json.dump(overlap, f)

    return overlap


def output_poly2(pipe, company):
    folder_name = company.replace(' ', '').replace('.', '')
    if not pipe.empty:
        for delete in ['PLNAME', 'geometry', 'TAG_ID', 'valid', 'FNAME', 'SBTP_ENAME', 'SBTP_FNAME']:
            del pipe[delete]
        pipe = pipe.groupby(['OPERATOR', 'ENAME', 'STATUS']).sum().reset_index()
        pipe = pipe[pipe['STATUS'] == "Operating"]
        pipe['ENAME'] = [x.split("(")[0].strip() for x in pipe['ENAME']]
        df_c = pipe[pipe['OPERATOR'] == company].copy()
        del df_c['OPERATOR']
        df_c = df_c.sort_values(by='length_gpd', ascending=False)
        df_c['length_gpd'] = [int(x) for x in df_c['length_gpd']]
        df_c.to_json("../company_data/"+folder_name+"/poly2.json", orient='records')
    else:
        df_c = {"company": company}
        with open("../company_data/"+folder_name+"/poly2.json", 'w') as f:
            json.dump(df_c, f)
    return pipe


def eventProximity(gdf, poly1, company):
    poly1 = poly1[['NAME1', 'geometry', 'OPERATOR']].copy()
    poly1 = poly1.drop_duplicates(subset=['NAME1', 'OPERATOR'])
    poly1 = poly1.to_crs(crs_proj)
    poly1.crs = crs_proj

    # for company in companies.values():
    folder_name = company.replace(' ', '').replace('.', '')
    pnt = gdf[gdf['Company'] == company].copy().reset_index(drop=True)
    poly_company = poly1[poly1['OPERATOR'] == company].copy().reset_index(drop=True)
    if not pnt.empty:
        close = {}
        total = {"on": 0, "15km": 0}
        for p, incident_id, iType, iStatus, iVol, iSub, lat, long in zip(pnt.geometry,
                                                                         pnt['Incident Number'],
                                                                         pnt['Incident Types'],
                                                                         pnt['Status'],
                                                                         pnt['Approximate Volume Released'],
                                                                         pnt['Substance'],
                                                                         pnt['Latitude'],
                                                                         pnt['Longitude']):

            for land, land_id in zip(poly_company.geometry,
                                     poly_company['NAME1']):
                proximity = land.distance(p)
                if proximity <= 15000:
                    if proximity == 0:
                        total["on"] = total["on"]+1
                    else:
                        total["15km"] = total["15km"]+1

                    row = {"distance": int(round(proximity, 0)),
                           "incidentId": incident_id,
                           "landId": land_id,
                           "type": iType,
                           "status": iStatus,
                           "vol": iVol,
                           "sub": iSub,
                           "loc": [lat, long]}
                    if land_id in close:
                        close[land_id].append(row)
                    else:
                        close[land_id] = [row]

        close['meta'] = total
        with open('../company_data/'+folder_name+'/events.json', 'w') as f:
            json.dump(close, f)
    else:
        close = {"meta": {"on": 0, "15km": 0}}
        with open('../company_data/'+folder_name+'/events.json', 'w') as f:
            json.dump(close, f)

    return close


def worker(company, pipe, poly1, poly2, incidents):
    pipec = pipe[pipe["OPERATOR"] == company].copy().reset_index(drop=True)
    pipec2 = pipec.copy()
    poly1c = poly1.copy()
    poly2c = poly2.copy()
    pipe_on_poly1, poly1_on_pipe = line_clip(pipec,
                                             poly1c,
                                             crs_proj=crs_proj,
                                             crs_geo=crs_geo,
                                             polygon_id="NAME1",
                                             forceclip=True)

    pipe_on_poly2, poly2_on_pipe = line_clip(pipec2,
                                             poly2c,
                                             crs_proj=crs_proj,
                                             crs_geo=crs_geo,
                                             polygon_id="TAG_ID",
                                             forceclip=True)

    output_poly1(pipe_on_poly1, poly1_on_pipe, company)
    eventProximity(incidents, poly1_on_pipe, company)
    output_poly2(pipe_on_poly2, company)
    print('Done:' + company)
    return


if __name__ == "__main__":
    start = time.time()
    jobs = []
    poly1, pipe, poly2, incidents = import_files(crs_target=crs_proj)
    for company in companies.values():
        # worker(company, pipe, poly1, poly2, incidents) # single thread
        p = mp.Process(target=worker, args=(company, pipe, poly1, poly2, incidents, ))
        jobs.append(p)
        p.start()

    for proc in jobs:
        proc.join()

    elapsed = (time.time() - start)
    print("GIS process time:", round(elapsed, 0), ' seconds')
