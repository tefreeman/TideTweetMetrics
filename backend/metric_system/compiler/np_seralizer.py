import numpy as np


# This function is used to serialize numpy objects to JSON
def numpy_json_serializer(obj):
    """
    Serializes NumPy objects to JSON.

    Args:
        obj: The object to be serialized.

    Returns:
        The serialized object.

    Raises:
        TypeError: If the object is not JSON serializable.
    """
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    else:
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")
