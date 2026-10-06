import request from 'supertest';
import { getTestApp } from '../../server.js';
import { authHeader, OTHER_USER, registerAndGetToken, TEST_USER } from '../../utils/auth.util.js';

describe('users API', () => {
  describe('when registering a new account', () => {
    it('should create the user and allow login', async () => {
      const app = getTestApp();
      const token = await registerAndGetToken(app);
      const me = await request(app).get('/api/users/me').set(authHeader(token)).expect(200);
      expect(me.body).toEqual(expect.objectContaining({ email: TEST_USER.email, role: 'USER' }));
      expect(me.body.password).toBeUndefined();
    });
  });

  describe('when other accounts already exist', () => {
    it('should keep registration open and reject a duplicated email', async () => {
      const app = getTestApp();
      await registerAndGetToken(app);
      await registerAndGetToken(app, OTHER_USER);
      const duplicated = await request(app).post('/api/users/register').send(TEST_USER).expect(409);
      expect(duplicated.body).toEqual({ message: 'E-mail já cadastrado.' });
    });
  });

  describe('when logging in with a wrong password', () => {
    it('should answer 401 with a translated message', async () => {
      const app = getTestApp();
      await registerAndGetToken(app);
      const response = await request(app)
        .post('/api/users/login')
        .send({ email: TEST_USER.email, password: 'errada-123' })
        .expect(401);
      expect(response.body).toEqual({ message: 'E-mail ou senha inválidos.' });
    });
  });

  describe('when calling a protected route', () => {
    it('should require a bearer token', async () => {
      await request(getTestApp()).get('/api/planning').expect(401);
      await request(getTestApp())
        .get('/api/planning')
        .set(authHeader('token-invalido'))
        .expect(401);
    });
  });
});
