"""Tufte-style matplotlib setup and helpers.

Drop-in for the tufte-data-viz skill. One call to ``tufte_style()`` applies a
CJK-safe serif font (no ``findfont`` warnings, no tofu), the Tufte rcParams, and
sane layout defaults; the helpers cover human number formatting, range-frame
axes, direct labels, titles, concise dates, and sparklines.

Usage:
    # Add this skill's scripts directory to PYTHONPATH before running Python.
    from tufte_mpl import tufte_style, HumanFormatter, add_titles, tufte_axes

    tufte_style()
    fig, ax = plt.subplots(layout="constrained")
    ...
    ax.yaxis.set_major_formatter(HumanFormatter())  # range-aware; no duplicate ticks
    add_titles(fig, "Headline states the finding", "context and units")

Verified on Linux + matplotlib 3.10, Bondilab env, with Chinese labels.
"""

import datetime as dt
from collections.abc import Sequence

import matplotlib as mpl
import matplotlib.dates as mdates
import numpy as np
from matplotlib.axes import Axes
from matplotlib.figure import Figure
from matplotlib.font_manager import FontProperties, fontManager
from matplotlib.ticker import Formatter, PercentFormatter

COLORS: dict[str, object] = {
    "bg": "#fffff8",
    "text": "#111111",
    "text_secondary": "#666666",
    "text_tertiary": "#999999",
    "axis": "#cccccc",
    "grid": "#eeeeee",
    "series_default": "#666666",
    "highlight": "#e41a1c",
    "categorical": ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2"],
}

# Serif/CJK fonts as FILE PATHS, best first. Name-based lookup is unreliable:
# matplotlib does not reliably index system .ttc/.pfb fonts, and a .ttc's first
# face often registers under an unexpected name (NotoSerifCJK's first subface is
# "...CJK JP", so requesting "Noto Serif CJK SC" silently falls back). Registering
# by path and reading the name back is robust.
CJK_SERIF_CANDIDATES: list[str] = [
    "/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc",  # serif + full CJK — best
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",  # sans + CJK — fallback
    "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",  # CJK — last resort
]

TUFTE_RC: dict[str, object] = {
    "font.size": 12,
    "figure.facecolor": "#fffff8",
    "figure.figsize": (9, 6),  # 1.5:1 aspect ratio
    "figure.dpi": 120,
    "figure.constrained_layout.use": True,  # reserves title/label space automatically
    "axes.facecolor": "#fffff8",
    "axes.edgecolor": "#cccccc",
    "axes.linewidth": 0.5,
    "axes.labelcolor": "#666666",
    "axes.labelsize": 12,
    "axes.titlesize": 18,
    "axes.titleweight": "normal",
    "axes.titlepad": 16,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.grid": False,
    "xtick.color": "#999999",
    "ytick.color": "#999999",
    "xtick.labelsize": 11,
    "ytick.labelsize": 11,
    "xtick.direction": "in",
    "ytick.direction": "in",
    "xtick.major.size": 3,
    "ytick.major.size": 3,
    "xtick.major.width": 0.5,
    "ytick.major.width": 0.5,
    "lines.linewidth": 1.5,
    "lines.markersize": 3,
    "legend.frameon": False,
    "legend.fontsize": 11,
    "grid.color": "#eeeeee",
    "grid.linewidth": 0.5,
    "grid.alpha": 0.5,
    # No global savefig.bbox="tight": it fights constrained layout and silently
    # changes the output size. Pass bbox_inches="tight" per-call only if needed.
    "savefig.facecolor": "#fffff8",
    "savefig.dpi": 150,
    "savefig.pad_inches": 0.05,
}


def setup_fonts(extra_paths: list[str] | None = None) -> list[str]:
    """Register an installed serif/CJK font so labels render clean on any box.

    Ensures CJK text shows real glyphs (no tofu), the plot is actually serif, the
    unicode minus renders, and no ``findfont`` warnings fire. Sets ``font.family``
    and ``axes.unicode_minus`` on the global rcParams.

    Args:
        extra_paths: Font file paths to try before the built-in candidates. Find
            them with ``fc-list :lang=zh file`` (CJK) or ``fc-list : file family``.

    Returns:
        The ``font.family`` list applied to rcParams.
    """
    families: list[str] = []
    for path in (extra_paths or []) + CJK_SERIF_CANDIDATES:
        try:
            fontManager.addfont(path)
            families.append(FontProperties(fname=path).get_name())
        except (FileNotFoundError, OSError):
            continue  # not on this box — try the next candidate

    # matplotlib does per-glyph fallback across this list, so ASCII resolves to the
    # serif and Han glyphs resolve to the CJK font; DejaVu Serif is the safety net.
    family = families + ["DejaVu Serif"]
    mpl.rcParams["font.family"] = family
    mpl.rcParams["axes.unicode_minus"] = False  # else the minus sign can tofu
    return family


def tufte_style(
    extra_font_paths: list[str] | None = None,
    figsize: tuple[float, float] | None = None,
    dpi: int | None = None,
) -> list[str]:
    """Apply the full Tufte style: fonts, rcParams, layout defaults. Call once.

    Args:
        extra_font_paths: Extra font file paths tried before the defaults.
        figsize: Override the default (9, 6) figure size.
        dpi: Override the default figure dpi.

    Returns:
        The resolved ``font.family`` list.
    """
    family = setup_fonts(extra_font_paths)
    rc = dict(TUFTE_RC)
    if figsize is not None:
        rc["figure.figsize"] = figsize
    if dpi is not None:
        rc["figure.dpi"] = dpi
    mpl.rcParams.update(rc)
    return family


def human_format(x: float, pos: object = None) -> str:
    """Abbreviate a single number: 1_200_000 -> '1.2M', 4300 -> '4.3K'.

    For one-off values in tables, annotations, or titles. For an axis, prefer
    ``HumanFormatter`` — it keeps every tick label unambiguous across the whole
    axis, which this per-value function cannot (fixed precision collapses distinct
    ticks to the same label on a narrow range).
    """
    for unit, div in (("B", 1e9), ("M", 1e6), ("K", 1e3)):
        if abs(x) >= div:
            return f"{x / div:,.1f}".rstrip("0").rstrip(".") + unit
    return f"{x:,.0f}"  # thousands separator for the rest


class HumanFormatter(Formatter):
    """Abbreviate axis ticks (1.2M, 4.3K) with just enough precision to stay distinct.

    A fixed-precision formatter collapses distinct ticks to the same label on a
    narrow range ("2M, 2M, 2M"). This inspects the whole tick set, picks one unit
    (K/M/B) from the largest tick, then the minimum decimals so every visible tick
    formats to a unique, uniformly-aligned label.

    Args:
        prefix: String prepended to every label (e.g. a currency symbol).
        unit: Force a unit ("", "K", "M", "B"); None auto-picks from the peak tick.
        max_decimals: Cap on decimals before giving up on making labels unique.
    """

    _UNITS: tuple[tuple[str, float], ...] = (
        ("B", 1e9),
        ("M", 1e6),
        ("K", 1e3),
        ("", 1.0),
    )

    def __init__(
        self, prefix: str = "", unit: str | None = None, max_decimals: int = 4
    ) -> None:
        self.prefix = prefix
        self.unit = unit
        self.max_decimals = max_decimals
        self._suffix = ""
        self._div = 1.0
        self._decimals = 0

    def _pick_unit(self, values: list[float]) -> tuple[str, float]:
        """Return (suffix, divisor): forced unit if set, else largest that fits the peak."""
        if self.unit is not None:
            return self.unit, {s: d for s, d in self._UNITS}.get(self.unit, 1.0)
        peak = max((abs(v) for v in values), default=0.0)
        for suffix, div in self._UNITS:
            if peak >= div:
                return suffix, div
        return "", 1.0

    def set_locs(self, locs: Sequence[float]) -> None:
        """Called by matplotlib with the tick locations; pick unit + minimum decimals."""
        self.locs = locs
        values = [float(v) for v in locs if np.isfinite(v)]
        if not values:
            self._suffix, self._div, self._decimals = "", 1.0, 0
            return
        self._suffix, self._div = self._pick_unit(values)
        target = len(set(values))
        for decimals in range(self.max_decimals + 1):
            if len({f"{v / self._div:.{decimals}f}" for v in values}) == target:
                self._decimals = decimals
                return
        self._decimals = self.max_decimals

    def __call__(self, x: float, pos: object = None) -> str:
        value = x / self._div
        if value == 0:  # normalize -0.0 -> 0.0 so a rounded tick never shows "-0"
            value = 0.0
        return f"{self.prefix}{value:,.{self._decimals}f}{self._suffix}"


def currency_formatter(symbol: str = "¥") -> HumanFormatter:
    """A range-aware human formatter that prefixes a currency symbol to each tick."""
    return HumanFormatter(prefix=symbol)


def percent_formatter(xmax: float = 1.0, decimals: int = 1) -> PercentFormatter:
    """A PercentFormatter; xmax=1.0 treats 0.123 as 12.3%, xmax=100 treats 12.3 as 12.3%."""
    return PercentFormatter(xmax=xmax, decimals=decimals)


def _explicit_bounds(values: Sequence[object]) -> tuple[float, float] | None:
    """Numeric (min, max) from an explicit array, datetime-aware; None if not numeric."""
    arr = list(values)
    if not arr:
        return None
    if isinstance(arr[0], (dt.date, dt.datetime, np.datetime64)):
        nums = np.asarray(mdates.date2num(arr), dtype=float)
    else:
        try:
            nums = np.asarray(arr, dtype=float)
        except (TypeError, ValueError):
            return None  # categorical strings — range-frame does not apply
    return float(np.min(nums)), float(np.max(nums))


def _data_bounds(ax: Axes, which: str) -> tuple[float, float] | None:
    """Range-frame bounds from the axes' own data limits (already numeric)."""
    interval = ax.dataLim.intervalx if which == "x" else ax.dataLim.intervaly
    lo, hi = float(interval[0]), float(interval[1])
    if not (np.isfinite(lo) and np.isfinite(hi)) or lo == hi:
        return None  # empty or degenerate axis — leave the spine full
    return lo, hi


def tufte_axes(
    ax: Axes,
    x_data: Sequence[object] | None = None,
    y_data: Sequence[object] | None = None,
) -> Axes:
    """Apply Tufte range-frame: spines span only the data range. Datetime/category-safe.

    Pass ``x_data``/``y_data`` to range-frame to specific arrays; omit them to use the
    axes' own data limits (works for numeric, datetime, and categorical axes).
    """
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)

    xb = _explicit_bounds(x_data) if x_data is not None else _data_bounds(ax, "x")
    yb = _explicit_bounds(y_data) if y_data is not None else _data_bounds(ax, "y")
    if xb is not None:
        ax.spines["bottom"].set_bounds(*xb)
    if yb is not None:
        ax.spines["left"].set_bounds(*yb)

    ax.tick_params(direction="in", length=3, width=0.5)
    return ax


def direct_label(
    ax: Axes,
    x: Sequence[float],
    y: Sequence[float],
    label: str,
    color: str = "#111111",
    offset: tuple[float, float] = (8, 0),
) -> None:
    """Label a series at its last point (Tufte: no legend). Pair with add_label_headroom."""
    ax.annotate(
        label,
        xy=(x[-1], y[-1]),
        xytext=offset,
        textcoords="offset points",
        fontsize=12,
        color=color,
        va="center",
    )


def add_label_headroom(ax: Axes, frac: float = 0.12) -> None:
    """Extend the right x-limit so endpoint labels are not clipped at the frame edge."""
    x0, x1 = ax.get_xlim()
    ax.set_xlim(x0, x1 + (x1 - x0) * frac)


def annotate_point(
    ax: Axes, x: float, y: float, text: str, color: str = "#333333"
) -> None:
    """Annotate a notable data point with a thin leader line."""
    ax.annotate(
        text,
        xy=(x, y),
        xytext=(0, 24),
        textcoords="offset points",
        fontsize=11,
        fontstyle="italic",
        color=color,
        ha="center",
        arrowprops=dict(arrowstyle="-", color="#cccccc", lw=0.5),
    )


def add_titles(fig: Figure, title: str, subtitle: str | None = None) -> None:
    """Tufte headline + subtitle that constrained layout spaces automatically.

    Headline asserts the finding; subtitle carries context/units. No manual
    y-coordinates: constrained layout reserves room for the suptitle and the
    first-axes title. Requires the figure to use constrained layout.
    """
    fig.suptitle(
        title, x=0.008, ha="left", fontsize=15.5, fontweight="normal", color="#111111"
    )
    if subtitle:
        fig.axes[0].set_title(subtitle, loc="left", fontsize=11, color="#666666", pad=8)


def concise_dates(ax: Axes, axis: str = "x") -> None:
    """Format a date axis with ConciseDateFormatter (no rotation, no overlap)."""
    target = ax.xaxis if axis == "x" else ax.yaxis
    locator = mdates.AutoDateLocator()
    target.set_major_locator(locator)
    target.set_major_formatter(mdates.ConciseDateFormatter(locator))


def sparkline(
    ax: Axes,
    data: Sequence[float],
    color: str = "#666666",
    highlight_endpoints: bool = True,
) -> None:
    """Draw a minimal sparkline (no axes/labels/gridlines) on the given axes."""
    values = list(data)
    ax.plot(values, color=color, linewidth=1)
    ax.set_xlim(0, len(values) - 1)
    if highlight_endpoints:
        min_idx = values.index(min(values))
        max_idx = values.index(max(values))
        ax.plot(min_idx, values[min_idx], "o", color="#e15759", markersize=2)
        ax.plot(max_idx, values[max_idx], "o", color="#4e79a7", markersize=2)
        ax.plot(len(values) - 1, values[-1], "o", color=color, markersize=2)
    ax.set_xticks([])
    ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_visible(False)


def rug_marks(
    ax: Axes,
    x_data: Sequence[float],
    y_data: Sequence[float],
    color: str = "#999999",
    size: float = 3,
) -> None:
    """Add rug marks along the axes showing marginal distributions."""
    y_min = ax.get_ylim()[0]
    x_min = ax.get_xlim()[0]
    ax.plot(x_data, [y_min] * len(x_data), "|", color=color, markersize=size, alpha=0.5)
    ax.plot([x_min] * len(y_data), y_data, "_", color=color, markersize=size, alpha=0.5)
