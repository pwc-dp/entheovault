"""Check the supplied local PDFs against the curated substance-guide fixtures.

Requires pypdf. Reads PDFs without uploading them or changing the database.
This checks file identity and evidence locations, not scientific validity.
"""

import argparse
import hashlib
import json
import re
import sys
import unicodedata
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:
    sys.exit("pypdf is required; run this with a Python environment containing pypdf.")


def normalize(text):
    # Ignore PDF line wraps, soft hyphens, and word spacing artifacts.
    return re.sub(r"[\s\-\u00ad]+", "", unicodedata.normalize("NFKC", text)).casefold()


def verify_paper(paper, pdf_dir):
    errors = []
    source = pdf_dir / paper["filename"]
    if not source.is_file():
        return {"id": paper["id"], "status": "failed", "errors": ["PDF not found"]}

    if hashlib.sha256(source.read_bytes()).hexdigest() != paper["sha256"]:
        errors.append("PDF hash changed; review this version before updating the fixture")

    try:
        reader = PdfReader(source)
        pages = [page.extract_text() or "" for page in reader.pages]
    except Exception as error:
        return {"id": paper["id"], "status": "failed", "errors": [str(error)]}

    if len(pages) != paper["pdfPageCount"]:
        errors.append("Unexpected PDF page count")
    if normalize(paper["doi"]) not in normalize("\n".join(pages)):
        errors.append("Expected DOI not found in extracted text")

    for anchor in paper["evidenceAnchors"]:
        page_number = anchor["pdfPage"]
        if not 1 <= page_number <= len(pages):
            errors.append(f'{anchor["id"]}: invalid PDF page')
        elif normalize(anchor["quote"]) not in normalize(pages[page_number - 1]):
            errors.append(f'{anchor["id"]}: supporting passage not found on PDF page {page_number}')

    return {
        "id": paper["id"],
        "status": "failed" if errors else "passed",
        "pdfPages": len(pages),
        "locatedAnchors": len(paper["evidenceAnchors"]) if not errors else None,
        "flaggedVisualPages": paper["visualReviewPages"],
        "errors": errors,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pdf-dir", type=Path, required=True)
    parser.add_argument(
        "--manifest",
        type=Path,
        default=Path(__file__).resolve().parents[1]
        / "docs/substances/pilot-papers.json",
    )
    parser.add_argument("--report", type=Path, help="Optional JSON report output")
    parser.add_argument("--guide-evidence", type=Path, help="Check every source passage in a published guide evidence snapshot")
    args = parser.parse_args()
    manifest = json.loads(args.manifest.read_text())
    if args.guide_evidence:
        bundle = json.loads(args.guide_evidence.read_text())
        visual_pages = {paper["filename"]: paper["visualReviewPages"] for paper in manifest["papers"]}
        manifest = {"papers": [
            {
                "id": paper["key"], "doi": paper["doi"], **paper["source"],
                "visualReviewPages": visual_pages.get(paper["source"]["filename"], []),
                "evidenceAnchors": [
                    {"id": evidence["key"], **evidence["source"]}
                    for evidence in bundle["evidence"] if evidence["paperKey"] == paper["key"]
                ],
            }
            for paper in bundle["papers"]
        ]}

    # Citation keys and evidence IDs must be unambiguous across this corpus.
    for field in ("id", "doi", "filename"):
        values = [paper[field].casefold() for paper in manifest["papers"]]
        if len(values) != len(set(values)):
            sys.exit(f"Duplicate {field} in the manifest")
    anchor_ids = [
        anchor["id"]
        for paper in manifest["papers"]
        for anchor in paper["evidenceAnchors"]
    ]
    if len(anchor_ids) != len(set(anchor_ids)):
        sys.exit("Duplicate evidence ID in the manifest")

    results = [verify_paper(paper, args.pdf_dir) for paper in manifest["papers"]]
    report = {
        "scope": "Local PDF identity, DOI, page count, and supporting-passage checks only",
        "passed": sum(result["status"] == "passed" for result in results),
        "total": len(results),
        "results": results,
    }
    if args.report:
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["passed"] == report["total"] else 1


if __name__ == "__main__":
    sys.exit(main())
