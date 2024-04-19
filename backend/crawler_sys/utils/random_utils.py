import time
import random


def sleep_normally_distributed(mu: float, sigma: float, min_sleep: float) -> None:
    sleep_duration = random.gauss(mu, sigma)
    sleep_duration = max(sleep_duration, max(0, min_sleep))
    time.sleep(sleep_duration)

