const jwt = require("jsonwebtoken");

const { cargarVariablesEntorno } = require("../config/variablesEntorno");

const variablesEntorno = cargarVariablesEntorno();

function autenticarJwt(req, res, next) {
    const cabeceraAutorizacion = req.headers.authorization || "";
    const [tipo, token] = cabeceraAutorizacion.split(" ");

    if (tipo !== "Bearer" || !token) {
        return res.status(401).json({ ok: false, mensaje: "Token requerido" });
    }

    try {
        const payload = jwt.verify(token, variablesEntorno.jwtSecreto);
        req.usuario = payload;
        return next();
    } catch (error) {
        return res.status(401).json({ ok: false, mensaje: "Token invalido o expirado" });
    }
}

module.exports = {
    autenticarJwt
};
