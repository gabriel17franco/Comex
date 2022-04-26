import base64

csv_path = '/Users/luizcarloszanellamartins/Desktop/teste.csv'

data = open(csv_path, 'rb').read()
base64_encoded = base64.b64encode(data).decode('UTF-8')

print(base64_encoded)