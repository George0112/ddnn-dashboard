from gevent import monkey
monkey.patch_all()

import numpy as np
import json
import grequests
import requests
import time
import logging
import argparse
from tensorflow.keras.preprocessing.image import load_img
from tensorflow.keras.preprocessing.image import img_to_array
from requests_futures.sessions import FuturesSession
import io
import zlib
import pandas as pd

from concurrent.futures import as_completed
from pprint import pprint
from requests_futures.sessions import FuturesSession
from concurrent.futures import ThreadPoolExecutor


def compress_nparr(nparr):
    """
    Returns the given numpy array as compressed bytestring,
    the uncompressed and the compressed byte size.
    """
    bytestream = io.BytesIO()
    np.save(bytestream, nparr)
    uncompressed = bytestream.getvalue()
    compressed = zlib.compress(uncompressed)
    return compressed

def uncompress_nparr(bytestring):
    """
    """
    return np.load(io.BytesIO(zlib.decompress(bytestring)))

def record(res):
    print(res.text)

def response_hook(resp, *args, **kwargs):
    # parse the json storing the result on the response object
    resp.data = resp.json()
    resp.time = time.time()

parser = argparse.ArgumentParser()
parser.add_argument("--model-name", type=str, required="True")
parser.add_argument("--start-from", default="cloud")
parser.add_argument("--devices", default="cloud")
parser.add_argument("--rps", type=int, default=1)
parser.add_argument("--period", type=int, default=60)
parser.add_argument("--cut-point", type=int, default=22)
args = parser.parse_args()

results = {}

#while True:
image = load_img('./cat.jpg', target_size=(224, 224))
image = np.expand_dims(image, axis=0)
image = compress_nparr(image)
model_name = args.model_name
start_from = args.start_from
devices = args.devices
rps = args.rps
period = args.period
cut_point = args.cut_point

print(model_name, start_from, devices, rps, period, cut_point)

session = FuturesSession(executor=ThreadPoolExecutor(max_workers=200))
# averages = [] # end2end delay
# avg_predict = [] # prediction delay
# metrics = []
# part1_time = []
# part1_cpu = []
# part1_mem = []
# part2_time = []
# part2_cpu = []
# part2_mem = []
# cut_points = []

print("cut point: %d" %(cut_point))
futures = []
fail = 0
res = requests.put('http://dashboard.tesla.cs.nthu.edu.tw:32510/model', data={
    "cut_points": [cut_point], "output_points": [-1], "model": model_name, "start_from": start_from, "devices": devices
    })
print(res.text)
# while True:
start = time.time()
while(time.time() - start < period): 
  for i in range(rps):
    future = session.post('http://tesla.cs.nthu.edu.tw:32510/%s'%(model_name), data=image, hooks={'response': response_hook})
    future.i = time.time()
    futures.append(future)
    time.sleep(1/rps)

    # results = []

    # for f in as_completed(futures): 
    #     try:
    #         results.append(f.result().time-f.i)
    #     except Exception as e:
    #         fail = fail + 1
    #         continue
    # print("%s fails %d out of %d requests" %(model_name, fail, len(futures)))

    # res = json.loads(requests.get('http://dashboard.tesla.cs.nthu.edu.tw:32510/time').text)
    # for m in res:
    #     if m['name'] == model_name:
    #         avg_predict.append(m['info'])
    
    # res = json.loads(requests.get('http://dashboard.tesla.cs.nthu.edu.tw:32510/metrics').text)
    # for m in res:
    #     if m['name'] == model_name:
    #         metrics.append(m['info'])

    # if len(results)  != 0:
    #     print("average e2e time %f" % (sum(results)/len(results)))
    #     averages.append([sum(results)/len(results), len(results)])
    # else:
    #     print("all failed")
    #     averages.append(np.nan)

# print(len(metrics))
# for i, m in enumerate(metrics):
#     print(i)
#     for c in m[0]['cpu']:
#         part1_cpu.append(c)
#         cut_points.append(i)
#     for c in m[0]['memory']:
#         part1_mem.append(c)
#     if len(m) > 1:
#         for c in m[1]['cpu']:
#             part2_cpu.append(c)
#         for c in m[1]['memory']:
#             part2_mem.append(c)
#     else:
#         for i in range(len(part1_cpu)):
#             part2_cpu.append(0)
#             part2_mem.append(0)

# data = list(zip(cut_points, part1_cpu, part1_mem, part2_cpu, part2_mem))
# df = pd.DataFrame(data = data, columns=['cut_points', 'part1_cpu', 'part1_mem', 'part2_cpu', 'part2_mem'])
# df.to_csv('./vgg16_%s_%s_%d_%d_metric.csv' % (start_from, devices, rps, period))

# cut_points = []
# for i, m in enumerate(metrics):
#     for c in m[0]['time']:
#         part1_time.append(c)
#         cut_points.append(i)
#     if len(m) > 1:
#         for c in m[1]['time']:
#             part2_time.append(c)
#     else:
#         for i in range(len(part1_time)):
#             part2_time.append(0)
    
# data = list(zip(cut_points, part1_time, part2_time))
# df = pd.DataFrame(data = data, columns=['cut_points', 'part1_time', 'part2_time'])
# df.to_csv('vgg16_%s_%s_%d_%d_time.csv' % (start_from, devices, rps, period))
# avg_predict[0].append(0)
# try:
#     part1 = [n[0] for n in avg_predict]
#     part2 = [n[1] for n in avg_predict]
# except:
#     pass

# network = [n[0] - sum(avg_predict[idx]) for idx, n in enumerate(averages)]

# data = list(zip(part1, part2, network))

# df = pd.DataFrame(data = data, columns=['part1', 'part2', 'network'])
# print(df)

# df.to_csv('vgg16_%s_%s_%d_%d_avg.csv' % (start_from, devices, rps, period))
