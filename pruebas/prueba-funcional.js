const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const aplicacion = require("../index");

function esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function esperarHasta(condicion, mensajeError, maxIntentos = 30, intervalo = 80) {
    for (let intento = 0; intento < maxIntentos; intento += 1) {
        if (condicion()) {
            return;
        }
        await esperar(intervalo);
    }
    throw new Error(mensajeError);
}

async function solicitudJson(baseUrl, ruta, opciones = {}) {
    const respuesta = await fetch(`${baseUrl}${ruta}`, opciones);
    const texto = await respuesta.text();

    let cuerpo = {};
    try {
        cuerpo = texto ? JSON.parse(texto) : {};
    } catch {
        cuerpo = { texto }; // Para depuracion de respuesta no JSON.
    }

    return {
        estado: respuesta.status,
        cuerpo
    };
}

async function ejecutarPruebasEndpoints(baseUrl) {
    const email = `usuario.${Date.now()}@mail.com`;
    const password = `Clave.${Date.now()}!`;

    const registro = await solicitudJson(baseUrl, "/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    assert.equal(registro.estado, 201, "POST /auth/register debe responder 201");
    assert.equal(registro.cuerpo.ok, true, "POST /auth/register debe responder ok=true");

    const login = await solicitudJson(baseUrl, "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    assert.equal(login.estado, 200, "POST /auth/login debe responder 200");
    assert.equal(login.cuerpo.ok, true, "POST /auth/login debe responder ok=true");
    assert.equal(typeof login.cuerpo.token, "string", "POST /auth/login debe devolver token");

    const token = login.cuerpo.token;

    const perfil = await solicitudJson(baseUrl, "/api/perfil", {
        headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(perfil.estado, 200, "GET /api/perfil debe responder 200 con token valido");
    assert.equal(perfil.cuerpo.ok, true, "GET /api/perfil debe responder ok=true");
    assert.equal(perfil.cuerpo.data.email, email, "GET /api/perfil debe devolver email correcto");

    const admin = await solicitudJson(baseUrl, "/api/admin", {
        headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(admin.estado, 403, "GET /api/admin debe responder 403 para rol usuario");

    const perfilSinToken = await solicitudJson(baseUrl, "/api/perfil");
    assert.equal(perfilSinToken.estado, 401, "GET /api/perfil debe responder 401 sin token");

    return {
        email,
        password,
        token
    };
}

async function ejecutarPruebasBotonesUI(baseUrl) {
    const html = await fs.readFile(path.join(__dirname, "..", "public", "index.html"), "utf8");
    const codigoCliente = await fs.readFile(path.join(__dirname, "..", "public", "js", "cliente.js"), "utf8");

    const dom = new JSDOM(html, {
        url: baseUrl,
        runScripts: "outside-only",
        pretendToBeVisual: true
    });

    const { window } = dom;
    window.fetch = (url, opciones) => fetch(new URL(url, baseUrl).toString(), opciones);
    window.console = console;

    window.eval(codigoCliente);

    const documento = window.document;
    const salida = documento.getElementById("salidaRespuesta");

    const email = `ui.${Date.now()}@mail.com`;
    const password = `Clave.${Date.now()}!`;

    const registroEmail = documento.getElementById("registroEmail");
    const registroPassword = documento.getElementById("registroPassword");
    const formularioRegistro = documento.getElementById("formularioRegistro");

    registroEmail.value = email;
    registroPassword.value = password;
    formularioRegistro.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));

    await esperarHasta(
        () => salida.textContent.includes("/auth/register -> 201"),
        "El boton Crear cuenta no completo el endpoint /auth/register"
    );

    const loginEmail = documento.getElementById("loginEmail");
    const loginPassword = documento.getElementById("loginPassword");
    const formularioLogin = documento.getElementById("formularioLogin");

    loginEmail.value = email;
    loginPassword.value = password;
    formularioLogin.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));

    await esperarHasta(
        () => salida.textContent.includes("/auth/login -> 200"),
        "El boton Obtener token no completo el endpoint /auth/login"
    );

    const campoToken = documento.getElementById("tokenJwt");
    await esperarHasta(
        () => campoToken.value.trim().length > 0,
        "El boton Obtener token no guardo JWT en la interfaz"
    );

    const tokenAntesDeGuardar = campoToken.value;

    documento.getElementById("botonGuardarToken").click();
    assert.equal(
        window.localStorage.getItem("tokenJwtDemo"),
        tokenAntesDeGuardar,
        "El boton Guardar token no almaceno el JWT en localStorage"
    );

    documento.getElementById("botonPerfil").click();
    await esperarHasta(
        () => salida.textContent.includes("/api/perfil -> 200"),
        "El boton Consultar /api/perfil no obtuvo respuesta 200"
    );

    documento.getElementById("botonAdmin").click();
    await esperarHasta(
        () => salida.textContent.includes("/api/admin -> 403"),
        "El boton Consultar /api/admin no obtuvo respuesta esperada"
    );

    documento.getElementById("botonLimpiarToken").click();
    assert.equal(campoToken.value, "", "El boton Limpiar token no vacio el campo token");
    assert.equal(window.localStorage.getItem("tokenJwtDemo"), null, "El boton Limpiar token no limpio localStorage");

    assert.notEqual(salida.textContent.trim(), "", "La consola deberia tener contenido antes de limpiar");
    documento.getElementById("botonLimpiarConsola").click();
    assert.equal(salida.textContent, "", "El boton Limpiar no vacio la consola de respuestas");

    dom.window.close();
}

async function main() {
    const servidor = aplicacion.listen(0);

    try {
        await new Promise((resolve, reject) => {
            servidor.once("listening", resolve);
            servidor.once("error", reject);
        });

        const puerto = servidor.address().port;
        const baseUrl = `http://127.0.0.1:${puerto}`;

        console.log("== PRUEBAS DE ENDPOINTS ==");
        await ejecutarPruebasEndpoints(baseUrl);
        console.log("OK: /auth/register");
        console.log("OK: /auth/login");
        console.log("OK: /api/perfil con token");
        console.log("OK: /api/admin con rol usuario (403 esperado)");
        console.log("OK: /api/perfil sin token (401 esperado)");

        console.log("== PRUEBAS DE BOTONES UI ==");
        await ejecutarPruebasBotonesUI(baseUrl);
        console.log("OK: boton Crear cuenta");
        console.log("OK: boton Obtener token");
        console.log("OK: boton Guardar token");
        console.log("OK: boton Consultar /api/perfil");
        console.log("OK: boton Consultar /api/admin");
        console.log("OK: boton Limpiar token");
        console.log("OK: boton Limpiar consola");

        console.log("RESULTADO FINAL: TODAS LAS PRUEBAS PASARON");
    } finally {
        await new Promise((resolve) => servidor.close(resolve));
    }
}

(async () => {
    try {
        await main();
    } catch (error) {
        console.error("FALLO DE PRUEBA:", error.message);
        process.exitCode = 1;
    }
})();
