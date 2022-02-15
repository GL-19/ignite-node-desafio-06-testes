import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.dropDatabase();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "test name",
      email: "test email",
      password: "12345",
    });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a user if email already exists", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test name",
      email: "test email",
      password: "12345",
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "test name",
      email: "test email",
      password: "12345",
    });

    expect(response.status).toBe(400);
  });
});
