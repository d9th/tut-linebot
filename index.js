const https = require("https");
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TOKEN;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.post("/webhook", function (req, res) {
  res.send("http post request sent to the webhook url.");
  // DEBUG
  console.warn(req.body.events);

  if (req.body.events[0].type === "message") {
    const dataString = JSON.stringify({
      replyToken: req.body.events[0].replyToken,
      message: [
        {
          type: "text",
          text: "Hello user",
        },
        {
          type: "text",
          text: "May I help you ?",
        },
      ],
    });

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
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
