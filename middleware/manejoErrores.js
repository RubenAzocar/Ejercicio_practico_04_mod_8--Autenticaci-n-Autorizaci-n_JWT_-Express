function rutaNoEncontrada(req, res) {
    return res.status(404).json({ ok: false, mensaje: "Ruta no encontrada" });
}

function manejarErrores(error, req, res, next) {
    console.error(error);
    return res.status(500).json({ ok: false, mensaje: "Error interno del servidor" });
}

module.exports = {
    rutaNoEncontrada,
    manejarErrores
};
