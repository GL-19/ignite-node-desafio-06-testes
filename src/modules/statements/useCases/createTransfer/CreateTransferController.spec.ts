import { createConnection, Connection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("Create Transfer Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a transfer statement", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Sender User",
      email: "sender@email.com",
      password: "12345",
    });

    const responseTokenSender = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "sender@email.com",
        password: "12345",
      });

    const { token } = responseTokenSender.body;

    await request(app).post("/api/v1/users").send({
      name: "Receiver User",
      email: "receiver@email.com",
      password: "ABCDE",
    });

    const responseRecipientToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "receiver@email.com",
        password: "ABCDE",
      });

    const { user } = responseRecipientToken.body;

    const { id: recipient_id } = user;

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
      .post(`/api/v1/statements/transfer/${recipient_id}`)
      .send({
        amount: 250,
        description: "test transfer",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(250);
    expect(response.body.description).toBe("test transfer");
    expect(response.body.type).toBe("transfer");
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("sender_id");
    expect(response.body).toHaveProperty("recipient_id");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
  });

  it("should not be able to create a transfer statement without a sender valid token", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Receiver No Sender",
      email: "receivernosender@email.com",
      password: "ABCDE",
    });

    const responseRecipientToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "receivernosender@email.com",
        password: "ABCDE",
      });

    const { user } = responseRecipientToken.body;

    const { id: recipient_id } = user;

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${recipient_id}`)
      .send({
        amount: 500,
        description: "test transfer no token",
      })
      .set({
        Authorization: `Bearer invalid-token`,
      });

    expect(response.status).toBe(401);
  });

  it("should not be able to create a transfer statement without a valid recipient", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Sender no recipient",
      email: "sendernorecipient@email.com",
      password: "12345",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "sendernorecipient@email.com",
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

    const invalidUUID = "123e4567-e89b-12d3-a456-426614174000";

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${invalidUUID}`)
      .send({
        amount: 250,
        description: "test transfer no recipient",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });

  it("should not be able to create a transfer statement if there is not enough funds", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Sender No Funds",
      email: "sendernofunds@email.com",
      password: "12345",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "sendernofunds@email.com",
      password: "12345",
    });

    const { token } = responseToken.body;

    await request(app).post("/api/v1/users").send({
      name: "Receiver No Funds",
      email: "receivernofunds@email.com",
      password: "ABCDE",
    });

    const responseRecipientToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "receivernofunds@email.com",
        password: "ABCDE",
      });

    const { user } = responseRecipientToken.body;

    const { id: recipient_id } = user;

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${recipient_id}`)
      .send({
        amount: 250,
        description: "test transfer no funds",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Insufficient funds");
  });
});
