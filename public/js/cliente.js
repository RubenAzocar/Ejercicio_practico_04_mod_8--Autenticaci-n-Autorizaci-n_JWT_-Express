const claveToken = "tokenJwtDemo";

const formularioRegistro = document.getElementById("formularioRegistro");
const formularioLogin = document.getElementById("formularioLogin");
const campoToken = document.getElementById("tokenJwt");
const salidaRespuesta = document.getElementById("salidaRespuesta");
const botonPerfil = document.getElementById("botonPerfil");
const botonAdmin = document.getElementById("botonAdmin");
const botonGuardarToken = document.getElementById("botonGuardarToken");
const botonLimpiarToken = document.getElementById("botonLimpiarToken");
const botonLimpiarConsola = document.getElementById("botonLimpiarConsola");

function obtenerHoraActual() {
    return new Date().toLocaleTimeString("es-CL", { hour12: false });
}

function escribirLinea(texto) {
    const lineaNueva = `[${obtenerHoraActual()}] ${texto}`;
    salidaRespuesta.textContent = salidaRespuesta.textContent
        ? `${salidaRespuesta.textContent}\n${lineaNueva}`
        : lineaNueva;
    salidaRespuesta.scrollTop = salidaRespuesta.scrollHeight;
}

function guardarTokenEnPantalla(token) {
    campoToken.value = token || "";
}

function obtenerTokenActivo() {
    return campoToken.value.trim();
}

async function enviarSolicitud(url, opciones = {}) {
    const respuesta = await fetch(url, opciones);
    const cuerpoTexto = await respuesta.text();

    let cuerpo;
    try {
        cuerpo = cuerpoTexto ? JSON.parse(cuerpoTexto) : {};
    } catch {
        cuerpo = { bruto: cuerpoTexto };
    }

    return {
        estado: respuesta.status,
        okHttp: respuesta.ok,
        cuerpo
    };
}

async function registrarUsuario(evento) {
    evento.preventDefault();

    const datos = new FormData(formularioRegistro);
    const email = String(datos.get("email") || "").trim().toLowerCase();
    const password = String(datos.get("password") || "");

    if (!email || !password) {
        escribirLinea("[ERROR] Registro: email y password son obligatorios.");
        return;
    }

    try {
        escribirLinea("[POST] /auth/register en proceso...");
        const resultado = await enviarSolicitud("/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        escribirLinea(`[RESPUESTA] /auth/register -> ${resultado.estado} ${JSON.stringify(resultado.cuerpo)}`);
    } catch (error) {
        escribirLinea(`[ERROR] Registro: ${error.message}`);
    }
}

async function iniciarSesion(evento) {
    evento.preventDefault();

    const datos = new FormData(formularioLogin);
    const email = String(datos.get("email") || "").trim().toLowerCase();
    const password = String(datos.get("password") || "");

    if (!email || !password) {
        escribirLinea("[ERROR] Login: email y password son obligatorios.");
        return;
    }

    try {
        escribirLinea("[POST] /auth/login en proceso...");
        const resultado = await enviarSolicitud("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (resultado.okHttp && resultado.cuerpo.token) {
            guardarTokenEnPantalla(resultado.cuerpo.token);
            localStorage.setItem(claveToken, resultado.cuerpo.token);
            escribirLinea("[OK] Token JWT recibido y guardado.");
        }

        escribirLinea(`[RESPUESTA] /auth/login -> ${resultado.estado} ${JSON.stringify(resultado.cuerpo)}`);
    } catch (error) {
        escribirLinea(`[ERROR] Login: ${error.message}`);
    }
}

async function consultarRutaProtegida(ruta) {
    const token = obtenerTokenActivo();

    if (!token) {
        escribirLinea("[ERROR] Debes cargar un token JWT antes de consultar rutas protegidas.");
        return;
    }

    try {
        escribirLinea(`[GET] ${ruta} en proceso...`);
        const resultado = await enviarSolicitud(ruta, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        escribirLinea(`[RESPUESTA] ${ruta} -> ${resultado.estado} ${JSON.stringify(resultado.cuerpo)}`);
    } catch (error) {
        escribirLinea(`[ERROR] ${ruta}: ${error.message}`);
    }
}

function guardarTokenManual() {
    const token = obtenerTokenActivo();
    if (!token) {
        escribirLinea("[INFO] No hay token para guardar.");
        return;
    }
    localStorage.setItem(claveToken, token);
    escribirLinea("[OK] Token guardado en localStorage.");
}

function limpiarToken() {
    campoToken.value = "";
    localStorage.removeItem(claveToken);
    escribirLinea("[OK] Token eliminado de la interfaz y localStorage.");
}

function limpiarConsola() {
    salidaRespuesta.textContent = "";
}

function cargarTokenPersistido() {
    const tokenGuardado = localStorage.getItem(claveToken) || "";
    if (tokenGuardado) {
        guardarTokenEnPantalla(tokenGuardado);
        escribirLinea("[INFO] Token recuperado desde localStorage.");
    } else {
        escribirLinea("[INFO] Interfaz lista. No hay token activo.");
    }
}

formularioRegistro.addEventListener("submit", registrarUsuario);
formularioLogin.addEventListener("submit", iniciarSesion);
botonPerfil.addEventListener("click", () => consultarRutaProtegida("/api/perfil"));
botonAdmin.addEventListener("click", () => consultarRutaProtegida("/api/admin"));
botonGuardarToken.addEventListener("click", guardarTokenManual);
botonLimpiarToken.addEventListener("click", limpiarToken);
botonLimpiarConsola.addEventListener("click", limpiarConsola);

cargarTokenPersistido();
