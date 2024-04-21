# Use an official Python runtime as a base image
FROM python:3.10.6-slim

# Set the working directory inside the container
WORKDIR /project

# Copy your project files to the working directory
COPY . /project

# Install any required Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Set the PYTHONPATH environment variable
ENV PYTHONPATH /project

# Define the command to run your application
CMD ["python", "generate_full_metrics.py"]
# CMD ["bash"]
