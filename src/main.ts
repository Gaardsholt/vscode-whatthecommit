import * as vscode from 'vscode';
import * as rp from "request-promise";
import { wtcJson } from "./wtcJson"

export async function activate(context: vscode.ExtensionContext) {
	console.log('Successfully activated "WhatTheCommit"');

	context.subscriptions.push(vscode.commands.registerCommand("extension.wtc.getCommitMessage",
		async (sourceControlPane: vscode.SourceControl) => {
			// vscode.window.showInformationMessage("Fetching commit message...");
			rp({ uri: 'http://whatthecommit.com/index.json', json: true })
				.then(function (htmlString: wtcJson) {
					sourceControlPane.inputBox.value = htmlString.commit_message;
					// vscode.window.showInformationMessage(htmlString.commit_message);
				})
				.catch(function (err) {
					vscode.window.showErrorMessage("Unable to connect to whatthecommit.com: " + err, {modal: true});
				});
		}));
}

