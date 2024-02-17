import threading
import os, zipfile
import glob
import shutil

_raw_backup_dir = None
_compressed_backup_dir = None

_file_lock = threading.Lock()

def init_backup_dirs(raw_backup_dir: str, compressed_backup_dir: str):
    global _raw_backup_dir, _compressed_backup_dir
    _raw_backup_dir = raw_backup_dir
    _compressed_backup_dir = compressed_backup_dir

def back_up_html_file(raw_source: str, username: str) -> int:

    _file_lock.acquire()

    save_dir = _raw_backup_dir + "/" + username

    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    files = [
        entry
        for entry in os.listdir(save_dir)
        if os.path.isfile(os.path.join(save_dir, entry))
    ]

    file_id = len(files) + 1

    fullpath = save_dir + "/" + str(file_id) + ".html"

    with open(fullpath, "w", encoding="utf-8") as f:
        f.write(raw_source)

    _file_lock.release()
    return file_id


def check_if_raw_backup_exists() -> bool:
    return os.path.exists(_raw_backup_dir)


def next_zip_num() -> int:
    return len(glob.glob1(_compressed_backup_dir + "/", "*.zip")) + 1


def compress_backups():

    if not os.path.exists(_compressed_backup_dir):
        os.makedirs(_compressed_backup_dir)

    name = _raw_backup_dir + "/"
    zip_file_name = str(next_zip_num()) + ".zip"
    zip_name = name + zip_file_name

    with zipfile.ZipFile(zip_name, "w", zipfile.ZIP_LZMA) as zip_ref:
        for folder_name, subfolders, filenames in os.walk(name):
            for filename in filenames:
                file_path = os.path.join(folder_name, filename)
                zip_ref.write(file_path, arcname=os.path.relpath(file_path, name))

    zip_ref.close()

    os.rename(zip_name, _compressed_backup_dir + "/" + zip_file_name)


def remove_backup_files():
    shutil.rmtree(_raw_backup_dir)
