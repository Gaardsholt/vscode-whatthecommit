import * as http from 'http';
import * as vscode from 'vscode';
import { Repository } from './git';

export async function activate(context: vscode.ExtensionContext) {
	console.log('Successfully activated "WhatTheCommit"');

	context.subscriptions.push(vscode.commands.registerCommand("wtc.getCommitMessage",
		async (repository: Repository) => {
			http.get("http://www.whatthecommit.com/index.json", (resp) => {
				let data = '';
				resp.on('data', (chunk) => {
					data += chunk;
				});
				resp.on('end', () => {
					let myData = JSON.parse(data);
					repository.inputBox.value = myData.commit_message;
					// vscode.window.showInformationMessage(myData.commit_message);
				});
			}).on("error", (err) => {
				vscode.window.showErrorMessage("Unable to connect to whatthecommit.com: " + err.message, { modal: true });
			});

		}));
}
