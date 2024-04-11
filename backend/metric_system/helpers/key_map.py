

GLOBAL_PROFILE_NAME = "_global"
NONE_PROFILE_NAME = "_none"


def create_key(*args):
    if not all(isinstance(arg, str) for arg in args):
        raise ValueError("All arguments must be strings.")
    return ('-'.join(str(arg) for arg in args)).lower()

