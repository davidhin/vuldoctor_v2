#%% Setup
import pickle
from collections import Counter

import joblib
import numpy as np
import pandas as pd
import so_textprocessing as stp
from progressbar import progressbar as pb
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

#%% Path to directory containing 'data' folder, containing NVD json data
path = "/home/david/Documents/misc/FirebaseApp/cvss_prediction/"

#%% Store Data
rows = []

#%% Read All Data
for year in pb(range(2002, 2019)):
    CVE = pd.read_json(path + "data/nvdcve-1.1-{}.json".format(year))
    for row in CVE.CVE_Items:
        cve = dict()

        # Get Data
        cve_id = row["cve"]["CVE_data_meta"]["ID"]
        description = row["cve"]["description"]["description_data"]
        impact = row["impact"]

        # Define columns
        cve["description"] = dict()
        cve["impact"] = dict()

        # Assign Information
        cve["description"][cve_id] = description
        cve["impact"][cve_id] = impact

        # Append
        rows.append(pd.DataFrame(cve))

#%% Data to DF
df = pd.concat(rows)


def get_cvss(row, ver):
    """Get CVSS Score."""
    try:
        base_met = "baseMetricV{}".format(ver)
        cvss_v = "cvssV{}".format(ver)
        return np.round(row[base_met][cvss_v]["baseScore"])
    except Exception as e:
        print(e)
        return None


def desc(x):
    """Transform Data Helper Function."""
    return " ".join([i["value"] for i in x])


#%% Transform data
sample = df.sample(25000, random_state=42)
sample.description = sample.description.apply(lambda x: desc(x))
sample["cvss2"] = sample.impact.apply(lambda x: get_cvss(x, 2))
sample = stp.TextPreprocess().transform_df(
    sample, reformat="processonly", columns=["description"]
)
sample = sample.dropna()
sample.to_parquet(path + "transformed_data.parquet", index=False, compression="gzip")

# Split Data
X = sample.description.tolist()
y = sample.cvss2.tolist()
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1)

# TF-IDF
vectorizer = TfidfVectorizer(min_df=10)
vectorizer = vectorizer.fit(X)
X_train_tfidf = vectorizer.transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

# Dimensionality Reduction
lda = LinearDiscriminantAnalysis(n_components=10)
lda = lda.fit(X_train_tfidf.toarray(), y_train)
X_train_lda = lda.transform(X_train_tfidf.toarray())
X_test_lda = lda.transform(X_test_tfidf.toarray())

# Machine Learning
clf = LogisticRegression(max_iter=10000).fit(X_train_lda, y_train)

# Results
X_train_pred = [np.round(i) for i in clf.predict(X_train_lda)]
X_test_pred = [np.round(i) for i in clf.predict(X_test_lda)]
print(classification_report(y_train, X_train_pred))
print(classification_report(y_test, X_test_pred))

#%% Alternate Result Printing
results = pd.DataFrame(zip(y_test, X_test_pred))
results[2] = results[1] - results[0]
results = pd.DataFrame(dict(Counter(results[2])).items()).sort_values(1)
results[0] = results[0].apply(np.abs)
results = results.groupby(0).sum()
sum = results.sum().item()
results["diff"] = results[1] / sum
results = results.reset_index()

results["diff"]

# Save model
joblib.dump(vectorizer, open("tfidf.joblib", "wb"))
joblib.dump(lda, open("lda.joblib", "wb"))
joblib.dump(clf, open("lrclf.joblib", "wb"))
pickle.dump(stp.TextPreprocess(), open("textprocess.pkl", "wb"))


# Predict
vectorizer = joblib.load(path + "cvss_flask/tfidf.joblib")
lda = joblib.load(path + "cvss_flask/lda.joblib")
clf = joblib.load(path + "cvss_flask/lrclf.joblib")
tp = stp.TextPreprocess()


def pred_cvss(input_raw):
    """Predict CVSS score."""
    input = tp.transform_df(
        pd.DataFrame([input_raw]), reformat="stopstemprocessonly", columns=[0]
    ).iloc[0][0]
    input_tfidf = vectorizer.transform([input])
    input_lda = lda.transform(input_tfidf.toarray())
    return clf.predict(input_lda)[0]
