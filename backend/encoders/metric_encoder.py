import json

class MetricEncoder:
    
    def __init__(self, name: str="") -> None:
        self.datasets = {}
        self.axis_titles = []
        self.name = name
        
    # example data: [["all time", 245], ["last three months", 100], ["last week", 20]]
    def add_dataset(self, owner: str, data: list[tuple]) -> None:
        self.datasets[owner] = data

    def get_name(self) -> str:
        if self.name == "":
            raise Exception("No name has been set")
        return self.name
    
    def set_name(self, name: str) -> None:
        self.name = name
        
    def set_axis_titles(self, axis_titles: list[str]) -> None:
        self.axis_titles = axis_titles


    def to_json(self) -> tuple[str, str]:
        if not self.axis_titles:
            raise Exception("No axis titles have been set")
        
        # TODO add dimension/axis check

        return self.name, json.dumps(self.datasets)