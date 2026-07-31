import glob
import os
from weasyprint import HTML

BASE = os.path.dirname(os.path.abspath(__file__))
HTML_DIR = os.path.join(BASE, "..", "output", "html")
OUT_DIR = os.path.join(BASE, "..", "output")

for html_path in sorted(glob.glob(os.path.join(HTML_DIR, "*.html"))):
    name = os.path.splitext(os.path.basename(html_path))[0]
    out_path = os.path.join(OUT_DIR, f"{name}.pdf")
    HTML(html_path).write_pdf(out_path)
    print("rendered", out_path)
