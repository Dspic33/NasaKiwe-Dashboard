import { ROLES_USUARIO } from './contratosMock';

export const USUARIOS = [
    {
        id: 'u1',
        nombre: 'Arq. Juan Camilo Manzano T.',
        email: 'asesor@nasakiwe.gov.co',
        password: '123',
        rol: ROLES_USUARIO.ASESOR_VIVIENDA
    },
    {
        id: 'u2',
        nombre: 'Carlos Aztaiza C.',
        email: 'juridico@nasakiwe.gov.co',
        password: '123',
        rol: ROLES_USUARIO.JURIDICO
    },
    {
        id: 'u3',
        nombre: 'Astrid Natalia Trujillo Campo',
        email: 'directora@nasakiwe.gov.co',
        password: '123',
        rol: ROLES_USUARIO.DIRECTORA
    }

];

export const autenticarUsuario = (email, password) => {
    const user = USUARIOS.find(u => u.email === email && u.password === password);
    if (user) {
        // Retornar copia segura sin la contraseña
        const { password, ...userSeguro } = user;
        return userSeguro;
    }
    return null;
}

export const getUsuarioPorRol = (rolId) => {
    return USUARIOS.find(u => u.rol === rolId);
}
