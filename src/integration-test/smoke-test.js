const request = require('supertest');
const { app } = require('../main/app');
const nock = require('nock');
const config = require('config');
const {ROOT_URL} = require('../main/routes/urls');

const agent = request.agent(app);

function authenticate() {
  agent.get('/oauth2/callback')
    .query('code=ABC')
    .then((res) => {
      expect(res.status).toBe(302);
    });
}

// TODO: replace this sample test with proper smoke tests later
describe('Dummy Smoke test - Dashboard page', () => {
  describe('on GET', () => {
    const citizenRoleToken = config.get('citizenRoleToken');
    beforeEach(() => {
      nock('http://localhost:5000')
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      authenticate();
    });

    test('should redirect to dashboard page', async () => {
      await agent
        .get(ROOT_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain('Found. Redirecting to /dashboard');
        });
    });
  });
});
