import json
import requests
from flask import request
import ast
import logging
from flask import jsonify, redirect
import os
from kubernetes import client, config
import yaml
from os import path
import string
import random
import re
from app.template.virtual_svc import *
import threading
import time

from app import app

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

try:
  config.load_incluster_config()
except:
  config.load_kube_config()
appApi = client.AppsV1Api()
coreApi = client.CoreV1Api()

def delete_deployment(api_instance, namespace, deployment_name):
  # Delete deployment
  api_response = api_instance.delete_namespaced_deployment(
    name=deployment_name,
    namespace=namespace,
    body=client.V1DeleteOptions(
      propagation_policy='Foreground',
      grace_period_seconds=5))
  print("Deployment deleted. status='%s'" % str(api_response.status))

def delete_service(api_instance, namespace, service_name):
  # Delete Service
  api_response = api_instance.delete_namespaced_service(
    name=service_name,
    namespace=namespace,
    body=client.V1DeleteOptions(
      propagation_policy='Foreground',
      grace_period_seconds=5))
  print("Service deleted. status='%s'" % str(api_response.status))

def create_deployment(api_instance, namespace, yaml_path):
  with open(yaml_path) as f:
    dep = yaml.safe_load(f)
    resp = api_instance.create_namespaced_deployment(
      body=dep, namespace=namespace)
    print("Deployment created. status='%s'" % resp.metadata.name)

def create_service(api_instance, namespace, yaml_path):
  with open(yaml_path) as f:
    dep = yaml.safe_load(f)
    resp = api_instance.create_namespaced_service(
      body=dep, namespace=namespace)
    print("Service created. status='%s'" % resp.metadata.name)

def deploy_yaml():
    # List yamls and deploy
  for y in os.listdir(path.join("app/yaml")):
    print(y)
    if 'svc' in y: 
      create_service(coreApi, 'default', path.join("app/yaml", y))
    else:
      create_deployment(appApi, 'default', path.join("app/yaml", y))

def get_models_name():
  ret = appApi.list_namespaced_deployment('default')
  names = []
  for i in ret.items:
    if i.metadata.name == 'dashboard' or not re.search(".*.....", i.metadata.name):
      continue
    elif re.search(".*-.....", i.metadata.name).group() in names:
      continue
    else:
      names.append(re.search(".*-.....", i.metadata.name).group())
  return names

def get_services():
  ret = coreApi.list_namespaced_service('default')
  return [i.metadata.name for i in ret.items]

def delete_model(model_name):
  # Delete all Deployments and Services with model_name
  ret = appApi.list_namespaced_deployment('default')
  for i in ret.items:
    if model_name in i.metadata.name:
      delete_deployment(appApi, 'default', i.metadata.name)
      print("Delete Deployment: %s" %(i.metadata.name))
  ret = coreApi.list_namespaced_service('default')
  for i in ret.items:
    if model_name in i.metadata.name:
      delete_service(coreApi, 'default', i.metadata.name)
      print("Delete Service: %s" %(i.metadata.name))

def update_virtual_svc(svc, names):
  for n in names:
    svc += match %(n[0], n[1])
  with open("./app/yaml/virtual_svc.yaml", 'w') as f:
    f.write(svc)

  with open(path.join("./app/yaml", 'virtual_svc.yaml')) as f:
    dep = yaml.safe_load(f)
    k8s_apps_v1 = client.CustomObjectsApi()
    resp = k8s_apps_v1.patch_namespaced_custom_object(
        body=dep, namespace="default", group="networking.istio.io", 
        version="v1alpha3", plural="virtualservices", name="model-route")

def get_virtual_svc():
  k8s_apps_v1 = client.CustomObjectsApi()
  resp = k8s_apps_v1.get_namespaced_custom_object(
    namespace="default", group="networking.istio.io",
    version="v1alpha3", plural="virtualservices", name="model-route")
  return [[r['match'][0]['uri']['prefix'][1:], r['route'][0]['destination']['host'][:-2]]for r in resp['spec']['http']]

def get_models_info(name=None):
  result = []
  if not name:
    names = get_models_name()
    print(names)
    for n in names:
      try:
        info = json.loads(requests.get('http://%s-0.default.svc.cluster.local:5000/info' %(n)).text)
        result.append({"name": n, "info": info, "endPoint": 'http://tesla.cs.nthu.edu.tw:32510/%s' % (n), "status": "ready"})
      except:
        result.append({"name": n, "info": [[]], "endPoint": 'http://tesla.cs.nthu.edu.tw:32510/%s'%(n), "status": "pending"})
    return result
  else:
    try:
      info = json.loads(requests.get('http://%s-0.default.svc.cluster.local:5000/info' %(name)).text)
      result.append({"name": name, "info": info, "endPoint": 'http://tesla.cs.nthu.edu.tw:32510/%s' % (name), "status": "ready"})
    except:
      result.append({"name": name, "info": [[]], "endPoint": 'http://tesla.cs.nthu.edu.tw:32510/%s'%(name), "status": "pending"})
    return result

@app.route('/names', methods=['GET'])
def names():
  return jsonify(get_models_name())
@app.route('/model', methods=['GET', 'POST', 'PUT', 'DELETE'])
def model():
  # Create new model Deployments
  if request.method=='POST':
    # Retrieve inputs
    cut_points = request.form['cut_points']
    cut_points = [int(c) for c in cut_points.split(',')]
    output_points = request.form['output_points']
    output_points = [int(o) for o in output_points.split(',')]
    model = request.form['model']
    devices = request.form['devices']
    devices = devices.split(',')
    start_from = request.form['start_from']

    # Generate new model name
    letters = string.ascii_lowercase
    model = model.split('-')[0]+'-'+''.join(random.choice(letters) for i in range(5))
    # Generate new yaml files and deploy
    cmd = "python3 app/generate_yaml.py --model %s --cut-point %s --output-layer %s --devices %s --start-from %s" % (model, 
      " ".join([str(e) for e in cut_points]),
      " ".join([str(e) for e in output_points]),
      " ".join([str(e) for e in devices]),
      start_from)
    os.system('rm app/yaml/*')
    os.system(cmd)
    deploy_yaml()

    # Update istio virtual service
    match = get_virtual_svc()
    match.append((model, model))
    update_virtual_svc(svc, match)

    return model
  elif request.method == 'PUT':
    # Retrieve inputs
    cut_points = request.form['cut_points']
    cut_points = [int(c) for c in cut_points.split(',')]
    output_points = request.form['output_points']
    output_points = [int(o) for o in output_points.split(',')]
    model = request.form['model']
    devices = request.form['devices'].split(',')
    start_from = request.form['start_from']

    # Find the old model name from virtual svc matching
    match = get_virtual_svc()
    for m in match:
      if m[0] == model:
        old_name = m[1]

    info = get_models_info(name=old_name)
    print(len(cut_points), old_name,  len(info[0]['info']))
    if len(cut_points) == len(info[0]['info'])-1:
      services = get_services()
      idx = 0
      services.sort()
      arr = part_tuple(cut_points, output_points)
      for s in services:
        if old_name in s:
          print(s)
          print(idx)
          requests.post('http://%s.default.svc.cluster.local:5000/layer' % (s), data={
            "cut_point": arr[idx][0], "next_cut_point": arr[idx][1]
          })
          idx += 1
      
      return 'success'

    # Generate new model name
    letters = string.ascii_lowercase
    new_name = model.split('-')[0]+'-'+''.join(random.choice(letters) for i in range(5))
    print("new model name: %s" % (new_name))
    print("cut_points", cut_points)

    # Generate new yaml files and deploy
    cmd = "python3 app/generate_yaml.py --model %s --cut-point %s --output-layer %s --devices %s --start-from %s" % (new_name, 
      " ".join([str(e) for e in cut_points]),
      " ".join([str(e) for e in output_points]),
      " ".join([str(e) for e in devices]),
      start_from)
    os.system('rm app/yaml/*')
    os.system(cmd)
    deploy_yaml()
    print("yaml deployed", time.time())

    for idx, m in enumerate(match):
      if match[idx][0] == model:
        match[idx][1] = new_name
    while(True):
      finish = 0
      models = get_models_info()
      for m in models:
        if m['name'] == new_name:
          if m['status'] == 'ready':
            finish = 1
      if finish:
        break
      print("waiting for new model to be ready", time.time())
      time.sleep(0.5)
    print("New model is ready", time.time())
    update_virtual_svc(svc, match)
    delete_model(old_name)
    return model
  elif request.method == 'DELETE':
    model = request.form['model']
    delete_model(model)
    return model

@app.route('/info', methods=['GET'])
def info():
  try:
    name = request.params['model']
  except:
    name=None
  print(name)
  return jsonify(get_models_info(name=name))

@app.route('/time', methods=['GET'])
def get_time():
  names = get_virtual_svc()
  result = []
  for n in names:
    try:
      info = json.loads(requests.get('http://%s-0.default.svc.cluster.local:5000/time' %(n[1])).text)
      result.append({"name": n[0], "info": info})
    except:
      print('Network error')
      result.append({"name": n[0], "info": [[]]})
  return jsonify(result)

@app.route('/metrics', methods=['GET'])
def get_metric():
  names = get_virtual_svc()
  result = []
  for n in names:
    try:
      info = json.loads(requests.get('http://%s-0.default.svc.cluster.local:5000/metrics' %(n[1])).text)
      result.append({"name": n[0], "info": info})
    except:
      print('Network error')
      result.append({"name": n[0], "info": [[]]})
  return jsonify(result)

@app.route('/', methods=['GET'])
def index():
  return redirect('/index.html')

@app.route('/test', methods=['GET'])
def test():
  print(get_virtual_svc())
  return jsonify(get_virtual_svc())

def part_tuple(cut_points, output_points):
  arr = []
  arr.append((0, cut_points[0]))
  for idx, c in enumerate(cut_points):
    start = c+1
    if(len(cut_points) >1 and idx == len(cut_points)-2):
      if(output_points[0] != -1):
        n = cut_points[idx+1] + '", "' + '", "'.join(str(o) for o in output_points) # Multiple outputs
      else:
        n = cut_points[idx+1]
    elif(idx == len(cut_points)-1):
      for o in output_points:
        n = o
    else:
      n = cut_points[idx+1]
    arr.append((start, n))
  print(arr)
  return arr