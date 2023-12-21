import math
from datetime import datetime, timedelta
from typing import List, Tuple

import pytest
from shapely import LineString, Point

from karpo_backend.matching import (
    clip_route_by_start_time,
    find_point_idx_on_linestring,
)


@pytest.mark.parametrize(
    ["start_time_second", "sub_route_ans", "sub_ts_ans", "err"],
    [
        (0, [(1, 0), (2, 0), (3, 0), (4, 0), (5, 0)], [1, 2, 3, 4, 5], False),
        (1.5, [(1.5, 0), (2, 0), (3, 0), (4, 0), (5, 0)], [1.5, 2, 3, 4, 5], False),
        (4.5, [(4.5, 0), (5, 0)], [4.5, 5], False),
        (5.5, (), (), True),
    ],
)
def test_clip_route_by_start_time(
    start_time_second: float,
    sub_route_ans: List[Tuple[float, float]],
    sub_ts_ans: List[float],
    err: bool,
):
    time_base = datetime(year=2023, month=1, day=1)
    route: LineString = LineString(
        [
            (1, 0),
            (2, 0),
            (3, 0),
            (4, 0),
            (5, 0),
        ],
    )
    ts: List[datetime] = [
        time_base + timedelta(seconds=sec) for sec in range(1, len(route.coords) + 1)
    ]

    if err:
        with pytest.raises(ValueError):
            clip_route_by_start_time(
                route,
                ts,
                time_base + timedelta(seconds=start_time_second),
            )
        return

    sub_route, sub_ts = clip_route_by_start_time(
        route,
        ts,
        time_base + timedelta(seconds=start_time_second),
    )

    assert len(sub_route.coords) == len(sub_route_ans)
    for p, p_ans in zip(sub_route.coords, sub_route_ans):
        assert math.isclose(p[0], p_ans[0])
        assert math.isclose(p[1], p_ans[1])

    assert len(sub_ts) == len(sub_ts_ans)
    for t, t_ans in zip(sub_ts, sub_ts_ans):
        assert math.isclose(t.timestamp() - time_base.timestamp(), t_ans)


@pytest.mark.parametrize(
    ["point", "line", "ans_idx"],
    [
        ((0.25, 0.25), [(0, 0), (1, 1), (1, 0), (0, -2)], 0),
        ((1, 0.1), [(0, 0), (1, 1), (1, 0), (0, -2)], 1),
        ((0, -2), [(0, 0), (1, 1), (1, 0), (0, -2)], 2),
    ],
)
def test_find_point_idx_on_linestring(
    point: Tuple[float, float],
    line: List[Tuple[float, float]],
    ans_idx: int,
):
    p: Point = Point(point)
    l: LineString = LineString(line)
    idx = find_point_idx_on_linestring(p, l)
    assert idx == ans_idx
