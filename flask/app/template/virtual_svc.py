svc = """
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: model-route
spec:
  hosts:
    - '*'
  gateways:
    - model-gateway
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