"""Minimal fixed-canvas figure under the tufte-data-viz defaults.

One focal series against gray context, one title, endpoint labels instead of
a legend, no footer. Methods belong in the accompanying note. The headline
number is printed so it can be checked without reading the image.

Run from the skill directory with its bundled helpers on the import path:
    PYTHONPATH="$PWD/scripts" python examples/matplotlib-minimal.py
"""

import sys
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
from tufte_mpl import HumanFormatter, add_titles, direct_label, tufte_style

OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("minimal.png")
FIGSIZE = (9.0, 5.0)  # inches, fixed by the destination column
DPI = 150

months = np.arange(1, 13)
revenue = np.array([42, 48, 51, 49, 56, 62, 58, 65, 71, 68, 75, 82]) * 1e3
target = np.linspace(40e3, 62e3, 12)
beat = revenue - target
print(f"months_above_target={int((beat > 0).sum())}/12 dec_gap={beat[-1]:.0f}")

tufte_style()
fig, ax = plt.subplots(figsize=FIGSIZE)
ax.plot(months, target, color="#9a9a9a", linewidth=1.2, linestyle="--")
ax.plot(months, revenue, color="#c0392b", linewidth=1.8)
direct_label(ax, months, revenue, "Revenue", color="#c0392b")
direct_label(ax, months, target, "Target", color="#666666")
ax.set_xlim(1, 13.2)  # headroom for the endpoint labels
ax.set_xticks(months)
ax.set_xticklabels(
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
)
ax.yaxis.set_major_formatter(HumanFormatter())
ax.set_ylabel("Monthly revenue, USD")
add_titles(fig, f"Revenue beat target in {int((beat > 0).sum())} months of 2025")

fig.savefig(OUT, dpi=DPI)  # default bbox: the canvas, not the text, sets the size
with Image.open(OUT) as exported:
    print(
        f"saved={OUT} px={exported.size} expected={tuple(int(s * DPI) for s in FIGSIZE)}"
    )
plt.close(fig)
