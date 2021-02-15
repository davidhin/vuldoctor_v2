import re
import sys
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from selenium import webdriver

sys.path.insert(0, "/usr/lib/chromium-browser/chromedriver")


def webdriver_download_and_parse(url):
    """Use selenium to retrieve web data."""
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    wd = webdriver.Chrome("chromedriver", chrome_options=chrome_options)
    wd.get(url)
    parser = BeautifulSoup(wd.page_source, "html")
    return parser


def download_and_parse(url):
    """Download content from url and parse."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/\
537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36"
    }
    res = requests.get(url, headers=headers)
    parser = BeautifulSoup(res.text, "html")
    return parser


def verify_ibmcloud(link):
    """# @title verify_ibmcloud."""
    parser = webdriver_download_and_parse(link)
    if parser.select('p[ng-bind-html="report.data.vulnerability.remedy_fmt"]'):
        return True
    else:
        return False


def verify_securityfocus(link):
    """# @title verify_securityfocus."""
    if not link.endswith("solution"):
        link = link + "/solution"
    parser = download_and_parse(link)
    vul = parser.select("#vulnerability")[0]
    if "Updates are available" in parser.text or (vul and "Solution" in vul.text):
        return True
    else:
        return False


def verify_securitytracker(link):
    """# @title verify_securitytracker."""
    parser = download_and_parse(link)
    if re.search("Fix Available:.+Yes.+Vendor", parser.text):
        return True
    else:
        return False


def verify_opensuse(link):
    """All pages on opensuse have mitigation information."""
    return True


def verify_github(link):
    """All pages on github.com have mitigation information."""
    return True


def verify_debian(link):
    """# @title verify_debian."""
    parser = download_and_parse(link)
    if "has been fixed" in parser.text:
        return True
    else:
        return False


def verify_support_apple(link):
    """All pages on support.apple.com have mitigation information."""
    return True


def verify_oracle(link):
    """All pages on oracle.com have mitigation information."""
    return True


def verify_link(link):
    """Map links to solution information."""
    cases_mapping = {
        "exchange.xforce.ibmcloud.com": verify_ibmcloud,
        "www.securityfocus.com": verify_securityfocus,
        "www.securitytracker.com": verify_securitytracker,
        "lists.opensuse.org": verify_opensuse,
        "github.com": verify_github,
        "www.debian.org": verify_debian,
        "support.apple.com": verify_support_apple,
        "www.oracle.com": verify_oracle,
    }
    domain_name = urlparse(link).hostname
    if domain_name in cases_mapping:
        return cases_mapping[domain_name](link)
    else:
        return True
