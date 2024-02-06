import unittest
from crawler.tests import test_example

if __name__ == "__main__":
    loader = unittest.TestLoader()
    start_dir = 'crawler/tests/'
    suite = loader.discover(start_dir, pattern='test_*.py')

    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)
