import json

class MetricEncoder:
    
    def __init__(self) -> None:
        self.datasets = {}
        self.axis_titles = []
    
    # example data: [["all time", 245], ["last three months", 100], ["last week", 20]]
    def add_dataset(self, owner: str, data: list[tuple]) -> None:
        self.datasets[owner] = data

    def set_axis_titles(self, axis_titles: list[str]) -> None:
        self.axis_titles = axis_titles


    def to_json(self) -> str:
        if not self.axis_titles:
            raise Exception("No axis titles have been set")
        
        # TODO add dimension/axis check

        return json.dumps(self.datasets)