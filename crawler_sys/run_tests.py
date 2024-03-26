import unittest
if __name__ == "__main__":
    loader = unittest.TestLoader()
    start_dir = 'crawler_sys/tests/'
    suite = loader.discover(start_dir, pattern='test_tweet_encoder*.py')

    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)
