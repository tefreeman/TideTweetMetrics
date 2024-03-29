import json

class MetricEncoder:
    
    def __init__(self) -> None:
        self.datasets = {}


    # example data: [["all time", 245], ["last three months", 100], ["last week", 20]]
    def add_dataset(self, owner: str, dataset_id: int, data: list[list]) -> None:
        if dataset_id in self.datasets:
            raise Exception(f"{dataset_id} is already being used as a dataset_id in the encoder. Use update_dataset to override it.")
        
        self.datasets[dataset_id] = {
            "owner": owner,
            "data": data
        }
        return


    def update_dataset(self, dataset_id: int, owner: str = None, data: list[list] = None) -> None:
        if dataset_id not in self.datasets:
            raise Exception(f"Could not find dataset with dataset_id={dataset_id}. Use add_dataset to add it.")
        
        if owner != None:
            self.datasets[dataset_id]["owner"] = owner
        if data != None:
            self.datasets[dataset_id]["data"] = data
        return


    def remove_dataset(self, dataset_id: int) -> None:
        if dataset_id not in self.datasets:
            raise Exception(f"Could not find dataset with dataset_id={dataset_id}.")
        
        del self.datasets[dataset_id]
        return


    def set_axis_titles(self, axis_titles: list[str]) -> None:
        self.axis_titles = axis_titles
        return


    def to_json(self) -> str:
        if not self.axis_titles:
            raise Exception("No axis titles have been set")
        
        dimension = len(self.axis_titles)
        for id in self.datasets:
            for value in self.datasets[id]:
                if len(value) != dimension:
                    raise Exception(f"Dimensions of axis titles and data do not match. Check dataset with dataset_id={id}")

        return json.dumps(self.datasets)