from backend.metric_system.build import build_metrics
from backend.config import Config


def main():
    # Call the build_metric_system function to build the metric system
    build_metrics("full_metric_output.json")

    # Perform other operations using the metric system


if __name__ == "__main__":
    Config.init()
    main()
