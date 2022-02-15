import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show user profile", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test name",
      email: "test email",
      password: "12345",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test email",
      password: "12345",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
    expect(response.body.email).toBe("test email");
    expect(response.body.name).toBe("test name");
  });

  it("should not be able to show user profile without valid token", async () => {
    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer test-token`,
    });

    expect(response.status).toBe(401);
  });
});
