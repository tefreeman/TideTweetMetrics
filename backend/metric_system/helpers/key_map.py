"""
This file contains the implementation of the key mapping helper functions.
The key mapping is used to create unique keys by joining multiple arguments with a hyphen.
The created keys are converted to lowercase for consistency.

The file defines the following variables:
- GLOBAL_PROFILE_NAME: A constant representing the global profile name.
- NONE_PROFILE_NAME: A constant representing the none profile name.

The file defines the following function:
- create_key: A function that creates a key by joining the arguments with a hyphen and converting it to lowercase.
"""

GLOBAL_PROFILE_NAME = "_global"
NONE_PROFILE_NAME = "_none"


def create_key(*args):
    """
    Creates a key by joining the arguments with a hyphen and converting it to lowercase.

    Args:
        *args: Variable number of string arguments.

    Returns:
        str: The created key.

    Raises:
        ValueError: If any argument is not a string.
    """
    if not all(isinstance(arg, str) for arg in args):
        raise ValueError("All arguments must be strings.")
    return ("-".join(str(arg) for arg in args)).lower()
