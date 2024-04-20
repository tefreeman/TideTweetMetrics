import time
import random


def sleep_normally_distributed(mu: float, sigma: float, min_sleep: float) -> None:
    """
    Sleeps for a duration randomly chosen from a normal distribution.

    Args:
        mu (float): The mean of the normal distribution.
        sigma (float): The standard deviation of the normal distribution.
        min_sleep (float): The minimum sleep duration.

    Returns:
        None
    """
    sleep_duration = random.gauss(mu, sigma)
    sleep_duration = max(sleep_duration, max(0, min_sleep))
    time.sleep(sleep_duration)
