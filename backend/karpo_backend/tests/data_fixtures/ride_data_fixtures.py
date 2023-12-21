import pytest

test_ride_1 = {
    "origin": {
        "latitude": 0.001,
        "longitude": 0,
        "description": "A",
    },
    "destination": {
        "latitude": -0.005,
        "longitude": 0.003,
        "description": "B",
    },
    "route": {
        "steps": [
            [(0, 0.001), (0.001, 0)],
            [(0.001, 0), (0.001, -0.002), (0.001, -0.004)],
            [(0.001, -0.004), (0.002, -0.004), (0.003, -0.005)],
        ],
        "durations": [
            30,
            180,
            100,
        ],
    },
    "intermediates": [
        {"latitude": 0, "longitude": 0.001, "description": "intermediate 1"},
        {"latitude": -0.004, "longitude": 0.001, "description": "intermediate 2"},
    ],
    "departure_time": "2023-12-08T02:56:00.000Z",
    "num_seats": 3,
}
test_ride_2 = {
    "label": "new ride 1",
    "origin": {"latitude": 1, "longitude": 0, "description": "string"},
    "destination": {"latitude": 5, "longitude": 0, "description": "string"},
    "route": {
        "steps": [[(0, 0), (0, 1)], [(0, 1), (0, 2), (0, 3), (0, 4)]],
        "durations": [1, 7],
    },
    "intermediates": [{"latitude": 0, "longitude": 1, "description": "intermediate 1"}],
    "departure_time": "2023-12-09T08:00:00.556Z",
    "num_seats": 4,
}


@pytest.fixture
def ride_datas():
    return [test_ride_1, test_ride_2]


@pytest.fixture
def ride_data_1():
    return test_ride_1


@pytest.fixture
def ride_data_2():
    return test_ride_2
