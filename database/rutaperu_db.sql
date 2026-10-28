-- =========================================================
-- RutaPerú - Base de datos (Sprint 1: Autenticación de Usuarios)
-- Motor: MySQL 8.x
-- =========================================================

DROP DATABASE IF EXISTS rutaperu_db;
CREATE DATABASE rutaperu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rutaperu_db;

-- ---------------------------------------------------------
-- Tabla ROL
-- ---------------------------------------------------------
CREATE TABLE rol (
    id_rol      INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol  VARCHAR(50)  NOT NULL,
    descripcion VARCHAR(150) NULL,
    estado      VARCHAR(15)  NOT NULL DEFAULT 'Activo'
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Tabla PERSONA
-- ---------------------------------------------------------
CREATE TABLE persona (
    id_persona        INT AUTO_INCREMENT PRIMARY KEY,
    nombres           VARCHAR(80)  NOT NULL,
    apellidos         VARCHAR(80)  NOT NULL,
    tipo_documento    VARCHAR(20)  NOT NULL,
    numero_documento  VARCHAR(20)  NOT NULL,
    direccion         VARCHAR(150) NULL,
    fecha_registro    DATE         NOT NULL,
    fecha_nacimiento  DATE         NULL,
    UNIQUE KEY uq_persona_documento (tipo_documento, numero_documento)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Tabla USUARIO
-- ---------------------------------------------------------
CREATE TABLE usuario (
    id_usuario      INT AUTO_INCREMENT PRIMARY KEY,
    id_persona      INT NULL,
    id_rol          INT NOT NULL,
    nombre_usuario  VARCHAR(40)  NOT NULL,
    clave           VARCHAR(255) NOT NULL,
    estado          VARCHAR(15)  NOT NULL DEFAULT 'Activo',
    fecha_creacion  DATE NOT NULL,
    UNIQUE KEY uq_usuario_nombre (nombre_usuario),
    CONSTRAINT fk_usuario_persona FOREIGN KEY (id_persona) REFERENCES persona(id_persona),
    CONSTRAINT fk_usuario_rol     FOREIGN KEY (id_rol)     REFERENCES rol(id_rol)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Tabla TELEFONO
-- ---------------------------------------------------------
CREATE TABLE telefono (
    id_telefono INT AUTO_INCREMENT PRIMARY KEY,
    id_persona  INT NOT NULL,
    numero      VARCHAR(15) NOT NULL,
    tipo        VARCHAR(20) NULL,
    CONSTRAINT fk_telefono_persona FOREIGN KEY (id_persona) REFERENCES persona(id_persona)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Tabla MODULO
-- ---------------------------------------------------------
CREATE TABLE modulo (
    id_modulo     INT AUTO_INCREMENT PRIMARY KEY,
    nombre_modulo VARCHAR(60)  NOT NULL,
    descripcion   VARCHAR(150) NULL,
    icono         VARCHAR(60)  NULL,
    orden         INT NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Tabla BITACORA
-- ---------------------------------------------------------
CREATE TABLE bitacora (
    id_bitacora    INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario     INT NOT NULL,
    accion         VARCHAR(60) NOT NULL,
    tabla_afectada VARCHAR(40) NULL,
    fecha_hora     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_origen      VARCHAR(45) NULL,
    CONSTRAINT fk_bitacora_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Tabla ACCESO
-- ---------------------------------------------------------
CREATE TABLE acceso (
    id_acceso  INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_modulo  INT NOT NULL,
    url        VARCHAR(120) NULL,
    estado     VARCHAR(15)  NOT NULL DEFAULT 'Permitido',
    fecha      DATE NOT NULL,
    CONSTRAINT fk_acceso_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_acceso_modulo  FOREIGN KEY (id_modulo)  REFERENCES modulo(id_modulo)
) ENGINE=InnoDB;

-- =========================================================
-- Datos semilla (necesarios para que el registro funcione)
-- =========================================================
INSERT INTO rol (nombre_rol, descripcion, estado) VALUES
    ('Turista',       'Usuario final que busca, compara y reserva servicios turísticos.', 'Activo'),
    ('Proveedor',     'Hoteles, agencias de tours y empresas de transporte (B2B).',        'Activo'),
    ('Administrador', 'Encargado de verificar proveedores y monitorear la plataforma.',    'Activo');

INSERT INTO modulo (nombre_modulo, descripcion, icono, orden) VALUES
    ('Autenticación', 'Registro e inicio de sesión de usuarios',          'lock',    1),
    ('Búsqueda',      'Búsqueda y filtrado de servicios turísticos',      'search',  2),
    ('Reservas',      'Reserva integral de hospedaje, tours y transporte','calendar',3);

-- =========================================================
-- Usuario de conexión para la aplicación (backend Spring Boot)
-- =========================================================
CREATE USER IF NOT EXISTS 'rutaperu_user'@'localhost' IDENTIFIED BY 'RutaPeru2026!';
GRANT ALL PRIVILEGES ON rutaperu_db.* TO 'rutaperu_user'@'localhost';
FLUSH PRIVILEGES;

-- Verificación rápida
SELECT 'Base de datos rutaperu_db creada correctamente.' AS mensaje;
SELECT * FROM rol;
SELECT * FROM modulo;

-- =========================================================
-- Sprint 2: Búsqueda y Reserva de Servicios Turísticos
-- =========================================================

-- ---------------------------------------------------------
-- Tabla PROVEEDOR (RF14: verificación por el Administrador)
-- ---------------------------------------------------------
CREATE TABLE proveedor (
    id_proveedor   INT AUTO_INCREMENT PRIMARY KEY,
    razon_social   VARCHAR(120) NOT NULL,
    ruc            VARCHAR(11)  NOT NULL,
    tipo_proveedor VARCHAR(30)  NOT NULL,
    estado         VARCHAR(20)  NOT NULL DEFAULT 'Pendiente',
    fecha_registro DATE         NOT NULL,
    UNIQUE KEY uq_proveedor_ruc (ruc)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Tabla SERVICIO (RI02)
-- ---------------------------------------------------------
CREATE TABLE servicio (
    id_servicio       INT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor      INT NOT NULL,
    nombre            VARCHAR(120)  NOT NULL,
    tipo_servicio     VARCHAR(30)   NOT NULL,
    descripcion       VARCHAR(500)  NULL,
    ubicacion         VARCHAR(120)  NOT NULL,
    precio            DECIMAL(10,2) NOT NULL,
    capacidad         INT           NOT NULL DEFAULT 1,
    estado            VARCHAR(20)   NOT NULL DEFAULT 'Publicado',
    fecha_publicacion DATE          NOT NULL,
    CONSTRAINT fk_servicio_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Tabla RESERVA (RI03 / HU.06, alcance parcial sin pago)
-- ---------------------------------------------------------
CREATE TABLE reserva (
    id_reserva            INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario            INT NOT NULL,
    id_servicio           INT NOT NULL,
    fecha_inicio          DATE NOT NULL,
    fecha_fin             DATE NULL,
    numero_participantes  INT NOT NULL DEFAULT 1,
    monto_total           DECIMAL(10,2) NOT NULL,
    estado                VARCHAR(20) NOT NULL DEFAULT 'Pendiente de pago',
    fecha_creacion        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reserva_usuario  FOREIGN KEY (id_usuario)  REFERENCES usuario(id_usuario),
    CONSTRAINT fk_reserva_servicio FOREIGN KEY (id_servicio) REFERENCES servicio(id_servicio)
) ENGINE=InnoDB;

-- =========================================================
-- Datos semilla del Sprint 2 (proveedores verificados y
-- servicios publicados, para poder probar HU.03-HU.06)
-- =========================================================
INSERT INTO proveedor (razon_social, ruc, tipo_proveedor, estado, fecha_registro) VALUES
    ('Hotel Inka Wasi SAC',            '20451236789', 'Hospedaje',  'Verificado', CURDATE()),
    ('Andes Tours Perú EIRL',          '20478912345', 'Tour',       'Verificado', CURDATE()),
    ('Transportes Nazca Express SAC',  '20498765432', 'Transporte', 'Verificado', CURDATE());

INSERT INTO servicio (id_proveedor, nombre, tipo_servicio, descripcion, ubicacion, precio, capacidad, estado, fecha_publicacion) VALUES
    ((SELECT id_proveedor FROM proveedor WHERE ruc='20451236789'), 'Habitación doble vista al valle', 'Hospedaje',
        'Habitación doble con desayuno incluido, a 10 minutos del centro histórico.', 'Cusco', 180.00, 2, 'Publicado', CURDATE()),
    ((SELECT id_proveedor FROM proveedor WHERE ruc='20451236789'), 'Suite familiar', 'Hospedaje',
        'Suite para hasta 4 personas, con sala de estar y vista panorámica.', 'Cusco', 320.00, 4, 'Publicado', CURDATE()),
    ((SELECT id_proveedor FROM proveedor WHERE ruc='20478912345'), 'Tour guiado a Machu Picchu (día completo)', 'Tour',
        'Incluye transporte, entrada y guía profesional certificado.', 'Cusco', 250.00, 10, 'Publicado', CURDATE()),
    ((SELECT id_proveedor FROM proveedor WHERE ruc='20478912345'), 'City tour Arequipa colonial', 'Tour',
        'Recorrido por el centro histórico y mirador de Yanahuara.', 'Arequipa', 80.00, 15, 'Publicado', CURDATE()),
    ((SELECT id_proveedor FROM proveedor WHERE ruc='20498765432'), 'Traslado aeropuerto - hotel (Lima)', 'Transporte',
        'Servicio privado puerta a puerta, unidad con aire acondicionado.', 'Lima', 45.00, 3, 'Publicado', CURDATE()),
    ((SELECT id_proveedor FROM proveedor WHERE ruc='20498765432'), 'Vuelo sobre las Líneas de Nazca', 'Transporte',
        'Sobrevuelo de 35 minutos sobre las principales figuras de Nazca.', 'Nazca', 150.00, 4, 'Publicado', CURDATE());

-- Verificación rápida (Sprint 2)
SELECT 'Tablas de Sprint 2 (proveedor, servicio, reserva) creadas correctamente.' AS mensaje;
SELECT * FROM proveedor;
SELECT * FROM servicio;
