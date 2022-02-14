import os
import shutil
from collections import defaultdict
from datetime import datetime


def sort_files(dir):
    """
    sort files in the given directory by month
    today's file is left untouched
    :param dir:
    :return:
    """
    today_name = f"{datetime.today().strftime('%Y-%m-%d')}.md"
    files = defaultdict(list)
    with os.scandir(dir) as entries:
        for entry in entries:
            if entry.is_file() and entry.name != today_name:
                dir_name = entry.name[:entry.name.rfind('-')]
                dir_path = os.path.join(os.path.dirname(entry), dir_name)
                files[dir_path].append(entry.path)
    return files


def move_files(files: dict):
    for d, fs in files.items():
        os.makedirs(d, exist_ok=True)
        for f in fs:
            shutil.move(f, d)


if __name__ == '__main__':
    move_files(sort_files("./archives"))
