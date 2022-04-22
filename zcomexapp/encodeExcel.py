import base64

excel_path = 

data = open(excel_path, 'rb').read()
base64_encoded = base64.b64encode(data).decode('UTF-8')

print(base64_encoded)