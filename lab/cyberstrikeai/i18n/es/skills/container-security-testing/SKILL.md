---
name: container-security-testing
description: Habilidades profesionales y metodología para pruebas de seguridad en contenedores
version: 1.0.0
---

# Pruebas de seguridad en contenedores

## Resumen

Las pruebas de seguridad en contenedores son una parte importante para garantizar la seguridad de las aplicaciones en contenedores. Esta habilidad proporciona métodos, herramientas y mejores prácticas para pruebas de seguridad en contenedores, cubriendo tecnologías de contenedores como Docker y Kubernetes.

## Alcance de las pruebas

### 1. Seguridad de imágenes

**Elementos de verificación:**
- Vulnerabilidades en la imagen base
- Vulnerabilidades en paquetes de dependencias
- Configuración de la imagen
- Información sensible

### 2. Seguridad en tiempo de ejecución

**Elementos de verificación:**
- Permisos del contenedor
- Límites de recursos
- Aislamiento de red
- Sistema de archivos

### 3. Seguridad de orquestación

**Elementos de verificación:**
- Configuración de Kubernetes
- Cuentas de servicio
- RBAC
- Políticas de red

## Pruebas de seguridad en Docker

### Escaneo de imágenes

**Uso de Trivy:**
```bash
# Escanear imagen
trivy image nginx:latest

# Escanear imagen local
trivy image --input nginx.tar

# Mostrar solo vulnerabilidades de riesgo alto y crítico
trivy image --severity HIGH,CRITICAL nginx:latest
```

**Uso de Clair:**
```bash
# Iniciar Clair
docker run -d --name clair clair:latest

# Escanear imagen
clair-scanner --ip 192.168.1.100 nginx:latest
```

**Uso de Docker Bench:**
```bash
# Ejecutar pruebas de referencia de seguridad de Docker
docker run --rm --net host --pid host --userns host --cap-add audit_control \
  -e DOCKER_CONTENT_TRUST=$DOCKER_CONTENT_TRUST \
  -v /etc:/etc:ro \
  -v /usr/bin/containerd:/usr/bin/containerd:ro \
  -v /usr/bin/runc:/usr/bin/runc:ro \
  -v /usr/lib/systemd:/usr/lib/systemd:ro \
  -v /var/lib:/var/lib:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --label docker_bench_security \
  docker/docker-bench-security
```

### Verificación de configuración de contenedores

**Verificar Dockerfile:**
```dockerfile
# Ejemplo de problemas de seguridad
FROM ubuntu:latest  # Uso de la etiqueta latest
RUN apt-get update && apt-get install -y curl  # Versión no especificada
COPY . /app  # Puede contener archivos sensibles
ENV PASSWORD=secret  # Contraseña codificada de forma rígida (hardcoded)
USER root  # Uso del usuario root
```

**Mejores prácticas de seguridad:**
```dockerfile
# Usar una versión específica
FROM ubuntu:20.04

# Especificar la versión del paquete
RUN apt-get update && apt-get install -y curl=7.68.0-1ubuntu2.7

# Usar un usuario no root
RUN useradd -m appuser
USER appuser

# Minimizar la imagen
FROM alpine:3.15

# Construcción en múltiples etapas
FROM golang:1.18 AS builder
WORKDIR /app
COPY . .
RUN go build -o app

FROM alpine:3.15
COPY --from=builder /app/app /app
```

### Verificaciones en tiempo de ejecución

**Verificar permisos del contenedor:**
```bash
# Verificar contenedores privilegiados
docker ps --filter "label=privileged=true"

# Verificar directorios del host montados
docker inspect container_name | grep -A 10 Mounts

# Verificar la red del contenedor
docker network inspect network_name
```

**Verificar límites de recursos:**
```bash
# Verificar límite de memoria
docker stats container_name

# Verificar límite de CPU
docker inspect container_name | grep -i cpu
```

## Pruebas de seguridad en Kubernetes

### Verificación de configuración

**Uso de kube-bench:**
```bash
# Ejecutar kube-bench
kube-bench run

# Verificar un benchmark específico
kube-bench run --targets master,node,etcd
```

**Uso de kube-hunter:**
```bash
# Ejecutar kube-hunter
kube-hunter --remote target-ip

# Modo activo
kube-hunter --active
```

### Seguridad de Pods

**Verificar políticas de seguridad de Pods:**
```yaml
# Configuración de Pod insegura
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: app
    image: nginx
    securityContext:
      privileged: true  # Modo privilegiado
      runAsUser: 0  # Usuario root
```

**Configuración segura:**
```yaml
apiVersion: v1
kind: Pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
  containers:
  - name: app
    image: nginx
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
        add:
        - NET_BIND_SERVICE
```

### Verificación de RBAC

**Verificar permisos de roles:**
```bash
# Listar todos los roles
kubectl get roles --all-namespaces

# Verificar enlaces de roles (rolebindings)
kubectl get rolebindings --all-namespaces

# Verificar roles del clúster (clusterroles)
kubectl get clusterroles

# Verificar permisos de usuario
kubectl auth can-i --list --as=system:serviceaccount:default:sa-name
```

**Problemas comunes:**
- Permisos excesivos
- Roles no utilizados
- Cuentas de servicio no utilizadas

### Políticas de red

**Verificar políticas de red:**
```bash
# Listar todas las políticas de red
kubectl get networkpolicies --all-namespaces

# Verificar la configuración de una política de red
kubectl describe networkpolicy policy-name -n namespace
```

**Ejemplo de política de red:**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

## Uso de herramientas

### Falco

**Monitoreo de seguridad en tiempo de ejecución:**
```bash
# Instalar Falco
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm install falco falcosecurity/falco

# Verificar reglas
falco -r /etc/falco/rules.d/
```

### Aqua Security

```bash
# Escanear imagen
aqua image scan nginx:latest

# Escanear clúster de Kubernetes
aqua k8s scan
```

### Snyk

```bash
# Escanear Dockerfile
snyk test --docker nginx:latest

# Escanear configuración de Kubernetes
snyk iac test k8s/
```

## Lista de verificación de pruebas

### Seguridad de imágenes
- [ ] Escanear vulnerabilidades en la imagen base
- [ ] Escanear vulnerabilidades en paquetes de dependencias
- [ ] Verificar la configuración del Dockerfile
- [ ] Verificar fugas de información sensible

### Seguridad en tiempo de ejecución
- [ ] Verificar permisos del contenedor
- [ ] Verificar límites de recursos
- [ ] Verificar aislamiento de red
- [ ] Verificar montajes del sistema de archivos

### Seguridad de orquestación
- [ ] Verificar configuración de Kubernetes
- [ ] Verificar configuración de RBAC
- [ ] Verificar políticas de red
- [ ] Verificar políticas de seguridad de Pods

## Problemas de seguridad comunes

### 1. Vulnerabilidades en imágenes

**Problema:**
- La imagen base contiene vulnerabilidades
- Los paquetes de dependencias contienen vulnerabilidades
- No se actualizan a tiempo

**Solución:**
- Escanear imágenes regularmente
- Actualizar la imagen base a tiempo
- Usar imágenes minimizadas

### 2. Permisos excesivos

**Problema:**
- El contenedor se ejecuta como root
- Modo privilegiado
- Montaje de directorios sensibles

**Solución:**
- Usar un usuario no root
- Deshabilitar el modo privilegiado
- Limitar el acceso al sistema de archivos

### 3. Errores de configuración

**Problema:**
- La configuración predeterminada es insegura
- Faltan políticas de red
- Configuración de RBAC incorrecta

**Solución:**
- Seguir las mejores prácticas de seguridad
- Implementar políticas de red
- Configurar RBAC correctamente

### 4. Fuga de información sensible

**Problema:**
- La imagen contiene claves
- Variables de entorno expuestas
- Fuga de archivos de configuración

**Solución:**
- Usar gestión de claves
- Evitar codificación rígida (hardcoding)
- Usar objetos Secret

## Mejores prácticas

### 1. Seguridad de imágenes

- Usar imágenes base oficiales
- Actualizar imágenes regularmente
- Escanear vulnerabilidades en imágenes
- Minimizar el tamaño de la imagen

### 2. Seguridad en tiempo de ejecución

- Usar un usuario no root
- Limitar los permisos del contenedor
- Implementar límites de recursos
- Habilitar contextos de seguridad

### 3. Seguridad de orquestación

- Configurar políticas de red
- Implementar RBAC
- Usar políticas de seguridad de Pods
- Habilitar registros de auditoría

## Consideraciones

- Realizar pruebas solo en entornos autorizados
- Evitar afectar el entorno de producción
- Prestar atención a las diferencias entre plataformas de contenedores
- Realizar escaneos de seguridad regularmente