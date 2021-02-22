import base64
import gzip
import json
import re
import zipfile
from os import listdir
from os.path import isfile, join
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import requests
import so_textprocessing as stp
from tqdm import tqdm

tqdm.pandas()

# Load models for CVSS prediction
vectorizer = joblib.load("cvss_pred/tfidf.joblib")
lda = joblib.load("cvss_pred/lda.joblib")
clf = joblib.load("cvss_pred/lrclf.joblib")
tp = stp.TextPreprocess()


def pred_cvss_from_str(input_str):
    """Get cvss score from string."""
    input_tfidf = vectorizer.transform([input_str])
    input_lda = lda.transform(input_tfidf.toarray())
    return clf.predict(input_lda)[0]


def pred_cvss(cvedf):
    """Get predicted CVSS score given cve dataframe.

    Args:
        cvedf ([pandas df]): CVEDF needs a minimum of a "description column.

    Returns:
        [pandas df]: Dataframe with new predictedScore column
    """
    cvedf["description_2"] = cvedf["description"]
    tp.transform_df(cvedf, reformat="stopstemprocessonly", columns=["description_2"])
    cvedf["predictedScore"] = cvedf["description_2"].progress_apply(pred_cvss_from_str)
    return cvedf


def nvdFeed(fileDirectory):
    """Download all NVD data excluding modified and recent.

    Used for initiliasing database from scratch.

    Args:
        fileDirectory (str): directory to save data
    """
    Path(fileDirectory).mkdir(parents=True, exist_ok=True)
    r = requests.get("https://nvd.nist.gov/vuln/data-feeds#JSON_FEED")
    filenames = []
    for filename in re.findall("nvdcve-1.1-[0-9]*\\.json\\.zip", r.text):
        filenames.append(fileDirectory + filename)
        myfile = requests.get(
            "https://nvd.nist.gov/feeds/json/cve/1.1/" + filename, stream=True
        )
        open(fileDirectory + filename, "wb").write(myfile.content)
    return filenames


def nvdRefresh(fileDirectory):
    """Download modified and recent NVD data only.

    Args:
        fileDirectory (str): directory to save data
    """
    Path(fileDirectory).mkdir(parents=True, exist_ok=True)
    filenames = []
    for r in ["modified"]:
        filenames.append(fileDirectory + r)
        myfile = requests.get(
            "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-{}.json.zip".format(r),
            stream=True,
        )
        open(fileDirectory + r, "wb").write(myfile.content)
    return filenames


def createCPEEntry():
    """Create empty CPE entry for easy initialisation."""
    return {
        "part": "",
        "vendor": "",
        "product": "",
        "version": "",
        "update": "",
        "edition": "",
        "language": "",
        "softwareEdition": "",
        "targetSoftware": "",
        "targetHardware": "",
        "other": "",
        "cpe": "",
    }


def createCVEEntry():
    """Create empty CVE entry for easy initialisation."""
    return {
        "cve_id": "",
        "description": "",
        "references": "",
        "created": "NA",
        "modified": "NA",
        "vector": "",
        "attackVector": "",
        "attackComplexity": "",
        "privilegeRequired": "",
        "userInteraction": "",
        "scope": "",
        "confidentialityImpact": "",
        "integrityImpact": "",
        "availabilityImpact": "",
        "baseScore": -1,
        "predictedScore": -1,
        "severity": "",
        "exploitabilityScore": -1,
        "impactScore": -1,
    }


def json_to_comp_str(jsonobj):
    """Take a json object and returns compressed form as string."""
    return base64.b64encode(gzip.compress(bytes(json.dumps(jsonobj), "utf-8"))).decode()


def cveInfo(data, cve):
    """Extract relevant information from CVE.

    Args:
        data (dict): Empty CVE entry object created using createCVEEntry
        cve (dict): CVE Object parsed from NVD JSON

    Returns:
        dict: Data object with fields filled in using CVE Object
    """
    data["cve_id"] = cve["CVE_data_meta"]["ID"]
    data["description"] = cve["description"]["description_data"]
    data["description"] = "\n".join([d["value"] for d in data["description"]])
    data["references"] = json_to_comp_str(cve["references"]["reference_data"])
    data["problemType"] = cve["problemtype"]["problemtype_data"]
    data["problemType"] = ",".join(
        [d["value"] for d in data["problemType"][0]["description"]]
    )
    return data


def impact(data, impact):
    """Obtain impact metrics, prioritising CVSS3 if available.

    Args:
        data (dict): Empty CVE entry object created using createCVEEntry
        impact (dict): Impact Object parsed from NVD JSON

    Returns:
        dict: Data object with fields filled in using CVE Object
    """
    if "baseMetricV2" in impact and "baseMetricV3" not in impact:
        data["vector"] = impact["baseMetricV2"]["cvssV2"]["vectorString"]
        data["attackVector"] = impact["baseMetricV2"]["cvssV2"]["accessVector"]
        data["attackComplexity"] = impact["baseMetricV2"]["cvssV2"]["accessComplexity"]
        if "userInteractionRequired" in impact["baseMetricV2"]:
            data["userInteraction"] = impact["baseMetricV2"]["userInteractionRequired"]
        data["confidentialityImpact"] = impact["baseMetricV2"]["cvssV2"][
            "confidentialityImpact"
        ]
        data["integrityImpact"] = impact["baseMetricV2"]["cvssV2"]["integrityImpact"]
        data["availabilityImpact"] = impact["baseMetricV2"]["cvssV2"][
            "availabilityImpact"
        ]
        data["baseScore"] = impact["baseMetricV2"]["cvssV2"]["baseScore"]
        data["severity"] = impact["baseMetricV2"]["severity"]
        if "exploitabilityScore" in impact["baseMetricV2"]:
            data["exploitabilityScore"] = impact["baseMetricV2"]["exploitabilityScore"]
        if "impactScore" in impact["baseMetricV2"]:
            data["impactScore"] = impact["baseMetricV2"]["impactScore"]

    if "baseMetricV3" in impact:
        data["vector"] = impact["baseMetricV3"]["cvssV3"]["vectorString"]
        data["attackVector"] = impact["baseMetricV3"]["cvssV3"]["attackVector"]
        data["attackComplexity"] = impact["baseMetricV3"]["cvssV3"]["attackComplexity"]
        data["privilegeRequired"] = impact["baseMetricV3"]["cvssV3"][
            "privilegesRequired"
        ]
        data["userInteraction"] = impact["baseMetricV3"]["cvssV3"]["userInteraction"]
        data["scope"] = impact["baseMetricV3"]["cvssV3"]["scope"]
        data["confidentialityImpact"] = impact["baseMetricV3"]["cvssV3"][
            "confidentialityImpact"
        ]
        data["integrityImpact"] = impact["baseMetricV3"]["cvssV3"]["integrityImpact"]
        data["availabilityImpact"] = impact["baseMetricV3"]["cvssV3"][
            "availabilityImpact"
        ]
        data["baseScore"] = impact["baseMetricV3"]["cvssV3"]["baseScore"]
        data["severity"] = impact["baseMetricV3"]["cvssV3"]["baseSeverity"]
        if "exploitabilityScore" in impact["baseMetricV3"]:
            data["exploitabilityScore"] = impact["baseMetricV3"]["exploitabilityScore"]
        if "impactScore" in impact["baseMetricV3"]:
            data["impactScore"] = impact["baseMetricV3"]["impactScore"]
    return data


def ver(data, configurations):
    """Get affected CPEs given CVE Object.

    Args:
        data (dict): CVE entry object created using createCVEEntry
        configurations (dict): Configurations Object parsed from NVD JSON

    Returns:
        list: List of CPEs relating to the CVE in data
    """
    # Affected versions
    cpes = []
    for nodes in configurations["nodes"]:
        if "children" in nodes:
            for child in nodes["children"]:
                if "cpe_match" in child:
                    for cpe in child["cpe_match"]:
                        cpes.append(cpeParse(cpe["cpe23Uri"]))
        else:
            if "cpe_match" in nodes:
                for cpe in nodes["cpe_match"]:
                    cpes.append(cpeParse(cpe["cpe23Uri"]))
    return cpes


# CPE parse
def cpeParse(cpe):
    """Obtain relevant parts of CPE if CPE version 2.3."""
    if cpe.startswith("cpe:2.3"):
        components = cpe.split(":")
        return {"id": components[5], "vendor": components[3], "product": components[4]}
    else:
        print("Not CPE2.3")
        return None


def cveDictParse(cve_dict):
    """Extract CVEs to be imported into mongodb."""
    cve_list = []
    for cve in tqdm(cve_dict):
        data = createCVEEntry()

        # Extract info
        data = cveInfo(data, cve["cve"])
        data = impact(data, cve["impact"])
        cpe = ver(data, cve["configurations"])

        # Dates
        data["created"] = cve["publishedDate"]
        data["modified"] = cve["lastModifiedDate"]
        cve_list.append(data)
        data["cpes"] = [
            "{}|{}|{}".format(c["vendor"], c["product"], c["id"]) for c in cpe
        ]
        data["cpes"] = list(set(data["cpes"]))

    return np.array(cve_list)


def parseJSON(fileDirectory):
    """Parse JSON files."""
    files = [f for f in listdir(fileDirectory) if isfile(join(fileDirectory, f))]
    files.sort()
    all_cve_items = []
    for file in tqdm(files):
        archive = zipfile.ZipFile(join(fileDirectory, file), "r")
        jsonfile = archive.open(archive.namelist()[0])
        cve_dict = json.loads(jsonfile.read())
        jsonfile.close()
        all_cve_items += cve_dict["CVE_Items"]
    cvedict = cveDictParse(all_cve_items)
    cvedf = pd.DataFrame.from_records(cvedict)
    cvedf = pred_cvss(cvedf)
    return cvedf.to_dict("records")


def get_cves_mongodb(cves, client):
    """Connect to MongoDB and obtain cves from list of ids.

    Args:
        cves ([array<str>]): list of cve ids
        client ([mongodbclient]): mongodb client

    Returns:
        [array]: CVEs from database
    """
    db = client.main.cve
    return db.find(
        {"cve_id": {"$in": cves}},
        {"cve_id": 1, "created": 1, "modified": 1, "cpes": 1, "_id": 0},
    )
