const fs = require("fs/promises");
const path = require("path");

const rutaArchivoUsuarios = path.join(__dirname, "..", "datos", "usuarios.json");

async function leerUsuarios() {
    try {
        const contenido = await fs.readFile(rutaArchivoUsuarios, "utf8");
        const usuarios = JSON.parse(contenido || "[]");
        return Array.isArray(usuarios) ? usuarios : [];
    } catch (error) {
        if (error.code === "ENOENT") {
            await fs.writeFile(rutaArchivoUsuarios, "[]\n", "utf8");
            return [];
        }
        throw error;
    }
}

async function guardarUsuarios(usuarios) {
    await fs.writeFile(rutaArchivoUsuarios, `${JSON.stringify(usuarios, null, 2)}\n`, "utf8");
}

async function buscarUsuarioPorEmail(email) {
    const usuarios = await leerUsuarios();
    return usuarios.find((usuario) => usuario.email === email) || null;
}

async function crearUsuario({ email, hashContrasena, rol = "usuario" }) {
    const usuarios = await leerUsuarios();
    const nuevoUsuario = {
        id: `${Date.now()}`,
        email,
        hashContrasena,
        rol,
        fechaCreacion: new Date().toISOString()
    };

    usuarios.push(nuevoUsuario);
    await guardarUsuarios(usuarios);

    return nuevoUsuario;
}

module.exports = {
    buscarUsuarioPorEmail,
    crearUsuario
};
