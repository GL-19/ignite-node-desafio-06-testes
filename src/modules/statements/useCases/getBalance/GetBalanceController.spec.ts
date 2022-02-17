import { createConnection, Connection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get balance", async () => {
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

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "test deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 300,
        description: "test withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { balance, statement } = response.body;

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statement");
    expect(response.body).toHaveProperty("balance");

    expect(balance).toBe(200);
    expect(statement[0].id).toEqual(responseDeposit.body.id);
    expect(statement[1].id).toEqual(responseWithdraw.body.id);
  });

  it("should not be able to get balance without a valid token", async () => {
    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer invalid-token`,
    });

    expect(response.status).toBe(401);
  });
});
