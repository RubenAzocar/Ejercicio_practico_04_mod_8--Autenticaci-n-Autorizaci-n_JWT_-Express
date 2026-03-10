function cargarVariablesEntorno() {
    const puerto = Number(process.env.PORT) || 3000;
    const jwtSecreto = process.env.JWT_SECRET;
    const jwtExpira = process.env.JWT_EXPIRES || "15m";
    const rondasBcrypt = Number(process.env.BCRYPT_RONDAS) || 10;

    if (!jwtSecreto || jwtSecreto.length < 16) {
        throw new Error("JWT_SECRET debe existir y tener al menos 16 caracteres");
    }

    return {
        puerto,
        jwtSecreto,
        jwtExpira,
        rondasBcrypt
    };
}

module.exports = {
    cargarVariablesEntorno
};
