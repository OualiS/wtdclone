import axios from "axios";
import { Configuration, OpenAIApi } from "openai";
import githubhook from "githubhook";
import GitHub from "github-api";

const gh = new GitHub({
  token:
    "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",
});

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

const handlePullRequest = async (repo, ref, data) => {
  // this is where we'll post the git commit status message
  console.log(`got webhook on :  ${repo} with action : ${data.action}`);

  console.log(data);

  if (data.action === "opened" || data.action === "synchronize") {
    // console.log(data.pull_request.diff_url)

    const response = await axios.get(data.pull_request.diff_url);
    const diffBody = response.data;
    console.log("diffBody", diffBody);

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in the field of computer science and you will make a verbose summary of the following diff from github. You will diplay your summary by file.",
        },
        { role: "user", content: "" },
        { role: "user", content: diffBody },
      ],
    });
    // console.log(completion.data.choices[0].message.content);

    const repo = gh.getRepo("OualiS", "wtdclone-test-repo");
    const pull = repo.getPullRequest(data.pull_request.id);
    console.log(pull);
    // pull.listComments(function(err, comments) {
    //   if (err) throw err;
    //   // Code de modification du commentaire
    //   pull.updateComment(comments[0].id, completion.data.choices[0].message.content, function(err, comment) {
    //     if (err) throw err;
    //   });
    // });
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
