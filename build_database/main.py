import base64
import datetime
import gzip
import json
import re
import zipfile
from collections import defaultdict
from os import listdir
from os.path import isfile, join
from pathlib import Path

import numpy as np
import requests
from tqdm import tqdm

# Directory where NVD JSON files will be downloaded to and parsed. Create a
# folder called "nvd" in the same directory as this file for ease of use.
fileDirectory = "nvd/"
Path("nvd").mkdir(parents=True, exist_ok=True)


def nvdFeed():
    # https: // avleonov.com/2017/10/03/downloading-and-analyzing-nvd-cve-feed/
    r = requests.get("https://nvd.nist.gov/vuln/data-feeds#JSON_FEED")
    for filename in re.findall("nvdcve-1.1-[0-9]*\.json\.zip", r.text):
        print(filename)
        myfile = requests.get(
            "https://nvd.nist.gov/feeds/json/cve/1.1/" + filename, stream=True
        )
        open(fileDirectory + filename, "wb").write(myfile.content)


# Create empty CPE entry for easy initialisation
def createCPEEntry():
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
    # Create empty CVE entry for easy initialisation
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
    """
        Takes a json object and returns compressed form as string
    """
    return base64.b64encode(gzip.compress(bytes(json.dumps(jsonobj), "utf-8"))).decode()


def cveInfo(data, cve):
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
    # Affected versions
    cpes = []
    for nodes in configurations["nodes"]:
        if "children" in nodes:
            for child in nodes["children"]:
                if "cpe_match" in child:
                    for cpe in child["cpe_match"]:
                        cpes.append(cpeParse(data, cpe["cpe23Uri"]))
        else:
            if "cpe_match" in nodes:
                for cpe in nodes["cpe_match"]:
                    cpes.append(cpeParse(data, cpe["cpe23Uri"]))
    return cpes


# CPE parse
def cpeParse(data, cpe):

    # If CPE version 2.3
    if cpe.startswith("cpe:2.3"):
        components = cpe.split(":")
        return {"id": components[5], "vendor": components[3], "product": components[4]}

        cpeEntry = createCPEEntry()
        cpeEntry["cpe"] = cpe
        cpeEntry["part"] = components[2]
        cpeEntry["vendor"] = components[3]
        cpeEntry["product"] = components[4]
        cpeEntry["version"] = components[5]
        cpeEntry["update"] = components[6]
        cpeEntry["edition"] = components[7]
        cpeEntry["language"] = components[8]
        cpeEntry["softwareEdition"] = components[9]
        cpeEntry["targetSoftware"] = components[10]
        cpeEntry["targetHardware"] = components[11]
        cpeEntry["other"] = components[12]
        return cpeEntry
    else:
        print("Not CPE2.3")
        return None


def parseJSON():
    # Parse JSON files
    files = [f for f in listdir(fileDirectory) if isfile(join(fileDirectory, f))]
    files.sort()
    all_cve_items = []
    for file in tqdm(files):
        archive = zipfile.ZipFile(join(fileDirectory, file), "r")
        jsonfile = archive.open(archive.namelist()[0])
        cve_dict = json.loads(jsonfile.read())
        jsonfile.close()
        all_cve_items += cve_dict["CVE_Items"]

    return cveDictParse(all_cve_items)


def cveDictParse(cve_dict):
    cve_list = []
    cpe_dict = defaultdict(list)
    cvecpe_list = []
    for cve in tqdm(cve_dict):
        data = createCVEEntry()

        # Extract info
        data = cveInfo(data, cve["cve"])
        data = impact(data, cve["impact"])
        cpe = ver(data, cve["configurations"])

        # Dates
        time = datetime.datetime.strptime(cve["publishedDate"], "%Y-%m-%dT%H:%MZ")
        data["created"] = cve["publishedDate"]
        time = datetime.datetime.strptime(cve["lastModifiedDate"], "%Y-%m-%dT%H:%MZ")
        data["modified"] = cve["lastModifiedDate"]
        cve_list.append(data)
        for c in cpe:
            if c["id"] not in cpe_dict[c["vendor"] + ":" + c["product"]]:
                cpe_dict[c["vendor"] + ":" + c["product"]] += [c["id"]]
            cvecpe_list.append(
                {
                    "cve": data["cve_id"],
                    "ver": c["id"],
                    "vendor": c["vendor"],
                    "product": c["product"],
                }
            )

    cpe_dict = [
        {"vendor": i.split(":")[0], "product": i.split(":")[1], "configs": j}
        for i, j in cpe_dict.items()
    ]
    return np.array(cve_list), cpe_dict, np.array(cvecpe_list)

# %% Download Data
nvdFeed()

# %% Parse data
cve_list, cpe_list, cvecpe_list = parseJSON()

# %% Save data
with open("cve.json", "w", encoding="utf-8") as f:
    json.dump(cve_list.tolist(), f, ensure_ascii=False, indent=4)

with open("cpe.json", "w", encoding="utf-8") as f:
    json.dump(cpe_list, f, ensure_ascii=False, indent=4)

with open("cvecpe.json", "w", encoding="utf-8") as f:
    json.dump(cvecpe_list.tolist(), f, ensure_ascii=False, indent=4)
