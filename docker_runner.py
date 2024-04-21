import os
import subprocess
import tarfile
import time


def main():
    # Pull the latest MongoDB Docker image
    print("Pulling MongoDB Docker image...")
    subprocess.run(["docker", "pull", "mongo:latest"], check=True)

    # Run MongoDB container
    print("Running MongoDB container...")
    password = "your_password_here"  # Change to a secure password
    subprocess.run(
        [
            "docker",
            "run",
            "-d",
            "-p",
            "27017:27017",
            "--name",
            "ttm-mongo",
            "-e", "MONGO_INITDB_ROOT_USERNAME=Admin",  # Default admin username
            "-e", f"MONGO_INITDB_ROOT_PASSWORD={password}",  # Default admin password
            "mongo:latest",
            "--auth"
        ],
        check=True,
    )

    # Verify container is running
    print("Verifying MongoDB container is running...")
    subprocess.run(["docker", "ps"], check=True)

    # Extract the MongoDB dump
    print("Extracting MongoDB dump...")
    with tarfile.open("mongodb_dump.tar.gz", "r:gz") as tar:
        tar.extractall(path="extracted_dump")

    # Copy the extracted dump to the Docker container
    print("Copying dump to MongoDB container...")
    subprocess.run(["docker", "cp", "extracted_dump/mongodb_dump", "ttm-mongo:/mongo"], check=True)

    # Give MongoDB time to initialize
    print("Waiting for MongoDB to initialize...")
    time.sleep(10)

    # Open MongoDB shell to create a user
    # print("Creating MongoDB user...")
    # password = "your_password_here"  # Change to a secure password
    # commands = [
    #     "use admin",
    #     f"db.createUser({{user: 'Admin', pwd: '{password}', roles: [{{role: 'root, db: 'admin'}}]}})",
    # ]
    # command = "; ".join(commands)
    # subprocess.run(
    #     ["docker", "exec", "-it", "ttm-mongo", "mongosh", "-eval", command], check=True
    # )

    # Restore the database
    print("Restoring the database...")
    restore_command = [
        "docker", "exec", "ttm-mongo", 
        "mongorestore",
        "--authenticationDatabase", "admin",
        "--username", "Admin",
        "--password", "your_password_here",
        "--host", "localhost",
        "/mongo"
    ]
    try:
        subprocess.run(restore_command, check=True)
    except subprocess.CalledProcessError as e:
        print("Warning: mongorestore completed but exited with:", e.returncode)
        print("Output was:", e.output)

    # Verify restoration
    print("Checking restored databases...")
    restore_command = [
        "docker", "exec", "ttm-mongo", "mongosh",
        "--username", "Admin",
        "--password", password,
        "--authenticationDatabase", "admin",
        "--eval", "show dbs"
    ]
    subprocess.run(restore_command, check=True)

    # Build and run project in Docker
    print("Building project containers...")
    subprocess.run(["docker-compose", "build"], check=True)

    print("Creating metric network...")
    subprocess.run(["docker", "network", "create", "metric-network"])

    print("Connecting MongoDB to metric network...")
    subprocess.run(["docker", "network", "connect", "metric-network", "ttm-mongo"])

    print("Running project containers...")
    subprocess.run(["docker-compose", "up", "-d"], check=True)


if __name__ == "__main__":
    main()
