from datetime import datetime
import threading
import os, zipfile
import queue
import lzma
import glob
import shutil


_backup_dir = "backup_raw_data"
_file_lock = threading.Lock()

def back_up_html_file(raw_source: str, username: str) -> int:
    
    _file_lock.acquire()
       
    save_dir = _backup_dir + "/" + username
    
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
    
    # Not the best way to do this, but it works for now
    files = [entry for entry in os.listdir(save_dir) if os.path.isfile(os.path.join(save_dir, entry))]

    # TODO: Compress the files if we have too many using lzma
    # may need to transform into a class to handle this
    
    file_id = len(files) + 1
    
    fullpath = save_dir + "/" + str(file_id) + ".html"
    
    with open(fullpath, "w", encoding="utf-8") as f:
        f.write(raw_source)

    _file_lock.release()
    return file_id


def next_zip_num() -> int:
    return len(glob.glob1("backups/","*.zip")) + 1

def compress_backups():
    name = 'backup_raw_data/'
    zip_file_name = str(next_zip_num()) + '.zip'
    zip_name = name + zip_file_name

    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_LZMA) as zip_ref:
        for folder_name, subfolders, filenames in os.walk(name):
            for filename in filenames:
                file_path = os.path.join(folder_name, filename)
                zip_ref.write(file_path, arcname=os.path.relpath(file_path, name))

    zip_ref.close()
    
    os.rename(zip_name, 'backups/' + zip_file_name)


def delete_raw_data():
    shutil.rmtree(_backup_dir)
                      