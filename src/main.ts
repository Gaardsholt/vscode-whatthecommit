import * as vscode from 'vscode';
import * as http from 'http';

export async function activate(context: vscode.ExtensionContext) {
	console.log('Successfully activated "WhatTheCommit"');
	
	context.subscriptions.push(vscode.commands.registerCommand("extension.wtc.getCommitMessage",
		async () => {
			const gitExtension = vscode.extensions.getExtension('vscode.git').exports;
			const repo = gitExtension.getAPI(1).repositories[0];

			http.get("http://www.whatthecommit.com/index.json", (resp) => {
				let data = '';
				resp.on('data', (chunk) => {
					data += chunk;
				});
				resp.on('end', () => {
					let myData = JSON.parse(data);
					repo.inputBox.value = myData.commit_message;
					// vscode.window.showInformationMessage(myData.commit_message);
				});
			}).on("error", (err) => {
				vscode.window.showErrorMessage("Unable to connect to whatthecommit.com: " + err.message, {modal: true});
			});
			
		}));
}
