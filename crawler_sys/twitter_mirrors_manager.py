# List of domain entries
from typing import List, TypedDict
import database as db
import queue


class MirrorMeta(TypedDict):
    url: str
    is_working: bool
    up_events: int
    down_events: int


class TwitterMirrorManager:
    def __init__(self) -> None:
        self._up_mirrors: queue.Queue[MirrorMeta] = queue.Queue()
        self._down_mirrors: queue.Queue[MirrorMeta] = queue.Queue()

        self.load_mirrors()

    def make_mirror_meta(self, mirror: str, is_working: bool) -> MirrorMeta:
        return {
            "url": mirror,
            "is_working": is_working,
            "up_events": 0,
            "down_events": 0,
        }

    def load_mirrors(self):
        mirrors: list[MirrorMeta] = db.get_mirrors()
        for mirror in mirrors:
            if mirror["is_working"]:
                self._up_mirrors.put(mirror)
            else:
                self._down_mirrors.put(mirror)

    def reload_bad_mirrors(self):
        print("reloading bad mirrors")
        while not self._down_mirrors.empty():
            mirror = self._down_mirrors.get()
            self._up_mirrors.put(mirror)

    def get_mirror(self) -> MirrorMeta:
        try:
            return self._up_mirrors.get(timeout=10)
        except queue.Empty:
            self.reload_bad_mirrors()
            return self._up_mirrors.get(timeout=10)

    def return_online(self, mirror: MirrorMeta):
        mirror["up_events"] += 1
        mirror["is_working"] = True
        db.save_mirror(mirror)
        self._up_mirrors.put(mirror)

    def return_offline(self, mirror: MirrorMeta):
        mirror["down_events"] += 1
        mirror["is_working"] = False
        db.save_mirror(mirror)
        self._down_mirrors.put(mirror)
