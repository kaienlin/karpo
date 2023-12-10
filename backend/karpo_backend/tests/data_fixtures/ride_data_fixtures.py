import pytest

test_ride_1 = {
    "label": "new ride 1",
    "origin": {
        "latitude": 0,
        "longitude": 0,
        "description": "string"
    },
    "destination": {
        "latitude": 0,
        "longitude": 5,
        "description": "string"
    },
    "route": {
        "steps": [
            [(0, 0), (0, 1)],
            [(0, 1), (0, 2), (0, 3), (0, 5)]
        ],
        "durations": [1,2]
    },
    "intermediates": [
        {
            "latitude": 0,
            "longitude": 1,
            "description": "intermediate 1"
        }
    ],
    "departure_time": "2023-12-09T08:00:00.556Z",
    "num_seats": 4
}
test_ride_2 = {
    "label": "new ride 2",
    "origin": {
        "latitude": 0,
        "longitude": 5,
        "description": "string"
    },
    "destination": {
        "latitude": 0,
        "longitude": 0,
        "description": "string"
    },
    "route": {
        "steps": [
            [(0, 5), (0, 3), (0, 2), (0, 1), (0, 0)]
        ],
        "durations": [3]
    },
    "intermediates": [],
    "departure_time": "2023-12-09T17:30:00.556Z",
    "num_seats": 4
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