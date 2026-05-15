---
name: security-automation
description: Habilidades profesionales y metodologías para la automatización de seguridad
version: 1.0.0
---

# Automatización de seguridad

## Descripción general

La automatización de seguridad es un medio importante para mejorar la eficiencia de las operaciones de seguridad. Esta habilidad proporciona métodos, herramientas y mejores prácticas para la automatización de seguridad.

## Escenarios de automatización

### 1. Escaneo de vulnerabilidades

**Escaneo automatizado:**
- Escaneo periódico
- Integración CI/CD
- Análisis de resultados
- Generación de informes

### 2. Pruebas de seguridad

**Pruebas automatizadas:**
- Pruebas unitarias
- Pruebas de integración
- Pruebas de seguridad
- Pruebas de regresión

### 3. Respuesta a incidentes

**Respuesta automatizada:**
- Detección de incidentes
- Contención automática
- Notificación y alertas
- Recopilación de evidencia

### 4. Verificación de cumplimiento

**Cumplimiento automatizado:**
- Verificación de configuración
- Validación de políticas
- Generación de informes
- Sugerencias de remediación

## Herramientas y frameworks

### Automatización de escaneo de vulnerabilidades

**Uso de la API de Nessus:**
```python
import requests

# Crear escaneo
def create_scan(target, scan_name):
    url = "https://nessus:8834/scans"
    headers = {"X-ApiKeys": "access_key:secret_key"}
    data = {
        "uuid": "template-uuid",
        "settings": {
            "name": scan_name,
            "text_targets": target
        }
    }
    response = requests.post(url, json=data, headers=headers)
    return response.json()

# Iniciar escaneo
def launch_scan(scan_id):
    url = f"https://nessus:8834/scans/{scan_id}/launch"
    headers = {"X-ApiKeys": "access_key:secret_key"}
    response = requests.post(url, headers=headers)
    return response.json()
```

**Uso de la API de OpenVAS:**
```python
from gvm.connections import UnixSocketConnection
from gvm.protocols.gmp import Gmp

# Conectar a OpenVAS
connection = UnixSocketConnection()
gmp = Gmp(connection)
gmp.authenticate('username', 'password')

# Crear tarea de escaneo
target = gmp.create_target(name='target', hosts=['192.168.1.0/24'])
config = gmp.get_configs()[0]
scanner = gmp.get_scanners()[0]

task = gmp.create_task(
    name='scan_task',
    config_id=config['id'],
    target_id=target['id'],
    scanner_id=scanner['id']
)

# Iniciar escaneo
gmp.start_task(task['id'])
```

### Integración CI/CD

**Jenkins Pipeline:**
```groovy
pipeline {
    agent any
    stages {
        stage('Security Scan') {
            steps {
                sh 'npm audit'
                sh 'snyk test'
                sh 'sonar-scanner'
            }
        }
        stage('Vulnerability Scan') {
            steps {
                sh 'nmap --script vuln target'
            }
        }
    }
    post {
        always {
            publishHTML([
                reportDir: 'reports',
                reportFiles: 'report.html',
                reportName: 'Security Report'
            ])
        }
    }
}
```

**GitHub Actions:**
```yaml
name: Security Scan

on: [push, pull_request]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      - name: Run SonarQube
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Automatización de pruebas de seguridad

**Uso de OWASP ZAP:**
```python
from zapv2 import ZAPv2

# Iniciar ZAP
zap = ZAPv2(proxies={'http': 'http://127.0.0.1:8080'})

# Iniciar escaneo
zap.urlopen('http://target.com')
zap.spider.scan('http://target.com')
while int(zap.spider.status()) < 100:
    time.sleep(1)

# Escaneo activo
zap.ascan.scan('http://target.com')
while int(zap.ascan.status()) < 100:
    time.sleep(1)

# Obtener resultados
alerts = zap.core.alerts()
```

**Uso de Burp Suite:**
```python
from burp import IBurpExtender, IScannerCheck

class BurpExtender(IBurpExtender, IScannerCheck):
    def registerExtenderCallbacks(self, callbacks):
        self._callbacks = callbacks
        self._helpers = callbacks.getHelpers()
        callbacks.setExtensionName("Security Automation")
        callbacks.registerScannerCheck(self)
    
    def doPassiveScan(self, baseRequestResponse):
        # Lógica de escaneo pasivo
        return None
    
    def doActiveScan(self, baseRequestResponse, insertionPoint):
        # Lógica de escaneo activo
        return None
```

### Automatización de respuesta a incidentes

**Uso de Splunk:**
```python
import splunklib.client as client

# Conectar a Splunk
service = client.connect(
    host='splunk.example.com',
    port=8089,
    username='admin',
    password='password'
)

# Buscar eventos de seguridad
search_query = 'index=security event_type="malware"'
kwargs = {"earliest_time": "-1h", "latest_time": "now"}
search = service.jobs.create(search_query, **kwargs)

# Procesar resultados
for result in search:
    if result['severity'] == 'high':
        # Respuesta automática
        send_alert(result)
        isolate_system(result['host'])
```

**Uso de ELK Stack:**
```python
from elasticsearch import Elasticsearch

# Conectar a Elasticsearch
es = Elasticsearch(['localhost:9200'])

# Buscar eventos de seguridad
query = {
    "query": {
        "match": {
            "event_type": "intrusion"
        }
    }
}

results = es.search(index="security", body=query)

# Respuesta automática
for hit in results['hits']['hits']:
    if hit['_source']['severity'] == 'critical':
        # Contención automática
        block_ip(hit['_source']['src_ip'])
        send_alert(hit['_source'])
```

## Scripts de automatización

### Script de escaneo de vulnerabilidades

```python
#!/usr/bin/env python3
import subprocess
import json
import smtplib
from email.mime.text import MIMEText

def run_nmap_scan(target):
    """Ejecutar escaneo de Nmap"""
    result = subprocess.run(
        ['nmap', '--script', 'vuln', '-oJ', '-', target],
        capture_output=True,
        text=True
    )
    return json.loads(result.stdout)

def analyze_results(results):
    """Analizar resultados del escaneo"""
    vulnerabilities = []
    for host in results.get('hosts', []):
        for port in host.get('ports', []):
            for script in port.get('scripts', []):
                if script.get('id') == 'vuln':
                    vulnerabilities.append({
                        'host': host['address'],
                        'port': port['portid'],
                        'vuln': script.get('output', '')
                    })
    return vulnerabilities

def send_report(vulnerabilities):
    """Enviar informe"""
    if vulnerabilities:
        msg = MIMEText(f"Se encontraron {len(vulnerabilities)} vulnerabilidades")
        msg['Subject'] = 'Informe de escaneo de vulnerabilidades'
        msg['From'] = 'security@example.com'
        msg['To'] = 'admin@example.com'
        
        server = smtplib.SMTP('smtp.example.com')
        server.send_message(msg)
        server.quit()

if __name__ == '__main__':
    target = '192.168.1.0/24'
    results = run_nmap_scan(target)
    vulnerabilities = analyze_results(results)
    send_report(vulnerabilities)
```

### Script de verificación de configuración

```python
#!/usr/bin/env python3
import boto3
import json

def check_s3_buckets():
    """Verificar configuración de seguridad de buckets S3"""
    s3 = boto3.client('s3')
    buckets = s3.list_buckets()
    
    issues = []
    for bucket in buckets['Buckets']:
        # Verificar acceso público
        try:
            acl = s3.get_bucket_acl(Bucket=bucket['Name'])
            for grant in acl.get('Grants', []):
                if grant.get('Grantee', {}).get('URI') == 'http://acs.amazonaws.com/groups/global/AllUsers':
                    issues.append({
                        'bucket': bucket['Name'],
                        'issue': 'Public access enabled'
                    })
        except:
            pass
        
        # Verificar cifrado
        try:
            encryption = s3.get_bucket_encryption(Bucket=bucket['Name'])
        except:
            issues.append({
                'bucket': bucket['Name'],
                'issue': 'Encryption not enabled'
            })
    
    return issues

if __name__ == '__main__':
    issues = check_s3_buckets()
    print(json.dumps(issues, indent=2))
```

## Mejores prácticas

### 1. Estrategia de automatización

- Identificar escenarios automatizables
- Desarrollar un plan de automatización
- Implementar gradualmente
- Mejora continua

### 2. Selección de herramientas

- Evaluar la funcionalidad de la herramienta
- Considerar la integración
- Considerar el costo
- Probar y validar

### 3. Diseño de procesos

- Aclarar los pasos del proceso
- Definir condiciones de activación
- Configurar el manejo de excepciones
- Registrar logs de operaciones

### 4. Monitoreo y mantenimiento

- Monitorear tareas automatizadas
- Revisar resultados periódicamente
- Actualizar reglas y scripts
- Optimizar el rendimiento

## Consideraciones

- Asegurar la precisión de la automatización
- Configurar permisos adecuados
- Proteger las credenciales de automatización
- Revisar periódicamente las reglas de automatización