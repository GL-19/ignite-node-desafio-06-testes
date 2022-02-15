import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test authenticate name",
      email: "test authenticate email",
      password: "12345",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test authenticate email",
      password: "12345",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.email).toBe("test authenticate email");
  });

  it("should not be able to authenticate a nonexistent user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "invalid email",
      password: "invalid password",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate a user if password is incorrect", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test password name",
      email: "test password email",
      password: "12345",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test password email",
      password: "invalid password",
    });

    expect(response.status).toBe(401);
  });
});
