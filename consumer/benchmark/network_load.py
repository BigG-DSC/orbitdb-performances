import time
import psutil
import os
import csv

ul = 0.00
dl = 0.00
t0 = time.time()
upload = psutil.net_io_counters(pernic=True)["ens4"][0]
download = psutil.net_io_counters(pernic=True)["ens4"][1]
up_down = (upload, download)

f = open('network_load.csv', 'w')
writer = csv.writer(f, delimiter=';')
writer.writerow(["time","upload","download"])

while True:
    last_up_down = up_down
    upload = psutil.net_io_counters(pernic=True)["ens4"][0]
    download = psutil.net_io_counters(pernic=True)["ens4"][1]
    t1 = time.time()
    up_down = (upload, download)
    try:
        ul, dl = [
            (now - last) / (t1 - t0) / 1024.0
            for now, last in zip(up_down, last_up_down)
        ]
        t0 = time.time()
    except:
        pass
    if dl > 0.1 or ul >= 0.1:
        time.sleep(1)
        print("======================")
        print(" > UL: {:0.2f} kBit/s".format(ul*8))    
        print(" > DL: {:0.2f} kBit/s".format(dl*8))    
        writer.writerow([time.strftime('%Y-%m-%d %H:%M:%S', time.localtime()), ul*8, dl*8])