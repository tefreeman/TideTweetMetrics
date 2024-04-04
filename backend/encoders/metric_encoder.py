import json


class MetricEncoder:
    
    def __init__(self) -> None:
        self._dataset = None
        self._dimension = 0
        
    # example data: [["all time", 245], ["last three months", 100], ["last week", 20]]
    def set_dataset(self, data: list[any]) -> None:
        if isinstance(data[0], tuple):
            self.max_dimensions = len(data[0])
        else:
            self.max_dimension = 1
            
        self._dataset = data

  
    def get_dataset(self) -> list[tuple]:
        return self._dataset
    
    def get_dimension(self) -> int:
        return self._dimension
        
    def to_json(self) -> tuple[str, str]:

        if self._dataset is None:  # No data
            raise Exception("No data has been added to the encoder")

        return json.dumps(self.get_dataset())