function obtenerPerfil(req, res) {
    return res.status(200).json({
        ok: true,
        data: {
            id: req.usuario.sub,
            email: req.usuario.email,
            rol: req.usuario.rol
        }
    });
}

function obtenerPanelAdmin(req, res) {
    return res.status(200).json({
        ok: true,
        data: {
            mensaje: "Acceso autorizado al recurso admin",
            usuario: req.usuario.email
        }
    });
}

module.exports = {
    obtenerPerfil,
    obtenerPanelAdmin
};
