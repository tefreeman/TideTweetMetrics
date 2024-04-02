import json

class MetricEncoder:
    
    def __init__(self, name: str="") -> None:
        self.datasets = {}
        self.axis_titles = []
        self.name = name.lower()
        self.max_dimensions = 0
        
    # example data: [["all time", 245], ["last three months", 100], ["last week", 20]]
    def add_dataset(self, owner: str, data: list[tuple]) -> None:
        self.datasets[owner] = data
        self.max_dimensions = max(self.max_dimensions, len(data[0]))

    def get(self, owner: str) -> list[tuple]:
        return self.datasets[owner]
    
    def get_name(self) -> str:
        if self.name == "":
            raise Exception("No name has been set")
        return self.name
    
    def set_name(self, name: str) -> None:
        self.name = name.lower()
        
        
    def set_axis_titles(self, axis_titles: list[str]) -> None:
        self.axis_titles = [title.lower() for title in axis_titles]


    def to_json(self) -> tuple[str, str]:
        if not self.axis_titles:
            raise Exception("No axis titles have been set")
        
        if self.max_dimensions != len(self.axis_titles):
            raise Exception("Axis titles must be the same length as the data dimensions")
        
        if self.datasets == {}:  # No data
            raise Exception("No data has been added to the encoder")

        return self.name, json.dumps(self.datasets)