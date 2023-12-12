import pytest

test_request_1 = {
    "time": "2023-12-08T02:56:46.252Z",
    "origin": {
        "latitude": -0.0025,
        "longitude": 0.0015,
        "description": "C",
    },
    "destination": {
        "latitude": -0.006,
        "longitude": 0.004,
        "description": "D",
    },
    "num_passengers": 1,
}
test_request_2 = {
    "time": "2023-12-08T02:57:46.252Z",
    "origin": {
        "latitude": -0.0025,
        "longitude": 0.0015,
        "description": "C",
    },
    "destination": {
        "latitude": -0.006,
        "longitude": 0.004,
        "description": "D",
    },
    "num_passengers": 1,
}


@pytest.fixture
def request_datas():
    return [test_request_1, test_request_2]

@pytest.fixture
def request_data_1():
    return test_request_1

@pytest.fixture
def request_data_2():
    return test_request_2