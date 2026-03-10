const express = require("express");

const { obtenerPerfil, obtenerPanelAdmin } = require("../controladores/perfilControlador");
const { autenticarJwt } = require("../middleware/autenticacionJwt");
const { autorizarRoles } = require("../middleware/autorizarRoles");

const enrutador = express.Router();

enrutador.get("/perfil", autenticarJwt, obtenerPerfil);
enrutador.get("/admin", autenticarJwt, autorizarRoles("admin"), obtenerPanelAdmin);

module.exports = enrutador;
