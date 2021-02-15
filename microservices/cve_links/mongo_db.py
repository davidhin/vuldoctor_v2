import base64
import gzip
import json
import os

import pymongo


class VulDoctorDB:
    """Connect to VulDoctor Database in MongoAtlas."""

    def __init__(self):
        """Start mongodb client on class init."""
        conn_str = os.getenv("MONGODB_TOKEN")
        self._client = pymongo.MongoClient(conn_str)
        self._db = self._client.main.cve

    @property
    def db(self):
        """Return db."""
        return self._db

    @property
    def collection(self):
        """Get CVE references."""
        return self.db.references

    def get_all_docs(self, query={}):
        """Get all docs from database corresponding to query."""
        docs = []
        for doc in self._db.find(query):
            references = gzip.decompress(
                base64.b64decode(doc["references"].rstrip("=") + "===")
            ).decode("utf-8")
            for ref in json.loads(references):
                docs.append(ref)
        return docs
