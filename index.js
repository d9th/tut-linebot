const https = require("https");
const express = require("express");
const crypto = require("crypto");
const app = express();

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.LINE_ACCESS_TOKEN;
const CHANNEL_SECRET = process.env.CHANNEL_SECRET;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.post("/webhook", (req, res) => {
  // const body = "..."; // Request body string
  // const signature = crypto
  //   .createHmac("SHA256", channelSecret)
  //   .update(body)
  //   .digest("base64");
  // // Compare x-line-signature request header and the signature
  const signature = crypto
    .createHmac("SHA256", CHANNEL_SECRET)
    .update(JSON.stringify(req.body))
    .digest("base64");
  console.warn(signature);
  console.warn(req.get("x-line-signature"));

  res.send("http post request sent to the webhook url.");

  if (req.body.events[0].type === "message") {
    console.log(req.body);

    const dataString = JSON.stringify({
      replyToken: req.body.events[0].replyToken,
      messages: [
        {
          type: "text",
          text: "Hello user",
        },
        {
          type: "text",
          text: `${req.get("x-line-signature")}`,
        },
      ],
    });

    const headers = {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${TOKEN}`,
      Authorization: "Bearer " + TOKEN,
    };

    const webhookOptions = {
      hostname: "api.line.me",
      path: "/v2/bot/message/reply",
      method: "POST",
      headers: headers,
      body: dataString,
    };

    const request = https.request(webhookOptions, res => {
      res.on("data", d => {
        process.stdout.write(d);
      });
    });

    request.on("error", err => {
      console.error(err);
    });

    request.write(dataString);
    request.end();
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
