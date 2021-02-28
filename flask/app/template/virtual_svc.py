svc = """
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: model-route
spec:
  hosts:
    - 'tesla.cs.nthu.edu.tw'
  gateways:
    - multitask-gateway
  http:
"""
match = """
    - match:
        - uri:
            prefix: /%s
      rewrite:
        uri: /
      route:
        - destination:
            host: %s-0
            port:
              number: 5000
"""