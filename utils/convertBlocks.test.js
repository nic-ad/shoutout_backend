const assert = require("node:assert/strict");
const test = require("node:test");
const { client } = require("./mocks");
const { convertBlocks } = require("./convertBlocks");

test("convertBlocks", async () => {
  const blocks = [
    {
      type: "rich_text",
      block_id: "6XRqj",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            { type: "text", text: "shoutout " },
            { type: "user", user_id: "W012A3CDE" },
            { type: "text", text: "\n" },
          ],
        },
        {
          type: "rich_text_list",
          elements: [
            {
              type: "rich_text_section",
              elements: [
                { type: "text", text: "shoutout " },
                { type: "user", user_id: "W012A3CDE" },
              ],
            },
          ],
          style: "bullet",
          indent: 0,
          border: 0,
        },
      ],
    },
  ];

  const { elements, users } = await convertBlocks({ blocks, client });

  assert.deepEqual(elements[0], {
    type: "rich_text_section",
    elements: [
      { type: "text", text: "shoutout " },
      { type: "user", text: "spengler" },
      { type: "text", text: "\n" },
    ],
  });

  assert.deepEqual(elements[1], {
    subtype: "bullet",
    type: "rich_text_list",
    elements: [
      {
        type: "rich_text_section",
        elements: [
          {
            type: "text",
            text: "shoutout ",
          },
          { type: "user", text: "spengler" },
        ],
      },
    ],
  });

  assert.equal(elements.length, 2);

  assert.equal(users.length, 1);
  assert.equal(users[0].profile.email, "spengler@ghostbusters.example.com");
});
