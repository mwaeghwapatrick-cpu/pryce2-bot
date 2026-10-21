export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response("PRYCE2 BOT is online! 🤖");
    }

    if (url.pathname === "/setup") {
      if (!env.BOT_TOKEN || !env.SETUP_SECRET) {
        return new Response("Missing bot configuration", { status: 500 });
      }

      if (url.searchParams.get("key") !== env.SETUP_SECRET) {
        return new Response("Unauthorized", { status: 401 });
      }

      const result = await fetch(
        `https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: `${url.origin}/telegram` })
        }
      );

      return new Response(await result.text(), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (url.pathname === "/telegram" && request.method === "POST") {
      if (!env.BOT_TOKEN) {
        return new Response("Bot token missing", { status: 500 });
      }

      const update = await request.json();
      const message = update.message;

      if (!message?.chat?.id || !message.text) {
        return new Response("OK");
      }

      const command = message.text.trim().split(" ")[0];
      let reply;

      if (command === "/start") {
        reply = "⚡ Welcome to PRYCE2 BOT!\n\nYour assistant is online!\n\nType /help to see commands.";
      } else if (command === "/help") {
        reply = "🤖 PRYCE2 BOT COMMANDS\n\n/start - Start the bot\n/help - Show commands\n/ping - Test the bot";
      } else if (command === "/ping") {
        reply = "🏓 Pong! PRYCE2 BOT is alive!";
      } else {
        reply = "I received your message! 🤖\n\nTry /help to see my commands.";
      }

      await fetch(
        `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: message.chat.id,
            text: reply
          })
        }
      );

      return new Response("OK");
    }

    return new Response("Not found", { status: 404 });
  }
};
