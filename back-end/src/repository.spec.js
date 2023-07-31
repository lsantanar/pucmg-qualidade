const EventRepository = require("./repository");
const {MongoClient} = require('mongodb');

describe('UserRepository', () => {
    let container;
    let client;

    beforeAll(async () => {
        container = new Container();
        client = container.getClient();
        const repository = await container.getUserRepository();
        await repository.deleteAll();
    });

    afterAll(async () => {
        await client.close();
    });

    test('Deve criar um novo usuário (C)', async () => {
        const repository = await container.getUserRepository();

        const user = {
            name: 'João',
            email: 'joao@example.com',
            password: '123456',
        };

        const result = await repository.create(user);

        expect(result).toEqual(user);

        const users = await repository.findAll();
        expect(users.length).toBe(1);
        expect(users[0]).toEqual(user);
    });

    test('Deve listar todos os usuários (R)', async () => {
        const repository = await container.getUserRepository();

        const user1 = {
            name: 'Maria',
            email: 'maria@example.com',
            password: '654321',
        };

        const user2 = {
            name: 'Pedro',
            email: 'pedro@example.com',
            password: '987654',
        };

        await repository.create(user1);
        await repository.create(user2);

        const users = await repository.findAll();

        expect(users.length).toBe(2);
        expect(users).toEqual(expect.arrayContaining([user1, user2]));
    });

    test('Deve atualizar um usuário (U)', async () => {
        const repository = await container.getUserRepository();

        const user = {
            name: 'Fernando',
            email: 'fernando@example.com',
            password: 'qwerty',
        };

        const createdUser = await repository.create(user);

        const updatedUser = { ...createdUser, name: 'Novo Nome', email: 'novoemail@example.com' };

        await repository.update(updatedUser);

        const result = await repository.findById(createdUser._id);

        expect(result).toEqual(updatedUser);
    });

    test('Deve remover um usuário (D)', async () => {
        const repository = await container.getUserRepository();

        const user = {
            name: 'Ana',
            email: 'ana@example.com',
            password: 'abcdef',
        };

        const createdUser = await repository.create(user);

        await repository.delete(createdUser);

        const result = await repository.findById(createdUser._id);

        expect(result).toBe(null);
    });

    test('Não deve permitir remoção de usuário sem id', async () => {
        const repository = await container.getUserRepository();

        const user = {
            name: 'Carlos',
            email: 'carlos@example.com',
            password: 'abcdef',
        };

        await repository.create(user);

        const expression = () => repository.delete({ name: 'Carlos' });

        await expect(expression).rejects.toThrow('Usuário inválido');
    });
});