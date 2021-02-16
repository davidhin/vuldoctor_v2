# %% Setup
import json
import os
import xml.etree.ElementTree as ET

import pandas as pd
import requests

# Download CAPECs
URL = "https://capec.mitre.org/data/xml/capec_latest.xml"
response = requests.get(URL)
capec_xml = response.content.decode()
root = ET.fromstring(capec_xml)
attack_patterns = root[0]

# Parse CAPECS
capec_cwe = []
for ap in attack_patterns:
    data = ap.attrib
    cwes = []
    for a in ap.iter():
        if "CWE_ID" in a.attrib:
            cwes.append(a.attrib["CWE_ID"])
    data["cwes"] = cwes
    capec_cwe.append(data)
capec_df = pd.DataFrame(capec_cwe)

# Get CAPEC - CWE Mapping
capec_cwe = []
for row in capec_df.itertuples():
    for cwe in row.cwes:
        capec_cwe.append({"capec_id": row.ID, "capec_name": row.Name, "cwe_id": cwe})

# Upload to mongoDB
with open("capec_cwe.json", "w", encoding="utf-8") as f:
    json.dump(capec_cwe, f, ensure_ascii=False, indent=4)
os.system("bash import_capec_cwe.sh")
