import unittest
from crawler.tests import test_example

def suite():
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # Load tests from each module
    suite.addTests(loader.loadTestsFromModule(test_example.TestSum))

    return suite

if __name__ == '__main__':
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite())
