require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const path = require("node:path");

const { cargarVariablesEntorno } = require("./config/variablesEntorno");
const rutasAutenticacion = require("./rutas/autenticacionRutas");
const rutasPerfil = require("./rutas/perfilRutas");
const { rutaNoEncontrada, manejarErrores } = require("./middleware/manejoErrores");

const variablesEntorno = cargarVariablesEntorno();
const aplicacion = express();

aplicacion.disable("x-powered-by");
aplicacion.use(helmet());
aplicacion.use(express.json({ limit: "10kb" }));
aplicacion.use(express.static(path.join(__dirname, "public")));

aplicacion.use("/auth", rutasAutenticacion);
aplicacion.use("/api", rutasPerfil);

aplicacion.use(rutaNoEncontrada);
aplicacion.use(manejarErrores);

if (require.main === module) {
    aplicacion.listen(variablesEntorno.puerto, () => {
        console.log(`API lista en http://localhost:${variablesEntorno.puerto}`);
    });
}

module.exports = aplicacion;
