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
    print("deployment name: %s" %(i.metadata.name))
    if i.metadata.name == 'dashboard' or not re.search(".*.....", i.metadata.name):
      continue
    elif re.search(".*-.....", i.metadata.name).group() in names:
      continue
    else:
      names.append(re.search(".*-.....", i.metadata.name).group())
  
  return names

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
      print("Delete Servuce: %s" %(i.metadata.name))

def update_virtual_svc(svc):
  names = get_models_name()
  for n in names:
    svc += match %(n, n)
  with open("./app/yaml/virtual_svc.yaml", 'w') as f:
    f.write(svc)

  with open(path.join("./app/yaml", 'virtual_svc.yaml')) as f:
    dep = yaml.safe_load(f)
    k8s_apps_v1 = client.CustomObjectsApi()
    resp = k8s_apps_v1.patch_namespaced_custom_object(
        body=dep, namespace="default", group="networking.istio.io", 
        version="v1alpha3", plural="virtualservices", name="model-route")

@app.route('/names', methods=['GET'])
def names():
  return jsonify(get_models_name())
@app.route('/model', methods=['GET', 'POST', 'PUT', 'DELETE'])
def model():
  # Create new model Deployments
  if request.method=='POST':
    # Retrieve inputs
    cut_points = request.form['cut_points']
    cut_points = ast.literal_eval(cut_points)
    if(isinstance(cut_points, int)):
      cut_points = [cut_points]
    output_points = request.form['output_points']
    output_points = ast.literal_eval(output_points)
    if(isinstance(output_points, int)):
      output_points = [output_points]
    model = request.form['model']
    # Generate new model name
    letters = string.ascii_lowercase
    model = model.split('-')[0]+'-'+''.join(random.choice(letters) for i in range(5))
    # Generate new yaml files and deploy
    cmd = "python3 app/generate_yaml.py --model " + model + " --cut-point " + " ".join([str(e) for e in cut_points]) + " --output-layer  " + " ".join([str(e) for e in output_points])
    os.system('rm app/yaml/*')
    os.system(cmd)
    deploy_yaml()

    # Update istio virtual service
    update_virtual_svc(svc)

    return model
  elif request.method == 'PUT':
    # Retrieve inputs
    cut_points = request.form['cut_points']
    cut_points = ast.literal_eval(cut_points)
    if(isinstance(cut_points, int)):
      cut_points = [cut_points]
    output_points = request.form['output_points']
    output_points = ast.literal_eval(output_points)
    if(isinstance(output_points, int)):
      output_points = [output_points]
    model = request.form['model']
    print(cut_points, output_points, model)
    # Delete original Deployments and Services
    delete_model(model)
    # Generate new model name
    letters = string.ascii_lowercase
    model = model.split('-')[0]+'-'+''.join(random.choice(letters) for i in range(5))
    print("model name: %s" % (model)) 
    # Generate new yaml files and deploy
    cmd = "python3 app/generate_yaml.py --model " + model + " --cut-point " + " ".join([str(e) for e in cut_points]) + " --output-layer  " + " ".join([str(e) for e in output_points])
    os.system('rm app/yaml/*')
    os.system(cmd)

    deploy_yaml()
    update_virtual_svc(svc)

    return model
  elif request.method == 'DELETE':
    model = request.form['model']
    delete_model(model)
    return model

@app.route('/info', methods=['GET'])
def info():
  names = get_models_name()
  print(names)
  result = []
  for n in names:
    try:
      info = json.loads(requests.get('http://%s-0.default.svc.cluster.local:5000/info' %(n)).text)
      # cuttable = json.loads(requests.get('http://%s-0.default.svc.cluster.local:5000/cuttable' %(n)).text)
      result.append({"name": n, "info": info, "endPoint": 'http://tesla.cs.nthu.edu.tw:32510/%s' % (n), "status": "ready"})
    except:
      result.append({"name": n, "info": [[]], "endPoint": 'http://tesla.cs.nthu.edu.tw:32510/%s'%(n), "status": "pending"})
  return jsonify(result)

@app.route('/time', methods=['GET'])
def time():
  names = get_models_name()
  print('time', names)
  result = []
  for n in names:
    try:
      info = json.loads(requests.get('http://%s-0.default.svc.cluster.local:5000/time' %(n)).text)
      print(info)
      result.append({"name": n, "info": info})
    except:
      print('Network error')
      result.append({"name": n, "info": [[]]})
  return jsonify(result)

@app.route('/', methods=['GET'])
def index():
  return redirect('/index.html')


import io
import zlib
import numpy as np
def uncompress_nparr(bytestring):
    """
    """
    return np.load(io.BytesIO(zlib.decompress(bytestring)))

@app.route('/test', methods=['POST'])
def test():
    data = request.get_data()
    print(uncompress_nparr(data).shape)

    return "test"