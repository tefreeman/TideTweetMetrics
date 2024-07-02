import os
import sys
import subprocess

def run_script(script_name):
    # Set the PYTHONPATH environment variable
    workspace_folder = os.getcwd()  # Assuming the script is run from the workspace folder
    pythonpath = os.path.join(workspace_folder, 'src')
    os.environ['PYTHONPATH'] = pythonpath

    # Command to execute the specified Python script
    command = [sys.executable, script_name]
    
    # Run the command
    result = subprocess.run(command, env=os.environ)
    
    # Check the result
    if result.returncode != 0:
        print(f"Script {script_name} exited with return code {result.returncode}")
        sys.exit(result.returncode)

if __name__ == "__main__":
    script_name = "src/backend/ai/model_server.py"
    run_script(script_name)