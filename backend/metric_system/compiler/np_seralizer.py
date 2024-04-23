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
    if isinstance(obj, (np.integer, int)):
        return int(obj)
    elif isinstance(obj, (np.floating, float)):
        return round(float(obj), 6)
    elif isinstance(obj, np.ndarray):
          return [round(float(x), 6) if isinstance(x, (np.floating, float)) else x for x in obj.tolist()]
    else:
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")
