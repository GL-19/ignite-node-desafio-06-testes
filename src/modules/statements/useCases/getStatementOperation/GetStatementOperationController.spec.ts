import { createConnection, Connection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("Get Statement Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get a deposit statement operation", async () => {
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

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "test deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = responseDeposit.body;

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(id);
  });

  it("should be able to get a withdraw statement operation", async () => {
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

    const responseWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 300,
        description: "test withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = responseWithdraw.body;

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(id);
  });

  it("should not be able to get a statement operation with invalid token", async () => {
    await request(app).post("/api/v1/users").send({
      name: "invalid token test name",
      email: "invalid token test email",
      password: "12345",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "invalid token test email",
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
      });

    const { id: deposit_id } = responseDeposit.body;
    const { id: withdraw_id } = responseWithdraw.body;

    const response1 = await request(app).get(
      `/api/v1/statements/${deposit_id}`
    );

    const response2 = await request(app).get(
      `/api/v1/statements/${withdraw_id}`
    );

    expect(response1.status).toBe(401);
    expect(response2.status).toBe(401);
  });
});
