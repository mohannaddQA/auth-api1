const supertest = require("supertest");
const { server } = require("../src/server");
const base64 = require("base-64");
const { db } = require("../src/models/index");
const bearer = require("../src/auth/middleware/bearer");

const request = supertest(server);

beforeAll(async () => {
  await db.sync();
});

describe("Server Routes", () => {
  describe("Version 1 routes", () => {
    it("should get all records from a model", async () => {
      const response = await request.get("/api/v1/food");
      expect(response.status).toBe(200);
    });
  });
});

describe("Authentication routes", () => {
  it("should create a new user ", async () => {
    const user = {
      username: "mohannad",
      password: "1234",
    };
    const response = await request.post("/signup").send(user);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("user");
  });
});

afterAll(async () => {
  await db.drop();
});
