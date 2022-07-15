const { client } = require("./mocks");
const { convertBlocks } = require("../../utils/convertBlocks");

describe("convertBlocks", () => {
  it("should format text, users, and lists", async () => {
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

    expect(elements[0]).toEqual({
      type: "rich_text_section",
      elements: [
        { type: "text", text: "shoutout " },
        { type: "user", text: "spengler" },
        { type: "text", text: "\n" },
      ],
    });

    expect(elements[1]).toEqual({
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

    expect(elements.length).toBe(2);

    expect(users.length).toBe(1);
    expect(users[0].profile.email).toBe("spengler@ghostbusters.example.com");
  });
});
