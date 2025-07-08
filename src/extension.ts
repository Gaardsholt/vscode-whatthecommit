import * as https from "https";
import * as vscode from "vscode";
import { GitExtension, Repository } from "./git";

export function activate(context: vscode.ExtensionContext) {
  console.log('Successfully activated "WhatTheCommit"');

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "wtc.getCommitMessage",
      async (repository: Repository) => {
        const repo = getRepository(repository);
        if (!repo) {
          vscode.window.showErrorMessage("No Git repository found.");
          return;
        }

        const addPermalink = vscode.workspace
          .getConfiguration()
          .get("wtc.addPermalink") as boolean;

        try {
          const commit = await fetchWhatTheCommitMessage();
          const permaLink = addPermalink
            ? `\n\npermalink: ${commit.permalink}`
            : "";
          repo.inputBox.value = `${commit.commit_message}${permaLink}`;
        } catch (err: unknown) {
          let message = "Unknown error";
          if (err instanceof Error) {
            message = err.message;
          }
          vscode.window.showErrorMessage(
            `Failed to fetch commit message: ${message}`,
            { modal: true }
          );
        }
      },
      { repository: true }
    )
  );

  vscode.commands.executeCommand("setContext", "wtc.enabled", true);
}

function getRepository(
  repository: Repository | undefined
): Repository | undefined {
  if (repository) {
    return repository;
  }

  const gitExtension =
    vscode.extensions.getExtension<GitExtension>("vscode.git")?.exports;
  const api = gitExtension?.getAPI(1);
  return api?.repositories[0];
}

interface WhatTheCommitResponse {
  commit_message: string;
  permalink: string;
}

function fetchWhatTheCommitMessage(): Promise<WhatTheCommitResponse> {
  return new Promise((resolve, reject) => {
    https
      .get("https://www.whatthecommit.com/index.json", (resp) => {
        if (
          resp.statusCode &&
          (resp.statusCode < 200 || resp.statusCode >= 300)
        ) {
          return reject(new Error(`HTTP status code ${resp.statusCode}`));
        }

        let data = "";
        resp.on("data", (chunk) => {
          data += chunk;
        });
        resp.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e: unknown) {
            reject(
              new Error(
                `Failed to parse response: ${
                  e instanceof Error ? e.message : String(e)
                }`
              )
            );
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}
