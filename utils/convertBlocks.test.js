const assert = require("node:assert/strict");
const test = require("node:test");
const { client } = require("./mocks");
const { convertBlocks } = require("./convertBlocks");

test("convertBlocks", async () => {
  const blocks = [
    {
      type: "rich_text",
      block_id: "lld",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            { type: "text", text: "shoutout " },
            { type: "user", user_id: "U03HQDQ90A0" },
          ],
        },
      ],
    },
  ];

  const { elements, users } = await convertBlocks({ blocks, client });

  assert.equal(elements.length, 2);
  assert.deepEqual(elements[0], { type: "text", text: "shoutout " });
  assert.equal(elements[1].text, "spengler");
  assert.equal(elements[1].type, "user");

  assert.equal(users.length, 1);
  assert.equal(users[0].profile.email, "spengler@ghostbusters.example.com");
});
