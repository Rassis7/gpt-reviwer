const fs = require("fs");
const {
  canSendPrompt,
  sendGptRequest,
  splitPromptsIntoBatches,
} = require("./scripts/gpt");
const { splitDiffs } = require("./scripts/diff");
// const { getDiffContent, createComment } = require("./scripts/github");

const targetFolder = "src";
const filesToExclude = [
  /index\.tsx?$/i,
  /^(?!.*\.(ts|tsx)$).*$/i,
  /\.types\.[^\/]+$/i,
];

async function* mapToAsyncIterable(map) {
  for (const [_, prompt] of map) {
    yield { prompt };
  }
}

(async () => {
  try {
    const diffContent = fs.readFileSync("./diff-content.txt", "utf8");

    // const diffContent = await getDiffContent();

    const diffParts = splitDiffs(diffContent, targetFolder, filesToExclude);

    if (fs.existsSync("./code-review-result.md")) {
      fs.unlinkSync("./code-review-result.md");
    }

    const batches = splitPromptsIntoBatches(diffParts);

    for await (const batch of batches) {
      const prompts = batch.map(({ prompt }) => ({
        role: "user",
        content: prompt,
      }));

      const gptResponse = await sendGptRequest(prompts);
      const reviewResult = gptResponse[0].message.content;
      if (!reviewResult) {
        return;
      }
      if (!fs.existsSync("./code-review-result.md")) {
        fs.writeFileSync(
          "./code-review-result.md",
          `${reviewResult}\n\n\n`,
          "utf-8"
        );
      } else {
        fs.appendFile(
          "./code-review-result.md",
          `${reviewResult}\n\n\n`,
          () => {
            console.log("Success");
          }
        );
      }
      // await createComment(`### Code Review Result\n\n${reviewResult}`);
    }
  } catch (error) {
    console.error("Error during code review process: ", error);
  }
})();
