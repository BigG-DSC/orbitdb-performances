import psutil
import time
import csv
    
f = open('cpus_load.csv', 'w')
writer = csv.writer(f, delimiter=';')
writer.writerow(["time","cpus_load"])

while (True):
    writer.writerow([time.strftime('%Y-%m-%d %H:%M:%S', time.localtime()), psutil.cpu_percent(interval=1, percpu=True)])