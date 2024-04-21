import os
import subprocess
import tarfile


def main():
    # Pull the latest MongoDB Docker image
    print("Pulling MongoDB Docker image...")
    subprocess.run(["docker", "pull", "mongo:latest"], check=True)

    # Run MongoDB container
    print("Running MongoDB container...")
    subprocess.run(
        [
            "docker",
            "run",
            "-d",
            "-p",
            "27017:27017",
            "--name",
            "ttm-mongo",
            "mongo:latest",
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
    subprocess.run(["docker", "cp", "extracted_dump", "ttm-mongo:/mongo"], check=True)

    # Open MongoDB shell to create a user
    print("Creating MongoDB user...")
    password = "your_password_here"  # Change to a secure password
    commands = [
        "use admin",
        f"db.createUser({{user: 'Admin', pwd: '{password}', roles: ['root']}})",
    ]
    command = "; ".join(commands)
    subprocess.run(
        ["docker", "exec", "-it", "ttm-mongo", "mongosh", "-eval", command], check=True
    )

    # Restore the database
    print("Restoring the database...")
    restore_command = f"mongorestore --authenticationDatabase admin --username Admin --password {password} --host localhost /mongo"
    subprocess.run(["docker", "exec", "-it", "ttm-mongo", restore_command], shell=True)

    # Verify restoration
    print("Checking restored databases...")
    subprocess.run(
        ["docker", "exec", "-it", "ttm-mongo", "mongosh", "-eval", "show dbs"],
        check=True,
    )

    # Build and run project in Docker
    print("Building project containers...")
    subprocess.run(["docker-compose", "build"], check=True)

    print("Running project containers...")
    subprocess.run(["docker-compose", "up", "-d"], check=True)


if __name__ == "__main__":
    main()
