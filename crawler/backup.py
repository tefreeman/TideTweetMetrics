from datetime import datetime
import threading
import os
import queue
import lzma

_backup_dir = "backup_raw_data"
_file_lock = threading.Lock()


def backup_raw_data(raw_source: str, username: str) -> str:
    
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