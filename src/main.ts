import * as vscode from 'vscode';
import * as rp from "request-promise";
import { wtcJson } from "./wtcJson"

export async function activate(context: vscode.ExtensionContext) {
	console.log('Successfully activated "WhatTheCommit"');

	context.subscriptions.push(vscode.commands.registerCommand("extension.wtc.getCommitMessage",
		async (sourceControlPane: vscode.SourceControl) => {
			rp({ uri: 'http://whatthecommit.com/index.json', json: true })
				.then(function (htmlString: wtcJson) {
					// vscode.window.showInformationMessage(htmlString.commit_message);
					sourceControlPane.inputBox.value = htmlString.commit_message;
				})
				.catch(function (err) {
					vscode.window.showInformationMessage(err);
				});
		}));
}

