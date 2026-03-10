function autorizarRoles(...rolesPermitidos) {
    return function validarPermiso(req, res, next) {
        const rolUsuario = req.usuario && req.usuario.rol;

        if (!rolUsuario || !rolesPermitidos.includes(rolUsuario)) {
            return res.status(403).json({ ok: false, mensaje: "No tienes permisos para este recurso" });
        }

        return next();
    };
}

module.exports = {
    autorizarRoles
};
