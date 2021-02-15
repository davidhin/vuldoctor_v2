from verify import verify_link


def get_links_by_cve(cve, vul_db):
    """Get external links if they have mitigation info for a cve.

    Example:
        >>> from cve_links import get_links_by_cve
        >>> res = get_links_by_cve('CVE-1999-0002')
        [('http://www.securityfocus.com/bid/121', True)]

    Args:
        cve (string): cve ID
        vul_db: mongodb atlas db

    Returns:
        List of tuple
    """
    res = vul_db.get_all_docs({"cve_id": {"$eq": cve}})
    links = set([item["url"] for item in res])
    links_with_status = [(url, verify_link(url)) for url in links]
    return links_with_status
