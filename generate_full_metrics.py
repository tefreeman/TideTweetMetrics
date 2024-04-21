import logging
from backend.metric_system.build import build_metrics
from backend.config import Config

# Configure logging
logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s"
)


def main():
    logging.info("Starting the metric system build process...")

    # Call the build_metric_system function to build the metric system
    build_metrics("full_metric_output.json")
    logging.info("Metrics built and output to full_metric_output.json")


if __name__ == "__main__":
    logging.info("Initializing configuration...")
    Config.init()
    main()
    logging.info("SCRIPT EXECUTION COMPLETED.")
