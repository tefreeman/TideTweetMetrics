import unittest

# import example
# Notice you cannot run file directly now
from crawler_sys.utils.cache import ProfileUpdateCache


class TestSum(unittest.TestCase):

    def test_sum(self):
        self.assertEqual(sum([1, 2, 3]), 6, "Should be 6")

    def test_sum_tuple(self):
        self.assertEqual(sum((1, 2, 2)), 6, "Should be 6")


if __name__ == "__main__":
    unittest.main()
