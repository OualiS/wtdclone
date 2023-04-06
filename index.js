import axios from "axios";
import { Configuration, OpenAIApi } from "openai";
import githubhook from "githubhook";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: "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",
});

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

const githubOwner = "OualiS";
const githubRepo = "wtdclone-test-repo";

const handlePullRequest = async (repo, ref, data) => {
  console.log(`got webhook on :  ${repo} with action : ${data.action}`);
  if (
    (data.action === "opened" || data.action === "synchronize") &&
    data.pull_request.body &&
    data.pull_request.body.includes(":summary:")
  ) {
    const response = await axios.get(data.pull_request.diff_url);
    const diffBody = response.data;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in the field of computer science and you will make a verbose summary of the following diff from github. You will diplay your summary by file.",
        },
        { role: "user", content: diffBody },
      ],
    });

    try {
      // Récupérez les détails de la pull request
      const { data: pr } = await octokit.pulls.get({
        owner: githubOwner,
        repo: githubRepo,
        pull_number: data.number,
      });

      // Mettez à jour le corps de la pull request
      await octokit.pulls.update({
        owner: githubOwner,
        repo: githubRepo,
        pull_number: data.number,
        body: completion.data.choices[0].message.content,
      });

      console.log("Le corps de la pull request a été mis à jour");
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du corps de la pull request :",
        error
      );
    }
  }
};

function listen(port = 8000, secret = "yhqniwthma57") {
  const hook = githubhook({
    port,
    secret,
    path: "/",
  });

  hook.on("pull_request", handlePullRequest);
  hook.listen();
}

listen(process.env.PORT, process.env.SECRET);
