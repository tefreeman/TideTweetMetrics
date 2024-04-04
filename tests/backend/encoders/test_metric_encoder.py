import unittest
import json
from backend.encoders.metric_encoder import MetricEncoder


class TestMetricEncoder(unittest.TestCase):

    def setUp(self):
        self.encoder = MetricEncoder()

    def test_initialization(self):
        self.assertIsNone(self.encoder.get_dataset())
        self.assertEqual(self.encoder.get_dimension(), 0)

    def test_set_and_get_dataset(self):
        data = [["all time", 245], ["last three months", 100], ["last week", 20]]
        self.encoder.set_dataset(data)
        self.assertEqual(self.encoder.get_dataset(), data)


if __name__ == "__main__":
    unittest.main()
