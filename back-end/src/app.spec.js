const app = require ('./app');
const request = require('supertest')(app);
const EventRepository = require("./repository");
const {MongoClient} = require('mongodb');

describe('User Management API', () => {
    let container;

    beforeAll(() => {
        container = new Container();
    });

    afterAll(async () => {
        const client = await container.getClient();
        await client.close();
    });

    beforeEach(async () => {
        const repository = await container.getUserRepository();
        await repository.deleteAll();
    });

    describe('Endpoints de coleção', () => {
        test('GET /users deve retornar status 200 e lista de usuários vazia', async () => {
            const response = await request(app).get('/users').expect('Content-type', /application\/json/);

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual([]);
        });

        test('POST /users deve criar um novo usuário e retornar status 201', async () => {
            const user = {
                name: 'Lucas',
                email: 'contatolsr@hotmail.com',
                password: '123456',
            };

            const response = await request(app).post('/users').send(user).expect('Content-type', /application\/json/);

            expect(response.statusCode).toBe(201);
            expect(response.body).toMatchObject(user);

            // Verificar se o usuário foi realmente criado no banco de dados
            const users = await request(app).get('/users').expect('Content-type', /application\/json/);
            expect(users.body).toHaveLength(1);
            expect(users.body[0]).toMatchObject(user);
        });
    });

    describe('Endpoints de item', () => {
        test('GET /users/:id deve retornar status 404 para usuário inexistente', async () => {
            const response = await request(app).get('/users/123').expect('Content-type', /application\/json/);

            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({
                status: 404,
                error: 'Usuário não encontrado',
            });
        });

        test('GET /users/:id deve retornar o usuário correto', async () => {
            const user = {
                name: 'Lucas',
                email: 'contatolsr@hotmail.com',
                password: '654321',
            };

            const createdUser = await request(app).post('/users').send(user);

            const response = await request(app).get(`/users/${createdUser.body._id}`).expect('Content-type', /application\/json/);

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(createdUser.body);
        });

        test('PUT /users/:id deve retornar status 404 para usuário inexistente', async () => {
            const response = await request(app).put('/users/123').send({ name: 'Novo Nome' }).expect('Content-type', /application\/json/);

            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({
                status: 404,
                error: 'Usuário não encontrado',
            });
        });

        test('PUT /users/:id deve atualizar o usuário corretamente', async () => {
            const user = {
                name: 'Lucas',
                email: 'contatolsr@hotmail.com',
                password: 'qwerty',
            };

            const createdUser = await request(app).post('/users').send(user);

            const updatedUser = { ...createdUser.body, name: 'Novo Nome', email: 'novoemail@example.com' };

            const response = await request(app).put(`/users/${createdUser.body._id}`).send(updatedUser).expect('Content-type', /application\/json/);

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(updatedUser);

            // Verificar se o usuário foi realmente atualizado no banco de dados
            const fetchedUser = await request(app).get(`/users/${createdUser.body._id}`).expect('Content-type', /application\/json/);
            expect(fetchedUser.body).toEqual(updatedUser);
        });

        test('DELETE /users/:id deve retornar status 404 para usuário inexistente', async () => {
            const response = await request(app).delete('/users/123').expect('Content-type', /application\/json/);

            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({
                status: 404,
                error: 'Usuário não encontrado',
            });
        });

        test('DELETE /users/:id deve deletar o usuário corretamente', async () => {
            const user = {
                name: 'Lucas',
                email: 'contatolsr@hotmail.com',
                password: 'abcdef',
            };

            const createdUser = await request(app).post('/users').send(user);

            const response = await request(app).delete(`/users/${createdUser.body._id}`).expect(204);

            expect(response.statusCode).toBe(204);

            // Verificar se o usuário foi realmente removido do banco de dados
            const fetchedUser = await request(app).get(`/users/${createdUser.body._id}`).expect('Content-type', /application\/json/);

            expect(fetchedUser.statusCode).toBe(404);
            expect(fetchedUser.body).toEqual({
                status: 404,
                error: 'Usuário não encontrado',
            });
        });
    });
});