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

async function fetchWhatTheCommitMessage(): Promise<WhatTheCommitResponse> {
  const response = await fetch("https://whatthecommit.com/index.json");
  if (!response.ok) {
    throw new Error(
      `HTTP request failed with status code ${response.status}: ${response.statusText}`
    );
  }
  return (await response.json()) as WhatTheCommitResponse;
}
