const OpenAI = require("openai");

const TOKEN_LIMIT = 16385;
const MINIMAL_GRADE_TO_APROVE = 80;

const openAiApiKey = process.env.OPENAI_API_KEY || "";

const openAi = new OpenAI({ apiKey: openAiApiKey });

const createPrompt = (diffContent) => {
  return `
You need to evaluate this code. Your objective is to find bugs, code smells, and bad practices.
If you find any problems, comment with suggestions for modification in DIFF format, showing the suggestion and the problem.
Optimize the team's time by only considering what really needs change or attention; if there are no issues, respond with nothing.

Format the output in markdown as follows:

- Add a title with content "GPT.ia REVIEWER"
- Add a summary tag explaining what the code do, as a subtitle
- List all files changed in the pull request
- At the end of each file section, add a line (---) to separate the files

If suggestions are needed, follow these rules:
- Add a title for each file changed, a suggestion, and a description of what should be improved
- Include a code block with the code changed and a suggestion
- Format all code in DIFF format

After if you returned suggestions, add a final section with the title "Final considerations" 
and add a summary of the main problems found and suggestions for improvement, 
and if exists no issue found you should be remove to response

Generate a final note to this Pull Request, this note should be from 0 to 100, ${MINIMAL_GRADE_TO_APROVE} can consider pull request approved!

Pull request differences:
${diffContent}

Use the following pattern in output:

# GPT.ia REVIEWER

### Summary
// Summary of the code

#### Files
- file1
- file2
- file3

## CODE
// everything between the diff blocks

### Final considerations
// Summary of the main problems found and suggestions for improvement

## GRADE: // Grade value from 0 to 100
`;
};

function canSendPrompt(prompt) {
  return Buffer.byteLength(prompt, "utf-8") > TOKEN_LIMIT ? false : true;
}

async function sendGptRequest(prompts) {
  try {
    const openAiResponse = await openAi.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a senior programmer performing a code review.",
        },
        ...prompts,
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 1000,
      n: 1,
      stop: null,
      temperature: 1.2,
      // stream: true,
    });

    return openAiResponse.choices;
  } catch (error) {
    console.error("Error during send open ai request: ", error);
  }
}

function splitPromptsIntoBatches(diffParts, tokenLimit = TOKEN_LIMIT) {
  const batches = [];
  let currentBatch = [];
  let currentBatchSize = 0;

  diffParts.forEach((part) => {
    const prompt = createPrompt(part);
    const promptSize = Buffer.byteLength(prompt, "utf-8");

    if (currentBatchSize + promptSize > tokenLimit) {
      batches.push(currentBatch);
      currentBatch = [];
      currentBatchSize = 0;
    }

    currentBatch.push({ prompt });
    currentBatchSize += promptSize;
  });

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

module.exports = {
  canSendPrompt,
  sendGptRequest,
  splitPromptsIntoBatches,
};
