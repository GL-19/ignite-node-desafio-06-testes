import { createConnection, Connection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a deposit statement", async () => {
    await request(app).post("/api/v1/users").send({
      name: "deposit name",
      email: "deposit email",
      password: "12345",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "deposit email",
      password: "12345",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "test deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(500);
    expect(response.body.description).toBe("test deposit");
    expect(response.body.type).toBe("deposit");
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
  });

  it("should not be able to create a deposit statement without valid a token", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "test deposit",
      })
      .set({
        Authorization: `Bearer invalid-token`,
      });

    expect(response.status).toBe(401);
  });

  it("should be able to create a withdraw statement", async () => {
    await request(app).post("/api/v1/users").send({
      name: "withdraw name",
      email: "withdraw email",
      password: "12345",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "withdraw email",
      password: "12345",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "test deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 300,
        description: "test withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(300);
    expect(response.body.description).toBe("test withdraw");
    expect(response.body.type).toBe("withdraw");
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
  });

  it("should not be able to create a withdraw statement if there is not enough funds", async () => {
    await request(app).post("/api/v1/users").send({
      name: "not enough funds name",
      email: "not enough funds email",
      password: "12345",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "not enough funds email",
      password: "12345",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 500,
        description: "test withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });

  it("should not be able to create a withdraw statement without valid token", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 500,
        description: "withdraw",
      })
      .set({
        Authorization: `Bearer incorrect-token`,
      });

    expect(response.status).toBe(401);
  });
});
