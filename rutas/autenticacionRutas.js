const express = require("express");

const { registrarUsuario, iniciarSesion } = require("../controladores/autenticacionControlador");

const enrutador = express.Router();

enrutador.post("/register", registrarUsuario);
enrutador.post("/login", iniciarSesion);

module.exports = enrutador;
