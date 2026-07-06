#!/usr/bin/env python3
import html.parser
import json
import re
import sys
import urllib.parse
import urllib.request
import zipfile
from datetime import date, datetime, timedelta
from pathlib import Path
from xml.etree import ElementTree


ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "fund-trends.json"
KLP_NAV_PAGE = "https://www.klp.no/virksomhet/fond/nav-verdier"
KLP_ISINS = {"NO0010776040", "NO0012445834", "NO0012445701"}
KRON_FUND_URL = "https://www.kron.no/fond/{isin}"
KRON_ISINS = {"NO0012445834", "NO0012445701"}
MAX_WORKBOOKS = 18


class LinkParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return
        href = dict(attrs).get("href")
        if href and "NAV" in urllib.parse.unquote(href) and href.endswith(".xlsx"):
            self.links.append(urllib.parse.urljoin(KLP_NAV_PAGE, href))


def fetch_bytes(url):
    request = urllib.request.Request(url, headers={"User-Agent": "min-startside/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def excel_col_index(ref):
    letters = re.match(r"([A-Z]+)", ref).group(1)
    value = 0
    for letter in letters:
        value = value * 26 + ord(letter) - 64
    return value - 1


def excel_date(value):
    if isinstance(value, str):
        text = value.strip()
        for fmt in ("%Y-%m-%d", "%d.%m.%Y", "%d/%m/%Y"):
            try:
                return datetime.strptime(text[:10], fmt).date().isoformat()
            except ValueError:
                pass
        return None

    if isinstance(value, (int, float)) and 35000 <= value <= 70000:
        return (date(1899, 12, 30) + timedelta(days=float(value))).isoformat()

    return None


def numeric(value):
    if isinstance(value, (int, float)):
        return float(value)
    if not isinstance(value, str):
        return None
    cleaned = value.replace("\xa0", "").replace(" ", "").replace(",", ".")
    try:
        return float(cleaned)
    except ValueError:
        return None


def read_shared_strings(zf):
    try:
        xml = zf.read("xl/sharedStrings.xml")
    except KeyError:
        return []
    root = ElementTree.fromstring(xml)
    ns = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    strings = []
    for item in root.findall("x:si", ns):
        strings.append("".join(node.text or "" for node in item.findall(".//x:t", ns)))
    return strings


def cell_value(cell, shared_strings):
    ns = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    value_el = cell.find("x:v", ns)
    if value_el is None or value_el.text is None:
        return ""
    raw = value_el.text
    if cell.attrib.get("t") == "s":
        return shared_strings[int(raw)]
    try:
        number = float(raw)
        return int(number) if number.is_integer() else number
    except ValueError:
        return raw


def worksheet_rows(zf, name, shared_strings):
    ns = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    root = ElementTree.fromstring(zf.read(name))
    rows = []
    for row in root.findall(".//x:sheetData/x:row", ns):
        cells = {}
        for cell in row.findall("x:c", ns):
            ref = cell.attrib.get("r", "A1")
            cells[excel_col_index(ref)] = cell_value(cell, shared_strings)
        if cells:
            max_col = max(cells)
            rows.append([cells.get(index, "") for index in range(max_col + 1)])
    return rows


def parse_workbook(blob):
    points = {isin: [] for isin in KLP_ISINS}
    tmp = ROOT / "data" / ".fund-workbook.tmp.xlsx"
    tmp.write_bytes(blob)
    try:
        with zipfile.ZipFile(tmp) as zf:
            shared_strings = read_shared_strings(zf)
            sheet_names = sorted(name for name in zf.namelist() if re.match(r"xl/worksheets/sheet\d+\.xml", name))
            for sheet_name in sheet_names:
                rows = worksheet_rows(zf, sheet_name, shared_strings)
                header_dates = {}
                header_labels = {}
                for row in rows:
                    row_date = next((excel_date(value) for value in row if excel_date(value)), None)
                    row_text = " ".join(str(value) for value in row)
                    isin = next((candidate for candidate in KLP_ISINS if candidate in row_text), None)
                    if isin:
                        nav_col = next(
                            (
                                col
                                for col, label in header_labels.items()
                                if "nav" in label and "før" not in label and "for" not in label
                            ),
                            None,
                        )
                        if row_date and nav_col is not None and nav_col < len(row):
                            point_value = numeric(row[nav_col])
                            if point_value and point_value > 0:
                                points[isin].append({"date": row_date, "value": round(point_value, 6)})

                        for col, value in enumerate(row):
                            point_date = header_dates.get(col)
                            point_value = numeric(value)
                            value_is_date = excel_date(value) is not None
                            if point_date and point_value and point_value > 0 and not value_is_date:
                                points[isin].append({"date": point_date, "value": round(point_value, 6)})

                    for col, value in enumerate(row):
                        parsed = excel_date(value)
                        if parsed:
                            header_dates[col] = parsed
                        if isinstance(value, str) and value.strip():
                            header_labels[col] = value.strip().lower()

                    if not isin:
                        continue
    finally:
        tmp.unlink(missing_ok=True)
    return points


def unique_points(points):
    deduped = {}
    for point in points:
        deduped[point["date"]] = point
    return [deduped[key] for key in sorted(deduped)]


def kron_fund_data(isin):
    html_text = fetch_bytes(KRON_FUND_URL.format(isin=isin)).decode("utf-8", errors="ignore")
    match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html_text)
    if not match:
        return None

    next_data = json.loads(html.unescape(match.group(1)))
    details = next_data.get("props", {}).get("pageProps", {}).get("page", {}).get("details", {})
    nav = details.get("netAssetValuePerShare") or {}
    returns = {}
    period_map = {
        "1D": "1d",
        "1M": "1m",
        "6M": "6m",
        "this-year": "ytd",
        "1Y": "1y",
    }
    for item in details.get("yields", []):
        key = period_map.get(item.get("interval"))
        value = item.get("yield")
        if key and isinstance(value, (int, float)):
            returns[key] = round(value * 100, 4)

    if not nav.get("value") or not nav.get("date"):
        return None

    return {
        "nav": round(float(nav["value"]), 6),
        "navDate": nav["date"],
        "returns": returns,
    }


def main():
    data = json.loads(DATA_FILE.read_text())
    html = fetch_bytes(KLP_NAV_PAGE).decode("utf-8", errors="ignore")
    parser = LinkParser()
    parser.feed(html)
    links = list(dict.fromkeys(parser.links))[:MAX_WORKBOOKS]
    if not links:
        raise RuntimeError("Fant ingen KLP NAV Excel-filer")

    collected = {isin: [] for isin in KLP_ISINS}
    for link in links:
        try:
            workbook_points = parse_workbook(fetch_bytes(link))
        except Exception as error:
            print(f"Hopper over {link}: {error}", file=sys.stderr)
            continue
        for isin, points in workbook_points.items():
            collected[isin].extend(points)

    changed = False
    for fund in data["funds"]:
        isin = fund.get("isin")
        if isin not in KLP_ISINS:
            continue
        history = unique_points([*fund.get("history", []), *collected[isin]])
        if not history:
            continue
        latest = history[-1]
        fund["history"] = history[-366:]
        fund["nav"] = latest["value"]
        fund["navDate"] = latest["date"]
        changed = True

    for fund in data["funds"]:
        isin = fund.get("isin")
        if isin not in KRON_ISINS:
            continue
        kron_data = kron_fund_data(isin)
        if not kron_data:
            continue
        fund["nav"] = kron_data["nav"]
        fund["navDate"] = kron_data["navDate"]
        if kron_data["returns"]:
            fund["returns"] = kron_data["returns"]
        changed = True

    if changed:
        data["updatedAt"] = datetime.utcnow().date().isoformat()
        data["source"] = KLP_NAV_PAGE
        DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
