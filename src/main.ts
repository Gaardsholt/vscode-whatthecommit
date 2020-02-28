import * as vscode from 'vscode';
import * as rp from "request-promise";
import { wtcJson } from "./wtcJson";

export async function activate(context: vscode.ExtensionContext) {
	console.log('Successfully activated "WhatTheCommit"');
	
	context.subscriptions.push(vscode.commands.registerCommand("extension.wtc.getCommitMessage",
		async () => {
			const gitExtension = vscode.extensions.getExtension('vscode.git').exports;
			const repo = gitExtension.getAPI(1).repositories[0];

			// vscode.window.showInformationMessage("Fetching commit message...");
			rp({ uri: 'http://www.whatthecommit.com/index.json', json: true })
				.then(function (htmlString: wtcJson) {
					repo.inputBox.value = htmlString.commit_message;
					// vscode.window.showInformationMessage(htmlString.commit_message);
				})
				.catch(function (err) {
					vscode.window.showErrorMessage("Unable to connect to whatthecommit.com: " + err, {modal: true});
				});
		}));
}

