const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { cargarVariablesEntorno } = require("../config/variablesEntorno");
const { buscarUsuarioPorEmail, crearUsuario } = require("../modelos/usuarioModelo");

const variablesEntorno = cargarVariablesEntorno();

function normalizarEmail(valor) {
    return String(valor || "").trim().toLowerCase();
}

function validarFormatoEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarContrasena(contrasena) {
    return typeof contrasena === "string" && contrasena.length >= 6;
}

async function registrarUsuario(req, res, next) {
    try {
        const email = normalizarEmail(req.body.email);
        const contrasena = String(req.body.password || "");

        if (!email || !contrasena) {
            return res.status(400).json({ ok: false, mensaje: "Email y password son requeridos" });
        }

        if (!validarFormatoEmail(email)) {
            return res.status(400).json({ ok: false, mensaje: "Email invalido" });
        }

        if (!validarContrasena(contrasena)) {
            return res.status(400).json({ ok: false, mensaje: "Password debe tener al menos 6 caracteres" });
        }

        const usuarioExistente = await buscarUsuarioPorEmail(email);
        if (usuarioExistente) {
            return res.status(409).json({ ok: false, mensaje: "Email ya registrado" });
        }

        const hashContrasena = await bcrypt.hash(contrasena, variablesEntorno.rondasBcrypt);

        await crearUsuario({
            email,
            hashContrasena,
            rol: "usuario"
        });

        return res.status(201).json({ ok: true, mensaje: "Usuario registrado" });
    } catch (error) {
        return next(error);
    }
}

async function iniciarSesion(req, res, next) {
    try {
        const email = normalizarEmail(req.body.email);
        const contrasena = String(req.body.password || "");

        if (!email || !contrasena) {
            return res.status(400).json({ ok: false, mensaje: "Email y password son requeridos" });
        }

        const usuario = await buscarUsuarioPorEmail(email);
        if (!usuario) {
            return res.status(401).json({ ok: false, mensaje: "Credenciales invalidas" });
        }

        const coincidePassword = await bcrypt.compare(contrasena, usuario.hashContrasena);
        if (!coincidePassword) {
            return res.status(401).json({ ok: false, mensaje: "Credenciales invalidas" });
        }

        const token = jwt.sign(
            {
                sub: usuario.id,
                email: usuario.email,
                rol: usuario.rol
            },
            variablesEntorno.jwtSecreto,
            {
                expiresIn: variablesEntorno.jwtExpira
            }
        );

        return res.status(200).json({ ok: true, token });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    registrarUsuario,
    iniciarSesion
};
