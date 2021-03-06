import sys
import argparse
from template.app_yaml import *

parser = argparse.ArgumentParser()

model_choices = ['vgg16', 'multitask']

parser.add_argument("--model", type=str, required="True")
parser.add_argument("--cut-point", nargs="+", default=[0, -1])
parser.add_argument("--start-from", default="cloud")
parser.add_argument("--devices", nargs="+", default=['cloud', 'cloud'])
parser.add_argument("--output-layer", nargs="+", default=[-1], type=int)
parser.add_argument("--input-size", type=int, default=224)


args = parser.parse_args()

max_layer = 200

if(int(args.cut_point[-1]) > max_layer):
  print("max layer = %s" %(max_layer))
  sys.exit()

m = args.model
flag = '"--is-first"'
app = m + '-0'
d = args.start_from
c = 0
if len(args.cut_point) > 1 or len(args.output_layer) == 1:
  n = args.cut_point[0]
else:
  n = args.cut_point[0] + '", "' + '", "'.join(str(o) for o in args.output_layer) # Multiple outputs

def write():
  with open("./app/yaml/%s-svc.yaml" %(app), "w") as f:
    f.write(svc_yaml %(app, app, app))

  with open("./app/yaml/%s.yaml" %(app), "w") as f:
    f.write(app_yaml %(app, app, app, app, d, m, m, c, n, flag))

if n == '0':
  flag='--is-last'
  write()
  exit()
  
write()
flag = ''

for idx, c in enumerate(args.cut_point):
  c = int(c)+1
  app = m + '-' + str(c)
  print(app)
  if(len(args.cut_point) >1 and idx == len(args.cut_point)-2):
    app = m + '-' + str(c)
    d = args.devices[idx]
    if(args.output_layer[0] != -1):
      n = args.cut_point[idx+1] + '", "' + '", "'.join(str(o) for o in args.output_layer) # Multiple outputs
    else:
      n = args.cut_point[idx+1]
    write()
  elif(idx == len(args.cut_point)-1):
    print(args.output_layer)
    flag = '"--is-last"'

    for o in args.output_layer:
      n = o
      if(args.output_layer[0] == -1):
        app=m +'-'+ str(int(args.cut_point[-1])+1)
      else:
        app = m+'-'+str(o)
      d = args.devices[-1]
      write()
  else:
    app=m +'-'+ str(c)
    n = args.cut_point[idx+1]
    d = args.devices[idx]
    write()

  flag = ""
